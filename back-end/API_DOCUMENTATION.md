# Inspection System API Documentation

## Base URL
```
http://localhost:4000
```

## Authentication
Currently, the API doesn't implement authentication. In production, you should add proper authentication middleware.

## API Endpoints

### Health Check
- **GET** `/health`
- **Description**: Check if the server is running
- **Response**: `{ status: 'healthy', service: 'back-end' }`

### Supabase Connection Test
- **GET** `/supabase/test`
- **Description**: Test Supabase database connection
- **Response**: `{ message: 'Supabase connection successful', supabaseConnected: true, timestamp: string }`

### Organizations

#### List Organizations
- **GET** `/api/organizations`
- **Description**: Get all organizations
- **Response**: `{ organizations: Organization[] }`

### Properties

#### List Properties
- **GET** `/api/properties`
- **Query Parameters**:
  - `organization_id` (optional): Filter by organization ID
- **Response**: `{ properties: Property[] }`

**Example**: `GET /api/properties?organization_id=123e4567-e89b-12d3-a456-426614174000`

### Inspections

#### List Inspections
- **GET** `/api/inspections`
- **Query Parameters**:
  - `organization_id` (optional): Filter by organization ID
  - `inspector_id` (optional): Filter by inspector ID
  - `status` (optional): Filter by status (`draft`, `in_progress`, `ready_for_review`, `published`)
- **Response**: `{ inspections: Inspection[] }`

**Example**: `GET /api/inspections?organization_id=123&status=draft`

#### Create Inspection
- **POST** `/api/inspections`
- **Body**:
  ```json
  {
    "inspector_id": "uuid",
    "property_id": "uuid",
    "organization_id": "uuid",
    "status": "draft",
    "scheduled_for": "2024-01-01T10:00:00Z"
  }
  ```
- **Response**: `{ inspection: Inspection }`

### Inspectors

#### List Inspectors
- **GET** `/api/inspectors`
- **Query Parameters**:
  - `organization_id` (optional): Filter by organization ID
  - `active` (optional): Filter by active status (`true`/`false`)
- **Response**: `{ inspectors: Inspector[] }`

**Example**: `GET /api/inspectors?organization_id=123&active=true`

### Observations

#### List Observations
- **GET** `/api/observations`
- **Query Parameters**:
  - `section_id` (optional): Filter by section ID
  - `severity` (optional): Filter by severity (`minor`, `moderate`, `critical`)
  - `status` (optional): Filter by status (`open`, `resolved`, `defer`)
- **Response**: `{ observations: Observation[] }`

**Example**: `GET /api/observations?severity=critical&status=open`

#### Create Observation (with media upload)
- **POST** `/api/observations/createObservation`
- **Description**: Creates a new observation and optionally uploads files in the same request
- **Body (multipart/form-data)**:
  - Text fields:
    - `section_id` (string, required)
    - `obs_name` (string, required)
    - `description` (string, optional)
    - `severity` (enum: minor|moderate|critical, optional)
    - `status` (enum: open|resolved|defer, optional)
  - File fields:
    - `files` (File, repeatable)
- **Response**:
  ```json
  {
    "observation": { /* created observation */ },
    "uploads": {
      "performed": true,
      "count": 2,
      "items": [
        { "storage_key": "<public-url>", "type": "photo", "public_url": "<public-url>" }
      ]
    }
  }
  ```

### Observation Media

#### Upload Media for Observation
- **POST** `/api/observations/media/:observation_id`
- **Body (multipart/form-data)**:
  - `file` (File, required)
- **Response**:
  ```json
  {
    "observation_media": { /* inserted row */ },
    "storage_key": "<public-url>",
    "public_url": "<public-url>"
  }
  ```

#### List Media for Observation
- **GET** `/api/observations/media/:observation_id`
- **Response**: `{ media: ObservationMedia[] }`

### Transcription

#### Transcribe Audio
- **POST** `/api/transcriptions/transcribe`
- **Body (multipart/form-data)**:
  - `file` (audio file, required)
- **Response**:
  ```json
  { "transcription": "..." }
  ```

#### Polish Transcription
- **POST** `/api/transcriptions/polish`
- **Body**: `{ text: string }`

#### Repolish Transcription
- **POST** `/api/transcriptions/repolish`
- **Body**: `{ text: string }`

### Report

#### Generate Report by Property
- **GET** `/api/report/generate/:property_id`
- **Description**: Builds a report from DB data (organization, latest inspection, sections, observations, media)
- **Response**: See `mock_data/report_generated.json` for example shape

## Data Types

### Organization
```typescript
{
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}
```

### Property
```typescript
{
  id: string;
  organization_id: string;
  address_line1: string;
  address_line2: string | null;
  unit: string | null;
  city: string;
  region: string | null;
  postal_code: string | null;
  country: string;
  year_built: number | null;
  dwelling_type: 'house' | 'townhome' | 'condo' | 'other' | null;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### Inspection
```typescript
{
  id: string;
  inspector_id: string;
  property_id: string;
  organization_id: string;
  status: 'draft' | 'in_progress' | 'ready_for_review' | 'published';
  created_at: string;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
  summary: string | null;
}
```

### Inspector
```typescript
{
  id: string;
  organization_id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  certifications: string[];
  signature_image_url: string | null;
  timezone: string | null;
  bio: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Observation
```typescript
{
  id: string;
  section_id: string;
  obs_name: string;
  description: string | null;
  severity: 'minor' | 'moderate' | 'critical' | null;
  status: 'open' | 'resolved' | 'defer' | null;
  created_at: string;
  updated_at: string;
  implication: string | null;
  recommendation: string | null;
}
```

## Error Responses

All endpoints return errors in the following format:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (missing required fields)
- `500`: Internal Server Error (database or server error)

## Testing the API

You can test the API using curl, Postman, or any HTTP client:

```bash
# Test health endpoint
curl http://localhost:4000/health

# Test Supabase connection
curl http://localhost:4000/supabase/test

# Get all organizations
curl http://localhost:4000/api/organizations

# Get properties for a specific organization
curl "http://localhost:4000/api/properties?organization_id=your-org-id"

# Create a new inspection
curl -X POST http://localhost:4000/api/inspections \
  -H "Content-Type: application/json" \
  -d '{
    "inspector_id": "inspector-uuid",
    "property_id": "property-uuid",
    "organization_id": "org-uuid",
    "status": "draft"
  }'
```
