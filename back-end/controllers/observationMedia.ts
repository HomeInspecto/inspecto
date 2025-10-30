import { Request, Response } from 'express';
import DatabaseService from '../database';
import { supabase, supabaseAdmin } from '../supabase';
import crypto from 'crypto';

export const getAllObservationMedia = async (req: Request, res: Response) => {
  try {
    const { observation_id } = req.params;
    const { data, error } = await DatabaseService.fetchData('observation_media', '*', { observation_id });
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch observation media' });
    }
    return res.json({ media: data });
  } catch (error) {
    console.error('Error fetching observation media:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createObservationMedia = async (req: Request, res: Response) => {
  try {
    const { observation_id } = req.params as { observation_id?: string };
    console.log('observation_id', observation_id);
    const {caption} = req.body as {caption?: string};

    if (!observation_id) {
      return res.status(400).json({ error: 'Missing required field: observation_id' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Field name should be "file".' });
    }

    // Determine media type from mimetype
    const mime = req.file.mimetype || 'application/octet-stream';
    const inferredType = mime.startsWith('image/')
      ? 'photo'
      : mime.startsWith('video/')
      ? 'video'
      : 'audio';

      console.log('mime', mime);
      console.log('inferredType', inferredType);
    // Build a unique storage key path: observations/{id}/{random}.{ext}
    const bucket = process.env.SUPABASE_BUCKET || 'observation-media';
    console.log(bucket);
    const ext = (req.file.originalname?.split('.').pop() || 'bin').toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    const objectPath = `observations/${observation_id}/${randomName}.${ext}`;

    // Upload to Supabase Storage
    const storageClient = supabaseAdmin ?? supabase;
    console.log('admin?', Boolean(supabaseAdmin));
    const { error: uploadError } = await storageClient.storage
      .from(bucket)
      .upload(objectPath, req.file.buffer, {
        contentType: mime,
        upsert: false,
      });

    console.log('uploadError', uploadError);

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(502).json({ error: 'Upload failed', details: uploadError.message });
    }

    // Public URL (if bucket is public) — store this as storage_key per requirement
    const { data: publicUrlData } = storageClient.storage.from(bucket).getPublicUrl(objectPath);
    const publicUrl = publicUrlData?.publicUrl || objectPath;
    console.log('publicUrl', publicUrl);
    // Insert observation_media record with storage_key as URL
    const { data, error } = await DatabaseService.insertData('observation_media', {
      observation_id,
      type: inferredType,
      storage_key: publicUrl,
      caption: caption ?? null,
    });
    console.log('data', error);

    if (error) {
      return res.status(500).json({ error: 'Failed to create observation media record' });
    }

    return res.status(201).json({
      observation_media: data,
      storage_key: publicUrl,
      public_url: publicUrl,
    });
  } catch (error) {
    console.error('Error creating observation media:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};