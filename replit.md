# EduDashboard

## Overview
EduDashboard is an educational content management dashboard built with React, Vite, and TypeScript. It features a frontend for browsing educational videos organized in categories/folders, and a backend Express API server that connects to Supabase for data persistence.

## Project Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js server with JWT-based authentication and Supabase integration
- **Database**: Supabase (external) for storing dashboard/zone data
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
├── server/
│   └── index.js            # Express backend server
├── public/                 # Static assets
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies
```

## Configuration
- Frontend runs on port 5000 (Vite dev server)
- Backend runs on port 8080 (Express)
- Vite proxies `/api` requests to the backend
- CORS is configured to allow all origins for Replit compatibility

## Environment Variables
- `SUPABASE_URL` - Supabase project URL (Configured)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (Configured)
- `JWT_SECRET` - Secret for JWT token signing (Configured)
- `DEV_USER_1`, `DEV_PASS_1` - Developer credentials (Configured)
- `VITE_SUPABASE_URL` - Frontend Supabase URL (Configured)
- `VITE_SUPABASE_ANON_KEY` - Frontend Supabase Anon Key (Configured)

## Recent Changes
- Updated environment variables with provided Supabase and Auth credentials.
- Configured backend to listen on `0.0.0.0` for Replit environment compatibility.
- Fixed frontend routing to allow visitor access and proper admin login flow.
- Verified backend connectivity and session management.
