const DEFAULT_PROBES = [
  {
    key: 'identity',
    label: 'Validate identity',
    desc: 'Compare the claimed sender, caller, tenant, or device against a trusted record.',
    outcomes: [
      'Identity evidence is incomplete. The request should not be trusted on display name alone.',
      'The identity check finds a mismatch between the claim and the trusted source.',
      'The trusted path gives more context than the prompt provided.',
    ],
  },
  {
    key: 'technical',
    label: 'Inspect technical signal',
    desc: 'Review URL, certificate, file, session, resolver, or permission details.',
    outcomes: [
      'Technical evidence shows a trust gap that is easy to miss at first glance.',
      'The indicator looks polished, but ownership or provenance does not line up.',
      'A small technical mismatch changes the risk level of the whole case.',
    ],
  },
  {
    key: 'business',
    label: 'Check business process',
    desc: 'Look for ticketing, approval, timing, or normal workflow evidence.',
    outcomes: [
      'The request tries to bypass the normal workflow instead of using it.',
      'No matching approval trail is visible in the usual system.',
      'The business context creates pressure but does not prove legitimacy.',
    ],
  },
  {
    key: 'impact',
    label: 'Estimate blast radius',
    desc: 'Decide what would be exposed if the requested action succeeds.',
    outcomes: [
      'The likely impact is broader than one user action because identity or endpoint trust is involved.',
      'A small action could expose credentials, sessions, files, or payment control.',
      'The fastest action is also the hardest one to reverse after compromise.',
    ],
  },
];

const CATEGORY_PROBES = {
  email: [
    { key: 'headers', label: 'Trace mail headers', desc: 'Compare display name, return path, and authentication alignment.', outcomes: ['SPF/DKIM alignment does not fully support the visible sender.', 'The return path and display identity tell different stories.'] },
    { key: 'hover', label: 'Hover embedded link', desc: 'Reveal the real target without opening it.', outcomes: ['The visible call to action and destination do not match.', 'The link destination relies on urgency more than trust.'] },
    { key: 'attachment', label: 'Review attachment risk', desc: 'Check whether an attachment or document path is being used as the lure.', outcomes: ['The attachment path creates a second credential prompt.', 'The file workflow asks for more trust than the email earned.'] },
  ],
  website: [
    { key: 'cert', label: 'Inspect certificate', desc: 'Check ownership and issuer instead of trusting the lock icon.', outcomes: ['The lock only proves encryption, not that the brand owns the site.', 'Certificate details do not match the expected organization.'] },
    { key: 'address', label: 'Read address bar slowly', desc: 'Look for typosquats, extra words, and misleading subdomains.', outcomes: ['The domain shape is close enough to fool quick scanning.', 'The brand appears in the URL, but not in the registered domain.'] },
    { key: 'form', label: 'Test form behavior', desc: 'Look for unusual credential, OTP, or payment requests.', outcomes: ['The page asks for more data than the real workflow normally needs.', 'Help links and recovery paths do not behave like a real portal.'] },
  ],
  qr: [
    { key: 'preview', label: 'Preview QR target', desc: 'Use the scanner preview before opening the destination.', outcomes: ['The preview exposes a domain that does not match the placement claim.', 'The QR code uses mobile trust to hide the destination until late.'] },
    { key: 'placement', label: 'Inspect placement', desc: 'Check stickers, signage, and whether the QR belongs there.', outcomes: ['Physical placement suggests the code may have been swapped.', 'The QR label is easier to change than the official workflow.'] },
    { key: 'request', label: 'Review landing request', desc: 'Identify what the QR page asks the user to submit.', outcomes: ['The landing page requests credentials before proving legitimacy.', 'The requested data does not match the claimed QR purpose.'] },
  ],
  vishing: [
    { key: 'caller', label: 'Control the call', desc: 'Let the caller explain without giving data.', outcomes: ['The caller gives pressure, not verifiable proof.', 'The script discourages independent callback.'] },
    { key: 'callback', label: 'Find callback path', desc: 'Use a known number or internal directory rather than caller-provided details.', outcomes: ['A trusted callback path is available and should replace the live call.', 'The caller-provided path cannot be treated as verification.'] },
    { key: 'request', label: 'Classify request', desc: 'Identify whether the caller wants money, credentials, OTP, or remote access.', outcomes: ['The requested action would transfer control or value.', 'The caller is asking for something a legitimate team should not need by phone.'] },
  ],
  usb: [
    { key: 'chain', label: 'Preserve chain of custody', desc: 'Record where the device was found before anyone plugs it in.', outcomes: ['The location and label are part of the lure.', 'Handling matters because execution could destroy evidence.'] },
    { key: 'sandbox', label: 'Use sandbox only', desc: 'Inspect files away from production endpoints.', outcomes: ['Visible files are bait; hidden behavior is the real risk.', 'File names are designed to make curiosity feel justified.'] },
    { key: 'policy', label: 'Check removable media policy', desc: 'Compare the situation to normal device handling rules.', outcomes: ['The policy path is safer than personal judgment here.', 'Unknown media should not become a user workstation event.'] },
  ],
  browser_exploit: [
    { key: 'permissions', label: 'Read permissions', desc: 'Check what the page or extension wants to control.', outcomes: ['The requested permissions exceed what the page claims to need.', 'A CAPTCHA or update lure is being used to request endpoint control.'] },
    { key: 'download', label: 'Inspect download source', desc: 'Check whether the file came from a trusted vendor channel.', outcomes: ['The update path bypasses the browser vendor.', 'The file source is not tied to the claimed software provider.'] },
    { key: 'popup', label: 'Close and observe', desc: 'See whether the popup keeps pressuring the same action.', outcomes: ['Repeated prompts are part of the social pressure.', 'The site keeps changing the story to force installation.'] },
  ],
  mfa: [
    { key: 'prompts', label: 'Count prompt pattern', desc: 'Look for approval spam instead of one expected challenge.', outcomes: ['Repeated prompts indicate credential compromise pressure.', 'The timing does not match a user-initiated sign-in.'] },
    { key: 'activity', label: 'Review login activity', desc: 'Check location, device, application, and IP before acting.', outcomes: ['Login telemetry does not match normal user context.', 'The prompt is asking for trust before the session is understood.'] },
    { key: 'session', label: 'Plan session response', desc: 'Decide whether password reset and session revocation are needed.', outcomes: ['Denying is only step one if credentials may already be known.', 'Session containment matters if prompts keep arriving.'] },
  ],
  cloud: [
    { key: 'sessions', label: 'Inspect sessions', desc: 'Review active sessions and impossible travel indicators.', outcomes: ['One session has a risk pattern that does not fit the user.', 'The suspicious session needs containment, not just observation.'] },
    { key: 'shares', label: 'Audit external shares', desc: 'Look for documents exposed outside the tenant.', outcomes: ['External sharing increases the blast radius.', 'The share event gives a stronger signal than the alert title.'] },
    { key: 'tokens', label: 'Check token persistence', desc: 'Decide whether refresh tokens should be revoked.', outcomes: ['Password reset alone may not remove existing sessions.', 'Token revocation is needed when cloud access may persist.'] },
  ],
  insider: [
    { key: 'baseline', label: 'Compare baseline', desc: 'Check whether behavior differs from the employee role and schedule.', outcomes: ['The activity is unusual for the role and time window.', 'Context matters before accusing an employee.'] },
    { key: 'evidence', label: 'Preserve evidence', desc: 'Capture logs without tipping off the user too early.', outcomes: ['Evidence preservation is more useful than a direct confrontation.', 'A rushed message to the user could destroy the investigation trail.'] },
    { key: 'scope', label: 'Scope data movement', desc: 'Identify what files, devices, or privileges are involved.', outcomes: ['The data movement touches sensitive assets.', 'The event could be careless behavior, compromise, or malicious action.'] },
  ],
  wifi: [
    { key: 'ssid', label: 'Compare SSID evidence', desc: 'Check official signage, security mode, and signal behavior.', outcomes: ['A stronger signal is not proof of legitimacy.', 'The SSID looks familiar but the security mode is wrong.'] },
    { key: 'portal', label: 'Inspect captive portal', desc: 'Check what the portal asks for before connecting.', outcomes: ['The portal asks for credentials unrelated to WiFi access.', 'The portal has no trustworthy operator identity.'] },
    { key: 'route', label: 'Choose network route', desc: 'Decide whether official WiFi, hotspot, or VPN is safer.', outcomes: ['A trusted route reduces interception and credential capture risk.', 'VPN helps, but it does not make a fake portal safe.'] },
  ],
  dns: [
    { key: 'resolver', label: 'Compare resolvers', desc: 'Check local, corporate, and public DNS answers.', outcomes: ['Resolver disagreement points toward poisoning or interception.', 'The trusted name is not enough if resolution changed.'] },
    { key: 'certificate', label: 'Inspect certificate subject', desc: 'Compare certificate ownership with the expected service.', outcomes: ['The certificate subject does not match the trusted destination.', 'A browser warning is evidence, not an obstacle.'] },
    { key: 'cache', label: 'Preserve warning state', desc: 'Capture warning, IP, and resolver details before clearing anything.', outcomes: ['Clearing cache first can erase useful evidence.', 'Network operations needs the mismatch details.'] },
  ],
  deepfake: [
    { key: 'liveness', label: 'Run liveness check', desc: 'Ask for a trusted challenge through a separate channel.', outcomes: ['The voice channel cannot prove identity by itself.', 'A live challenge must happen outside the suspicious channel.'] },
    { key: 'pressure', label: 'Analyze pressure language', desc: 'Look for secrecy, urgency, authority, and payment shortcuts.', outcomes: ['The request leans on urgency rather than verifiable process.', 'Secrecy pressure is doing much of the attacker work.'] },
    { key: 'callback', label: 'Use trusted callback', desc: 'Verify with a known assistant, directory, or prior contact path.', outcomes: ['Known callback beats a convincing voice sample.', 'The caller refuses the one thing that would safely verify identity.'] },
  ],
  attack_chain: [
    { key: 'correlate', label: 'Correlate stages', desc: 'Link email, identity, chat, endpoint, and response evidence.', outcomes: ['Treating alerts separately hides the intrusion path.', 'The same identity pivot appears across multiple stages.'] },
    { key: 'contain', label: 'Identify containment point', desc: 'Find the earliest point that stops later damage.', outcomes: ['Identity containment reduces later lateral movement.', 'Endpoint isolation matters once payload behavior appears.'] },
    { key: 'timeline', label: 'Build incident timeline', desc: 'Order the stages before choosing a response.', outcomes: ['The timeline shows how a small initial miss becomes a larger incident.', 'Later stages depend on earlier trust decisions.'] },
  ],
  smishing: [
    { key: 'sender', label: 'Inspect sender number', desc: 'Check if the number matches a known organization path.', outcomes: ['The sender number is not enough to prove the brand claim.', 'SMS context is weak and should not carry credential trust.'] },
    { key: 'preview', label: 'Preview mobile link', desc: 'Look at the destination before opening the page.', outcomes: ['The domain does not match the claimed service.', 'The link turns a small urgency claim into a credential page.'] },
    { key: 'app', label: 'Use official app path', desc: 'Compare the message with the real carrier, bank, or HR app.', outcomes: ['The official app gives a safer source of truth.', 'No matching alert exists in the trusted channel.'] },
  ],
  bec: [
    { key: 'vendor', label: 'Verify vendor profile', desc: 'Compare sender, invoice, and bank details against saved records.', outcomes: ['The payment detail change is the strongest signal.', 'The thread context can be real while the payment instruction is fake.'] },
    { key: 'approval', label: 'Check approval chain', desc: 'Look for purchase order, manager approval, and policy fit.', outcomes: ['The request tries to bypass procurement controls.', 'Approval is claimed in text but not present in the system.'] },
    { key: 'callback', label: 'Call known contact', desc: 'Verify payment changes using saved contact information.', outcomes: ['A known contact path is required before money moves.', 'Replying in the same thread would not prove control of the vendor.'] },
  ],
  supply_chain: [
    { key: 'provenance', label: 'Verify provenance', desc: 'Check publisher, signature, version, and release channel.', outcomes: ['The package or updater provenance changed unexpectedly.', 'Trust should come from signed, known distribution paths.'] },
    { key: 'sandbox', label: 'Run sandbox review', desc: 'Look for outbound traffic, secret access, or install hooks.', outcomes: ['Sandbox behavior shows more risk than the release notes.', 'The update tries to access more than it should.'] },
    { key: 'rollback', label: 'Plan rollback', desc: 'Decide how to block, pin, revoke, or roll back safely.', outcomes: ['Containment should include tokens or build permissions if exposed.', 'Keeping builds green is not worth poisoning the pipeline.'] },
  ],
};

const CATEGORY_EVENTS = {
  email: ['A second message arrives with the same subject but a different sender path.', 'Mail gateway reputation changes from neutral to suspicious.', 'A user reports the same link from a different department.'],
  website: ['The page changes the login prompt after the first field is entered.', 'A support popup appears and asks for an OTP.', 'The certificate panel loads slowly while the form remains active.'],
  qr: ['A nearby user says the QR worked yesterday, but the sticker edge looks new.', 'The mobile preview redirects once before loading.', 'The destination changes when scanned from a different device.'],
  vishing: ['The caller repeats the deadline and asks you not to transfer the call.', 'Background noise makes the call feel authentic.', 'The caller offers a case number that cannot be found internally.'],
  usb: ['The file list looks business-relevant, but hidden items are not visible yet.', 'Endpoint protection warns only after the mount event.', 'The device label matches a recent company project.'],
  browser_exploit: ['The popup returns after being dismissed.', 'A download appears with a vendor-like filename.', 'The permission request expands after clicking continue.'],
  mfa: ['Another push arrives while you are investigating.', 'The login location changes between prompts.', 'The app name looks familiar but the device is new.'],
  cloud: ['An external share is created while the session is still active.', 'A risky session refreshes from a new location.', 'A user reports missing files after the alert.'],
  insider: ['The employee account accesses a new folder after hours.', 'A removable media event appears near the same time.', 'Another employee shows similar activity but lower volume.'],
  wifi: ['The strongest network disappears and returns with the same name.', 'The captive portal asks for SSO credentials.', 'The official signage uses a slightly different SSID.'],
  dns: ['Corporate DNS and public DNS disagree.', 'The browser warning disappears after a refresh but the IP is unchanged.', 'Another user reports the same site loading differently.'],
  deepfake: ['The caller avoids a callback and pushes a private channel.', 'The voice cadence changes around names and amounts.', 'A matching text message arrives seconds later.'],
  attack_chain: ['A chat message appears after the login alert.', 'Endpoint telemetry starts after identity compromise.', 'The incident timeline shows two alerts sharing the same account.'],
  smishing: ['The link preview changes after the first tap.', 'The text claims a tiny fee but asks for full card data.', 'A second SMS arrives from a different number.'],
  bec: ['The invoice thread is real but the bank detail changed.', 'The sender refuses phone verification because of a meeting.', 'The payment deadline is moved earlier mid-thread.'],
  supply_chain: ['The package diff adds an install hook.', 'The maintainer key changed overnight.', 'The sandbox sees outbound traffic during install.'],
};

const NOISE_EVENTS = [
  'A benign alert arrives at the same time and competes for attention.',
  'The user is under time pressure and wants a fast answer.',
  'One indicator looks normal, but another indicator conflicts with it.',
  'A coworker says they have seen something similar before.',
  'The first glance is clean; the risk appears only after inspection.',
];

const AXIS_DESCRIPTIONS = {
  verify: 'Checks the request through a trusted source outside the suspicious channel.',
  contain: 'Preserves evidence and moves the case into the security response path.',
  inspect: 'Collects more signal before deciding whether the request can be trusted.',
  expose: 'Follows the suspicious request before trust has been established.',
  delay: 'Avoids an immediate risky action, but leaves the event unresolved.',
  judgment: 'Acts from the current context without a stronger verification signal.',
};

const CONTEXTUAL_ACTIONS = {
  default: {
    verify: ['Verify through a known channel', 'Use the official workflow', 'Confirm outside the suspicious channel', 'Check the trusted source first'],
    contain: ['Report and preserve evidence', 'Escalate to security', 'Contain the suspicious activity', 'Block the request and document it'],
    inspect: ['Inspect the supporting evidence', 'Review the technical details', 'Collect more context first', 'Triage before taking action'],
    expose: ['Proceed with the requested action', 'Use the suspicious channel', 'Submit the requested information', 'Continue without verification'],
    delay: ['Dismiss without confirming', 'Wait without containing it', 'Leave the alert unresolved', 'Ignore the warning for now'],
    judgment: ['Choose based on current context', 'Take the apparent next step', 'Use the quickest available path', 'Make a limited judgment call'],
  },
  email: {
    verify: ['Contact the sender through the directory', 'Open the official portal yourself', 'Confirm the request outside email'],
    contain: ['Report the email to security', 'Quarantine the message', 'Block the sender and preserve headers'],
    inspect: ['Inspect headers and links', 'Hover the embedded link', 'Review the attachment safely'],
    expose: ['Open the email link', 'Reply with the requested details', 'Open the attachment from the inbox'],
  },
  website: {
    verify: ['Navigate to the real site yourself', 'Use the bookmarked official portal', 'Check the service outside this page'],
    contain: ['Close and report the URL', 'Report the cloned page', 'Block the suspicious login page'],
    inspect: ['Inspect the address and certificate', 'Check the domain registration clues', 'Test the form behavior safely'],
    expose: ['Enter credentials on this page', 'Submit the fake login form', 'Trust the cloned portal'],
  },
  qr: {
    verify: ['Ask staff before scanning', 'Use the official app or desk', 'Verify the QR placement first'],
    contain: ['Report the QR sticker', 'Avoid the code and document it', 'Remove the QR from use'],
    inspect: ['Preview the QR destination', 'Inspect the scanned landing page', 'Check what the QR page requests'],
    expose: ['Open the scanned page', 'Submit details to the QR page', 'Scan and follow the instructions'],
  },
  vishing: {
    verify: ['Call back using a known number', 'Verify the caller through the directory', 'Move the request to a trusted channel'],
    contain: ['Hang up and report the call', 'Record the request and escalate', 'Refuse and preserve the caller details'],
    inspect: ['Let the caller explain the request', 'Record the requested action', 'Classify the phone request'],
    expose: ['Approve what the caller asks', 'Share the requested code', 'Transfer money during the call'],
  },
  deepfake: {
    verify: ['Run a trusted callback check', 'Verify the person through another channel', 'Ask for a live challenge phrase'],
    contain: ['Report the impersonation attempt', 'Escalate the voice note', 'Block the request and preserve the transcript'],
    inspect: ['Analyze the voice and pressure cues', 'Review the transcript markers', 'Check liveness before acting'],
    expose: ['Follow the voice note request', 'Send the requested payment or code', 'Trust the caller voice alone'],
  },
  mfa: {
    verify: ['Review sign-in activity first', 'Check the login source', 'Confirm whether you started the login'],
    contain: ['Deny and report the push', 'Reject the prompt and revoke sessions', 'Report the approval spam'],
    inspect: ['Count the push pattern', 'Inspect the device and IP', 'Review impossible travel signals'],
    expose: ['Approve the push prompt', 'Authorize the unknown sign-in', 'Accept the repeated MFA request'],
  },
  cloud: {
    verify: ['Check tenant activity logs', 'Validate the session owner', 'Review the account through admin tools'],
    contain: ['Revoke risky sessions', 'Contain the cloud account', 'Escalate the SaaS incident'],
    inspect: ['Inspect risky sessions', 'Audit external shares', 'Check token persistence'],
    expose: ['Leave the session active', 'Trust the cloud alert as benign', 'Allow the external share'],
  },
  usb: {
    verify: ['Turn the device in to IT', 'Follow removable-media policy', 'Use a controlled analysis path'],
    contain: ['Document the USB incident', 'Preserve chain of custody', 'Quarantine the device'],
    inspect: ['Sandbox scan the USB', 'Review the device label safely', 'Inspect files away from production'],
    expose: ['Mount the unknown USB', 'Open files from the device', 'Run the removable media content'],
  },
  browser_exploit: {
    verify: ['Use the vendor update channel', 'Close and verify the browser version', 'Check the extension in the official store'],
    contain: ['Block and report the popup', 'Cancel the download and report', 'Stop the installer path'],
    inspect: ['Inspect requested permissions', 'Check the download source', 'Read the browser warning'],
    expose: ['Install the fake update', 'Run the downloaded installer', 'Grant the requested browser permissions'],
  },
  wifi: {
    verify: ['Use official WiFi with VPN', 'Ask staff for the real SSID', 'Switch to a trusted network route'],
    contain: ['Report the rogue SSID', 'Avoid the captive portal', 'Document the evil twin network'],
    inspect: ['Compare SSID and security mode', 'Inspect the captive portal', 'Check the network route'],
    expose: ['Join the strongest hotspot', 'Enter credentials in the portal', 'Trust the open network'],
  },
  dns: {
    verify: ['Compare trusted DNS resolvers', 'Use the verified destination path', 'Check the certificate owner'],
    contain: ['Stop and report the redirect', 'Preserve the DNS mismatch', 'Disconnect from the suspicious path'],
    inspect: ['Inspect the certificate subject', 'Run a DNS lookup comparison', 'Check resolver and IP details'],
    expose: ['Continue to the redirected site', 'Ignore the browser warning', 'Sign in despite the mismatch'],
  },
  insider: {
    verify: ['Compare activity to role baseline', 'Check policy and access context', 'Validate the employee activity pattern'],
    contain: ['Escalate the insider case', 'Preserve logs and evidence', 'Contain the risky account activity'],
    inspect: ['Investigate the activity logs', 'Scope the data movement', 'Review the employee risk profile'],
    expose: ['Dismiss the employee alert', 'Message the user before preserving logs', 'Allow the activity to continue'],
  },
  attack_chain: {
    verify: ['Correlate the attack stages', 'Build the incident timeline', 'Validate the identity pivot'],
    contain: ['Contain and report the chain', 'Revoke sessions and isolate endpoints', 'Stop the earliest active stage'],
    inspect: ['Review each stage before deciding', 'Trace the kill chain path', 'Map the evidence across alerts'],
    expose: ['Treat each alert separately', 'Continue the compromised workflow', 'Delay containment until later'],
  },
  smishing: {
    verify: ['Use the official app', 'Check the message through the real service', 'Verify the text outside SMS'],
    contain: ['Block and report the text', 'Report the mobile link', 'Delete after preserving details'],
    inspect: ['Inspect the sender number', 'Preview the mobile link', 'Review the landing-page request'],
    expose: ['Open the SMS link', 'Submit details to the text link', 'Pay through the mobile page'],
  },
  bec: {
    verify: ['Call the known vendor contact', 'Check the approval chain', 'Verify payment details by phone'],
    contain: ['Escalate the invoice fraud', 'Freeze the payment request', 'Report the BEC attempt'],
    inspect: ['Open invoice metadata safely', 'Compare bank details', 'Review procurement records'],
    expose: ['Release the payment', 'Use the new bank details', 'Reply inside the compromised thread'],
  },
  supply_chain: {
    verify: ['Verify the vendor signature', 'Check the official release channel', 'Confirm publisher provenance'],
    contain: ['Block the release', 'Rollback the package update', 'Quarantine the suspicious build'],
    inspect: ['Review the package diff', 'Run the update in sandbox', 'Inspect install hooks'],
    expose: ['Approve the package update', 'Install the unsigned release', 'Allow the build to continue'],
  },
};

const IMPACT_LABELS = [
  'Identity confidence',
  'Business continuity',
  'Evidence quality',
  'User friction',
  'Reversibility',
  'Access exposure',
  'Process alignment',
  'Time pressure',
  'Session risk',
  'Data sensitivity',
];

export function stableIndex(value, length) {
  if (!length) return 0;
  const source = String(value || 'cyberguard');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

function shuffleStable(items, seed) {
  return [...items].sort((a, b) => stableIndex(`${seed}-${a.key || a}-${a.label || ''}`, 1000) - stableIndex(`${seed}-${b.key || b}-${b.label || ''}`, 1000));
}

function difficultyRequired(difficulty) {
  if (difficulty === 'Hard') return 3;
  return 2;
}

function classifyOption(option = {}) {
  const text = `${option.label || ''} ${option.desc || ''}`.toLowerCase();
  if (/report|quarantine|block|revoke|isolate|contain|escalate|deny|hang up|stop|turn it in/.test(text)) return 'contain';
  if (/verify|official|direct|known|callback|call|portal|staff|vendor|out-of-band|fido|official app|known app/.test(text)) return 'verify';
  if (/inspect|review|check|scan|sandbox|analyze|compare|investigate|preview|look up|marketplace/.test(text)) return 'inspect';
  if (/open|click|enter|approve|authorize|grant|consent|install|download|pay|wire|send|share|plug|allow|accept|run|sign in|log in|give|comply|trust|proceed|follow|submit|provide|type/.test(text)) return 'expose';
  if (/ignore|delete|dismiss|wait|leave|clear|discard|reply stop/.test(text)) return 'delay';
  return 'judgment';
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

function isGenericLabel(label) {
  const text = cleanText(label).toLowerCase();
  if (!text) return true;
  return [
    /^report and verify$/,
    /^use trusted channel$/,
    /^comply with request$/,
    /^act immediately$/,
    /^open the link$/,
    /^continue workflow$/,
    /^share requested data$/,
    /^help the sender$/,
    /^approve the prompt$/,
    /^stop interruptions$/,
    /^ignore the alert$/,
    /^assume it is normal$/,
    /^go with.*investigation$/,
    /^investigate$/,
    /^investigate (login|logs|activity)$/,
    /^verify$/,
    /^verify (identity|by phone|dns|vendor)$/,
    /^report$/,
    /^report (as phishing|url|qr|call|scam)$/,
    /^deny and report$/,
    /^block and report$/,
    /^escalate case$/,
    /^stop and report$/,
    /^revoke sessions$/,
    /^contain (account|and report)$/,
    /^use official (app|workflow|wifi\/vpn)$/,
    /^use callback path$/,
    /^open official site directly$/,
    /^do not (install|use link|mount)$/,
    /^avoid scanning$/,
    /^sandbox first$/,
    /^quarantine and report$/,
    /^continue$/,
  ].some(pattern => pattern.test(text));
}

function contextualLabel({ option, category, axis, seed, index, attempt = 0 }) {
  const categoryPool = CONTEXTUAL_ACTIONS[category]?.[axis] || CONTEXTUAL_ACTIONS.default[axis] || CONTEXTUAL_ACTIONS.default.judgment;
  return categoryPool[stableIndex(`${seed}-${option.id}-${option.label}-${index}-${attempt}`, categoryPool.length)];
}

function actionCopy(option, seed, category, index) {
  const axis = classifyOption(option);
  const originalLabel = cleanText(option.label);
  const label = isGenericLabel(originalLabel)
    ? contextualLabel({ option, category, axis, seed, index })
    : originalLabel;
  const originalDesc = cleanText(option.desc);
  const fallbackDesc = AXIS_DESCRIPTIONS[axis] || AXIS_DESCRIPTIONS.judgment;
  return { axis, label, desc: originalDesc && originalDesc.toLowerCase() !== originalLabel.toLowerCase() ? originalDesc : fallbackDesc };
}

export function buildCaseDynamics({ category, scenario = {} } = {}) {
  const seed = `${category}-${scenario.id || scenario.subject || ''}-${scenario.difficulty || ''}`;
  const probes = shuffleStable([...(CATEGORY_PROBES[category] || []), ...DEFAULT_PROBES], `${seed}-probes`)
    .slice(0, 4)
    .map((probe, index) => ({
      ...probe,
      id: `${probe.key}-${index}`,
      outcome: probe.outcomes[stableIndex(`${seed}-${probe.key}-outcome`, probe.outcomes.length)],
      confidence: 42 + stableIndex(`${seed}-${probe.key}-confidence`, 48),
    }));
  const events = shuffleStable([...(CATEGORY_EVENTS[category] || []), ...NOISE_EVENTS], `${seed}-events`)
    .slice(0, 4)
    .map((event, index) => ({
      id: `event-${index}`,
      text: event,
      time: `T+${index + 1}${stableIndex(`${seed}-${index}`, 2) ? 'm' : ' alert'}`,
    }));
  const requiredEvidence = Math.min(difficultyRequired(scenario.difficulty), probes.length);
  return {
    seed,
    probes,
    events,
    requiredEvidence,
    ambiguity: ['Low', 'Medium', 'High'][stableIndex(`${seed}-ambiguity`, 3)],
    tempo: ['Slow burn', 'Active pressure', 'Rapid escalation'][stableIndex(`${seed}-tempo`, 3)],
  };
}

export function buildResponseOptions(options = [], { category, scenario = {}, dynamics = {} } = {}) {
  const seed = dynamics.seed || `${category}-${scenario.id || scenario.subject || ''}`;
  const seenLabels = new Set();
  const transformed = options.map((option, index) => {
    const copy = actionCopy(option, seed, category, index);
    let label = copy.label;
    let attempt = 1;
    while (seenLabels.has(label.toLowerCase()) && attempt < 8) {
      label = contextualLabel({ option, category, axis: copy.axis, seed, index, attempt });
      attempt += 1;
    }
    if (seenLabels.has(label.toLowerCase())) {
      label = `${label} (${copy.axis === 'expose' ? 'risky' : copy.axis})`;
    }
    seenLabels.add(label.toLowerCase());
    return {
      ...option,
      original_label: option.label,
      original_desc: option.desc,
      label,
      desc: copy.desc,
      decision_axis: copy.axis,
      impact_label: IMPACT_LABELS[stableIndex(`${seed}-${option.id}-impact`, IMPACT_LABELS.length)],
    };
  });
  return shuffleStable(transformed, `${seed}-response-order`);
}
