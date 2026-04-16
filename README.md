# CyberGuard — AI-Powered Cybersecurity Training Platform

A full-stack web application that simulates real-world social engineering attacks to train users in identifying and responding to cyber threats.

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Python FastAPI
- **Database:** SQLite (via SQLAlchemy)
- **Auth:** JWT + bcrypt password hashing
- **AI Engine:** Claude API (Anthropic) for dynamic scenario generation

## Project Structure

```
cyberguard/
├── backend/
│   ├── main.py            # FastAPI app + all routes
│   ├── database.py        # SQLAlchemy models (User, Scenario, Response)
│   ├── auth.py            # JWT + password hashing
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── ai_engine.py       # Claude API integration
│   ├── seed.py            # Pre-loaded attack scenarios
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # All React components
│   │   ├── api.js         # API helper functions
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Step 1: Clone / Download the project

Place the `cyberguard` folder anywhere on your computer.

### Step 2: Backend Setup

Open a terminal and run:

```bash
cd cyberguard/backend

# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Edit `backend/.env`:

```
SECRET_KEY=any-random-string-here-make-it-long
ANTHROPIC_API_KEY=your-anthropic-api-key-here
DATABASE_URL=sqlite:///./cyberguard.db
```

- **SECRET_KEY:** Any random string (used for JWT signing)
- **ANTHROPIC_API_KEY:** Get from https://console.anthropic.com — if left blank, only static scenarios will work (the app still functions fine without it)

### Step 4: Start the Backend

```bash
cd cyberguard/backend
python main.py
```

The API server will start at `http://localhost:8000`.
You can verify at `http://localhost:8000/docs` (auto-generated API docs).

### Step 5: Frontend Setup

Open a **new terminal** and run:

```bash
cd cyberguard/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will start at `http://localhost:3000`.

### Step 6: Open the App

Go to `http://localhost:3000` in your browser. Register an account and start training!

## Features

1. **User Authentication** — Register/login with hashed passwords and JWT tokens
2. **AI Scenario Generation** — Claude generates unique, realistic attack emails based on difficulty
3. **Static Fallback** — 6 pre-loaded scenarios work even without an API key
4. **Response Evaluation** — Submit your action and get instant feedback with red flag analysis
5. **Scoring System** — Easy (10pts), Medium (20pts), Hard (35pts)
6. **Leaderboard** — Compete with other users, ranked by score
7. **Performance Analytics** — Track accuracy by difficulty level and attack type
8. **Streak Tracking** — Consecutive correct answers are tracked

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/scenarios/generate` | Generate a new scenario |
| POST | `/api/scenarios/submit` | Submit answer for evaluation |
| GET | `/api/leaderboard` | Get top 20 users |
| GET | `/api/stats` | Get current user's stats |

## Notes

- The database (`cyberguard.db`) is auto-created on first run
- Scenarios are seeded automatically on first startup
- The app works without an Anthropic API key (static scenarios only)
- To reset everything, delete `cyberguard.db` and restart the backend
