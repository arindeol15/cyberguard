import { useState, useEffect, useRef } from 'react';
import * as api from './api';
import { ADVANCED_CATEGORIES, AdvancedScenarioPanel, IncidentResponseMode, SOCDashboard } from './AdvancedModules';
import SimulationAudioPlayer from './SimulationAudioPlayer';
import InteractiveCorePanel from './InteractiveCoreModules';
import { getScenarioCallerIdentity, sanitizeCallerText } from './callerIdentity';

const DIFF = {
  Easy: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22c55e', pts: 10 },
  Medium: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', pts: 20 },
  Hard: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', pts: 35 },
};

const CATEGORIES = [
  { id: 'email', label: 'Email Phishing', icon: '✉', desc: 'Identify phishing emails', color: '#6366f1' },
  { id: 'website', label: 'Fake Website', icon: '◈', desc: 'Spot cloned sites', color: '#06b6d4' },
  { id: 'qr', label: 'QR Attack', icon: '▦', desc: 'Malicious QR codes', color: '#a855f7' },
  { id: 'vishing', label: 'Vishing', icon: '◉', desc: 'Phone scam detection', color: '#ec4899' },
  { id: 'usb', label: 'USB Drop', icon: '◆', desc: 'USB threat assessment', color: '#f59e0b' },
  ...ADVANCED_CATEGORIES,
];

const SEVERITY_COLORS = { Critical: '#ef4444', High: '#f59e0b', Medium: '#eab308', Low: '#22c55e' };

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [useAi, setUseAi] = useState(true);
  const [category, setCategory] = useState('email');

  useEffect(() => {
    if (api.isLoggedIn()) {
      api.getMe().then(u => { setUser(u); setPage('home'); }).catch(() => api.logout());
    }
  }, []);

  const handleAuth = (d) => { setUser(d.user); setPage('home'); setError(''); };
  const handleLogout = () => { api.logout(); setUser(null); setPage('login'); };
  const refreshUser = async () => { try { setUser(await api.getMe()); } catch {} };

  if (page === 'login') return <AuthPage onAuth={handleAuth} error={error} setError={setError} />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <NavBar user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {page === 'home' && <HomePage user={user} setPage={setPage} difficulty={difficulty} setDifficulty={setDifficulty} category={category} setCategory={setCategory} useAi={useAi} setUseAi={setUseAi} />}
        {page === 'scenario' && <ScenarioPage setPage={setPage} refreshUser={refreshUser} difficulty={difficulty} useAi={useAi} category={category} />}
        {page === 'threats' && <ThreatPage />}
        {page === 'soc' && <SOCDashboard user={user} />}
        {page === 'leaderboard' && <LeaderboardPage user={user} />}
        {page === 'stats' && <StatsPage />}
      </div>
    </div>
  );
}

// ── NAVIGATION BAR ──
function NavBar({ user, page, setPage, onLogout }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(10,15,28,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', padding: '14px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setPage('home')}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 16, color: '#fff',
          boxShadow: '0 0 20px rgba(99,102,241,0.5)',
        }}>C</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>CYBERGUARD</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.5px' }}>THREAT SIMULATOR</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { id: 'home', l: 'Home', i: '◉' },
          { id: 'threats', l: 'Live Threats', i: '⚡' },
          { id: 'soc', l: 'SOC', i: 'SOC' },
          { id: 'leaderboard', l: 'Leaderboard', i: '◆' },
          { id: 'stats', l: 'Analytics', i: '▦' },
        ].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: page === n.id ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: page === n.id ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 10 }}>{n.i}</span> {n.l}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
          border: '1px solid var(--border-strong)',
          padding: '6px 14px', borderRadius: 8,
          fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {user?.score || 0} PTS
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 600,
          boxShadow: '0 0 12px rgba(99,102,241,0.4)',
        }}>{user?.username?.charAt(0).toUpperCase()}</div>
        <button onClick={onLogout} style={{
          padding: '7px 14px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-muted)', fontSize: 12, fontFamily: 'inherit',
        }}>Logout</button>
      </div>
    </div>
  );
}

// ── AUTH PAGE ──
function AuthPage({ onAuth, error, setError }) {
  const [mode, setMode] = useState('login');
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [loading, setLoading] = useState(false);
  const [terminalText, setTerminalText] = useState([]);

  useEffect(() => {
    const lines = [
      '> Initializing CyberGuard v2.0...',
      '> Loading threat intelligence database...',
      '> Connecting to AI engine [Claude API]...',
      '> Scanning 22 attack vectors...',
      '> System ready. Authentication required.',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < lines.length) {
        setTerminalText(prev => [...prev, lines[idx]]);
        idx++;
      } else clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const submit = async () => {
    if (!u.trim() || !p.trim()) return; setLoading(true); setError('');
    try { onAuth(await (mode === 'login' ? api.login : api.register)(u.trim(), p)); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Hero side */}
      <div style={{ display: 'flex', gap: 60, maxWidth: 1000, width: '100%', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ flex: 1, minWidth: 340, maxWidth: 480 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid var(--border-strong)', borderRadius: 100, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'blink 1.5s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--accent-cyan)', letterSpacing: '1.5px', fontWeight: 600 }}>AI-POWERED · LIVE</span>
          </div>
          <h1 style={{
            fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16,
            background: 'linear-gradient(135deg, #fff 30%, #6366f1 70%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
          }}>
            Train against the<br />unseen threats
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
            Master social engineering defense through realistic AI-generated simulations.
            Phishing, vishing, QR attacks, fake websites, USB drops — experience them all in a safe environment.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { v: '22+', l: 'ATTACK TYPES' },
              { v: '∞', l: 'AI SCENARIOS' },
              { v: '5', l: 'SIM CHANNELS' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(13,20,36,0.6)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px', backdropFilter: 'blur(8px)',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Terminal preview */}
          <div style={{
            background: '#000', borderRadius: 10, padding: 16,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: '1px solid var(--border)', maxHeight: 130, overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            {terminalText.map((line, i) => (
              <div key={i} style={{ color: i === terminalText.length - 1 ? '#22c55e' : '#94a3b8', animation: 'fadeInUp 0.3s' }}>{line}</div>
            ))}
            {terminalText.length > 0 && terminalText.length < 5 && (
              <span style={{ color: '#22c55e', animation: 'blink 1s infinite' }}>▊</span>
            )}
          </div>
        </div>

        {/* Login card */}
        <div style={{
          width: 380, padding: 40, background: 'rgba(13,20,36,0.85)',
          backdropFilter: 'blur(16px)', border: '1px solid var(--border-strong)',
          borderRadius: 20, animation: 'fadeInUp 0.6s',
          boxShadow: '0 20px 80px rgba(99,102,241,0.15)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff',
              animation: 'pulse-glow 2s infinite',
            }}>C</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '1px' }}>CYBERGUARD</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{mode === 'login' ? 'Authenticate to access training' : 'Initialize your operator profile'}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1px', display: 'block', marginBottom: 6, fontWeight: 600 }}>USERNAME</label>
            <input value={u} onChange={e => setU(e.target.value)} placeholder="operator_handle" onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1px', display: 'block', marginBottom: 6, fontWeight: 600 }}>PASSWORD</label>
            <input value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          {error && <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 12, marginBottom: 12 }}>⚠ {error}</div>}

          <button onClick={submit} disabled={loading} style={{
            width: '100%', padding: 13, borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            color: '#fff', fontSize: 14, fontWeight: 600, letterSpacing: '0.5px',
            fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'AUTHENTICATING...' : mode === 'login' ? 'AUTHENTICATE →' : 'CREATE PROFILE →'}
          </button>

          <p style={{ marginTop: 18, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            {mode === 'login' ? "New operator? " : 'Existing operator? '}
            <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{ color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}>
              {mode === 'login' ? 'Initialize profile' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── HOME ──
function HomePage({ user, setPage, difficulty, setDifficulty, category, setCategory, useAi, setUseAi }) {
  const acc = user?.total_scenarios > 0 ? Math.round((user.correct_answers / user.total_scenarios) * 100) : 0;

  return (
    <>
      {/* Welcome banner */}
      <div style={{ marginBottom: 32, animation: 'fadeInUp 0.5s' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 10, color: '#22c55e', letterSpacing: '1.5px', fontWeight: 600 }}>OPERATOR ACTIVE</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
          Welcome back, <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.username}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Select a simulation channel and engage the threat. Stay sharp.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { l: 'Score', v: user?.score || 0, c: '#22d3ee', i: '◆' },
          { l: 'Accuracy', v: user?.total_scenarios > 0 ? `${acc}%` : '—', c: '#22c55e', i: '◉' },
          { l: 'Streak', v: user?.streak || 0, c: '#f59e0b', i: '⚡' },
          { l: 'Scenarios', v: user?.total_scenarios || 0, c: '#a855f7', i: '▦' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden',
            animation: `fadeInUp 0.5s ${0.1 * i}s both`,
          }}>
            <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 60, color: s.c, opacity: 0.08 }}>{s.i}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 6, fontWeight: 600 }}>{s.l.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Simulation channels */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Attack Channels</h2>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1px' }}>{CATEGORIES.length} ACTIVE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {CATEGORIES.map((c, i) => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              padding: 16, borderRadius: 12, textAlign: 'left',
              border: category === c.id ? `1px solid ${c.color}` : '1px solid var(--border)',
              background: category === c.id ? `linear-gradient(135deg, ${c.color}15, transparent)` : 'var(--bg-card)',
              fontFamily: 'inherit', position: 'relative', overflow: 'hidden',
              animation: `fadeInUp 0.5s ${0.05 * i}s both`,
            }}>
              {category === c.id && (
                <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
              )}
              <div style={{ fontSize: 24, color: c.color, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mission config */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 24, marginBottom: 16,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 10, fontWeight: 600 }}>THREAT LEVEL</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  border: difficulty === d ? `1px solid ${DIFF[d].color}` : '1px solid var(--border)',
                  background: difficulty === d ? DIFF[d].bg : 'var(--bg-elevated)',
                  color: difficulty === d ? DIFF[d].color : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                }}>
                  {d} <span style={{ fontSize: 10, opacity: 0.7 }}>· {DIFF[d].pts}pts</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 10, fontWeight: 600 }}>SCENARIO SOURCE</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setUseAi(true)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 8,
                border: useAi ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: useAi ? 'rgba(99,102,241,0.1)' : 'var(--bg-elevated)',
                color: useAi ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              }}>⚡ AI Generated</button>
              <button onClick={() => setUseAi(false)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 8,
                border: !useAi ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: !useAi ? 'rgba(99,102,241,0.1)' : 'var(--bg-elevated)',
                color: !useAi ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              }}>◈ Pre-built</button>
            </div>
          </div>
        </div>

        <button onClick={() => setPage('scenario')} style={{
          width: '100%', padding: 14, borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '1px',
          fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          INITIATE {CATEGORIES.find(c => c.id === category)?.label.toUpperCase()} SIMULATION →
        </button>
      </div>
    </>
  );
}

// ── SCENARIO PAGE ──
function safeUrlInfo(rawUrl, fallback = 'https://suspicious-site.example/login') {
  const raw = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  const lower = raw.toLowerCase();
  const isPlaceholder = !raw || lower === 'n/a' || lower.startsWith('n/a ') || lower.includes('overlay popup');
  const candidate = isPlaceholder ? fallback : (/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);

  try {
    const parsed = new URL(candidate);
    return {
      displayUrl: isPlaceholder ? (raw || fallback) : candidate,
      href: parsed.href,
      hostname: parsed.hostname,
      valid: !isPlaceholder,
    };
  } catch {
    const parsedFallback = new URL(fallback);
    return {
      displayUrl: raw || fallback,
      href: parsedFallback.href,
      hostname: parsedFallback.hostname,
      valid: false,
    };
  }
}

function normalizeWebsiteExtra(extra = {}) {
  const fake = safeUrlInfo(extra.fake_url || extra.requested_domain);
  const real = safeUrlInfo(extra.real_url || extra.official_url || 'https://official.example.com', 'https://official.example.com');
  const sslStatus = String(extra.ssl_status ?? '').toLowerCase();
  const sslValid = typeof extra.ssl_valid === 'boolean'
    ? extra.ssl_valid
    : ['valid', 'trusted', 'lets_encrypt', 'letsencrypt', 'present'].includes(sslStatus);
  const sslLabel = sslValid
    ? (sslStatus === 'lets_encrypt' ? 'Certificate present' : 'Valid')
    : (sslStatus === 'n/a' ? 'Not applicable' : 'No SSL');
  const ageValue = extra.domain_age ?? extra.domain_age_days;
  const domainAge = ageValue === undefined || ageValue === null || ageValue === ''
    ? 'Unknown'
    : (typeof ageValue === 'number' ? `${ageValue} days` : String(ageValue));

  return {
    fakeUrl: fake.displayUrl,
    fakeHost: fake.hostname,
    fakeUrlValid: fake.valid,
    realUrl: real.displayUrl,
    realHost: real.hostname,
    sslValid,
    sslLabel,
    domainAge,
  };
}

function callScenarioIntro(category, scenario, identity) {
  if (!identity || !['vishing', 'deepfake'].includes(category)) return scenario.body;
  const data = scenario.extra_data || {};
  const source = String(data.transcript || scenario.body || '');
  const quoted = source.match(/"([^"]{20,260})"/) || source.match(/(?:^|[\s:])'([^']{20,260})'/);
  const request = sanitizeCallerText(quoted?.[1] || source)
    .replace(/^caller:\s*/i, '')
    .slice(0, 260);
  const org = data.claimed_organization || identity.org || 'a trusted office';
  return [
    `Your phone rings from ${identity.name}, who claims to be from ${org}.`,
    request ? `Caller request: ${request}` : 'The caller is pushing you to act quickly during the call.',
    'Listen to the call, inspect the details, and decide whether to comply, verify, or report.',
  ].join('\n\n');
}

function ScenarioPage({ setPage, refreshUser, difficulty, useAi, category }) {
  const [scenario, setScenario] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const startTime = useRef(Date.now());

  const load = async () => {
    setLoading(true); setSelected(null); setResult(null); setLoadError(''); startTime.current = Date.now();
    try {
      setScenario(await api.generateScenario(difficulty, useAi, category));
    } catch (e) {
      console.error(e);
      setScenario(null);
      setLoadError(e.message || 'Scenario failed to load.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!selected) return; setSubmitting(true);
    try {
      const responseTime = (Date.now() - startTime.current) / 1000;
      const r = await api.submitAnswer(scenario.id, selected, responseTime);
      setResult({ ...r, response_time: responseTime });
      refreshUser();
    } catch (e) {
      console.error(e);
      setLoadError(e.message || 'Response submission failed.');
    }
    setSubmitting(false);
  };

  const catInfo = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 0' }}>
      <div style={{
        width: 64, height: 64, margin: '0 auto 24px',
        border: '3px solid var(--border)', borderTopColor: catInfo.color,
        borderRadius: '50%', animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
        Generating {catInfo.label}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        {useAi ? '✦ AI is crafting a unique threat scenario' : 'Loading pre-built scenario'}
      </p>
    </div>
  );

  if (!scenario) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ color: 'var(--text-muted)' }}>{loadError || 'Failed to load scenario.'}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>The simulator stayed online. Retry will request a fresh scenario for this module.</p>
      <button onClick={load} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit' }}>Retry</button>
    </div>
  );

  const websiteExtra = category === 'website' ? normalizeWebsiteExtra(scenario.extra_data || {}) : null;
  const callIdentity = ['vishing', 'deepfake'].includes(category)
    ? getScenarioCallerIdentity(scenario, scenario.extra_data || {}, category)
    : null;
  const displayedBody = callScenarioIntro(category, scenario, callIdentity);

  if (result) return (
    <ResultView result={result} scenario={scenario} category={category} catInfo={catInfo} onNext={load} onHome={() => setPage('home')} />
  );

  // Scenario view
  return (
    <div style={{ animation: 'fadeInUp 0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          padding: '6px 12px', borderRadius: 8,
          background: `${catInfo.color}15`, border: `1px solid ${catInfo.color}33`,
          color: catInfo.color, fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>{catInfo.icon}</span> {catInfo.label}
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 8,
          background: DIFF[scenario.difficulty]?.bg,
          border: `1px solid ${DIFF[scenario.difficulty]?.border}`,
          color: DIFF[scenario.difficulty]?.color, fontSize: 12, fontWeight: 600,
        }}>{scenario.difficulty}</div>
        <div style={{
          padding: '6px 12px', borderRadius: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
        }}>{scenario.type}</div>
        <button onClick={() => setPage('home')} style={{
          marginLeft: 'auto', padding: '6px 12px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-muted)', fontSize: 12, fontFamily: 'inherit',
        }}>← Abort</button>
      </div>

      {/* Main scenario card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden', marginBottom: 20,
      }}>
        <div style={{ padding: 24, borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${catInfo.color}, transparent)` }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>{scenario.subject}</div>
          {scenario.sender_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
              }}>{scenario.sender_name?.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{scenario.sender_name}</div>
                {scenario.sender_email && <div style={{ fontSize: 12, color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>{scenario.sender_email}</div>}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: 24, fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{displayedBody}</div>

        {/* Category-specific panels */}
        {websiteExtra && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '1.5px' }}>BROWSER ANALYSIS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16, fontSize: 12 }}>
              <div style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>SSL Status</div>
                <div style={{ color: websiteExtra.sslValid ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{websiteExtra.sslLabel}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Domain Age</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>{websiteExtra.domainAge}</div>
              </div>
            </div>
            {!websiteExtra.fakeUrlValid && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)', color: '#fbbf24', fontSize: 12 }}>
                This scenario uses a popup or overlay instead of a normal URL, so the simulator is showing a safe reconstructed browser view.
              </div>
            )}
            <FakeBrowser fakeUrl={websiteExtra.fakeUrl} realUrl={websiteExtra.realUrl} ssl={websiteExtra.sslValid} subject={scenario.subject} />
          </div>
        )}

        {scenario.extra_data && category === 'vishing' && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '1.5px' }}>CALL DETAILS</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <VishingPlayer
                transcript={scenario.body}
                difficulty={scenario.difficulty}
                extraData={scenario.extra_data}
                callerIdentity={callIdentity}
              />
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, flex: 1 }}>
                <div>Caller ID: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-cyan)' }}>{scenario.extra_data.caller_id || 'Unknown caller ID'}</span></div>
                <div>Claims: <strong style={{ color: 'var(--text-primary)' }}>{scenario.extra_data.claimed_organization || callIdentity?.org || 'Unverified organization'}</strong></div>
                <div>Tactics: <span style={{ color: '#f59e0b' }}>{Array.isArray(scenario.extra_data.tactics_used) ? scenario.extra_data.tactics_used.join(', ') : 'urgency, authority'}</span></div>
                <div>Wants: <span style={{ color: '#ef4444' }}>{Array.isArray(scenario.extra_data.info_requested) ? scenario.extra_data.info_requested.join(', ') : 'credentials or payment action'}</span></div>
              </div>
            </div>
          </div>
        )}

        {scenario.extra_data && category === 'usb' && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '1.5px' }}>USB METADATA</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>Found at: <strong style={{ color: 'var(--text-primary)' }}>{scenario.extra_data.found_location}</strong></div>
              <div>Appearance: {scenario.extra_data.usb_appearance}</div>
              <div>Label: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-cyan)' }}>"{scenario.extra_data.usb_label}"</span></div>
              {scenario.extra_data.files_if_opened && <div>Files visible: {scenario.extra_data.files_if_opened.join(', ')}</div>}
            </div>
          </div>
        )}

        <InteractiveCorePanel category={category} scenario={scenario} selected={selected} setSelected={setSelected} />
        <AdvancedScenarioPanel category={category} scenario={scenario} selected={selected} setSelected={setSelected} />
      </div>

      {/* Actions */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 12 }}>SELECT YOUR RESPONSE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(scenario.options || []).map((a, i) => (
            <button key={a.id} onClick={() => setSelected(a.id)} style={{
              padding: 16, borderRadius: 12, textAlign: 'left', fontFamily: 'inherit',
              border: selected === a.id ? `1px solid ${catInfo.color}` : '1px solid var(--border)',
              background: selected === a.id ? `linear-gradient(135deg, ${catInfo.color}15, transparent)` : 'var(--bg-card)',
              position: 'relative',
            }}>
              {selected === a.id && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: catInfo.color, boxShadow: `0 0 8px ${catInfo.color}` }} />
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', fontSize: 12 }}>
          {loadError}
        </div>
      )}

      {selected && (
        <button onClick={submit} disabled={submitting} style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '1px',
          fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          opacity: submitting ? 0.6 : 1,
        }}>
          {submitting ? 'ANALYZING...' : 'SUBMIT RESPONSE →'}
        </button>
      )}
    </div>
  );
}

// ── RESULT VIEW ──
function ResultMetrics({ result, scenario, category, catInfo }) {
  const flags = result.red_flags || [];
  const responseTime = result.response_time || 0;
  const difficultyWeight = { Easy: 10, Medium: 18, Hard: 26 }[scenario?.difficulty] || 18;
  const speedBonus = responseTime && responseTime < 25 ? 8 : responseTime && responseTime < 60 ? 4 : 0;
  const riskScore = result.correct ? Math.max(4, 28 - speedBonus) : Math.min(96, 58 + difficultyWeight + flags.length * 4);
  const suspicionScore = result.correct ? Math.min(100, 72 + difficultyWeight + speedBonus) : Math.max(18, 46 - Math.floor(responseTime / 12));
  const detectionRate = result.correct ? Math.min(100, 78 + flags.length * 4) : Math.max(20, 52 - flags.length * 2);
  const accuracy = result.correct ? 100 : 35;
  const awareness = Math.round((suspicionScore + detectionRate + accuracy + (100 - riskScore)) / 4);
  const heat = Array.from({ length: 28 }, (_, i) => (i * 17 + riskScore + suspicionScore) % 100);
  const techniques = {
    email: ['sender spoofing', 'urgency', 'credential harvesting'],
    website: ['domain impersonation', 'certificate confusion', 'fake login'],
    qr: ['quishing', 'redirect abuse', 'mobile trust gap'],
    vishing: ['authority pressure', 'voice social engineering', 'callback avoidance'],
    usb: ['curiosity bait', 'removable media malware', 'autorun payloads'],
    chat: ['internal impersonation', 'collaboration abuse', 'document lure'],
    attachment: ['macro abuse', 'double extension', 'sandbox evasion'],
    browser_exploit: ['fake update', 'malicious permissions', 'drive-by lure'],
    mfa: ['push fatigue', 'session takeover', 'impossible travel'],
    cloud: ['token misuse', 'external sharing', 'session persistence'],
    insider: ['privilege misuse', 'data staging', 'policy evasion'],
    wifi: ['evil twin', 'captive portal theft', 'downgrade risk'],
    dns: ['pharming', 'certificate mismatch', 'resolver poisoning'],
    deepfake: ['synthetic voice', 'urgency manipulation', 'identity spoofing'],
    attack_chain: ['multi-stage intrusion', 'identity pivot', 'ransomware path'],
    smishing: ['SMS spoofing', 'short-link lure', 'OTP theft'],
    bec: ['invoice fraud', 'executive pressure', 'bank detail swap'],
    supply_chain: ['poisoned update', 'signature mismatch', 'build pipeline abuse'],
  }[category] || ['social engineering', 'trust abuse'];
  const strengths = result.correct
    ? ['Selected a defensible response', 'Reduced downstream compromise risk', `Handled ${catInfo?.label || category} indicators`]
    : ['Completed the scenario', 'Reached incident review mode'];
  const weaknesses = result.correct
    ? ['Keep validating secondary evidence before acting']
    : ['Missed one or more red flags', 'Action increased attacker leverage', 'Needs stronger verification habit'];
  const recommendations = result.correct
    ? ['Practice a harder variation', 'Continue out-of-band verification', 'Document evidence before closing the incident']
    : ['Slow down and inspect identity, domain, and requested action', 'Use official channels rather than embedded prompts', 'Report early when urgency or secrecy appears'];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1.5px', fontWeight: 800 }}>PERFORMANCE ANALYTICS</div>
          <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 800, marginTop: 4 }}>Awareness score: {awareness}/100</div>
        </div>
        <div style={{ fontSize: 22, color: awareness >= 75 ? '#22c55e' : awareness >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{awareness}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 10, marginBottom: 18 }}>
        {[
          ['Risk Score', `${riskScore}/100`, riskScore > 65 ? '#ef4444' : riskScore > 35 ? '#f59e0b' : '#22c55e'],
          ['Suspicion', `${suspicionScore}%`, '#22d3ee'],
          ['Detection Rate', `${detectionRate}%`, '#a855f7'],
          ['Response Time', responseTime ? `${Math.round(responseTime)}s` : 'n/a', '#f59e0b'],
          ['Decision Accuracy', `${accuracy}%`, result.correct ? '#22c55e' : '#ef4444'],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: 5 }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: 17, color, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8 }}>STRENGTHS</div>
          {strengths.map(s => <div key={s} style={{ fontSize: 12, color: '#bbf7d0', marginBottom: 6 }}>{s}</div>)}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8 }}>WEAKNESSES</div>
          {weaknesses.map(s => <div key={s} style={{ fontSize: 12, color: '#fde68a', marginBottom: 6 }}>{s}</div>)}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8 }}>ATTACK TECHNIQUES</div>
          {techniques.map(t => <div key={t} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{t}</div>)}
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8 }}>ATTACK HEATMAP</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
            {heat.map((h, i) => <div key={i} style={{ height: 18, borderRadius: 5, background: h > 70 ? 'rgba(239,68,68,0.72)' : h > 42 ? 'rgba(245,158,11,0.62)' : 'rgba(34,197,94,0.34)' }} />)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 8 }}>IMPROVEMENT PLAN</div>
          {recommendations.map(r => <div key={r} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{r}</div>)}
        </div>
      </div>
    </div>
  );
}

function ResultView({ result, scenario, category, catInfo, onNext, onHome }) {
  return (
    <div style={{ animation: 'fadeInUp 0.4s' }}>
      <div style={{
        textAlign: 'center', padding: 32, marginBottom: 20,
        background: 'var(--bg-card)', border: `1px solid ${result.correct ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        borderRadius: 16,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
          background: result.correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `2px solid ${result.correct ? '#22c55e' : '#ef4444'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, color: result.correct ? '#22c55e' : '#ef4444',
          animation: 'pulse-glow 1.5s',
        }}>{result.correct ? '✓' : '✗'}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
          {result.correct ? 'Threat Neutralized' : 'Compromised'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 10 }}>
          Correct action: <strong style={{ color: 'var(--text-primary)' }}>{(scenario?.options?.find(a => a.id === result.correct_action))?.label || result.correct_action}</strong>
        </p>
        {result.correct && (
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 100, color: '#22d3ee', fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
            +{result.points_earned} POINTS
          </div>
        )}
      </div>

      <ResultMetrics result={result} scenario={scenario} category={category} catInfo={catInfo} />

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 24, marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 16 }}>🚩 RED FLAGS DETECTED</div>
        {result.red_flags?.map((f, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, padding: '12px 0',
            borderTop: i > 0 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              minWidth: 24, height: 24, borderRadius: 6,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#f59e0b', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{f}</span>
          </div>
        ))}
      </div>

      {!result.correct && <IncidentResponseMode scenario={scenario} />}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onHome} style={{
          flex: 1, padding: 13, borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--bg-card)',
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        }}>← Home</button>
        <button onClick={onNext} style={{
          flex: 2, padding: 13, borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px',
          fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
        }}>NEXT SCENARIO →</button>
      </div>
    </div>
  );
}

// ── THREAT PAGE ──
function ThreatPage() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getThreats().then(setThreats).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <div style={{ animation: 'fadeInUp 0.4s' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 100, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'blink 1s infinite' }} />
          <span style={{ fontSize: 10, color: '#ef4444', letterSpacing: '1.5px', fontWeight: 600 }}>LIVE FEED</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Threat Intelligence</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time cybersecurity threats and global attack monitoring</p>
      </div>

      <ThreatMap />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Active Threats</h2>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1px' }}>{threats.length} ENTRIES</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading threat feed...</div>
      ) : threats.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No threat data available.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {threats.map((t, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden',
              animation: `fadeInUp 0.4s ${0.03 * i}s both`,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: SEVERITY_COLORS[t.severity] || '#888' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 4, fontWeight: 700, letterSpacing: '1px',
                  background: `${SEVERITY_COLORS[t.severity] || '#888'}20`,
                  color: SEVERITY_COLORS[t.severity] || '#888',
                }}>{t.severity}</span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{t.category}</span>
                {t.source && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{t.source}</span>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{t.title}</div>
              {t.summary && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.summary}</div>}
              {t.published_at && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>{t.published_at}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LEADERBOARD ──
function LeaderboardPage({ user }) {
  const [board, setBoard] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.getLeaderboard().then(setBoard).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <div style={{ animation: 'fadeInUp 0.4s' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Leaderboard</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Top operators ranked by threat detection score</p>

      {loading ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</p> : board.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No entries yet.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {board.map((e, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '16px 22px',
              borderBottom: i < board.length - 1 ? '1px solid var(--border)' : 'none',
              background: e.username === user?.username ? 'rgba(99,102,241,0.05)' : 'transparent',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, marginRight: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                  i === 1 ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)' :
                  i === 2 ? 'linear-gradient(135deg, #fb923c, #ea580c)' : 'var(--bg-elevated)',
                color: i < 3 ? '#fff' : 'var(--text-muted)',
                boxShadow: i < 3 ? `0 0 16px ${i === 0 ? 'rgba(251,191,36,0.4)' : i === 1 ? 'rgba(148,163,184,0.4)' : 'rgba(251,146,60,0.4)'}` : 'none',
              }}>#{e.rank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {e.username}
                  {e.username === user?.username && <span style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 500, marginLeft: 6 }}>· YOU</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{e.accuracy}% accuracy · {e.total_scenarios} scenarios</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: "'JetBrains Mono', monospace" }}>{e.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── STATS ──
function StatsPage() {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.getStats().then(setStats).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</p>;
  if (!stats) return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Failed to load</p>;

  return (
    <div style={{ animation: 'fadeInUp 0.4s' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Analytics</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Performance breakdown by attack channel and threat level</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { l: 'Score', v: stats.score, c: '#22d3ee' },
          { l: 'Completed', v: stats.total, c: '#a855f7' },
          { l: 'Correct', v: stats.correct, c: '#22c55e' },
          { l: 'Accuracy', v: stats.total > 0 ? `${stats.accuracy}%` : '—', c: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 6, fontWeight: 600 }}>{s.l.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {stats.by_category && Object.keys(stats.by_category).length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 16 }}>BY ATTACK CHANNEL</div>
          {Object.entries(stats.by_category).map(([cat, d]) => {
            const pct = Math.round((d.correct / d.total) * 100);
            const info = CATEGORIES.find(c => c.id === cat);
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 16, width: 28, color: info?.color }}>{info?.icon || '◆'}</span>
                <span style={{ fontSize: 13, fontWeight: 600, width: 110, color: 'var(--text-primary)' }}>{info?.label || cat}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${info?.color || '#6366f1'}, ${info?.color || '#06b6d4'})`, borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 50, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {stats.by_difficulty && Object.keys(stats.by_difficulty).length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: 16 }}>BY THREAT LEVEL</div>
          {['Easy', 'Medium', 'Hard'].filter(d => stats.by_difficulty[d]).map(d => {
            const pct = Math.round((stats.by_difficulty[d].correct / stats.by_difficulty[d].total) * 100);
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, width: 80, color: DIFF[d].color }}>{d}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: DIFF[d].color, borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 50, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {stats.total === 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Complete scenarios to unlock analytics</p>
        </div>
      )}
    </div>
  );
}

// ── FAKE BROWSER ──
function FakeBrowser({ fakeUrl, realUrl, ssl, subject }) {
  const [open, setOpen] = useState(false);
  const [warning, setWarning] = useState(false);
  const fake = safeUrlInfo(fakeUrl);
  const real = safeUrlInfo(realUrl, 'https://official.example.com');
  const domain = fake.hostname;
  const sslOk = Boolean(ssl);

  return (
    <div>
      <button onClick={() => setOpen(!open)} style={{
        padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
        background: 'rgba(239,68,68,0.08)', color: '#fca5a5', fontSize: 12, fontWeight: 600,
        fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        🌐 {open ? 'Close simulated page' : 'Visit the suspicious URL'}
      </button>

      {open && (
        <div style={{ marginTop: 14, border: '1px solid var(--border-strong)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <div style={{ background: '#e5e7eb', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 8 }}>{subject}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 6, padding: '6px 10px', border: '1px solid #d1d5db' }}>
              <span style={{ fontSize: 12 }}>{sslOk ? '🔒' : '⚠️'}</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: sslOk ? '#374151' : '#dc2626', flex: 1 }}>{fake.displayUrl}</span>
            </div>
          </div>

          <div style={{ padding: 24, minHeight: 220, background: '#fff', color: '#374151' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ width: 50, height: 50, background: '#f3f4f6', borderRadius: 8, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏢</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Sign in to your account</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{domain}</div>
            </div>

            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <input placeholder="Email or username" disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, marginBottom: 8, boxSizing: 'border-box', background: '#f9fafb', color: '#6b7280' }} />
              <input placeholder="Password" type="password" disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, marginBottom: 10, boxSizing: 'border-box', background: '#f9fafb', color: '#6b7280' }} />
              <button onClick={() => setWarning(true)} style={{ width: '100%', padding: 10, borderRadius: 6, border: 'none', background: '#1a73e8', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Sign in</button>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 20, paddingTop: 10, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#d1d5db' }}>© 2021 {domain}. All rights reserved.</span>
            </div>
          </div>

          {warning && (
            <div style={{ padding: 16, background: '#dc2626', color: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>⚠️ THIS IS A PHISHING PAGE!</div>
              <div style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>
                Credentials would be sent to the attacker at <strong style={{ fontFamily: 'monospace' }}>{domain}</strong>.
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                <div>Fake: <span style={{ fontFamily: 'monospace' }}>{fake.displayUrl}</span></div>
                <div>Real: <span style={{ fontFamily: 'monospace', color: '#86efac' }}>{real.displayUrl}</span></div>
              </div>
              <button onClick={() => { setOpen(false); setWarning(false); }} style={{ marginTop: 10, padding: '6px 14px', borderRadius: 6, border: '1px solid #fff', background: 'transparent', color: '#fff', fontSize: 11, fontFamily: 'inherit' }}>Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── THREAT MAP ──
function ThreatMap() {
  const [attacks, setAttacks] = useState([]);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const locations = [
      { city: 'Moscow', x: 430, y: 95, type: 'Ransomware' },
      { city: 'Beijing', x: 530, y: 120, type: 'APT' },
      { city: 'Lagos', x: 370, y: 200, type: 'Phishing' },
      { city: 'São Paulo', x: 250, y: 250, type: 'DDoS' },
      { city: 'New York', x: 210, y: 115, type: 'Data Breach' },
      { city: 'London', x: 360, y: 90, type: 'Malware' },
      { city: 'Dubai', x: 430, y: 150, type: 'Social Eng.' },
      { city: 'Mumbai', x: 470, y: 160, type: 'Credential Theft' },
      { city: 'Tokyo', x: 570, y: 120, type: 'Supply Chain' },
      { city: 'Sydney', x: 580, y: 270, type: 'Zero-Day' },
      { city: 'Berlin', x: 380, y: 85, type: 'Spear Phishing' },
      { city: 'Toronto', x: 195, y: 105, type: 'BEC' },
      { city: 'Seoul', x: 555, y: 115, type: 'Cryptojacking' },
      { city: 'Jakarta', x: 530, y: 220, type: 'Smishing' },
      { city: 'Nairobi', x: 410, y: 210, type: 'Vishing' },
    ];

    const generate = () => {
      const count = 5 + Math.floor(Math.random() * 5);
      const selected = [];
      for (let i = 0; i < count; i++) {
        const loc = locations[Math.floor(Math.random() * locations.length)];
        selected.push({
          ...loc, id: Date.now() + i,
          severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
          time: `${Math.floor(Math.random() * 59)}m ago`,
        });
      }
      setAttacks(selected);
    };
    generate();
    const interval = setInterval(generate, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#0a0f1c', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Global Attack Map</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Real-time threat simulation</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: 10, color: '#22c55e', letterSpacing: '1.5px', fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      <svg viewBox="0 0 700 320" style={{ width: '100%', display: 'block' }}>
        <path d="M120,100 L180,80 L220,85 L240,95 L210,120 L215,140 L200,160 L195,140 L180,130 L170,115 Z" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
        <path d="M230,110 L270,100 L290,120 L280,160 L260,180 L245,200 L230,260 L240,280 L270,270 L260,250 L280,240 L270,220 L260,200 L280,170 L270,140 L250,120 Z" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
        <path d="M340,70 L400,65 L420,75 L440,70 L460,80 L500,75 L540,80 L560,85 L580,90 L590,100 L570,110 L540,105 L520,110 L500,105 L480,110 L460,120 L440,115 L420,110 L400,100 L380,95 L360,90 Z" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
        <path d="M360,90 L370,120 L380,140 L400,160 L420,180 L410,200 L420,220 L400,230 L380,220 L370,200 L360,180 L350,140 L355,110 Z" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
        <path d="M430,130 L480,120 L520,130 L550,150 L560,170 L540,190 L520,210 L500,220 L480,200 L460,170 L440,150 Z" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
        <path d="M545,240 L580,230 L610,250 L600,280 L570,290 L550,270 Z" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />

        {[80, 120, 160, 200, 240, 280].map(y => <line key={`h${y}`} x1="100" y1={y} x2="630" y2={y} stroke="rgba(99,102,241,0.05)" strokeWidth="0.5" />)}
        {[150, 200, 250, 300, 350, 400, 450, 500, 550, 600].map(x => <line key={`v${x}`} x1={x} y1="60" x2={x} y2="300" stroke="rgba(99,102,241,0.05)" strokeWidth="0.5" />)}

        {attacks.map((a) => {
          const c = SEVERITY_COLORS[a.severity];
          return (
            <g key={a.id} onMouseEnter={() => setHover(a)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <circle cx={a.x} cy={a.y} r="4" fill="none" stroke={c} strokeWidth="1" opacity="0.6">
                <animate attributeName="r" values="4;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={a.x} cy={a.y} r="3" fill={c} />
            </g>
          );
        })}

        {hover && (
          <g>
            <rect x={hover.x + 8} y={hover.y - 30} width="140" height="42" rx="6" fill="#0a0f1c" stroke="var(--border-strong)" strokeWidth="0.5" />
            <text x={hover.x + 16} y={hover.y - 14} fill="#e2e8f0" fontSize="11" fontWeight="600">{hover.city}</text>
            <text x={hover.x + 16} y={hover.y + 2} fill="#94a3b8" fontSize="9">{hover.type} · {hover.time}</text>
          </g>
        )}
      </svg>

      <div style={{ padding: '10px 20px', display: 'flex', gap: 16, borderTop: '1px solid var(--border)' }}>
        {['Critical', 'High', 'Medium', 'Low'].map(sev => {
          const count = attacks.filter(a => a.severity === sev).length;
          return (
            <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLORS[sev] }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{sev}: <span style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{count}</span></span>
            </div>
          );
        })}
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>{attacks.length} ACTIVE</span>
      </div>
    </div>
  );
}

// ── QR CODE ──
function QRCode({ url }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=ffffff&bgcolor=0a0f1c`;
  const [reveal, setReveal] = useState(false);

  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div style={{ position: 'relative', display: 'inline-block', padding: 12, background: '#0a0f1c', borderRadius: 12, border: '1px solid var(--border-strong)' }}>
        <img src={qrUrl} alt="QR" width={140} height={140} style={{ display: 'block' }}
          onError={(e) => { e.target.src = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(url)}`; }} />
        <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--accent)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px var(--accent)' }}>
          <span style={{ color: '#fff', fontSize: 12 }}>📱</span>
        </div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Scan with phone camera</div>
      <button onClick={() => setReveal(!reveal)} style={{
        fontSize: 11, padding: '6px 14px', borderRadius: 6, border: 'none', marginTop: 8,
        background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontWeight: 600, fontFamily: 'inherit',
      }}>{reveal ? 'Hide' : 'Reveal destination'}</button>
      {reveal && (
        <div style={{ marginTop: 8, padding: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, textAlign: 'left' }}>
          <div style={{ fontSize: 10, color: '#fca5a5', fontWeight: 700, marginBottom: 4 }}>⚠️ PHISHING URL</div>
          <div style={{ fontSize: 10, color: '#fca5a5', fontFamily: 'monospace', wordBreak: 'break-all' }}>{url}</div>
        </div>
      )}
    </div>
  );
}

// ── VISHING PLAYER ──
function VishingPlayer({ transcript, difficulty = 'Medium', extraData = {}, callerIdentity }) {
  const identity = callerIdentity || { name: 'Avery Brooks', role: 'Verification Agent', org: 'Security Desk', voiceHint: 'caller' };
  const difficultyKey = String(difficulty || '').toLowerCase();
  const namePattern = 'Sarah|Kevin|Maya|Marcus|Elena|Daniel|Priya|Thomas|Nadia|Owen|Avery|Riley|Samira|Jonah|Nina|Adrian|Jordan|Sofia|Laura|Victor';
  const normalizeCallerName = (line) => String(line || '').replace(new RegExp(`\\bmy name is (${namePattern})\\b`, 'i'), `my name is ${identity.name.split(' ')[0]}`);
  const extractRequest = (source) => {
    const quoted = source.match(/"([^"]{20,260})"/) || source.match(/(?:^|[\s:])'([^']{20,260})'/);
    if (quoted?.[1]) return normalizeCallerName(sanitizeCallerText(quoted[1]).trim());
    const request = source
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .find(s => /(verify|confirm|approve|send|wire|password|code|download|install|card|account|urgent|payment|access)/i.test(s));
    return normalizeCallerName(sanitizeCallerText(request || source.replace(/\s+/g, ' ').slice(0, 220)));
  };

  const buildCallScript = (text) => {
    if (extraData.call_script) {
      return sanitizeCallerText(Array.isArray(extraData.call_script) ? extraData.call_script.join('\n') : String(extraData.call_script));
    }
    const source = text || '';
    const callerLines = source
      .split('\n')
      .filter(l => /^\s*(caller|scammer|agent|voice|cfo|ceo)\s*:/i.test(l))
      .map(l => normalizeCallerName(sanitizeCallerText(l.replace(/^\s*(caller|scammer|agent|voice|cfo|ceo)\s*:/i, '').trim())))
      .filter(Boolean)
      .slice(0, 7);
    const organization = extraData.claimed_organization || identity.org || 'Security Desk';
    const intro = `Hi, this is ${identity.name} from ${organization}.`;
    if (callerLines.length >= 3) return [intro, ...callerLines].join('\n');

    const wants = Array.isArray(extraData.info_requested) && extraData.info_requested.length
      ? extraData.info_requested.join(', ')
      : 'verification details';
    const request = extractRequest(source);
    const pressureLine = difficultyKey === 'hard'
      ? 'I know this is unusual, but I am already on the incident bridge and we cannot delay the approval window.'
      : difficultyKey === 'easy'
        ? 'This is time sensitive, and I need you to help me finish it right now.'
        : 'I can stay on the line while you complete it, but we need to move quickly.';

    return [
      `${intro} Am I speaking with the account holder?`,
      request,
      pressureLine,
      `For security, I need you to provide ${wants} before I can release the hold.`,
      'Please do not hang up or call the main number, because that will restart the case.',
      'Tell me once you have completed it so I can close the alert on my side.',
    ].join('\n');
  };

  const voiceProfile = identity.voiceHint || 'caller';
  const rate = difficultyKey === 'hard' ? 0.86 : difficultyKey === 'easy' ? 0.95 : 0.9;
  const pitch = difficultyKey === 'hard' ? 0.78 : difficultyKey === 'easy' ? 1.02 : 0.9;
  const callScript = buildCallScript(transcript);
  const displayCaller = `${identity.name} / ${identity.role}`;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b, #0a0f1c)',
      borderRadius: 14, padding: 16, minWidth: 260, flexShrink: 0,
      border: '1px solid var(--border-strong)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>CALL</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Incoming Call</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>{displayCaller}</div>
        </div>
      </div>
      <SimulationAudioPlayer
        title="Caller Audio"
        subtitle={`${difficulty || 'Medium'} call simulation`}
        transcript={callScript}
        accent="#22c55e"
        voiceHint={voiceProfile}
        rate={rate}
        pitch={pitch}
      />
    </div>
  );
}
