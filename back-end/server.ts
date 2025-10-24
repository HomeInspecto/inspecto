import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import swaggerOptions from './swagger.config';
import { transcribeAndRewrite } from './controllers/transcribeController';

const app = express();
const port = process.env.PORT || 4000;

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

// Transcribe route, uses controller logic
app.post('/api/transcribe-and-rewrite', upload.single('file'), transcribeAndRewrite);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 Health:  http://localhost:${port}/health`);
  console.log(`📘 Docs:    http://localhost:${port}/docs`);
  console.log(`🎧 Endpoint: POST /api/transcribe-and-rewrite`);
});
