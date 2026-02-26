# EduDashboard - Local & Vercel Setup (No External DB)

This setup does **not** use Supabase or any external backend for content.
The app loads content from the repository file:

- `public/folder-structure.json`

Both visitor and developer views use the same file.

## How Content Works
1. App reads `public/folder-structure.json` at runtime.
2. Admin can edit content from the UI.
3. Use **Download Folder Structure** in the UI to export updated `folder-structure.json`.
4. Replace `public/folder-structure.json` with the downloaded file.
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
- `VITE_YOUTUBE_API_KEY` (required only for YouTube playlist import feature)

If you use custom credentials, create a `.env` file in root before `npm run dev`.
For playlist import, the API key must have YouTube Data API v3 enabled.

## Update Content Locally
1. Login as developer.
2. Open `Settings -> Manage Content`.
3. Make folder/video/pdf changes.
4. Optional: use **Import Playlist (YouTube)** to create a folder from a playlist URL and auto-add all playlist videos.
   - Requires `VITE_YOUTUBE_API_KEY` in `.env`.
   - Example URL: `https://www.youtube.com/playlist?list=...`
5. Open the **Download** tab.
6. Click **Download folder-structure.json**.
7. Replace `public/folder-structure.json` with the downloaded file.
8. Refresh app to verify changes.

## Vercel Deploy (Step by Step)
1. Push your project to GitHub.
2. In Vercel, import the GitHub repository.
3. Framework preset: `Vite`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy.

Optional on Vercel:
- Add `VITE_DEV_USER_*` and `VITE_DEV_PASS_*` env vars if you want custom developer credentials.
- Add `VITE_YOUTUBE_API_KEY` if you want playlist import to work on production.

## Update Content for Production (Vercel)
1. Open the deployed app.
2. Login as developer.
3. Update content in UI.
4. Download `folder-structure.json`.
5. Replace local repo `public/folder-structure.json` with downloaded file.
6. Commit and push to GitHub.
7. Wait for Vercel redeploy.
8. Verify the site loads the new structure.
