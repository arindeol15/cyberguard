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

ADVANCED_MODULE_CONTEXT = {
    "chat": {
        "name": "internal Teams or Slack-style chat scam",
        "examples": "fake HR requests, malicious shared documents, OTP requests, impersonation, urgent password requests",
        "extra": "messages, channel, sender_domain, attachment",
    },
    "attachment": {
        "name": "malicious attachment sandbox analysis",
        "examples": "PDF, DOCX, XLSX, ZIP, or EXE with macros, hidden executables, double extensions, fake antivirus results",
        "extra": "filename, size, claimed_type, real_type, macros, signature, extension_chain, hidden_payload, detections",
    },
    "browser_exploit": {
        "name": "browser exploit simulation",
        "examples": "fake Chrome update, fake CAPTCHA malware, antivirus popup, malicious browser extension, drive-by download",
        "extra": "url, page_title, popup_text, requested_permissions, download_name",
    },
    "mfa": {
        "name": "MFA fatigue attack",
        "examples": "repeated push prompts, fake Microsoft login, approval spam, suspicious login alerts",
        "extra": "app, location, ip, device, prompt_count",
    },
    "cloud": {
        "name": "enterprise cloud breach",
        "examples": "suspicious OneDrive shares, Google Workspace alerts, Dropbox scams, unauthorized login attempts",
        "extra": "shares, data_risk, sessions",
    },
    "insider": {
        "name": "insider threat analyst workflow",
        "examples": "unauthorized file copying, privilege misuse, password sharing, suspicious USB usage",
        "extra": "employees, risky_files, policy_trigger",
    },
    "wifi": {
        "name": "rogue WiFi or network spoofing attack",
        "examples": "airport WiFi, cafe hotspot, captive portal, evil twin, credential capture",
        "extra": "networks, captive_portal, vpn, location",
    },
    "dns": {
        "name": "DNS spoofing and pharming attack",
        "examples": "legitimate domain redirected to fake version, SSL mismatch, domain verification, browser warnings",
        "extra": "requested_domain, expected_ip, resolved_ip, cert_subject, resolver_notes",
    },
    "deepfake": {
        "name": "deepfake or AI impersonation scam",
        "examples": "fake CEO voice note, AI urgent message, synthetic identity verification request",
        "extra": "impersonated, channel, transcript, markers",
    },
    "attack_chain": {
        "name": "multi-stage connected attack chain",
        "examples": "phishing email, fake login page, MFA fatigue, internal chat scam, ransomware infection",
        "extra": "stages, initial_access, final_impact",
    },
}


def build_advanced_prompt(category: str, difficulty: str, seed: int, industry: str, theme: str,
                          location: str, correct_pos: str, archetype: str) -> str:
    context = ADVANCED_MODULE_CONTEXT.get(category, ADVANCED_MODULE_CONTEXT["chat"])
    return f"""Generate a {difficulty}-difficulty CyberGuard scenario #{seed}.
Module: {context["name"]}.
Industry: {industry}. Theme: {theme}. Location context: {location}.

Scenario examples to draw from: {context["examples"]}.
Make it realistic, corporate, investigation-driven, and simulation-based rather than quiz-like.
Do not reuse Amazon, PayPal, FedEx, Google, Microsoft, or generic consumer phishing examples unless the module specifically requires a fake Microsoft-style identity prompt.

Respond ONLY with valid JSON and no markdown. Include exactly these top-level keys:
type, from, sender, subject, body, extra_data, options, correct_id, flags.

The extra_data object must include useful fields for: {context["extra"]}.
The options array must contain four unique decisions with id values opt1, opt2, opt3, opt4, each with label and desc.
The correct defensive decision must be: {archetype}
Set correct_id to "{correct_pos}".
Include at least four red flags in flags.

Easy = obvious suspicious indicators.
Medium = plausible but detectable with investigation.
Hard = sophisticated and subtle, requiring careful verification."""


COMPANIES = [
    ("Northstar Benefits", "northstarbenefits.com", "benefits administration"),
    ("Aster Ridge Credit Union", "asterridgecu.org", "regional banking"),
    ("HelioGrid Energy", "heliogridenergy.com", "utility operations"),
    ("CedarWave Logistics", "cedarwavelogistics.com", "shipping"),
    ("BlueMesa University", "bluemesa.edu", "higher education"),
    ("Praxis Health Network", "praxishealth.net", "healthcare"),
    ("Orchid Bay Properties", "orchidbayproperties.com", "real estate"),
    ("LumenTrail Cloud", "lumentrailcloud.io", "cloud service"),
]

NAMES = [
    ("Maya Chen", "HR Operations"),
    ("Ravi Singh", "Finance Controller"),
    ("Elena Torres", "IT Service Desk"),
    ("Noah Reed", "Security Operations"),
    ("Priya Nair", "Vendor Manager"),
    ("Jordan Blake", "Executive Assistant"),
]


def has_real_anthropic_key() -> bool:
    key = ANTHROPIC_API_KEY.strip()
    if not key:
        return False
    lower = key.lower()
    placeholder_markers = ["your-", "replace", "placeholder", "api-key-here", "changeme", "dummy"]
    return not any(marker in lower for marker in placeholder_markers)


def build_options(correct_pos: str, safe_label: str, safe_desc: str, risky_options: list[tuple[str, str]]) -> list[dict]:
    try:
        correct_index = max(0, min(3, int(str(correct_pos).replace("opt", "") or "1") - 1))
    except ValueError:
        correct_index = 0
    risky_pool = list(risky_options) or [("Comply with request", "Act immediately")]
    random.shuffle(risky_pool)
    options = []
    risky_i = 0
    for i in range(4):
        opt_id = f"opt{i + 1}"
        if i == correct_index:
            options.append({"id": opt_id, "label": safe_label, "desc": safe_desc})
        else:
            label, desc = risky_pool[risky_i % len(risky_pool)]
            options.append({"id": opt_id, "label": label, "desc": desc})
            risky_i += 1
    return options


def extract_json_object(text: str) -> dict:
    clean = text.replace("```json", "").replace("```", "").strip()
    start = clean.find("{")
    end = clean.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in AI response")
    return json.loads(clean[start:end + 1])


def normalize_ai_result(result: dict, category: str, difficulty: str, correct_pos: str) -> dict:
    options = result.get("options")
    if not isinstance(options, list) or len(options) < 2:
        options = build_options(
            correct_pos,
            "Report and verify",
            "Use trusted channel",
            [
                ("Follow the prompt", "Proceed quickly"),
                ("Enter requested data", "Trust the sender"),
                ("Forward to coworker", "Ask informally"),
            ],
        )

    normalized_options = []
    for i, opt in enumerate(options[:4]):
        if isinstance(opt, str):
            normalized_options.append({"id": f"opt{i + 1}", "label": opt, "desc": ""})
        else:
            normalized_options.append({
                "id": opt.get("id") or f"opt{i + 1}",
                "label": opt.get("label") or f"Option {i + 1}",
                "desc": opt.get("desc") or "",
            })

    while len(normalized_options) < 4:
        i = len(normalized_options) + 1
        normalized_options.append({"id": f"opt{i}", "label": "Escalate to security", "desc": "Defensive action"})

    option_ids = {opt["id"] for opt in normalized_options}
    correct_id = result.get("correct_id") if result.get("correct_id") in option_ids else correct_pos
    if correct_id not in option_ids:
        correct_id = normalized_options[0]["id"]

    flags = result.get("flags", [])
    if isinstance(flags, str):
        flags = [flags]
    if not isinstance(flags, list) or not flags:
        flags = [
            "Urgency or pressure to act quickly",
            "Identity cannot be verified from the message alone",
            "Request would expose credentials, money, or sensitive data",
            "Official process is bypassed",
        ]

    extra_data = result.get("extra_data")
    if not isinstance(extra_data, dict):
        extra_data = {}

    return {
        "type": result.get("type") or category,
        "from": result.get("from") or result.get("sender_email"),
        "sender": result.get("sender") or result.get("sender_name"),
        "subject": result.get("subject") or f"{difficulty} {category.replace('_', ' ')} scenario",
        "body": result.get("body") or "Investigate the situation and choose the safest response.",
        "extra_data": extra_data,
        "options": normalized_options,
        "correct_id": correct_id,
        "flags": flags[:6],
    }


def generate_local_ai_scenario(category: str, difficulty: str, used_types: list[str] = None,
                               used_subjects: list[str] = None) -> dict:
    used_subjects = used_subjects or []
    seed = random.randint(10000, 99999)
    company, domain, industry_label = random.choice(COMPANIES)
    person, role = random.choice(NAMES)
    location = random.choice(LOCATIONS)
    theme = random.choice(THEMES)
    correct_pos = random.choice(["opt1", "opt2", "opt3", "opt4"])
    lookalike = domain.replace(".", "-secure.") if "." in domain else f"{domain}-secure.net"
    suspicious_domain = f"{domain.split('.')[0]}-{random.choice(['verify', 'portal', 'secure', 'helpdesk'])}.net"
    incident = f"AI-{seed}"

    safe = ("Report and verify", "Use trusted channel")
    risky = [
        ("Comply with request", "Act immediately"),
        ("Open the link", "Continue workflow"),
        ("Share requested data", "Help the sender"),
        ("Approve the prompt", "Stop interruptions"),
        ("Ignore the alert", "Assume it is normal"),
    ]

    result = {
        "type": category,
        "from": f"{person.split()[0].lower()}.{person.split()[1].lower()}@{suspicious_domain}",
        "sender": person,
        "subject": f"{company} {theme.title()} Review ({incident})",
        "body": (
            f"{person}, claiming to work in {role}, contacts you about a {theme} issue at {company}. "
            f"The message references {industry_label} operations and asks you to act before the end of the shift. "
            f"The request looks plausible, but the domain, timing, and requested action do not match normal company process. "
            f"Investigate the sender, destination, and business context before choosing a response."
        ),
        "extra_data": {},
        "options": build_options(correct_pos, safe[0], safe[1], risky),
        "correct_id": correct_pos,
        "flags": [
            f"Sender domain does not match {domain}",
            "Request creates urgency without a ticket or trusted approval path",
            "Action would expose credentials, money, data, or device access",
            "Verification through an official channel is available but bypassed",
        ],
    }

    if category == "email":
        result.update({
            "type": "ai_generated_email",
            "subject": f"{company}: urgent {theme} exception ({incident})",
            "body": (
                f"From: {person}, {role}\n\n"
                f"We are closing an exception for {company} today and your account is listed as pending. "
                f"Open https://{suspicious_domain}/case/{seed} and confirm your work password plus current MFA code. "
                f"The window closes in 30 minutes and failed confirmation may suspend your access to shared documents. "
                f"Please do not create a helpdesk ticket because this is being handled by the transition team."
            ),
        })
    elif category == "website":
        result.update({
            "type": "ai_generated_fake_website",
            "subject": f"{company} cloned portal ({incident})",
            "body": (
                f"A link opens a polished clone of the {company} employee portal. The header colors and sign-in form look real, "
                f"but the page is hosted at https://{lookalike}/login and asks for password, phone number, and MFA code on one screen. "
                f"The footer links loop back to the same page and the certificate issuer does not match the official portal."
            ),
            "extra_data": {
                "fake_url": f"https://{lookalike}/login",
                "real_url": f"https://{domain}/login",
                "ssl_valid": difficulty != "Easy",
                "ssl_status": "valid" if difficulty != "Easy" else "none",
                "domain_age": f"{random.randint(2, 21)} days",
                "page_title": f"{company} Secure Login",
                "visual_differences": ["Footer links loop", "Extra MFA field", "Lookalike domain", "Issuer mismatch"],
            },
        })
        safe = ("Open official site directly", "Do not use link")
    elif category == "qr":
        qr_target = f"https://{suspicious_domain}/scan/{seed}"
        result.update({
            "type": "ai_generated_qr_attack",
            "subject": f"QR code at {location} ({incident})",
            "body": (
                f"At the {location}, a fresh QR sticker says it will open a {company} service form. "
                f"The sticker covers part of an older notice and the destination preview shows {qr_target}. "
                f"The page asks for corporate credentials before explaining why the scan is needed."
            ),
            "extra_data": {
                "location": location,
                "claimed_purpose": f"{company} service verification",
                "actual_destination": qr_target,
                "qr_placement": "New glossy sticker placed over older printed instructions",
                "redirect_chain": [f"https://short.example/{seed}", qr_target],
                "qr_url": qr_target,
            },
        })
        safe = ("Verify with staff", "Avoid scanning")
    elif category == "vishing":
        result.update({
            "type": "ai_generated_vishing",
            "subject": f"{company} callback request ({incident})",
            "body": (
                f"Caller: This is {person} from {company}. We have a {theme} issue tied to your account.\n"
                "You: I was not expecting a call.\n"
                f"Caller: That is why I am calling directly. I need you to confirm your username and approve the push prompt I just sent.\n"
                "You: Can I call the published service desk number?\n"
                "Caller: Please do not. This ticket expires in five minutes and your access may be locked."
            ),
            "extra_data": {
                "caller_id": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                "claimed_organization": company,
                "caller_name": person,
                "tactics_used": ["urgency", "authority", "callback avoidance"],
                "info_requested": ["username", "MFA approval", "password reset confirmation"],
                "call_duration": "3 minutes",
            },
        })
        safe = ("Hang up and verify", "Call known number")
    elif category == "usb":
        result.update({
            "type": "ai_generated_usb_drop",
            "subject": f"Found USB labeled {theme.title()} ({incident})",
            "body": (
                f"You find a USB drive at the {location}. It has a printed {company} label and a handwritten note: "
                f"'{theme.title()} - return after review.' If mounted, the visible files look work-related but an autorun launcher is hidden."
            ),
            "extra_data": {
                "found_location": location,
                "usb_label": f"{company}_{theme.replace(' ', '_')}_{seed}",
                "usb_appearance": "Branded black USB with fresh adhesive label",
                "files_if_opened": ["ReadMe.txt", f"{theme.replace(' ', '_')}.xlsx", "autorun.inf"],
                "hidden_payload": "PowerShell downloader hidden in shortcut metadata",
                "social_engineering": "Label is designed to look urgent and business relevant",
            },
        })
        safe = ("Turn in to security", "Do not mount")
    elif category == "chat":
        result.update({
            "type": "ai_generated_chat_scam",
            "subject": f"Guest chat request from {person} ({incident})",
            "extra_data": {
                "messages": [
                    {"from": person, "role": role, "text": f"Can you open the {theme} file before the review call?"},
                    {"from": person, "role": role, "text": "It asks for sign-in because it is in a protected workspace."},
                    {"from": "You", "role": "Security Analyst", "text": "I do not see a matching ticket yet."},
                ],
                "channel": "#hr-helpdesk",
                "sender_domain": suspicious_domain,
                "attachment": f"{theme.replace(' ', '_').title()}_Review.docx",
            },
        })
    elif category == "attachment":
        result.update({
            "type": "ai_generated_attachment",
            "subject": f"Attachment sandbox alert ({incident})",
            "extra_data": {
                "filename": f"{theme.replace(' ', '_').title()}_Report.pdf.exe",
                "size": f"{random.randint(2, 8)}.{random.randint(1, 9)} MB",
                "claimed_type": "PDF",
                "real_type": "Win32 EXE",
                "macros": "Launcher behavior",
                "signature": "Unsigned",
                "extension_chain": ".pdf.exe",
                "hidden_payload": "Ransomware loader",
                "detections": ["Double extension", "Unsigned binary", "Suspicious child process", "Credential theft behavior"],
            },
        })
        safe = ("Quarantine and report", "Sandbox first")
    elif category == "browser_exploit":
        result.update({
            "type": "ai_generated_browser_exploit",
            "subject": f"Browser update trap ({incident})",
            "extra_data": {
                "url": f"https://{suspicious_domain}/captcha",
                "page_title": "Verification component required",
                "popup_text": "Install security update to continue",
                "requested_permissions": ["Read all sites", "Manage downloads", "Clipboard access"],
                "download_name": f"Secure_Update_{seed}.exe",
            },
        })
        safe = ("Block and report", "Do not install")
    elif category == "mfa":
        result.update({
            "type": "ai_generated_mfa_fatigue",
            "subject": f"Repeated sign-in approvals ({incident})",
            "extra_data": {
                "app": f"{company} SSO",
                "location": random.choice(["Warsaw, Poland", "Lagos, Nigeria", "Sao Paulo, Brazil", "Toronto, Canada"]),
                "ip": f"203.0.113.{random.randint(10, 240)}",
                "device": "Unknown Windows device",
                "prompt_count": random.randint(5, 12),
            },
        })
        safe = ("Deny and report", "Investigate login")
    elif category == "cloud":
        result.update({
            "type": "ai_generated_cloud_breach",
            "subject": f"Cloud sharing anomaly ({incident})",
            "extra_data": {
                "shares": f"{random.randint(8, 26)} external",
                "data_risk": random.choice(["Payroll", "Client contracts", "Source code", "Patient exports"]),
                "sessions": [
                    {"location": "Dubai, AE", "ip": "10.12.4.20", "status": "Known"},
                    {"location": "Prague, CZ", "ip": f"198.51.100.{random.randint(10, 240)}", "status": "Suspicious"},
                    {"location": "Unknown VPN", "ip": f"203.0.113.{random.randint(10, 240)}", "status": "Active"},
                ],
            },
        })
        safe = ("Revoke sessions", "Contain account")
    elif category == "insider":
        result.update({
            "type": "ai_generated_insider",
            "subject": f"Employee risk investigation ({incident})",
            "extra_data": {
                "employees": [
                    {"name": person, "dept": role, "risk": random.randint(76, 94), "activity": "Copied sensitive files after hours"},
                    {"name": "Samira Hall", "dept": "Sales", "risk": random.randint(40, 65), "activity": "Large CRM export"},
                    {"name": "Theo Martin", "dept": "Engineering", "risk": random.randint(12, 30), "activity": "Normal repository clone"},
                ],
                "risky_files": ["pricing.xlsx", "payroll.csv", "client_contracts.zip"],
                "policy_trigger": "Unusual removable-media copy",
            },
        })
        safe = ("Escalate case", "Investigate logs")
    elif category == "wifi":
        result.update({
            "type": "ai_generated_wifi",
            "subject": f"Evil twin network at {location} ({incident})",
            "extra_data": {
                "networks": [
                    {"ssid": f"{company}_Guest", "strength": 91, "secure": False, "risk": "High"},
                    {"ssid": f"{company}_Guest_5G", "strength": 64, "secure": True, "risk": "Medium"},
                    {"ssid": f"{company}_Official", "strength": 48, "secure": True, "risk": "Low"},
                ],
                "captive_portal": "Requests corporate email and password",
                "vpn": "Required before business access",
                "location": location,
            },
        })
        safe = ("Use official WiFi/VPN", "Avoid rogue SSID")
    elif category == "dns":
        result.update({
            "type": "ai_generated_dns_spoofing",
            "subject": f"DNS mismatch for {company} portal ({incident})",
            "extra_data": {
                "requested_domain": f"https://portal.{domain}",
                "expected_ip": f"10.{random.randint(10, 80)}.{random.randint(1, 200)}.{random.randint(1, 200)}",
                "resolved_ip": f"203.0.113.{random.randint(10, 240)}",
                "cert_subject": suspicious_domain,
                "resolver_notes": "Corporate resolver and public resolver disagree",
            },
        })
        safe = ("Stop and report", "Verify DNS")
    elif category == "deepfake":
        transcript = (
            f"This is {person}. I need you to approve the {theme} exception before the board call. "
            "Do not loop in finance yet; I will explain after the transfer clears."
        )
        result.update({
            "type": "ai_generated_deepfake",
            "subject": f"AI voice note impersonating {person} ({incident})",
            "body": transcript,
            "extra_data": {
                "impersonated": person,
                "channel": "Encrypted voice message",
                "transcript": transcript,
                "markers": ["Urgency pressure", "Requests secrecy", "No live callback", "Synthetic cadence"],
            },
        })
        safe = ("Verify identity", "Use callback path")
    elif category == "attack_chain":
        result.update({
            "type": "ai_generated_attack_chain",
            "subject": f"Connected attack chain ({incident})",
            "extra_data": {
                "stages": [
                    {"title": "Phishing Email", "event": f"Email links to https://{suspicious_domain}/sso", "choices": [{"label": "Report email", "risk": -10}, {"label": "Open link", "risk": 25}]},
                    {"title": "Fake Login", "event": "The portal asks for password and MFA code.", "choices": [{"label": "Close and verify domain", "risk": -10}, {"label": "Enter credentials", "risk": 30}]},
                    {"title": "MFA Fatigue", "event": "Push approvals arrive repeatedly.", "choices": [{"label": "Deny and report", "risk": -15}, {"label": "Approve once", "risk": 35}]},
                    {"title": "Internal Chat", "event": "Attacker requests files from teammates.", "choices": [{"label": "Warn team and revoke sessions", "risk": -20}, {"label": "Ignore chat", "risk": 20}]},
                    {"title": "Ransomware", "event": "Payload download begins.", "choices": [{"label": "Isolate endpoint", "risk": -25}, {"label": "Wait for IT", "risk": 20}]},
                ],
                "initial_access": "Credential phishing",
                "final_impact": "Ransomware staging",
            },
        })
        safe = ("Contain and report", "Revoke sessions")

    result["options"] = build_options(correct_pos, safe[0], safe[1], risky)
    result["correct_id"] = correct_pos
    if result["subject"] in used_subjects:
        result["subject"] = f"{result['subject']} variant {random.randint(100, 999)}"
    return normalize_ai_result(result, category, difficulty, correct_pos)


async def generate_ai_scenario(category: str, difficulty: str, used_types: list[str] = [], used_subjects: list[str] = []) -> dict | None:
    seed = random.randint(10000, 99999)
    industry = random.choice(INDUSTRIES)
    theme = random.choice(THEMES)
    location = random.choice(LOCATIONS)
    correct_pos = random.choice(["opt1", "opt2", "opt3", "opt4"])
    archetype = random.choice(ARCHETYPES)

    if category in PROMPTS:
        prompt_template = PROMPTS[category]
        prompt = prompt_template.format(
            difficulty=difficulty, seed=seed, industry=industry,
            theme=theme, location=location, correct_pos=correct_pos,
            archetype=archetype,
        )
    else:
        prompt = build_advanced_prompt(
            category=category, difficulty=difficulty, seed=seed,
            industry=industry, theme=theme, location=location,
            correct_pos=correct_pos, archetype=archetype,
        )

    if not has_real_anthropic_key():
        return generate_local_ai_scenario(category, difficulty, used_types, used_subjects)

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
            response.raise_for_status()
            data = response.json()
            text = "".join(b["text"] for b in data.get("content", []) if b.get("type") == "text")
            result = extract_json_object(text)
            result["correct_id"] = result.get("correct_id") or correct_pos
            return normalize_ai_result(result, category, difficulty, correct_pos)
    except Exception as e:
        print(f"AI generation failed: {e}")
        return generate_local_ai_scenario(category, difficulty, used_types, used_subjects)
