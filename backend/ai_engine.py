import json
import httpx
import os
import random
from dotenv import load_dotenv

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

PROMPTS = {
    "email": """Generate a {difficulty}-difficulty phishing EMAIL scenario #{seed}.
Industry: {industry}. Theme: {theme}.

Respond ONLY with JSON (no markdown):
{{"type":"attack_type","from":"fake@domain.com","sender":"Display Name","subject":"Subject","body":"Full email 150+ words","options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

The correct answer must be: {archetype}
Options must be UNIQUE to this email. Never use generic labels. correct_id must be "{correct_pos}".""",

    "website": """Generate a {difficulty}-difficulty FAKE WEBSITE detection scenario #{seed}.
Industry: {industry}.

Create a scenario where the user must identify a FAKE/cloned website. Include the fake URL and what the real URL should be.

Respond ONLY with JSON (no markdown):
{{"type":"fake_website","subject":"Website name being spoofed","body":"Description of what the user sees on this fake website (150+ words, describe the page layout, what it asks for, visual details)","extra_data":{{"fake_url":"https://amaz0n-login.com/signin","real_url":"https://amazon.com/signin","ssl_valid":false,"domain_age":"2 days","visual_differences":["Logo is slightly blurry","Footer links are broken","Address bar shows http not https","Copyright year is wrong"]}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = obvious fake URL (g00gle.com), broken images, spelling errors
Medium = convincing look but detectable issues in URL, SSL, small visual differences
Hard = nearly identical clone, only subtle URL difference and minor visual clues""",

    "qr": """Generate a {difficulty}-difficulty QR CODE attack scenario #{seed}.
Location context: {location}.

Create a scenario where user encounters a QR code in a real-world situation and must decide if it's safe.

Respond ONLY with JSON (no markdown):
{{"type":"qr_attack","subject":"Where/how user found the QR code","body":"Full description of the situation (150+ words). Where is the QR code? What does it claim to do? What does the user see after scanning?","extra_data":{{"location":"{location}","claimed_purpose":"Free WiFi login / Menu / Payment / Discount coupon","actual_destination":"https://malicious-site.com/steal-data","qr_placement":"Sticker placed over original QR on restaurant menu","redirect_chain":["https://short.link/x7k","https://malicious-site.com/steal-data"]}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = obviously suspicious QR with clear warning signs
Medium = plausible scenario but detectable if you look closely
Hard = very convincing placement, hard to distinguish from legitimate""",

    "vishing": """Generate a {difficulty}-difficulty VISHING (voice phishing) phone call scenario #{seed}.
Caller pretends to be from: {industry}.

Create a realistic phone call TRANSCRIPT between a scammer and a potential victim.

Respond ONLY with JSON (no markdown):
{{"type":"vishing","subject":"Who the caller claims to be","body":"Full phone call transcript (200+ words). Format as:\\nCaller: ...\\nYou: ...\\nCaller: ...\\netc. The caller uses social engineering tactics.","extra_data":{{"caller_id":"Displayed caller ID (may be spoofed)","claimed_organization":"Bank / IRS / Tech Support / etc","tactics_used":["urgency","authority","fear","isolation"],"info_requested":["SSN","bank account","password","remote access"]}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = obvious pressure tactics, broken English, asks for password directly
Medium = professional tone but asks for too much info, subtle pressure
Hard = very convincing, uses real department names, knows some of your info""",

    "usb": """Generate a {difficulty}-difficulty USB DROP attack scenario #{seed}.
Location: {location}.

Create a scenario where the user finds a USB drive and must decide what to do.

Respond ONLY with JSON (no markdown):
{{"type":"usb_drop","subject":"USB label/appearance description","body":"Full scenario description (150+ words). Where was the USB found? What does it look like? What label is on it? If plugged in, what files appear? What happens next?","extra_data":{{"found_location":"{location}","usb_label":"Label written on the USB","usb_appearance":"Physical description of the USB drive","files_if_opened":["Salaries_Q4_2024.xlsx","README.txt","Photos/"],"hidden_payload":"Autorun malware that installs keylogger","social_engineering":"Label designed to trigger curiosity"}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = suspicious USB in obvious location with too-good-to-be-true label
Medium = found in office area, looks like a colleague lost it
Hard = branded company USB with legitimate-looking label found in lobby""",
}

INDUSTRIES = ["banking","healthcare","e-commerce","tech company","government","university","cloud service","social media","shipping","cryptocurrency","streaming","airline","insurance","telecom","real estate"]
THEMES = ["password reset","package delivery","invoice payment","account verification","job offer","tax refund","security alert","subscription renewal","document signing","legal notice","prize winner","2FA code"]
LOCATIONS = ["office parking lot","company lobby","coffee shop table","conference room","gym locker room","hotel business center","airport lounge","library desk","coworking space","restaurant table"]
ARCHETYPES = [
    "Verify through a DIFFERENT trusted channel (phone, official website, in person)",
    "Report to IT/security team immediately",
    "Delete/ignore without interacting",
    "Manually navigate to official website yourself",
    "Check with manager or authorized person first",
    "Refuse, document, and report the incident",
]


async def generate_ai_scenario(category: str, difficulty: str, used_types: list[str] = [], used_subjects: list[str] = []) -> dict | None:
    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "your-anthropic-api-key-here":
        return None

    seed = random.randint(10000, 99999)
    industry = random.choice(INDUSTRIES)
    theme = random.choice(THEMES)
    location = random.choice(LOCATIONS)
    correct_pos = random.choice(["opt1", "opt2", "opt3", "opt4"])
    archetype = random.choice(ARCHETYPES)

    prompt_template = PROMPTS.get(category, PROMPTS["email"])
    prompt = prompt_template.format(
        difficulty=difficulty, seed=seed, industry=industry,
        theme=theme, location=location, correct_pos=correct_pos,
        archetype=archetype,
    )

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
            text = "".join(b["text"] for b in data.get("content", []) if b.get("type") == "text")
            clean = text.replace("```json", "").replace("```", "").strip()
            result = json.loads(clean)
            result["correct_id"] = correct_pos
            return result
    except Exception as e:
        print(f"AI generation failed: {e}")
        return None
