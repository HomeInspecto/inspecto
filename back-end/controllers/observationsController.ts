import { Request, Response } from 'express';
import DatabaseService from '../database';
import { supabase, supabaseAdmin } from '../supabase';
import crypto from 'crypto';

/**
 * @swagger
 * /api/observations/observation/{observation_id}:
 *   get:
 *     summary: Get a single observation
 *     description: Retrieves a single observation by its ID
 *     tags:
 *       - Observations
 *     parameters:
 *       - in: path
 *         name: observation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the observation
 *     responses:
 *       '200':
 *         description: Observation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 observation:
 *                   type: object
 *       '404':
 *         description: Observation not found
 *       '500':
 *         description: Database query failed
 */
export const getObservationById = async (req: Request, res: Response) => {
  try {
    const { observation_id } = req.params;

    if (!observation_id) {
      return res.status(400).json({ error: 'observation_id is required' });
    }

    const { data, error } = await DatabaseService.fetchDataAdmin(
      'observations',
      '*',
      { id: observation_id }
    );

    if (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const observation = Array.isArray(data) ? data[0] : data;

    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }

    return res.json({ observation });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

/**
 * @swagger
 * /api/observations/by-inspection/{inspection_id}:
 *   get:
 *     summary: Get all observations by inspection ID grouped by section name
 *     description: Retrieves all observations for a given inspection, grouped by section name
 *     tags:
 *       - Observations
 *     parameters:
 *       - in: path
 *         name: inspection_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the inspection
 *     responses:
 *       '200':
 *         description: Observations grouped by section name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 observations:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *       '400':
 *         description: inspection_id is required
 *       '500':
 *         description: Database query failed
 */
export const getObservationsByInspectionId = async (req: Request, res: Response) => {
  try {
    const { inspection_id } = req.params;

    if (!inspection_id) {
      return res.status(400).json({ error: 'inspection_id is required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Admin client not configured' });
    }

    // Query observations directly by inspection_id
    const { data: observations, error: observationsError } = await DatabaseService.fetchDataAdmin(
      'observations',
      '*',
      { inspection_id }
    );

    if (observationsError) {
      return res.status(500).json({
        error: 'Failed to fetch observations',
        details: observationsError instanceof Error ? observationsError.message : 'Unknown error',
      });
    }

    if (!observations || (Array.isArray(observations) && observations.length === 0)) {
      return res.json({ observations: {} });
    }

    const observationsArray = Array.isArray(observations) ? observations : [];

    // Get unique section IDs
    const sectionIds = [...new Set(observationsArray.map((obs: any) => obs.section_id))];

    // Fetch section names for all section IDs
    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from('inspection_sections')
      .select('id, section_name')
      .in('id', sectionIds);

    if (sectionsError) {
      return res.status(500).json({
        error: 'Failed to fetch section names',
        details: sectionsError instanceof Error ? sectionsError.message : 'Unknown error',
      });
    }

    // Create a map of section_id to section_name
    const sectionMap = new Map<string, string>();
    const sectionsArray = Array.isArray(sections) ? sections : [];
    sectionsArray.forEach((section: any) => {
      sectionMap.set(section.id, section.section_name);
    });

    // Group observations by section name
    const groupedObservations: Record<string, any[]> = {};
    
    observationsArray.forEach((observation: any) => {
      const sectionName = sectionMap.get(observation.section_id) || 'Unknown Section';
      if (!groupedObservations[sectionName]) {
        groupedObservations[sectionName] = [];
      }
      groupedObservations[sectionName].push(observation);
    });

    return res.json({ observations: groupedObservations });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

/**
 * @swagger
 * /api/observations/by-inspection-and-section:
 *   get:
 *     summary: Get observations by inspection ID and section ID
 *     description: Retrieves observations filtered by both inspection_id and section_id
 *     tags:
 *       - Observations
 *     parameters:
 *       - in: query
 *         name: inspection_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the inspection
 *       - in: query
 *         name: section_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the section
 *     responses:
 *       '200':
 *         description: List of observations matching both filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 observations:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: inspection_id and section_id are required
 *       '500':
 *         description: Database query failed
 */
export const getObservationsByInspectionAndSection = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { inspection_id, section_id } = req.query;

    if (!inspection_id || !section_id) {
      return res.status(400).json({ 
        error: 'Both inspection_id and section_id are required as query parameters' 
      });
=======
    const { section_id, severity, status } = req.query;
    const filters: Record<string, any> = {};
    
    if (section_id) filters.section_id = section_id as string;
    if (severity) filters.severity = severity as string;
    if (status) filters.status = status as string;
    
    const { data, error } = await DatabaseService.fetchDataAdmin('observations', '*', Object.keys(filters).length ? filters : undefined);
    
    if (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
>>>>>>> 2db3dea (Fix DB RLD issue)
    }

    // Query observations by both inspection_id and section_id
    const { data, error } = await DatabaseService.fetchDataAdmin(
      'observations',
      '*',
      { 
        inspection_id: inspection_id as string,
        section_id: section_id as string
      }
    );

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch observations',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return res.json({ observations: data || [] });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({
      error: 'Database query failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

/**
 * @swagger
 * /api/observations/createObservation:
 *   post:
 *     summary: Create a new observation with optional media files
 *     description: Creates a new observation and optionally uploads media files to Supabase Storage
 *     tags:
 *       - Observations
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - section_id
 *               - obs_name
 *               - inspection_id
 *             properties:
 *               section_id:
 *                 type: string
 *               obs_name:
 *                 type: string
 *               inspection_id:
 *                 type: string
 *                 description: inspection ID to link the observation to an inspection
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, critical]
 *               status:
 *                 type: string
 *                 enum: [open, resolved, defer]
 *               recommendation:
 *                 type: string
 *               implication:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional media files (photos, videos, or audio)
 *     responses:
 *       '201':
 *         description: Observation created successfully with upload results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 observation:
 *                   type: object
 *                 uploads:
 *                   type: object
 *                   properties:
 *                     performed:
 *                       type: boolean
 *                     count:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           storage_key:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [photo, video, audio]
 *                           public_url:
 *                             type: string
 *       '400':
 *         description: Missing required fields
 *       '500':
 *         description: Database insert or upload failed
 */
export const createObservation = async (req: Request, res: Response) => {
  try {
    const { section_id, obs_name, inspection_id, description, severity, status, implication, recommendation } = req.body as {
      section_id?: string;
      obs_name?: string;
      inspection_id?: string;
      description?: string;
      severity?: string | null;
      status?: string | null;
      implication?: string | null;
      recommendation?: string | null;
    };

    if (!section_id || !obs_name) {
      return res.status(400).json({ error: 'Missing required fields: section_id, obs_name' });
    }

    const { data, error } = await DatabaseService.insertDataAdmin('observations', {
      section_id,
      obs_name,
      inspection_id: inspection_id,
      description: description ?? null,
      severity: severity ?? null,
      status: status ?? null,
      implication: implication ?? null,
      recommendation: recommendation ?? null
    });
    
    console.log('data', data);
    console.log('error', error);
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
        await DatabaseService.insertDataAdmin('observation_media', {
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

