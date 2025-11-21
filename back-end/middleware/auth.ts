/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const sanitize = (v?: string) =>
  (v ?? '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();

const supabaseUrl = sanitize(process.env.SUPABASE_URL);
const anonKey = sanitize(process.env.SUPABASE_ANON_KEY);

/**
 * Authentication middleware to verify Bearer tokens
 * Validates the JWT token from the Authorization header using Supabase
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ 
        error: 'Authorization header is required',
        message: 'Please provide a Bearer token in the Authorization header'
      });
      return;
    }

    // Extract token (remove 'Bearer ' prefix if present)
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      res.status(401).json({ 
        error: 'Token is required',
        message: 'Please provide a valid Bearer token'
      });
      return;
    }

    // Create a Supabase client with the user's token
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the token by getting the user
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      console.error('Token validation error:', error?.message || 'Invalid token');
      res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'The provided token is invalid or has expired. Please login again.'
      });
      return;
    }

    // Attach user info to request object for use in route handlers
    req.user = user;
    req.token = token;

    // Continue to the next middleware/route handler
    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    res.status(500).json({ 
      error: 'Authentication error',
      message: 'An error occurred while validating your token'
    });
  }
};

