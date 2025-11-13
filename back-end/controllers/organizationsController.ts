import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get all organizations
 *     description: Retrieves a list of all organizations
 *     tags:
 *       - Organizations
 *     responses:
 *       '200':
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organizations:
 *                   type: array
 *                   items:
 *                     type: object
 *       '500':
 *         description: Database query failed
 */
export const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    // Use admin client to bypass RLS policies
    const { data, error } = await DatabaseService.fetchDataAdmin('organizations');
    
    if (error) {
      console.error('Error fetching organizations:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ organizations: data || [] });
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
 * /api/organizations:
 *   post:
 *     summary: Create a new organization
 *     description: Creates a new organization record with name and phone
 *     tags:
 *       - Organizations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Organization name
 *               phone:
 *                 type: string
 *                 description: Organization phone number (optional)
 *     responses:
 *       '200':
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization:
 *                   type: object
 *       '400':
 *         description: Missing required field (name)
 *       '500':
 *         description: Database query failed
 */
export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Use admin client to bypass RLS policies
    const { data, error } = await DatabaseService.insertDataAdmin('organizations', { 
      name, 
      phone: phone || null 
    });
    
    if (error) {
      console.error('Error creating organization:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ organization: data });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ 
      error: 'Database query failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

