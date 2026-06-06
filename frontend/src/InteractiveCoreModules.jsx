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

function textList(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  const values = value.map(item => displayText(item, '')).filter(Boolean);
  return values.length ? values : fallback;
}

function ActionButton({ children, onClick, tone = 'neutral' }) {
  const tones = {
    neutral: ['rgba(15,23,42,0.84)', 'var(--border)', 'var(--text-secondary)'],
    info: ['rgba(34,211,238,0.1)', 'rgba(34,211,238,0.32)', '#67e8f9'],
    good: ['rgba(99,102,241,0.13)', 'rgba(99,102,241,0.36)', '#c4b5fd'],
    warn: ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.35)', '#fcd34d'],
    bad: ['rgba(244,63,94,0.12)', 'rgba(244,63,94,0.32)', '#fda4af'],
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
      <div style={{ fontSize: 12, color, fontWeight: 800 }}>{displayText(value)}</div>
    </div>
  );
}

function Shell({ label, children }) {
  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '1.5px' }}>{label}</div>
      {children}
    </div>
  );
}

export default function InteractiveCorePanel({ category, scenario, setSelected, onEvidence }) {
  if (!scenario) return null;
  if (category === 'email') return <EmailInvestigation scenario={scenario} setSelected={setSelected} onEvidence={onEvidence} />;
  if (category === 'qr') return <QRScannerInvestigation scenario={scenario} setSelected={setSelected} onEvidence={onEvidence} />;
  if (category === 'vishing') return null;
  if (category === 'usb') return <USBDesktopInvestigation scenario={scenario} setSelected={setSelected} onEvidence={onEvidence} />;
  return null;
}

function EmailInvestigation({ scenario, setSelected, onEvidence }) {
  const [headers, setHeaders] = useState(false);
  const [link, setLink] = useState(false);
  const [attachment, setAttachment] = useState(false);
  const senderEmail = displayText(scenario.sender_email, 'unknown@external-mail.net');
  const body = displayText(scenario.body, '');
  const domain = senderEmail.split('@')[1] || 'external-mail.net';
  const suspiciousUrl = body.match(/https?:\/\/[^\s]+|[a-z0-9.-]+\.(com|net|org|io|co)\/?[^\s]*/i)?.[0] || `https://${domain}/secure`;

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
            <ActionButton onClick={() => { setHeaders(true); onEvidence?.('identity'); }} tone="info">Inspect Sender</ActionButton>
            <ActionButton onClick={() => { setLink(true); onEvidence?.('url'); }} tone="warn">Hover Link</ActionButton>
            <ActionButton onClick={() => { setAttachment(true); onEvidence?.('technical'); }} tone="bad">Open Attachment</ActionButton>
            <ActionButton onClick={() => { onEvidence?.('report'); }} tone="good">Report Email</ActionButton>
            <ActionButton onClick={() => { onEvidence?.('process'); }} tone="good">Verify Officially</ActionButton>
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

function WebsiteInvestigation({ scenario, onEvidence }) {
  const data = scenario.extra_data || {};
  const [cert, setCert] = useState(false);
  const [popup, setPopup] = useState(true);
  const [urlFocus, setUrlFocus] = useState(false);
  const fakeUrl = displayText(data.fake_url || data.requested_domain, 'https://secure-login.example.net');
  const realUrl = displayText(data.real_url, 'https://official.example.com');

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
          <ActionButton onClick={() => onEvidence?.('process')} tone="good">Open Official Site</ActionButton>
          <ActionButton onClick={() => onEvidence?.('report')} tone="good">Report URL</ActionButton>
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

function QRScannerInvestigation({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [scan, setScan] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const target = displayText(data.actual_destination || data.qr_url || data.claimed_purpose, 'https://unknown-qr.example/login');
  const claim = displayText(data.claimed_purpose, 'secure registration');
  const host = target.replace(/^https?:\/\//, '').split('/')[0] || 'unknown-qr.example';
  const openFakePage = () => { setScan(true); setPageOpen(true); onEvidence?.('url'); };

  return (
    <Shell label="MOBILE QR SCANNER">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ borderRadius: 28, padding: 14, background: '#020617', border: '1px solid rgba(148,163,184,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
          <div style={{ height: 34, color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>Camera</div>
          <div style={{ height: 260, borderRadius: 18, background: 'linear-gradient(135deg, #0f172a, #111827)', border: '1px solid rgba(34,211,238,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 34, border: '2px solid rgba(34,211,238,0.75)', borderRadius: 16, boxShadow: '0 0 24px rgba(34,211,238,0.24)' }} />
            <QRCodeVisual seed={`${scenario.subject}-${target}`} active={scan} />
            {scan && <div style={{ position: 'absolute', left: 38, right: 38, top: pageOpen ? 190 : 60, height: 2, background: '#22d3ee', boxShadow: '0 0 18px #22d3ee', transition: 'top 0.9s' }} />}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', color: scan ? '#67e8f9' : '#64748b', fontSize: 12, fontWeight: 800 }}>{scan ? 'QR DETECTED' : 'POINT CAMERA AT CODE'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <ActionButton onClick={() => { setScan(true); onEvidence?.('scan'); }} tone="info">Scan Code</ActionButton>
            <ActionButton onClick={openFakePage} tone="warn">Open Page</ActionButton>
          </div>
        </div>
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {!pageOpen ? (
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 900, marginBottom: 8 }}>{scenario.subject}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{claim}</div>
              {scan && (
                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', color: '#fde68a', fontSize: 12, marginBottom: 14 }}>
                  Scan result: a mobile browser is ready to open an external page.
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ActionButton onClick={openFakePage} tone="warn">Open Scanned Page</ActionButton>
                <ActionButton onClick={() => { onEvidence?.('process'); }} tone="good">Verify Officially</ActionButton>
                <ActionButton onClick={() => { onEvidence?.('report'); }} tone="good">Report QR</ActionButton>
              </div>
            </div>
          ) : (
            <>
              <div style={{ background: '#e5e7eb', padding: 10 }}>
                <div style={{ padding: '7px 10px', borderRadius: 8, background: '#fff', border: '1px solid #cbd5e1', color: '#991b1b', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>Not secure / {host}</div>
              </div>
              <div style={{ minHeight: 270, padding: 20, background: '#f8fafc', color: '#111827' }}>
                <div style={{ maxWidth: 420 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{claim}</div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>Complete verification to continue. This page was opened from the scanned QR code and is requesting account details before showing the service.</div>
                  <input disabled placeholder="Work email" style={{ width: '100%', maxWidth: 340, padding: 11, borderRadius: 7, border: '1px solid #cbd5e1', marginBottom: 8, background: '#fff', color: '#64748b' }} />
                  <input disabled placeholder="Password or payment code" style={{ width: '100%', maxWidth: 340, padding: 11, borderRadius: 7, border: '1px solid #cbd5e1', marginBottom: 12, background: '#fff', color: '#64748b' }} />
                  <button onClick={() => { setSubmitted(true); onEvidence?.('impact'); }} style={{ width: '100%', maxWidth: 340, padding: 11, border: 'none', borderRadius: 7, background: '#2563eb', color: '#fff', fontWeight: 900, fontFamily: 'inherit' }}>Continue</button>
                </div>
                {submitted && (
                  <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 12, fontWeight: 800 }}>
                    Credential capture simulated: the QR page would send the form to {host}.
                  </div>
                )}
              </div>
              <div style={{ padding: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ActionButton onClick={() => { onEvidence?.('process'); }} tone="good">Verify Officially</ActionButton>
                <ActionButton onClick={() => { onEvidence?.('report'); }} tone="good">Report QR</ActionButton>
                <ActionButton onClick={() => setPageOpen(false)} tone="neutral">Close Page</ActionButton>
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}

function QRCodeVisual({ seed, active }) {
  const cells = useMemo(() => {
    const size = 25;
    let hash = 0;
    const text = String(seed || 'cyberguard-qr');
    for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;

    const finderCell = (r, c, startR, startC) => {
      const rr = r - startR;
      const cc = c - startC;
      if (rr < 0 || cc < 0 || rr > 6 || cc > 6) return null;
      if (rr === 0 || cc === 0 || rr === 6 || cc === 6) return true;
      if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    };

    return Array.from({ length: size * size }, (_, index) => {
      const r = Math.floor(index / size);
      const c = index % size;
      const finder =
        finderCell(r, c, 1, 1) ??
        finderCell(r, c, 1, size - 8) ??
        finderCell(r, c, size - 8, 1);
      if (finder !== null) return finder;
      if (r === 8 || c === 8) return (r + c) % 2 === 0;
      if (r < 1 || c < 1 || r > size - 2 || c > size - 2) return false;
      const value = Math.abs(hash + r * 37 + c * 53 + r * c * 11 + ((r ^ c) * 7));
      return value % 9 < 4;
    });
  }, [seed]);

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '44%',
      transform: `translate(-50%, -50%) scale(${active ? 1.04 : 1})`,
      width: 148,
      height: 148,
      padding: 8,
      borderRadius: 10,
      background: '#f8fafc',
      boxShadow: active ? '0 0 34px rgba(34,211,238,0.42)' : '0 12px 32px rgba(0,0,0,0.35)',
      border: active ? '1px solid rgba(103,232,249,0.65)' : '1px solid rgba(226,232,240,0.85)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(25, 1fr)',
        gridTemplateRows: 'repeat(25, 1fr)',
        width: '100%',
        height: '100%',
        gap: 1,
      }}>
        {cells.map((filled, index) => (
          <span
            key={index}
            style={{
              background: filled ? '#020617' : '#f8fafc',
              borderRadius: filled && index % 11 === 0 ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function USBDesktopInvestigation({ scenario, setSelected, onEvidence }) {
  const data = scenario.extra_data || {};
  const [mounted, setMounted] = useState(false);
  const [scan, setScan] = useState(false);
  const files = textList(data.files_if_opened, ['Payroll_Q4.xlsx', 'Board_Deck.pdf', 'autorun.inf']);

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
          <ActionButton onClick={() => { setMounted(true); onEvidence?.('impact'); }} tone="bad">Mount Device</ActionButton>
          <ActionButton onClick={() => { setScan(true); onEvidence?.('scan'); }} tone="info">Sandbox Scan</ActionButton>
          <ActionButton onClick={() => { onEvidence?.('process'); }} tone="good">Turn In To IT</ActionButton>
          <ActionButton onClick={() => { onEvidence?.('report'); }} tone="good">Document Incident</ActionButton>
        </div>
      </div>
    </Shell>
  );
}
