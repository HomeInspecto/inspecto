import { Request, Response } from 'express';
import DatabaseService from '../database';

/**
 * @swagger
 * /api/report/generate/{property_id}:
 *   get:
 *     summary: Generate inspection report for a property
 *     description: Generates a comprehensive inspection report including property details, organization info, inspection data, sections, observations, and media
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: path
 *         name: property_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the property
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
 *         description: Property not found
 *       '500':
 *         description: Error generating report
 */
export const generateReport = async (req: Request, res: Response) => {
  try {
    const { property_id } = req.params as { property_id: string };
    console.log('property_id', property_id);
    
    if (!property_id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    
    // 1) Property
    const { data: props, error: propErr } = await DatabaseService.fetchDataAdmin('properties', '*', { id: property_id });
    console.log('props', props);
    console.log('propErr', propErr);
    if (propErr) {
      console.error('Error fetching property:', propErr);
      return res.status(500).json({ error: asMsg(propErr), details: propErr });
    }
    
    console.log('props', props);
    const property = (Array.isArray(props) ? props[0] : props) as any;
    console.log('property', property);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // 2) Organization
    const { data: orgs, error: orgErr } = await DatabaseService.fetchDataAdmin('organizations', '*', { id: property.organization_id });
    if (orgErr) return res.status(500).json({ error: asMsg(orgErr) });
    const organization = (Array.isArray(orgs) ? orgs[0] : orgs) as any;

    // 3) Latest inspection for this property (by created_at desc)
    const { data: inspections, error: inspErr } = await DatabaseService.fetchDataAdmin('inspections', '*', { property_id });
    if (inspErr) return res.status(500).json({ error: asMsg(inspErr) });
    const inspectionsArr = (inspections || []) as any[];
    inspectionsArr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const inspection = inspectionsArr[0];

    // 4) Sections for the inspection
    let sections: any[] = [];
    if (inspection?.id) {
      const { data: secs, error: secErr } = await DatabaseService.fetchDataAdmin('inspection_sections', '*', { inspection_id: inspection.id });
      if (secErr) return res.status(500).json({ error: asMsg(secErr) });
      sections = (secs || []) as any[];
    }

    // 5) Observations per section + media per observation
    const sectionsWithObservations = [] as any[];
    for (const sec of sections) {
      const { data: obs, error: obsErr } = await DatabaseService.fetchDataAdmin('observations', '*', { section_id: sec.id });
      if (obsErr) return res.status(500).json({ error: asMsg(obsErr) });
      const obsArr = (obs || []) as any[];

      const observationsWithMedia = [] as any[];
      for (const ob of obsArr) {
        const { data: media, error: medErr } = await DatabaseService.fetchDataAdmin('observation_media', '*', { observation_id: ob.id });
        if (medErr) return res.status(500).json({ error: asMsg(medErr) });
        const medArr = (media || []) as any[];
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

    return res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Unknown error' });
  }
};

function asMsg(e: unknown): string {
  return e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';
}