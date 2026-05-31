import { useEffect, useMemo, useState } from 'react';
import * as api from './api';
import SimulationAudioPlayer from './SimulationAudioPlayer';
import { getScenarioCallerIdentity, humanizeCallerLabel, sanitizeCallerText } from './callerIdentity';

export const ADVANCED_CATEGORIES = [
  { id: 'chat', label: 'Internal Chat', icon: 'CH', desc: 'Teams and Slack scams', color: '#14b8a6' },
  { id: 'attachment', label: 'Attachment Sandbox', icon: 'SB', desc: 'Malicious file analysis', color: '#f97316' },
  { id: 'browser_exploit', label: 'Browser Exploit', icon: 'BR', desc: 'Popups and downloads', color: '#38bdf8' },
  { id: 'mfa', label: 'MFA Fatigue', icon: 'MF', desc: 'Push approval attacks', color: '#8b5cf6' },
  { id: 'cloud', label: 'Cloud Breach', icon: 'CL', desc: 'SaaS account compromise', color: '#0ea5e9' },
  { id: 'insider', label: 'Insider Threat', icon: 'IN', desc: 'Employee risk analysis', color: '#eab308' },
  { id: 'wifi', label: 'Rogue WiFi', icon: 'WF', desc: 'Evil twin networks', color: '#22c55e' },
  { id: 'dns', label: 'DNS Spoofing', icon: 'DN', desc: 'Pharming redirects', color: '#ef4444' },
  { id: 'deepfake', label: 'AI Scam', icon: 'AI', desc: 'Deepfake impersonation', color: '#ec4899' },
  { id: 'attack_chain', label: 'Attack Chain', icon: 'AC', desc: 'Connected kill chain', color: '#06b6d4' },
  { id: 'smishing', label: 'SMS Phishing', icon: 'SM', desc: 'Text message traps', color: '#10b981' },
  { id: 'bec', label: 'BEC Fraud', icon: 'BE', desc: 'Invoice and wire scams', color: '#f43f5e' },
  { id: 'supply_chain', label: 'Supply Chain', icon: 'SC', desc: 'Vendor update attacks', color: '#84cc16' },
];

const panelStyle = {
  padding: 20,
  borderTop: '1px solid var(--border)',
  background: 'linear-gradient(135deg, rgba(19,27,48,0.96), rgba(10,15,28,0.96))',
};

const cardStyle = {
  background: 'rgba(5,8,16,0.45)',
  border: '1px solid var(--border)',
  borderRadius: 12,
};

const muted = { color: 'var(--text-muted)' };

function PanelShell({ label, children }) {
  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '1.5px' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SmallButton({ children, onClick, tone = 'neutral', disabled = false }) {
  const tones = {
    neutral: ['var(--bg-card)', 'var(--border)', 'var(--text-secondary)'],
    good: ['rgba(99,102,241,0.13)', 'rgba(99,102,241,0.36)', '#c4b5fd'],
    warn: ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.35)', '#fcd34d'],
    bad: ['rgba(244,63,94,0.12)', 'rgba(244,63,94,0.32)', '#fda4af'],
    info: ['rgba(34,211,238,0.1)', 'rgba(34,211,238,0.32)', '#67e8f9'],
  };
  const [bg, border, color] = tones[tone] || tones.neutral;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '8px 12px',
      borderRadius: 8,
      border: `1px solid ${border}`,
      background: bg,
      color,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function Signal({ label, value, color = 'var(--accent-cyan)' }) {
  return (
    <div style={{ ...cardStyle, padding: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{displayText(value)}</div>
    </div>
  );
}

function displayText(value, fallback = 'Not provided') {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value.map(item => displayText(item, '')).filter(Boolean).join(', ') || fallback;
  if (typeof value === 'object') {
    const preferred = value.name ?? value.label ?? value.value ?? value.text ?? value.title ?? value.status;
    if (preferred !== undefined) return displayText(preferred, fallback);
    return Object.values(value).map(item => displayText(item, '')).filter(Boolean).slice(0, 3).join(', ') || fallback;
  }
  return String(value);
}

function listValue(value, fallback = []) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function extractSuspiciousRequest(source) {
  const text = String(source || '').replace(/\s+/g, ' ').trim();
  const quoted = text.match(/"([^"]{20,260})"/) || text.match(/(?:^|[\s:])'([^']{20,260})'/);
  if (quoted?.[1]) return sanitizeCallerText(quoted[1]).trim();
  const sentence = text
    .split(/(?<=[.!?])\s+/)
    .find(s => /(buy|send|wire|approve|transfer|password|code|gift card|payment|verify|login|confidential|urgent)/i.test(s));
  return sanitizeCallerText(sentence || text.slice(0, 220));
}

function buildAIImpersonationCall(scenario, data, identity) {
  const organization = data.claimed_organization || identity.org || 'Executive Office';
  const intro = `Hey, it is ${identity.name} from ${organization}. Can you hear me okay?`;
  if (data.call_script) {
    const raw = Array.isArray(data.call_script) ? data.call_script.join('\n') : String(data.call_script);
    const cleanedLines = sanitizeCallerText(raw).split('\n').map(line => line.trim()).filter(Boolean);
    return [intro, ...cleanedLines].join('\n');
  }
  const existing = String(data.transcript || '').trim();
  const existingLines = sanitizeCallerText(existing).split('\n').map(line => line.trim()).filter(Boolean);
  if (existingLines.length >= 3) return [intro, ...existingLines].join('\n');

  const difficulty = String(scenario.difficulty || '').toLowerCase();
  const firstName = identity.name.split(' ')[0];
  const namePattern = 'Sarah|Kevin|Maya|Marcus|Elena|Daniel|Priya|Thomas|Nadia|Owen|Avery|Riley|Samira|Jonah|Nina|Adrian|Jordan|Sofia|Laura|Victor';
  const request = extractSuspiciousRequest(existing || scenario.body)
    .replace(new RegExp(`\\b(this is|i'm|i am)\\s+(${namePattern})\\b`, 'i'), `$1 ${firstName}`);
  const pressure = difficulty === 'hard'
    ? 'I am between meetings and this cannot go through the normal queue right now.'
    : difficulty === 'easy'
      ? 'I only have a minute, so I need you to handle this quickly.'
      : 'I am on a call with leadership, so keep this moving and keep it quiet.';
  const verificationTrap = difficulty === 'hard'
    ? 'Do not call my regular number because I am presenting, and do not loop in finance until I send the paperwork.'
    : 'Please do not message anyone else about this yet, it will slow the client handoff.';

  return [
    intro,
    pressure,
    request,
    'I need you to confirm when it is done, preferably in this thread.',
    verificationTrap,
    'If anyone asks, tell them I already approved it and I will clean up the paperwork later.',
  ].join('\n');
}

function aiVoiceSettings(scenario, data, identity) {
  const difficulty = String(scenario.difficulty || '').toLowerCase();
  const voiceHint = identity.voiceHint || 'caller';
  return {
    voiceHint,
    rate: difficulty === 'hard' ? 0.84 : difficulty === 'easy' ? 0.96 : 0.9,
    pitch: voiceHint === 'female' ? 1.06 : difficulty === 'hard' ? 0.78 : 0.9,
  };
}

export function AdvancedScenarioPanel({ category, scenario, selected, setSelected, onEvidence }) {
  if (!scenario) return null;
  const common = { scenario, selected, setSelected, onEvidence };
  if (category === 'chat') return <ChatScamSimulator {...common} />;
  if (category === 'attachment') return <AttachmentSandbox {...common} />;
  if (category === 'browser_exploit') return <BrowserExploitSimulator {...common} />;
  if (category === 'mfa') return <MFASimulator {...common} />;
  if (category === 'cloud') return <CloudBreachSimulator {...common} />;
  if (category === 'insider') return <InsiderThreatSimulator {...common} />;
  if (category === 'wifi') return <WifiSpoofingSimulator {...common} />;
  if (category === 'dns') return <DNSSpoofingSimulator {...common} />;
  if (category === 'deepfake') return <DeepfakeScamSimulator {...common} />;
  if (category === 'attack_chain') return <AttackChainSimulator {...common} />;
  if (category === 'smishing') return <SmishingSimulator {...common} />;
  if (category === 'bec') return <BECSimulator {...common} />;
  if (category === 'supply_chain') return <SupplyChainSimulator {...common} />;
  return null;
}

function ChatScamSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const messages = listValue(data.messages, [
    { from: 'Maya Chen', role: 'HR Operations', text: 'Can you open the updated payroll file before 3 PM? The CFO needs confirmation.' },
    { from: 'Maya Chen', role: 'HR Operations', text: 'It is easier if you sign in with your work account. The link expires soon.' },
    { from: 'You', role: 'Security Analyst', text: 'I do not see a ticket for this request.' },
  ]).map(message => typeof message === 'object' && message !== null ? message : { from: 'External user', role: 'Guest', text: displayText(message) });
  const [inspected, setInspected] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('untriaged');

  return (
    <PanelShell label="INTERNAL CHAT INVESTIGATION">
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Workspace</div>
          {['sec-ops', 'hr-helpdesk', 'finance-private'].map((ch, i) => (
            <div key={ch} style={{
              padding: '9px 10px',
              borderRadius: 8,
              background: i === 1 ? 'rgba(20,184,166,0.14)' : 'transparent',
              color: i === 1 ? '#5eead4' : 'var(--text-muted)',
              fontSize: 12,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span># {ch}</span>
              {i === 1 && <span style={{ color: '#f59e0b' }}>new</span>}
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
          <Signal label="SENDER DOMAIN" value={data.sender_domain || 'contoso-hr.help'} color={inspected ? '#f59e0b' : 'var(--accent-cyan)'} />
        </div>

        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{data.channel || '#hr-helpdesk'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>External guest access enabled</div>
            </div>
            <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>IMPERSONATION RISK</div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => {
              const own = m.from === 'You';
              return (
                <div key={i} style={{
                  alignSelf: own ? 'flex-end' : 'flex-start',
                  maxWidth: '76%',
                  padding: 12,
                  borderRadius: 12,
                  background: own ? 'rgba(99,102,241,0.16)' : 'rgba(15,23,42,0.9)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 11, color: own ? '#a5b4fc' : '#5eead4', fontWeight: 700 }}>{displayText(m.from)} <span style={muted}>/ {displayText(m.role, 'Guest')}</span></div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.6 }}>{displayText(m.text)}</div>
                </div>
              );
            })}
            <div style={{ padding: 12, border: '1px dashed rgba(245,158,11,0.35)', borderRadius: 10, background: 'rgba(245,158,11,0.07)' }}>
              <div style={{ fontSize: 11, color: '#fcd34d', fontWeight: 700, marginBottom: 4 }}>Shared file</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{data.attachment || 'Payroll_Adjustment_Q2.docx'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Requires Microsoft sign-in to view</div>
            </div>
          </div>
          {fileOpen && (
            <div style={{ padding: 16, background: 'rgba(239,68,68,0.14)', borderTop: '1px solid rgba(239,68,68,0.35)' }}>
              <div style={{ fontSize: 13, color: '#fca5a5', fontWeight: 800 }}>Credential harvest preview</div>
              <div style={{ fontSize: 12, color: '#fecaca', marginTop: 5 }}>The attachment redirects to a fake Microsoft consent screen requesting mailbox and OneDrive access.</div>
            </div>
          )}
          <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SmallButton onClick={() => { setInspected(true); onEvidence?.('identity'); }} tone="info">Inspect Sender</SmallButton>
            <SmallButton onClick={() => { setFileOpen(true); onEvidence?.('technical'); }} tone="warn">Open Shared File</SmallButton>
            <SmallButton onClick={() => { setReply('Please confirm by phone or through the HR portal ticket.'); setStatus('challenged'); onEvidence?.('process'); }} tone="neutral">Reply to Attacker</SmallButton>
            <SmallButton onClick={() => { setStatus('reported'); onEvidence?.('report'); }} tone="good">Report Chat</SmallButton>
            <SmallButton onClick={() => { setStatus('verified'); onEvidence?.('identity'); }} tone="good">Verify Elsewhere</SmallButton>
          </div>
          {(inspected || reply || status !== 'untriaged') && (
            <div style={{ padding: '0 14px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <Signal label="SENDER CHECK" value={inspected ? 'Guest mismatch' : 'Pending'} color={inspected ? '#f59e0b' : 'var(--text-muted)'} />
              <Signal label="REPLY" value={reply ? 'Challenge sent' : 'None'} color={reply ? '#67e8f9' : 'var(--text-muted)'} />
              <Signal label="CASE STATUS" value={status.toUpperCase()} color={status === 'reported' || status === 'verified' ? '#86efac' : '#fcd34d'} />
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function AttachmentSandbox({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [metadata, setMetadata] = useState(false);
  const [scan, setScan] = useState(false);
  const [opened, setOpened] = useState(false);
  const filename = data.filename || 'Quarterly_Bonus_Report.pdf.exe';
  const detections = listValue(data.detections, ['Double extension', 'Unsigned executable', 'Macro launcher', 'Suspicious child process']).map(item => displayText(item));

  return (
    <PanelShell label="ATTACHMENT SANDBOX">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 48, height: 58, borderRadius: 8, background: 'rgba(249,115,22,0.16)', border: '1px solid rgba(249,115,22,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fdba74', fontWeight: 800 }}>FILE</div>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>{filename}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{data.size || '3.8 MB'} / received from {data.sender || scenario.sender_name || 'external sender'}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Signal label="TYPE CLAIM" value={data.claimed_type || 'PDF'} />
            <Signal label="REAL TYPE" value={data.real_type || 'Win32 EXE'} color="#f97316" />
            <Signal label="MACROS" value={data.macros || 'Enabled'} color="#f59e0b" />
            <Signal label="SIGNATURE" value={data.signature || 'Unsigned'} color="#ef4444" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <SmallButton onClick={() => { setMetadata(true); onEvidence?.('technical'); }} tone="info">Inspect Metadata</SmallButton>
            <SmallButton onClick={() => { setScan(true); onEvidence?.('scan'); }} tone="good">Run AV Scan</SmallButton>
            <SmallButton onClick={() => { setOpened(true); onEvidence?.('impact'); }} tone="bad">Open File</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Quarantine</SmallButton>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: 12 }}>SANDBOX PREVIEW</div>
          {!metadata && !scan && !opened && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>No detonation data yet. Inspect the file or run a simulated antivirus scan before opening it.</div>}
          {metadata && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>Created by: <span style={{ color: '#fca5a5' }}>{data.author || 'Unknown Publisher'}</span></div>
              <div>Original extension: <span style={{ color: '#f59e0b' }}>{data.extension_chain || '.pdf.exe'}</span></div>
              <div>Hidden stream: <span style={{ color: '#ef4444' }}>{data.hidden_payload || 'install.ps1 launcher'}</span></div>
            </div>
          )}
          {scan && (
            <div style={{ marginTop: metadata ? 14 : 0 }}>
              {detections.map((d, i) => (
                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: i < 2 ? '#ef4444' : '#f59e0b' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d}</span>
                </div>
              ))}
            </div>
          )}
          {opened && (
            <div style={{ marginTop: 14, padding: 16, borderRadius: 12, background: 'rgba(127,29,29,0.65)', border: '1px solid rgba(239,68,68,0.45)', animation: 'compromiseFlash 1.2s infinite alternate' }}>
              <div style={{ fontSize: 16, color: '#fee2e2', fontWeight: 900 }}>RANSOMWARE SIMULATION</div>
              <div style={{ fontSize: 12, color: '#fecaca', marginTop: 6, lineHeight: 1.6 }}>Files are being encrypted, network shares are being enumerated, and the endpoint is beaconing to a command server.</div>
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function BrowserExploitSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [popup, setPopup] = useState(true);
  const [permissions, setPermissions] = useState(false);
  const [download, setDownload] = useState(false);
  const [blocked, setBlocked] = useState(false);

  return (
    <PanelShell label="BROWSER EXPLOIT LAB">
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ background: '#dbeafe', padding: 10 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
          </div>
          <div style={{ padding: '7px 10px', background: '#fff', borderRadius: 7, color: '#111827', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            {data.url || 'https://secure-update-browser.net/captcha'}
          </div>
        </div>
        <div style={{ minHeight: 250, background: '#f8fafc', color: '#111827', padding: 24, position: 'relative' }}>
          <div style={{ maxWidth: 430 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{data.page_title || 'Verify you are not a robot'}</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>This page claims your browser needs a security component before the CAPTCHA can continue.</div>
            <button onClick={() => { setPermissions(true); onEvidence?.('technical'); }} style={{ marginTop: 18, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#111827', fontWeight: 700 }}>Continue verification</button>
          </div>
          {popup && (
            <div style={{ position: 'absolute', right: 22, top: 26, width: 270, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, boxShadow: '0 18px 50px rgba(15,23,42,0.25)', padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Chrome Update Required</div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>Install the codec update to view this protected site.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => { setDownload(true); onEvidence?.('impact'); }} style={{ flex: 1, padding: 8, border: 'none', borderRadius: 7, background: '#2563eb', color: '#fff', fontWeight: 700 }}>Install</button>
                <button onClick={() => { setPopup(false); onEvidence?.('process'); }} style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff', color: '#334155', fontWeight: 700 }}>Cancel</button>
              </div>
            </div>
          )}
          {permissions && (
            <div style={{ marginTop: 20, width: 380, border: '1px solid #f59e0b', borderRadius: 10, background: '#fffbeb', padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>Extension permission request</div>
              <div style={{ fontSize: 12, color: '#78350f', marginTop: 6 }}>Read and change data on all websites, manage downloads, and view clipboard.</div>
            </div>
          )}
          {download && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 12, fontWeight: 700 }}>
              Fake download started: Browser_Update_114.exe
            </div>
          )}
          {blocked && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: '#dcfce7', border: '1px solid #86efac', color: '#14532d', fontSize: 12, fontWeight: 700 }}>
              Download blocked and URL reported to security.
            </div>
          )}
        </div>
        <div style={{ padding: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <SmallButton onClick={() => { setPermissions(true); onEvidence?.('technical'); }} tone="info">Inspect Permissions</SmallButton>
          <SmallButton onClick={() => { setDownload(true); onEvidence?.('impact'); }} tone="bad">Run Installer</SmallButton>
          <SmallButton onClick={() => { setBlocked(true); onEvidence?.('report'); }} tone="good">Block and Report</SmallButton>
        </div>
      </div>
    </PanelShell>
  );
}

function MFASimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [prompts, setPrompts] = useState(2);
  const [decision, setDecision] = useState('pending');
  const [activity, setActivity] = useState(false);

  useEffect(() => {
    if (decision !== 'pending') return undefined;
    const timer = setInterval(() => setPrompts(p => Math.min(9, p + 1)), 2200);
    return () => clearInterval(timer);
  }, [decision]);

  useEffect(() => {
    if (prompts >= 4) onEvidence?.('prompts');
  }, [prompts, onEvidence]);

  return (
    <PanelShell label="MFA FATIGUE SIMULATION">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: 12 }}>PUSH NOTIFICATIONS</div>
          {Array.from({ length: prompts }).map((_, i) => (
            <div key={i} style={{ padding: 12, marginBottom: 8, borderRadius: 10, background: i === prompts - 1 ? 'rgba(139,92,246,0.16)' : 'rgba(15,23,42,0.7)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Approve sign-in?</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{data.app || 'Microsoft 365'} / {data.location || 'Warsaw, Poland'} / {i + 1} min ago</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <SmallButton onClick={() => { setDecision('approved'); onEvidence?.('impact'); }} tone="bad">Approve</SmallButton>
            <SmallButton onClick={() => { setDecision('denied'); onEvidence?.('report'); }} tone="good">Deny</SmallButton>
            <SmallButton onClick={() => { setDecision('reported'); onEvidence?.('report'); }} tone="good">Report</SmallButton>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <Signal label="PROMPTS" value={prompts} color={prompts > 4 ? '#ef4444' : '#f59e0b'} />
            <Signal label="SOURCE IP" value={data.ip || '185.199.108.41'} color="#f59e0b" />
            <Signal label="DEVICE" value={data.device || 'Unknown Windows'} />
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Fake login context</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>An attacker has your password and is repeatedly sending push approvals, hoping you approve one by mistake or out of frustration.</div>
          </div>
          <SmallButton onClick={() => { setActivity(!activity); onEvidence?.('session'); }} tone="info">Investigate Login Activity</SmallButton>
          {activity && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>Impossible travel: Dubai login followed by {data.location || 'Warsaw'} within 11 minutes.</div>
              <div>Risk engine: password likely compromised.</div>
              <div>Recommended: deny, report, reset password, revoke sessions.</div>
            </div>
          )}
          {decision === 'approved' && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'rgba(239,68,68,0.16)', border: '1px solid rgba(239,68,68,0.4)', color: '#fecaca', fontSize: 12 }}>
              Compromise path opened: attacker receives a valid session token and begins mailbox search.
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function CloudBreachSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [selectedSession, setSelectedSession] = useState(null);
  const [revoked, setRevoked] = useState(false);
  const sessions = listValue(data.sessions, [
    { app: 'OneDrive', ip: '103.77.41.9', location: 'Singapore', risk: 'High', time: '08:17' },
    { app: 'Google Workspace', ip: '45.141.84.12', location: 'Amsterdam', risk: 'Critical', time: '08:24' },
    { app: 'Dropbox', ip: '10.0.4.22', location: 'Office VPN', risk: 'Low', time: '09:02' },
  ]).map((session, index) => typeof session === 'object' && session !== null ? session : { app: `Cloud session ${index + 1}`, ip: 'Unknown IP', location: displayText(session), risk: 'High', time: 'Recent' });

  return (
    <PanelShell label="CLOUD BREACH WORKBENCH">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginBottom: 12 }}>LOGIN HISTORY</div>
          {sessions.map((s, i) => (
            <button key={`${displayText(s.app)}-${displayText(s.ip)}-${i}`} onClick={() => setSelectedSession(s)} style={{
              width: '100%',
              border: '1px solid var(--border)',
              background: selectedSession === s ? 'rgba(14,165,233,0.13)' : 'rgba(15,23,42,0.62)',
              borderRadius: 10,
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 130px 90px',
              gap: 10,
              alignItems: 'center',
              marginBottom: 8,
              textAlign: 'left',
              fontFamily: 'inherit',
            }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>{displayText(s.app, 'Cloud session')}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{displayText(s.location, 'Unknown location')} / {displayText(s.time, 'Recent')}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent-cyan)', fontFamily: "'JetBrains Mono', monospace" }}>{displayText(s.ip, 'Unknown IP')}</div>
              <div style={{ fontSize: 10, color: s.risk === 'Critical' ? '#ef4444' : s.risk === 'High' ? '#f59e0b' : '#22c55e', fontWeight: 800 }}>{displayText(s.risk, 'High')}</div>
            </button>
          ))}
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <Signal label="SHARES" value={data.shares || '14 external'} color="#f59e0b" />
            <Signal label="DATA RISK" value={data.data_risk || 'Payroll'} color="#ef4444" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Session management</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
            {selectedSession ? `Selected ${displayText(selectedSession.app, 'cloud')} session from ${displayText(selectedSession.location, 'an unknown location')}.` : 'Select a session to inspect location, IP, and application scope.'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SmallButton onClick={() => { setSelectedSession(sessions.find(s => s.risk === 'Critical') || sessions[0]); onEvidence?.('session'); }} tone="info">Inspect Risky IP</SmallButton>
            <SmallButton onClick={() => { setRevoked(true); onEvidence?.('report'); onEvidence?.('impact'); }} tone="good">Revoke Sessions</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Escalate</SmallButton>
          </div>
          {revoked && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#bbf7d0', fontSize: 12 }}>All risky sessions revoked. Password reset and access review queued.</div>}
        </div>
      </div>
    </PanelShell>
  );
}

function InsiderThreatSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [watched, setWatched] = useState(null);
  const employees = listValue(data.employees, [
    { name: 'Nora Patel', dept: 'Finance', risk: 82, activity: 'Copied 2.4 GB to removable media' },
    { name: 'Evan Reed', dept: 'Engineering', risk: 64, activity: 'Accessed salary folder after hours' },
    { name: 'Lina Torres', dept: 'Sales', risk: 18, activity: 'Normal CRM export' },
  ]).map((employee, index) => typeof employee === 'object' && employee !== null ? employee : { name: `Employee ${index + 1}`, dept: 'Unknown team', risk: 50, activity: displayText(employee) });

  return (
    <PanelShell label="INSIDER THREAT MONITORING">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          {employees.map((e) => (
            <button key={displayText(e.name)} onClick={() => { setWatched(e); onEvidence?.('baseline'); }} style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: watched === e ? 'rgba(234,179,8,0.13)' : 'rgba(15,23,42,0.62)',
              marginBottom: 8,
              textAlign: 'left',
              fontFamily: 'inherit',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800 }}>{displayText(e.name, 'Employee')}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{displayText(e.dept, 'Unknown team')}</div>
                </div>
                <div style={{ color: e.risk > 75 ? '#ef4444' : e.risk > 50 ? '#f59e0b' : '#22c55e', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{e.risk}</div>
              </div>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ width: `${e.risk}%`, height: '100%', background: e.risk > 75 ? '#ef4444' : e.risk > 50 ? '#f59e0b' : '#22c55e' }} />
              </div>
            </button>
          ))}
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Analyst view</div>
          {watched ? (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div>Employee: <strong style={{ color: 'var(--text-primary)' }}>{displayText(watched.name, 'Employee')}</strong></div>
                <div>Activity: <span style={{ color: watched.risk > 75 ? '#fca5a5' : '#fcd34d' }}>{displayText(watched.activity, 'Unusual access pattern')}</span></div>
                <div>Severity: {watched.risk > 75 ? 'High' : watched.risk > 50 ? 'Medium' : 'Low'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <SmallButton onClick={() => { onEvidence?.('evidence'); }} tone="info">Investigate Logs</SmallButton>
                <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Escalate Case</SmallButton>
                <SmallButton onClick={() => { onEvidence?.('impact'); }} tone="bad">Dismiss Alert</SmallButton>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Select an employee risk profile to review access behavior, USB usage, and privilege misuse indicators.</div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function WifiSpoofingSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [network, setNetwork] = useState(null);
  const [portal, setPortal] = useState(false);
  const networks = listValue(data.networks, [
    { ssid: 'Airport_Free_WiFi', strength: 92, secure: false, risk: 'High' },
    { ssid: 'Airport_Free_WiFi_5G', strength: 76, secure: true, risk: 'Medium' },
    { ssid: 'DXB-Official-WiFi', strength: 61, secure: true, risk: 'Low' },
  ]).map((network, index) => typeof network === 'object' && network !== null ? network : { ssid: displayText(network, `Network ${index + 1}`), strength: 50, secure: false, risk: 'High' });

  return (
    <PanelShell label="ROGUE WIFI SELECTION">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12 }}>AVAILABLE NETWORKS</div>
          {networks.map(n => (
            <button key={displayText(n.ssid)} onClick={() => setNetwork(n)} style={{
              width: '100%',
              padding: 12,
              marginBottom: 8,
              borderRadius: 10,
              border: network === n ? '1px solid #22c55e' : '1px solid var(--border)',
              background: network === n ? 'rgba(34,197,94,0.1)' : 'rgba(15,23,42,0.62)',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>{displayText(n.ssid, 'Unknown network')}</span>
                <span style={{ fontSize: 11, color: n.secure ? '#86efac' : '#fca5a5' }}>{n.secure ? 'WPA2' : 'Open'}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Signal {n.strength}% / risk {n.risk}</div>
            </button>
          ))}
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <Signal label="SELECTED" value={network?.ssid || 'None'} />
            <Signal label="CAPTIVE PORTAL" value={network?.risk === 'High' ? 'Suspicious' : 'Unknown'} color={network?.risk === 'High' ? '#ef4444' : '#f59e0b'} />
            <Signal label="VPN" value={data.vpn || 'Recommended'} color="#86efac" />
          </div>
          {network?.risk === 'High' && (
            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#fca5a5', fontWeight: 800 }}>Evil twin indicators</div>
              <div style={{ fontSize: 12, color: '#fecaca', marginTop: 6, lineHeight: 1.6 }}>Open network with a cloned SSID, stronger signal than official hotspot, and a captive portal asking for corporate credentials.</div>
            </div>
          )}
          {portal && (
            <div style={{ padding: 16, background: '#f8fafc', color: '#111827', borderRadius: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Welcome to Free WiFi</div>
              <input disabled placeholder="Work email" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 7, marginBottom: 8, background: '#fff', color: '#64748b' }} />
              <input disabled placeholder="Password" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff', color: '#64748b' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SmallButton onClick={() => { setPortal(true); onEvidence?.('technical'); }} tone="warn">Open Portal</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('process'); }} tone="good">Use Official WiFi/VPN</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Report Rogue SSID</SmallButton>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function DNSSpoofingSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [cert, setCert] = useState(false);
  const [lookup, setLookup] = useState(false);
  const [warning, setWarning] = useState(false);

  return (
    <PanelShell label="DNS SPOOFING ANALYSIS">
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ background: '#e5e7eb', padding: 10 }}>
          <div style={{ padding: '7px 10px', background: '#fff', borderRadius: 7, color: '#991b1b', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            Not secure / {displayText(data.requested_domain, 'https://intranet.company.com')}
          </div>
        </div>
        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Redirected landing page</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>The URL looks legitimate, but DNS resolution points to an attacker-controlled host serving a copied login portal.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              <Signal label="EXPECTED IP" value={data.expected_ip || '10.20.4.18'} color="#86efac" />
              <Signal label="RESOLVED IP" value={data.resolved_ip || '203.0.113.44'} color="#ef4444" />
            </div>
          </div>
          <div style={{ ...cardStyle, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>Verification tools</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <SmallButton onClick={() => { setCert(true); onEvidence?.('url'); }} tone="info">Inspect Certificate</SmallButton>
              <SmallButton onClick={() => { setLookup(true); onEvidence?.('technical'); }} tone="info">Run DNS Lookup</SmallButton>
              <SmallButton onClick={() => { setWarning(true); onEvidence?.('report'); }} tone="good">Stop and Report</SmallButton>
            </div>
            {cert && <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.7 }}>Certificate CN: {displayText(data.cert_subject, 'intranet-company-login.net')} / issuer mismatch detected.</div>}
            {lookup && <div style={{ fontSize: 12, color: '#fcd34d', lineHeight: 1.7 }}>Corporate resolver and public resolver disagree. Local DNS cache may be poisoned.</div>}
            {warning && <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: 'rgba(34,197,94,0.12)', color: '#bbf7d0', fontSize: 12 }}>Browser warning preserved and network team notified.</div>}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function DeepfakeScamSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [analysis, setAnalysis] = useState(false);
  const [identityCheck, setIdentityCheck] = useState(false);
  const markers = listValue(data.markers, ['Urgent payment pressure', 'No callback path', 'Synthetic cadence', 'Requests secrecy']).map(item => displayText(item));
  const callerIdentity = getScenarioCallerIdentity(scenario, data, 'deepfake');
  const transcript = buildAIImpersonationCall(scenario, data, callerIdentity);
  const voiceSettings = aiVoiceSettings(scenario, data, callerIdentity);
  const displayCaller = humanizeCallerLabel(displayText(data.impersonated || scenario.sender_name || scenario.subject), callerIdentity);
  const channel = sanitizeCallerText(displayText(data.channel, 'Incoming phone call')) || 'Incoming phone call';

  return (
    <PanelShell label="MEDIA FORENSICS">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 14px', background: 'radial-gradient(circle at 35% 30%, #f9a8d4, #ec4899 42%, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 30, fontWeight: 900, boxShadow: '0 0 28px rgba(236,72,153,0.42)' }}>
            {callerIdentity.name.charAt(0)}
          </div>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 900 }}>{displayCaller}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{channel}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Signal label="LIVENESS" value={identityCheck ? 'Challenge sent' : 'Unchecked'} color={identityCheck ? '#f59e0b' : '#94a3b8'} />
            <Signal label="VOICE MATCH" value={analysis ? '74% risk' : 'Pending'} color={analysis ? '#ef4444' : '#94a3b8'} />
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <SimulationAudioPlayer
            title="Live Caller Playback"
            subtitle={`${scenario.difficulty || 'Medium'} impersonation call`}
            transcript={transcript}
            audioSrc={data.audio_url || data.audioSrc || ''}
            voiceHint={voiceSettings.voiceHint}
            rate={voiceSettings.rate}
            pitch={voiceSettings.pitch}
            accent="#ec4899"
            onEvidence={() => onEvidence?.('audio')}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <SmallButton onClick={() => { setAnalysis(true); onEvidence?.('technical'); }} tone="info">Analyze Voice</SmallButton>
            <SmallButton onClick={() => { setIdentityCheck(true); onEvidence?.('identity'); }} tone="good">Verify Identity</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Report Scam</SmallButton>
          </div>
          {identityCheck && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, border: '1px solid rgba(34,211,238,0.28)', background: 'rgba(34,211,238,0.08)', color: '#bae6fd', fontSize: 12, lineHeight: 1.6 }}>
              Out-of-band verification queued: call the known executive assistant number and ask for a live challenge phrase before taking action.
            </div>
          )}
          {analysis && (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {markers.map(m => <Signal key={m} label="FORENSIC MARKER" value={m} color={m.toLowerCase().includes('synthetic') ? '#ef4444' : '#f59e0b'} />)}
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function AttackChainSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const fallbackStages = [
    { title: 'Phishing Email', event: 'A vendor invoice email links to a fake SSO page.', choices: [{ label: 'Report email', risk: -10 }, { label: 'Open link', risk: 25 }] },
    { title: 'Fake Login', event: 'The page asks for password and MFA code.', choices: [{ label: 'Close and verify domain', risk: -10 }, { label: 'Enter credentials', risk: 30 }] },
    { title: 'MFA Fatigue', event: 'Push approvals arrive every minute.', choices: [{ label: 'Deny and report', risk: -15 }, { label: 'Approve once', risk: 35 }] },
    { title: 'Internal Chat', event: 'Attacker uses your account to request a payroll file.', choices: [{ label: 'Warn team and revoke sessions', risk: -20 }, { label: 'Ignore chat', risk: 20 }] },
    { title: 'Ransomware', event: 'Endpoint begins downloading a payload.', choices: [{ label: 'Isolate endpoint', risk: -25 }, { label: 'Wait for IT', risk: 20 }] },
  ];
  const stages = listValue(data.stages, fallbackStages).map((rawStage, i) => {
    const fallback = fallbackStages[i] || fallbackStages[0];
    const stage = typeof rawStage === 'object' && rawStage !== null ? rawStage : { title: displayText(rawStage) };
    return {
      title: displayText(stage.title, fallback.title),
      event: displayText(stage.event || stage.body, fallback.event),
      choices: listValue(stage.choices, fallback.choices).map((rawChoice, j) => {
        const choice = typeof rawChoice === 'object' && rawChoice !== null ? rawChoice : { label: displayText(rawChoice) };
        return {
          label: displayText(choice.label, fallback.choices[j % fallback.choices.length].label),
          risk: Number.isFinite(Number(choice.risk)) ? Number(choice.risk) : fallback.choices[j % fallback.choices.length].risk,
        };
      }),
    };
  });
  const [index, setIndex] = useState(0);
  const [risk, setRisk] = useState(35);
  const [decisions, setDecisions] = useState([]);
  const done = index >= stages.length;
  const current = stages[index];

  const choose = (choice) => {
    setDecisions(prev => [...prev, { stage: current.title, ...choice }]);
    setRisk(prev => Math.max(0, Math.min(100, prev + choice.risk)));
    onEvidence?.(choice.risk <= 0 ? 'process' : 'impact');
    setIndex(prev => prev + 1);
  };

  return (
    <PanelShell label="MULTI-STAGE ATTACK CHAIN">
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <Signal label="CHAIN RISK" value={`${risk}/100`} color={risk > 70 ? '#ef4444' : risk > 45 ? '#f59e0b' : '#22c55e'} />
          <div style={{ marginTop: 14 }}>
            {stages.map((s, i) => (
              <div key={s.title} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', color: i < index ? '#86efac' : i === index ? '#67e8f9' : 'var(--text-muted)' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{i + 1}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{s.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 18 }}>
          {!done ? (
            <>
              <div style={{ fontSize: 18, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 8 }}>{current.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>{current.event}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {current.choices.map((choice) => (
                  <button key={choice.label} onClick={() => choose(choice)} style={{
                    padding: 14,
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: choice.risk <= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: choice.risk <= 0 ? '#bbf7d0' : '#fecaca',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    fontWeight: 800,
                  }}>
                    {choice.label}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Risk {choice.risk > 0 ? '+' : ''}{choice.risk}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 18, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 8 }}>Chain complete</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 14 }}>
                Your choices produced a final risk score of <strong style={{ color: risk > 70 ? '#ef4444' : risk > 45 ? '#f59e0b' : '#22c55e' }}>{risk}/100</strong>. The final response should contain the chain, revoke sessions, preserve logs, and report the incident.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {decisions.map(d => (
                  <div key={`${d.stage}-${d.label}`} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <span>{d.stage}: {d.label}</span>
                    <span style={{ color: d.risk <= 0 ? '#86efac' : '#fca5a5' }}>{d.risk > 0 ? '+' : ''}{d.risk}</span>
                  </div>
                ))}
              </div>
              <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Prepare Containment Evidence</SmallButton>
            </>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function SmishingSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [inspect, setInspect] = useState(false);
  const [opened, setOpened] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const sender = displayText(data.sender_number || data.phone, '+1 844 219 7781');
  const link = displayText(data.short_url || data.url, 'https://parcel-help.example/track');
  const message = displayText(data.message || scenario.body, 'Your delivery is paused. Pay the small customs fee now to release it today.');

  return (
    <PanelShell label="SMS PHISHING PHONE">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div style={{ borderRadius: 28, padding: 14, background: '#020617', border: '1px solid rgba(148,163,184,0.25)' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, marginBottom: 12 }}>Messages</div>
          <div style={{ minHeight: 330, borderRadius: 22, background: '#f8fafc', color: '#111827', padding: 16 }}>
            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 18 }}>{sender}</div>
            <div style={{ padding: 13, borderRadius: '16px 16px 16px 4px', background: '#e2e8f0', fontSize: 13, lineHeight: 1.5 }}>{message}</div>
            <button onClick={() => { setOpened(true); onEvidence?.('url'); }} style={{ marginTop: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#2563eb', fontWeight: 800, fontFamily: 'inherit', wordBreak: 'break-all' }}>{link}</button>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <Signal label="SENDER" value={inspect ? 'Short code mismatch' : sender} color={inspect ? '#f59e0b' : '#67e8f9'} />
            <Signal label="LINK" value={opened ? 'Credential page' : 'Unopened'} color={opened ? '#ef4444' : '#94a3b8'} />
            <Signal label="STATUS" value={blocked ? 'Reported' : 'Untriaged'} color={blocked ? '#86efac' : '#f59e0b'} />
          </div>
          {opened && (
            <div style={{ padding: 16, borderRadius: 12, background: '#f8fafc', color: '#111827', marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>Delivery verification</div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 12 }}>The linked page asks for card details and a one-time code before showing tracking information.</div>
              <input disabled placeholder="Card number" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 7, marginBottom: 8, background: '#fff' }} />
              <input disabled placeholder="SMS code" style={{ width: '100%', padding: 10, border: '1px solid #cbd5e1', borderRadius: 7, background: '#fff' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SmallButton onClick={() => { setInspect(true); onEvidence?.('identity'); }} tone="info">Inspect Sender</SmallButton>
            <SmallButton onClick={() => { setOpened(true); onEvidence?.('url'); }} tone="bad">Open Link</SmallButton>
            <SmallButton onClick={() => { setBlocked(true); onEvidence?.('report'); }} tone="good">Block and Report</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('process'); }} tone="good">Use Official App</SmallButton>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function BECSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [invoice, setInvoice] = useState(false);
  const [approval, setApproval] = useState(false);
  const [bank, setBank] = useState(false);
  const amount = displayText(data.amount, '$48,000');
  const vendor = displayText(data.vendor || scenario.sender_name, 'Northstar Supplies');

  return (
    <PanelShell label="BUSINESS EMAIL COMPROMISE DESK">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 900, marginBottom: 8 }}>{scenario.subject}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{scenario.body}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SmallButton onClick={() => { setInvoice(true); onEvidence?.('technical'); }} tone="info">Open Invoice</SmallButton>
            <SmallButton onClick={() => { setBank(true); onEvidence?.('impact'); }} tone="warn">Compare Bank Details</SmallButton>
            <SmallButton onClick={() => { setApproval(true); onEvidence?.('process'); }} tone="info">Check Approval Chain</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('identity'); }} tone="good">Verify by Phone</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Escalate Fraud</SmallButton>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <Signal label="AMOUNT" value={amount} color="#f59e0b" />
            <Signal label="VENDOR" value={vendor} />
            <Signal label="APPROVAL" value={approval ? 'Missing CFO trail' : 'Unchecked'} color={approval ? '#ef4444' : '#94a3b8'} />
          </div>
          {invoice && <div style={{ padding: 12, borderRadius: 10, background: 'rgba(15,23,42,0.72)', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>Invoice metadata shows the PDF was created today by an external account, but claims to replace last month&apos;s approved payment instructions.</div>}
          {bank && <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', fontSize: 12, lineHeight: 1.7 }}>Bank account changed from the known vendor profile. Routing country and beneficiary name do not match procurement records.</div>}
          {!invoice && !bank && !approval && <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Review invoice metadata, bank changes, and approval trail before deciding whether to release payment.</div>}
        </div>
      </div>
    </PanelShell>
  );
}

function SupplyChainSimulator({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [diff, setDiff] = useState(false);
  const [signature, setSignature] = useState(false);
  const [sandbox, setSandbox] = useState(false);
  const packageName = displayText(data.package || data.vendor_update, 'vendor-auth-sdk');
  const version = displayText(data.version, '4.8.1');

  return (
    <PanelShell label="SUPPLY CHAIN UPDATE REVIEW">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 12 }}>PIPELINE UPDATE</div>
          <Signal label="PACKAGE" value={packageName} />
          <div style={{ height: 8 }} />
          <Signal label="VERSION" value={version} color="#f59e0b" />
          <div style={{ height: 8 }} />
          <Signal label="PUBLISHER" value={signature ? 'Signature mismatch' : (data.publisher || 'Known vendor')} color={signature ? '#ef4444' : '#67e8f9'} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            <SmallButton onClick={() => { setDiff(true); onEvidence?.('technical'); }} tone="info">Review Diff</SmallButton>
            <SmallButton onClick={() => { setSignature(true); onEvidence?.('identity'); }} tone="warn">Verify Signature</SmallButton>
            <SmallButton onClick={() => { setSandbox(true); onEvidence?.('scan'); }} tone="info">Run Sandbox</SmallButton>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 900, marginBottom: 8 }}>{scenario.subject}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{scenario.body}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <Signal label="DIFF" value={diff ? '+ postinstall script' : 'Unchecked'} color={diff ? '#f59e0b' : '#94a3b8'} />
            <Signal label="SIGNATURE" value={signature ? 'Failed' : 'Pending'} color={signature ? '#ef4444' : '#94a3b8'} />
            <Signal label="SANDBOX" value={sandbox ? 'Beacon attempt' : 'Not run'} color={sandbox ? '#ef4444' : '#94a3b8'} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SmallButton onClick={() => { onEvidence?.('report'); }} tone="good">Block Release</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('process'); }} tone="good">Verify Vendor</SmallButton>
            <SmallButton onClick={() => { onEvidence?.('impact'); }} tone="bad">Approve Update</SmallButton>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

export function IncidentResponseMode({ scenario }) {
  const steps = [
    { id: 'isolate', label: 'Isolate endpoint', points: 20 },
    { id: 'revoke', label: 'Revoke active sessions', points: 20 },
    { id: 'report', label: 'Report to security team', points: 20 },
    { id: 'password', label: 'Reset affected passwords', points: 20 },
    { id: 'logs', label: 'Preserve and review logs', points: 20 },
  ];
  const [done, setDone] = useState([]);
  const score = steps.filter(s => done.includes(s.id)).reduce((sum, s) => sum + s.points, 0);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: 22, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fca5a5', letterSpacing: '1.5px', marginBottom: 6 }}>INCIDENT RESPONSE MODE</div>
          <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 800 }}>{scenario?.subject || 'Compromise response'}</div>
        </div>
        <div style={{ fontSize: 22, color: score >= 80 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{score}/100</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {steps.map(s => {
          const active = done.includes(s.id);
          return (
            <button key={s.id} onClick={() => setDone(prev => active ? prev.filter(x => x !== s.id) : [...prev, s.id])} style={{
              padding: 12,
              borderRadius: 10,
              border: active ? '1px solid rgba(34,197,94,0.45)' : '1px solid var(--border)',
              background: active ? 'rgba(34,197,94,0.12)' : 'var(--bg-elevated)',
              color: active ? '#bbf7d0' : 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: 800,
              fontFamily: 'inherit',
            }}>{s.label}</button>
          );
        })}
      </div>
    </div>
  );
}

export function SOCDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.getThreats().then(setThreats).catch(() => {});
    const timer = setInterval(() => setTick(t => t + 1), 3500);
    return () => clearInterval(timer);
  }, []);

  const activeThreats = 11 + (tick % 7);
  const accuracy = stats?.accuracy || 0;
  const riskScore = Math.max(12, Math.min(95, 78 - Math.floor(accuracy / 2) + (tick % 9)));
  const feed = useMemo(() => {
    const live = [
      { title: 'MFA push burst detected', severity: 'High', category: 'Identity', source: 'SOC Stream' },
      { title: 'Suspicious OneDrive share created', severity: 'Medium', category: 'Cloud', source: 'CASB' },
      { title: 'Endpoint sandbox flagged macro chain', severity: 'Critical', category: 'Malware', source: 'EDR' },
      { title: 'Rogue SSID near finance floor', severity: 'High', category: 'Network', source: 'Wireless IDS' },
    ];
    return [...live.slice(tick % live.length), ...live.slice(0, tick % live.length), ...threats].slice(0, 8);
  }, [threats, tick]);
  const heat = Array.from({ length: 35 }, (_, i) => (i * 13 + tick * 7) % 100);

  return (
    <div style={{ animation: 'fadeInUp 0.4s' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 100, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', animation: 'blink 1s infinite' }} />
          <span style={{ fontSize: 10, color: '#67e8f9', letterSpacing: '1.5px', fontWeight: 700 }}>LIVE SOC</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Security Operations Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Active attacks, risk posture, incident stream, and operator vulnerability analytics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <Signal label="ACTIVE THREATS" value={activeThreats} color="#ef4444" />
        <Signal label="RISK SCORE" value={`${riskScore}/100`} color={riskScore > 65 ? '#ef4444' : '#f59e0b'} />
        <Signal label="OPERATOR" value={user?.username || 'active'} color="#67e8f9" />
        <Signal label="ACCURACY" value={stats?.total ? `${accuracy}%` : 'No data'} color="#22c55e" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 16, marginBottom: 18 }}>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800 }}>Attack Heatmap</div>
            <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 800 }}>STREAMING</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 7 }}>
            {heat.map((h, i) => (
              <div key={i} style={{
                height: 38,
                borderRadius: 8,
                background: h > 76 ? 'rgba(239,68,68,0.78)' : h > 48 ? 'rgba(245,158,11,0.62)' : 'rgba(34,197,94,0.24)',
                border: '1px solid rgba(255,255,255,0.06)',
              }} />
            ))}
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 12 }}>Threat Severity</div>
          {['Critical', 'High', 'Medium', 'Low'].map((sev, i) => {
            const width = [72, 58, 46, 28][i] + (tick % 8);
            const color = { Critical: '#ef4444', High: '#f59e0b', Medium: '#eab308', Low: '#22c55e' }[sev];
            return (
              <div key={sev} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                  <span>{sev}</span><span>{width}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${width}%`, height: '100%', background: color, transition: 'width 0.6s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 12 }}>Live Incident Feed</div>
          {feed.map((f, i) => (
            <div key={`${f.title}-${i}`} style={{ padding: '10px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f59e0b' : '#eab308' }}>{f.severity || 'Medium'}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>{f.title}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{f.category} / {f.source}</div>
            </div>
          ))}
        </div>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800, marginBottom: 12 }}>Vulnerability Analytics</div>
          {stats?.by_category && Object.keys(stats.by_category).length ? Object.entries(stats.by_category).map(([cat, d]) => {
            const miss = d.total ? Math.round(((d.total - d.correct) / d.total) * 100) : 0;
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                  <span>{cat}</span><span>{miss}% exposure</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(8, miss)}%`, height: '100%', background: miss > 45 ? '#ef4444' : miss > 20 ? '#f59e0b' : '#22c55e' }} />
                </div>
              </div>
            );
          }) : (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>Complete simulations to populate operator-specific exposure analytics.</div>
          )}
        </div>
      </div>
    </div>
  );
}
