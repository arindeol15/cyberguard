from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json, random, httpx

from database import init_db, get_db, User, Scenario, Response, ThreatFeed
from auth import hash_password, verify_password, create_access_token, get_current_user
from schemas import (RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    GenerateRequest, SubmitRequest, SubmitResponse, LeaderboardEntry)
from ai_engine import generate_ai_scenario
from seed import seed_database

app = FastAPI(title="CyberGuard API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

POINTS = {"Easy": 10, "Medium": 20, "Hard": 35}
DEFAULT_OPTIONS = [
    {"id": "report", "label": "Report threat", "desc": "Flag as malicious"},
    {"id": "verify", "label": "Verify sender", "desc": "Confirm legitimacy"},
    {"id": "ignore", "label": "Delete it", "desc": "Remove from inbox"},
    {"id": "comply", "label": "Follow instructions", "desc": "Do what it says"},
]

@app.on_event("startup")
def startup():
    init_db()
    seed_database()

# ── AUTH ──
@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.username) < 2: raise HTTPException(400, "Username must be at least 2 characters")
    if len(req.password) < 4: raise HTTPException(400, "Password must be at least 4 characters")
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(400, "Username already taken")
    user = User(username=req.username, hashed_password=hash_password(req.password))
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": user.username})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid username or password")
    token = create_access_token({"sub": user.username})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)

# ── SCENARIOS ──
@app.post("/api/scenarios/generate")
async def generate_scenario(req: GenerateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    difficulty = req.difficulty if req.difficulty in POINTS else "Medium"
    category = req.category if req.category in ["email","website","qr","vishing","usb"] else "email"

    user_responses = db.query(Response).filter(Response.user_id == user.id).all()
    used_ids = [r.scenario_id for r in user_responses]
    used_scenarios = db.query(Scenario).filter(Scenario.id.in_(used_ids)).all() if used_ids else []
    used_types = [s.type for s in used_scenarios]
    used_subjects = [s.subject for s in used_scenarios]

    if req.use_ai:
        ai_result = await generate_ai_scenario(category, difficulty, used_types, used_subjects)
        if ai_result:
            options = ai_result.get("options", DEFAULT_OPTIONS)
            extra = ai_result.get("extra_data", None)
            scenario = Scenario(
                category=category, type=ai_result.get("type", "Phishing"), difficulty=difficulty,
                sender_email=ai_result.get("from"), sender_name=ai_result.get("sender"),
                subject=ai_result.get("subject", "No subject"), body=ai_result.get("body", ""),
                correct_action=ai_result.get("correct_id", "opt1"),
                red_flags=json.dumps(ai_result.get("flags", [])),
                options=json.dumps(options),
                extra_data=json.dumps(extra) if extra else None,
                is_ai_generated=True,
            )
            db.add(scenario); db.commit(); db.refresh(scenario)
            return {"id": scenario.id, "category": category, "type": scenario.type, "difficulty": difficulty,
                "sender_email": scenario.sender_email, "sender_name": scenario.sender_name,
                "subject": scenario.subject, "body": scenario.body, "options": options,
                "extra_data": extra}

    # Static fallback
    unseen = db.query(Scenario).filter(Scenario.category == category, Scenario.difficulty == difficulty,
        Scenario.is_ai_generated == False, ~Scenario.id.in_(used_ids) if used_ids else True).all()
    if not unseen:
        unseen = db.query(Scenario).filter(Scenario.category == category, Scenario.is_ai_generated == False).all()
    if not unseen:
        unseen = db.query(Scenario).filter(Scenario.is_ai_generated == False).all()
    if not unseen:
        raise HTTPException(404, "No scenarios available")

    s = random.choice(unseen)
    opts = json.loads(s.options) if s.options else DEFAULT_OPTIONS
    extra = json.loads(s.extra_data) if s.extra_data else None
    return {"id": s.id, "category": s.category, "type": s.type, "difficulty": s.difficulty,
        "sender_email": s.sender_email, "sender_name": s.sender_name,
        "subject": s.subject, "body": s.body, "options": opts, "extra_data": extra}

@app.post("/api/scenarios/submit", response_model=SubmitResponse)
def submit_response(req: SubmitRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scenario = db.query(Scenario).filter(Scenario.id == req.scenario_id).first()
    if not scenario: raise HTTPException(404, "Scenario not found")
    is_correct = req.action == scenario.correct_action
    points = POINTS.get(scenario.difficulty, 10) if is_correct else 0
    response = Response(user_id=user.id, scenario_id=scenario.id, action=req.action,
        is_correct=is_correct, points_earned=points, time_taken=req.time_taken)
    db.add(response)
    user.total_scenarios += 1; user.score += points
    if is_correct: user.correct_answers += 1; user.streak += 1
    else: user.streak = 0
    db.commit(); db.refresh(user)
    return SubmitResponse(correct=is_correct, correct_action=scenario.correct_action,
        red_flags=json.loads(scenario.red_flags), points_earned=points,
        new_score=user.score, new_streak=user.streak)

# ── LEADERBOARD ──
@app.get("/api/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.total_scenarios > 0).order_by(User.score.desc()).limit(20).all()
    return [LeaderboardEntry(rank=i+1, username=u.username, score=u.score,
        total_scenarios=u.total_scenarios, correct_answers=u.correct_answers,
        accuracy=round((u.correct_answers/u.total_scenarios)*100) if u.total_scenarios > 0 else 0)
        for i, u in enumerate(users)]

# ── STATS ──
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    responses = db.query(Response, Scenario).join(Scenario).filter(Response.user_id == user.id).all()
    by_difficulty, by_type, by_category = {}, {}, {}
    for resp, scen in responses:
        for key, bucket in [(scen.difficulty, by_difficulty), (scen.type, by_type), (scen.category, by_category)]:
            if key not in bucket: bucket[key] = {"total": 0, "correct": 0}
            bucket[key]["total"] += 1
            if resp.is_correct: bucket[key]["correct"] += 1
    return {"score": user.score, "total": user.total_scenarios, "correct": user.correct_answers,
        "streak": user.streak, "accuracy": round((user.correct_answers/user.total_scenarios)*100) if user.total_scenarios > 0 else 0,
        "by_difficulty": by_difficulty, "by_type": by_type, "by_category": by_category}

# ── THREAT INTELLIGENCE ──
@app.get("/api/threats")
async def get_threat_feed(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    threats = db.query(ThreatFeed).order_by(ThreatFeed.fetched_at.desc()).limit(20).all()
    if len(threats) < 5:
        # Generate some threat intel using AI if we don't have enough
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                import os
                api_key = os.getenv("ANTHROPIC_API_KEY", "")
                if api_key and api_key != "your-anthropic-api-key-here":
                    resp = await client.post("https://api.anthropic.com/v1/messages",
                        headers={"Content-Type":"application/json","x-api-key":api_key,"anthropic-version":"2023-06-01"},
                        json={"model":"claude-sonnet-4-20250514","max_tokens":1500,
                            "messages":[{"role":"user","content":"Generate 8 realistic recent cybersecurity threat alerts as JSON array. Each: {\"title\":\"...\",\"severity\":\"Critical|High|Medium|Low\",\"category\":\"Phishing|Ransomware|Data Breach|Vulnerability|Malware|Social Engineering\",\"summary\":\"1-2 sentence description\",\"source\":\"news source name\"}. Make them sound like real recent threats. JSON only, no markdown."}]})
                    data = resp.json()
                    text = "".join(b["text"] for b in data.get("content",[]) if b.get("type")=="text")
                    items = json.loads(text.replace("```json","").replace("```","").strip())
                    for item in items:
                        t = ThreatFeed(title=item["title"], severity=item.get("severity","Medium"),
                            category=item.get("category",""), summary=item.get("summary",""),
                            source=item.get("source",""))
                        db.add(t)
                    db.commit()
                    threats = db.query(ThreatFeed).order_by(ThreatFeed.fetched_at.desc()).limit(20).all()
        except Exception as e:
            print(f"Threat feed generation failed: {e}")

    return [{"id":t.id,"title":t.title,"severity":t.severity,"category":t.category,
        "summary":t.summary,"source":t.source,"published_at":t.published_at} for t in threats]

if __name__ == "__main__":
    import uvicorn, os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
