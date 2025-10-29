import { Request, Response } from 'express';
import DatabaseService from '../database';

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { organization_id } = req.query;
    const filters = organization_id ? { organization_id: organization_id as string } : undefined;
    
    const { data, error } = await DatabaseService.fetchData('properties', '*', filters);
    
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


export const createProperty = async (req: Request, res: Response) => {
  try {
    const { organization_id, address_line1, address_line2, unit, city, region, postal_code, country, year_built, dwelling_type, sqft, bedrooms, bathrooms, garage, notes } = req.body;
    const { data, error } = await DatabaseService.insertData('properties', { organization_id, address_line1, address_line2, unit, city, region, postal_code, country, year_built, dwelling_type, sqft, bedrooms, bathrooms, garage, notes });
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

