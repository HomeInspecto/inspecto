import { authService } from '@/services/auth';
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
 * Fetch inspections and fetch each property's data individually,
 * then map them into the UI `Inspection` shape.
 */
export async function fetchInspectionsWithAddresses(): Promise<Inspection[]> {
  const inspectionsRes = await fetch(`${API_BASE}/api/inspections/all`, {
    headers: {
      ...(await authService.authHeaders()),
      'Content-Type': 'application/json',
    },
  });

  if (!inspectionsRes.ok) return [];

  const inspectionsJson = await inspectionsRes.json();

  const inspectionsApi: InspectionApi[] = inspectionsJson.inspections ?? inspectionsJson ?? [];

  const mappedInspections: Inspection[] = await Promise.all(
    inspectionsApi.map(async inspection => {
      let property: PropertyApi | undefined = undefined;

      if (inspection.property_id) {
        const propertyRes = await fetch(`${API_BASE}/api/properties/${inspection.property_id}`, {
          headers: {
            ...(await authService.authHeaders()),
            'Content-Type': 'application/json',
          },
        });

        if (propertyRes.ok) {
          property = await propertyRes.json();
        }
      }

      return {
        id: inspection.id,
        client: '', // TODO: fill client from API when available
        address: formatAddress(property),
        createdAt: new Date(inspection.created_at).getTime(),
      };
    })
  );

  return mappedInspections;
}
