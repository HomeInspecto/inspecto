import httpMocks from 'node-mocks-http';
import { getConfirmation } from '../../controllers/confirmationController';

describe('confirmationController.getConfirmation', () => {
  it('returns success JSON with status, message, and timestamp', () => {
    const req = httpMocks.createRequest({
      method: 'GET',
    });
    const res = httpMocks.createResponse();

    getConfirmation(req as any, res as any);

    // Default status for res.json without explicit status is 200
    expect(res.statusCode).toBe(200);

    const body = res._getJSONData();

    expect(body.status).toBe('success');
    expect(body.message).toBe('Your authentication has been confirmed!');
    expect(typeof body.timestamp).toBe('string');

    // Basic sanity check that timestamp is a valid ISO date
    const date = new Date(body.timestamp);
    expect(isNaN(date.getTime())).toBe(false);
  });
});
