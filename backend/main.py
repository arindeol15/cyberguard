from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
import json, os, random, httpx

from database import init_db, get_db, User, Scenario, Response, ThreatFeed
from auth import hash_password, verify_password, create_access_token, get_current_user
from schemas import (RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    GenerateRequest, SubmitRequest, SubmitResponse, LeaderboardEntry)
from ai_engine import generate_ai_scenario, get_ai_status
from seed import seed_database
from scenarios_seed import ALL_SCENARIOS

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
CORS_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
if APP_ENV == "production" and not CORS_ORIGINS:
    raise RuntimeError("CORS_ORIGINS must list the deployed frontend URL in production.")
if not CORS_ORIGINS:
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

app = FastAPI(title="CyberGuard API", version="2.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

POINTS = {"Easy": 10, "Medium": 20, "Hard": 35}
DEFAULT_OPTIONS = [
    {"id": "report", "label": "Report threat", "desc": "Flag as malicious"},
    {"id": "verify", "label": "Verify sender", "desc": "Confirm legitimacy"},
    {"id": "ignore", "label": "Delete it", "desc": "Remove from inbox"},
    {"id": "comply", "label": "Follow instructions", "desc": "Do what it says"},
]
CATEGORY_IDS = [
    "email", "website", "qr", "vishing", "usb",
    "chat", "attachment", "browser_exploit", "mfa", "cloud",
    "insider", "wifi", "dns", "deepfake", "attack_chain",
    "smishing", "bec", "supply_chain",
]

# ── EXPANDED SEED ADAPTER ──
# Maps scenarios_seed.py (generic schema) to your DB schema.
# Your CATEGORY_IDS are short ("email"); seed file uses long ("email_phishing"). Map here.
SEED_CATEGORY_MAP = {
    "email_phishing": "email",
    "fake_website": "website",
    "qr_attack": "qr",
    "vishing": "vishing",
    "usb_drop": "usb",
    "internal_chat": "chat",
    "attachment_sandbox": "attachment",
    "browser_exploit": "browser_exploit",
    "mfa_fatigue": "mfa",
    "cloud_breach": "cloud",
    "insider_threat": "insider",
    "rogue_wifi": "wifi",
    "dns_spoofing": "dns",
    "ai_scam": "deepfake",
    "attack_chain": "attack_chain",
}

# Your DB uses Easy/Medium/Hard. Seed uses 4 levels. Map down to 3.
SEED_DIFFICULTY_MAP = {
    "beginner": "Easy",
    "intermediate": "Easy",
    "advanced": "Medium",
    "expert": "Hard",
}

def _seed_to_db_options(option_strings, correct_action_key):
    """Seed has options as a list of strings, e.g. ['Click link', 'Report as phishing', ...]
    and `correct_action_key` is a SEMANTIC key ('report'/'ignore'/'verify'/'comply') describing
    the kind of correct action.

    Your DB stores options as [{"id":"report","label":"...","desc":"..."}, ...] where the
    `id` field is what gets compared against `Scenario.correct_action` at grading time.

    Strategy: pick the BEST option from option_strings as the correct one (per safety
    keywords), give it id=correct_action_key, then assign the OTHER options unique placeholder
    ids that will never accidentally match. Then shuffle_options() randomizes positions
    at request time."""

    def safety_score(s):
        """Higher score = safer / more likely to be the correct action.
        Tuned for the wording used across the 126 seed scenarios."""
        s_low = s.lower()
        score = 0
        positive_phrases = {
            "both:": 14,
            "delete and report": 14,
            "report": 12,
            "verify": 10,
            "hang up": 10,
            "known number": 9,
            "known channel": 9,
            "call bank back": 9,
            "call back": 8,
            "out-of-band": 8,
            "factory reset": 8,
            "official": 8,
            "directly": 8,
            "security": 8,
            "block": 7,
            "refuse": 7,
            "deny": 7,
            "walk away": 7,
            "alert": 7,
            "revoke": 7,
            "rotate": 7,
            "preserve": 7,
            "quarantine": 7,
            "sandbox": 7,
            "isolate": 7,
            "hand to it": 7,
            "hand to security": 7,
            "collect all": 6,
            "change password": 6,
            "disable auto": 6,
            "forget": 6,
            "mobile data": 6,
            "mobile hotspot": 6,
            "cellular": 6,
            "vpn": 6,
            "kill switch": 6,
            "dnssec": 6,
            "doh": 6,
            "rpki": 6,
            "registry lock": 6,
            "fido2": 6,
            "sign out": 6,
            "close the tab": 6,
            "task manager": 5,
            "antivirus scan": 5,
            "run your own av": 5,
            "paper menu": 5,
            "ask staff": 5,
            "ask reception": 5,
            "linkedin manually": 5,
            "manually": 5,
            "data-blocker": 5,
            "ublock": 5,
            "minimal reproducer": 5,
            "team lead": 5,
            "audit": 5,
            "private": 5,
            "ignore": 2,
        }
        negative_phrases = {
            "call the number": -18,
            "continue": -14,
            "click": -12,
            "enter credentials": -12,
            "enter work credentials": -12,
            "enter password": -12,
            "enter card": -12,
            "enter code": -12,
            "install": -11,
            "plug in": -11,
            "plug into": -11,
            "approve": -11,
            "wire money": -11,
            "buy": -11,
            "gift card": -11,
            "share password": -11,
            "share credentials": -11,
            "share env": -11,
            "share token": -11,
            "send code": -10,
            "send password": -10,
            "send config": -10,
            "pay ": -10,
            "open the attachment": -10,
            "open the pdf": -10,
            "open the doc": -10,
            "open the file": -10,
            "open the link": -10,
            "open the qr": -10,
            "open the tracking": -10,
            "authorize": -9,
            "allow ": -9,
            "scan the": -9,
            "scan to": -9,
            "provide info": -9,
            "fill out": -9,
            "reply with": -9,
            "trust": -8,
            "leave it": -8,
            "leave them": -8,
            "ignore —": -8,
            "ignore -": -8,
            "ignore and dismiss": -8,
            "mute the app": -8,
            "restart the phone": -7,
            "restart the computer": -7,
            "wait for": -7,
            "sign in": -7,
            "log in": -7,
            "login": -7,
            "force-push": -6,
            "force push": -6,
        }

        for phrase, weight in positive_phrases.items():
            if phrase in s_low:
                score += weight
        for phrase, weight in negative_phrases.items():
            if phrase in s_low:
                score += weight

        # Direct navigation to the real service is safe, unlike credential entry
        # on a linked page. Give it back the points removed by generic login terms.
        if "directly" in s_low or "official" in s_low or "known" in s_low:
            if "sign in" in s_low or "log in" in s_low or "login" in s_low:
                score += 7
        if "limited scopes" in s_low or "marketplace" in s_low:
            score += 3

        return score

    # Find correct option = highest-scoring one
    correct_index = max(range(len(option_strings)), key=lambda i: safety_score(option_strings[i]))

    # Assign IDs: correct one gets the semantic key; others get placeholder unique ids
    keyed = []
    placeholder_counter = 1
    for i, s in enumerate(option_strings):
        if i == correct_index:
            kid = correct_action_key
        else:
            kid = f"opt_alt_{placeholder_counter}"
            placeholder_counter += 1
        keyed.append({"id": kid, "label": s, "desc": ""})

    return keyed, keyed[correct_index]["id"]


def seed_expanded_scenarios():
    """Load 126 expanded scenarios into the DB, mapping to your existing schema.
    Idempotent — re-running skips already-seeded entries."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        seeded = 0
        skipped = 0
        for s in ALL_SCENARIOS:
            db_category = SEED_CATEGORY_MAP.get(s["category"])
            if not db_category:
                continue
            db_difficulty = SEED_DIFFICULTY_MAP.get(s["difficulty"], "Medium")

            # Dedup by (subject, category) — same check as your existing seed
            existing = db.query(Scenario).filter(
                Scenario.subject == s["subject"],
                Scenario.category == db_category,
            ).first()
            if existing:
                skipped += 1
                continue

            options_keyed, correct_id = _seed_to_db_options(s["options"], s["correct_action"])

            scenario = Scenario(
                category=db_category,
                type=s["type"],
                difficulty=db_difficulty,
                sender_email=s["sender_email"],
                sender_name=s["sender_name"],
                subject=s["subject"],
                body=s["body"],
                correct_action=correct_id,
                red_flags=json.dumps([s["red_flags"]]),  # your schema: JSON-encoded list
                options=json.dumps(options_keyed),       # your schema: JSON-encoded string
                extra_data=json.dumps(s["extra_data"]) if s.get("extra_data") else None,
                is_ai_generated=False,
            )
            db.add(scenario)
            seeded += 1

        db.commit()
        print(f"[expanded-seed] Added {seeded} new scenarios, skipped {skipped} already in DB")
    except Exception as e:
        db.rollback()
        print(f"[expanded-seed] FAILED: {e}")
    finally:
        db.close()


def shuffle_options(options, correct_action):
    """Shuffle option positions and remap IDs so correct answer is at a random position every time."""
    if not options or len(options) < 2:
        return options, correct_action

    # Find the correct option's content
    correct_opt = None
    for opt in options:
        if opt["id"] == correct_action:
            correct_opt = opt
            break
    if not correct_opt:
        return options, correct_action

    # Shuffle the options
    shuffled = list(options)
    random.shuffle(shuffled)

    # Reassign IDs (opt1, opt2, opt3, opt4) based on new positions
    new_correct = correct_action
    for i, opt in enumerate(shuffled):
        new_id = f"opt{i+1}"
        if opt["label"] == correct_opt["label"] and opt["desc"] == correct_opt["desc"]:
            new_correct = new_id
        shuffled[i] = {"id": new_id, "label": opt["label"], "desc": opt["desc"]}

    return shuffled, new_correct

@app.on_event("startup")
def startup():
    init_db()
    seed_database()
    seed_expanded_scenarios()

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
    category = req.category if req.category in CATEGORY_IDS else "email"

    user_responses = db.query(Response).filter(Response.user_id == user.id).all()
    used_ids = [r.scenario_id for r in user_responses]
    used_scenarios = db.query(Scenario).filter(Scenario.id.in_(used_ids)).all() if used_ids else []
    used_types = [s.type for s in used_scenarios]
    used_subjects = [s.subject for s in used_scenarios]

    def persist_generated_scenario(ai_result):
        options = ai_result.get("options", DEFAULT_OPTIONS)
        correct_id = ai_result.get("correct_id", "opt1")
        options, correct_id = shuffle_options(options, correct_id)
        extra = ai_result.get("extra_data", None)
        scenario = Scenario(
            category=category, type=ai_result.get("type", "Phishing"), difficulty=difficulty,
            sender_email=ai_result.get("from"), sender_name=ai_result.get("sender"),
            subject=ai_result.get("subject", "No subject"), body=ai_result.get("body", ""),
            correct_action=correct_id,
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

    if req.use_ai:
        ai_result = await generate_ai_scenario(category, difficulty, used_types, used_subjects)
        if ai_result:
            return persist_generated_scenario(ai_result)

    # Static fallback
    unseen = db.query(Scenario).filter(Scenario.category == category, Scenario.difficulty == difficulty,
        Scenario.is_ai_generated == False, ~Scenario.id.in_(used_ids) if used_ids else True).all()
    if not unseen:
        unseen = db.query(Scenario).filter(Scenario.category == category, Scenario.is_ai_generated == False).all()
    if not unseen:
        ai_result = await generate_ai_scenario(category, difficulty, used_types, used_subjects)
        if ai_result:
            return persist_generated_scenario(ai_result)
        unseen = db.query(Scenario).filter(Scenario.is_ai_generated == False).all()
    if not unseen:
        raise HTTPException(404, "No scenarios available")

    s = random.choice(unseen)
    opts = json.loads(s.options) if s.options else DEFAULT_OPTIONS
    correct = s.correct_action
    # Shuffle options and remap correct answer
    opts, correct = shuffle_options(opts, correct)
    extra = json.loads(s.extra_data) if s.extra_data else None

    # Create a new scenario record with shuffled options so correct_action matches
    shuffled_scenario = Scenario(
        category=s.category, type=s.type, difficulty=s.difficulty,
        sender_email=s.sender_email, sender_name=s.sender_name,
        subject=s.subject, body=s.body,
        correct_action=correct,
        red_flags=s.red_flags,
        options=json.dumps(opts),
        extra_data=s.extra_data,
        is_ai_generated=False,
    )
    db.add(shuffled_scenario); db.commit(); db.refresh(shuffled_scenario)

    return {"id": shuffled_scenario.id, "category": s.category, "type": s.type, "difficulty": s.difficulty,
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

# ── SCENARIO STATS (debug / verification) ──
@app.get("/api/scenarios/stats")
def scenarios_stats(db: Session = Depends(get_db)):
    """Returns count of scenarios per category and difficulty.
    Use this after deploy to verify the expanded seed loaded properly."""
    rows = (
        db.query(Scenario.category, Scenario.difficulty, func.count(Scenario.id))
        .filter(Scenario.is_ai_generated == False)
        .group_by(Scenario.category, Scenario.difficulty)
        .all()
    )
    result = {}
    for category, difficulty, count in rows:
        result.setdefault(category, {})[difficulty] = count
    result["_total_static"] = db.query(Scenario).filter(Scenario.is_ai_generated == False).count()
    result["_total_all"] = db.query(Scenario).count()
    return result

# ── LEADERBOARD ──
@app.get("/api/ai/status")
def ai_status():
    """Safe AI provider diagnostics. Does not expose the API key."""
    return get_ai_status()

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
THREAT_CACHE_HOURS = 6
THREAT_MAX_AGE_DAYS = 120


def _parse_threat_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        try:
            return datetime.strptime(str(value)[:10], "%Y-%m-%d")
        except ValueError:
            return None


def _recent_cached_threats(db):
    cutoff = datetime.utcnow() - timedelta(days=THREAT_MAX_AGE_DAYS)
    cached = db.query(ThreatFeed).order_by(ThreatFeed.fetched_at.desc()).limit(80).all()
    recent = [
        threat for threat in cached
        if _parse_threat_date(threat.published_at)
        and _parse_threat_date(threat.published_at) >= cutoff
    ]
    return sorted(recent, key=lambda threat: threat.published_at or "", reverse=True)[:20]


def _cache_is_fresh(threats):
    if len(threats) < 5:
        return False
    newest_fetch = max((threat.fetched_at for threat in threats if threat.fetched_at), default=None)
    return bool(newest_fetch and newest_fetch >= datetime.utcnow() - timedelta(hours=THREAT_CACHE_HOURS))


def _nvd_score(metrics):
    for metric_name in ("cvssMetricV40", "cvssMetricV31", "cvssMetricV30"):
        for metric in metrics.get(metric_name, []):
            score = metric.get("cvssData", {}).get("baseScore")
            if score is not None:
                return float(score)
    return None


async def _fetch_current_threats():
    fresh = []
    seen_titles = set()
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            cisa_resp = await client.get(
                "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
            )
            cisa_resp.raise_for_status()
            cisa_data = cisa_resp.json()
            vulns = sorted(
                cisa_data.get("vulnerabilities", []),
                key=lambda vuln: vuln.get("dateAdded", ""),
                reverse=True,
            )[:8]
            for vuln in vulns:
                title = f"{vuln.get('cveID', '')}: {vuln.get('vulnerabilityName', '')}".strip(": ")
                if not title or title in seen_titles:
                    continue
                seen_titles.add(title)
                fresh.append({
                    "title": title,
                    "severity": "Critical",
                    "category": "Known Exploited Vulnerability",
                    "summary": vuln.get("shortDescription", "")[:300],
                    "source": "CISA KEV",
                    "published_at": vuln.get("dateAdded", ""),
                })
        except Exception as e:
            print(f"CISA fetch failed: {e}")

        try:
            now = datetime.now(timezone.utc)
            start = now - timedelta(days=30)
            nvd_resp = await client.get(
                "https://services.nvd.nist.gov/rest/json/cves/2.0",
                params={
                    "pubStartDate": start.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                    "pubEndDate": now.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                    "resultsPerPage": 20,
                },
            )
            nvd_resp.raise_for_status()
            nvd_data = nvd_resp.json()
            nvd_count = 0
            for item in nvd_data.get("vulnerabilities", []):
                cve = item.get("cve", {})
                title = cve.get("id", "")
                score = _nvd_score(cve.get("metrics", {}))
                if not title or title in seen_titles or score is None or score < 7:
                    continue
                descriptions = cve.get("descriptions", [])
                description = next((d["value"] for d in descriptions if d.get("lang") == "en"), "")
                seen_titles.add(title)
                fresh.append({
                    "title": title,
                    "severity": "Critical" if score >= 9 else "High",
                    "category": "Recent CVE",
                    "summary": description[:300] if description else "No description available",
                    "source": "NVD",
                    "published_at": cve.get("published", "")[:10],
                })
                nvd_count += 1
                if nvd_count >= 7:
                    break
        except Exception as e:
            print(f"NVD fetch failed: {e}")
    return fresh


@app.get("/api/threats")
async def get_threat_feed(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    threats = _recent_cached_threats(db)
    if not _cache_is_fresh(threats):
        try:
            fresh = await _fetch_current_threats()
            if fresh:
                db.query(ThreatFeed).delete()
                for item in fresh:
                    db.add(ThreatFeed(**item))
                db.commit()
                threats = _recent_cached_threats(db)
        except Exception as e:
            db.rollback()
            print(f"Threat feed failed: {e}")

    return [{"id":t.id,"title":t.title,"severity":t.severity,"category":t.category,
        "summary":t.summary,"source":t.source,"published_at":t.published_at} for t in threats]

if __name__ == "__main__":
    import uvicorn, os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
