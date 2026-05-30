# CyberGuard Deployment

## Backend: Render

Create a Render Web Service from this repository.

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Environment variables:

- `APP_ENV`: `production`
- `SECRET_KEY`: long random string
- `ANTHROPIC_API_KEY`: Claude/Anthropic API key
- `DATABASE_URL`: Render PostgreSQL internal database URL
- `CORS_ORIGINS`: exact deployed Vercel URL, for example `https://cyberguard.vercel.app`

## Frontend: Vercel

Create a Vercel project from the same repository.

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

- `VITE_API_URL`: Render backend URL, for example `https://cyberguard-api.onrender.com`

After changing `VITE_API_URL`, redeploy the Vercel frontend so Vite bakes the value into the client bundle.

After changing `CORS_ORIGINS`, redeploy the Render backend. Multiple approved frontend
origins can be provided as a comma-separated list.

## Verification

After both services deploy, verify:

- `https://your-render-backend.onrender.com/docs`
- `https://your-render-backend.onrender.com/api/scenarios/stats`
- `https://your-render-backend.onrender.com/api/ai/status`

The AI status endpoint is safe to share: it reports whether the key is configured and
whether Claude or the local fallback handled the last AI scenario. It never returns the key.
