import json
from database import SessionLocal, Scenario


SEED_SCENARIOS = [
    # ═══════════════════ EASY (6 scenarios) ═══════════════════
    {
        "type": "Phishing",
        "difficulty": "Easy",
        "sender_email": "support@amaz0n-security.com",
        "sender_name": "Amazon Security",
        "subject": "Your account has been locked!",
        "body": "Dear Customer,\n\nWe detected suspicious activity on your Amazon account. Your account has been temporarily locked for security purposes.\n\nPlease click the link below to verify your identity and restore access within 24 hours or your account will be permanently deleted.\n\nVerify Now: https://amaz0n-security.com/verify-account\n\nThank you,\nAmazon Customer Protection Team",
        "correct_action": "opt3",
        "options": json.dumps([
            {"id": "opt1", "label": "Click verify link now", "desc": "Restore account access immediately"},
            {"id": "opt2", "label": "Reply with my details", "desc": "Confirm my identity via email"},
            {"id": "opt3", "label": "Open Amazon app directly", "desc": "Check for any real alerts there"},
            {"id": "opt4", "label": "Forward link to friends", "desc": "Warn them to check their accounts"},
        ]),
        "red_flags": json.dumps([
            "Fake domain — 'amaz0n' uses a zero instead of the letter 'o'",
            "Urgency tactic — 24 hour deadline with threat of deletion",
            "Generic greeting — 'Dear Customer' instead of your real name",
            "Suspicious link pointing to a non-Amazon domain",
        ]),
    },
    {
        "type": "Smishing",
        "difficulty": "Easy",
        "sender_email": "sms@delivery-update.com",
        "sender_name": "FedEx Delivery",
        "subject": "Package delivery failed — action required",
        "body": "FedEx Notification:\n\nYour package (Tracking: FX-8829103746) could not be delivered today due to an incomplete address.\n\nPlease update your delivery address within 12 hours to avoid return to sender:\n\nhttps://fedex-redelivery.com/update\n\nShipping fee adjustment: $2.99\n\nFedEx Customer Service",
        "correct_action": "opt2",
        "options": json.dumps([
            {"id": "opt1", "label": "Click link and pay $2.99", "desc": "Small fee to get my package"},
            {"id": "opt2", "label": "Delete — not expecting package", "desc": "I did not order anything"},
            {"id": "opt3", "label": "Reply with home address", "desc": "Fix the delivery address"},
            {"id": "opt4", "label": "Call number from email", "desc": "Speak to FedEx about it"},
        ]),
        "red_flags": json.dumps([
            "Fake domain 'fedex-redelivery.com' — not the real FedEx website",
            "Asks for a small fee — classic bait to steal payment info",
            "12-hour urgency window to pressure quick action",
            "You may not be expecting any package at all",
        ]),
    },
    {
        "type": "Prize Scam",
        "difficulty": "Easy",
        "sender_email": "winner@lotterry-international.com",
        "sender_name": "International Lottery",
        "subject": "CONGRATULATIONS! You won $500,000",
        "body": "DEAR LUCKY WINNER,\n\nWe are pleased to inform you that your email address was selected in our monthly international email lottery draw. You have won the sum of FIVE HUNDRED THOUSAND US DOLLARS ($500,000).\n\nTo claim your prize, please send us the following information:\n- Full Name\n- Home Address\n- Phone Number\n- A copy of your passport\n- Processing fee: $250\n\nReply to this email urgently as unclaimed prizes expire in 48 hours.\n\nDr. Michael Richardson\nClaims Officer",
        "correct_action": "opt4",
        "options": json.dumps([
            {"id": "opt1", "label": "Send my details to claim", "desc": "Collect my lottery winnings"},
            {"id": "opt2", "label": "Pay the $250 processing fee", "desc": "To receive the prize money"},
            {"id": "opt3", "label": "Reply asking for more info", "desc": "Learn more about the lottery"},
            {"id": "opt4", "label": "Delete email permanently", "desc": "Obvious scam — ignore it"},
        ]),
        "red_flags": json.dumps([
            "You never entered any lottery — can't win something you didn't enter",
            "Asks for upfront fee — legitimate prizes never charge to claim",
            "Requests passport copy — identity theft attempt",
            "Misspelled domain 'lotterry' and ALL CAPS writing style",
        ]),
    },
    {
        "type": "Tech Support Scam",
        "difficulty": "Easy",
        "sender_email": "alerts@microsft-security.net",
        "sender_name": "Microsoft Windows Defender",
        "subject": "VIRUS DETECTED on your computer!",
        "body": "URGENT SECURITY ALERT\n\nOur systems have detected 3 critical viruses on your computer. Your personal files, passwords, and banking information are AT RISK.\n\nError Code: #0x80070643\n\nImmediate action required. Call our Microsoft certified technicians NOW:\n+1-888-555-0199\n\nDo NOT turn off your computer or you may lose all your data permanently.\n\nMicrosoft Windows Security",
        "correct_action": "opt1",
        "options": json.dumps([
            {"id": "opt1", "label": "Close email, run my own antivirus", "desc": "Check with software I trust"},
            {"id": "opt2", "label": "Call the number immediately", "desc": "Get help fixing the viruses"},
            {"id": "opt3", "label": "Shut down computer right away", "desc": "Stop the viruses from spreading"},
            {"id": "opt4", "label": "Forward to family members", "desc": "Warn them about viruses"},
        ]),
        "red_flags": json.dumps([
            "Microsoft never sends virus alerts via email — they don't know your email",
            "Misspelled domain 'microsft' missing an 'o'",
            "Creates extreme fear with urgent all-caps language",
            "Phone number is how scammers get you to pay for fake fixes",
        ]),
    },
    {
        "type": "Phishing",
        "difficulty": "Easy",
        "sender_email": "service@paypa1-support.com",
        "sender_name": "PayPal Service",
        "subject": "Unusual sign-in attempt blocked",
        "body": "Hello User,\n\nWe blocked a sign-in attempt to your PayPal account from a new device located in Moscow, Russia.\n\nDevice: Windows PC\nLocation: Moscow, Russia\nTime: Today, 4:23 AM\n\nIf this was NOT you, click the button below to secure your account within 1 hour or we will permanently suspend your account:\n\n[SECURE MY ACCOUNT]: http://paypa1-support.com/secure\n\nPayPal Security Team",
        "correct_action": "opt3",
        "options": json.dumps([
            {"id": "opt1", "label": "Click 'Secure My Account' button", "desc": "Protect my PayPal fast"},
            {"id": "opt2", "label": "Reply denying it was me", "desc": "Tell them I wasn't in Moscow"},
            {"id": "opt3", "label": "Log into paypal.com directly", "desc": "Check activity from official site"},
            {"id": "opt4", "label": "Email PayPal asking for help", "desc": "Reply to this email for support"},
        ]),
        "red_flags": json.dumps([
            "Fake domain — 'paypa1' uses the number 1 instead of letter 'l'",
            "Uses http:// not https:// — not secure",
            "Generic 'Hello User' instead of your actual name",
            "Extreme urgency: 1-hour deadline to pressure hasty clicks",
        ]),
    },
    {
        "type": "Fake Charity",
        "difficulty": "Easy",
        "sender_email": "donate@help-victims-now.org",
        "sender_name": "Disaster Relief Fund",
        "subject": "Help victims TODAY — donate to save lives",
        "body": "Dear Friend,\n\nA massive earthquake has devastated thousands of families. Children are starving. Homes are destroyed.\n\nYOUR DONATION CAN SAVE LIVES RIGHT NOW.\n\nPlease donate any amount via the link below. Every dollar counts. Bitcoin and gift cards also accepted for faster relief.\n\nDonate Now: http://help-victims-now.org/donate-bitcoin\n\nOr send Amazon/Apple gift cards to: gifts@help-victims-now.org\n\nGod bless you for your generosity.\n\nRev. Patrick Johnson\nDisaster Relief Fund",
        "correct_action": "opt2",
        "options": json.dumps([
            {"id": "opt1", "label": "Send Bitcoin donation", "desc": "Help victims quickly"},
            {"id": "opt2", "label": "Research charity on official sites", "desc": "Verify through charitynavigator.org first"},
            {"id": "opt3", "label": "Send Amazon gift cards", "desc": "Fast way to donate"},
            {"id": "opt4", "label": "Forward to my friends", "desc": "Spread awareness of disaster"},
        ]),
        "red_flags": json.dumps([
            "Real charities never accept donations via gift cards — huge red flag",
            "Bitcoin-only donation is almost always a scam",
            "Emotional manipulation with 'starving children' language",
            "Unknown charity with vague details — no registration number",
        ]),
    },

    # ═══════════════════ MEDIUM (6 scenarios) ═══════════════════
    {
        "type": "BEC",
        "difficulty": "Medium",
        "sender_email": "ceo.james@company-mail.net",
        "sender_name": "James Wright (CEO)",
        "subject": "Urgent wire transfer needed",
        "body": "Hi,\n\nI need you to process a wire transfer of $32,000 to a new supplier immediately. I'm traveling and can't do it myself.\n\nWire to:\nBank: Pacific Trust\nAccount: 7739201854\n\nPlease handle this right away and don't mention it to others — the deal is confidential until announced.\n\nThanks,\nJames\n\nSent from my iPhone",
        "correct_action": "opt4",
        "options": json.dumps([
            {"id": "opt1", "label": "Process transfer immediately", "desc": "Help the CEO with urgent deal"},
            {"id": "opt2", "label": "Reply confirming receipt", "desc": "Acknowledge and process soon"},
            {"id": "opt3", "label": "Forward to finance team", "desc": "Let them handle the details"},
            {"id": "opt4", "label": "Call CEO on known number", "desc": "Verify request via phone first"},
        ]),
        "red_flags": json.dumps([
            "CEO requesting money transfer via email — bypasses normal approval process",
            "Asks for secrecy — 'don't mention it to others'",
            "Creates pressure with urgency — 'immediately'",
            "No reference to any purchase order or documentation",
        ]),
    },
    {
        "type": "Pretexting",
        "difficulty": "Medium",
        "sender_email": "it.helpdesk@corp-support.org",
        "sender_name": "IT Help Desk",
        "subject": "Mandatory password reset — security audit",
        "body": "Dear Employee,\n\nAs part of our quarterly security audit, the IT department requires all employees to reset their network passwords by EOD today.\n\nPlease use the secure link below to update your credentials:\n\nhttps://corp-support.org/password-reset\n\nYou will need to enter your current password followed by your new password. Failure to comply will result in temporary account suspension.\n\nRegards,\nIT Security Team\nHelp Desk Ticket #IT-4492",
        "correct_action": "opt1",
        "options": json.dumps([
            {"id": "opt1", "label": "Call IT desk on posted number", "desc": "Verify this is a real request"},
            {"id": "opt2", "label": "Click link and reset password", "desc": "Comply with security audit"},
            {"id": "opt3", "label": "Reply asking for verification", "desc": "Get confirmation via email"},
            {"id": "opt4", "label": "Share with all colleagues", "desc": "Remind everyone to reset"},
        ]),
        "red_flags": json.dumps([
            "External domain 'corp-support.org' impersonating internal IT",
            "Requests current password — legitimate resets never ask for this",
            "Threat of account suspension creates fear",
            "Fake ticket number adds false legitimacy",
        ]),
    },
    {
        "type": "Invoice Fraud",
        "difficulty": "Medium",
        "sender_email": "billing@office-supplies-inc.co",
        "sender_name": "Office Supplies Inc",
        "subject": "Invoice #4472 — Payment overdue",
        "body": "Dear Accounts Payable,\n\nThis is a reminder that Invoice #4472 dated September 15 for $4,847.50 remains unpaid.\n\nProduct: Office supplies and printer toner\nDelivered to: Main Office, Building A\nPO Reference: PO-2024-0918\n\nPlease process payment within 5 business days to avoid late fees. Updated bank details for payment:\n\nAccount Name: Office Supplies Inc\nBank: Regional Commerce Bank  \nAccount: 4482817193\n\nIf you have any questions, please reply to this email.\n\nSarah Thompson\nBilling Department",
        "correct_action": "opt2",
        "options": json.dumps([
            {"id": "opt1", "label": "Process payment right away", "desc": "Avoid late fees and penalties"},
            {"id": "opt2", "label": "Check records for PO-2024-0918", "desc": "Verify purchase order exists internally"},
            {"id": "opt3", "label": "Reply asking for invoice details", "desc": "Engage with vendor to learn more"},
            {"id": "opt4", "label": "Pay to updated bank account", "desc": "Use the new bank info provided"},
        ]),
        "red_flags": json.dumps([
            "Unexpected invoice with no internal record of purchase",
            "Bank account details changed — classic invoice fraud tactic",
            "Suspicious .co domain (not .com) — look-alike domain",
            "Pressure to pay within 5 days without verification",
        ]),
    },
    {
        "type": "Clone Phishing",
        "difficulty": "Medium",
        "sender_email": "notifications@dropbox-share.com",
        "sender_name": "Dropbox",
        "subject": "Sarah Miller shared 'Q4_Financial_Report.pdf' with you",
        "body": "Hi,\n\nSarah Miller (sarah.m@yourcompany.com) has shared a file with you using Dropbox.\n\nFile: Q4_Financial_Report.pdf\nMessage: 'Please review this before tomorrow's board meeting. Let me know your thoughts.'\n\nView file: https://dropbox-share.com/d/view/8491203\n\nThis link will expire in 24 hours for security.\n\nDropbox Team",
        "correct_action": "opt3",
        "options": json.dumps([
            {"id": "opt1", "label": "Click link to view file", "desc": "Review the Q4 report now"},
            {"id": "opt2", "label": "Reply to Sarah for context", "desc": "Ask what the file contains"},
            {"id": "opt3", "label": "Message Sarah on Teams/Slack", "desc": "Confirm she actually shared this"},
            {"id": "opt4", "label": "Download PDF immediately", "desc": "Save for board meeting"},
        ]),
        "red_flags": json.dumps([
            "Wrong domain 'dropbox-share.com' instead of real 'dropbox.com'",
            "Uses a known coworker's name to build trust (found on LinkedIn)",
            "Artificial 24-hour expiration creates urgency",
            "Real Dropbox shares come from dropbox.com, not lookalike domains",
        ]),
    },
    {
        "type": "Gift Card Scam",
        "difficulty": "Medium",
        "sender_email": "r.martinez@ceo-gmail.com",
        "sender_name": "Robert Martinez",
        "subject": "Quick favor — are you available?",
        "body": "Hi,\n\nAre you at your desk? I need a small favor.\n\nI'm heading into a client meeting and need to send gift cards to a few clients as a thank-you gesture. Can you buy 5 Apple App Store gift cards, $100 each, from the store? I'll reimburse you tomorrow.\n\nOnce you have them, please scratch off the back and email me the codes. I'll take care of the rest from there.\n\nThis needs to be done in the next hour. Please keep this between us as it's a surprise for the clients.\n\nThanks for your help.\n\nRobert\nCEO",
        "correct_action": "opt4",
        "options": json.dumps([
            {"id": "opt1", "label": "Buy cards, send codes by email", "desc": "Help the CEO quickly"},
            {"id": "opt2", "label": "Reply asking for reimbursement first", "desc": "Confirm I'll be paid back"},
            {"id": "opt3", "label": "Buy cards but call CEO first", "desc": "Verify on phone before sending"},
            {"id": "opt4", "label": "Stop by CEO's office in person", "desc": "Ask face-to-face if real request"},
        ]),
        "red_flags": json.dumps([
            "CEO using Gmail address instead of company email",
            "Gift cards for business payments is a massive red flag",
            "Asks for secrecy — 'keep this between us'",
            "Urgency pressure — 'next hour' to prevent verification",
        ]),
    },
    {
        "type": "Credential Harvesting",
        "difficulty": "Medium",
        "sender_email": "noreply@microsoft-365-security.com",
        "sender_name": "Microsoft 365 Admin",
        "subject": "Your mailbox is 95% full — upgrade now",
        "body": "Mailbox Storage Alert\n\nYour Microsoft 365 mailbox (aarin@company.com) is 95% full. You may stop receiving emails if storage is not freed up within 48 hours.\n\nAs a courtesy, we are offering FREE storage upgrades to 100GB for all users this week.\n\nClick below to upgrade your storage at no cost:\n\nUpgrade Now: https://microsoft-365-security.com/storage-upgrade\n\nSign in with your Microsoft 365 credentials to apply the upgrade.\n\nMicrosoft 365 Administration",
        "correct_action": "opt2",
        "options": json.dumps([
            {"id": "opt1", "label": "Click upgrade link and sign in", "desc": "Get free 100GB upgrade"},
            {"id": "opt2", "label": "Check storage in Outlook directly", "desc": "Verify from actual Microsoft 365"},
            {"id": "opt3", "label": "Reply asking for more details", "desc": "Get info before upgrading"},
            {"id": "opt4", "label": "Forward to colleagues", "desc": "Share the free upgrade offer"},
        ]),
        "red_flags": json.dumps([
            "Microsoft doesn't send mailbox alerts from 'microsoft-365-security.com'",
            "Free upgrades out of nowhere are classic bait",
            "Link asks for Microsoft credentials — credential harvesting trap",
            "Arbitrary 48-hour deadline creates unnecessary urgency",
        ]),
    },

    # ═══════════════════ HARD (6 scenarios) ═══════════════════
    {
        "type": "Spear Phishing",
        "difficulty": "Hard",
        "sender_email": "hr-benefits@company-portal.com",
        "sender_name": "HR Benefits Portal",
        "subject": "Action required: Update your direct deposit",
        "body": "Hello,\n\nAs part of our annual payroll system upgrade, all employees must re-verify their direct deposit information by end of business Friday.\n\nPlease log in to the employee portal below and confirm your banking details:\n\nhttps://company-portal.com/payroll/verify\n\nEmployees who do not update their information may experience delays in their next paycheck.\n\nBest regards,\nHuman Resources Department\nInternal Communications",
        "correct_action": "opt3",
        "options": json.dumps([
            {"id": "opt1", "label": "Log in and update banking info", "desc": "Ensure paycheck isn't delayed"},
            {"id": "opt2", "label": "Reply to HR asking for details", "desc": "Get more context first"},
            {"id": "opt3", "label": "Visit HR office in person", "desc": "Ask HR directly about this"},
            {"id": "opt4", "label": "Forward to IT to check", "desc": "Let IT decide if legitimate"},
        ]),
        "red_flags": json.dumps([
            "External domain 'company-portal.com' pretending to be internal HR",
            "Requests sensitive banking information via email link",
            "Deadline pressure — 'end of business Friday'",
            "Threatens paycheck delay to create urgency",
        ]),
    },
    {
        "type": "Whaling",
        "difficulty": "Hard",
        "sender_email": "legal@external-counsel.com",
        "sender_name": "Morrison & Associates LLP",
        "subject": "Confidential: Pending litigation matter",
        "body": "Dear Director,\n\nOur firm has been retained regarding a matter involving your organization. We have been authorized to share preliminary documentation with senior leadership.\n\nDue to the sensitive nature of this case, we kindly request that you review the attached documents at your earliest convenience and respond directly to this email.\n\nPlease do not forward this communication to other parties until we have had an opportunity to discuss next steps.\n\nThe attached file requires your corporate credentials to access.\n\nSincerely,\nRobert Morrison, Esq.\nMorrison & Associates LLP\nConfidentiality Notice: This communication is privileged.",
        "correct_action": "opt4",
        "options": json.dumps([
            {"id": "opt1", "label": "Open the attachment carefully", "desc": "Review the legal documents"},
            {"id": "opt2", "label": "Reply asking for more context", "desc": "Engage to learn about the case"},
            {"id": "opt3", "label": "Enter credentials to view file", "desc": "Access the sensitive documents"},
            {"id": "opt4", "label": "Contact our company's legal team", "desc": "Let internal counsel handle it"},
        ]),
        "red_flags": json.dumps([
            "Unsolicited legal communication from unknown firm",
            "Requests corporate credentials to open attachment",
            "Asks recipient not to forward — isolating the target",
            "Uses legal language and confidentiality notice to intimidate",
        ]),
    },
    {
        "type": "Supply Chain Attack",
        "difficulty": "Hard",
        "sender_email": "updates@vendor-portal.io",
        "sender_name": "SaaSly Vendor Updates",
        "subject": "SaaSly v4.2 security patch — manual install required",
        "body": "Dear IT Administrator,\n\nWe recently identified a high-severity vulnerability (CVE-2024-47188) in SaaSly v4.1 affecting customer data integrity.\n\nA patch (v4.2) has been released. Due to the critical nature, automatic updates are temporarily disabled. Please download and install manually:\n\nDownload: https://vendor-portal.io/saasly/v4.2-patch.exe\n\nInstallation instructions:\n1. Run the installer as administrator\n2. Allow firewall exception when prompted\n3. Restart affected servers\n\nThis patch has been reviewed and signed by our security team. Please prioritize installation before Tuesday.\n\nBest regards,\nSaaSly Security Response Team",
        "correct_action": "opt3",
        "options": json.dumps([
            {"id": "opt1", "label": "Download and run the patch", "desc": "Fix the vulnerability quickly"},
            {"id": "opt2", "label": "Install on test server first", "desc": "Try before production rollout"},
            {"id": "opt3", "label": "Log into SaaSly official portal", "desc": "Verify patch exists there first"},
            {"id": "opt4", "label": "Reply requesting signed certificate", "desc": "Ask for proof of authenticity"},
        ]),
        "red_flags": json.dumps([
            "Unusual .io domain instead of vendor's normal domain",
            "Asks to disable firewall during install — classic malware tactic",
            "Manual patch install bypassing normal update process is suspicious",
            "Fake CVE number — verify before trusting any reference",
        ]),
    },
    {
        "type": "Romance Scam",
        "difficulty": "Hard",
        "sender_email": "lisa.nguyen@gmail.com",
        "sender_name": "Lisa Nguyen",
        "subject": "Re: Investment opportunity — happy to help",
        "body": "Hi,\n\nIt was so great chatting with you over the past few weeks! I've really enjoyed getting to know you. You mentioned you were interested in crypto investing, and I wanted to follow up.\n\nMy uncle works at a hedge fund and gave me access to an exclusive crypto platform that has been giving him 8-12% returns monthly. I've been using it for 3 months and withdrew $15,000 already.\n\nHere's the platform I use: https://crypto-elite-partners.com/signup?ref=lisa992\n\nIf you want to try, use my referral link and I'll help you get started. Start with $500 to test it. I promise you'll be impressed.\n\nBy the way, my uncle said the special access expires this weekend, so if you want in, let me know ASAP. I'll walk you through it on WhatsApp.\n\nTalk soon!\nLisa 💕",
        "correct_action": "opt2",
        "options": json.dumps([
            {"id": "opt1", "label": "Sign up with her referral link", "desc": "Try her exclusive platform"},
            {"id": "opt2", "label": "Stop contact and cut ties", "desc": "Classic long-con crypto scam"},
            {"id": "opt3", "label": "Move conversation to WhatsApp", "desc": "Discuss details privately"},
            {"id": "opt4", "label": "Start with small $500 test", "desc": "Minimize risk while trying"},
        ]),
        "red_flags": json.dumps([
            "Unbelievable returns — 8-12% monthly is impossible for legitimate investments",
            "Long relationship-building before the pitch is classic romance/pig-butchering scam",
            "Creates urgency with 'expires this weekend' deadline",
            "Unknown platform with referral links — no regulation or oversight",
        ]),
    },
    {
        "type": "Angler Phishing",
        "difficulty": "Hard",
        "sender_email": "support@customer-care-team.com",
        "sender_name": "Chase Customer Support",
        "subject": "Re: Your recent tweet about Chase Bank",
        "body": "Dear Valued Customer,\n\nWe noticed your recent tweet expressing frustration with our mobile app (@YourHandle — 'Chase app keeps crashing!').\n\nWe sincerely apologize for this inconvenience. Our support team would like to resolve this immediately and offer you a $50 courtesy credit for the trouble.\n\nTo process your credit and troubleshoot the issue, please verify your account by clicking the link below:\n\nhttps://customer-care-team.com/chase-verify\n\nYou will need to confirm:\n- Full name\n- Account number\n- Last 4 of SSN\n- Mobile app PIN\n\nWe appreciate your patience and loyalty.\n\nBest regards,\nChase Customer Care",
        "correct_action": "opt1",
        "options": json.dumps([
            {"id": "opt1", "label": "Call Chase on card back number", "desc": "Verify from trusted phone number"},
            {"id": "opt2", "label": "Click link to get $50 credit", "desc": "Claim the courtesy compensation"},
            {"id": "opt3", "label": "Reply with account number only", "desc": "Share minimum info to verify"},
            {"id": "opt4", "label": "Tweet back thanking them", "desc": "Acknowledge the response"},
        ]),
        "red_flags": json.dumps([
            "Real Chase emails come from chase.com, not 'customer-care-team.com'",
            "Angler phishing — attackers monitor social media for complaints and pounce",
            "Asks for SSN, PIN, and account number — banks NEVER ask this in email",
            "Courtesy credit offered as bait to encourage action",
        ]),
    },
    {
        "type": "Watering Hole",
        "difficulty": "Hard",
        "sender_email": "events@industry-conference-2024.org",
        "sender_name": "DevSec Summit 2024",
        "subject": "DevSec Summit — speaker slides and resources",
        "body": "Hi,\n\nThank you for attending DevSec Summit 2024 last week! We hope you enjoyed the sessions.\n\nAs promised, here are all the speaker slides, workshop materials, and recording links from the event. You registered using this email, so we're sending you the full resource package.\n\nAccess resources: https://industry-conference-2024.org/attendees/resources\n\nHighlights included:\n- Keynote: Zero Trust Architecture (Dr. Angela Chen)\n- Workshop: Threat modeling with STRIDE\n- Panel: Supply chain security post-SolarWinds\n\nThe resources will be available until December 15. Login with the email you registered with.\n\nSee you next year!\n\nDevSec Summit Organizers",
        "correct_action": "opt3",
        "options": json.dumps([
            {"id": "opt1", "label": "Click link and log in", "desc": "Access conference materials"},
            {"id": "opt2", "label": "Reply confirming I attended", "desc": "Verify my registration"},
            {"id": "opt3", "label": "Search for official conference site", "desc": "Go to it directly in new browser"},
            {"id": "opt4", "label": "Forward to colleagues who attended", "desc": "Share the resources"},
        ]),
        "red_flags": json.dumps([
            "You may not have attended this conference — check your records",
            "Suspicious domain with year in it instead of brand name",
            "Uses real conference names and speakers to seem legitimate",
            "Deadline pressure ('until December 15') pushes quick clicks",
        ]),
    },
]


def seed_database():
    db = SessionLocal()
    try:
        existing = db.query(Scenario).filter(Scenario.is_ai_generated == False).count()
        if existing < len(SEED_SCENARIOS):
            # Delete old seed scenarios that users haven't interacted with
            # Actually just add new ones - the duplicates logic handles it
            existing_subjects = set(
                s.subject for s in db.query(Scenario).filter(Scenario.is_ai_generated == False).all()
            )
            added = 0
            for data in SEED_SCENARIOS:
                if data["subject"] not in existing_subjects:
                    scenario = Scenario(**data, is_ai_generated=False)
                    db.add(scenario)
                    added += 1
            db.commit()
            print(f"Seeded {added} new scenarios (total: {existing + added})")
        else:
            print(f"Database already has {existing} static scenarios, skipping seed")
    finally:
        db.close()
