import { Request, Response } from 'express';
import DatabaseService from '../database';

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

