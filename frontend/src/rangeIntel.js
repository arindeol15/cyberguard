const CATEGORY_INTEL = {
  email: {
    role: 'Mail security analyst',
    objective: 'Decide whether the message belongs in the user inbox, quarantine, or incident queue.',
    environment: 'Corporate mail gateway',
    adversary: 'Credential harvesting crew',
    impact: 'Mailbox takeover, payroll fraud, or account reset abuse',
    techniques: ['sender spoofing', 'urgency pressure', 'credential harvest', 'link obfuscation'],
    artifacts: ['sender domain', 'reply path', 'embedded link', 'language pressure'],
    steps: ['Inspect sender identity', 'Compare link destination', 'Look for urgency or secrecy', 'Use an official channel before acting'],
  },
  website: {
    role: 'Browser trust analyst',
    objective: 'Determine if the page is safe before any credential, payment, or session data is entered.',
    environment: 'User browser session',
    adversary: 'Phishing kit operator',
    impact: 'Credential theft, session hijack, or payment diversion',
    techniques: ['domain impersonation', 'fake login', 'certificate confusion', 'brand cloning'],
    artifacts: ['address bar', 'certificate', 'domain age', 'form behavior'],
    steps: ['Inspect the URL', 'Check certificate ownership', 'Compare with the official site', 'Close and navigate directly if unsure'],
  },
  qr: {
    role: 'Mobile threat analyst',
    objective: 'Assess the QR code destination before the mobile browser trusts it.',
    environment: 'Phone scanner preview',
    adversary: 'Quishing operator',
    impact: 'Credential capture, payment redirection, or malicious app install',
    techniques: ['QR substitution', 'short-link abuse', 'mobile trust gap', 'physical tampering'],
    artifacts: ['QR placement', 'preview URL', 'claimed service', 'landing page request'],
    steps: ['Preview the destination', 'Inspect placement', 'Check official signage or app', 'Avoid submitting data from unknown QR links'],
  },
  vishing: {
    role: 'Call fraud analyst',
    objective: 'Control the conversation and verify the caller through a trusted path.',
    environment: 'Live phone call',
    adversary: 'Voice social engineer',
    impact: 'Credential disclosure, payment fraud, or remote access compromise',
    techniques: ['authority pretext', 'callback avoidance', 'urgency pressure', 'information elicitation'],
    artifacts: ['caller ID', 'claimed organization', 'requested data', 'pressure language'],
    steps: ['Let the caller talk without complying', 'Record the requested action', 'Hang up if sensitive data is requested', 'Call back using a known number'],
  },
  usb: {
    role: 'Endpoint response analyst',
    objective: 'Handle removable media without executing unknown payloads.',
    environment: 'User workstation',
    adversary: 'Physical access attacker',
    impact: 'Keylogging, ransomware staging, or endpoint persistence',
    techniques: ['curiosity bait', 'malicious autorun', 'file masquerading', 'persistence install'],
    artifacts: ['found location', 'USB label', 'visible files', 'hidden payload'],
    steps: ['Do not plug into production systems', 'Preserve chain of custody', 'Submit to IT security', 'Document where it was found'],
  },
  chat: {
    role: 'Collaboration security analyst',
    objective: 'Verify whether the internal message is a legitimate business request or account abuse.',
    environment: 'Teams or Slack workspace',
    adversary: 'Account takeover operator',
    impact: 'Credential harvest, document theft, or lateral movement',
    techniques: ['internal impersonation', 'guest account abuse', 'shared document lure', 'OTP request'],
    artifacts: ['workspace identity', 'guest status', 'shared file', 'channel context'],
    steps: ['Inspect sender profile', 'Check tenant and guest status', 'Avoid opening unexpected files', 'Verify through a separate channel'],
  },
  attachment: {
    role: 'Malware triage analyst',
    objective: 'Decide whether the file can be opened, sandboxed, or quarantined.',
    environment: 'Attachment sandbox',
    adversary: 'Malware delivery crew',
    impact: 'Ransomware execution, credential theft, or command-and-control beaconing',
    techniques: ['double extension', 'macro abuse', 'hidden executable', 'sandbox evasion'],
    artifacts: ['filename', 'file type', 'publisher signature', 'sandbox behavior'],
    steps: ['Inspect metadata', 'Confirm extension and type', 'Run a sandbox preview', 'Quarantine on suspicious behavior'],
  },
  browser_exploit: {
    role: 'Browser defense analyst',
    objective: 'Stop popups, downloads, and permission prompts before endpoint compromise.',
    environment: 'Browser exploit simulation',
    adversary: 'Drive-by download operator',
    impact: 'Malware install, extension abuse, or data theft',
    techniques: ['fake update', 'CAPTCHA lure', 'malicious permissions', 'drive-by download'],
    artifacts: ['popup copy', 'download name', 'extension permission', 'source domain'],
    steps: ['Close untrusted prompts', 'Review requested permissions', 'Block executable downloads', 'Report the URL'],
  },
  mfa: {
    role: 'Identity defense analyst',
    objective: 'Respond to unsolicited MFA prompts as possible credential compromise.',
    environment: 'Identity provider alerts',
    adversary: 'Credential stuffing operator',
    impact: 'Session takeover, mailbox access, or cloud persistence',
    techniques: ['push fatigue', 'impossible travel', 'social pressure', 'session token theft'],
    artifacts: ['prompt count', 'source IP', 'device', 'login location'],
    steps: ['Deny unknown prompts', 'Review login history', 'Report the event', 'Reset password and revoke sessions'],
  },
  cloud: {
    role: 'Cloud incident analyst',
    objective: 'Find and contain suspicious SaaS sessions before data spreads.',
    environment: 'Cloud admin console',
    adversary: 'Token theft operator',
    impact: 'External file sharing, mailbox theft, or refresh token persistence',
    techniques: ['session hijack', 'external sharing', 'impossible travel', 'token persistence'],
    artifacts: ['login history', 'IP address', 'sharing event', 'active session'],
    steps: ['Inspect risky sessions', 'Revoke tokens', 'Reset credentials', 'Review external shares'],
  },
  insider: {
    role: 'SOC behavior analyst',
    objective: 'Investigate unusual employee behavior while preserving evidence.',
    environment: 'User behavior analytics console',
    adversary: 'Malicious, careless, or compromised insider',
    impact: 'Data exfiltration, privilege misuse, or policy breach',
    techniques: ['data staging', 'privilege misuse', 'USB copy', 'after-hours access'],
    artifacts: ['employee risk score', 'file movement', 'role mismatch', 'device activity'],
    steps: ['Review context', 'Preserve logs', 'Escalate carefully', 'Avoid tipping off the subject prematurely'],
  },
  wifi: {
    role: 'Network access analyst',
    objective: 'Choose a safe network path and detect rogue captive portals.',
    environment: 'Wireless network selection',
    adversary: 'Evil twin operator',
    impact: 'Credential capture, traffic interception, or device profiling',
    techniques: ['evil twin', 'captive portal theft', 'SSID cloning', 'signal strength bait'],
    artifacts: ['SSID', 'security mode', 'signal strength', 'portal request'],
    steps: ['Compare official signage', 'Avoid open lookalike SSIDs', 'Use VPN', 'Report rogue hotspots'],
  },
  dns: {
    role: 'Network trust analyst',
    objective: 'Detect whether a trusted destination has been redirected or poisoned.',
    environment: 'DNS and browser telemetry',
    adversary: 'Pharming operator',
    impact: 'Credential theft, browser warning bypass, or intranet spoofing',
    techniques: ['DNS poisoning', 'certificate mismatch', 'pharming redirect', 'resolver manipulation'],
    artifacts: ['requested domain', 'resolved IP', 'certificate subject', 'resolver result'],
    steps: ['Inspect certificate', 'Compare resolver output', 'Preserve warning details', 'Escalate to network operations'],
  },
  deepfake: {
    role: 'Media trust analyst',
    objective: 'Verify identity before acting on urgent voice or video requests.',
    environment: 'Executive communication channel',
    adversary: 'Impersonation fraud operator',
    impact: 'Wire fraud, gift card loss, or sensitive data disclosure',
    techniques: ['voice impersonation', 'urgency manipulation', 'secrecy pressure', 'callback refusal'],
    artifacts: ['caller identity', 'requested action', 'verification path', 'voice markers'],
    steps: ['Challenge the identity', 'Use a known callback path', 'Refuse secrecy pressure', 'Report the attempt'],
  },
  attack_chain: {
    role: 'Incident commander',
    objective: 'Connect related alerts into one attack chain and choose containment actions.',
    environment: 'Multi-stage incident timeline',
    adversary: 'Intrusion operator',
    impact: 'Account takeover, internal pivoting, and ransomware deployment',
    techniques: ['initial access', 'credential theft', 'MFA fatigue', 'lateral movement', 'ransomware staging'],
    artifacts: ['stage sequence', 'identity pivot', 'payload attempt', 'risk score'],
    steps: ['Correlate events', 'Contain identity compromise', 'Isolate affected endpoint', 'Preserve evidence'],
  },
  smishing: {
    role: 'Mobile fraud analyst',
    objective: 'Assess whether the SMS link is a safe service path or credential trap.',
    environment: 'Mobile messaging app',
    adversary: 'SMS phishing operator',
    impact: 'Payment theft, OTP capture, or account takeover',
    techniques: ['SMS spoofing', 'short-link lure', 'delivery pressure', 'OTP theft'],
    artifacts: ['sender number', 'short URL', 'landing page', 'requested data'],
    steps: ['Inspect sender number', 'Preview the link', 'Open official app directly', 'Block and report the message'],
  },
  bec: {
    role: 'Finance fraud analyst',
    objective: 'Validate payment instructions before money or gift card value leaves the company.',
    environment: 'Accounts payable workflow',
    adversary: 'Business email compromise crew',
    impact: 'Wire fraud, vendor payment diversion, or gift card cash-out',
    techniques: ['thread hijack', 'bank detail swap', 'executive pressure', 'process bypass'],
    artifacts: ['invoice metadata', 'vendor profile', 'approval chain', 'payment amount'],
    steps: ['Compare vendor records', 'Verify out-of-band', 'Check approval chain', 'Stop payment on mismatch'],
  },
  supply_chain: {
    role: 'Build security analyst',
    objective: 'Determine whether an update, dependency, or CI action can safely enter the pipeline.',
    environment: 'Software delivery pipeline',
    adversary: 'Supply-chain intrusion operator',
    impact: 'Secret theft, malicious release, or build environment compromise',
    techniques: ['package typosquat', 'signature mismatch', 'postinstall script', 'CI token abuse'],
    artifacts: ['publisher identity', 'version change', 'signature status', 'sandbox findings'],
    steps: ['Review diff', 'Verify publisher signature', 'Run sandbox', 'Block or roll back on beaconing'],
  },
};

const DEFAULT_INTEL = {
  role: 'SOC analyst',
  objective: 'Investigate the event, preserve evidence, and choose a defensible response.',
  environment: 'Security operations console',
  adversary: 'Social engineering operator',
  impact: 'Credential exposure, data loss, or business process compromise',
  techniques: ['trust abuse', 'urgency pressure', 'identity spoofing'],
  artifacts: ['sender identity', 'requested action', 'technical indicators', 'business context'],
  steps: ['Inspect the evidence', 'Verify through trusted channels', 'Avoid irreversible action', 'Report suspicious activity'],
};

const DIFFICULTY_META = {
  Easy: { severity: 'Moderate', confidence: 62, noise: 'Low', pace: 'Training mode' },
  Medium: { severity: 'High', confidence: 74, noise: 'Medium', pace: 'SOC triage' },
  Hard: { severity: 'Critical', confidence: 86, noise: 'High', pace: 'Incident bridge' },
};

function stableIndex(value, length) {
  const source = String(value || 'range');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

function compact(value, fallback = 'Not provided') {
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return Object.values(value).filter(Boolean).slice(0, 3).join(', ') || fallback;
  return String(value);
}

function short(value, max = 68) {
  const text = compact(value, '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text || 'Not provided';
  return `${text.slice(0, max - 1).trim()}...`;
}

function domainFromUrl(value) {
  try {
    return new URL(String(value)).hostname;
  } catch {
    return short(value);
  }
}

function firstDefined(...values) {
  return values.find(v => v !== undefined && v !== null && v !== '');
}

function buildEvidence(category, scenario, extra, identity) {
  const common = [
    ['Scenario', scenario.subject],
    ['Type', scenario.type],
  ];
  const byCategory = {
    email: [['Sender', scenario.sender_email], ['Display name', scenario.sender_name], ['Requested action', scenario.body]],
    website: [['Shown domain', domainFromUrl(extra.fake_url || extra.url)], ['Legitimate domain', domainFromUrl(extra.real_url)], ['Domain age', extra.domain_age || extra.domain_age_days], ['SSL', firstDefined(extra.ssl_status, extra.ssl_valid)]],
    qr: [['Location', extra.location], ['Claims to be', extra.claimed_purpose], ['Destination', extra.actual_destination], ['Placement', extra.qr_placement]],
    vishing: [['Caller', identity ? `${identity.name} / ${identity.role}` : scenario.sender_name], ['Caller ID', extra.caller_id], ['Claims', extra.claimed_organization], ['Requests', extra.info_requested]],
    usb: [['Found at', extra.found_location], ['USB label', extra.usb_label], ['Visible files', extra.files_if_opened], ['Hidden payload', extra.hidden_payload]],
    chat: [['Channel', extra.channel], ['Sender domain', extra.sender_domain], ['Attachment', extra.attachment], ['Message count', Array.isArray(extra.messages) ? extra.messages.length : 'Unknown']],
    attachment: [['Filename', extra.filename], ['Claimed type', extra.claimed_type], ['Real type', extra.real_type], ['Signature', extra.signature]],
    browser_exploit: [['URL', extra.url], ['Popup', extra.popup_text], ['Download', extra.download_name], ['Permissions', extra.requested_permissions]],
    mfa: [['Application', extra.app], ['Location', extra.location], ['IP', extra.ip], ['Prompt count', extra.prompt_count]],
    cloud: [['Shares', extra.shares], ['Data at risk', extra.data_risk], ['Sessions', Array.isArray(extra.sessions) ? `${extra.sessions.length} active` : 'Unknown'], ['Risky location', Array.isArray(extra.sessions) ? extra.sessions.find(s => s.risk === 'Critical' || s.risk === 'High')?.location : 'Unknown']],
    insider: [['Policy trigger', extra.policy_trigger], ['Risky files', extra.risky_files], ['Employees', Array.isArray(extra.employees) ? `${extra.employees.length} profiled` : 'Unknown'], ['Top risk', Array.isArray(extra.employees) ? extra.employees[0]?.name : 'Unknown']],
    wifi: [['Location', extra.location], ['VPN', extra.vpn], ['Portal', extra.captive_portal], ['Networks', Array.isArray(extra.networks) ? `${extra.networks.length} visible` : 'Unknown']],
    dns: [['Requested domain', extra.requested_domain], ['Expected IP', extra.expected_ip], ['Resolved IP', extra.resolved_ip], ['Certificate', extra.cert_subject]],
    deepfake: [['Caller', identity ? `${identity.name} / ${identity.role}` : scenario.sender_name], ['Channel', extra.channel], ['Requested action', extra.transcript || scenario.body], ['Markers', extra.markers]],
    attack_chain: [['Initial access', extra.initial_access], ['Final impact', extra.final_impact], ['Stages', Array.isArray(extra.stages) ? `${extra.stages.length} stages` : 'Unknown'], ['Current objective', scenario.body]],
    smishing: [['Sender number', extra.sender_number || extra.phone], ['Short URL', extra.short_url || extra.url], ['Landing page', extra.landing_page], ['Requested data', extra.requested_data]],
    bec: [['Vendor', extra.vendor || scenario.sender_name], ['Amount', extra.amount], ['Bank change', extra.bank_change], ['Approval chain', extra.approval_chain]],
    supply_chain: [['Package', extra.package || extra.vendor_update], ['Version', extra.version], ['Publisher', extra.publisher], ['Sandbox', extra.sandbox_findings]],
  };
  const rows = (byCategory[category] || common).filter(([label, value]) => compact(value, '') !== '');
  return [...common, ...rows].slice(0, 6).map(([label, value]) => ({ label, value: short(value) }));
}

function derivePressureFlags(text, category) {
  const source = String(text || '').toLowerCase();
  const flags = [];
  if (/urgent|immediately|right now|today|deadline|expires|5 minutes|30 minutes/.test(source)) flags.push('time pressure');
  if (/confidential|do not|don't|secrecy|keep it quiet|do not loop/.test(source)) flags.push('secrecy request');
  if (/password|code|otp|mfa|card|cvv|pin|wire|gift card|crypto|remote access/.test(source)) flags.push('sensitive action');
  if (/ceo|cfo|bank|microsoft|hr|support|legal|vendor|manager/.test(source)) flags.push('authority claim');
  if (category === 'attack_chain') flags.push('multi-stage correlation');
  return flags.length ? flags.slice(0, 4) : ['identity uncertainty', 'business process risk'];
}

export function getRangeIntel({ category, scenario = {}, identity = null } = {}) {
  const profile = CATEGORY_INTEL[category] || DEFAULT_INTEL;
  const extra = scenario.extra_data || {};
  const difficulty = scenario.difficulty || 'Medium';
  const meta = DIFFICULTY_META[difficulty] || DIFFICULTY_META.Medium;
  const seed = `${category}-${scenario.id || scenario.subject || difficulty}`;
  const caseSuffix = String(stableIndex(seed, 9000) + 1000);
  const pressure = derivePressureFlags(`${scenario.subject || ''} ${scenario.body || ''} ${JSON.stringify(extra)}`, category);
  const techniques = [...profile.techniques].sort((a, b) => stableIndex(`${seed}-${a}`, 99) - stableIndex(`${seed}-${b}`, 99)).slice(0, 4);

  return {
    ...profile,
    caseId: `CG-${String(category || 'SOC').replace(/_/g, '-').toUpperCase()}-${caseSuffix}`,
    difficulty,
    severity: meta.severity,
    confidence: meta.confidence,
    noise: meta.noise,
    pace: meta.pace,
    pressure,
    techniques,
    evidence: buildEvidence(category, scenario, extra, identity),
    playbook: profile.steps,
    analystPrompt: `You are the ${profile.role}. ${profile.objective}`,
  };
}

export function decisionAxis(option = {}) {
  const text = `${option.label || ''} ${option.desc || ''}`.toLowerCase();
  if (/report|quarantine|block|revoke|isolate|contain|escalate/.test(text)) return 'Containment';
  if (/verify|call|official|direct|known|portal|inspect|review|check/.test(text)) return 'Verification';
  if (/open|click|enter|approve|install|download|pay|wire|send|share|plug/.test(text)) return 'Exposure';
  if (/ignore|delete|dismiss|wait|leave/.test(text)) return 'Delay';
  return 'Judgment';
}

export function afterActionDepth({ result, intel }) {
  const correct = Boolean(result?.correct);
  return {
    title: correct ? 'Control Path Reinforced' : 'Compromise Path Opened',
    summary: correct
      ? `You kept the incident inside the ${intel.environment} control path and reduced ${intel.impact.toLowerCase()}.`
      : `The decision increased exposure to ${intel.impact.toLowerCase()}. Treat this as an incident-response drill.`,
    nextActions: correct
      ? ['Preserve the evidence trail', 'Document the validation path', 'Share indicators with the SOC queue']
      : ['Contain affected accounts or endpoints', 'Revoke suspicious sessions', 'Preserve logs and report the incident'],
  };
}
