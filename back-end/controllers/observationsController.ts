import { Request, Response } from 'express';
import DatabaseService from '../database';

export const getAllObservations = async (req: Request, res: Response) => {
  try {
    const { section_id, severity, status } = req.query;
    const filters: Record<string, any> = {};
    
    if (section_id) filters.section_id = section_id as string;
    if (severity) filters.severity = severity as string;
    if (status) filters.status = status as string;
    
    const { data, error } = await DatabaseService.fetchData('observations', '*', Object.keys(filters).length ? filters : undefined);
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ observations: data });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ 
      error: 'Database query failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

export const createObservation = async (req: Request, res: Response) => {
  try {
    const { section_id, severity, status } = req.body;
    const { data, error } = await DatabaseService.insertData('observations', { section_id, severity, status });
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.status(201).json({ observation: data });
  } catch (err) {
    console.error('Database insert error:', err);
    return res.status(500).json({ 
      error: 'Database insert failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

