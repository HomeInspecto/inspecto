import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import { CohereClientV2 } from 'cohere-ai';

import swaggerJSDoc from 'swagger-jsdoc'; // specification generator
import swaggerUI from 'swagger-ui-express'; // hosts GUI server
import swaggerOptions from './swagger.config'; // configuration for the guide

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

// Initialize Cohere client (Chat API v2)
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY || 'your-api-key-here',
});

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// serve swagger UI at URL
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.get('/', (_req, res) => {
  res.json({
    message: 'Backend server is running yayy!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'back-end' });
});

/**
 * @swagger
 * /api/transcribe-and-rewrite:
 *   post:
 *     summary: Transcribe an audio file and rewrite the transcript into clean sentences
 *     description: Accepts an audio file (m4a/mp3/wav), transcribes it via Whisper (Hugging Face), then rewrites with Cohere.
 *     tags: [Transcription]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (m4a/mp3/wav)
 *     responses:
 *       '200':
 *         description: Success
 *       '400':
 *         description: Missing file
 *       '502':
 *         description: Upstream model/API error
 *       '500':
 *         description: Server error
 */
app.post('/api/transcribe-and-rewrite', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No file uploaded. Send multipart/form-data with field "file".' });
    }

    // 1) Transcribe with Hugging Face Inference API (Whisper)
    const mime = req.file.mimetype || 'application/octet-stream';
    const hfModel = process.env.HF_MODEL || 'openai/whisper-large-v3';

    const hf = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': mime,
      },
      body: req.file.buffer,
    });

    if (!hf.ok) {
      const text = await hf.text();
      return res.status(502).json({ error: 'Transcription failed (HF)', details: text });
    }

    const hfJson: any = await hf.json();
    const transcript: string =
      typeof hfJson === 'object' && hfJson !== null && 'text' in hfJson
        ? (hfJson.text as string)
        : JSON.stringify(hfJson);

    // 2) Rewrite with Cohere (Chat API v2)
    const prompt =
      `Rewrite the following as clear, complete sentences. Fix grammar and punctuation. ` +
      `Keep all facts, numbers, and terminology. Do not add information.\n\nTEXT:\n${transcript}`;

    const co = await cohere.chat({
      model: process.env.COHERE_MODEL || 'command-a-03-2025',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 400, // v2 uses snake_case
      temperature: 0.2,
    });

    // TS-safe: keep only text parts and join
    const polished = (co?.message?.content ?? [])
      .filter(
        (p): p is { type: 'text'; text: string } =>
          Boolean(p) && (p as any).type === 'text' && typeof (p as any).text === 'string'
      )
      .map((p) => p.text)
      .join('')
      .trim();

    return res.json({ transcript, polished });
  } catch (err: any) {
    console.error(err);
    const status = err?.statusCode || err?.status || 500;
    const message = err?.body?.message || err?.message || 'server_error';
    const details = err?.body || err?.rawResponse || undefined;
    return res.status(status).json({ error: message, details });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`📘 Docs:         http://localhost:${port}/docs`);
  console.log(
    `🎧 Endpoint:     POST http://localhost:${port}/api/transcribe-and-rewrite (multipart field "file")`
  );
});
