import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import swaggerOptions from './swagger.config';

// Middleware
import { authenticateToken } from './middleware/auth';

// Routes
import healthRoutes from './routes/health';
import propertiesRoutes from './routes/properties';
import inspectionsRoutes from './routes/inspections';
import inspectionSectionsRoutes from './routes/inspectionSections';
import inspectorsRoutes from './routes/inspectors';
import observationsRoutes from './routes/observations';
import supabaseRoutes from './routes/supabase';
import transcribeRoutes from './routes/transcribe';
import observationMediaRoutes from './routes/observationMedia';
import generateReportRoutes from './routes/report';
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT || 4000;

// Load environment variables
//dotenv.config();

// CORS configuration shared between main middleware and OPTIONS preflight
const allowedOrigins = [
  'http://localhost:3000', // local frontend
  'http://localhost:4000', // local backend
  'http://localhost:8081', // Expo Metro bundler
  'http://localhost:19000', // Expo CLI
  'http://localhost:19006', // Expo web
  'https://dist-rose-ten.vercel.app', // deployed frontend
  'https://inspecto-production.up.railway.app', // Railway backend
  'https://my-branch-production.up.railway.app',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools like curl (no origin header)
    if (!origin) return callback(null, true);

    // Allow specific domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow your Vercel preview subdomain pattern if you want
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI options to ensure authorization button is visible
const swaggerUIOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Inspecto API Documentation',
  swaggerOptions: {
    persistAuthorization: true, // Persist authorization across page refreshes
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, swaggerUIOptions));

//serve swagger UI at URL
app.use('/api/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec, swaggerUIOptions));

// Public routes (no authentication required)
app.use('/', healthRoutes); // ✅ Health check routes (/, /health)
app.use('/api/auth', authRoutes); // ✅ Authentication routes (signup, login, logout)
app.use('/supabase', supabaseRoutes); // ✅ Supabase test routes

// Protected routes (authentication required)
// All routes below this point require a valid Bearer token
app.use('/api/properties', authenticateToken, propertiesRoutes); // ✅ Property-related routes
app.use('/api/inspections', authenticateToken, inspectionsRoutes); // ✅ Inspection-related routes
app.use('/api/sections', authenticateToken, inspectionSectionsRoutes); // ✅ Inspection section-related routes
app.use('/api/inspectors', authenticateToken, inspectorsRoutes); // ✅ Inspector-related routes
app.use('/api/observations', authenticateToken, observationsRoutes); // ✅ Observation-related routes
app.use('/api/observations/media', authenticateToken, observationMediaRoutes); // ✅ Observation media upload/list
app.use('/api/transcriptions', authenticateToken, transcribeRoutes); // ✅ Transcription routes
app.use('/api/report', generateReportRoutes); // ✅ Report generation routes

//app.use('/api/report', authenticateToken, generateReportRoutes); // ✅ Report generation routes




// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📡 Health check available at http://localhost:${port}/health`);
  console.log(`🔗 Supabase test endpoint: http://localhost:${port}/supabase/test`);
  console.log(`📚 API documentation: http://localhost:${port}/api`);
  console.log(`\n📋 Available API Endpoints:`);
  console.log(`   GET  /api/properties - List all properties`);
  console.log(`   GET  /api/inspections - List inspections (filter by inspector_id, status)`);
  console.log(`   POST /api/auth/signup - Sign up a new user`);
  console.log(`   POST /api/auth/login - Login user`);
  console.log(`   POST /api/auth/logout - Logout user`);
  console.log(`   POST /api/inspections - Create new inspection`);
  console.log(`   GET  /api/inspectors - List inspectors (filter by active)`);
  console.log(`   GET  /api/observations - List observations (filter by section_id, severity, status)`);
});
