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
 *     security: []  # Public endpoint - no authentication required
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
    const { email, password, full_name, phone } = req.body;

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

    // If no session was returned (e.g., email confirmation required), 
    // auto-confirm the email and sign in the user to get a session with tokens
    let session = data.session;
    if (!session && data.user && supabaseAdmin) {
      try {
        // Auto-confirm the email using admin client (bypasses email confirmation requirement)
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          data.user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.warn('Failed to auto-confirm email:', confirmError);
        }
        
        // Now sign in the user to get a session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!signInError && signInData?.session) {
          session = signInData.session;
        } else if (signInError) {
          console.warn('Failed to sign in after signup:', signInError.message);
        }
      } catch (err) {
        console.error('Error during auto-confirm and sign-in:', err);
      }
    } else if (!session && data.user) {
      // Fallback: try to sign in even without admin client
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!signInError && signInData?.session) {
          session = signInData.session;
        }
      } catch (err) {
        console.error('Error signing in after signup:', err);
      }
    }

    // Create inspector record for this user (if admin client is available)
    if (data.user && supabaseAdmin) {
      try {
        const inspectorData = {
          id: data.user.id,
          full_name: full_name || data.user.email?.split('@')[0] || 'Inspector',
          email: data.user.email || null,
          phone: phone || null,
          certifications: [],
          active: true,
        };

        const { data: inspectorResult, error: inspectorError } = await DatabaseService.insertDataAdmin(
          'inspector',
          inspectorData
        );

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

    // Return user and session data (consistent with login response)
    // If no session was created, inform the user they may need to confirm their email
    if (!session) {
      console.warn('No session created after signup for user:', data.user.id);
      return res.status(201).json({
        message: 'User created successfully. Please check your email to confirm your account, then login.',
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
        },
        session: null,
        access_token: null,
        refresh_token: null,
        requiresEmailConfirmation: true,
      });
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      session: session,
      // Explicitly include access_token and refresh_token
      access_token: session.access_token,
      refresh_token: session.refresh_token,
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
 *     security: []  # Public endpoint - no authentication required
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
    const { email, password } = req.body;

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
 *       - BearerAuth: []
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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refreshes the access token using a refresh token
 *     tags:
 *       - Authentication
 *     security: []  # Public endpoint - no authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token
 *     responses:
 *       '200':
 *         description: Token refreshed successfully
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
 *         description: Missing refresh token
 *       '401':
 *         description: Invalid or expired refresh token
 *       '500':
 *         description: Server error
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ 
        error: 'Refresh token is required' 
      });
    }

    // Create a Supabase client and refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ 
        error: error.message || 'Token refresh failed' 
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ 
        error: 'Token refresh failed - invalid response' 
      });
    }

    // Return user, session, and tokens
    return res.json({
      message: 'Token refreshed successfully',
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
    console.error('Token refresh error:', err);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

