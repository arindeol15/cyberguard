"""
CyberGuard — Expanded Scenarios Seed
=====================================
Contains 8-10 unique scenarios per attack category across 15 categories.
Total: 135+ scenarios.

USAGE in main.py:
    from scenarios_seed import ALL_SCENARIOS

    # Inside seed_database():
    for s in ALL_SCENARIOS:
        existing = db.query(Scenario).filter(
            Scenario.subject == s["subject"],
            Scenario.category == s["category"]
        ).first()
        if not existing:
            db.add(Scenario(**s, is_ai_generated=False))
    db.commit()

Each scenario has the same shape as your existing seed entries:
  category, difficulty, type, sender_email, sender_name, subject, body,
  correct_action, red_flags, options (JSON list), extra_data (JSON dict)

Difficulty values used: "beginner", "intermediate", "advanced", "expert"
(matches the 4 levels in your spec; if your existing code uses
"easy/medium/hard", a mapping helper is provided at the bottom.)
"""

# ============================================================
# 1. EMAIL PHISHING  (10 scenarios)
# ============================================================
EMAIL_PHISHING = [
    {
        "category": "email_phishing",
        "difficulty": "beginner",
        "type": "phishing",
        "sender_email": "security-alert@bank-of-america-secure.com",
        "sender_name": "Bank of America Security",
        "subject": "URGENT: Unusual login attempt detected on your account",
        "body": "Dear Customer,\n\nWe detected a login attempt from Lagos, Nigeria at 03:42 AM. If this was not you, click below within 24 hours to secure your account or it will be permanently locked.\n\nSecure My Account: http://bank-of-america-secure.com/verify\n\nThank you,\nBoA Security Team",
        "correct_action": "report",
        "red_flags": "Suspicious sender domain (bank-of-america-secure.com is not bankofamerica.com); urgency pressure; threat of account lock; generic greeting; suspicious URL.",
        "options": ["Click the link to secure account", "Reply with account details", "Report as phishing", "Ignore and delete"],
        "extra_data": {"scenario_name": "Fake bank security alert"}
    },
    {
        "category": "email_phishing",
        "difficulty": "beginner",
        "type": "phishing",
        "sender_email": "noreply@fed3x-delivery.com",
        "sender_name": "FedEx Delivery",
        "subject": "Your package is on hold — action required",
        "body": "Hi,\n\nWe attempted delivery of your package today but no one was available. Pay a $2.99 redelivery fee within 48 hours or the package will be returned.\n\nPay redelivery fee: fed3x-delivery.com/pay\n\nTracking: 7741XK29X",
        "correct_action": "report",
        "red_flags": "Misspelled domain (fed3x not fedex); small fee designed to feel low-risk; no specific package details; sender domain doesn't match official FedEx.",
        "options": ["Pay the $2.99 fee", "Open the tracking link", "Report as phishing", "Forward to a friend"],
        "extra_data": {"scenario_name": "Package delivery scam"}
    },
    {
        "category": "email_phishing",
        "difficulty": "intermediate",
        "type": "phishing",
        "sender_email": "no-reply@accounts-google.support",
        "sender_name": "Google Accounts",
        "subject": "Password reset requested for your account",
        "body": "Someone (possibly you) requested a password reset for arin.deol@gmail.com from a Windows device in Russia.\n\nIf this wasn't you, secure your account now:\nhttps://accounts-google.support/reset?token=a8f3k2\n\nIf this was you, no action is needed.\n\nGoogle Account Team",
        "correct_action": "report",
        "red_flags": "Domain 'accounts-google.support' is not google.com; classic 'wasn't you?' urgency trick; legitimate Google emails come from google.com only.",
        "options": ["Click 'secure account' link", "Report as phishing", "Forward to IT", "Reply asking for verification"],
        "extra_data": {"scenario_name": "Password reset attack"}
    },
    {
        "category": "email_phishing",
        "difficulty": "intermediate",
        "type": "phishing",
        "sender_email": "hr-portal@company-docs.net",
        "sender_name": "HR Department",
        "subject": "Updated employee handbook — acknowledgement required",
        "body": "Hi team,\n\nPlease review and sign the updated 2026 employee handbook by Friday. Failure to acknowledge will affect your performance review.\n\nReview document: https://company-docs.net/handbook-2026\n\nRegards,\nHR",
        "correct_action": "report",
        "red_flags": "External domain (company-docs.net) for an internal HR doc; threatens performance review; generic 'team' greeting; no named HR contact.",
        "options": ["Sign the document", "Open the link to review", "Report to IT/security", "Forward to manager"],
        "extra_data": {"scenario_name": "HR document attack"}
    },
    {
        "category": "email_phishing",
        "difficulty": "advanced",
        "type": "phishing",
        "sender_email": "scholarships@amity-grants.org",
        "sender_name": "Amity Scholarship Office",
        "subject": "Congratulations! You've been awarded a $5,000 merit scholarship",
        "body": "Dear Student,\n\nBased on your academic record, you have been selected for the 2026 Merit Excellence Scholarship worth $5,000.\n\nTo claim, complete the verification form (bank details required for transfer) within 7 days:\nhttps://amity-grants.org/claim\n\nCongratulations!\nScholarship Office",
        "correct_action": "report",
        "red_flags": "Unsolicited award you didn't apply for; asks for bank details up front; external domain (amity-grants.org, not amity.edu); urgency window.",
        "options": ["Fill out the form", "Report to university IT", "Reply with bank details", "Share with classmates"],
        "extra_data": {"scenario_name": "Scholarship fraud"}
    },
    {
        "category": "email_phishing",
        "difficulty": "advanced",
        "type": "phishing",
        "sender_email": "share-noreply@dropb0x.com",
        "sender_name": "Dropbox",
        "subject": "Alex Mehta shared 'Q1 Salaries.xlsx' with you",
        "body": "Alex Mehta has shared a file with you.\n\nQ1 Salaries.xlsx (2.4 MB)\n\nView file: https://dropb0x.com/s/q1-salaries\n\nThis link expires in 24 hours.\n\nDropbox",
        "correct_action": "report",
        "red_flags": "Zero in 'dropb0x' instead of 'o'; tempting filename (salaries) designed to trigger curiosity; you don't know if Alex actually sent this; expiry pressure.",
        "options": ["Open the shared file", "Report as phishing", "Ask Alex over Slack first", "Both: ask Alex AND report"],
        "extra_data": {"scenario_name": "Cloud storage sharing attack", "preferred_answer_explanation": "Best practice is verify out-of-band AND report. 'Report as phishing' is acceptable; opening the file is not."}
    },
    {
        "category": "email_phishing",
        "difficulty": "advanced",
        "type": "phishing",
        "sender_email": "billing@suppli3r-invoices.com",
        "sender_name": "Acme Supplies Ltd.",
        "subject": "Invoice #INV-2026-0481 — Payment overdue (Final notice)",
        "body": "Dear Accounts Payable,\n\nInvoice INV-2026-0481 for $14,820 is now 30 days overdue. Per our terms, this is the final notice before legal action.\n\nPay now: suppli3r-invoices.com/pay/INV-2026-0481\n\nAttached: Invoice.pdf\n\nAcme Supplies Billing",
        "correct_action": "report",
        "red_flags": "Numeric character in domain (suppli3r); legal threat as pressure; no prior relationship verified; PDF attachment is common malware vector.",
        "options": ["Pay the invoice", "Open the PDF attachment", "Verify with accounting + report", "Reply asking for more info"],
        "extra_data": {"scenario_name": "Invoice payment scam"}
    },
    {
        "category": "email_phishing",
        "difficulty": "expert",
        "type": "phishing",
        "sender_email": "r.chen@amity-dubai.edu",
        "sender_name": "Dr. Rajiv Chen (CEO)",
        "subject": "Quick favor — are you at your desk?",
        "body": "Hi,\n\nI'm in a board meeting and can't take calls. I need you to handle something urgent and confidential. Are you free for the next 30 minutes?\n\nReply quickly — this is time-sensitive.\n\nSent from my iPhone",
        "correct_action": "report",
        "red_flags": "CEO impersonation (BEC); 'sent from iPhone' to excuse lack of signature; vague 'urgent favor' baiting reply; isolation tactic ('confidential'); domain looks legit but display name can be spoofed.",
        "options": ["Reply 'yes, what do you need?'", "Call/Slack the CEO to verify", "Report as BEC phishing", "Forward to your manager first"],
        "extra_data": {"scenario_name": "CEO impersonation (BEC)"}
    },
    {
        "category": "email_phishing",
        "difficulty": "expert",
        "type": "phishing",
        "sender_email": "recruiter@google-careers-hire.com",
        "sender_name": "Sarah Kim — Google Recruiting",
        "subject": "Interview opportunity — Software Engineer, $180k base",
        "body": "Hi Arin,\n\nI came across your LinkedIn profile and was impressed. Google has an open SWE role ($180k base + equity). To proceed, please fill out the pre-screening form (includes SSN/passport for background check) and pay a $50 platform fee, refundable on hire.\n\nApply: google-careers-hire.com/apply/arin\n\nLooking forward!\nSarah",
        "correct_action": "report",
        "red_flags": "Real recruiters never ask for application fees; SSN/passport before any interview is a huge red flag; domain is not google.com; too-good-to-be-true offer.",
        "options": ["Fill out the form and pay", "Reply asking for video interview", "Report as phishing/scam", "Verify on Google's official careers site"],
        "extra_data": {"scenario_name": "Job recruitment fraud"}
    },
    {
        "category": "email_phishing",
        "difficulty": "expert",
        "type": "phishing",
        "sender_email": "support@1nstagram-recovery.com",
        "sender_name": "Instagram Support",
        "subject": "We've received a request to delete your account",
        "body": "Hi @arindeol,\n\nWe received a deletion request for your Instagram account from a device in Brazil. If you did not request this, click below within 12 hours to cancel:\n\nCancel deletion: 1nstagram-recovery.com/cancel\n\nYou will be asked to confirm your password.\n\nInstagram Support",
        "correct_action": "report",
        "red_flags": "Domain uses '1' instead of 'i'; classic recovery scam designed to harvest credentials; tight time window; legitimate Instagram messages stay in-app.",
        "options": ["Click cancel deletion", "Log in via the official app to check", "Report and delete email", "Reply to the email"],
        "extra_data": {"scenario_name": "Social media account recovery scam"}
    },
]


# ============================================================
# 2. FAKE WEBSITE  (10 scenarios)
# ============================================================
FAKE_WEBSITE = [
    {
        "category": "fake_website",
        "difficulty": "beginner",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "paypa1-login.com — PayPal sign-in page",
        "body": "You've landed on what appears to be PayPal's login page after clicking a link in an email. The page asks for email, password, and SSN for 'identity verification'.",
        "correct_action": "report",
        "red_flags": "Domain uses '1' for 'l' (paypa1 vs paypal); HTTP not HTTPS; PayPal never asks for SSN at login; suspicious 'verification' step.",
        "options": ["Enter credentials", "Close tab and report URL", "Bookmark for later", "Try with fake credentials first"],
        "extra_data": {"scenario_name": "PayPal lookalike login", "fake_url": "http://paypa1-login.com", "ssl_status": "none", "domain_age_days": 3}
    },
    {
        "category": "fake_website",
        "difficulty": "beginner",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "amaz0n-deals.net — Amazon Prime Day deals",
        "body": "Page claims 90% off all electronics for 'Prime Day exclusive'. Asks you to log in with your Amazon account to access deals. URL bar shows http://amaz0n-deals.net.",
        "correct_action": "report",
        "red_flags": "Zero in 'amaz0n'; no HTTPS; deals too steep to be real; not amazon.com.",
        "options": ["Log in to see deals", "Close and verify on amazon.com", "Share with friends", "Try a guest account"],
        "extra_data": {"scenario_name": "Amazon clone deals page", "fake_url": "http://amaz0n-deals.net", "ssl_status": "none", "domain_age_days": 11}
    },
    {
        "category": "fake_website",
        "difficulty": "intermediate",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "secure-microsoft-365.com — Office 365 sign-in",
        "body": "Standard-looking Microsoft 365 sign-in page. URL: https://secure-microsoft-365.com/login. Certificate is valid (Let's Encrypt). Page asks for your work email and password.",
        "correct_action": "report",
        "red_flags": "Real Microsoft 365 login is at login.microsoftonline.com — never 'secure-microsoft-365.com'; HTTPS doesn't mean legit; Let's Encrypt certs are free and used by attackers; missing brand polish.",
        "options": ["Sign in — HTTPS is safe", "Verify URL against official MS docs", "Report URL and close", "Sign in with old throwaway password"],
        "extra_data": {"scenario_name": "Office 365 phishing portal", "fake_url": "https://secure-microsoft-365.com/login", "ssl_status": "lets_encrypt", "domain_age_days": 8}
    },
    {
        "category": "fake_website",
        "difficulty": "intermediate",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "netfllx-billing.com — Update your payment method",
        "body": "Page says 'Your Netflix subscription was suspended due to a billing failure. Update your card to continue watching.' Asks for full card number, CVV, and ZIP.",
        "correct_action": "report",
        "red_flags": "Double L in 'netfllx'; Netflix never asks for full re-entry of card via email link; URL not netflix.com.",
        "options": ["Update card to restore service", "Open netflix.com directly to check", "Use a virtual card number", "Report URL"],
        "extra_data": {"scenario_name": "Netflix billing phishing", "fake_url": "https://netfllx-billing.com", "ssl_status": "lets_encrypt", "domain_age_days": 5}
    },
    {
        "category": "fake_website",
        "difficulty": "advanced",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "binаnce.com — Crypto exchange login (homograph attack)",
        "body": "URL appears to be binance.com but uses Cyrillic 'а' instead of Latin 'a'. Login page looks pixel-perfect identical to real Binance. SSL cert is valid.",
        "correct_action": "report",
        "red_flags": "Homograph attack — Cyrillic characters indistinguishable visually; valid SSL is no guarantee; copy the URL into Notepad to reveal the trick.",
        "options": ["Log in — looks identical", "Copy URL to Notepad to inspect", "Report and use bookmarked binance.com", "Use 2FA — it's safe with that"],
        "extra_data": {"scenario_name": "Homograph attack (Cyrillic spoofing)", "fake_url": "https://binаnce.com", "ssl_status": "valid", "domain_age_days": 22}
    },
    {
        "category": "fake_website",
        "difficulty": "advanced",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "github-login.io — GitHub OAuth authorization page",
        "body": "A fake OAuth consent screen asking you to authorize 'GitHubBackup' to access your private repos, read user data, and act on your behalf. URL: github-login.io.",
        "correct_action": "report",
        "red_flags": "Real GitHub OAuth is always on github.com; over-broad permission scopes; unknown third-party app; suspicious .io subdomain disguise.",
        "options": ["Authorize the app", "Check URL — only github.com is real", "Authorize with limited scopes", "Look up the app on GitHub marketplace first"],
        "extra_data": {"scenario_name": "GitHub OAuth consent phishing", "fake_url": "https://github-login.io/oauth", "ssl_status": "valid", "domain_age_days": 14}
    },
    {
        "category": "fake_website",
        "difficulty": "advanced",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "Pop-up: 'Your computer is infected — call Microsoft Support now'",
        "body": "Visiting a news site triggers a fullscreen pop-up with siren sound: 'WARNING: Your PC is infected with 3 viruses. Call 1-800-XXX-XXXX immediately. Do not turn off your computer.'",
        "correct_action": "report",
        "red_flags": "Tech support scam pattern; browsers cannot detect viruses; Microsoft never calls users; siren is social engineering; pressure to act fast.",
        "options": ["Call the number", "Close the tab via task manager", "Run an antivirus scan", "Restart the computer"],
        "extra_data": {"scenario_name": "Browser tech support pop-up scam", "fake_url": "n/a (overlay popup)", "ssl_status": "n/a"}
    },
    {
        "category": "fake_website",
        "difficulty": "expert",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "wellsfargo.com.security-update.co — Wells Fargo verification",
        "body": "Subdomain trick: the real domain is 'security-update.co', not 'wellsfargo.com'. Page perfectly mimics Wells Fargo banking login and asks for username, password, and SSN last 4.",
        "correct_action": "report",
        "red_flags": "The actual domain is the rightmost part before the TLD — here it's 'security-update.co', not wellsfargo; subdomain spoofing.",
        "options": ["Log in — domain starts with wellsfargo", "Inspect actual domain (rightmost)", "Verify via mobile banking app", "Both: inspect AND verify in app"],
        "extra_data": {"scenario_name": "Subdomain spoofing attack", "fake_url": "https://wellsfargo.com.security-update.co/login", "ssl_status": "valid", "domain_age_days": 4}
    },
    {
        "category": "fake_website",
        "difficulty": "expert",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "Punycode IDN domain — xn--80ak6aa92e.com displayed as apple.com",
        "body": "URL bar shows what looks like apple.com but is actually a Punycode domain (xn--80ak6aa92e.com) using mixed Cyrillic/Latin characters. Page is a flawless Apple ID login.",
        "correct_action": "report",
        "red_flags": "Punycode/IDN attack; modern browsers usually show xn-- but not always; bookmark real sites; cert may even be valid.",
        "options": ["Sign in", "Disable JavaScript and retry", "Check raw URL via 'view info' and report", "Use Apple's app instead"],
        "extra_data": {"scenario_name": "Punycode IDN homograph attack", "fake_url": "https://xn--80ak6aa92e.com", "ssl_status": "valid", "domain_age_days": 9}
    },
    {
        "category": "fake_website",
        "difficulty": "expert",
        "type": "fake_website",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "Cloned charity site — disasterrelief-ukraine2026.org",
        "body": "Highly polished charity site asking for crypto donations to help earthquake victims. Real-looking photos, fake press logos (BBC, CNN), wallet addresses listed. No registered nonprofit details.",
        "correct_action": "report",
        "red_flags": "No charity registration number; crypto-only donations (untraceable); recently registered domain; emotional manipulation via crisis; press logos can be copy-pasted.",
        "options": ["Donate crypto", "Verify on Charity Navigator first", "Donate small amount to test", "Share on social media"],
        "extra_data": {"scenario_name": "Disaster relief charity fraud", "fake_url": "https://disasterrelief-ukraine2026.org", "ssl_status": "valid", "domain_age_days": 6}
    },
]


# ============================================================
# 3. QR ATTACK  (8 scenarios)
# ============================================================
QR_ATTACK = [
    {
        "category": "qr_attack",
        "difficulty": "beginner",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "Parking Meter",
        "subject": "Sticker QR on a parking meter — 'Scan to pay'",
        "body": "You're parking downtown. There's a QR code sticker on the meter that says 'Scan to pay quickly'. The sticker looks like it was placed over the original payment area.",
        "correct_action": "ignore",
        "red_flags": "Sticker placed over original (quishing tactic); pay via the city's official parking app instead; QR codes on public surfaces are commonly tampered.",
        "options": ["Scan to pay", "Use the city's official parking app", "Ask a passerby if it's legit", "Pay in cash inside"],
        "extra_data": {"scenario_name": "Parking meter quishing", "destination_url": "http://parking-pay-quick.com/meter-3829"}
    },
    {
        "category": "qr_attack",
        "difficulty": "beginner",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "Restaurant",
        "subject": "QR menu at a restaurant table",
        "body": "Standard restaurant QR menu sticker. Scanning takes you to a domain 'menu-order-cafe.net' that asks you to log in with Google before viewing the menu.",
        "correct_action": "ignore",
        "red_flags": "Menus don't require Google login; suspicious domain not tied to the restaurant; OAuth phishing pattern.",
        "options": ["Log in with Google to view menu", "Ask the waiter for a paper menu", "Use a throwaway email", "Allow Google sign-in once"],
        "extra_data": {"scenario_name": "Restaurant menu OAuth phishing", "destination_url": "https://menu-order-cafe.net/login"}
    },
    {
        "category": "qr_attack",
        "difficulty": "intermediate",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "Email attachment",
        "subject": "QR code in a 'DocuSign' email attachment (PDF)",
        "body": "An email from 'docusign-notification@docs-sign.com' contains a PDF with a QR code to 'view and sign the contract'. The QR points to docs-sign.com/contract.",
        "correct_action": "report",
        "red_flags": "Quishing in PDF bypasses email link scanners; real DocuSign sends links not QR codes; sender domain is not docusign.com.",
        "options": ["Scan the QR with phone", "Log into DocuSign.com directly", "Reply asking sender to confirm", "Open the QR link in a sandbox"],
        "extra_data": {"scenario_name": "Quishing in PDF attachment", "destination_url": "https://docs-sign.com/contract/x82h"}
    },
    {
        "category": "qr_attack",
        "difficulty": "intermediate",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "Hotel reception",
        "subject": "Hotel WiFi QR — 'Scan to connect to free WiFi'",
        "body": "A QR card on the desk at hotel reception says 'Free WiFi — scan to connect'. The card looks slightly off-color compared to other hotel signage.",
        "correct_action": "ignore",
        "red_flags": "Could be a rogue replacement card; QR can configure WiFi to a rogue hotspot or push a config profile; verify SSID with reception verbally.",
        "options": ["Scan to join WiFi", "Ask reception for WiFi name & password", "Use mobile data instead", "Both: ask reception AND use mobile data"],
        "extra_data": {"scenario_name": "Hotel rogue WiFi via QR", "destination_url": "wifi://config?ssid=Hotel_FREE&pw=guestaccess"}
    },
    {
        "category": "qr_attack",
        "difficulty": "advanced",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "Conference badge",
        "subject": "Networking QR badge at a conference",
        "body": "At a security conference, someone wears a lanyard with a QR badge that says 'Scan to connect on LinkedIn'. The QR resolves to a vCard download that opens a permissions popup on your phone.",
        "correct_action": "ignore",
        "red_flags": "vCard files can contain malicious payloads; legitimate LinkedIn connects don't require permissions popups; trust manual LinkedIn search.",
        "options": ["Allow the vCard download", "Search the person on LinkedIn manually", "Scan and forward to IT", "Scan from a sandboxed device"],
        "extra_data": {"scenario_name": "Malicious conference vCard QR", "destination_url": "data:text/x-vcard;base64,QkVHSU46VkNBUkQK..."}
    },
    {
        "category": "qr_attack",
        "difficulty": "advanced",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "Crypto airdrop poster",
        "subject": "QR poster offering 'free crypto airdrop'",
        "body": "Poster on the street: 'Scan to claim 0.05 ETH free airdrop — limited to first 1000 users'. QR leads to a Web3 wallet-connect page asking to approve a smart contract.",
        "correct_action": "ignore",
        "red_flags": "Wallet-drainer contracts; never approve unknown contracts; legitimate airdrops don't require asset approvals; too-good-to-be-true.",
        "options": ["Scan and connect wallet", "Walk away", "Connect with empty wallet to test", "Scan and read the contract first"],
        "extra_data": {"scenario_name": "Crypto wallet drainer airdrop QR", "destination_url": "https://eth-airdrop-claim.xyz/connect"}
    },
    {
        "category": "qr_attack",
        "difficulty": "expert",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "Internal notice",
        "subject": "QR poster in office break room: 'MFA setup — scan to register'",
        "body": "Printed notice in the office break room: 'New MFA policy — all employees must scan and register by Friday.' The poster has IT department branding but isn't posted on internal channels.",
        "correct_action": "report",
        "red_flags": "MFA enrollment in real orgs goes through the IT helpdesk or SSO portal, not random QR posters; insider attack pattern; verify with IT directly.",
        "options": ["Scan and follow the instructions", "Verify via IT helpdesk ticket", "Take a photo and report", "Both: report AND ignore"],
        "extra_data": {"scenario_name": "MFA enrollment quishing (insider)", "destination_url": "https://mfa-setup-corp.com/enroll"}
    },
    {
        "category": "qr_attack",
        "difficulty": "expert",
        "type": "qr_attack",
        "sender_email": "n/a",
        "sender_name": "ATM screen",
        "subject": "ATM screen QR code for 'mobile cash withdrawal'",
        "body": "An ATM screen shows a QR code: 'Scan to withdraw cash via mobile — no card needed'. The QR resolves to a banking lookalike app installation page (.apk file).",
        "correct_action": "report",
        "red_flags": "APK side-loading is a common Android attack; banks don't deploy apps via ATM QR; could be an overlay attack on the ATM.",
        "options": ["Scan and install the app", "Notify bank security and walk away", "Install on a spare phone", "Try the official bank app instead"],
        "extra_data": {"scenario_name": "Malicious ATM QR with APK drop", "destination_url": "https://bank-mobile-cash.apk"}
    },
]


# ============================================================
# 4. VISHING  (8 scenarios)
# ============================================================
VISHING = [
    {
        "category": "vishing",
        "difficulty": "beginner",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "+1-800-555-0199",
        "subject": "Unknown caller — claims to be IRS",
        "body": "Caller: 'This is Officer Davis from the IRS. You owe $4,200 in back taxes. Pay today via gift cards or a warrant will be issued.' Voice is robotic and slightly distorted.",
        "correct_action": "ignore",
        "red_flags": "IRS never calls demanding immediate payment; never accepts gift cards; threats and urgency; robotic voice often indicates a spoofed/scam call.",
        "options": ["Pay with gift cards", "Hang up immediately", "Ask for a callback number", "Transfer to manager"],
        "extra_data": {"scenario_name": "IRS gift card scam", "caller_id_spoofed": True, "duration_seconds": 90}
    },
    {
        "category": "vishing",
        "difficulty": "beginner",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "+1-415-XXX-XXXX",
        "subject": "Caller claiming to be from Microsoft tech support",
        "body": "Caller: 'Hello, we detected viruses on your Windows PC. I need remote access via AnyDesk to clean it. Please install this software now.'",
        "correct_action": "ignore",
        "red_flags": "Microsoft never makes unsolicited calls; never grant remote access to unknown callers; AnyDesk/TeamViewer for unsolicited support is a major red flag.",
        "options": ["Install AnyDesk and let them in", "Hang up and run your own AV scan", "Ask them to email proof first", "Schedule a callback"],
        "extra_data": {"scenario_name": "Fake Microsoft tech support", "caller_id_spoofed": True, "duration_seconds": 180}
    },
    {
        "category": "vishing",
        "difficulty": "intermediate",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "Bank fraud dept (official number)",
        "subject": "Caller verifying a 'suspicious transaction' on your card",
        "body": "Caller ID shows your real bank's fraud hotline. 'We noticed a $640 charge at Best Buy. To verify, can you read me the 6-digit OTP we just sent to your phone?'",
        "correct_action": "ignore",
        "red_flags": "Caller ID is trivially spoofable; banks never ask for OTP codes; hang up and call the number on the back of your card.",
        "options": ["Read the OTP", "Hang up and call bank back directly", "Ask the caller to verify your last 4 of SSN first", "Place caller on hold and call bank"],
        "extra_data": {"scenario_name": "OTP harvesting via bank impersonation", "caller_id_spoofed": True, "duration_seconds": 240}
    },
    {
        "category": "vishing",
        "difficulty": "intermediate",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "Delivery courier",
        "subject": "Caller says your package needs an 'identity verification code'",
        "body": "Caller: 'Hi, I'm trying to deliver your Amazon package but the system needs your verification code. Can you read me the code you received in SMS?'",
        "correct_action": "ignore",
        "red_flags": "Couriers don't need OTPs; that 'code' is your account/MFA code being phished; legit deliveries never require this.",
        "options": ["Read the SMS code", "Refuse and check Amazon app", "Ask for tracking number first", "Reschedule delivery via app"],
        "extra_data": {"scenario_name": "Delivery OTP phishing call", "caller_id_spoofed": False, "duration_seconds": 60}
    },
    {
        "category": "vishing",
        "difficulty": "advanced",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "IT helpdesk (looks internal)",
        "subject": "Caller from 'IT' asking to reset your VPN",
        "body": "Caller knows your name and team, claims VPN cert needs rotation. Asks you to share screen via Teams and run a PowerShell command they'll dictate.",
        "correct_action": "report",
        "red_flags": "Real IT uses ticketing systems; never runs ad-hoc PowerShell from a call; attacker has likely scraped LinkedIn for org info; verify via ticket.",
        "options": ["Share screen and run command", "Hang up, open ticket, verify caller", "Run command in safe mode first", "Ask for caller's manager"],
        "extra_data": {"scenario_name": "Helpdesk impersonation with PowerShell payload", "caller_id_spoofed": True, "duration_seconds": 600}
    },
    {
        "category": "vishing",
        "difficulty": "advanced",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "Crying voice — 'your relative'",
        "subject": "Family emergency scam call",
        "body": "Sobbing caller: 'It's me, I'm in jail in Mexico. Don't tell mom. I need $3,000 wired to this account within an hour or they'll move me to a worse facility.'",
        "correct_action": "ignore",
        "red_flags": "Emotional manipulation; vague voice; never wire urgently to unknown accounts; verify by calling family member's known number; family-emergency scam pattern.",
        "options": ["Wire money immediately", "Hang up and call the family member directly", "Ask security questions only the relative knows", "Both: ask security questions AND verify by direct call"],
        "extra_data": {"scenario_name": "Grandparent / family emergency scam", "caller_id_spoofed": True, "duration_seconds": 300}
    },
    {
        "category": "vishing",
        "difficulty": "expert",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "Voice cloned — your CFO",
        "subject": "AI voice-cloned CFO requesting urgent wire transfer",
        "body": "Caller sounds exactly like your CFO (AI voice clone from public videos). 'I'm boarding, need you to wire $48,000 to this supplier urgently. I'll send paperwork later. Confidential.'",
        "correct_action": "report",
        "red_flags": "Deepfake voice attacks rising sharply; 'confidential + urgent + send later paperwork' is the BEC pattern; always verify wires via independent channel.",
        "options": ["Wire the money", "Verify via Slack/in-person", "Reply 'I'll do it after I confirm with treasury'", "Both: refuse AND report to security"],
        "extra_data": {"scenario_name": "AI voice-cloned CFO BEC", "caller_id_spoofed": True, "duration_seconds": 120}
    },
    {
        "category": "vishing",
        "difficulty": "expert",
        "type": "vishing",
        "sender_email": "n/a",
        "sender_name": "Recruiter — slick voice",
        "subject": "Recruiter offering 'background check' via phone",
        "body": "Smooth-talking 'recruiter' calls about an interview. Says they need your full SSN, mother's maiden name, and bank info over the phone to 'run a background check and set up payroll'.",
        "correct_action": "ignore",
        "red_flags": "Background checks happen post-offer in writing; never via cold call; full SSN + maiden name = identity theft kit.",
        "options": ["Provide the info", "Refuse and verify company exists", "Provide partial info to test", "Ask to email instead"],
        "extra_data": {"scenario_name": "Recruiter identity-theft call", "caller_id_spoofed": False, "duration_seconds": 480}
    },
]


# ============================================================
# 5. USB DROP  (8 scenarios)
# ============================================================
USB_DROP = [
    {
        "category": "usb_drop",
        "difficulty": "beginner",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "USB stick in the office parking lot",
        "body": "Walking to your car, you find a 16GB USB stick labeled 'Q4 Bonuses — CONFIDENTIAL'. The lure is obvious.",
        "correct_action": "report",
        "red_flags": "USB baiting; juicy label designed to bait insertion; HID payloads can run instantly on insert; hand to IT.",
        "options": ["Plug in to find owner", "Hand to IT/security", "Plug into a personal laptop", "Throw it away"],
        "extra_data": {"scenario_name": "Bonus-list USB lure", "device_label": "Q4 Bonuses — CONFIDENTIAL", "device_type": "USB Mass Storage"}
    },
    {
        "category": "usb_drop",
        "difficulty": "beginner",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "Anonymous mail",
        "subject": "USB stick mailed to your office, no return address",
        "body": "A padded envelope arrives at your desk with just a USB stick inside. No letter, no return address. Label reads 'Press kit — embargo'.",
        "correct_action": "report",
        "red_flags": "Unsolicited mailed USBs are a known attack vector against journalists/execs; no return address; do not insert.",
        "options": ["Insert to check contents", "Insert in an air-gapped sandbox VM", "Report to security and isolate", "Throw in trash"],
        "extra_data": {"scenario_name": "Mailed anonymous USB", "device_label": "Press kit — embargo", "device_type": "USB Mass Storage"}
    },
    {
        "category": "usb_drop",
        "difficulty": "intermediate",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "USB found in conference room after a meeting",
        "body": "After a vendor meeting, you find a USB stick on the conference table. It has a corporate-looking logo for 'TechVendor Inc.' which was one of the attending companies.",
        "correct_action": "report",
        "red_flags": "Plausible-source lure; an attacker may print any logo; report to IT and let them contact the vendor to verify.",
        "options": ["Plug in to check who owns it", "Email vendor directly to verify", "Give to IT to handle", "Leave on table for owner to return"],
        "extra_data": {"scenario_name": "Branded USB plausible-source lure", "device_label": "TechVendor Inc.", "device_type": "USB Mass Storage"}
    },
    {
        "category": "usb_drop",
        "difficulty": "intermediate",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "USB charger left in airport lounge",
        "body": "A USB charger cable with a small adapter is plugged into the wall in the airport lounge. Your phone is at 8%.",
        "correct_action": "ignore",
        "red_flags": "'Juice jacking' attack — malicious cables/chargers can deliver payloads or steal data; carry your own brick.",
        "options": ["Plug in — you need power", "Use only with a USB data-blocker", "Use your own charger from a wall outlet", "Borrow charger from gate agent"],
        "extra_data": {"scenario_name": "Juice jacking — airport charger", "device_label": "(unbranded charger)", "device_type": "USB Charger"}
    },
    {
        "category": "usb_drop",
        "difficulty": "advanced",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "USB-shaped 'BadUSB' device disguised as a keyboard",
        "body": "You find a USB device that looks ordinary but acts as a Human Interface Device (HID). On insertion, the OS instantly trusts it as a keyboard and starts typing commands.",
        "correct_action": "report",
        "red_flags": "BadUSB / Rubber Ducky attack; auto-runs keystrokes the moment it's plugged in; can install backdoors in seconds; HID devices bypass storage warnings.",
        "options": ["Plug in to investigate", "Hand to IT for forensic analysis", "Plug in with autorun disabled", "Plug into a phone instead"],
        "extra_data": {"scenario_name": "BadUSB / Rubber Ducky HID attack", "device_label": "(generic USB stick)", "device_type": "HID Keyboard (disguised)"}
    },
    {
        "category": "usb_drop",
        "difficulty": "advanced",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "USB drop near the parking lot security camera",
        "body": "Three identical USB sticks are scattered near the camera-covered employee entrance, all labeled 'Internal — HR'. It looks staged.",
        "correct_action": "report",
        "red_flags": "Pattern of staged drops near entrances is a classic red-team / real-attack technique; never insert; report all of them.",
        "options": ["Pick one up and insert it", "Collect all and hand to security", "Take one home to investigate", "Leave them and ignore"],
        "extra_data": {"scenario_name": "Staged USB drop pattern", "device_label": "Internal — HR", "device_type": "USB Mass Storage (x3)"}
    },
    {
        "category": "usb_drop",
        "difficulty": "expert",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "n/a",
        "subject": "USB cable swap on your desk — looks identical to your real one",
        "body": "You return from lunch. Your USB-C cable looks the same but has a slightly bulkier connector. It's an 'O.MG' style cable with a Wi-Fi implant that exfiltrates keystrokes.",
        "correct_action": "report",
        "red_flags": "O.MG / malicious cable attack; physical-access supply-chain swap; check serial numbers; restrict desk access; report any tampering.",
        "options": ["Use the cable, it works", "Compare to a known-good cable and report", "Throw it away quietly", "Wrap in foil to block Wi-Fi"],
        "extra_data": {"scenario_name": "O.MG malicious cable swap", "device_label": "(USB-C cable, looks normal)", "device_type": "Active USB cable with Wi-Fi implant"}
    },
    {
        "category": "usb_drop",
        "difficulty": "expert",
        "type": "usb_drop",
        "sender_email": "n/a",
        "sender_name": "Vendor demo USB",
        "subject": "Vendor handing out USBs at trade show booth",
        "body": "At a trade show, a vendor hands out branded USBs containing 'their latest product brochure'. Hundreds of attendees plug them in directly into work laptops.",
        "correct_action": "report",
        "red_flags": "Even legitimate vendors have been compromised in supply chain attacks; corporate IT policies typically forbid plugging promotional USBs into work machines.",
        "options": ["Plug into work laptop — vendor is reputable", "Plug only into isolated VM/sandbox", "Discard or hand to IT", "Both: discard AND inform other attendees"],
        "extra_data": {"scenario_name": "Trade show promotional USB", "device_label": "(vendor logo)", "device_type": "USB Mass Storage"}
    },
]


# ============================================================
# 6. INTERNAL CHAT  (8 scenarios)
# ============================================================
INTERNAL_CHAT = [
    {
        "category": "internal_chat",
        "difficulty": "beginner",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@new.intern",
        "subject": "Slack DM from a new intern asking for VPN config",
        "body": "Hi! I'm the new intern starting today. My laptop isn't set up and I need to push code by EOD. Can you send me the VPN config file and credentials? Manager said you'd help.",
        "correct_action": "report",
        "red_flags": "No formal onboarding from HR; bypassing IT; pressure ('EOD'); appeal to authority ('manager said'); verify identity with HR before sharing.",
        "options": ["Send VPN config", "Verify with HR and manager first", "Send config but not credentials", "Help via screen share"],
        "extra_data": {"scenario_name": "Fake intern VPN request", "platform": "slack"}
    },
    {
        "category": "internal_chat",
        "difficulty": "beginner",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@external_user",
        "subject": "Teams chat from external contractor offering 'free training'",
        "body": "External user joins your Teams channel and DMs: 'Hi! Free cybersecurity training for your team — just click this link to enroll.' Link points to a domain you don't recognize.",
        "correct_action": "report",
        "red_flags": "Unsolicited external link in internal channel; reverse social engineering; report and remove external user.",
        "options": ["Click link to evaluate", "Report and remove external user", "Forward to team for opinion", "Reply asking for credentials of trainer"],
        "extra_data": {"scenario_name": "External contractor training scam", "platform": "teams"}
    },
    {
        "category": "internal_chat",
        "difficulty": "intermediate",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@manager_clone",
        "subject": "Slack DM from a Slack account impersonating your manager",
        "body": "Your real manager's display name and avatar — but the @username is slightly off (added an underscore). 'Hey, are you free? Need a favor, please buy 5 Apple gift cards and send the codes.'",
        "correct_action": "report",
        "red_flags": "Username slightly off; gift card request; classic BEC over Slack; verify in person or call.",
        "options": ["Buy the gift cards", "Verify in person or by phone", "Reply asking to confirm via email", "Report to security"],
        "extra_data": {"scenario_name": "Manager impersonation gift card scam", "platform": "slack"}
    },
    {
        "category": "internal_chat",
        "difficulty": "intermediate",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@helpdesk_bot",
        "subject": "Discord message from a 'helpdesk' bot in your gaming server",
        "body": "Bot DMs: 'Your account has been flagged. Verify with your Discord token to avoid ban. Press F12, paste this code: webhook.send(token).'",
        "correct_action": "report",
        "red_flags": "Token theft via JavaScript console; Discord support never asks for tokens; report the bot.",
        "options": ["Paste the code as instructed", "Report bot and block", "Try in incognito mode", "Reset Discord password first"],
        "extra_data": {"scenario_name": "Discord token theft via DevTools", "platform": "discord"}
    },
    {
        "category": "internal_chat",
        "difficulty": "advanced",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@former_colleague",
        "subject": "WhatsApp from a colleague who left 6 months ago",
        "body": "'Hey! I'm at a new company now. We're hiring — can you send me your contact list / org chart? I'll get a referral bonus and split with you.'",
        "correct_action": "ignore",
        "red_flags": "Could be the colleague's hacked account, or social engineering for data exfiltration; sharing org chart violates confidentiality.",
        "options": ["Send the contacts", "Call the colleague directly to verify", "Send only public LinkedIn names", "Refuse and report internally"],
        "extra_data": {"scenario_name": "Ex-colleague data exfiltration", "platform": "whatsapp"}
    },
    {
        "category": "internal_chat",
        "difficulty": "advanced",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@github_user",
        "subject": "GitHub issue comment asking for env file 'to reproduce bug'",
        "body": "A stranger opens an issue on your open-source repo: 'Can't reproduce. Please share your .env file and the database dump so I can debug.'",
        "correct_action": "report",
        "red_flags": "Never share .env (contains secrets); legitimate bugs are reproducible with sample data; aggressive social engineering on OSS maintainers.",
        "options": ["Share the .env", "Refuse and ask for a minimal reproducer", "Share a redacted .env", "Close the issue without responding"],
        "extra_data": {"scenario_name": "Open-source maintainer secrets phishing", "platform": "github"}
    },
    {
        "category": "internal_chat",
        "difficulty": "expert",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@compromised_teammate",
        "subject": "Slack message from a real teammate's hijacked account",
        "body": "Teammate's actual Slack account suddenly DMs you a Zoom link at 2am: 'urgent client call now, join.' The Zoom URL is on 'zooom.us' (extra o).",
        "correct_action": "report",
        "red_flags": "Account takeover; time of message off; typosquat URL; verify by calling teammate's phone; report immediately.",
        "options": ["Click the Zoom link", "Call teammate by phone first", "Reply asking a personal question only teammate knows", "Both: refuse and report"],
        "extra_data": {"scenario_name": "Teammate Slack account takeover", "platform": "slack"}
    },
    {
        "category": "internal_chat",
        "difficulty": "expert",
        "type": "internal_chat",
        "sender_email": "n/a",
        "sender_name": "@contractor_with_access",
        "subject": "Insider contractor asking you to bypass review for a code merge",
        "body": "A contractor with repo access pings you: 'Hey, my PR is blocked by review. Can you approve without reading it? I'll owe you. We need this in prod tonight.'",
        "correct_action": "report",
        "red_flags": "Approval-without-review violates SDLC controls; insider threat possibility; report to security/team lead.",
        "options": ["Approve as a favor", "Refuse and review the PR properly", "Approve only the non-sensitive files", "Refuse and report to team lead"],
        "extra_data": {"scenario_name": "Insider review-bypass request", "platform": "slack"}
    },
]


# ============================================================
# 7. ATTACHMENT SANDBOX  (8 scenarios)
# ============================================================
ATTACHMENT_SANDBOX = [
    {
        "category": "attachment_sandbox",
        "difficulty": "beginner",
        "type": "attachment_sandbox",
        "sender_email": "hr@company.com",
        "sender_name": "HR",
        "subject": "Holiday-schedule.exe",
        "body": "Attachment named 'Holiday-schedule.exe' arrives in an email about the new holiday calendar.",
        "correct_action": "report",
        "red_flags": "HR documents are never .exe; executables in email are inherently suspicious; classic malware delivery.",
        "options": ["Run the executable", "Report to IT/security", "Run it on a VM", "Save it for later"],
        "extra_data": {"scenario_name": "Exe disguised as schedule", "filename": "Holiday-schedule.exe", "file_type": "exe", "sandbox_verdict": "malicious"}
    },
    {
        "category": "attachment_sandbox",
        "difficulty": "beginner",
        "type": "attachment_sandbox",
        "sender_email": "billing@vendor.com",
        "sender_name": "Vendor Billing",
        "subject": "Invoice.zip — please process",
        "body": "ZIP file attached. Inside is a single .js file: 'invoice.js'. The email asks you to 'just double-click to view the invoice'.",
        "correct_action": "report",
        "red_flags": "Invoices are PDFs, not JS files; .js files run scripts; ZIP wrapping evades email scanning.",
        "options": ["Open the JS file", "Delete and report", "Forward to accounting", "Open the ZIP just to peek"],
        "extra_data": {"scenario_name": "JS payload in ZIP invoice", "filename": "invoice.zip > invoice.js", "file_type": "zip+js", "sandbox_verdict": "malicious"}
    },
    {
        "category": "attachment_sandbox",
        "difficulty": "intermediate",
        "type": "attachment_sandbox",
        "sender_email": "supplier@company-co.org",
        "sender_name": "Supplier",
        "subject": "Quote.docm — please review and approve",
        "body": "A Word document with macros (.docm extension). Opens with a prompt: 'This document requires you to enable content/macros to view properly.'",
        "correct_action": "report",
        "red_flags": "Macro-enabled Word files (.docm) are a primary malware vector; modern Office blocks them by default; 'enable content' is social engineering.",
        "options": ["Enable macros and view", "Open in Protected View only", "Open and refuse macros", "Delete and report"],
        "extra_data": {"scenario_name": "Malicious Office macro", "filename": "Quote.docm", "file_type": "docm", "sandbox_verdict": "malicious"}
    },
    {
        "category": "attachment_sandbox",
        "difficulty": "intermediate",
        "type": "attachment_sandbox",
        "sender_email": "legal-team@outside-counsel.com",
        "sender_name": "Outside Counsel",
        "subject": "Contract.pdf with embedded JavaScript",
        "body": "A PDF attachment from outside counsel. The PDF contains JavaScript that triggers a 'Click here to view full agreement' button. Click leads to a credential-harvesting page.",
        "correct_action": "report",
        "red_flags": "PDFs can run JavaScript; clicking inside a PDF can navigate to external URLs; verify with counsel via known phone number.",
        "options": ["Click the button to view", "Open in a PDF viewer with JS disabled", "Verify with counsel by phone", "Both: verify AND disable JS"],
        "extra_data": {"scenario_name": "PDF with malicious JS button", "filename": "Contract.pdf", "file_type": "pdf", "sandbox_verdict": "suspicious"}
    },
    {
        "category": "attachment_sandbox",
        "difficulty": "advanced",
        "type": "attachment_sandbox",
        "sender_email": "client@partner-firm.com",
        "sender_name": "Client",
        "subject": "Sales_data.xlsm (Excel with macros)",
        "body": "Client emails their .xlsm file with a comment: 'Open and run the macros — they auto-populate the report.' The macros download a payload from an external URL.",
        "correct_action": "report",
        "red_flags": "Excel macros downloading external content is high-risk; analyze in sandbox; insist client send a flat CSV instead.",
        "options": ["Run macros, the client is trusted", "Ask client for a CSV version", "Open in sandbox VM and analyze", "Both: ask for CSV AND analyze in sandbox"],
        "extra_data": {"scenario_name": "Excel macro downloader", "filename": "Sales_data.xlsm", "file_type": "xlsm", "sandbox_verdict": "malicious"}
    },
    {
        "category": "attachment_sandbox",
        "difficulty": "advanced",
        "type": "attachment_sandbox",
        "sender_email": "design@agency.io",
        "sender_name": "Design Agency",
        "subject": "Logo_final.svg",
        "body": "SVG file from a design vendor. SVGs can contain inline JavaScript. Opening it in a browser executes embedded scripts.",
        "correct_action": "report",
        "red_flags": "SVGs are XML and can carry JS payloads; open only in raster preview, not browser; verify with vendor.",
        "options": ["Double-click to open in browser", "Open in a raster image preview only", "Convert to PNG first via untrusted online tool", "Both: preview only AND scan with AV"],
        "extra_data": {"scenario_name": "Malicious SVG with embedded JS", "filename": "Logo_final.svg", "file_type": "svg", "sandbox_verdict": "suspicious"}
    },
    {
        "category": "attachment_sandbox",
        "difficulty": "expert",
        "type": "attachment_sandbox",
        "sender_email": "iso-distribution@vendor-eu.net",
        "sender_name": "Vendor EU",
        "subject": "Software_v2.iso — please install",
        "body": "An ISO file attachment that mounts as a virtual drive on Windows. Inside is an .lnk shortcut that runs a hidden PowerShell payload.",
        "correct_action": "report",
        "red_flags": "ISO containers bypass Mark-of-the-Web protections; .lnk files inside are a known TA570/Emotet pattern; never auto-mount unknown ISOs.",
        "options": ["Mount the ISO and install", "Hand to security for analysis", "Mount on an isolated VM", "Both: hand to security AND don't mount"],
        "extra_data": {"scenario_name": "ISO + LNK payload (MoTW bypass)", "filename": "Software_v2.iso", "file_type": "iso", "sandbox_verdict": "malicious"}
    },
    {
        "category": "attachment_sandbox",
        "difficulty": "expert",
        "type": "attachment_sandbox",
        "sender_email": "newsletter@trusted-blog.io",
        "sender_name": "Trusted Blog",
        "subject": "Article.html (single-file HTML smuggling)",
        "body": "Email asks you to open an attached HTML file 'to view the article offline'. The HTML uses HTML smuggling to assemble a malicious binary in your browser using JavaScript blobs.",
        "correct_action": "report",
        "red_flags": "HTML smuggling reconstructs payloads client-side, bypassing email/web filters; never open standalone HTML attachments from email.",
        "options": ["Open in browser", "Open in plain-text editor only", "Convert to PDF first online", "Delete and report"],
        "extra_data": {"scenario_name": "HTML smuggling attack", "filename": "Article.html", "file_type": "html", "sandbox_verdict": "malicious"}
    },
]


# ============================================================
# 8. BROWSER EXPLOIT  (8 scenarios)
# ============================================================
BROWSER_EXPLOIT = [
    {
        "category": "browser_exploit",
        "difficulty": "beginner",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "Browser pop-up",
        "subject": "'Update your Flash Player to continue' pop-up",
        "body": "A site pops up: 'Your Flash Player is out of date. Click here to update.' Flash was end-of-life in 2020.",
        "correct_action": "report",
        "red_flags": "Flash is dead — any update prompt is malware; never install browser plugins from random sites; classic fake-update social engineering.",
        "options": ["Click update", "Close the tab", "Update from adobe.com just in case", "Allow once to see what happens"],
        "extra_data": {"scenario_name": "Fake Flash update", "exploit_type": "fake_update"}
    },
    {
        "category": "browser_exploit",
        "difficulty": "beginner",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "Browser permission popup",
        "subject": "Site asking for browser notification permission",
        "body": "A news site you didn't visit before requests permission to send browser notifications. After allowing, you get constant pop-ups with 'security alerts' urging you to click.",
        "correct_action": "report",
        "red_flags": "Notification spam is a malware vector; legitimate sites rarely need notifications; block by default; revoke via browser settings.",
        "options": ["Allow notifications", "Block notifications", "Allow then check", "Reset browser settings"],
        "extra_data": {"scenario_name": "Browser notification abuse", "exploit_type": "notification_spam"}
    },
    {
        "category": "browser_exploit",
        "difficulty": "intermediate",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "Chrome extension",
        "subject": "Extension requesting 'read and change all your data on all websites'",
        "body": "You're installing a small color-picker extension. Permissions screen asks: 'Read and change all your data on the websites you visit.' Reviews are mixed.",
        "correct_action": "ignore",
        "red_flags": "Over-permissioned extensions can steal cookies/session tokens; color-picker doesn't need 'all-sites'; check publisher and review count.",
        "options": ["Install anyway", "Find one with minimal permissions", "Install but disable when not in use", "Both: find minimal AND read reviews"],
        "extra_data": {"scenario_name": "Over-permissioned extension", "exploit_type": "malicious_extension"}
    },
    {
        "category": "browser_exploit",
        "difficulty": "intermediate",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "Captcha challenge",
        "subject": "Fake CAPTCHA asking you to paste commands into Run dialog",
        "body": "Site shows 'I'm not a robot — verify by pressing Win+R, Ctrl+V, Enter' with the verification text auto-copied to clipboard. The clipboard contains a PowerShell command.",
        "correct_action": "report",
        "red_flags": "ClickFix / FakeCaptcha attack; never paste into Run from a browser instruction; modern attack pattern targeting non-technical users.",
        "options": ["Follow the captcha steps", "Close the tab", "Paste into Notepad first to inspect", "Both: inspect AND close the tab"],
        "extra_data": {"scenario_name": "ClickFix / Fake CAPTCHA attack", "exploit_type": "clickfix"}
    },
    {
        "category": "browser_exploit",
        "difficulty": "advanced",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "Drive-by ad",
        "subject": "Malvertising on a legitimate news site",
        "body": "A legitimate news site you read daily serves an ad that silently triggers a drive-by exploit against an unpatched browser, attempting to drop a payload via a known CVE.",
        "correct_action": "report",
        "red_flags": "Malvertising can hit legitimate sites; keep browser patched; use ad blockers; isolate by browsing profile.",
        "options": ["Ignore — browser is safe", "Keep browser updated and use uBlock", "Switch to a different news site", "Disable JS for all news sites"],
        "extra_data": {"scenario_name": "Drive-by malvertising", "exploit_type": "drive_by"}
    },
    {
        "category": "browser_exploit",
        "difficulty": "advanced",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "WebRTC leak",
        "subject": "Site detects your real IP through WebRTC despite VPN",
        "body": "You're on a VPN but a site silently uses WebRTC to leak your real IP. The site then shows targeted phishing tailored to your local bank.",
        "correct_action": "report",
        "red_flags": "WebRTC IP leak is a real risk; disable WebRTC in privacy-focused browsers; advanced geotargeted phishing.",
        "options": ["Ignore — VPN protects me", "Disable WebRTC in browser flags", "Use a different browser", "Both: disable WebRTC AND verify VPN"],
        "extra_data": {"scenario_name": "WebRTC IP leak + targeted phish", "exploit_type": "webrtc_leak"}
    },
    {
        "category": "browser_exploit",
        "difficulty": "expert",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "Browser-in-the-browser",
        "subject": "Fake browser window inside a webpage (BitB attack)",
        "body": "A site renders a pixel-perfect fake browser window showing 'https://accounts.google.com/signin' inside its page. The 'window' is just HTML/CSS — not a real browser pop-up. Forms send creds to attacker.",
        "correct_action": "report",
        "red_flags": "Browser-in-the-Browser (BitB) attack; drag the fake window outside the browser viewport — it's stuck inside; verify URL by trying to grab the address bar.",
        "options": ["Sign in via the embedded window", "Try to drag the window outside the browser", "Open Google in a new tab manually", "Both: try drag AND open new tab"],
        "extra_data": {"scenario_name": "Browser-in-the-Browser (BitB)", "exploit_type": "bitb"}
    },
    {
        "category": "browser_exploit",
        "difficulty": "expert",
        "type": "browser_exploit",
        "sender_email": "n/a",
        "sender_name": "Zero-day site",
        "subject": "Zero-day exploit chain on a watering-hole site",
        "body": "An industry blog frequently visited by people in your sector has been compromised. It serves a Chrome zero-day chain that gains code execution without any user click.",
        "correct_action": "report",
        "red_flags": "Watering-hole attacks target a profession by compromising sites they trust; auto-update + isolation + EDR is the only defense; report to security team.",
        "options": ["Keep browsing — sites are usually safe", "Update browser immediately and report", "Switch to mobile to read", "Both: update AND report to security"],
        "extra_data": {"scenario_name": "Watering-hole zero-day", "exploit_type": "watering_hole_zeroday"}
    },
]


# ============================================================
# 9. MFA FATIGUE  (8 scenarios)
# ============================================================
MFA_FATIGUE = [
    {
        "category": "mfa_fatigue",
        "difficulty": "beginner",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "Authenticator app",
        "subject": "Single unexpected MFA push notification",
        "body": "You receive one Microsoft Authenticator push: 'Approve sign-in to office.com from Brazil?' You're not signing in.",
        "correct_action": "report",
        "red_flags": "Unexpected MFA pushes mean your password is leaked; deny and change password; report to IT.",
        "options": ["Approve — must be a glitch", "Deny and change password", "Ignore and dismiss", "Approve once and watch"],
        "extra_data": {"scenario_name": "Single unexpected push", "push_count": 1}
    },
    {
        "category": "mfa_fatigue",
        "difficulty": "beginner",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "Authenticator app",
        "subject": "Push at 3 AM while you're asleep",
        "body": "Phone buzzes at 3 AM — you grog-eyed see 'Approve sign-in to AWS console'. You're not signing in.",
        "correct_action": "report",
        "red_flags": "Attackers time pushes for fatigue/sleep; deny, change password, report; off-hours pushes always suspicious.",
        "options": ["Approve to silence the notification", "Deny and silence app", "Deny, change password, report", "Snooze and check later"],
        "extra_data": {"scenario_name": "Late-night fatigue push", "push_count": 1}
    },
    {
        "category": "mfa_fatigue",
        "difficulty": "intermediate",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "Authenticator app",
        "subject": "10+ push notifications in 5 minutes",
        "body": "Your authenticator buzzes 12 times in 5 minutes. Each is 'Approve sign-in to Office 365'. The flood is overwhelming.",
        "correct_action": "report",
        "red_flags": "Classic MFA fatigue bombing; attacker has your password; deny ALL, change password immediately, report.",
        "options": ["Approve one to stop the flood", "Deny all and change password", "Mute the app", "Restart the phone"],
        "extra_data": {"scenario_name": "Push-bomb MFA fatigue", "push_count": 12}
    },
    {
        "category": "mfa_fatigue",
        "difficulty": "intermediate",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "Helpdesk caller",
        "subject": "'IT helpdesk' calling while pushes arrive",
        "body": "While push notifications flood your phone, your desk phone rings. Caller: 'IT here — we're running a scheduled test, please approve the pushes.'",
        "correct_action": "report",
        "red_flags": "Coordinated social engineering + push-bombing; never approve based on phone instruction; hang up, deny all, report.",
        "options": ["Approve as IT instructed", "Hang up, deny all, report", "Approve only one", "Ask the caller for their employee ID"],
        "extra_data": {"scenario_name": "Push-bomb + vishing combo", "push_count": 8}
    },
    {
        "category": "mfa_fatigue",
        "difficulty": "advanced",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "Authenticator app",
        "subject": "Number matching MFA — attacker provides number",
        "body": "Microsoft's number-matching MFA shows '47'. A text arrives: 'IT here — please enter 47 to complete maintenance.' Real attacker is logging in.",
        "correct_action": "report",
        "red_flags": "Even with number matching, social engineering can leak the number; never enter MFA numbers given to you in chat/sms/call.",
        "options": ["Enter 47 as instructed", "Deny and report to IT directly", "Enter and immediately revoke", "Forward the text to security"],
        "extra_data": {"scenario_name": "Number-matching MFA social engineering", "push_count": 1}
    },
    {
        "category": "mfa_fatigue",
        "difficulty": "advanced",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "Authenticator app",
        "subject": "MFA notification with familiar location ('your city')",
        "body": "Push: 'Approve sign-in from Mumbai, India' — your actual city. Looks legitimate.",
        "correct_action": "report",
        "red_flags": "Attackers proxy through residential IPs to fake your geo; if you didn't initiate, deny; never approve unprompted requests.",
        "options": ["Approve — same city", "Deny since not prompted", "Approve only if your laptop is open", "Deny and confirm via VPN client"],
        "extra_data": {"scenario_name": "Geo-spoofed MFA push", "push_count": 1}
    },
    {
        "category": "mfa_fatigue",
        "difficulty": "expert",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "SMS",
        "subject": "SIM-swap precursor: SMS-based MFA being targeted",
        "body": "Your carrier sends a 'port-out request received' SMS. Minutes later, an MFA code arrives for your bank that you didn't request.",
        "correct_action": "report",
        "red_flags": "SIM swap in progress; call carrier immediately to lock; move MFA to app-based; freeze bank online if possible.",
        "options": ["Ignore — must be a mistake", "Call carrier and bank immediately", "Wait to see if more codes arrive", "Both: call carrier AND switch to app MFA"],
        "extra_data": {"scenario_name": "SIM swap with MFA targeting", "push_count": 0}
    },
    {
        "category": "mfa_fatigue",
        "difficulty": "expert",
        "type": "mfa_fatigue",
        "sender_email": "n/a",
        "sender_name": "Authenticator app",
        "subject": "Attacker pushes AITM proxy session — MFA passes",
        "body": "You're on an Adversary-in-the-Middle phishing site that proxies real login. You approve a single push that you initiated, but the session cookie is captured by attacker.",
        "correct_action": "report",
        "red_flags": "AITM (Evilginx-style) defeats MFA; sign in only via bookmarked URLs; FIDO2 hardware keys resist this; report on sign-in anomalies.",
        "options": ["Approve — I initiated this", "Verify URL before logging in (FIDO2 key is best)", "Approve but log out immediately", "Both: verify URL AND use FIDO2"],
        "extra_data": {"scenario_name": "AITM session-cookie hijack", "push_count": 1}
    },
]


# ============================================================
# 10. CLOUD BREACH  (8 scenarios)
# ============================================================
CLOUD_BREACH = [
    {
        "category": "cloud_breach",
        "difficulty": "beginner",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "AWS Console",
        "subject": "Public S3 bucket: 'customer-photos' is open to the internet",
        "body": "AWS Trusted Advisor warning: an S3 bucket containing customer profile photos is configured with 'Public read access'. It contains 200,000 photos.",
        "correct_action": "report",
        "red_flags": "Public S3 buckets are the #1 cloud leak source; configure block-public-access; tag PII buckets; report and remediate immediately.",
        "options": ["Leave it — they're just photos", "Block public access immediately and report", "Move to a different region", "Delete the bucket"],
        "extra_data": {"scenario_name": "Public S3 bucket exposure", "asset_type": "s3_bucket"}
    },
    {
        "category": "cloud_breach",
        "difficulty": "beginner",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "Google Drive admin",
        "subject": "Sensitive doc shared 'anyone with the link'",
        "body": "Salary spreadsheet was shared 'anyone with the link can view'. The link was forwarded outside the company in a Slack channel.",
        "correct_action": "report",
        "red_flags": "Link-share leaks; restrict to specific users only; audit external sharing weekly.",
        "options": ["Leave it — link is hard to guess", "Restrict and audit access", "Move to a private folder", "Both: restrict AND audit"],
        "extra_data": {"scenario_name": "Drive link-share leak", "asset_type": "google_drive"}
    },
    {
        "category": "cloud_breach",
        "difficulty": "intermediate",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "GitHub secret scan",
        "subject": "AWS access key found committed to public repo",
        "body": "GitHub's secret scanning alerts you: an AWS_SECRET_ACCESS_KEY was committed to a public repo. AWS Config shows the key has been used by IPs in Russia.",
        "correct_action": "report",
        "red_flags": "Rotate keys immediately; revoking in git history isn't enough — must rotate; check CloudTrail for malicious activity.",
        "options": ["Force-push to remove the key from history", "Rotate the key AND audit CloudTrail", "Make the repo private", "Both: rotate AND audit"],
        "extra_data": {"scenario_name": "Leaked AWS key in public repo", "asset_type": "aws_iam_key"}
    },
    {
        "category": "cloud_breach",
        "difficulty": "intermediate",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "Azure portal",
        "subject": "Storage account with anonymous blob access",
        "body": "Azure storage account holding financial PDFs is configured with anonymous blob access enabled. URLs are guessable.",
        "correct_action": "report",
        "red_flags": "Anonymous blob access exposes sensitive data; enable private endpoints; audit all storage accounts; report.",
        "options": ["Leave — URLs are random", "Disable anonymous access immediately", "Add IP allowlist only", "Both: disable AND add allowlist"],
        "extra_data": {"scenario_name": "Azure blob anonymous access", "asset_type": "azure_storage"}
    },
    {
        "category": "cloud_breach",
        "difficulty": "advanced",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "IAM audit",
        "subject": "Service account with 'roles/owner' on the entire GCP project",
        "body": "A microservice runs with a service account granted 'roles/owner' — the most permissive role. Compromise of any pod gives full project control.",
        "correct_action": "report",
        "red_flags": "Principle of least privilege violated; use granular roles or workload identity federation; audit and downgrade ASAP.",
        "options": ["Keep — services need access", "Replace with least-privilege custom role", "Add conditional bindings", "Both: replace AND add conditions"],
        "extra_data": {"scenario_name": "Over-privileged GCP service account", "asset_type": "gcp_iam"}
    },
    {
        "category": "cloud_breach",
        "difficulty": "advanced",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "Snowflake admin",
        "subject": "Snowflake account compromised — no MFA enforced",
        "body": "A Snowflake user account with access to customer PII is breached via stolen credentials. The account had no MFA. Attacker exfiltrated 80M rows.",
        "correct_action": "report",
        "red_flags": "Real-world pattern (2024 Snowflake incidents); enforce MFA tenant-wide; rotate creds; enable network policies; report immediately.",
        "options": ["Enforce MFA on impacted user only", "Tenant-wide MFA + network policies + rotation", "Disable the account", "Both: tenant-wide MFA AND rotation"],
        "extra_data": {"scenario_name": "Snowflake credential breach", "asset_type": "snowflake_account"}
    },
    {
        "category": "cloud_breach",
        "difficulty": "expert",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "Kubernetes audit",
        "subject": "Misconfigured Kubernetes API exposed to internet",
        "body": "K8s API server is reachable on the public internet with anonymous auth allowed. Tesla-style mining exploit pattern.",
        "correct_action": "report",
        "red_flags": "K8s API publicly exposed is critical; disable anonymous auth; use private clusters; audit for cryptominers; rotate certs.",
        "options": ["Add firewall — quick fix", "Disable anonymous + move to private cluster", "Rotate kubeconfig only", "Both: disable AND move to private"],
        "extra_data": {"scenario_name": "Exposed K8s API anonymous auth", "asset_type": "k8s_cluster"}
    },
    {
        "category": "cloud_breach",
        "difficulty": "expert",
        "type": "cloud_breach",
        "sender_email": "n/a",
        "sender_name": "Cross-tenant alert",
        "subject": "OAuth app silently granted org-wide read across all mailboxes",
        "body": "An Azure AD admin app was granted Mail.Read.All without user consent. App is unfamiliar. It's been reading exec mailboxes for 3 weeks.",
        "correct_action": "report",
        "red_flags": "Illicit OAuth consent (consent phishing) is a major M365 attack; review enterprise apps; revoke unknown apps; alert on high-priv grants.",
        "options": ["Leave — apps are vetted", "Revoke app and audit logs", "Revoke and rotate impacted user creds", "Both: revoke AND audit + rotate"],
        "extra_data": {"scenario_name": "Illicit OAuth consent attack (M365)", "asset_type": "azure_oauth_app"}
    },
]


# ============================================================
# 11. INSIDER THREAT  (8 scenarios)
# ============================================================
INSIDER_THREAT = [
    {
        "category": "insider_threat",
        "difficulty": "beginner",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "Coworker",
        "subject": "Coworker asks to borrow your login 'for 5 minutes'",
        "body": "A coworker says: 'I'm locked out of my account and need to send a quick email. Can I just use yours for a minute?'",
        "correct_action": "ignore",
        "red_flags": "Never share credentials; audit trail integrity; coworker should ping IT; even with trust, sharing logins violates policy.",
        "options": ["Lend the login briefly", "Refuse and direct them to IT", "Type the password yourself", "Lend but watch them"],
        "extra_data": {"scenario_name": "Credential sharing request", "insider_type": "negligent"}
    },
    {
        "category": "insider_threat",
        "difficulty": "beginner",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "Departing employee",
        "subject": "Departing colleague mass-downloading from Drive",
        "body": "A colleague gave notice last week. DLP logs show them downloading 4 GB from Google Drive in two days — mostly client lists and proposals.",
        "correct_action": "report",
        "red_flags": "Common pre-departure exfil pattern; report to HR + security; revoke access immediately on last day.",
        "options": ["Ignore — they're allowed access", "Report to HR/security", "Confront them directly", "Reduce access quietly"],
        "extra_data": {"scenario_name": "Pre-departure data exfil", "insider_type": "malicious"}
    },
    {
        "category": "insider_threat",
        "difficulty": "intermediate",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "Sysadmin",
        "subject": "Sysadmin disabling logging on a critical server",
        "body": "Audit alert: a sysadmin disabled auditd on the customer-data DB server 'for a maintenance window'. No change ticket exists.",
        "correct_action": "report",
        "red_flags": "Disabling logging is a classic pre-exfil action; no ticket = unauthorized; report to security/CISO; investigate.",
        "options": ["Trust the sysadmin", "Open ticket and ask for justification", "Report to CISO and security", "Re-enable logging quietly"],
        "extra_data": {"scenario_name": "Logging disabled on PII server", "insider_type": "malicious_privileged"}
    },
    {
        "category": "insider_threat",
        "difficulty": "intermediate",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "HR alert",
        "subject": "Employee on performance improvement plan accessing salary data",
        "body": "An employee on a PIP started accessing the salary spreadsheet 15 times last week — they have no business need.",
        "correct_action": "report",
        "red_flags": "Disgruntled-employee indicator + access anomaly; coordinate with HR; tighten access; document.",
        "options": ["Ignore — they have access rights", "Report to HR and security", "Revoke their access immediately", "Confront them directly"],
        "extra_data": {"scenario_name": "Disgruntled employee anomalous access", "insider_type": "potential_malicious"}
    },
    {
        "category": "insider_threat",
        "difficulty": "advanced",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "Outsourced contractor",
        "subject": "Offshore contractor sharing access with sub-contractors",
        "body": "Logs show one contractor's account being used from 4 different ISPs in different countries within an hour — they're sharing the account with unauthorized sub-contractors.",
        "correct_action": "report",
        "red_flags": "Credential sharing breaks the chain of accountability; revoke; require MFA + IP allowlist; report to vendor + security.",
        "options": ["Ignore — work is getting done", "Disable account and notify vendor", "Add IP allowlist and MFA", "Both: disable AND notify vendor"],
        "extra_data": {"scenario_name": "Contractor account sharing", "insider_type": "third_party"}
    },
    {
        "category": "insider_threat",
        "difficulty": "advanced",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "Engineer",
        "subject": "Engineer adding a 'backdoor' commit before leaving",
        "body": "Code review reveals an engineer added an authentication-bypass flag controlled by an env var, planned to be pushed before their last day.",
        "correct_action": "report",
        "red_flags": "Intentional backdoor; reject PR; report to security/CISO immediately; rotate any keys they had access to.",
        "options": ["Approve the PR — they're senior", "Reject and report to security", "Ask them to remove and re-submit", "Both: reject AND rotate keys"],
        "extra_data": {"scenario_name": "Intentional auth-bypass backdoor", "insider_type": "malicious_developer"}
    },
    {
        "category": "insider_threat",
        "difficulty": "expert",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "External recruiter",
        "subject": "Foreign recruiter offering payment for 'internal API documentation'",
        "body": "An engineer reports: a LinkedIn recruiter offered $50,000 for screenshots of the company's internal API documentation. They claim it's 'for benchmarking'.",
        "correct_action": "report",
        "red_flags": "Classic insider-recruitment pattern (industrial espionage); report to security/CI immediately; document; commend employee for reporting.",
        "options": ["Tell engineer to decline politely", "Report to security/counter-intel", "Ignore — engineer refused", "Both: report AND commend engineer"],
        "extra_data": {"scenario_name": "Industrial espionage recruitment", "insider_type": "external_recruitment"}
    },
    {
        "category": "insider_threat",
        "difficulty": "expert",
        "type": "insider_threat",
        "sender_email": "n/a",
        "sender_name": "Privileged user",
        "subject": "DBA running 'SELECT *' on customers table outside business hours",
        "body": "UEBA tool flags: senior DBA ran 'SELECT * FROM customers' (~12M rows) at 11 PM on a Saturday from a personal device.",
        "correct_action": "report",
        "red_flags": "Privileged-user anomaly; unusual time + scope + device; engage IR, lock account pending review, preserve evidence.",
        "options": ["Ignore — they're trusted", "Lock account + open IR ticket", "Wait until Monday to investigate", "Both: lock AND preserve evidence"],
        "extra_data": {"scenario_name": "Privileged DBA off-hours bulk access", "insider_type": "malicious_privileged"}
    },
]


# ============================================================
# 12. ROGUE WIFI  (8 scenarios)
# ============================================================
ROGUE_WIFI = [
    {
        "category": "rogue_wifi",
        "difficulty": "beginner",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "WiFi list",
        "subject": "Coffee shop with two WiFi networks: 'Starbucks-Free' and 'Starbucks_Guest'",
        "body": "You're at Starbucks. Two networks appear: 'Starbucks-Free' (open) and 'Starbucks_Guest' (captive portal). Which one is real?",
        "correct_action": "ignore",
        "red_flags": "Evil twin attack; ask staff for the official SSID name; never auto-join; use mobile data for sensitive actions.",
        "options": ["Join Starbucks-Free", "Ask staff which one is official", "Join both to compare", "Use mobile hotspot"],
        "extra_data": {"scenario_name": "Evil twin at coffee shop", "wifi_type": "evil_twin"}
    },
    {
        "category": "rogue_wifi",
        "difficulty": "beginner",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "WiFi list",
        "subject": "Free open WiFi named 'Free_Public_WiFi'",
        "body": "Open SSID 'Free_Public_WiFi' is available everywhere you go. No password. Strong signal.",
        "correct_action": "ignore",
        "red_flags": "Honeypot SSID; persistent everywhere; never connect — likely attacker's portable AP; turn off auto-connect.",
        "options": ["Connect — it's free", "Turn off auto-connect, ignore", "Connect with VPN", "Use only briefly"],
        "extra_data": {"scenario_name": "Honeypot free-WiFi SSID", "wifi_type": "honeypot"}
    },
    {
        "category": "rogue_wifi",
        "difficulty": "intermediate",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "Captive portal",
        "subject": "Captive portal asking for credit card 'just for verification'",
        "body": "Airport WiFi portal: 'Enter your credit card for verification only — you won't be charged.' No mention of this on the airport's website.",
        "correct_action": "ignore",
        "red_flags": "Legit captive portals never need a card to verify; pure card-skimming; use mobile data instead.",
        "options": ["Enter the card", "Refuse and use mobile data", "Use a virtual card with $0 balance", "Both: refuse AND report to airport"],
        "extra_data": {"scenario_name": "Captive portal card skim", "wifi_type": "captive_portal_phish"}
    },
    {
        "category": "rogue_wifi",
        "difficulty": "intermediate",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "Phone WiFi",
        "subject": "Phone auto-connected to a known SSID name in a new city",
        "body": "Your iPhone auto-connected to 'attwifi' as you walked through a new mall. The same SSID name was used in your hometown.",
        "correct_action": "report",
        "red_flags": "Auto-join + known SSID = KARMA/PNL attack; disable auto-join for open networks; forget unneeded networks.",
        "options": ["Stay connected", "Forget the network and disable auto-join", "Switch to mobile data", "Both: forget AND disable auto-join"],
        "extra_data": {"scenario_name": "KARMA / PNL auto-join attack", "wifi_type": "karma"}
    },
    {
        "category": "rogue_wifi",
        "difficulty": "advanced",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "WiFi list",
        "subject": "Office SSID being deauth'd while a clone appears",
        "body": "At a co-working space, your real office SSID drops every 30 seconds. A WiFi-named 'Office-Guest-5G' appears with stronger signal at the same time.",
        "correct_action": "report",
        "red_flags": "Deauth attack + evil twin; switch to a hotspot; report to building security; advanced wireless attack.",
        "options": ["Connect to the stronger one", "Switch to mobile hotspot and report", "Reboot router", "Use ethernet"],
        "extra_data": {"scenario_name": "Deauth + evil twin combo", "wifi_type": "deauth_eviltwin"}
    },
    {
        "category": "rogue_wifi",
        "difficulty": "advanced",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "WiFi list",
        "subject": "Rogue WiFi pineapple in your office building",
        "body": "Network scan shows multiple open SSIDs broadcasting from the same MAC vendor (Hak5). They all redirect HTTP to a phishing page when joined.",
        "correct_action": "report",
        "red_flags": "WiFi Pineapple / rogue AP toolkit; report to facility security; track down source; disconnect any clients still on it.",
        "options": ["Connect briefly to investigate", "Report to facilities and security", "Use Wireshark on the network", "Block the MAC at the firewall"],
        "extra_data": {"scenario_name": "WiFi Pineapple in office", "wifi_type": "pineapple"}
    },
    {
        "category": "rogue_wifi",
        "difficulty": "expert",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "Conference WiFi",
        "subject": "WPA3-Personal network with downgrade to WPA2",
        "body": "At a security conference, you notice a WPA3-Personal network silently downgrading clients to WPA2 (Dragonblood attack pattern).",
        "correct_action": "report",
        "red_flags": "WPA3 downgrade attack; use cellular at security conferences; always VPN; report to organizers.",
        "options": ["Trust WPA3", "Use cellular + VPN", "Connect with VPN only", "Both: cellular AND inform organizers"],
        "extra_data": {"scenario_name": "WPA3 Dragonblood downgrade", "wifi_type": "wpa3_downgrade"}
    },
    {
        "category": "rogue_wifi",
        "difficulty": "expert",
        "type": "rogue_wifi",
        "sender_email": "n/a",
        "sender_name": "Hotel WiFi",
        "subject": "Hotel WiFi pushing a fake 'router firmware update' on connect",
        "body": "Upon joining hotel WiFi, a popup appears: 'Router firmware update required — install to continue browsing.' Installer is an .exe.",
        "correct_action": "report",
        "red_flags": "Dark Hotel APT pattern targeting execs; never install anything from a captive portal; use cellular + VPN.",
        "options": ["Install the update", "Disconnect, use cellular + VPN, report", "Install on a VM", "Skip update and continue"],
        "extra_data": {"scenario_name": "DarkHotel-style payload via captive portal", "wifi_type": "dark_hotel"}
    },
]


# ============================================================
# 13. DNS SPOOFING  (8 scenarios)
# ============================================================
DNS_SPOOFING = [
    {
        "category": "dns_spoofing",
        "difficulty": "beginner",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "Router admin",
        "subject": "Home router DNS changed to a foreign IP",
        "body": "You log into your home router and notice DNS servers were changed from your ISP's to 5.45.x.x (Romania). You didn't change this.",
        "correct_action": "report",
        "red_flags": "DNS hijack via router compromise; default router passwords; reset, update firmware, change creds.",
        "options": ["Leave it — it works", "Factory reset, update firmware, change password", "Use Google DNS manually", "Both: reset router AND set Google DNS"],
        "extra_data": {"scenario_name": "Home router DNS hijack", "dns_attack": "router_compromise"}
    },
    {
        "category": "dns_spoofing",
        "difficulty": "beginner",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "Browser",
        "subject": "Bank website looks slightly different — fonts off",
        "body": "Your bank's site at bankofamerica.com looks 'off' — fonts wrong, missing favicon. The HTTPS lock shows the wrong organization name.",
        "correct_action": "report",
        "red_flags": "DNS hijack pointing to a clone; cert mismatch; never proceed; use mobile banking app via cellular.",
        "options": ["Sign in — looks mostly right", "Stop, check cert details, use mobile app", "Try a different browser", "Refresh and retry"],
        "extra_data": {"scenario_name": "DNS hijack to clone bank site", "dns_attack": "spoof_cert_mismatch"}
    },
    {
        "category": "dns_spoofing",
        "difficulty": "intermediate",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "ISP",
        "subject": "ISP DNS returning wrong IPs for popular sites",
        "body": "Multiple staff report that visiting twitter.com loads a different site. Direct IP works. ISP-side DNS poisoning suspected.",
        "correct_action": "report",
        "red_flags": "DNS poisoning at ISP level; switch to 1.1.1.1 or 8.8.8.8 with DoH/DoT; report to ISP.",
        "options": ["Wait for ISP to fix", "Switch to DoH (1.1.1.1) and report", "Use VPN for everything", "Both: switch to DoH AND report"],
        "extra_data": {"scenario_name": "ISP-level DNS poisoning", "dns_attack": "isp_poisoning"}
    },
    {
        "category": "dns_spoofing",
        "difficulty": "intermediate",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "Public WiFi DNS",
        "subject": "Public WiFi forcing all DNS through their server",
        "body": "Coffee shop WiFi blocks ports 53 and 853 to anywhere except their own DNS. Their DNS returns altered results for ad domains and login pages.",
        "correct_action": "report",
        "red_flags": "Captive DNS interception; use VPN with full tunnel; switch to cellular; do not enter credentials.",
        "options": ["Continue — it's just ad-blocking", "Enable VPN with kill switch", "Switch to mobile data for logins", "Both: VPN AND mobile for logins"],
        "extra_data": {"scenario_name": "Captive DNS interception", "dns_attack": "captive_intercept"}
    },
    {
        "category": "dns_spoofing",
        "difficulty": "advanced",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "Corporate IT",
        "subject": "Internal DNS server returning external IPs for intranet hosts",
        "body": "Your intranet wiki.corp.local suddenly resolves to a public IP. Logs show DNS cache poisoning via a misconfigured forwarder.",
        "correct_action": "report",
        "red_flags": "Internal DNS poisoning leaks intranet creds; flush caches; deploy DNSSEC; review forwarder configs.",
        "options": ["Ignore — wiki works", "Flush DNS, alert IT, deploy DNSSEC", "Move wiki to public IP", "Disable internal DNS"],
        "extra_data": {"scenario_name": "Internal DNS cache poisoning", "dns_attack": "internal_poisoning"}
    },
    {
        "category": "dns_spoofing",
        "difficulty": "advanced",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "DDI alert",
        "subject": "DNS rebinding attack detected against internal admin panel",
        "body": "A malicious website you visited starts making requests to 192.168.1.1 (your router admin) via DNS rebinding from a public domain.",
        "correct_action": "report",
        "red_flags": "DNS rebinding; modern browsers partially mitigate but routers/IoT vulnerable; isolate IoT/admin VLAN.",
        "options": ["Ignore — site can't reach LAN", "Isolate admin/IoT VLAN, update router firmware", "Block all script execution globally", "Both: VLAN segmentation AND firmware update"],
        "extra_data": {"scenario_name": "DNS rebinding to LAN admin", "dns_attack": "dns_rebinding"}
    },
    {
        "category": "dns_spoofing",
        "difficulty": "expert",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "Threat intel",
        "subject": "BGP hijack redirecting DNS queries to attacker",
        "body": "BGP route hijack reroutes traffic to your authoritative DNS through a hostile AS, allowing query interception and modification.",
        "correct_action": "report",
        "red_flags": "BGP/DNS hijack at infrastructure level; deploy RPKI; engage upstream; use DNSSEC validation; report to NOC.",
        "options": ["Wait for upstream to fix", "Enable RPKI, alert NOC, validate DNSSEC", "Switch DNS provider", "Both: RPKI AND DNSSEC validation"],
        "extra_data": {"scenario_name": "BGP route hijack on DNS", "dns_attack": "bgp_hijack"}
    },
    {
        "category": "dns_spoofing",
        "difficulty": "expert",
        "type": "dns_spoofing",
        "sender_email": "n/a",
        "sender_name": "Domain registrar",
        "subject": "Registrar account compromised — nameservers changed",
        "body": "Your domain's NS records were changed at the registrar without authorization. Traffic now flows to attacker's servers.",
        "correct_action": "report",
        "red_flags": "Registrar account takeover; enable registry lock; MFA on registrar; phone vendor to revert NS; preserve evidence.",
        "options": ["Change NS back yourself", "Call registrar, enable lock, IR", "Email registrar support", "Both: call AND enable registry lock"],
        "extra_data": {"scenario_name": "Registrar account hijack (NS change)", "dns_attack": "registrar_takeover"}
    },
]


# ============================================================
# 14. AI SCAM  (10 scenarios)
# ============================================================
AI_SCAM = [
    {
        "category": "ai_scam",
        "difficulty": "beginner",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Phone call",
        "subject": "AI voice clone of your manager asking for gift cards",
        "body": "Your phone rings. The voice sounds exactly like your manager: 'Hey, I'm in a meeting and need you to buy 5 $200 Apple gift cards for a client gift. Send me the codes — I'll Venmo you back.'",
        "correct_action": "report",
        "red_flags": "AI voice cloning is widely accessible; gift card request is the universal BEC tell; verify by calling back manager's known number.",
        "options": ["Buy the gift cards", "Hang up and call manager directly", "Ask the caller a personal verification question", "Both: ask question AND call back"],
        "extra_data": {"scenario_name": "Voice-cloned manager gift card scam", "ai_modality": "voice", "audio_file": "voice_clone_manager.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "beginner",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Phone call",
        "subject": "AI-generated 'family member crying' emergency call",
        "body": "A sobbing voice that sounds like your sister: 'I crashed the car, please don't tell mom. I need $2,000 wired right now or they'll arrest me.'",
        "correct_action": "ignore",
        "red_flags": "AI voice synthesis from public videos; family-emergency scam wrapped in deepfake voice; verify via direct callback to known number.",
        "options": ["Wire the money", "Hang up and call sister's known number", "Ask a personal-history question", "Both: hang up AND verify"],
        "extra_data": {"scenario_name": "Deepfake family emergency", "ai_modality": "voice", "audio_file": "voice_family_emergency.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "intermediate",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Video call",
        "subject": "Zoom call with deepfake CEO requesting wire transfer",
        "body": "You join a Zoom call. The 'CEO' is on camera (deepfake video) and asks you to immediately wire $250,000 to an overseas account for a confidential acquisition.",
        "correct_action": "report",
        "red_flags": "Real 2024 Arup case ($25M lost via deepfake); deepfake video + voice; ask CEO to perform a specific physical action (turn head, hold object) to detect; always verify out of band.",
        "options": ["Wire the money", "End call, verify via known channel", "Ask CEO to turn head sideways", "Both: ask action AND verify out-of-band"],
        "extra_data": {"scenario_name": "Deepfake CEO video call (Arup-style)", "ai_modality": "video", "audio_file": "voice_deepfake_ceo.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "intermediate",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Phone call",
        "subject": "AI 'bank representative' offering account upgrade",
        "body": "AI voice (very natural, slight uncanny pauses): 'This is Sarah from Wells Fargo. We're upgrading you to a premium account. To verify, please confirm your full SSN and online banking password.'",
        "correct_action": "ignore",
        "red_flags": "AI conversational scams use realistic voices; banks never call for SSN/password; classic vishing wrapped in AI delivery.",
        "options": ["Confirm the info", "Hang up and call bank directly", "Provide partial info to test", "Ask to be transferred to a supervisor"],
        "extra_data": {"scenario_name": "AI bank representative scam", "ai_modality": "voice", "audio_file": "voice_fake_bank.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "advanced",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Phone call",
        "subject": "AI customer support handling 'refund request' that needs remote access",
        "body": "AI voice walks you through a 'refund process' for Amazon. It says: 'To process the $79 refund I need to log into your computer briefly. Please go to fastsupport.com and enter the code I give you.'",
        "correct_action": "ignore",
        "red_flags": "Amazon never requires remote access for refunds; fastsupport / AnyDesk patterns; AI voice masks the scam pattern.",
        "options": ["Allow remote access", "Hang up and check Amazon orders", "Provide screen control only", "Both: hang up AND verify on amazon.com"],
        "extra_data": {"scenario_name": "AI refund-scam with remote access", "ai_modality": "voice", "audio_file": "voice_fake_support.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "advanced",
        "type": "ai_scam",
        "sender_email": "recruiter@hire-talent-ai.com",
        "sender_name": "AI Recruiter",
        "subject": "AI 'recruiter' running a real-time interview to phish you",
        "body": "An AI bot conducts a slick technical interview over chat + voice. Midway, it asks for your SSN/passport for 'background check' and access to GitHub via personal access token.",
        "correct_action": "report",
        "red_flags": "AI-driven scams now run end-to-end interviews; personal access tokens give repo control; verify the company via official channels.",
        "options": ["Provide info, the AI seems professional", "Refuse and verify company independently", "Provide GitHub PAT with read-only scope", "Provide SSN but not PAT"],
        "extra_data": {"scenario_name": "AI recruiter interview scam", "ai_modality": "voice+text", "audio_file": "voice_fake_recruiter.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "advanced",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Video DM",
        "subject": "Deepfake video of a friend on Instagram asking for an Amazon code",
        "body": "Instagram DM with a short video clip of your friend's face: 'Hey, I'm locked out of my Amazon — can you send me the verification code that just got sent to your phone? I'll explain later.'",
        "correct_action": "ignore",
        "red_flags": "Account takeover + deepfake; never share verification codes; call friend's phone directly.",
        "options": ["Send the code", "Call the friend's known phone", "Reply with a wrong code to test", "Block and report"],
        "extra_data": {"scenario_name": "Deepfake DM verification-code scam", "ai_modality": "video", "audio_file": "voice_deepfake_friend.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "expert",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Phone call",
        "subject": "AI agent calling on behalf of 'your lawyer' about a lawsuit",
        "body": "Polished AI voice: 'I'm calling on behalf of Smith & Associates law firm. A subpoena was issued against you. To avoid arrest, you must verify identity and post a $5,000 bond now via crypto.'",
        "correct_action": "ignore",
        "red_flags": "Subpoenas don't arrive by phone; never crypto for legal bonds; AI voice + legal pressure = manipulation; verify with actual law firm directly.",
        "options": ["Pay the bond", "Hang up and call the actual firm", "Demand subpoena in writing", "Both: hang up AND request docs in writing"],
        "extra_data": {"scenario_name": "AI legal-threat scam", "ai_modality": "voice", "audio_file": "voice_fake_lawyer.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "expert",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Phone call (real-time AI)",
        "subject": "Real-time AI agent doing reconnaissance via 'survey'",
        "body": "An AI conversational agent calls claiming to do a customer survey. It naturally pivots to questions about your bank, employer, vehicle, and family — building a profile.",
        "correct_action": "ignore",
        "red_flags": "AI agents can run unlimited recon calls 24/7; refuse all personal questions; emerging large-scale OSINT tactic.",
        "options": ["Answer the survey", "Hang up", "Answer with fake info", "Both: hang up AND report to FTC"],
        "extra_data": {"scenario_name": "Real-time AI OSINT survey", "ai_modality": "voice", "audio_file": "voice_ai_survey.mp3"}
    },
    {
        "category": "ai_scam",
        "difficulty": "expert",
        "type": "ai_scam",
        "sender_email": "n/a",
        "sender_name": "Video conference",
        "subject": "Multi-participant deepfake meeting (all attendees fake except you)",
        "body": "You join what you think is an internal finance meeting. 5 'colleagues' are on video — all deepfakes. They collectively pressure you to approve a $1.2M transfer 'before market close'.",
        "correct_action": "report",
        "red_flags": "All-deepfake-meeting attack (Arup case scale); social proof + urgency; ask each to do specific physical actions; out-of-band verify via separate channel.",
        "options": ["Approve the transfer", "End call and verify via Slack/in-person", "Ask each to wave their hand", "Both: ask physical actions AND verify out-of-band"],
        "extra_data": {"scenario_name": "All-deepfake finance meeting", "ai_modality": "video", "audio_file": "voice_deepfake_meeting.mp3"}
    },
]


# ============================================================
# 15. ATTACK CHAIN  (8 scenarios — multi-stage)
# ============================================================
ATTACK_CHAIN = [
    {
        "category": "attack_chain",
        "difficulty": "beginner",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "Phishing email → fake login → credential reuse",
        "body": "Stage 1: phishing email about 'mailbox quota'. Stage 2: fake Outlook login captures your password. Stage 3: attacker tries that password on your bank.",
        "correct_action": "report",
        "red_flags": "Linked stages amplify damage; unique passwords + MFA per service; report at any stage.",
        "options": ["Sign in to clear quota", "Stop at stage 1 — report email", "Sign in only on Outlook tab", "Reset password after signing in"],
        "extra_data": {"scenario_name": "Phish → credential reuse chain", "stages": ["recon_email", "credential_capture", "credential_stuffing"]}
    },
    {
        "category": "attack_chain",
        "difficulty": "beginner",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "QR poster → mobile login → SMS OTP intercept",
        "body": "Stage 1: poster QR for 'banking promo'. Stage 2: mobile lookalike login. Stage 3: malicious SMS app installed to intercept OTPs. Stage 4: account drained.",
        "correct_action": "report",
        "red_flags": "Multi-stage SMS-OTP attack; never install SMS apps from links; verify offers via bank's app.",
        "options": ["Scan and install app", "Stop at QR — verify via bank app", "Scan but skip install", "Install with low permissions"],
        "extra_data": {"scenario_name": "QR → SMS intercept chain", "stages": ["delivery_qr", "credential_capture", "sms_intercept", "fraud"]}
    },
    {
        "category": "attack_chain",
        "difficulty": "intermediate",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "Spear phish → macro doc → C2 beacon → ransomware",
        "body": "Stage 1: spear-phish to finance. Stage 2: Excel macro downloads beacon. Stage 3: lateral movement. Stage 4: ransomware deployed across file shares.",
        "correct_action": "report",
        "red_flags": "Classic ransomware chain; macro doc is the breakpoint; report at email stage; segment + backups limit damage.",
        "options": ["Open the doc to check", "Report email immediately", "Open in protected view only", "Open in VM to inspect"],
        "extra_data": {"scenario_name": "Spear phish → ransomware chain", "stages": ["recon", "phish_macro", "c2_beacon", "lateral_movement", "ransomware"]}
    },
    {
        "category": "attack_chain",
        "difficulty": "intermediate",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "Smishing → fake bank app → SIM swap → account drain",
        "body": "Stage 1: SMS about 'tax refund'. Stage 2: fake bank app harvests creds. Stage 3: SIM swap takes over phone. Stage 4: drains accounts via SMS OTP.",
        "correct_action": "report",
        "red_flags": "Modern fraud chain; use authenticator apps not SMS; freeze SIM at first sign; report.",
        "options": ["Tap the SMS link", "Delete SMS, switch to app-based MFA", "Reply STOP and ignore", "Both: switch to app MFA AND report"],
        "extra_data": {"scenario_name": "Smishing → SIM swap chain", "stages": ["delivery_sms", "credential_capture", "sim_swap", "account_takeover"]}
    },
    {
        "category": "attack_chain",
        "difficulty": "advanced",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "Watering hole → drive-by → token theft → cloud pivot",
        "body": "Stage 1: industry blog compromised. Stage 2: drive-by exploit installs infostealer. Stage 3: browser tokens stolen. Stage 4: attacker uses tokens to bypass MFA into M365.",
        "correct_action": "report",
        "red_flags": "Infostealer + token theft bypasses MFA; FIDO2 + conditional access mitigates; report any browser anomaly; rotate sessions.",
        "options": ["Continue using browser", "Patch + EDR scan + sign out all sessions", "Reinstall browser only", "Both: scan AND sign out all sessions"],
        "extra_data": {"scenario_name": "Watering hole → token theft chain", "stages": ["watering_hole", "drive_by", "infostealer", "token_theft", "cloud_pivot"]}
    },
    {
        "category": "attack_chain",
        "difficulty": "advanced",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "USB drop → BadUSB → privilege escalation → backdoor",
        "body": "Stage 1: USB drop near building. Stage 2: HID payload runs PowerShell. Stage 3: kernel exploit escalates privileges. Stage 4: scheduled task backdoor.",
        "correct_action": "report",
        "red_flags": "Full physical → kernel chain; USB port lockdown + EDR + least privilege break the chain.",
        "options": ["Plug in to investigate", "Report USB and never plug in", "Plug into a VM", "Both: report AND keep USB ports disabled"],
        "extra_data": {"scenario_name": "USB → backdoor chain", "stages": ["initial_access_usb", "hid_payload", "privilege_escalation", "persistence"]}
    },
    {
        "category": "attack_chain",
        "difficulty": "expert",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "Deepfake CEO call → wire → laundering → exfil",
        "body": "Stage 1: AI voice CEO call. Stage 2: finance team initiates wire. Stage 3: funds bounced through 3 jurisdictions. Stage 4: data exfil also in progress via stolen creds.",
        "correct_action": "report",
        "red_flags": "Coordinated multi-vector attack; dual-authorization controls; out-of-band confirm; alert IR/legal immediately.",
        "options": ["Initiate the wire", "Reject + require dual-auth + verify out-of-band", "Initiate then hold", "Both: reject AND alert IR"],
        "extra_data": {"scenario_name": "Deepfake CEO → wire fraud chain", "stages": ["voice_clone", "wire_initiation", "laundering", "data_exfil"]}
    },
    {
        "category": "attack_chain",
        "difficulty": "expert",
        "type": "attack_chain",
        "sender_email": "n/a",
        "sender_name": "Multi-stage",
        "subject": "Supply-chain compromise → vendor portal → cloud key → mass exfil",
        "body": "Stage 1: software vendor compromised. Stage 2: trojanized update installed. Stage 3: AWS keys exfiltrated. Stage 4: 200K customer records exfiltrated from S3.",
        "correct_action": "report",
        "red_flags": "SolarWinds-style chain; SBOM + signed artifacts + key rotation + S3 anomaly detection; multi-team IR.",
        "options": ["Install vendor patches as usual", "Hold updates pending vendor IR confirmation", "Install on canary first only", "Both: hold updates AND rotate keys"],
        "extra_data": {"scenario_name": "Supply chain → cloud exfil chain", "stages": ["vendor_compromise", "trojan_update", "key_theft", "s3_exfil"]}
    },
]


# ============================================================
# AGGREGATE
# ============================================================
ALL_SCENARIOS = (
    EMAIL_PHISHING
    + FAKE_WEBSITE
    + QR_ATTACK
    + VISHING
    + USB_DROP
    + INTERNAL_CHAT
    + ATTACHMENT_SANDBOX
    + BROWSER_EXPLOIT
    + MFA_FATIGUE
    + CLOUD_BREACH
    + INSIDER_THREAT
    + ROGUE_WIFI
    + DNS_SPOOFING
    + AI_SCAM
    + ATTACK_CHAIN
)

# Difficulty mapping helper — use this in main.py if your existing
# code uses "easy"/"medium"/"hard" instead of the 4-level system above.
LEGACY_DIFFICULTY_MAP = {
    "beginner": "easy",
    "intermediate": "easy",
    "advanced": "medium",
    "expert": "hard",
}

def to_legacy_difficulty(scenario):
    """Returns a copy with difficulty mapped to easy/medium/hard."""
    s = dict(scenario)
    s["difficulty"] = LEGACY_DIFFICULTY_MAP.get(s["difficulty"], "medium")
    return s


if __name__ == "__main__":
    print(f"Total scenarios: {len(ALL_SCENARIOS)}")
    from collections import Counter
    cats = Counter(s["category"] for s in ALL_SCENARIOS)
    for cat, count in sorted(cats.items()):
        print(f"  {cat}: {count}")
    diffs = Counter(s["difficulty"] for s in ALL_SCENARIOS)
    print("\nBy difficulty:")
    for d, count in sorted(diffs.items()):
        print(f"  {d}: {count}")
