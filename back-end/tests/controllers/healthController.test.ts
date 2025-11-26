import httpMocks from 'node-mocks-http';
import { getRoot, getHealth } from '../../controllers/healthController';

describe('healthController.getRoot', () => {
  it('returns server running message and timestamp', () => {
    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    getRoot(req as any, res as any);

    expect(res.statusCode).toBe(200);

    const body = res._getJSONData();
    expect(body.message).toBe('Backend server is running yayy!');
    expect(typeof body.timestamp).toBe('string');

    // timestamp should be a valid date
    const date = new Date(body.timestamp);
    expect(isNaN(date.getTime())).toBe(false);
  });
});

describe('healthController.getHealth', () => {
  it('returns healthy status and service name', () => {
    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    getHealth(req as any, res as any);

    expect(res.statusCode).toBe(200);

    const body = res._getJSONData();

    expect(body.status).toBe('healthy');
    expect(body.service).toBe('back-end');
  });
});
