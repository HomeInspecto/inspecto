# Backend Environment Setup

## Required Environment Variables

Create a `.env` file in the back-end directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cohere API
COHERE_API_KEY=your_cohere_api_key

# Server Configuration
PORT=4000
```

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run dev
```

The server will start on port 4000 (or the port specified in your `.env` file).
