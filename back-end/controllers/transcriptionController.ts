import axios from 'axios';
import { Request, Response } from 'express';

/**
 * @swagger
 * /api/transcriptions/transcription:
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
    // Map file extension to correct MIME type for Hugging Face API
    const getAudioMimeType = (mimetype: string, originalname: string): string => {
      if (mimetype && mimetype !== 'application/octet-stream') {
        return mimetype;
      }
      
      // Fallback: detect from filename extension
      const ext = originalname?.toLowerCase().split('.').pop() || '';
      const mimeMap: Record<string, string> = {
        'wav': 'audio/wav',
        'wave': 'audio/wave',
        'mp3': 'audio/mpeg',
        'm4a': 'audio/m4a',
        'flac': 'audio/flac',
        'ogg': 'audio/ogg',
        'webm': 'audio/webm',
        'amr': 'audio/AMR',
      };
      
      return mimeMap[ext] || 'audio/wav'; // Default to wav if unknown
    };
    
    const mime = getAudioMimeType(req.file.mimetype, req.file.originalname);
    const hfModel = process.env.HF_MODEL || 'openai/whisper-large-v3';
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return res.status(500).json({ error: 'Missing HF_TOKEN in environment' });
    }

    let hfJson: any;
    try {
      // Send binary file data directly to Hugging Face API
      const hfResp = await axios.post(
        `https://api-inference.huggingface.co/models/${hfModel}`,
        req.file.buffer, // Raw binary buffer
        {
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': mime,
            'Content-Length': String(req.file.size ?? req.file.buffer.length),
            Accept: 'application/json',
          },
          responseType: 'json',
          // Send buffer as raw binary without transformation
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
      hfJson = hfResp.data;
    } catch (e: any) {
      const status = e?.response?.status || 502;
      const details = e?.response?.data || e?.message || 'unknown_error';
      const headers = e?.response?.headers;
      console.error('HF transcription error', {
        status,
        details,
        headers,
        mime,
        hfModel,
      });
      return res.status(status).json({ error: 'Transcription failed (HF)', details, meta: { mime, hfModel } });
    }
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
