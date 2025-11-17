import { Request, Response } from 'express';

/**
 * @swagger
 * /api/auth/confirmation:
 *   get:
 *     summary: Confirm authentication
 *     description: Confirms the authentication of a user
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Authentication confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Your authentication has been confirmed!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-01T00:00:00.000Z
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication confirmation failed
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 details:
 *                   type: string
 *                   example: Error message
 */
export const getConfirmation = (req: Request, res: Response) => {
  res.json({ 
    status: 'success',
    message: 'Your authentication has been confirmed!',
    timestamp: new Date().toISOString()
  });
};


