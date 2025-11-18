import { Request, Response } from 'express';

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns a simple message indicating the server is running
 *     tags:
 *       - Health
 *     security: []  # Public endpoint - no authentication required
 *     responses:
 *       '200':
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export const getRoot = (req: Request, res: Response) => {
  res.json({ 
    message: 'Backend server is running yayy!',
    timestamp: new Date().toISOString()
  });
};

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the backend service
 *     tags:
 *       - Health
 *     security: []  # Public endpoint - no authentication required
 *     responses:
 *       '200':
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 service:
 *                   type: string
 *                   example: back-end
 */
export const getHealth = (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'back-end' });
};

