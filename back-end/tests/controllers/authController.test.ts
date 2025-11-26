import httpMocks from 'node-mocks-http';
import { signup, login, logout, refreshToken } from '../../controllers/authController';
import { supabase } from '../../supabase';
import DatabaseService from '../../database';
import { createClient } from '@supabase/supabase-js';

// ---- Mocks ----

// Mock supabase client (the one imported in authController)
jest.mock('../../supabase', () => {
  const auth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    refreshSession: jest.fn(),
  };

  return {
    supabase: { auth },
    supabaseAdmin: {
      auth: { admin: { updateUserById: jest.fn() } },
    },
  };
});

// Mock DatabaseService.insertDataAdmin so inspector creation doesn't hit real DB
jest.mock('../../database', () => ({
  __esModule: true,
  default: {
    insertDataAdmin: jest.fn(),
  },
}));

// Mock @supabase/supabase-js createClient for logout()
const mockSignOut = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}));

// Small helper to get typed mocks
const getSupabaseAuthMock = () => (supabase as any).auth as {
  signUp: jest.Mock;
  signInWithPassword: jest.Mock;
  refreshSession: jest.Mock;
};

const getInsertDataAdminMock = () =>
  (DatabaseService as any).insertDataAdmin as jest.Mock;

describe('authController.signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if email or password missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: '', password: '' },
    });
    const res = httpMocks.createResponse();

    await signup(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('Email and password are required');
  });

  it('returns 400 if password is too short', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: '123' },
    });
    const res = httpMocks.createResponse();

    await signup(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('Password must be at least 6 characters long');
  });

  it('returns 400 for invalid email format', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'not-an-email', password: '123456' },
    });
    const res = httpMocks.createResponse();

    await signup(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('Invalid email format');
  });

  it('returns 201 and user/session on successful signup with session', async () => {
    const auth = getSupabaseAuthMock();
    const insertDataAdmin = getInsertDataAdminMock();

    auth.signUp.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          created_at: '2025-01-01T00:00:00Z',
        },
        session: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
        },
      },
      error: null,
    });

    // inspector creation succeeds
    insertDataAdmin.mockResolvedValueOnce({ data: null, error: null });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: '123456' },
    });
    const res = httpMocks.createResponse();

    await signup(req as any, res as any);

    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '123456',
      options: {
        data: {
          full_name: null,
          phone: null,
        },
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();

    expect(body.message).toBe('User created successfully');
    expect(body.user).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      created_at: '2025-01-01T00:00:00Z',
    });
    expect(body.access_token).toBe('access-token-123');
    expect(body.refresh_token).toBe('refresh-token-123');
  });

  it('returns 422 when Supabase signUp returns "already registered" error', async () => {
    const auth = getSupabaseAuthMock();

    auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: '123456' },
    });
    const res = httpMocks.createResponse();

    await signup(req as any, res as any);

    expect(res.statusCode).toBe(422);
    const body = res._getJSONData();
    expect(body.error).toBe('User with this email already exists');
  });
});

describe('authController.login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if email or password missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: '', password: '' },
    });
    const res = httpMocks.createResponse();

    await login(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('Email and password are required');
  });

  it('returns 401 for invalid credentials', async () => {
    const auth = getSupabaseAuthMock();

    auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: 'wrong' },
    });
    const res = httpMocks.createResponse();

    await login(req as any, res as any);

    expect(res.statusCode).toBe(401);
    const body = res._getJSONData();
    expect(body.error).toBe('Invalid email or password');
  });

  it('returns 200 and tokens on successful login', async () => {
    const auth = getSupabaseAuthMock();

    auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          created_at: '2025-01-01T00:00:00Z',
        },
        session: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123',
        },
      },
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: '123456' },
    });
    const res = httpMocks.createResponse();

    await login(req as any, res as any);

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '123456',
    });

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.user.id).toBe('user-1');
    expect(body.access_token).toBe('access-token-123');
    expect(body.refresh_token).toBe('refresh-token-123');
  });
});

describe('authController.logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: {},
    });
    const res = httpMocks.createResponse();

    await logout(req as any, res as any);

    expect(res.statusCode).toBe(401);
    const body = res._getJSONData();
    expect(body.error).toBe('Authorization token required');
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('calls Supabase signOut and returns 200 on success', async () => {
    mockSignOut.mockResolvedValueOnce({ error: null });

    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { authorization: 'Bearer test-token-123' },
    });
    const res = httpMocks.createResponse();

    await logout(req as any, res as any);

    // ensure createClient was called with Authorization header
    expect(createClient).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.message).toBe('Logout successful');
  });

  it('returns 401 if signOut returns an error', async () => {
    mockSignOut.mockResolvedValueOnce({ error: { message: 'Logout failed' } });

    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { authorization: 'Bearer bad-token' },
    });
    const res = httpMocks.createResponse();

    await logout(req as any, res as any);

    expect(res.statusCode).toBe(401);
    const body = res._getJSONData();
    expect(body.error).toBe('Logout failed');
  });
});

describe('authController.refreshToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if refresh_token is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {},
    });
    const res = httpMocks.createResponse();

    await refreshToken(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('Refresh token is required');
  });

  it('returns 401 if Supabase returns error', async () => {
    const auth = getSupabaseAuthMock();

    auth.refreshSession.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid refresh token' },
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { refresh_token: 'bad-token' },
    });
    const res = httpMocks.createResponse();

    await refreshToken(req as any, res as any);

    expect(res.statusCode).toBe(401);
    const body = res._getJSONData();
    expect(body.error).toBe('Invalid refresh token');
  });

  it('returns 200 and new tokens on success', async () => {
    const auth = getSupabaseAuthMock();

    auth.refreshSession.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          created_at: '2025-01-01T00:00:00Z',
        },
        session: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        },
      },
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { refresh_token: 'good-token' },
    });
    const res = httpMocks.createResponse();

    await refreshToken(req as any, res as any);

    expect(auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'good-token',
    });

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.user.id).toBe('user-1');
    expect(body.access_token).toBe('new-access-token');
    expect(body.refresh_token).toBe('new-refresh-token');
  });
});
