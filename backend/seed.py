import json
from database import SessionLocal, Scenario


SEED_SCENARIOS = [
    {
        "type": "Phishing",
        "difficulty": "Easy",
        "sender_email": "support@amaz0n-security.com",
        "sender_name": "Amazon Security",
        "subject": "Your account has been locked!",
        "body": "Dear Customer,\n\nWe detected suspicious activity on your Amazon account. Your account has been temporarily locked for security purposes.\n\nPlease click the link below to verify your identity and restore access within 24 hours or your account will be permanently deleted.\n\nVerify Now: https://amaz0n-security.com/verify-account\n\nThank you,\nAmazon Customer Protection Team",
        "correct_action": "report",
        "red_flags": json.dumps([
            "Fake domain — 'amaz0n' uses a zero instead of the letter 'o'",
            "Urgency tactic — 24 hour deadline with threat of deletion",
            "Generic greeting — 'Dear Customer' instead of your real name",
            "Suspicious link pointing to a non-Amazon domain"
        ]),
    },
    {
        "type": "BEC",
        "difficulty": "Medium",
        "sender_email": "ceo.james@company-mail.net",
        "sender_name": "James Wright (CEO)",
        "subject": "Urgent wire transfer needed",
        "body": "Hi,\n\nI need you to process a wire transfer of $32,000 to a new supplier immediately. I'm traveling and can't do it myself.\n\nWire to:\nBank: Pacific Trust\nAccount: 7739201854\n\nPlease handle this right away and don't mention it to others — the deal is confidential until announced.\n\nThanks,\nJames\n\nSent from my iPhone",
        "correct_action": "verify",
        "red_flags": json.dumps([
            "CEO requesting money transfer via email — bypasses normal approval process",
            "Asks for secrecy — 'don't mention it to others'",
            "Creates pressure with urgency — 'immediately'",
            "No reference to any purchase order or documentation"
        ]),
    },
    {
        "type": "Spear Phishing",
        "difficulty": "Hard",
        "sender_email": "hr-benefits@company-portal.com",
        "sender_name": "HR Benefits Portal",
        "subject": "Action required: Update your direct deposit",
        "body": "Hello,\n\nAs part of our annual payroll system upgrade, all employees must re-verify their direct deposit information by end of business Friday.\n\nPlease log in to the employee portal below and confirm your banking details:\n\nhttps://company-portal.com/payroll/verify\n\nEmployees who do not update their information may experience delays in their next paycheck.\n\nBest regards,\nHuman Resources Department\nInternal Communications",
        "correct_action": "verify",
        "red_flags": json.dumps([
            "External domain 'company-portal.com' pretending to be internal HR",
            "Requests sensitive banking information via email link",
            "Deadline pressure — 'end of business Friday'",
            "Threatens paycheck delay to create urgency"
        ]),
    },
    {
        "type": "Smishing",
        "difficulty": "Easy",
        "sender_email": "sms@delivery-update.com",
        "sender_name": "FedEx Delivery",
        "subject": "Package delivery failed — action required",
        "body": "FedEx Notification:\n\nYour package (Tracking: FX-8829103746) could not be delivered today due to an incomplete address.\n\nPlease update your delivery address within 12 hours to avoid return to sender:\n\nhttps://fedex-redelivery.com/update\n\nShipping fee adjustment: $2.99\n\nFedEx Customer Service\nRef: #FX-8829103746",
        "correct_action": "report",
        "red_flags": json.dumps([
            "Fake domain 'fedex-redelivery.com' — not the real FedEx website",
            "Asks for a small fee — classic bait to steal payment info",
            "12-hour urgency window to pressure quick action",
            "You may not be expecting any package at all"
        ]),
    },
    {
        "type": "Pretexting",
        "difficulty": "Medium",
        "sender_email": "it.helpdesk@corp-support.org",
        "sender_name": "IT Help Desk",
        "subject": "Mandatory password reset — security audit",
        "body": "Dear Employee,\n\nAs part of our quarterly security audit, the IT department requires all employees to reset their network passwords by EOD today.\n\nPlease use the secure link below to update your credentials:\n\nhttps://corp-support.org/password-reset\n\nYou will need to enter your current password followed by your new password. Failure to comply will result in temporary account suspension.\n\nRegards,\nIT Security Team\nHelp Desk Ticket #IT-4492",
        "correct_action": "report",
        "red_flags": json.dumps([
            "External domain 'corp-support.org' impersonating internal IT",
            "Requests current password — legitimate resets never ask for this",
            "Threat of account suspension creates fear",
            "Fake ticket number adds false legitimacy"
        ]),
    },
    {
        "type": "Whaling",
        "difficulty": "Hard",
        "sender_email": "legal@external-counsel.com",
        "sender_name": "Morrison & Associates LLP",
        "subject": "Confidential: Pending litigation matter",
        "body": "Dear Director,\n\nOur firm has been retained regarding a matter involving your organization. We have been authorized to share preliminary documentation with senior leadership.\n\nDue to the sensitive nature of this case, we kindly request that you review the attached documents at your earliest convenience and respond directly to this email.\n\nPlease do not forward this communication to other parties until we have had an opportunity to discuss next steps.\n\nThe attached file requires your corporate credentials to access.\n\nSincerely,\nRobert Morrison, Esq.\nMorrison & Associates LLP\nConfidentiality Notice: This communication is privileged.",
        "correct_action": "verify",
        "red_flags": json.dumps([
            "Unsolicited legal communication from unknown firm",
            "Requests corporate credentials to open attachment",
            "Asks recipient not to forward — isolating the target",
            "Uses legal language and confidentiality notice to intimidate"
        ]),
    },
]


def seed_database():
    db = SessionLocal()
    try:
        existing = db.query(Scenario).count()
        if existing == 0:
            for data in SEED_SCENARIOS:
                scenario = Scenario(**data)
                db.add(scenario)
            db.commit()
            print(f"Seeded {len(SEED_SCENARIOS)} scenarios")
        else:
            print(f"Database already has {existing} scenarios, skipping seed")
    finally:
        db.close()
