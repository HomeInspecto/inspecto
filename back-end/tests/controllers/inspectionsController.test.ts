import httpMocks from 'node-mocks-http';
import {
  getAllInspections,
  getInspectionsByInspectorId,
  createInspection,
  getInspectionById,
} from '../../controllers/inspectionsController';
import DatabaseService from '../../database';

// Mock DatabaseService so we don't hit a real DB
jest.mock('../../database', () => ({
  __esModule: true,
  default: {
    fetchDataAdmin: jest.fn(),
    insertDataAdmin: jest.fn(),
  },
}));

const getDBMock = () => DatabaseService as any;

describe('inspectionsController.getAllInspections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches all inspections with no filters when no query params are provided', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [{ id: 'insp-1' }, { id: 'insp-2' }],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {},
    });
    const res = httpMocks.createResponse();

    await getAllInspections(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'inspections',
      '*',
      undefined
    );

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspections).toHaveLength(2);
    expect(body.inspections[0].id).toBe('insp-1');
  });

  it('applies filters when inspector_id, property_id and status are provided', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [{ id: 'insp-3' }],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {
        inspector_id: 'inspector-1',
        property_id: 'property-1',
        status: 'draft',
      },
    });
    const res = httpMocks.createResponse();

    await getAllInspections(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'inspections',
      '*',
      {
        inspector_id: 'inspector-1',
        property_id: 'property-1',
        status: 'draft',
      }
    );

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspections).toHaveLength(1);
    expect(body.inspections[0].id).toBe('insp-3');
  });

  it('returns 500 when DatabaseService.fetchDataAdmin returns an error', async () => {
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

    await getAllInspections(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('DB error');
  });

  it('returns 500 with generic message when an exception is thrown', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockImplementationOnce(() => {
      throw new Error('Unexpected crash');
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {},
    });
    const res = httpMocks.createResponse();

    await getAllInspections(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database query failed');
  });
});

describe('inspectionsController.getInspectionsByInspectorId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if inspector_id is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: {},
    });
    const res = httpMocks.createResponse();

    await getInspectionsByInspectorId(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('inspector_id is required');
  });

  it('returns inspections for a valid inspector_id', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [{ id: 'insp-10', inspector_id: 'inspector-123' }],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { inspector_id: 'inspector-123' },
    });
    const res = httpMocks.createResponse();

    await getInspectionsByInspectorId(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'inspections',
      '*',
      { inspector_id: 'inspector-123' }
    );

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspections).toHaveLength(1);
    expect(body.inspections[0].id).toBe('insp-10');
  });

  it('returns 500 when DatabaseService.fetchDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('DB error'),
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { inspector_id: 'inspector-123' },
    });
    const res = httpMocks.createResponse();

    await getInspectionsByInspectorId(req as any, res as any);

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
      params: { inspector_id: 'inspector-123' },
    });
    const res = httpMocks.createResponse();

    await getInspectionsByInspectorId(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database query failed');
  });
});

describe('inspectionsController.createInspection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when inspector_id or property_id is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { inspector_id: '', property_id: '' },
    });
    const res = httpMocks.createResponse();

    await createInspection(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('Missing required fields: inspector_id, property_id');
  });

  it('creates inspection with default status "draft" and null scheduled_for when not provided', async () => {
    const db = getDBMock();
    const fakeInspection = {
      id: 'insp-20',
      inspector_id: 'inspector-1',
      property_id: 'property-1',
      status: 'draft',
      scheduled_for: null,
    };

    db.insertDataAdmin.mockResolvedValueOnce({
      data: [fakeInspection],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        inspector_id: 'inspector-1',
        property_id: 'property-1',
      },
    });
    const res = httpMocks.createResponse();

    await createInspection(req as any, res as any);

    expect(db.insertDataAdmin).toHaveBeenCalledWith('inspections', {
      inspector_id: 'inspector-1',
      property_id: 'property-1',
      status: 'draft',
      scheduled_for: null,
    });

    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.id).toBe('insp-20');
    expect(body.status).toBe('draft');
  });

  it('creates inspection with provided status and scheduled_for', async () => {
    const db = getDBMock();
    const fakeInspection = {
      id: 'insp-21',
      inspector_id: 'inspector-2',
      property_id: 'property-2',
      status: 'scheduled',
      scheduled_for: '2025-01-01T10:00:00.000Z',
    };

    db.insertDataAdmin.mockResolvedValueOnce({
      data: [fakeInspection],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        inspector_id: 'inspector-2',
        property_id: 'property-2',
        status: 'scheduled',
        scheduled_for: '2025-01-01T10:00:00.000Z',
      },
    });
    const res = httpMocks.createResponse();

    await createInspection(req as any, res as any);

    expect(db.insertDataAdmin).toHaveBeenCalledWith('inspections', {
      inspector_id: 'inspector-2',
      property_id: 'property-2',
      status: 'scheduled',
      scheduled_for: '2025-01-01T10:00:00.000Z',
    });

    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.id).toBe('insp-21');
    expect(body.status).toBe('scheduled');
  });

  it('returns 500 when DatabaseService.insertDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.insertDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('Insert failed'),
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        inspector_id: 'inspector-1',
        property_id: 'property-1',
      },
    });
    const res = httpMocks.createResponse();

    await createInspection(req as any, res as any);

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
        inspector_id: 'inspector-1',
        property_id: 'property-1',
      },
    });
    const res = httpMocks.createResponse();

    await createInspection(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database insert failed');
  });
});

describe('inspectionsController.getInspectionById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if inspection_id is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: {},
    });
    const res = httpMocks.createResponse();

    await getInspectionById(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('inspection_id is required');
  });

  it('returns 500 when DatabaseService.fetchDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('DB error'),
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { inspection_id: 'insp-50' },
    });
    const res = httpMocks.createResponse();

    await getInspectionById(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('DB error');
  });

  it('returns 404 when no inspection is found', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { inspection_id: 'insp-51' },
    });
    const res = httpMocks.createResponse();

    await getInspectionById(req as any, res as any);

    expect(res.statusCode).toBe(404);
    const body = res._getJSONData();
    expect(body.error).toBe('Inspection not found');
  });

  it('returns inspection when data is an array', async () => {
    const db = getDBMock();
    const fakeInspection = { id: 'insp-60', status: 'draft' };

    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [fakeInspection],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { inspection_id: 'insp-60' },
    });
    const res = httpMocks.createResponse();

    await getInspectionById(req as any, res as any);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspection.id).toBe('insp-60');
  });

  it('returns inspection when data is a single object', async () => {
    const db = getDBMock();
    const fakeInspection = { id: 'insp-61', status: 'completed' };

    db.fetchDataAdmin.mockResolvedValueOnce({
      data: fakeInspection,
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { inspection_id: 'insp-61' },
    });
    const res = httpMocks.createResponse();

    await getInspectionById(req as any, res as any);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.inspection.id).toBe('insp-61');
  });

  it('returns 500 when an exception is thrown', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockImplementationOnce(() => {
      throw new Error('Unexpected crash');
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { inspection_id: 'insp-62' },
    });
    const res = httpMocks.createResponse();

    await getInspectionById(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database query failed');
  });
});
