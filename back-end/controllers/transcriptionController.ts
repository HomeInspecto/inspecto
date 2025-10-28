import fetch from 'node-fetch';
import { Request, Response } from 'express';

/**
 * @swagger
 * /api/transcriptions:
 *   post:
 *     summary: Transcribe an audio file 
 *     description: Accepts an audio file, transcribes it via Whisper
 *     tags:
 *       - Transcription
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
 *         description: Transcription successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transcription:
 *                   type: string
 *       '400':
 *         description: Missing file
 *       '502':
 *         description: Transcription service error
 */

export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Send multipart/form-data with field "file".',
      });
    }

    //transcribes with Hugging Face Inference API (Whisper)
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
    const transcription: string =
      typeof hfJson === 'object' && hfJson !== null && 'text' in hfJson
        ? (hfJson.text as string)
        : JSON.stringify(hfJson);

    return res.json({
      transcription: transcription,
      message: 'Transcription saved successfully',
    });

  } catch (err: any) {
    console.error(err);
    const status = err?.statusCode || err?.status || 500;
    const message = err?.body?.message || err?.message || 'server_error';
    const details = err?.body || err?.rawResponse || undefined;
    return res.status(status).json({ error: message, details });
  }
};
