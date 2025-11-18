import type { Inspection } from '../state';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export interface InspectionApi {
  id: string;
  inspector_id: string;
  property_id: string | null;
  status: string;
  created_at: string;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
  summary: string | null;
}

export interface PropertyApi {
  id: string;
  address_line1: string | null;
  address_line2: string | null;
  unit: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  year_built: number | null;
  dwelling_type: string | null;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function formatAddress(property?: PropertyApi | null): string {
  if (!property) return '';

  const lineParts: string[] = [];

  // e.g. "Unit 123 123 Address St"
  if (property.unit) lineParts.push(property.unit);
  if (property.address_line1) lineParts.push(property.address_line1);

  const addressParts: string[] = [];
  if (lineParts.length) addressParts.push(lineParts.join(' '));
  if (property.city) addressParts.push(property.city);
  if (property.region) addressParts.push(property.region);
  if (property.postal_code) addressParts.push(property.postal_code);
  if (property.country) addressParts.push(property.country);

  return addressParts.join(', ');
}

/**
 * Fetch inspections + properties and map them into the UI `Inspection` shape.
 */
export async function fetchInspectionsWithAddresses(): Promise<Inspection[]> {
  const inspectionsRes = await fetch(`${API_BASE}/api/inspections/all`);
  const inspectionsJson = await inspectionsRes.json();

  const inspectionsApi: InspectionApi[] = inspectionsJson.inspections ?? inspectionsJson ?? [];

  const propertiesRes = await fetch(`${API_BASE}/api/properties`);
  const propertiesJson = await propertiesRes.json();

  const propertiesArray: PropertyApi[] = propertiesJson.properties ?? propertiesJson ?? [];

  const propertiesById = new Map<string, PropertyApi>();
  for (const p of propertiesArray) {
    if (p && p.id) {
      propertiesById.set(p.id, p);
    }
  }

  const mappedInspections: Inspection[] = inspectionsApi.map(inspection => {
    const property = inspection.property_id
      ? propertiesById.get(inspection.property_id)
      : undefined;

    return {
      id: inspection.id,
      client: '', // TODO: fill client from API when available
      address: formatAddress(property),
      createdAt: new Date(inspection.created_at).getTime(),
    };
  });

  return mappedInspections;
}
