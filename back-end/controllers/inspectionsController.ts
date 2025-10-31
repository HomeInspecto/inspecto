import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/inspections:
 *   get:
 *     summary: Get all inspections
 *     description: Retrieves a list of inspections, optionally filtered by organization_id, inspector_id, or status
 *     tags:
 *       - Inspections
 *     parameters:
 *       - in: query
 *         name: organization_id
 *         schema:
 *           type: string
 *         description: Filter inspections by organization ID
 *       - in: query
 *         name: inspector_id
 *         schema:
 *           type: string
 *         description: Filter inspections by inspector ID
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
    const { organization_id, inspector_id, status } = req.query;
    const filters: Record<string, any> = {};
    
    if (organization_id) filters.organization_id = organization_id as string;
    if (inspector_id) filters.inspector_id = inspector_id as string;
    if (status) filters.status = status as string;
    
    const { data, error } = await DatabaseService.fetchData('inspections', '*', Object.keys(filters).length ? filters : undefined);
    
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inspector_id
 *               - property_id
 *               - organization_id
 *             properties:
 *               inspector_id:
 *                 type: string
 *               property_id:
 *                 type: string
 *               organization_id:
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
    const { inspector_id, property_id, organization_id, status = 'draft', scheduled_for } = req.body;
    
    if (!inspector_id || !property_id || !organization_id) {
      return res.status(400).json({ error: 'Missing required fields: inspector_id, property_id, organization_id' });
    }
    
    const inspectionData = {
      inspector_id,
      property_id,
      organization_id,
      status,
      scheduled_for: scheduled_for || null
    };
    
    const { data, error } = await DatabaseService.insertData('inspections', inspectionData);
    
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
 * /api/inspections/createInspectionSection:
 *   post:
 *     summary: Create a new inspection section
 *     description: Creates a new section within an inspection
 *     tags:
 *       - Inspections
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inspection_id
 *               - section_name
 *             properties:
 *               inspection_id:
 *                 type: string
 *               section_name:
 *                 type: string
 *               notes:
 *                 type: string
 *               priority_rating:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Inspection section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inspection_section:
 *                   type: object
 *       '500':
 *         description: Database insert failed
 */
export const createInspectionSection = async (req: Request, res: Response) => {
  try {
    const { inspection_id, section_name, notes, priority_rating } = req.body;
    const { data, error } = await DatabaseService.insertData('inspection_sections', { inspection_id, section_name, notes, priority_rating });
    if (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
  return res.json({ inspection_section: data });
  } catch (err) {
    console.error('Database insert error:', err);
    return res.status(500).json({ 
      error: 'Database insert failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};