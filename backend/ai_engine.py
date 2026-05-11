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

CRITICAL: Generate a COMPLETELY UNIQUE scenario. Do NOT use Amazon, PayPal, FedEx, Google, Microsoft, or any commonly used phishing examples. Use CREATIVE and UNUSUAL companies, services, or contexts from the {industry} industry.

Respond ONLY with JSON (no markdown):
{{"type":"attack_type","from":"fake@domain.com","sender":"Display Name","subject":"Subject","body":"Full email 150+ words with specific names, dates, amounts","options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

The correct answer must be: {archetype}
Options must be UNIQUE to this email. Never use generic labels. correct_id must be "{correct_pos}".
Easy = obvious typos, fake domains. Medium = convincing with detectable issues. Hard = very sophisticated.""",

    "website": """Generate a {difficulty}-difficulty FAKE WEBSITE detection scenario #{seed}.
Industry: {industry}. The fake website is from the {industry} sector.

CRITICAL: Do NOT use Amazon, Google, PayPal, Chase, or Microsoft. Create a fake version of a LESS COMMON but real-sounding {industry} company website. Be creative — use regional banks, niche services, healthcare portals, university systems, etc.

Describe what the CLONED fake website looks like in detail — page layout, colors, forms, buttons, images, and what's slightly wrong.

Respond ONLY with JSON (no markdown):
{{"type":"fake_website","subject":"Name of the website being spoofed","body":"Detailed description of the fake website (200+ words). Describe the page: header, navigation, main content area, forms, footer. What does it ask users to do? What looks real and what's off?","extra_data":{{"fake_url":"https://spoofed-domain.com/page","real_url":"https://real-domain.com/page","ssl_valid":false,"domain_age":"3 days","page_title":"Title shown in browser tab","visual_differences":["Specific visual issue 1","Specific visual issue 2","Specific visual issue 3","Specific visual issue 4"]}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = obvious fake URL (misspelling), broken images, spelling errors in content
Medium = convincing look, valid SSL, but subtle URL difference and a few visual clues
Hard = nearly identical clone, only very subtle differences in URL and minor visual details""",

    "qr": """Generate a {difficulty}-difficulty QR CODE attack scenario #{seed}.
Location: {location}.

CRITICAL: Create a UNIQUE and CREATIVE real-world situation where someone encounters a suspicious QR code. Think beyond restaurants and WiFi — consider parking meters, event tickets, charity donation boxes, product packaging, bus stops, apartment notice boards, gym equipment, vending machines, etc.

Respond ONLY with JSON (no markdown):
{{"type":"qr_attack","subject":"Short title of where/how QR was found","body":"Full story description (200+ words). Set the scene vividly. What does the QR code look like physically? Where exactly is it? What sign or instruction is near it? What happens step by step when scanned?","extra_data":{{"location":"{location}","claimed_purpose":"What the QR claims to do","actual_destination":"https://malicious-url.com/steal","qr_placement":"Physical description of how QR is placed","redirect_chain":["https://short.link/abc","https://malicious-url.com/steal"],"qr_url":"https://malicious-url.com/steal"}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = obviously suspicious sticker, handwritten sign, clearly fake
Medium = plausible but has detectable red flags on closer inspection
Hard = professionally printed, matches surroundings, very hard to spot""",

    "vishing": """Generate a {difficulty}-difficulty VISHING (voice phishing) phone call scenario #{seed}.
Caller pretends to be from: {industry}.

CRITICAL: Create a UNIQUE phone scam scenario. Avoid generic "bank fraud department" calls. Think creatively: fake insurance claims, fake government audit, fake IT vendor, fake delivery service needing payment, fake HR calling about benefits, fake recruiter with job offer, fake utility company threatening disconnection, etc.

Write the transcript so it reads like a real phone conversation with natural pauses, interruptions, and realistic dialogue.

Respond ONLY with JSON (no markdown):
{{"type":"vishing","subject":"Who the caller claims to be (specific name and org)","body":"Full phone call transcript (250+ words). Format as:\\nCaller: ...\\nYou: ...\\nCaller: ...\\netc. Include the caller's name, their opening line, how they build trust, where they apply pressure, and what they ultimately want.","extra_data":{{"caller_id":"Displayed phone number (may be spoofed)","claimed_organization":"Specific organization name","caller_name":"The name the scammer gives","tactics_used":["list","of","tactics"],"info_requested":["list","of","info","they","want"],"call_duration":"Approximate duration"}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = obvious pressure, broken English, asks for passwords directly
Medium = professional tone, knows some of your details, subtle pressure
Hard = very convincing, uses real department names, creates a believable story""",

    "usb": """Generate a {difficulty}-difficulty USB DROP attack scenario #{seed}.
Location: {location}.

CRITICAL: Create a UNIQUE USB drop scenario. Be creative with the location, the USB appearance, and especially the LABEL. Think beyond "Employee Salaries" — consider project files, client data, wedding photos, game saves, firmware updates, security patches, interview recordings, etc.

Respond ONLY with JSON (no markdown):
{{"type":"usb_drop","subject":"USB label and appearance (short)","body":"Full scenario (200+ words). Describe: exactly where you find it, what it looks like physically (color, brand, condition, label), the context (time of day, who else is around), and if plugged in — what files appear and what happens.","extra_data":{{"found_location":"{location}","usb_label":"Exact text on the USB label","usb_appearance":"Detailed physical description","files_if_opened":["file1.ext","file2.ext","file3.ext"],"hidden_payload":"What the malware actually does","social_engineering":"Why the label is designed to tempt you"}},"options":[{{"id":"opt1","label":"3-6 words","desc":"under 10 words"}},{{"id":"opt2","label":"...","desc":"..."}},{{"id":"opt3","label":"...","desc":"..."}},{{"id":"opt4","label":"...","desc":"..."}}],"correct_id":"{correct_pos}","flags":["flag1","flag2","flag3","flag4"]}}

Easy = suspicious USB with too-tempting label in obvious spot
Medium = looks like someone dropped it accidentally in work area
Hard = branded company USB that looks completely legitimate""",
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
