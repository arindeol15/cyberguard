from pydantic import BaseModel
from typing import Optional


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

class UserResponse(BaseModel):
    id: int
    username: str
    score: int
    total_scenarios: int
    correct_answers: int
    streak: int
    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    difficulty: str = "Medium"
    use_ai: bool = True
    category: str = "email"  # email, website, qr, vishing, usb

class ActionOption(BaseModel):
    id: str
    label: str
    desc: str

class ScenarioResponse(BaseModel):
    id: int
    category: str
    type: str
    difficulty: str
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    subject: str
    body: str
    options: list[ActionOption] = []
    extra_data: Optional[dict] = None
    class Config:
        from_attributes = True

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

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    score: int
    total_scenarios: int
    correct_answers: int
    accuracy: int
    class Config:
        from_attributes = True
