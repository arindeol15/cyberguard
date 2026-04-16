from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ── Auth ──
class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ── User ──
class UserResponse(BaseModel):
    id: int
    username: str
    score: int
    total_scenarios: int
    correct_answers: int
    streak: int

    class Config:
        from_attributes = True


# ── Scenario ──
class GenerateRequest(BaseModel):
    difficulty: str = "Medium"
    use_ai: bool = True


class ActionOption(BaseModel):
    id: str
    label: str
    desc: str


class ScenarioResponse(BaseModel):
    id: int
    type: str
    difficulty: str
    sender_email: str
    sender_name: str
    subject: str
    body: str
    options: list[ActionOption] = []

    class Config:
        from_attributes = True


class ScenarioWithAnswer(ScenarioResponse):
    correct_action: str
    red_flags: list[str]


# ── Response ──
class SubmitRequest(BaseModel):
    scenario_id: int
    action: str
    time_taken: Optional[float] = None


class SubmitResponse(BaseModel):
    correct: bool
    correct_action: str
    red_flags: list[str]
    points_earned: int
    new_score: int
    new_streak: int


# ── Leaderboard ──
class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    score: int
    total_scenarios: int
    correct_answers: int
    accuracy: int

    class Config:
        from_attributes = True
