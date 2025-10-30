import { Request, Response } from 'express';
import DatabaseService from '../database';

export const testSupabaseConnection = async (req: Request, res: Response) => {
  try {
    const result = await DatabaseService.testConnection();
    
    if (!result.success) {
      console.error('Supabase connection error:', result.error);
      return res.status(500).json({ 
        error: 'Supabase connection failed', 
        details: result.error instanceof Error ? result.error.message : 'Unknown error'
      });
    }
    
    return res.json({ 
      message: 'Supabase connection successful',
      supabaseConnected: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Supabase test error:', err);
    return res.status(500).json({ 
      error: 'Supabase test failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

