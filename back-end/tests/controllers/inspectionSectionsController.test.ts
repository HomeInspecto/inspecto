import httpMocks from 'node-mocks-http';
import {
  getAllInspectionSections,
  getInspectionSectionById,
  createInspectionSection,
} from '../../controllers/inspectionSectionsController';
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

describe('inspectionSectionsController.getAllInspectionSections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns sections when fetchDataAdmin succeeds', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [{ id: 'sec-1', section_name: 'Roof' }],
      error: null,
    });

    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await getAllInspectionSections(req as any, res as any);

    expect(db.fetchDataAdmin).toHaveBeenCalledWith(
      'inspection_sections',
      '*'
    );

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.sections).toHaveLength(1);
    expect(body.sections[0].id).toBe('sec-1');
  });

  it('returns empty array if data is null/undefined', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await getAllInspectionSections(req as any, res as any);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(Array.isArray(body.sections)).toBe(true);
    expect(body.sections.length).toBe(0);
  });

  it('returns 500 when fetchDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('DB error'),
    });

    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await getAllInspectionSections(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('DB error');
  });

  it('returns 500 when an exception is thrown', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockImplementationOnce(() => {
      throw new Error('Unexpected crash');
    });

    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await getAllInspectionSections(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database query failed');
  });
});

describe('inspectionSectionsController.getInspectionSectionById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if section_id is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: {},
    });
    const res = httpMocks.createResponse();

    await getInspectionSectionById(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('section_id is required');
  });

  it('returns 500 when fetchDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('DB error'),
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { section_id: 'sec-1' },
    });
    const res = httpMocks.createResponse();

    await getInspectionSectionById(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('DB error');
  });

  it('returns 404 when no section is found', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { section_id: 'sec-2' },
    });
    const res = httpMocks.createResponse();

    await getInspectionSectionById(req as any, res as any);

    expect(res.statusCode).toBe(404);
    const body = res._getJSONData();
    expect(body.error).toBe('Inspection section not found');
  });

  it('returns section when data is an array', async () => {
    const db = getDBMock();
    const section = { id: 'sec-3', section_name: 'Gutters' };

    db.fetchDataAdmin.mockResolvedValueOnce({
      data: [section],
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { section_id: 'sec-3' },
    });
    const res = httpMocks.createResponse();

    await getInspectionSectionById(req as any, res as any);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.section.id).toBe('sec-3');
  });

  it('returns section when data is a single object', async () => {
    const db = getDBMock();
    const section = { id: 'sec-4', section_name: 'Interior' };

    db.fetchDataAdmin.mockResolvedValueOnce({
      data: section,
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { section_id: 'sec-4' },
    });
    const res = httpMocks.createResponse();

    await getInspectionSectionById(req as any, res as any);

    expect(res.statusCode).toBe(200);
    const body = res._getJSONData();
    expect(body.section.id).toBe('sec-4');
  });

  it('returns 500 when an exception is thrown', async () => {
    const db = getDBMock();
    db.fetchDataAdmin.mockImplementationOnce(() => {
      throw new Error('Unexpected crash');
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      params: { section_id: 'sec-5' },
    });
    const res = httpMocks.createResponse();

    await getInspectionSectionById(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database query failed');
  });
});

describe('inspectionSectionsController.createInspectionSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when section_name is missing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { notes: 'note', priority_rating: 3 },
    });
    const res = httpMocks.createResponse();

    await createInspectionSection(req as any, res as any);

    expect(res.statusCode).toBe(400);
    const body = res._getJSONData();
    expect(body.error).toBe('section_name is required');
  });

  it('creates a section with null notes and priority_rating when not provided', async () => {
    const db = getDBMock();
    const fakeSection = { id: 'sec-10', section_name: 'Roof', notes: null, priority_rating: null };

    db.insertDataAdmin.mockResolvedValueOnce({
      data: fakeSection,
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { section_name: 'Roof' },
    });
    const res = httpMocks.createResponse();

    await createInspectionSection(req as any, res as any);

    expect(db.insertDataAdmin).toHaveBeenCalledWith('inspection_sections', {
      section_name: 'Roof',
      notes: null,
      priority_rating: null,
    });

    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.section.id).toBe('sec-10');
  });

  it('creates a section with provided notes and priority_rating', async () => {
    const db = getDBMock();
    const fakeSection = {
      id: 'sec-11',
      section_name: 'Gutters',
      notes: 'Check downspouts',
      priority_rating: 4,
    };

    db.insertDataAdmin.mockResolvedValueOnce({
      data: fakeSection,
      error: null,
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        section_name: 'Gutters',
        notes: 'Check downspouts',
        priority_rating: 4,
      },
    });
    const res = httpMocks.createResponse();

    await createInspectionSection(req as any, res as any);

    expect(db.insertDataAdmin).toHaveBeenCalledWith('inspection_sections', {
      section_name: 'Gutters',
      notes: 'Check downspouts',
      priority_rating: 4,
    });

    expect(res.statusCode).toBe(201);
    const body = res._getJSONData();
    expect(body.section.id).toBe('sec-11');
    expect(body.section.priority_rating).toBe(4);
  });

  it('returns 500 when insertDataAdmin returns an error', async () => {
    const db = getDBMock();
    db.insertDataAdmin.mockResolvedValueOnce({
      data: null,
      error: new Error('Insert failed'),
    });

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { section_name: 'Roof' },
    });
    const res = httpMocks.createResponse();

    await createInspectionSection(req as any, res as any);

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
      body: { section_name: 'Roof' },
    });
    const res = httpMocks.createResponse();

    await createInspectionSection(req as any, res as any);

    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body.error).toBe('Database insert failed');
  });
});
