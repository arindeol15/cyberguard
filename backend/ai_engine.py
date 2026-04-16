import json
import httpx
import os
import random
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

ATTACK_TYPES = [
    "phishing", "spear-phishing", "BEC", "pretexting",
    "baiting", "whaling", "smishing", "clone-phishing",
    "angler-phishing", "pharming", "vishing-transcript"
]

INDUSTRIES = [
    "banking", "healthcare", "e-commerce", "tech company",
    "government agency", "university", "cloud service",
    "social media", "shipping/logistics", "cryptocurrency",
    "streaming service", "airline", "insurance"
]

THEMES = [
    "password reset", "package delivery", "invoice payment",
    "account verification", "job offer", "tax refund",
    "file share", "meeting invitation", "security alert",
    "subscription renewal", "reward claim", "document signing",
    "voicemail notification", "legal notice", "survey request"
]


async def generate_ai_scenario(difficulty: str, used_types: list[str] = [], used_subjects: list[str] = []) -> dict | None:
    """Call Claude API to generate a new attack scenario."""

    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
        return None

    chosen_industry = random.choice(INDUSTRIES)
    chosen_theme = random.choice(THEMES)
    available_types = [t for t in ATTACK_TYPES if t not in used_types[-3:]]
    if not available_types:
        available_types = ATTACK_TYPES

    seed = random.randint(1000, 9999)

    prompt = f"""You are creating a unique cybersecurity training scenario #{seed}.

Generate a {difficulty}-difficulty social engineering attack email.

REQUIRED VARIETY (follow these to ensure uniqueness):
- Industry context: {chosen_industry}
- Theme/pretext: {chosen_theme}
- Attack type: choose from {', '.join(available_types)}

AVOID THESE previously-used patterns:
- Types recently used: {', '.join(used_types[-5:]) if used_types else 'none'}
- Subjects recently used: {' | '.join(used_subjects[-5:]) if used_subjects else 'none'}

Respond with ONLY a JSON object, no markdown or backticks:
{{"type":"specific_attack_type","from":"fake@spoofed-domain.com","sender":"Display Name","subject":"Unique subject line","body":"Full realistic email body (150+ words with specific details like names, amounts, dates, reference numbers)","answer":"report|verify|ignore","flags":["specific red flag 1","specific red flag 2","specific red flag 3","specific red flag 4"]}}

DIFFICULTY RULES:
- Easy: Obvious typos, clearly fake domains (like g00gle.com), generic "Dear Customer" greetings, absurd urgency
- Medium: Convincing look but has 3-4 detectable issues — slightly off domain, minor grammar, missing context, soft pressure
- Hard: Professional language, realistic scenarios, domains that LOOK real (like company-portal.com vs company.com), specific plausible details, only 1-2 subtle red flags

CRITICAL RULES:
- Make this scenario COMPLETELY DIFFERENT from common templates. Be creative with the attack angle.
- Use realistic-sounding names, companies, amounts, and dates — not generic placeholders
- answer must be "report" for clear phishing/malicious content, "verify" for suspicious but requires confirmation, "ignore" for low-threat spam
- NEVER use "comply" as the correct answer
- Include EXACTLY 4 red flags, each specific to THIS email (not generic)
- The body should feel like a real email someone might receive today"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1500,
                    "temperature": 1.0,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            data = response.json()
            text = "".join(
                block["text"] for block in data.get("content", []) if block.get("type") == "text"
            )
            clean = text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
    except Exception as e:
        print(f"AI generation failed: {e}")
        return None
