# EduDashboard - Local & Vercel Setup (No External DB)

This setup does **not** use Supabase or any external backend for content.
The app loads content from the repository file:

- `folder-structure.json`

Both visitor and developer views use the same file.

## How Content Works
1. App reads `folder-structure.json` at runtime.
2. Admin can edit content from the UI.
3. Use **Download Folder Structure** in the UI to export updated `folder-structure.json`.
4. Replace the repo file with the downloaded file.
5. Commit and push to GitHub.
6. Vercel redeploys and visitors see the updated structure.

## Local Run (Step by Step)
1. Open terminal in project root.
2. Install dependencies:
   - `npm install`
3. Start app:
   - `npm run dev`
4. Open the local URL shown by Vite (usually `http://localhost:5000`).

## Developer Login (Default)
If you do not set custom credentials, default developer credentials are:

- `Brij Bhushan` / `10368`
- `Moulik Garg` / `10730`
- `Rehan` / `10820`

Optional custom credentials (frontend env):

- `VITE_DEV_USER_1`, `VITE_DEV_PASS_1`
- `VITE_DEV_USER_2`, `VITE_DEV_PASS_2`
- `VITE_DEV_USER_3`, `VITE_DEV_PASS_3`

If you use custom credentials, create a `.env` file in root before `npm run dev`.

## Update Content Locally
1. Login as developer.
2. Open `Settings -> Manage Content`.
3. Make folder/video/pdf changes.
4. Open the **Download** tab.
5. Click **Download folder-structure.json**.
6. Replace project root `folder-structure.json` with the downloaded file.
7. Refresh app to verify changes.

## Vercel Deploy (Step by Step)
1. Push your project to GitHub.
2. In Vercel, import the GitHub repository.
3. Framework preset: `Vite`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy.

Optional on Vercel:
- Add `VITE_DEV_USER_*` and `VITE_DEV_PASS_*` env vars if you want custom developer credentials.

## Update Content for Production (Vercel)
1. Open the deployed app.
2. Login as developer.
3. Update content in UI.
4. Download `folder-structure.json`.
5. Replace local repo `folder-structure.json` with downloaded file.
6. Commit and push to GitHub.
7. Wait for Vercel redeploy.
8. Verify the site loads the new structure.
