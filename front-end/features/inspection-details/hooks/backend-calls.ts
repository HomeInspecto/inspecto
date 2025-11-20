// backend.ts
import type { Inspection } from '@/features/home/state';
import type { Observation } from '../../edit-observation/state';
import type { ActiveInspection } from '../state';
import { authService } from '@/services/auth';

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
  const inspectionsRes = await fetch(`${API_BASE}/api/inspections/all`, {
    headers: {
      ...(await authService.authHeaders()),
      'Content-Type': 'application/json',
    },
  });
  const inspectionsJson = await inspectionsRes.json();

  const inspectionsApi: InspectionApi[] = inspectionsJson.inspections ?? inspectionsJson ?? [];

  const mappedInspections: Inspection[] = await Promise.all(
    inspectionsApi.map(async inspection => {
      const propertiesRes = await fetch(
        `${API_BASE}/api/properties/property/${inspection.property_id}`,
        {
          headers: {
            ...(await authService.authHeaders()),
            'Content-Type': 'application/json',
          },
        }
      );
      const property = propertiesRes.ok ? await propertiesRes.json() : undefined;

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

export interface ObservationApi {
  id: string;
  section_id: string;
  obs_name: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  updated_at: string;
  implication: string;
  recommendation: string;
  inspection_id: string;
}

/**
 * Fetch observations for a given inspection, mapped to your `Observation` shape.
 */
export async function fetchObservationsByInspection(inspectionId: string): Promise<Observation[]> {
  const res = await fetch(`${API_BASE}/api/observations/by-inspection/${inspectionId}`, {
    headers: {
      ...(await authService.authHeaders()),
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();

  const observationsBySection: Record<string, ObservationApi[]> = json.observations ?? {};

  const results: Observation[] = [];

  for (const [sectionTitle, obsArray] of Object.entries(observationsBySection)) {
    for (const apiObs of obsArray) {
      const mapped: Observation = {
        name: apiObs.obs_name,
        description: apiObs.description,
        implications: apiObs.implication,
        recommendation: apiObs.recommendation,
        section: sectionTitle,
        severity: apiObs.severity as Observation['severity'], // 'low' | 'medium' | 'critical'
        fieldNote: '',
        photos: [],
      };

      results.push(mapped);
    }
  }

  return results;
}

/**
 * Fetch a single inspection (plus property + observations)
 * and map into `ActiveInspection`.
 */
export async function fetchActiveInspectionDetails(
  inspectionId: string
): Promise<ActiveInspection> {
  const inspectionRes = await fetch(`${API_BASE}/api/inspections/inspection/${inspectionId}`, {
    headers: {
      ...(await authService.authHeaders()),
      'Content-Type': 'application/json',
    },
  });

  const inspectionJson = await inspectionRes.json();
  const inspectionApi: InspectionApi = inspectionJson.inspection ?? inspectionJson;

  let address = '';

  if (inspectionApi.property_id) {
    const propertyRes = await fetch(
      `${API_BASE}/api/properties/property/${inspectionApi.property_id}`,
      {
        headers: {
          ...(await authService.authHeaders()),
          'Content-Type': 'application/json',
        },
      }
    );

    const property: PropertyApi | undefined = await propertyRes.json();
    address = formatAddress(property);
  }

  const observations = await fetchObservationsByInspection(inspectionId);

  const activeInspection: ActiveInspection = {
    id: inspectionApi.id,
    client: '', // fill when client data is available from API
    address,
    createdAt: new Date(inspectionApi.created_at).getTime(),
    observations,
  };

  return activeInspection;
}
