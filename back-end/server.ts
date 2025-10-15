import express from 'express';
import cors from 'cors';
import { CohereClient } from 'cohere-ai';

import swaggerJSDoc from 'swagger-jsdoc'; //specification generator
import swaggerUI from 'swagger-ui-express'; //hosts GUI server
import swaggerOptions from './swagger.config'; //configuration file that includes settings for the guide

const app = express();
const port = process.env.PORT || 4000;

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

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📡 Health check available at http://localhost:${port}/health`);
});
