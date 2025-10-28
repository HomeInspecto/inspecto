import express from 'express';
import cors from 'cors';
import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

import swaggerJSDoc from 'swagger-jsdoc'; //specification generator
import swaggerUI from 'swagger-ui-express'; //hosts GUI server
import swaggerOptions from './swagger.config'; //configuration file that includes settings for the guide
import { supabase, supabaseAdmin } from './supabase';
import DatabaseService from './database';

const app = express();
const port = process.env.PORT || 4000;

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());

app.use(cors({ 
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || 'your-api-key-here',
});

const swaggerSpec = swaggerJSDoc(swaggerOptions);

//serve swagger UI at URL
app.use('/api', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend server is running yayy!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'back-end' });
});

// Supabase test route
app.get('/supabase/test', async (req, res) => {
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
});

// Organizations API
app.get('/organizations', async (req, res) => {
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
});

// Properties API
app.get('/api/properties', async (req, res) => {
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
});

// Inspections API
app.get('/api/inspections', async (req, res) => {
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
});

// Create new inspection
app.post('/api/inspections', async (req, res) => {
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
});

// Inspectors API
app.get('/api/inspectors', async (req, res) => {
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
});

// Observations API
app.get('/api/observations', async (req, res) => {
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
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📡 Health check available at http://localhost:${port}/health`);
  console.log(`🔗 Supabase test endpoint: http://localhost:${port}/supabase/test`);
  console.log(`📚 API documentation: http://localhost:${port}/api`);
  console.log(`\n📋 Available API Endpoints:`);
  console.log(`   GET  /api/organizations - List all organizations`);
  console.log(`   GET  /api/properties - List properties (filter by organization_id)`);
  console.log(`   GET  /api/inspections - List inspections (filter by organization_id, inspector_id, status)`);
  console.log(`   POST /api/inspections - Create new inspection`);
  console.log(`   GET  /api/inspectors - List inspectors (filter by organization_id, active)`);
  console.log(`   GET  /api/observations - List observations (filter by section_id, severity, status)`);
});
