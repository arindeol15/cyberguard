import json
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")


async def generate_ai_scenario(difficulty: str, used_types: list[str] = []) -> dict | None:
    """Call Claude API to generate a new attack scenario."""

    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
        return None

    prompt = f"""Generate a {difficulty}-difficulty social engineering email scenario for cybersecurity training.
Previously used types: {', '.join(used_types) if used_types else 'none'} — pick a different type.

Types: phishing, spear-phishing, BEC, pretexting, baiting, whaling, smishing, vishing-transcript.

Respond with ONLY a JSON object, no markdown or backticks:
{{"type":"attack_type","from":"fake@email.com","sender":"Display Name","subject":"Subject line","body":"Full realistic email body (100+ words)","answer":"report|verify|ignore","flags":["flag1","flag2","flag3","flag4"]}}

Rules:
- Easy = obvious errors, fake domains, generic greetings
- Medium = convincing but detectable anomalies
- Hard = sophisticated, closely mimics real communications
- answer is never "comply"
- Include exactly 4 red flags"""

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
                    "max_tokens": 1000,
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
