import { Request, Response } from 'express';
import DatabaseService from '../database';
import { supabase, supabaseAdmin } from '../supabase';
import crypto from 'crypto';

export const getAllObservations = async (req: Request, res: Response) => {
  try {
    const { section_id, severity, status } = req.query;
    const filters: Record<string, any> = {};
    
    if (section_id) filters.section_id = section_id as string;
    if (severity) filters.severity = severity as string;
    if (status) filters.status = status as string;
    
    const { data, error } = await DatabaseService.fetchData('observations', '*', Object.keys(filters).length ? filters : undefined);
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    return res.json({ observations: data });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ 
      error: 'Database query failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

export const createObservation = async (req: Request, res: Response) => {
  try {
    const { section_id, obs_name, description, severity, status, implication } = req.body as {
      section_id?: string;
      obs_name?: string;
      description?: string;
      severity?: string | null;
      status?: string | null;
      implication?: string | null;
    };

    if (!section_id || !obs_name) {
      return res.status(400).json({ error: 'Missing required fields: section_id, obs_name' });
    }

    const { data, error } = await DatabaseService.insertData('observations', {
      section_id,
      obs_name,
      description: description ?? null,
      severity: severity ?? null,
      status: status ?? null,
      implication: implication ?? null
    });
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    const created = Array.isArray(data) ? data[0] : data;
    console.log('created', created);
    const observationId = created?.id;

    // If files were uploaded in this request (field name "files"), upload to storage and create media rows
    const uploadedItems: Array<{ storage_key: string; type: 'photo'|'video'|'audio'; public_url?: string | null }> = [];

    console.log('received files:', Array.isArray(req.files) ? req.files.length : 0);
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    console.log('files', files);
    if (observationId && files.length > 0) {
      const bucket = process.env.SUPABASE_BUCKET || 'observation-media';
      const storageClient = supabaseAdmin ?? supabase;
      for (const file of files) {
        const mime = file.mimetype || 'application/octet-stream';
        const type: 'photo' | 'video' | 'audio' = mime.startsWith('image/')
          ? 'photo'
          : mime.startsWith('video/')
          ? 'video'
          : 'audio';
        const ext = (file.originalname?.split('.').pop() || 'bin').toLowerCase();
        const randomName = crypto.randomBytes(16).toString('hex');
        const objectPath = `observations/${observationId}/${randomName}.${ext}`;

        const { error: uploadError } = await storageClient.storage
          .from(bucket)
          .upload(objectPath, file.buffer, { contentType: mime, upsert: false });
        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          continue;
        }

        const { data: publicUrlData } = storageClient.storage.from(bucket).getPublicUrl(objectPath);
        const publicUrl = publicUrlData?.publicUrl || null;

        console.log('publicUrl', publicUrl);
        await DatabaseService.insertData('observation_media', {
          observation_id: observationId,
          type,
          storage_key: publicUrl ?? objectPath,
        });

        uploadedItems.push({ storage_key: publicUrl ?? objectPath, type, public_url: publicUrl });
      }
    }

    return res.status(201).json({
      observation: data,
      uploads: {
        performed: uploadedItems.length > 0,
        count: uploadedItems.length,
        items: uploadedItems,
      },
    });
  } catch (err) {
    console.error('Database insert error:', err);
    return res.status(500).json({ 
      error: 'Database insert failed', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

