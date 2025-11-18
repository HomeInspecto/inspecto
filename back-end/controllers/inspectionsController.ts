import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/inspections/all:
 *   get:
 *     summary: Get inspections
 *     description: Retrieves inspections, optionally filtered by inspector_id, property_id, or status
 *     tags:
 *       - Inspections
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: inspector_id
 *         schema:
 *           type: string
 *         description: Filter inspections by inspector ID
 *       - in: query
 *         name: property_id
 *         schema:
 *           type: string
 *         description: Filter inspections by property ID (optionally combined with inspector_id)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter inspections by status
 *     responses:
 *       '200':
 *         description: List of inspections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inspections:
 *                   type: array
 *                   items:
 *                     type: object
 *       '500':
 *         description: Database query failed
 */
export const getAllInspections = async (req: Request, res: Response) => {
  try {
    const { inspector_id, property_id, status } = req.query;
    console.log("in all inspections inspector_id", inspector_id);
    const filters: Record<string, any> = {};
    
    if (inspector_id) filters.inspector_id = inspector_id as string;
    if (property_id) filters.property_id = property_id as string;
    if (status) filters.status = status as string;
    
    const { data, error } = await DatabaseService.fetchDataAdmin(
      'inspections',
      '*',
      Object.keys(filters).length ? filters : undefined
    );
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ inspections: data });
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
 * /api/inspections/createInspection:
 *   post:
 *     summary: Create a new inspection
 *     description: Creates a new inspection record
 *     tags:
 *       - Inspections
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inspector_id
 *               - property_id
 *             properties:
 *               inspector_id:
 *                 type: string
 *               property_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 default: draft
 *               scheduled_for:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       '201':
 *         description: Inspection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inspection:
 *                   type: object
 *       '400':
 *         description: Missing required fields
 *       '500':
 *         description: Database insert failed
 */
export const createInspection = async (req: Request, res: Response) => {
  try {
    const { inspector_id, property_id, status = 'draft', scheduled_for } = req.body;
    console.log("in create inspection inspector_id", inspector_id);
    if (!inspector_id || !property_id) {
      return res.status(400).json({ error: 'Missing required fields: inspector_id, property_id' });
    }
    
    const inspectionData = {
      inspector_id,
      property_id,
      status,
      scheduled_for: scheduled_for || null
    };
    
    const { data, error } = await DatabaseService.insertDataAdmin('inspections', inspectionData);
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.status(201).json({ inspection: data });
  } catch (err) {
    console.error('Database insert error:', err);
    return res.status(500).json({ 
      error: 'Database insert failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/inspections/inspection/{inspection_id}:
 *   get:
 *     summary: Get a single inspection
 *     description: Retrieves a single inspection by its ID
 *     tags:
 *       - Inspections
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inspection_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the inspection
 *     responses:
 *       '200':
 *         description: Inspection details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inspection:
 *                   type: object
 *       '404':
 *         description: Inspection not found
 *       '500':
 *         description: Database query failed
 */
export const getInspectionById = async (req: Request, res: Response) => {
  try {
    const { inspection_id } = req.params;
    console.log("in get inspection by id inspection_id", inspection_id);
    if (!inspection_id) {
      return res.status(400).json({ error: 'inspection_id is required' });
    }

    const { data, error } = await DatabaseService.fetchDataAdmin(
      'inspections',
      '*',
      { id: inspection_id }
    );

    if (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const inspection = Array.isArray(data) ? data[0] : data;

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    return res.json({ inspection });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};
