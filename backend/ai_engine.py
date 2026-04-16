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
    "tech-support-scam", "romance-scam",
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

# Different "correct action" archetypes - rotate these so the answer isn't always the same
CORRECT_ACTION_ARCHETYPES = [
    {
        "type": "verify_via_different_channel",
        "description": "The correct answer is to verify through a DIFFERENT trusted channel (phone call, visit official website directly, ask colleague in person)",
        "example": "Call the sender on their known office number to confirm the request"
    },
    {
        "type": "report_to_it_security",
        "description": "The correct answer is to REPORT this to IT/security team",
        "example": "Forward to security@company.com for analysis"
    },
    {
        "type": "delete_without_interacting",
        "description": "The correct answer is to DELETE/IGNORE without clicking anything (for obvious low-threat spam)",
        "example": "Delete the email and block the sender"
    },
    {
        "type": "manually_navigate",
        "description": "The correct answer is to MANUALLY go to the official website yourself (not click any link)",
        "example": "Open the company's official website directly and log in from there"
    },
    {
        "type": "check_with_authority",
        "description": "The correct answer is to CHECK with a manager or authorized person first",
        "example": "Confirm with your manager before taking any action"
    },
    {
        "type": "refuse_and_document",
        "description": "The correct answer is to REFUSE and document the incident",
        "example": "Do not reply, screenshot the email, and report it to IT"
    },
]


async def generate_ai_scenario(difficulty: str, used_types: list[str] = [], used_subjects: list[str] = []) -> dict | None:
    """Call Claude API to generate a new attack scenario with unique action options and varied correct answers."""

    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
        return None

    chosen_industry = random.choice(INDUSTRIES)
    chosen_theme = random.choice(THEMES)
    available_types = [t for t in ATTACK_TYPES if t not in used_types[-5:]]
    if not available_types:
        available_types = ATTACK_TYPES

    # Randomly pick an archetype for what the CORRECT action should look like
    archetype = random.choice(CORRECT_ACTION_ARCHETYPES)

    # Randomly pick where the correct option should appear (opt1, opt2, opt3, or opt4)
    correct_position = random.choice(["opt1", "opt2", "opt3", "opt4"])

    seed = random.randint(10000, 99999)

    prompt = f"""You are creating cybersecurity training scenario #{seed}. Be extremely creative and unique.

Generate a {difficulty}-difficulty social engineering attack email with 4 custom action options.

MANDATORY CHOICES (must use):
- Industry: {chosen_industry}
- Theme: {chosen_theme}
- Attack type (pick one): {', '.join(available_types[:8])}

DO NOT REPEAT these patterns recently used:
- Recent types: {', '.join(used_types[-5:]) if used_types else 'none'}
- Recent subjects: {' | '.join(used_subjects[-5:]) if used_subjects else 'none'}

CORRECT ANSWER REQUIREMENTS (CRITICAL):
- The correct action for this scenario must be: {archetype['description']}
- Example of this type of answer: "{archetype['example']}"
- Do NOT make the correct answer a generic "report as phishing" — the user needs to learn VARIED defensive responses
- The correct option MUST be placed at position: {correct_position}

Respond with ONLY a JSON object (no markdown, no backticks):
{{
  "type": "specific attack type name",
  "from": "realistic-spoofed-email@fake-domain.com",
  "sender": "Display Name of sender",
  "subject": "Unique specific subject line",
  "body": "Full realistic email body (150+ words, with specific names, amounts, dates, reference numbers — make it feel real)",
  "options": [
    {{"id": "opt1", "label": "Short action label (3-6 words)", "desc": "What this action does (under 10 words)"}},
    {{"id": "opt2", "label": "Short action label (3-6 words)", "desc": "What this action does (under 10 words)"}},
    {{"id": "opt3", "label": "Short action label (3-6 words)", "desc": "What this action does (under 10 words)"}},
    {{"id": "opt4", "label": "Short action label (3-6 words)", "desc": "What this action does (under 10 words)"}}
  ],
  "correct_id": "{correct_position}",
  "flags": ["specific red flag 1 (specific to THIS email)", "specific red flag 2", "specific red flag 3", "specific red flag 4"]
}}

DIFFICULTY RULES:
- Easy: Obvious typos, clearly fake domains like g00gle.com, generic "Dear Customer" greetings, absurd urgency
- Medium: Looks convincing with 3-4 detectable issues — slightly off domain, minor grammar, missing context, soft pressure
- Hard: Professional language, realistic scenarios, look-alike domains (company-portal.com vs company.com), only 1-2 subtle red flags

OPTIONS REQUIREMENTS (VERY IMPORTANT):
- All 4 options must be DIFFERENT from each other
- All 4 options must be SPECIFIC to this email's content — NOT generic labels like "Report threat" or "Verify sender"
- The correct option (at position {correct_position}) must match the archetype described above
- The 3 WRONG options should be plausible but insecure actions that an untrained person might take
- Wrong options can include things like: clicking links, replying with info, forwarding to others, calling the number in the email, trusting the request
- Make options feel like real decisions someone would face with THIS specific email

EXAMPLES of GOOD varied option sets:

For a fake bank password reset email:
- "Click the link and update password" (wrong - clicks untrusted link)
- "Reply asking for verification" (wrong - engages with attacker)
- "Open bank's app directly and check for alerts" (CORRECT - manual navigation)
- "Delete and not worry about it" (wrong - might be real breach)

For a CEO fraud wire transfer email:
- "Process the wire transfer immediately" (wrong - comply)
- "Reply confirming receipt" (wrong - engages)
- "Forward to finance team" (wrong - spreads attack)
- "Call the CEO on known number to confirm" (CORRECT - verify differently)

For a fake IT password reset:
- "Enter old and new password on the link" (wrong - gives credentials)
- "Reply asking what happened" (wrong - engages)
- "Call IT helpdesk on posted number to confirm" (CORRECT - verify)
- "Share the email with teammates" (wrong - spreads)

Remember: VARIETY is the goal. Every scenario should feel fresh. No two scenarios should have the same correct answer pattern."""

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
            result = json.loads(clean)

            # Force the correct_id to match what we asked for (in case AI ignored it)
            result["correct_id"] = correct_position

            return result
    except Exception as e:
        print(f"AI generation failed: {e}")
        return None
