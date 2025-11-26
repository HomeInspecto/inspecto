import httpMocks from 'node-mocks-http';
import {
  getAllInspectors,
  createInspector,
} from '../../controllers/inspectorsController';
import DatabaseService from '../../database';

// Mock DatabaseService so tests don't hit a real DB
jest.mock('../../database', () => ({
  __esModule: true,
  default: {
    fetchDataAdmin: jest.fn(),
    insertDataAdmin: jest.fn(),
  },
}));

const getDBMock = () => DatabaseService as any;

describe('inspectorsController.getAllInspectors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches all inspectors with no filters when no query params are provided', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [{ id: 'insp-1', full_name: 'John Doe' }],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {},
    });
    const res = httpMocks.createResponse();

    await getAllInspectors(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'inspector',
      '*',
      undefined
    );

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspectors).toHaveLength(1);
    expect(body.inspectors[0].id).toBe('insp-1');
  });

  it('applies active=true filter when active query param is "true"', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [{ id: 'insp-2', active: true }],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { active: 'true' },
    });
    const res = httpMocks.createResponse();

    await getAllInspectors(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'inspector',
      '*',
      { active: true }
    );

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspectors[0].active).toBe(true);
  });

  it('applies active=false filter when active query param is "false"', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [{ id: 'insp-3', active: false }],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { active: 'false' },
    });
    const res = httpMocks.createResponse();

    await getAllInspectors(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'inspector',
      '*',
      { active: false }
    );

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspectors[0].active).toBe(false);
  });

  it('returns 500 when fetchDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('DB error'),
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {},
    });
    const res = httpMocks.createResponse();

    await getAllInspectors(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('DB error');
  });

  it('returns 500 when an exception is thrown', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockImplementationOnce(() => {
      throw new Error('Unexpected crash');
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {},
    });
    const res = httpMocks.createResponse();

    await getAllInspectors(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database query failed');
  });
});

describe('inspectorsController.createInspector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an inspector and returns it when insertDataAdmin succeeds', async () => {
    const db = getDBMock();
    const fakeInspector = {
      id: 'insp-100',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '123-456-7890',
      license_number: 'LIC-123',
      certifications: 'Certified HI',
      signature_image_url: 'https://example.com/sig.png',
      timezone: 'America/Vancouver',
      bio: 'Experienced inspector',
      active: true,
    };

    db.insertDataAdmin.mockResolvedValueOnce({
      data: fakeInspector,
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '123-456-7890',
        license_number: 'LIC-123',
        certifications: 'Certified HI',
        signature_image_url: 'https://example.com/sig.png',
        timezone: 'America/Vancouver',
        bio: 'Experienced inspector',
        active: true,
      },
    });
    const res = httpMocks.createResponse();

    await createInspector(req as any, res as any);

    expect(db.insertDataAdmin).toHaveBeenCalledWith('inspector', {
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '123-456-7890',
      license_number: 'LIC-123',
      certifications: 'Certified HI',
      signature_image_url: 'https://example.com/sig.png',
      timezone: 'America/Vancouver',
      bio: 'Experienced inspector',
      active: true,
    });

    // No explicit status set → defaults to 200
    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspector.id).toBe('insp-100');
    expect(body.inspector.full_name).toBe('Jane Smith');
  });

  it('returns 500 when insertDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.insertDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('Insert failed'),
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
      },
    });
    const res = httpMocks.createResponse();

    await createInspector(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Insert failed');
  });

  it('returns 500 when an exception is thrown', async () => {
    const db = getDBMock();
    db.insertDataAdmin.mockImplementationOnce(() => {
      throw new Error('Unexpected crash');
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
      },
    });
    const res = httpMocks.createResponse();

    await createInspector(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database query failed');
  });
});
