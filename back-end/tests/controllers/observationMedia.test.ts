import httpMocks from 'node-mocks-http';
import {
  getAllObservationMedia,
  createObservationMedia,
} from '../../controllers/observationMedia';
import DatabaseService from '../../database';
import { supabase, supabaseAdmin } from '../../supabase';

// Mock crypto (random filename generation)
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('1234567890abcdef1234567890abcdef')),
}));

// Mock DatabaseService
jest.mock('../../database', () => ({
  __esModule: true,
  default: {
    fetchDataAdmin: jest.fn(),
    insertDataAdmin: jest.fn(),
  },
}));

// Mock Supabase storage client
const mockStorage = {
  upload: jest.fn(),
  getPublicUrl: jest.fn(),
};

jest.mock('../../supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => mockStorage),
    },
  },
  supabaseAdmin: {
    storage: {
      from: jest.fn(() => mockStorage),
    },
  },
}));

const getDB = () => DatabaseService as any;

beforeEach(() => {
  jest.clearAllMocks();
});

//
// ------------------- GET ALL MEDIA TESTS -------------------
//

describe('observationMedia.getAllObservationMedia', () => {
  it('returns media list when successful', async () => {
    const db = getDB();
    db.fetchDataAdmin.mockResolvedValue({
      data: [{ id: 'm1', type: 'photo' }],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { observation_id: 'obs-1' },
    });
    const res = httpMocks.createResponse();

    await getAllObservationMedia(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'observation_media',
      '*',
      { observation_id: 'obs-1' },
    );

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().media.length).toBe(1);
  });

  it('returns 500 if database error', async () => {
    const db = getDB();
    db.fetchDataAdmin.mockResolvedValue({
      data: null,
      error: new Error('DB failed'),
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { observation_id: 'obs-1' },
    });
    const res = httpMocks.createResponse();

    await getAllObservationMedia(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toBe('Failed to fetch observation media');
  });

  it('returns 500 on unexpected exception', async () => {
    const db = getDB();
    db.fetchDataAdmin.mockImplementation(() => {
      throw new Error('Crash');
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { observation_id: 'obs-1' },
    });
    const res = httpMocks.createResponse();

    await getAllObservationMedia(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toBe('Internal server error');
  });
});


//
// ------------------- CREATE MEDIA TESTS -------------------
//

describe('observationMedia.createObservationMedia', () => {
  const mockFile = {
    originalname: 'test.jpg',
    buffer: Buffer.from('fake file'),
    mimetype: 'image/jpeg',
  };

  it('returns 400 if observation_id missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      params: {},
      file: mockFile,
    });
    const res = httpMocks.createResponse();

    await createObservationMedia(req as any, res as any);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toBe('Missing required field: observation_id');
  });

  it('returns 400 if no file uploaded', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      params: { observation_id: 'obs-1' },
      body: {},
    });
    const res = httpMocks.createResponse();

    await createObservationMedia(req as any, res as any);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toBe('No file uploaded. Field name should be "file".');
  });

  it('uploads file to Supabase Storage and creates observation_media record', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      params: { observation_id: 'obs-1' },
      file: mockFile,
      body: { caption: 'Nice photo' },
    });

    const res = httpMocks.createResponse();

    // Mock successful upload
    mockStorage.upload.mockResolvedValue({ error: null });

    // Mock public URL response
    mockStorage.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.test/obs-1/file.jpg' },
    });

    // Mock DB insert success
    const db = getDB();
    db.insertDataAdmin.mockResolvedValue({
      data: { id: 'media-1' },
      error: null,
    });

    await createObservationMedia(req as any, res as any);

    expect(mockStorage.upload).toHaveBeenCalled();

    expect(db.insertDataAdmin).toHaveBeenCalledWith('observation_media', {
      observation_id: 'obs-1',
      type: 'photo',
      storage_key: 'https://storage.test/obs-1/file.jpg',
      caption: 'Nice photo',
    });

    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.storage_key).toContain('https://storage');
    expect(body.observation_media.id).toBe('media-1');
  });

  it('returns 502 when Supabase upload fails', async () => {
    mockStorage.upload.mockResolvedValue({
      error: { message: 'Upload failed' },
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      params: { observation_id: 'obs-1' },
      file: mockFile,
    });
    const res = httpMocks.createResponse();

    await createObservationMedia(req as any, res as any);

    expect(res.statusCode).toBe(502);
    expect(res._getJSONData().error).toBe('Upload failed');
  });

  it('returns 500 when DB insert fails after upload', async () => {
    mockStorage.upload.mockResolvedValue({ error: null });
    mockStorage.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.test/file.jpg' },
    });

    const db = getDB();
    db.insertDataAdmin.mockResolvedValue({
      data: null,
      error: new Error('Insert failed'),
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      params: { observation_id: 'obs-1' },
      file: mockFile,
    });
    const res = httpMocks.createResponse();

    await createObservationMedia(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toBe('Failed to create observation media record');
  });

  it('returns 500 on unexpected exception', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      params: { observation_id: 'obs-1' },
      file: mockFile,
    });
    const res = httpMocks.createResponse();

    mockStorage.upload.mockImplementation(() => {
      throw new Error('Unexpected crash');
    });

    await createObservationMedia(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toBe('Internal server error');
  });
});
