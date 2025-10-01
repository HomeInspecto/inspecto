import express from 'express';
import { CohereClient } from 'cohere-ai';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || 'your-api-key-here',
});

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
