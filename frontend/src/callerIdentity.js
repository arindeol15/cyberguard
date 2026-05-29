const PROFILE_POOLS = {
  executive: [
    { name: 'Marcus Reed', role: 'Chief Financial Officer', org: 'Finance Office', voiceHint: 'executive' },
    { name: 'Elena Torres', role: 'Operations Director', org: 'Executive Office', voiceHint: 'female' },
    { name: 'Daniel Mercer', role: 'Procurement VP', org: 'Procurement Office', voiceHint: 'executive' },
    { name: 'Priya Shah', role: 'Finance Controller', org: 'Finance Office', voiceHint: 'female' },
  ],
  bank: [
    { name: 'Sarah Malik', role: 'Fraud Specialist', org: 'Bank Fraud Department', voiceHint: 'support' },
    { name: 'Thomas Grant', role: 'Account Security Officer', org: 'Card Services', voiceHint: 'caller' },
    { name: 'Nadia Brooks', role: 'Security Desk Analyst', org: 'Customer Protection', voiceHint: 'female' },
  ],
  support: [
    { name: 'Kevin Park', role: 'Technical Support Agent', org: 'Technical Support', voiceHint: 'support' },
    { name: 'Maya Chen', role: 'Service Desk Analyst', org: 'IT Helpdesk', voiceHint: 'female' },
    { name: 'Owen Carter', role: 'Support Engineer', org: 'Support Desk', voiceHint: 'caller' },
  ],
  legal: [
    { name: 'Laura Chen', role: 'Legal Assistant', org: 'Smith & Associates', voiceHint: 'female' },
    { name: 'Victor Hale', role: 'Case Coordinator', org: 'Legal Office', voiceHint: 'executive' },
  ],
  recruiter: [
    { name: 'Nina Patel', role: 'Recruiter', org: 'Talent Acquisition', voiceHint: 'female' },
    { name: 'Adrian Cole', role: 'Hiring Coordinator', org: 'Recruiting Team', voiceHint: 'caller' },
  ],
  personal: [
    { name: 'Jordan Lee', role: 'Family Contact', org: 'Personal Call', voiceHint: 'caller' },
    { name: 'Sofia Ramos', role: 'Friend', org: 'Personal Call', voiceHint: 'female' },
  ],
  generic: [
    { name: 'Avery Brooks', role: 'Account Representative', org: 'Account Services', voiceHint: 'caller' },
    { name: 'Riley Morgan', role: 'Verification Agent', org: 'Security Desk', voiceHint: 'support' },
    { name: 'Samira Khan', role: 'Customer Care Agent', org: 'Customer Care', voiceHint: 'female' },
    { name: 'Jonah Price', role: 'Operations Specialist', org: 'Operations Desk', voiceHint: 'caller' },
  ],
};

function stableIndex(value, length) {
  const source = String(value || 'caller');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

function profileFor(text) {
  const lower = text.toLowerCase();
  if (/(ceo|cfo|executive|manager|director|wire|vendor|invoice|gift card|payment|finance|procurement)/.test(lower)) return 'executive';
  if (/(bank|fraud|card|debit|credit|account holder|sim swap)/.test(lower)) return 'bank';
  if (/(lawyer|legal|lawsuit|subpoena|bond|arrest|firm)/.test(lower)) return 'legal';
  if (/(recruiter|interview|hiring|job|background check)/.test(lower)) return 'recruiter';
  if (/(family|friend|instagram|emergency|crying)/.test(lower)) return 'personal';
  if (/(microsoft|windows|support|helpdesk|computer|refund|amazon|remote access|technical)/.test(lower)) return 'support';
  return 'generic';
}

export function sanitizeCallerText(value) {
  let text = String(value || '');
  text = text.replace(/\([^)]*\bAI\b[^)]*\)/gi, '');
  text = text.replace(/\bAI[-\s]*(?:generated|powered|driven|voice|agent|bot|scam|impersonation|clone|cloned)\b/gi, '');
  text = text.replace(/\bAI\b\s*/gi, '');
  text = text.replace(/\b(?:deepfake|synthetic voice|voice[-\s]*clone|voice[-\s]*cloned|cloned voice)\b/gi, '');
  text = text.replace(/\bfrom public videos\b/gi, '');
  text = text.replace(/\s{2,}/g, ' ').replace(/\s+([.,:;!?])/g, '$1').trim();
  return text;
}

export function getScenarioCallerIdentity(scenario = {}, data = {}, channel = '') {
  const source = [
    channel,
    scenario.id,
    scenario.subject,
    scenario.sender_name,
    scenario.body,
    data.claimed_organization,
    data.impersonated,
    data.scenario_name,
  ].filter(Boolean).join(' ');
  const profile = profileFor(source);
  const pool = PROFILE_POOLS[profile] || PROFILE_POOLS.generic;
  const selected = pool[stableIndex(source, pool.length)];
  return { ...selected, profile };
}

export function humanizeCallerLabel(value, identity) {
  const original = String(value || '');
  const clean = sanitizeCallerText(original);
  if (!clean || /\b(ai|deepfake|voice[-\s]*clone|voice[-\s]*cloned|cloned voice)\b/i.test(original)) {
    return `${identity.name} / ${identity.role}`;
  }
  if (/^(phone call|voice note|ceo voice note|incoming call|caller|n\/a)$/i.test(clean) || clean.length > 58) {
    return `${identity.name} / ${identity.role}`;
  }
  return clean;
}
