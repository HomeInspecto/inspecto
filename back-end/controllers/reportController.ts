import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/report/generate/{inspection_id}:
 *   get:
 *     summary: Generate inspection report for an inspection
 *     description: Generates a comprehensive inspection report including property details, organization info, inspection data, sections, observations, and media
 *     tags:
 *       - Reports
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
 *                 organization:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     logo:
 *                       type: string
 *                     website:
 *                       type: string
 *                     contact:
 *                       type: object
 *                       properties:
 *                         phone:
 *                           type: string
 *                         address:
 *                           type: string
 *                     properties:
 *                       type: array
 *                       items:
 *                         type: object
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

    // 3) Organization
    const { data: orgs, error: orgErr } = await DatabaseService.fetchDataAdmin('organizations', '*', { id: property.organization_id });
    if (orgErr) return res.status(500).json({ error: asMsg(orgErr) });
    const organization = (Array.isArray(orgs) ? orgs[0] : orgs) as any;

    // 4) Sections for the inspection
    let sections: any[] = [];
    if (inspection?.id) {
      console.log('Fetching sections for inspection_id:', inspection.id);
      const { data: secs, error: secErr } = await DatabaseService.fetchDataAdmin('inspection_sections', '*', { inspection_id: inspection.id });
      if (secErr) {
        console.error('Error fetching sections:', secErr);
        return res.status(500).json({ error: asMsg(secErr) });
      }
      sections = (secs || []) as any[];
      console.log(`Found ${sections.length} sections:`, sections.map(s => ({ id: s.id, name: s.section_name })));
    } else {
      console.warn('Inspection ID is missing, cannot fetch sections');
    }

    // 5) Observations per section + media per observation
    const sectionsWithObservations = [] as any[];
    for (const sec of sections) {
      console.log(`Fetching observations for section_id: ${sec.id} (${sec.section_name})`);
      const { data: obs, error: obsErr } = await DatabaseService.fetchDataAdmin('observations', '*', { section_id: sec.id });
      if (obsErr) {
        console.error(`Error fetching observations for section ${sec.id}:`, obsErr);
        return res.status(500).json({ error: asMsg(obsErr) });
      }
      const obsArr = (obs || []) as any[];
      console.log(`Found ${obsArr.length} observations for section ${sec.id}`);

      const observationsWithMedia = [] as any[];
      for (const ob of obsArr) {
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
          media: medArr.map((m) => ({ caption: m.caption ?? null, url: m.storage_key })),
        });
      }

      sectionsWithObservations.push({
        name: sec.section_name,
        note: sec.notes ?? undefined,
        observations: observationsWithMedia,
      });
    }

    console.log(`Total sections with observations: ${sectionsWithObservations.length}`);

    // Build response strictly from DB
    const orgBlock = {
      name: organization?.name ?? null,
      logo: organization?.logo_url ?? null,
      website: organization?.website ?? null,
      contact: {
        phone: organization?.phone ?? null,
        address: [organization?.address_line1, organization?.address_line2, organization?.city, organization?.postal_code, organization?.country]
          .filter(Boolean)
          .join(', '),
      },
      inspector: null as any, // Optional: join to an inspector if your data model links one
      properties: [
        {
          address: [property?.address_line1, property?.unit && `Unit ${property.unit}`, property?.city, property?.region].filter(Boolean).join(', '),
          year_built: property?.year_built ?? null,
          type: property?.dwelling_type ?? null,
          sqft: property?.sqft ?? null,
          bedrooms: property?.bedrooms ?? null,
          bathrooms: property?.bathrooms ?? null,
          garage: property?.garage ?? null,
          notes: property?.notes ?? null,
        },
      ],
    };

    const report = {
      organization: orgBlock,
      inspection: {
        summary: inspection?.summary ?? null,
        created_at: inspection?.created_at ?? null,
        sections: sectionsWithObservations,
      },
    };

    console.log('Final report structure:', {
      hasOrganization: !!report.organization,
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