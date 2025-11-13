import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/inspectors:
 *   get:
 *     summary: Get all inspectors
 *     description: Retrieves a list of inspectors, optionally filtered by organization_id or active status
 *     tags:
 *       - Inspectors
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: string
 *         description: Filter inspectors by organization ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter inspectors by active status
 *     responses:
 *       '200':
 *         description: List of inspectors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inspectors:
 *                   type: array
 *                   items:
 *                     type: object
 *       '500':
 *         description: Database query failed
 */
export const getAllInspectors = async (req: Request, res: Response) => {
  try {
    const { organization_id, active } = req.query;
    const filters: Record<string, any> = {};
    
    if (organization_id) filters.organization_id = organization_id as string;
    if (active !== undefined) filters.active = active === 'true';
    
    const { data, error } = await DatabaseService.fetchDataAdmin('inspectors', '*', Object.keys(filters).length ? filters : undefined);
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ inspectors: data });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ 
      error: 'Database query failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/inspectors/createInspector:
 *   post:
 *     summary: Create a new inspector
 *     description: Creates a new inspector record
 *     tags:
 *       - Inspectors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organization_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               license_number:
 *                 type: string
 *               certifications:
 *                 type: string
 *               signature_image_url:
 *                 type: string
 *               timezone:
 *                 type: string
 *               bio:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Inspector created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inspector:
 *                   type: object
 *       '500':
 *         description: Database query failed
 */
export const createInspector = async (req: Request, res: Response) => {
  try {
    const { organization_id, user_id, full_name, email, phone, license_number, certifications, signature_image_url, timezone, bio, active } = req.body;
    const { data, error } = await DatabaseService.insertDataAdmin('inspectors', { organization_id, user_id, full_name, email, phone, license_number, certifications, signature_image_url, timezone, bio, active });
  if (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
  return res.json({ inspector: data });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ 
      error: 'Database query failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};  


