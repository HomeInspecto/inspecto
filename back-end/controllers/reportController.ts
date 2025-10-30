import { Request, Response } from 'express';
import DatabaseService from '../database';

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { property_id } = req.params as { property_id: string };

    // 1) Property
    const { data: props, error: propErr } = await DatabaseService.fetchData('properties', '*', { id: property_id });
    if (propErr) return res.status(500).json({ error: asMsg(propErr) });
    const property = (Array.isArray(props) ? props[0] : props) as any;
    if (!property) return res.status(404).json({ error: 'Property not found' });

    // 2) Organization
    const { data: orgs, error: orgErr } = await DatabaseService.fetchData('organizations', '*', { id: property.organization_id });
    if (orgErr) return res.status(500).json({ error: asMsg(orgErr) });
    const organization = (Array.isArray(orgs) ? orgs[0] : orgs) as any;

    // 3) Latest inspection for this property (by created_at desc)
    const { data: inspections, error: inspErr } = await DatabaseService.fetchData('inspections', '*', { property_id });
    if (inspErr) return res.status(500).json({ error: asMsg(inspErr) });
    const inspectionsArr = (inspections || []) as any[];
    inspectionsArr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const inspection = inspectionsArr[0];

    // 4) Sections for the inspection
    let sections: any[] = [];
    if (inspection?.id) {
      const { data: secs, error: secErr } = await DatabaseService.fetchData('inspection_sections', '*', { inspection_id: inspection.id });
      if (secErr) return res.status(500).json({ error: asMsg(secErr) });
      sections = (secs || []) as any[];
    }

    // 5) Observations per section + media per observation
    const sectionsWithObservations = [] as any[];
    for (const sec of sections) {
      const { data: obs, error: obsErr } = await DatabaseService.fetchData('observations', '*', { section_id: sec.id });
      if (obsErr) return res.status(500).json({ error: asMsg(obsErr) });
      const obsArr = (obs || []) as any[];

      const observationsWithMedia = [] as any[];
      for (const ob of obsArr) {
        const { data: media, error: medErr } = await DatabaseService.fetchData('observation_media', '*', { observation_id: ob.id });
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