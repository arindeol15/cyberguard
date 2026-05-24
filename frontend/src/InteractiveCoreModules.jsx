import { useMemo, useState } from 'react';

const panelStyle = {
  padding: 20,
  borderTop: '1px solid var(--border)',
  background: 'linear-gradient(135deg, rgba(8,13,25,0.98), rgba(19,27,48,0.94))',
};

const cardStyle = {
  background: 'rgba(5,8,16,0.52)',
  border: '1px solid var(--border)',
  borderRadius: 12,
};

function ActionButton({ children, onClick, tone = 'neutral' }) {
  const tones = {
    neutral: ['rgba(15,23,42,0.84)', 'var(--border)', 'var(--text-secondary)'],
    info: ['rgba(34,211,238,0.1)', 'rgba(34,211,238,0.32)', '#67e8f9'],
    good: ['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.35)', '#86efac'],
    warn: ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.35)', '#fcd34d'],
    bad: ['rgba(239,68,68,0.12)', 'rgba(239,68,68,0.35)', '#fca5a5'],
  };
  const [bg, border, color] = tones[tone] || tones.neutral;
  return (
    <button onClick={onClick} style={{
      padding: '8px 11px',
      borderRadius: 8,
      border: `1px solid ${border}`,
      background: bg,
      color,
      fontSize: 11,
      fontWeight: 800,
      fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function Signal({ label, value, color = 'var(--accent-cyan)' }) {
  return (
    <div style={{ ...cardStyle, padding: 10 }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function selectByKeywords(scenario, setSelected, keywords) {
  const textFor = (o) => `${o.label || ''} ${o.desc || ''}`.toLowerCase();
  const option = (scenario?.options || []).find(o => keywords.some(k => textFor(o).includes(k)));
  if (option) setSelected(option.id);
}

function Shell({ label, children }) {
  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '1.5px' }}>{label}</div>
      {children}
    </div>
  );
}

export default function InteractiveCorePanel({ category, scenario, setSelected }) {
  if (!scenario) return null;
  if (category === 'email') return <EmailInvestigation scenario={scenario} setSelected={setSelected} />;
  if (category === 'website') return <WebsiteInvestigation scenario={scenario} setSelected={setSelected} />;
  if (category === 'qr') return <QRScannerInvestigation scenario={scenario} setSelected={setSelected} />;
  if (category === 'vishing') return <VishingCallFlow scenario={scenario} setSelected={setSelected} />;
  if (category === 'usb') return <USBDesktopInvestigation scenario={scenario} setSelected={setSelected} />;
  return null;
}

function EmailInvestigation({ scenario, setSelected }) {
  const [headers, setHeaders] = useState(false);
  const [link, setLink] = useState(false);
  const [attachment, setAttachment] = useState(false);
  const domain = (scenario.sender_email || 'unknown@external-mail.net').split('@')[1] || 'external-mail.net';
  const suspiciousUrl = scenario.body.match(/https?:\/\/[^\s]+|[a-z0-9.-]+\.(com|net|org|io|co)\/?[^\s]*/i)?.[0] || `https://${domain}/secure`;

  return (
    <Shell label="EMAIL CLIENT INVESTIGATION">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {['Security Alerts', 'HR Updates', 'Vendor Mail', 'Quarantine'].map((folder, i) => (
            <div key={folder} style={{ padding: 12, borderBottom: '1px solid var(--border)', background: i === 0 ? 'rgba(99,102,241,0.12)' : 'transparent', color: i === 0 ? '#c4b5fd' : 'var(--text-muted)', fontSize: 12, fontWeight: 800 }}>{folder}</div>
          ))}
        </div>
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ padding: 14, borderBottom: '1px solid var(--border)', background: 'rgba(15,23,42,0.72)' }}>
            <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 900 }}>{scenario.subject}</div>
            <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 5, fontFamily: "'JetBrains Mono', monospace" }}>{scenario.sender_name} &lt;{scenario.sender_email}&gt;</div>
          </div>
          <div style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 180 }}>{scenario.body}</div>
          <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionButton onClick={() => setHeaders(true)} tone="info">Inspect Sender</ActionButton>
            <ActionButton onClick={() => setLink(true)} tone="warn">Hover Link</ActionButton>
            <ActionButton onClick={() => setAttachment(true)} tone="bad">Open Attachment</ActionButton>
            <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['report', 'security'])} tone="good">Report Email</ActionButton>
            <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['verify', 'official', 'direct'])} tone="good">Verify Officially</ActionButton>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 12 }}>
          <Signal label="SPF/DKIM" value={headers ? 'Alignment fail' : 'Not checked'} color={headers ? '#f59e0b' : '#94a3b8'} />
          <div style={{ height: 8 }} />
          <Signal label="LINK TARGET" value={link ? suspiciousUrl : 'Hover pending'} color={link ? '#ef4444' : '#94a3b8'} />
          <div style={{ height: 8 }} />
          <Signal label="ATTACHMENT" value={attachment ? 'Sandbox required' : 'Closed'} color={attachment ? '#f59e0b' : '#22c55e'} />
          {headers && <div style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>Return-path and display name do not prove trust. Compare sender domain against a known directory or official portal.</div>}
        </div>
      </div>
    </Shell>
  );
}

function WebsiteInvestigation({ scenario, setSelected }) {
  const data = scenario.extra_data || {};
  const [cert, setCert] = useState(false);
  const [popup, setPopup] = useState(true);
  const [urlFocus, setUrlFocus] = useState(false);
  const fakeUrl = data.fake_url || data.requested_domain || 'https://secure-login.example.net';
  const realUrl = data.real_url || 'https://official.example.com';

  return (
    <Shell label="BROWSER TRUST INSPECTOR">
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ background: '#e5e7eb', padding: 10 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
          </div>
          <button onClick={() => setUrlFocus(true)} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 7, border: '1px solid #cbd5e1', background: '#fff', color: urlFocus ? '#dc2626' : '#111827', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            {data.ssl_valid ? 'Lock' : 'Warning'} {fakeUrl}
          </button>
        </div>
        <div style={{ background: '#fff', color: '#111827', minHeight: 230, padding: 24, position: 'relative' }}>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Corporate Sign In</div>
          <div style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>Session expired. Re-authenticate to continue.</div>
          <input disabled placeholder="Email" style={{ width: 270, display: 'block', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 8, background: '#f8fafc', color: '#64748b' }} />
          <input disabled placeholder="Password" type="password" style={{ width: 270, display: 'block', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }} />
          {popup && (
            <div style={{ position: 'absolute', right: 20, top: 24, width: 250, padding: 14, borderRadius: 10, background: '#fffbeb', border: '1px solid #f59e0b', color: '#78350f', boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}>
              <div style={{ fontSize: 13, fontWeight: 900 }}>Security check required</div>
              <div style={{ fontSize: 12, marginTop: 5 }}>Popup requests credentials before certificate verification.</div>
            </div>
          )}
        </div>
        <div style={{ padding: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ActionButton onClick={() => setCert(true)} tone="info">Inspect Certificate</ActionButton>
          <ActionButton onClick={() => setPopup(false)} tone="warn">Close Popup</ActionButton>
          <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['official', 'direct', 'real'])} tone="good">Open Official Site</ActionButton>
          <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['report', 'close'])} tone="good">Report URL</ActionButton>
        </div>
        {(cert || urlFocus) && (
          <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            <Signal label="CURRENT URL" value={fakeUrl} color="#ef4444" />
            <Signal label="EXPECTED URL" value={realUrl} color="#22c55e" />
            <Signal label="CERTIFICATE" value={cert ? (data.ssl_valid ? 'Valid but inspect issuer' : 'Invalid / mismatch') : 'Not inspected'} color={cert ? '#f59e0b' : '#94a3b8'} />
          </div>
        )}
      </div>
    </Shell>
  );
}

function QRScannerInvestigation({ scenario, setSelected }) {
  const data = scenario.extra_data || {};
  const [scan, setScan] = useState(false);
  const [preview, setPreview] = useState(false);
  const target = data.actual_destination || data.qr_url || data.claimed_purpose || 'https://unknown-qr.example/login';

  return (
    <Shell label="MOBILE QR SCANNER">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ borderRadius: 28, padding: 14, background: '#020617', border: '1px solid rgba(148,163,184,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
          <div style={{ height: 34, color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>Camera</div>
          <div style={{ height: 260, borderRadius: 18, background: 'linear-gradient(135deg, #0f172a, #111827)', border: '1px solid rgba(34,211,238,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 34, border: '2px solid rgba(34,211,238,0.75)', borderRadius: 16, boxShadow: '0 0 24px rgba(34,211,238,0.24)' }} />
            {scan && <div style={{ position: 'absolute', left: 38, right: 38, top: preview ? 190 : 60, height: 2, background: '#22d3ee', boxShadow: '0 0 18px #22d3ee', transition: 'top 0.9s' }} />}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: scan ? '#67e8f9' : '#64748b', fontSize: 12, fontWeight: 800 }}>{scan ? 'QR DETECTED' : 'POINT CAMERA AT CODE'}</div>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 900, marginBottom: 8 }}>{scenario.subject}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{data.claimed_purpose || 'The code claims to open a trusted service.'}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionButton onClick={() => setScan(true)} tone="info">Scan Code</ActionButton>
            <ActionButton onClick={() => { setScan(true); setPreview(true); }} tone="warn">Preview Destination</ActionButton>
            <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['official', 'staff', 'reception', 'manual'])} tone="good">Verify Officially</ActionButton>
            <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['report', 'ignore', 'walk'])} tone="good">Avoid QR</ActionButton>
          </div>
          {preview && <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.34)', color: '#fecaca', fontSize: 12, wordBreak: 'break-all' }}>Destination preview: {target}</div>}
        </div>
      </div>
    </Shell>
  );
}

function VishingCallFlow({ scenario, setSelected }) {
  const data = scenario.extra_data || {};
  const [answered, setAnswered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [note, setNote] = useState(false);

  return (
    <Shell label="LIVE CALL DECISION FLOW">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 18, textAlign: 'center', background: answered ? 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(15,23,42,0.92))' : 'linear-gradient(135deg, rgba(239,68,68,0.14), rgba(15,23,42,0.92))' }}>
          <div style={{ width: 86, height: 86, borderRadius: '50%', margin: '0 auto 14px', background: 'linear-gradient(135deg, #0f172a, #334155)', border: '1px solid rgba(148,163,184,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>CALL</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 900 }}>{data.caller_name || scenario.sender_name || scenario.subject}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{data.caller_id || 'Unknown caller ID'}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <ActionButton onClick={() => setAnswered(true)} tone="info">Answer</ActionButton>
            <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['hang up', 'refuse', 'deny'])} tone="good">Reject</ActionButton>
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 12 }}>
            <Signal label="CALL STATE" value={answered ? (muted ? 'Muted' : 'Live') : 'Ringing'} color={answered ? '#22c55e' : '#f59e0b'} />
            <Signal label="TACTICS" value={(data.tactics_used || ['urgency']).slice(0, 2).join(', ')} color="#f59e0b" />
            <Signal label="REQUESTS" value={(data.info_requested || ['credentials']).slice(0, 2).join(', ')} color="#ef4444" />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionButton onClick={() => setMuted(v => !v)} tone="neutral">{muted ? 'Unmute' : 'Mute'}</ActionButton>
            <ActionButton onClick={() => setNote(true)} tone="info">Log Evidence</ActionButton>
            <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['verify', 'known', 'direct', 'call bank'])} tone="good">Verify Caller</ActionButton>
            <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['report', 'hang up', 'refuse'])} tone="good">Report Call</ActionButton>
          </div>
          {note && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)', color: '#fde68a', fontSize: 12, lineHeight: 1.6 }}>Evidence note saved: caller identity, requested data, urgency language, and callback mismatch.</div>}
        </div>
      </div>
    </Shell>
  );
}

function USBDesktopInvestigation({ scenario, setSelected }) {
  const data = scenario.extra_data || {};
  const [mounted, setMounted] = useState(false);
  const [scan, setScan] = useState(false);
  const files = data.files_if_opened || ['Payroll_Q4.xlsx', 'Board_Deck.pdf', 'autorun.inf'];

  return (
    <Shell label="ENDPOINT USB LAB">
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 800 }}>File Explorer / Removable Device</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', minHeight: 250 }}>
          <div style={{ padding: 14, borderRight: '1px solid var(--border)', background: 'rgba(15,23,42,0.58)' }}>
            {['Desktop', 'Downloads', mounted ? data.usb_label || 'Removable USB' : 'No removable media', 'Quarantine'].map((item, i) => (
              <div key={item} style={{ padding: '9px 10px', borderRadius: 8, color: i === 2 && mounted ? '#fcd34d' : 'var(--text-muted)', background: i === 2 && mounted ? 'rgba(245,158,11,0.1)' : 'transparent', fontSize: 12, fontWeight: 800 }}>{item}</div>
            ))}
          </div>
          <div style={{ padding: 16 }}>
            {!mounted ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>A found USB is not mounted. Inspect physically and hand it to security before connecting it to a trusted endpoint.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                {files.map((file) => <div key={file} style={{ ...cardStyle, padding: 12, color: file.toLowerCase().includes('autorun') ? '#fca5a5' : 'var(--text-secondary)', fontSize: 12, fontWeight: 800 }}>{file}</div>)}
              </div>
            )}
            {scan && <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', fontSize: 12 }}>Endpoint warning: suspicious autorun or payload behavior detected. Do not open files.</div>}
          </div>
        </div>
        <div style={{ padding: 14, display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
          <ActionButton onClick={() => setMounted(true)} tone="bad">Mount Device</ActionButton>
          <ActionButton onClick={() => setScan(true)} tone="info">Sandbox Scan</ActionButton>
          <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['it', 'security', 'scan', 'turn'])} tone="good">Turn In To IT</ActionButton>
          <ActionButton onClick={() => selectByKeywords(scenario, setSelected, ['ignore', 'discard', 'report'])} tone="good">Document Incident</ActionButton>
        </div>
      </div>
    </Shell>
  );
}
