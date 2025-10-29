import { Request, Response } from 'express';

export const getRoot = (req: Request, res: Response) => {
  res.json({ 
    message: 'Backend server is running yayy!',
    timestamp: new Date().toISOString()
  });
};

export const getHealth = (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'back-end' });
};

