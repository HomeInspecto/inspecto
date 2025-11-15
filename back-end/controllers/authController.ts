import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../supabase';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import DatabaseService from '../database';

// Load environment variables
dotenv.config();
const sanitize = (v?: string) =>
  (v ?? '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();

const supabaseUrl = sanitize(process.env.SUPABASE_URL);
const anonKey = sanitize(process.env.SUPABASE_ANON_KEY);

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Creates a new user account with email and password using Supabase authentication
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password (minimum 6 characters)
 *               full_name:
 *                 type: string
 *                 description: User full name (optional)
 *               phone:
 *                 type: string
 *                 description: User phone number (optional)
 *               organization_id:
 *                 type: string
 *                 description: Organization ID for creating inspector record (optional)
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 session:
 *                   type: object
 *       '400':
 *         description: Missing required fields or invalid input
 *       '422':
 *         description: User already exists or validation error
 *       '500':
 *         description: Server error
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, organization_id } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || null,
          phone: phone || null,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      
      // Handle specific Supabase errors
      if (error.message.includes('already registered')) {
        return res.status(422).json({ 
          error: 'User with this email already exists' 
        });
      }
      
      return res.status(422).json({ 
        error: error.message || 'Failed to create user' 
      });
    }

    if (!data.user) {
      return res.status(500).json({ 
        error: 'User creation failed - no user data returned' 
      });
    }

    // Create inspector record if organization_id is provided
    if (data.user && organization_id && supabaseAdmin) {
      try {
        const inspectorData = {
          user_id: data.user.id,
          organization_id: organization_id,
          full_name: full_name || data.user.email?.split('@')[0] || 'Inspector',
          email: data.user.email || null,
          phone: phone || null,
          certifications: [],
          active: true,
        };

        const { data: inspectorResult, error: inspectorError } = await DatabaseService.insertDataAdmin('inspectors', inspectorData);

        if (inspectorError) {
          console.error('Inspector creation error:', inspectorError);
          // Don't fail the request if inspector creation fails - user is still created
          // Inspector can be created later via the inspectors endpoint
        } else {
          console.log(`Inspector record created for user ${data.user.id}`);
        }
      } catch (err) {
        console.error('Error creating inspector:', err);
        // Don't fail the request if inspector creation fails
      }
    }

    // Return user and session data
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      session: data.session,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user with email and password using Supabase authentication
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *               organization_id:
 *                 type: string
 *                 description: Organization ID for creating inspector record (optional)
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 session:
 *                   type: object
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Server error
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, organization_id } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Authenticate user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      
      // Handle specific Supabase errors
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({ 
          error: 'Please confirm your email before logging in' 
        });
      }
      
      return res.status(401).json({ 
        error: error.message || 'Authentication failed' 
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ 
        error: 'Login failed - invalid response' 
      });
    }

    // Check if inspector record exists for this user, create one if it doesn't exist
    if (supabaseAdmin) {
      try {
        // Check if inspector already exists
        const { data: existingInspectors, error: inspectorCheckError } = await supabaseAdmin
          .from('inspectors')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1);

        // If inspector doesn't exist and organization_id is provided, create one
        if (!inspectorCheckError && (!existingInspectors || existingInspectors.length === 0)) {
          if (organization_id) {
            const inspectorData = {
              user_id: data.user.id,
              organization_id: organization_id,
              full_name: data.user.email?.split('@')[0] || 'Inspector',
              email: data.user.email || null,
              phone: null,
              certifications: [],
              active: true,
            };

            const { data: inspectorResult, error: inspectorError } = await DatabaseService.insertDataAdmin('inspectors', inspectorData);

            if (inspectorError) {
              console.error('Inspector creation error:', inspectorError);
              // Don't fail the login if inspector creation fails
              // Inspector can be created later via the inspectors endpoint
            } else {
              console.log(`Inspector record created for user ${data.user.id}`);
            }
          }
        }
      } catch (err) {
        console.error('Error checking/creating inspector:', err);
        // Don't fail the login if inspector check/creation fails
      }
    }

    // Return user, session, and tokens
    return res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      session: data.session,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Signs out the current user session
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logout successful
 *       '401':
 *         description: Unauthorized - invalid or missing token
 *       '500':
 *         description: Server error
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Authorization token required' 
      });
    }

    // Create a Supabase client with the user's access token for this request
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Sign out the user
    const { error } = await userClient.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return res.status(401).json({ 
        error: error.message || 'Logout failed' 
      });
    }

    return res.json({
      message: 'Logout successful',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

