from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import random

from database import init_db, get_db, User, Scenario, Response
from auth import hash_password, verify_password, create_access_token, get_current_user
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    GenerateRequest, ScenarioResponse, SubmitRequest, SubmitResponse,
    LeaderboardEntry,
)
from ai_engine import generate_ai_scenario
from seed import seed_database

app = FastAPI(title="CyberGuard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

POINTS = {"Easy": 10, "Medium": 20, "Hard": 35}


@app.on_event("startup")
def startup():
    init_db()
    seed_database()


# ────────────────────────────────────────────
# AUTH ROUTES
# ────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.username) < 2:
        raise HTTPException(400, "Username must be at least 2 characters")
    if len(req.password) < 4:
        raise HTTPException(400, "Password must be at least 4 characters")

    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(400, "Username already taken")

    user = User(username=req.username, hashed_password=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.username})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid username or password")

    token = create_access_token({"sub": user.username})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


# ────────────────────────────────────────────
# SCENARIO ROUTES
# ────────────────────────────────────────────

@app.post("/api/scenarios/generate", response_model=ScenarioResponse)
async def generate_scenario(
    req: GenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    difficulty = req.difficulty if req.difficulty in POINTS else "Medium"

    # Get previously used types for this user
    user_responses = db.query(Response).filter(Response.user_id == user.id).all()
    used_scenario_ids = [r.scenario_id for r in user_responses]
    used_scenarios = db.query(Scenario).filter(Scenario.id.in_(used_scenario_ids)).all() if used_scenario_ids else []
    used_types = [s.type for s in used_scenarios]

    # Try AI generation first
    ai_result = await generate_ai_scenario(difficulty, used_types)

    if ai_result:
        scenario = Scenario(
            type=ai_result.get("type", "Phishing"),
            difficulty=difficulty,
            sender_email=ai_result.get("from", "unknown@fake.com"),
            sender_name=ai_result.get("sender", "Unknown"),
            subject=ai_result.get("subject", "No subject"),
            body=ai_result.get("body", ""),
            correct_action=ai_result.get("answer", "report"),
            red_flags=json.dumps(ai_result.get("flags", [])),
            is_ai_generated=True,
        )
        db.add(scenario)
        db.commit()
        db.refresh(scenario)
        return ScenarioResponse.model_validate(scenario)

    # Fallback: pick a static scenario the user hasn't seen
    unseen = (
        db.query(Scenario)
        .filter(Scenario.difficulty == difficulty)
        .filter(~Scenario.id.in_(used_scenario_ids) if used_scenario_ids else True)
        .all()
    )
    if not unseen:
        unseen = db.query(Scenario).filter(Scenario.difficulty == difficulty).all()
    if not unseen:
        unseen = db.query(Scenario).all()

    scenario = random.choice(unseen)
    return ScenarioResponse.model_validate(scenario)


@app.post("/api/scenarios/submit", response_model=SubmitResponse)
def submit_response(
    req: SubmitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    scenario = db.query(Scenario).filter(Scenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(404, "Scenario not found")

    is_correct = req.action == scenario.correct_action
    points = POINTS.get(scenario.difficulty, 10) if is_correct else 0

    # Save response
    response = Response(
        user_id=user.id,
        scenario_id=scenario.id,
        action=req.action,
        is_correct=is_correct,
        points_earned=points,
        time_taken=req.time_taken,
    )
    db.add(response)

    # Update user stats
    user.total_scenarios += 1
    user.score += points
    if is_correct:
        user.correct_answers += 1
        user.streak += 1
    else:
        user.streak = 0

    db.commit()
    db.refresh(user)

    return SubmitResponse(
        correct=is_correct,
        correct_action=scenario.correct_action,
        red_flags=json.loads(scenario.red_flags),
        points_earned=points,
        new_score=user.score,
        new_streak=user.streak,
    )


# ────────────────────────────────────────────
# LEADERBOARD
# ────────────────────────────────────────────

@app.get("/api/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .filter(User.total_scenarios > 0)
        .order_by(User.score.desc())
        .limit(20)
        .all()
    )
    return [
        LeaderboardEntry(
            rank=i + 1,
            username=u.username,
            score=u.score,
            total_scenarios=u.total_scenarios,
            correct_answers=u.correct_answers,
            accuracy=round((u.correct_answers / u.total_scenarios) * 100) if u.total_scenarios > 0 else 0,
        )
        for i, u in enumerate(users)
    ]


# ────────────────────────────────────────────
# STATS
# ────────────────────────────────────────────

@app.get("/api/stats")
def get_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    responses = (
        db.query(Response, Scenario)
        .join(Scenario, Response.scenario_id == Scenario.id)
        .filter(Response.user_id == user.id)
        .all()
    )

    by_difficulty = {}
    by_type = {}
    for resp, scen in responses:
        # By difficulty
        if scen.difficulty not in by_difficulty:
            by_difficulty[scen.difficulty] = {"total": 0, "correct": 0}
        by_difficulty[scen.difficulty]["total"] += 1
        if resp.is_correct:
            by_difficulty[scen.difficulty]["correct"] += 1

        # By type
        if scen.type not in by_type:
            by_type[scen.type] = {"total": 0, "correct": 0}
        by_type[scen.type]["total"] += 1
        if resp.is_correct:
            by_type[scen.type]["correct"] += 1

    return {
        "score": user.score,
        "total": user.total_scenarios,
        "correct": user.correct_answers,
        "streak": user.streak,
        "accuracy": round((user.correct_answers / user.total_scenarios) * 100) if user.total_scenarios > 0 else 0,
        "by_difficulty": by_difficulty,
        "by_type": by_type,
    }


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
