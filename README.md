# CyberGuard - AI-Powered Cyber Range

CyberGuard is a full-stack cybersecurity awareness and attack-simulation platform.
It trains users through interactive investigation flows instead of static quizzes.

## What It Includes

- 18 attack channels with more than 150 prebuilt scenario definitions
- AI-generated scenarios through the Anthropic Claude API
- Local AI-style fallback scenarios when the provider is unavailable
- Evidence-driven response locking: users investigate before choosing an answer
- Dynamic URLs, randomized option positions, and scenario-specific response wording
- Risk scoring, response metrics, red-flag analysis, leaderboard, and analytics
- Live SOC dashboard with recent CISA KEV and high-severity NVD threat intelligence

## Attack Channels

- Email phishing
- Fake website
- QR attack
- Vishing
- USB drop
- Internal chat scam
- Attachment sandbox
- Browser exploit
- MFA fatigue
- Cloud breach
- Insider threat
- Rogue WiFi
- DNS spoofing
- AI scam / deepfake
- Multi-stage attack chain
- SMS phishing
- BEC fraud
- Supply-chain attack

## Tech Stack

- Frontend: React 18 + Vite
- Backend: FastAPI + SQLAlchemy
- Database: SQLite locally, PostgreSQL in production
- Authentication: JWT + bcrypt
- AI provider: Anthropic Claude API with validated fallback behavior
- Deployment: Vercel frontend + Render backend

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```env
APP_ENV=development
SECRET_KEY=replace-with-a-long-random-secret
ANTHROPIC_API_KEY=replace-with-your-claude-api-key
DATABASE_URL=sqlite:///./cyberguard.db
CORS_ORIGINS=http://localhost:3000
```

Start the backend:

```bash
python main.py
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Render and Vercel instructions.

Production requires:

- `APP_ENV=production`
- A generated strong `SECRET_KEY`
- `ANTHROPIC_API_KEY`
- Render PostgreSQL `DATABASE_URL`
- `CORS_ORIGINS` set to the exact deployed Vercel URL
- `VITE_API_URL` set in Vercel to the deployed Render backend URL

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an operator account |
| POST | `/api/auth/login` | Authenticate |
| GET | `/api/auth/me` | Return current operator |
| POST | `/api/scenarios/generate` | Generate or load a scenario |
| POST | `/api/scenarios/submit` | Grade a response |
| GET | `/api/scenarios/stats` | Verify seeded scenario counts |
| GET | `/api/ai/status` | Check safe AI-provider diagnostics |
| GET | `/api/threats` | Load recent authenticated threat intelligence |
| GET | `/api/leaderboard` | Return ranked operators |
| GET | `/api/stats` | Return operator analytics |

## Notes

- The database is created and seeded automatically at startup.
- The Anthropic API key is never returned by `/api/ai/status`.
- If Claude returns malformed output or is unavailable, the app serves a local fallback scenario.
- Live threat intelligence is cached to reduce external API load.
