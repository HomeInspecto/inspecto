<!-- Copilot instructions for the Inspecto repository -->
# Inspecto — AI assistant instructions

This file gives targeted, actionable guidance for code-generating agents working on Inspecto. Keep suggestions small, follow existing conventions, and prefer editing the files and scripts linked below.

1) Big-picture architecture (what changes touch)
- Mono-repo with two primary apps:
  - `front-end` — Expo React Native app using file-based routing (`app/`) via `expo-router`. Runs on port 8081 in Docker. Key scripts: `npm run start`, `npm run ios`, `npm run web` (see `front-end/package.json`).
  - `back-end` — Express + TypeScript API. Single entry: `back-end/server.ts`. Uses routes in `back-end/routes/*` and handlers in `back-end/controllers/*`. Start in dev via `nodemon` (`npm run dev`) or build with `tsc` and run `node dist/server.js`.

2) How developers run and debug (exact commands)
- Recommended Docker (web dev):
  - `docker compose up --build` (starts `front-end` on 8081 and `back-end` on 4000)
  - `docker compose down` to stop
- Local (mobile) dev:
  - Backend: `docker compose up back-end`
  - Frontend (local machine):
    - `cd front-end && npm install`
    - `npm run ios` | `npm run android` | `npm run web` or `npx expo start`
- Health / quick checks:
  - Backend health: `http://localhost:4000/health`
  - API docs served via Swagger: `http://localhost:4000/api/swagger` or `/docs`

3) Important files & service boundaries (edit these when changing behavior)
- Backend
  - `back-end/server.ts` — app entry, CORS policy, route mounting, port defaults to 4000
  - `back-end/routes/*` — REST route definitions
  - `back-end/controllers/*` — business logic; prefer adding tests and small changes here
  - `back-end/swagger.config.ts` — swagger options; update when adding endpoints
  - `back-end/package.json` — scripts: `dev` (nodemon), `build` (tsc), `start` (node dist/server.js)
- Frontend
  - `front-end/app/` — file-based routing for screens (expo-router). Add screens by file under this dir.
  - `front-end/components/` — reusable UI primitives (follow existing themed components)
  - `front-end/features/*` — feature folders contain hooks and views (follow pattern used in `inspection-details`)

4) Project-specific conventions and patterns
- TypeScript everywhere; prefer typed interfaces and export default patterns that match existing modules.
- Backend pattern: one controller per domain object (e.g., inspectionsController.ts) and routes that import controllers. Mirror existing structure for new domains.
- Mock data is kept in `back-end/mock_data/` — useful for unit tests and local API responses.
- Frontend routing uses Expo Router conventions — new pages live in `app/` and use dynamic routes like `app/active-inspection/[id]/`.
- State: uses `zustand` (see `front-end/package.json`) for local/global state in feature modules.

5) Integration points / external dependencies
- Supabase: `@supabase/supabase-js` used in `back-end/supabase.ts` and routes under `/supabase`.
- Cohere AI: used via `cohere-ai` in backend controllers (cohere key from env var `COHERE_API_KEY`).
- Media uploads use `multer` in the backend (`observationMedia` routes/controller).

6) Environment variables and config to be aware of
- `.env` (root) values used by backend (COHERE_API_KEY, PORT). Example referenced in README.
- Frontend expects `EXPO_PUBLIC_API_BASE_URL` when deploying the web export (defaults to `http://localhost:4000`).

7) Quick guidance for agents making edits
- Small, focused PRs: prefer 1 feature/fix per PR and include updated API docs (Swagger) when adding endpoints.
- When adding a backend route:
  - Add route file under `back-end/routes` and controller in `back-end/controllers`.
  - Register the route in `back-end/server.ts` (follow existing mounting pattern) and update `swagger.config.ts` if needed.
  - Ensure CORS origins in `server.ts` are OK for local/dev URLs.
- When changing frontend navigation or adding screens:
  - Add files under `front-end/app/` (expo-router). Use existing component patterns for theming and layout (`app/_layout.tsx`).

8) Useful examples to copy from (concrete references)
- Health route + server patterns: `back-end/routes/health.ts` and `back-end/server.ts` (look for `/health` and swagger mounting).
- Inspections feature: `back-end/routes/inspections.ts` + `back-end/controllers/inspectionsController.ts` and frontend feature `front-end/features/inspection-details/`.

9) Acceptance criteria for generated code
- Code compiles (TypeScript) and existing linting rules pass (`npm run lint` in front-end). Backend must build with `tsc` and run via `npm run dev` without runtime errors for routes touched.

If anything above is unclear or you want more details in any section (examples, endpoints, or debugging tips), tell me which part to expand and I will iterate.
