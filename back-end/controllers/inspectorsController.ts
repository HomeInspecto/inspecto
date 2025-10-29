import { Request, Response } from 'express';
import DatabaseService from '../database';

export const getAllInspectors = async (req: Request, res: Response) => {
  try {
    const { organization_id, active } = req.query;
    const filters: Record<string, any> = {};
    
    if (organization_id) filters.organization_id = organization_id as string;
    if (active !== undefined) filters.active = active === 'true';
    
    const { data, error } = await DatabaseService.fetchData('inspectors', '*', Object.keys(filters).length ? filters : undefined);
    
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

