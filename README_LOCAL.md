# EduDashboard - Local Setup & Deployment

## Local Development
To run this project locally:

1. **Prerequisites**: Node.js installed.
2. **Setup**:
   - Clone the repository.
   - Navigate to `EduDashboard` directory.
   - Run `npm install` to install dependencies.
3. **Environment**:
   - Create a `.env` file in the `EduDashboard` root with the following:
     ```
     SUPABASE_URL=...
     SUPABASE_SERVICE_ROLE_KEY=...
     JWT_SECRET=...
     VITE_SUPABASE_URL=...
     VITE_SUPABASE_ANON_KEY=...
     ```
4. **Run**:
   - Terminal 1 (Backend): `npm run dev:server` (starts on port 8080)
   - Terminal 2 (Frontend): `npm run dev` (starts on port 5173/5000)

## Vercel Deployment (Frontend)
1. **Connect Repository**: Connect your GitHub repository to Vercel.
2. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**: Add all `VITE_` prefixed variables in the Vercel dashboard.
4. **API Configuration**: Update `VITE_API_BASE_URL` in Vercel to point to your hosted backend URL (see below).

## Render Deployment (Backend)
1. **New Web Service**: Create a new Web Service on Render and connect your repository.
2. **Build Command**: `cd EduDashboard && npm install`
3. **Start Command**: `cd EduDashboard && node server/index.js`
4. **Environment Variables**: Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, etc.
5. **Port**: Render will automatically detect the port, or you can set `PORT` to `8080`.

## Syncing Mechanism
- The **Sync** button in the Admin Panel now writes to both **Supabase** (if configured) and a local `folder-structure.json` file.
- On refresh, the app attempts to load data from Supabase first, falling back to the local `folder-structure.json` file.

