import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
const sanitize = (v?: string) =>
  (v ?? '')
    .replace(/^['"]|['"]$/g, '')   // strip surrounding quotes
    .replace(/^Bearer\s+/i, '')    // strip accidental 'Bearer '
    .trim();

const supabaseUrl = sanitize(process.env.SUPABASE_URL);
const anon = sanitize(process.env.SUPABASE_ANON_KEY);
const service = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY);

// quick guard
if (service && service.split('.').length !== 3) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not a valid JWT (3 parts expected)');
}

export const supabase = createClient(supabaseUrl, anon);
export const supabaseAdmin = service
  ? createClient(supabaseUrl, service, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// Database types based on your schema
export interface Database {
  public: {
    Tables: {
      inspection_sections: {
        Row: {
          id: string;
          inspection_id: string;
          section_name: string;
          notes: string | null;
          priority_rating: number | null;
        };
        Insert: {
          id?: string;
          inspection_id: string;
          section_name: string;
          notes?: string | null;
          priority_rating?: number | null;
        };
        Update: {
          id?: string;
          inspection_id?: string;
          section_name?: string;
          notes?: string | null;
          priority_rating?: number | null;
        };
      };
      inspections: {
        Row: {
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
        };
        Insert: {
          id?: string;
          inspector_id: string;
          property_id: string;
          organization_id: string;
          status: 'draft' | 'in_progress' | 'ready_for_review' | 'published';
          created_at?: string;
          scheduled_for?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
          summary?: string | null;
        };
        Update: {
          id?: string;
          inspector_id?: string;
          property_id?: string;
          organization_id?: string;
          status?: 'draft' | 'in_progress' | 'ready_for_review' | 'published';
          created_at?: string;
          scheduled_for?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
          summary?: string | null;
        };
      };
      inspectors: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          license_number?: string | null;
          certifications?: string[];
          signature_image_url?: string | null;
          timezone?: string | null;
          bio?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          license_number?: string | null;
          certifications?: string[];
          signature_image_url?: string | null;
          timezone?: string | null;
          bio?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      observation_media: {
        Row: {
          media_id: string;
          observation_id: string;
          type: 'photo' | 'video' | 'audio';
          storage_key: string;
          caption: string | null;
          transcription: string | null;
          annotated_flag: boolean;
          created_at: string;
          is_primary: boolean;
          sort_order: number;
        };
        Insert: {
          media_id?: string;
          observation_id: string;
          type: 'photo' | 'video' | 'audio';
          storage_key: string;
          caption?: string | null;
          transcription?: string | null;
          annotated_flag?: boolean;
          created_at?: string;
          is_primary?: boolean;
          sort_order?: number;
        };
        Update: {
          media_id?: string;
          observation_id?: string;
          type?: 'photo' | 'video' | 'audio';
          storage_key?: string;
          caption?: string | null;
          transcription?: string | null;
          annotated_flag?: boolean;
          created_at?: string;
          is_primary?: boolean;
          sort_order?: number;
        };
      };
      observations: {
        Row: {
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
        };
        Insert: {
          id?: string;
          section_id: string;
          obs_name: string;
          description?: string | null;
          severity?: 'minor' | 'moderate' | 'critical' | null;
          status?: 'open' | 'resolved' | 'defer' | null;
          created_at?: string;
          updated_at?: string;
          implication?: string | null;
          recommendation?: string | null;
        };
        Update: {
          id?: string;
          section_id?: string;
          obs_name?: string;
          description?: string | null;
          severity?: 'minor' | 'moderate' | 'critical' | null;
          status?: 'open' | 'resolved' | 'defer' | null;
          created_at?: string;
          updated_at?: string;
          implication?: string | null;
          recommendation?: string | null;
        };
      };
      organization_users: {
        Row: {
          organization_id: string;
          user_id: string;
          role: 'owner';
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role: 'owner';
        };
        Update: {
          organization_id?: string;
          user_id?: string;
          role?: 'owner';
        };
      };
      organizations: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id: string;
          address_line1: string;
          address_line2?: string | null;
          unit?: string | null;
          city: string;
          region?: string | null;
          postal_code?: string | null;
          country: string;
          year_built?: number | null;
          dwelling_type?: 'house' | 'townhome' | 'condo' | 'other' | null;
          sqft?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          garage?: boolean | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          address_line1?: string;
          address_line2?: string | null;
          unit?: string | null;
          city?: string;
          region?: string | null;
          postal_code?: string | null;
          country?: string;
          year_built?: number | null;
          dwelling_type?: 'house' | 'townhome' | 'condo' | 'other' | null;
          sqft?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          garage?: boolean | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          inspection_id: string;
          version: number;
          status: 'draft' | 'published';
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          inspection_id: string;
          version: number;
          status: 'draft' | 'published';
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inspection_id?: string;
          version?: number;
          status?: 'draft' | 'published';
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          timezone: string | null;
          default_org_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          default_org_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          default_org_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export default supabase;
