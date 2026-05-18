# CyberGuard Deployment

## Backend: Render

Create a Render Web Service from this repository.

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Environment variables:

- `SECRET_KEY`: long random string
- `ANTHROPIC_API_KEY`: Claude/Anthropic API key
- `DATABASE_URL`: Render PostgreSQL internal database URL

## Frontend: Vercel

Create a Vercel project from the same repository.

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

- `VITE_API_URL`: Render backend URL, for example `https://cyberguard-api.onrender.com`

After changing `VITE_API_URL`, redeploy the Vercel frontend so Vite bakes the value into the client bundle.
