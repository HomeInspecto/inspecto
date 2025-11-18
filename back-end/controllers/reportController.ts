import { Request, Response } from 'express';
import DatabaseService from '../database';
import { supabaseAdmin } from '../supabase';

/**
 * @swagger
 * /api/report/generate/{inspection_id}:
 *   get:
 *     summary: Generate inspection report for an inspection
 *     description: Generates a comprehensive inspection report including property details, inspection data, sections, observations, and media
 *     tags:
 *       - Reports
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inspection_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the inspection
 *     responses:
 *       '200':
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inspection:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           note:
 *                             type: string
 *                           observations:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 severity:
 *                                   type: string
 *                                 description:
 *                                   type: string
 *                                 media:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       caption:
 *                                         type: string
 *                                       url:
 *                                         type: string
 *       '404':
 *         description: Inspection not found
 *       '500':
 *         description: Error generating report
 */
export const generateReport = async (req: Request, res: Response) => {
  try {
    const { inspection_id } = req.params as { inspection_id: string };
    console.log('inspection_id', inspection_id);
    
    if (!inspection_id) {
      return res.status(400).json({ error: 'Inspection ID is required' });
    }
    
    // 1) Get inspection directly
    const { data: inspections, error: inspErr } = await DatabaseService.fetchDataAdmin('inspections', '*', { id: inspection_id });
    if (inspErr) {
      console.error('Error fetching inspection:', inspErr);
      return res.status(500).json({ error: asMsg(inspErr), details: inspErr });
    }
    
    const inspection = (Array.isArray(inspections) ? inspections[0] : inspections) as any;
    
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    // 1.5) Get inspector from inspection
    const { data: inspectors, error: inspErr2 } = await DatabaseService.fetchDataAdmin('inspector', '*', { id: inspection.inspector_id });
    if (inspErr2) {
      console.error('Error fetching inspector:', inspErr2);
      return res.status(500).json({ error: asMsg(inspErr2), details: inspErr2 });
    }
    const inspector = (Array.isArray(inspectors) ? inspectors[0] : inspectors) as any;
    if (!inspector) {
      return res.status(404).json({ error: 'Inspector not found' });
    }

    // 2) Get property from inspection
    const { data: props, error: propErr } = await DatabaseService.fetchDataAdmin('properties', '*', { id: inspection.property_id });
    if (propErr) {
      console.error('Error fetching property:', propErr);
      return res.status(500).json({ error: asMsg(propErr), details: propErr });
    }
    
    const property = (Array.isArray(props) ? props[0] : props) as any;
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // 3) Get all observations for this inspection
    let observations: any[] = [];
    if (inspection?.id) {
      console.log('Fetching observations for inspection_id:', inspection.id);
      const { data: obs, error: obsErr } = await DatabaseService.fetchDataAdmin('observations', '*', { inspection_id: inspection.id });
      if (obsErr) {
        console.error('Error fetching observations:', obsErr);
        return res.status(500).json({ error: asMsg(obsErr) });
      }
      observations = (obs || []) as any[];
      console.log(`Found ${observations.length} observations for inspection ${inspection.id}`);
    } else {
      console.warn('Inspection ID is missing, cannot fetch observations');
    }

    // 4) Get unique section IDs from observations
    const sectionIds = [...new Set(observations.map((ob: any) => ob.section_id).filter(Boolean))];
    console.log(`Found ${sectionIds.length} unique sections:`, sectionIds);

    // 5) Fetch section details for all section IDs
    let sectionsMap = new Map<string, any>();
    if (sectionIds.length > 0 && supabaseAdmin) {
      const { data: secs, error: secErr } = await supabaseAdmin
        .from('inspection_sections')
        .select('*')
        .in('id', sectionIds);
      if (secErr) {
        console.error('Error fetching sections:', secErr);
        return res.status(500).json({ error: asMsg(secErr) });
      }
      const relevantSections = (secs || []) as any[];
      relevantSections.forEach((sec: any) => {
        sectionsMap.set(sec.id, sec);
      });
      console.log(`Found ${relevantSections.length} sections:`, relevantSections.map(s => ({ id: s.id, name: s.section_name })));
    }

    // 6) Group observations by section and fetch media
    const sectionsWithObservations = [] as any[];
    for (const [sectionId, section] of sectionsMap.entries()) {
      const sectionObservations = observations.filter((ob: any) => ob.section_id === sectionId);
      console.log(`Processing ${sectionObservations.length} observations for section ${section.section_name} (${sectionId})`);

      const observationsWithMedia = [] as any[];
      for (const ob of sectionObservations) {
        console.log(`Fetching media for observation_id: ${ob.id}`);
        const { data: media, error: medErr } = await DatabaseService.fetchDataAdmin('observation_media', '*', { observation_id: ob.id });
        if (medErr) {
          console.error(`Error fetching media for observation ${ob.id}:`, medErr);
          return res.status(500).json({ error: asMsg(medErr) });
        }
        const medArr = (media || []) as any[];
        console.log(`Found ${medArr.length} media items for observation ${ob.id}`);
        observationsWithMedia.push({
          name: ob.obs_name,
          severity: ob.severity,
          description: ob.description,
          implication: ob.implication,
          recommendation: ob.recommendation,
          status: ob.status,
          media: medArr.map((m) => ({ caption: m.caption ?? null, url: m.storage_key })),
        });
      }

      sectionsWithObservations.push({
        name: section.section_name,
        note: section.notes ?? undefined,
        priority_rating: section.priority_rating ?? undefined,
        observations: observationsWithMedia,
      });
    }

    console.log(`Total sections with observations: ${sectionsWithObservations.length}`);

    // Build response strictly from DB
    const report = {
      inspection: {
        summary: inspection?.summary ?? null,
        created_at: inspection?.created_at ?? null,
        inspector: {
          name: inspector?.full_name ?? null,
          email: inspector?.email ?? null,
          phone: inspector?.phone ?? null,
          license_number: inspector?.license_number ?? null,
          certifications: inspector?.certifications ?? null,
        },
        property: {
          address: [property?.address_line1, property?.unit && `Unit ${property.unit}`, property?.city, property?.region].filter(Boolean).join(', '),
          year_built: property?.year_built ?? null,
          type: property?.dwelling_type ?? null,
          sqft: property?.sqft ?? null,
          bedrooms: property?.bedrooms ?? null,
          bathrooms: property?.bathrooms ?? null,
          garage: property?.garage ?? null,
          notes: property?.notes ?? null,
        },
        sections: sectionsWithObservations,
      },
    };

    console.log('Final report structure:', {
      hasInspection: !!report.inspection,
      sectionsCount: report.inspection.sections.length,
      sections: report.inspection.sections.map(s => ({
        name: s.name,
        observationsCount: s.observations.length
      }))
    });

    return res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Unknown error' });
  }
};

function asMsg(e: unknown): string {
  return e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';
}