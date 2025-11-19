import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     description: Retrieves a list of properties
 *     tags:
 *       - Properties
 *     security:
 *       - BearerAuth: []
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
    const { data, error } = await DatabaseService.fetchDataAdmin('properties');
    
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
 * /api/properties/property/{property_id}:
 *   get:
 *     summary: Get a property by ID
 *     description: Retrieves a property by its ID
 *     tags:
 *       - Properties
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: property_id
 *         in: path
 *         required: true
 *         description: The ID of the property to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Property retrieved successfully
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
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { property_id } = req.params;
    const { data, error } = await DatabaseService.fetchDataAdmin('properties', '*', { id: property_id });
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

/**
 * @swagger
 * /api/properties/createProperty:
 *   post:
 *     summary: Create a new property
 *     description: Creates a new property record
 *     tags:
 *       - Properties
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_line1
 *             properties:
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
    const { address_line1, address_line2, unit, city, region, postal_code, country, year_built, dwelling_type, sqft, bedrooms, bathrooms, garage, notes } = req.body;
    const { data, error } = await DatabaseService.insertDataAdmin('properties', { address_line1, address_line2, unit, city, region, postal_code, country, year_built, dwelling_type, sqft, bedrooms, bathrooms, garage, notes });
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

