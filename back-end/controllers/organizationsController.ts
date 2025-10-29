import { Request, Response } from 'express';
import DatabaseService from '../database';

export const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    const { data, error } = await DatabaseService.fetchData('organizations');
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ organizations: data });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ 
      error: 'Database query failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

