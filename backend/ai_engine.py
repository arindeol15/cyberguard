import json
import httpx
import os
import random
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

ATTACK_TYPES = [
    "phishing", "spear-phishing", "BEC (Business Email Compromise)",
    "pretexting", "baiting", "whaling", "smishing",
    "clone-phishing", "angler-phishing", "pharming",
    "vishing-transcript", "watering-hole", "quid-pro-quo",
    "tailgating-setup", "tech-support-scam", "romance-scam",
    "invoice-fraud", "gift-card-scam", "fake-charity",
    "CEO-fraud", "supply-chain-attack", "credential-harvesting"
]

INDUSTRIES = [
    "banking", "healthcare", "e-commerce", "tech company",
    "government agency", "university", "cloud service",
    "social media", "shipping/logistics", "cryptocurrency",
    "streaming service", "airline", "insurance", "real estate",
    "telecom provider", "food delivery", "ride-sharing",
    "online gaming", "fitness app", "news subscription"
]

THEMES = [
    "password reset", "package delivery", "invoice payment",
    "account verification", "job offer", "tax refund",
    "file share", "meeting invitation", "security alert",
    "subscription renewal", "reward claim", "document signing",
    "voicemail notification", "legal notice", "survey request",
    "prize winner", "shared photo album", "calendar sync",
    "overdue bill", "shipping confirmation", "password breach alert",
    "2FA code request", "cryptocurrency opportunity", "charity donation"
]


async def generate_ai_scenario(difficulty: str, used_types: list[str] = [], used_subjects: list[str] = []) -> dict | None:
    """Call Claude API to generate a new attack scenario with unique action options."""

    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
        return None

    chosen_industry = random.choice(INDUSTRIES)
    chosen_theme = random.choice(THEMES)
    available_types = [t for t in ATTACK_TYPES if t not in used_types[-5:]]
    if not available_types:
        available_types = ATTACK_TYPES

    seed = random.randint(1000, 9999)

    prompt = f"""You are creating a unique cybersecurity training scenario #{seed}.

Generate a {difficulty}-difficulty social engineering attack email with CUSTOM action options.

REQUIRED VARIETY:
- Industry context: {chosen_industry}
- Theme/pretext: {chosen_theme}
- Attack type: pick an interesting one from: {', '.join(available_types)}

AVOID THESE previously-used patterns:
- Types recently used: {', '.join(used_types[-5:]) if used_types else 'none'}
- Subjects recently used: {' | '.join(used_subjects[-5:]) if used_subjects else 'none'}

Respond with ONLY a JSON object (no markdown, no backticks):
{{
  "type": "specific_attack_type",
  "from": "fake@spoofed-domain.com",
  "sender": "Display Name",
  "subject": "Unique specific subject line",
  "body": "Full realistic email body (150+ words with specific details like names, amounts, dates, reference numbers, realistic scenarios)",
  "options": [
    {{"id": "opt1", "label": "Short action label", "desc": "One-line description"}},
    {{"id": "opt2", "label": "Short action label", "desc": "One-line description"}},
    {{"id": "opt3", "label": "Short action label", "desc": "One-line description"}},
    {{"id": "opt4", "label": "Short action label", "desc": "One-line description"}}
  ],
  "correct_id": "opt1",
  "flags": ["specific red flag 1", "specific red flag 2", "specific red flag 3", "specific red flag 4"]
}}

DIFFICULTY RULES:
- Easy: Obvious typos, clearly fake domains (like g00gle.com), generic greetings, absurd urgency
- Medium: Convincing look with 3-4 detectable issues — slightly off domain, minor grammar, missing context, soft pressure
- Hard: Professional language, realistic scenarios, look-alike domains, plausible details, only 1-2 subtle red flags

OPTIONS RULES (VERY IMPORTANT):
- Create 4 REALISTIC, CONTEXT-SPECIFIC action options that match THIS specific email
- For example, if email is about a wire transfer, options might be: "Process the transfer", "Call the CEO directly to confirm", "Forward to accounting team", "Reply asking for more details"
- If email is about package delivery, options might be: "Click link to reschedule", "Check tracking on official FedEx site directly", "Ignore — I didn't order anything", "Reply to sender with correct address"
- ONE option must be the CORRECT secure action (like verifying through a different channel, reporting to IT, or ignoring)
- The OTHER 3 options should be plausible but wrong — they represent what an untrained person might naively do
- Options should be UNIQUE to this scenario — don't reuse generic labels like "Report threat" or "Verify sender" unless they naturally fit
- Labels should be short (3-6 words), descriptions should be clear (under 10 words)
- Mix the correct answer in any position — don't always put it first

SCENARIO RULES:
- Use realistic names, companies, amounts, dates — not placeholders
- Make each scenario feel DIFFERENT from common templates
- The body must feel like a real email someone might receive today
- Include exactly 4 red flags specific to THIS email (not generic advice)
- correct_id must match one of the option ids (opt1, opt2, opt3, or opt4)"""

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 2000,
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
