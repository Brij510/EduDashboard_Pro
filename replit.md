# EduDashboard

## Overview
EduDashboard is an educational content management dashboard built with React, Vite, and TypeScript. It includes built-in API endpoints (Vercel functions under `/api`) for authentication and Supabase persistence.

## Project Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend API**: Vercel serverless functions in `/api` (`login`, `logout`, `session`, `zone`)
- **Database**: Supabase for storing dashboard/zone data
- **Styling**: Tailwind CSS with custom theme, shadcn/ui component library

## Project Structure
```
EduDashboard/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Page components (Index, Login, NotFound)
│   ├── data/               # Mock data
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries (api, utils)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Root app component with routing
│   └── main.tsx            # Entry point
├── api/                    # Vercel API functions and shared backend helpers
│   ├── _lib/
│   ├── login.js
│   ├── logout.js
│   ├── session.js
│   └── zone.js
├── public/                 # Static assets
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies
```

## Configuration
- Frontend runs on port 5000 (Vite dev server)
- Production API calls are same-origin (`/api/*`) to keep frontend/backend unified on Vercel
- Local legacy Express server exists for optional local workflows (`server/index.js`)

## Environment Variables
- `SUPABASE_URL` - Supabase project URL (Configured)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (Configured)
- `JWT_SECRET` - Secret for JWT token signing (Configured)
- `DEV_USER_1`, `DEV_PASS_1` - Developer credentials (Configured)
- `VITE_SUPABASE_URL` - Frontend Supabase URL (Configured)
- `VITE_SUPABASE_ANON_KEY` - Frontend Supabase Anon Key (Configured)

## Recent Changes
- Added unified Vercel API backend in `/api` with JWT cookie auth and Supabase save/load.
- Updated frontend API base logic to use same-origin APIs in production by default.
- Added `vercel.json` SPA fallback routing for BrowserRouter paths.
