import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     description: Retrieves a list of properties, optionally filtered by organization_id
 *     tags:
 *       - Properties
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: string
 *         description: Filter properties by organization ID
 *     responses:
 *       '200':
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     type: object
 *       '500':
 *         description: Database query failed
 */
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { organization_id } = req.query;
    const filters = organization_id ? { organization_id: organization_id as string } : undefined;
    
    const { data, error } = await DatabaseService.fetchDataAdmin('properties', '*', filters);
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ properties: data });
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
 * /api/properties/createProperty:
 *   post:
 *     summary: Create a new property
 *     description: Creates a new property record
 *     tags:
 *       - Properties
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization_id
 *               - address_line1
 *             properties:
 *               organization_id:
 *                 type: string
 *               address_line1:
 *                 type: string
 *               address_line2:
 *                 type: string
 *               unit:
 *                 type: string
 *               city:
 *                 type: string
 *               region:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               country:
 *                 type: string
 *               year_built:
 *                 type: integer
 *               dwelling_type:
 *                 type: string
 *               sqft:
 *                 type: integer
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: number
 *               garage:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 property:
 *                   type: object
 *       '500':
 *         description: Database query failed
 */
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { organization_id, address_line1, address_line2, unit, city, region, postal_code, country, year_built, dwelling_type, sqft, bedrooms, bathrooms, garage, notes } = req.body;
    const { data, error } = await DatabaseService.insertDataAdmin('properties', { organization_id, address_line1, address_line2, unit, city, region, postal_code, country, year_built, dwelling_type, sqft, bedrooms, bathrooms, garage, notes });
    console.log('data', data);
    console.log('error', error);
    if (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
  return res.json({ property: data });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ 
      error: 'Database query failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}; 

