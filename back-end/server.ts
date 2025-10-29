import 'dotenv/config';
import express from 'express';
import cors from 'cors';
<<<<<<< HEAD
import multer from 'multer';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import swaggerOptions from './swagger.config';
import { transcribeAudio } from './controllers/transcriptionController';
import { polishTranscription, repolishTranscription } from './controllers/polishController';
=======
import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';
>>>>>>> d00002fa78ab3bb309a270591524a6c599552bc0


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
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

<<<<<<< HEAD
// Basic routes
app.get('/', (_req, res) => {
  res.json({
    message: 'Backend server is running yayy!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'back-end' });
});
=======
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
>>>>>>> d00002fa78ab3bb309a270591524a6c599552bc0

//routes
app.post('/api/transcriptions', upload.single('file'), transcribeAudio);
app.post('/api/polish', polishTranscription);
app.post('/api/repolish', repolishTranscription);


// Start server
app.listen(port, () => {
<<<<<<< HEAD
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 Health:  http://localhost:${port}/health`);
  console.log(`📘 Docs:    http://localhost:${port}/docs`);
  console.log(`🎧 Endpoint: POST /api/transcriptions`);
  console.log(`Endpoint: POST /api/polish`);
  console.log(`Endpoint: POST /api/repolish`);
=======
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
>>>>>>> d00002fa78ab3bb309a270591524a6c599552bc0
});
