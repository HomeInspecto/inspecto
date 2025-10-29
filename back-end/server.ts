import express from 'express';
import cors from 'cors';
import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

import swaggerJSDoc from 'swagger-jsdoc'; //specification generator
import swaggerUI from 'swagger-ui-express'; //hosts GUI server
import swaggerOptions from './swagger.config'; //configuration file that includes settings for the guide

// Routes
import healthRoutes from './routes/health';
import organizationsRoutes from './routes/organizations';
import propertiesRoutes from './routes/properties';
import inspectionsRoutes from './routes/inspections';
import inspectorsRoutes from './routes/inspectors';
import observationsRoutes from './routes/observations';
import supabaseRoutes from './routes/supabase';

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
app.use('/api/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.use('/', healthRoutes); // ✅ Health check routes (/, /health)
app.use('/api/organizations', organizationsRoutes); // ✅ Organization-related routes
app.use('/api/properties', propertiesRoutes); // ✅ Property-related routes
app.use('/api/inspections', inspectionsRoutes); // ✅ Inspection-related routes
app.use('/api/inspectors', inspectorsRoutes); // ✅ Inspector-related routes
app.use('/api/observations', observationsRoutes); // ✅ Observation-related routes
app.use('/supabase', supabaseRoutes); // ✅ Supabase test routes

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
