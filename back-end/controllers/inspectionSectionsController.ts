import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/sections/all:
 *   get:
 *     summary: Get all inspection sections
 *     description: Retrieves all inspection sections, optionally filtered
 *     tags:
 *       - Inspection Sections
 *     responses:
 *       '200':
 *         description: List of inspection sections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sections:
 *                   type: array
 *                   items:
 *                     type: object
 *       '500':
 *         description: Database query failed
 */
export const getAllInspectionSections = async (req: Request, res: Response) => {
  try {
    const { data, error } = await DatabaseService.fetchDataAdmin('inspection_sections', '*');

    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }

    return res.json({ sections: data || [] });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

/**
 * @swagger
 * /api/sections/section/{section_id}:
 *   get:
 *     summary: Get inspection section details
 *     description: Retrieves a single inspection section by its ID
 *     tags:
 *       - Inspection Sections
 *     parameters:
 *       - in: path
 *         name: section_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the inspection section
 *     responses:
 *       '200':
 *         description: Inspection section details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 section:
 *                   type: object
 *       '404':
 *         description: Inspection section not found
 *       '500':
 *         description: Database query failed
 */
export const getInspectionSectionById = async (req: Request, res: Response) => {
  try {
    const { section_id } = req.params;

    if (!section_id) {
      return res.status(400).json({ error: 'section_id is required' });
    }

    const { data, error } = await DatabaseService.fetchDataAdmin(
      'inspection_sections',
      '*',
      { id: section_id }
    );

    if (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const section = Array.isArray(data) ? data[0] : data;

    if (!section) {
      return res.status(404).json({ error: 'Inspection section not found' });
    }

    return res.json({ section });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

/**
 * @swagger
 * /api/sections/create:
 *   post:
 *     summary: Create a new inspection section
 *     description: Creates a new inspection section
 *     tags:
 *       - Inspection Sections
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - section_name
 *             properties:
 *               section_name:
 *                 type: string
 *               notes:
 *                 type: string
 *               priority_rating:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       '201':
 *         description: Inspection section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 section:
 *                   type: object
 *       '400':
 *         description: Missing required fields
 *       '500':
 *         description: Database insert failed
 */
export const createInspectionSection = async (req: Request, res: Response) => {
  try {
    const { section_name, notes, priority_rating } = req.body;

    if (!section_name) {
      return res.status(400).json({ error: 'section_name is required' });
    }

    const { data, error } = await DatabaseService.insertDataAdmin('inspection_sections', {
      section_name,
      notes: notes || null,
      priority_rating: priority_rating || null,
    });

    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }

    return res.status(201).json({ section: data });
  } catch (err) {
    console.error('Database insert error:', err);
    return res.status(500).json({
      error: 'Database insert failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

