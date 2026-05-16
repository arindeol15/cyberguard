import { useState, useEffect, useRef } from 'react';
import * as api from './api';

const DIFF = {
  Easy: { bg: '#e8f5e9', color: '#2e7d32', pts: 10 },
  Medium: { bg: '#fff3e0', color: '#e65100', pts: 20 },
  Hard: { bg: '#fce4ec', color: '#c62828', pts: 35 },
};

const CATEGORIES = [
  { id: 'email', label: 'Email Phishing', icon: '📧', desc: 'Identify phishing emails' },
  { id: 'website', label: 'Fake Website', icon: '🌐', desc: 'Spot cloned websites' },
  { id: 'qr', label: 'QR Attack', icon: '📱', desc: 'Detect malicious QR codes' },
  { id: 'vishing', label: 'Vishing', icon: '📞', desc: 'Phone scam detection' },
  { id: 'usb', label: 'USB Drop', icon: '💾', desc: 'USB drive threat assessment' },
];

const SEVERITY_COLORS = { Critical: '#c62828', High: '#e65100', Medium: '#f9a825', Low: '#2e7d32' };

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
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: "'Outfit','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <NavBar user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px' }}>
        {page === 'home' && <HomePage user={user} setPage={setPage} difficulty={difficulty} setDifficulty={setDifficulty} category={category} setCategory={setCategory} useAi={useAi} setUseAi={setUseAi} />}
        {page === 'scenario' && <ScenarioPage setPage={setPage} refreshUser={refreshUser} difficulty={difficulty} useAi={useAi} category={category} />}
        {page === 'threats' && <ThreatPage />}
        {page === 'leaderboard' && <LeaderboardPage user={user} />}
        {page === 'stats' && <StatsPage />}
      </div>
    </div>
  );
}

// ── NAV ──
function NavBar({ user, page, setPage, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #eee', background: '#fff', flexWrap: 'wrap', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setPage('home')}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>C</div>
        <span style={{ fontWeight: 600, fontSize: 16 }}>CyberGuard</span>
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {[{ id: 'home', l: 'Home' }, { id: 'threats', l: 'Threats' }, { id: 'leaderboard', l: 'Leaderboard' }, { id: 'stats', l: 'Stats' }].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: page === n.id ? '#f0f0f0' : 'transparent', color: page === n.id ? '#1a1a1a' : '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{n.l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: '#f5f0e8', padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#8b6914' }}>{user?.score || 0} pts</div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>{user?.username?.charAt(0).toUpperCase()}</div>
        <button onClick={onLogout} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #eee', background: '#fff', color: '#888', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
      </div>
    </div>
  );
}

// ── AUTH ──
function AuthPage({ onAuth, error, setError }) {
  const [mode, setMode] = useState('login');
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!u.trim() || !p.trim()) return; setLoading(true); setError('');
    try { onAuth(await (mode === 'login' ? api.login : api.register)(u.trim(), p)); } catch (e) { setError(e.message); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5', fontFamily: "'Outfit',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ width: 380, padding: 40, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1a1a1a', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>C</span></div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px' }}>CyberGuard</h1>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 32px' }}>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
        <input value={u} onChange={e => setU(e.target.value)} placeholder="Username" onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 15, outline: 'none', marginBottom: 10, boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }} />
        <input value={p} onChange={e => setP(e.target.value)} placeholder="Password" type="password" onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }} />
        {error && <p style={{ color: '#c62828', fontSize: 13, marginBottom: 10 }}>{error}</p>}
        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <p style={{ marginTop: 16, fontSize: 13, color: '#888' }}>{mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{ color: '#1a1a1a', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{mode === 'login' ? 'Register' : 'Sign in'}</span>
        </p>
      </div>
    </div>
  );
}

// ── HOME ──
function HomePage({ user, setPage, difficulty, setDifficulty, category, setCategory, useAi, setUseAi }) {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>Welcome back, {user?.username}</h2>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Choose a simulation type and test your cyber awareness</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[{ l: 'Score', v: user?.score || 0, c: '#8b6914' }, { l: 'Accuracy', v: user?.total_scenarios > 0 ? `${Math.round((user.correct_answers / user.total_scenarios) * 100)}%` : '—', c: '#2e7d32' }, { l: 'Streak', v: user?.streak || 0, c: '#c62828' }].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Simulation type selector */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulation type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              padding: '12px 6px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit',
              border: category === c.id ? '2px solid #1a1a1a' : '1.5px solid #eee',
              background: category === c.id ? '#f5f5f5' : '#fff',
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a' }}>{c.label}</div>
              <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty + Mode */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Difficulty</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Easy', 'Medium', 'Hard'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                border: difficulty === d ? `2px solid ${DIFF[d].color}` : '1.5px solid #eee',
                background: difficulty === d ? DIFF[d].bg : '#fff', color: difficulty === d ? DIFF[d].color : '#999',
              }}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scenario source</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ ai: true, l: 'AI Generated', i: '✨' }, { ai: false, l: 'Pre-built', i: '📋' }].map(m => (
              <button key={m.l} onClick={() => setUseAi(m.ai)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                border: useAi === m.ai ? '2px solid #1a1a1a' : '1.5px solid #eee',
                background: useAi === m.ai ? '#f5f5f5' : '#fff', color: useAi === m.ai ? '#1a1a1a' : '#999',
              }}>{m.i} {m.l}</button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => setPage('scenario')} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        Start {CATEGORIES.find(c => c.id === category)?.label} simulation
      </button>
    </>
  );
}

// ── SCENARIO ──
function ScenarioPage({ setPage, refreshUser, difficulty, useAi, category }) {
  const [scenario, setScenario] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const load = async () => {
    setLoading(true); setSelected(null); setResult(null); startTime.current = Date.now();
    try {
      const s = await api.generateScenario(difficulty, useAi, category);
      setScenario(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!selected) return; setSubmitting(true);
    try { const r = await api.submitAnswer(scenario.id, selected, (Date.now() - startTime.current) / 1000); setResult(r); refreshUser(); } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const catInfo = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}><div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Generating {catInfo.label} scenario...</div><p style={{ fontSize: 13 }}>{useAi ? 'AI is crafting a unique simulation' : 'Loading scenario'}</p></div>;

  if (!scenario) return <div style={{ textAlign: 'center', padding: '80px 0' }}><p style={{ color: '#888' }}>Failed to load.</p><button onClick={load} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 8, border: '1px solid #eee', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button></div>;

  // Result view
  if (result) return (
    <>
      <div style={{ textAlign: 'center', padding: '28px 24px', background: '#fff', border: '1px solid #eee', borderRadius: 14, marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px', background: result.correct ? '#e8f5e9' : '#fce4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: result.correct ? '#2e7d32' : '#c62828' }}>{result.correct ? '✓' : '✗'}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{result.correct ? 'Correct!' : 'Not quite'}</h2>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 4px' }}>The right action was: <strong>{(scenario?.options?.find(a => a.id === result.correct_action))?.label || result.correct_action}</strong></p>
        {result.correct && <span style={{ fontSize: 13, color: '#8b6914', fontWeight: 600 }}>+{result.points_earned} points</span>}
      </div>
      {/* Extra data display for special categories */}
      {scenario.extra_data && (category === 'website' || category === 'usb' || category === 'qr') && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999' }}>Investigation details</h3>
          {category === 'website' && scenario.extra_data.fake_url && (
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#555' }}>
              <div><strong>Fake URL:</strong> <span style={{ color: '#c62828', fontFamily: 'monospace' }}>{scenario.extra_data.fake_url}</span></div>
              <div><strong>Real URL:</strong> <span style={{ color: '#2e7d32', fontFamily: 'monospace' }}>{scenario.extra_data.real_url}</span></div>
              <div><strong>SSL:</strong> {scenario.extra_data.ssl_valid ? 'Valid (but check issuer!)' : 'Missing — no HTTPS'}</div>
              <div><strong>Domain age:</strong> {scenario.extra_data.domain_age}</div>
            </div>
          )}
          {category === 'usb' && scenario.extra_data.hidden_payload && (
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#555' }}>
              <div><strong>Found at:</strong> {scenario.extra_data.found_location}</div>
              <div><strong>Label:</strong> {scenario.extra_data.usb_label}</div>
              <div><strong>Hidden payload:</strong> <span style={{ color: '#c62828' }}>{scenario.extra_data.hidden_payload}</span></div>
              <div><strong>Visible files:</strong> {scenario.extra_data.files_if_opened?.join(', ')}</div>
            </div>
          )}
          {category === 'qr' && scenario.extra_data.actual_destination && (
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#555' }}>
              <div><strong>Claimed:</strong> {scenario.extra_data.claimed_purpose}</div>
              <div><strong>Actual destination:</strong> <span style={{ color: '#c62828', fontFamily: 'monospace' }}>{scenario.extra_data.actual_destination}</span></div>
              <div><strong>Placement:</strong> {scenario.extra_data.qr_placement}</div>
            </div>
          )}
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999' }}>Red flags</h3>
        {result.red_flags?.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: i > 0 ? '1px solid #f5f5f5' : 'none' }}>
            <span style={{ color: '#e65100', fontSize: 10, marginTop: 4, flexShrink: 0 }}>●</span>
            <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setPage('home')} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #eee', background: '#fff', fontSize: 14, fontWeight: 500, color: '#666', cursor: 'pointer', fontFamily: 'inherit' }}>Home</button>
        <button onClick={load} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Next scenario</button>
      </div>
    </>
  );

  // Scenario view
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>{catInfo.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{catInfo.label}</span>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600, background: DIFF[scenario.difficulty]?.bg, color: DIFF[scenario.difficulty]?.color }}>{scenario.difficulty}</span>
        <span style={{ fontSize: 11, color: '#999' }}>{scenario.type}</span>
        <button onClick={() => setPage('home')} style={{ marginLeft: 'auto', fontSize: 12, color: '#999', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{scenario.subject}</div>
          {scenario.sender_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#c62828' }}>{scenario.sender_name?.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{scenario.sender_name}</div>
                {scenario.sender_email && <div style={{ fontSize: 11, color: '#c62828', fontFamily: 'monospace' }}>{scenario.sender_email}</div>}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: 20, fontSize: 14, lineHeight: 1.8, color: '#444', whiteSpace: 'pre-wrap' }}>{scenario.body}</div>

        {/* Extra data panels for special categories */}
        {scenario.extra_data && category === 'website' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Browser info</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
              <div>URL: <span style={{ fontFamily: 'monospace', color: '#c62828' }}>{scenario.extra_data.fake_url}</span></div>
              <div>SSL: {scenario.extra_data.ssl_valid ? '🔒 Valid certificate' : '⚠️ No SSL — HTTP only'}</div>
              <div>Domain age: {scenario.extra_data.domain_age}</div>
              {scenario.extra_data.visual_differences && <div>Visual clues: {scenario.extra_data.visual_differences.join(' | ')}</div>}
            </div>
          </div>
        )}
        {scenario.extra_data && category === 'usb' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>USB details</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
              <div>Found at: {scenario.extra_data.found_location}</div>
              <div>Appearance: {scenario.extra_data.usb_appearance}</div>
              <div>Label: <strong>{scenario.extra_data.usb_label}</strong></div>
              {scenario.extra_data.files_if_opened && <div>Files visible if opened: {scenario.extra_data.files_if_opened.join(', ')}</div>}
            </div>
          </div>
        )}
        {scenario.extra_data && category === 'qr' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>QR scan preview</div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {/* QR Code Image */}
              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 12, flexShrink: 0 }}>
                <QRCode url={scenario.extra_data.actual_destination || scenario.extra_data.qr_url || 'https://malicious-site.com'} />
                <div style={{ fontSize: 10, color: '#c62828', textAlign: 'center', marginTop: 6, fontFamily: 'monospace' }}>Scanned QR destination</div>
              </div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
                <div><strong>Location:</strong> {scenario.extra_data.location}</div>
                <div><strong>Claims to be:</strong> {scenario.extra_data.claimed_purpose}</div>
                <div><strong>Placement:</strong> {scenario.extra_data.qr_placement}</div>
                {scenario.extra_data.redirect_chain && (
                  <div style={{ marginTop: 6 }}>
                    <strong>Redirect chain:</strong>
                    {scenario.extra_data.redirect_chain.map((url, i) => (
                      <div key={i} style={{ fontFamily: 'monospace', fontSize: 11, color: '#c62828', marginLeft: 8 }}>
                        {i > 0 && '→ '}{url}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {scenario.extra_data && category === 'vishing' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Call info</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Audio play button */}
              <VishingPlayer transcript={scenario.body} callerName={scenario.extra_data.caller_name || scenario.subject} />
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, flex: 1 }}>
                <div>Caller ID: <span style={{ fontFamily: 'monospace' }}>{scenario.extra_data.caller_id}</span></div>
                <div>Claims to be: <strong>{scenario.extra_data.claimed_organization}</strong></div>
                {scenario.extra_data.caller_name && <div>Name given: {scenario.extra_data.caller_name}</div>}
                <div>Tactics: {scenario.extra_data.tactics_used?.join(', ')}</div>
                <div>Info requested: <span style={{ color: '#c62828' }}>{scenario.extra_data.info_requested?.join(', ')}</span></div>
                {scenario.extra_data.call_duration && <div>Duration: {scenario.extra_data.call_duration}</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>What would you do?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(scenario.options || []).map((a, i) => (
            <button key={a.id} onClick={() => setSelected(a.id)} style={{
              padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              border: selected === a.id ? '2px solid #1a1a1a' : '1.5px solid #eee',
              background: selected === a.id ? '#f5f5f5' : '#fff',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{a.label}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {selected && <button onClick={submit} disabled={submitting} style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Submitting...' : 'Submit answer'}</button>}
    </>
  );
}

// ── THREAT INTELLIGENCE ──
function ThreatPage() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getThreats().then(setThreats).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Threat intelligence</h2>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 24px' }}>Latest cybersecurity threats and trends</p>
      {loading ? <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading threat feed...</p> :
        threats.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛡</div>
            <p style={{ color: '#999', fontSize: 14 }}>No threat data yet. Check back after running some AI scenarios.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {threats.map((t, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase',
                    background: `${SEVERITY_COLORS[t.severity] || '#888'}15`, color: SEVERITY_COLORS[t.severity] || '#888' }}>{t.severity}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: '#f5f5f5', color: '#666' }}>{t.category}</span>
                  {t.source && <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto' }}>{t.source}</span>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{t.title}</div>
                {t.summary && <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{t.summary}</div>}
              </div>
            ))}
          </div>
        )}
    </>
  );
}

// ── LEADERBOARD ──
function LeaderboardPage({ user }) {
  const [board, setBoard] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.getLeaderboard().then(setBoard).catch(console.error).finally(() => setLoading(false)); }, []);
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Leaderboard</h2>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 24px' }}>Top analysts ranked by score</p>
      {loading ? <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</p> : board.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}><div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div><p style={{ color: '#999' }}>No entries yet.</p></div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, overflow: 'hidden' }}>
          {board.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: i < board.length - 1 ? '1px solid #f5f5f5' : 'none', background: e.username === user?.username ? '#fafaf5' : 'transparent' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginRight: 14, background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#fef0e1' : '#f5f5f5', color: i === 0 ? '#92400e' : i === 1 ? '#475569' : i === 2 ? '#9a3412' : '#999' }}>{e.rank}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{e.username}{e.username === user?.username && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}> (you)</span>}</div><div style={{ fontSize: 11, color: '#999' }}>{e.accuracy}% accuracy · {e.total_scenarios} scenarios</div></div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#8b6914' }}>{e.score}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── STATS ──
function StatsPage() {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.getStats().then(setStats).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</p>;
  if (!stats) return <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Failed to load</p>;
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Your stats</h2>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 24px' }}>Performance breakdown</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{ l: 'Score', v: stats.score, c: '#8b6914' }, { l: 'Completed', v: stats.total, c: '#1a1a1a' }, { l: 'Correct', v: stats.correct, c: '#2e7d32' }, { l: 'Accuracy', v: stats.total > 0 ? `${stats.accuracy}%` : '—', c: '#1565c0' }].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      {/* By category */}
      {stats.by_category && Object.keys(stats.by_category).length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999' }}>By simulation type</h3>
          {Object.entries(stats.by_category).map(([cat, d]) => {
            const pct = Math.round((d.correct / d.total) * 100);
            const info = CATEGORIES.find(c => c.id === cat);
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14, width: 24 }}>{info?.icon || '📋'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, width: 90, color: '#444' }}>{info?.label || cat}</span>
                <div style={{ flex: 1, height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? '#2e7d32' : '#e65100', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#444', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
      {stats.by_difficulty && Object.keys(stats.by_difficulty).length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999' }}>By difficulty</h3>
          {['Easy', 'Medium', 'Hard'].filter(d => stats.by_difficulty[d]).map(d => {
            const pct = Math.round((stats.by_difficulty[d].correct / stats.by_difficulty[d].total) * 100);
            return (<div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 600, width: 60, color: DIFF[d].color }}>{d}</span><div style={{ flex: 1, height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: DIFF[d].color, borderRadius: 4 }} /></div><span style={{ fontSize: 12, fontWeight: 600, color: '#444', minWidth: 36, textAlign: 'right' }}>{pct}%</span></div>);
          })}
        </div>
      )}
      {stats.total === 0 && <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}><p style={{ color: '#999' }}>Complete some scenarios to see stats</p></div>}
    </>
  );
}

// ── QR CODE (REAL SCANNABLE) ──
function QRCode({ url }) {
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(url)}&chld=L|1`;
  const [scanned, setScanned] = useState(false);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={qrUrl}
          alt="QR Code"
          width={120}
          height={120}
          style={{ border: '3px solid #eee', borderRadius: 8, background: '#fff', padding: 4 }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {scanned && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(198,40,40,0.9)', borderRadius: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>⚠️</span>
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 600, marginTop: 4 }}>MALICIOUS URL</span>
          </div>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setScanned(!scanned)} style={{
          fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #eee',
          background: scanned ? '#fce4ec' : '#f5f5f5', color: scanned ? '#c62828' : '#666',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {scanned ? 'Hide result' : 'Simulate scan'}
        </button>
      </div>
      {scanned && (
        <div style={{ marginTop: 6, padding: '6px 8px', background: '#fce4ec', borderRadius: 6 }}>
          <div style={{ fontSize: 9, color: '#c62828', fontWeight: 600 }}>Destination:</div>
          <div style={{ fontSize: 9, color: '#c62828', fontFamily: 'monospace', wordBreak: 'break-all' }}>{url}</div>
        </div>
      )}
    </div>
  );
}

// ── VISHING AUDIO PLAYER ──
function VishingPlayer({ transcript, callerName }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const extractCallerLines = (text) => text.split('\n').filter(l => l.trim().startsWith('Caller:')).map(l => l.replace('Caller:', '').trim()).join('. ');

  const play = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false); setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const callerText = extractCallerLines(transcript);
    if (!callerText) return;

    const utterance = new SpeechSynthesisUtterance(callerText);
    utterance.rate = 0.9; utterance.pitch = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('David'));
    if (deepVoice) utterance.voice = deepVoice;

    utterance.onend = () => { setPlaying(false); setProgress(100); if (intervalRef.current) clearInterval(intervalRef.current); };

    setPlaying(true); setProgress(0);
    const words = callerText.split(' ').length;
    const dur = (words / 2.5) * 1000;
    const step = 100 / (dur / 200);
    intervalRef.current = setInterval(() => {
      setProgress(p => { if (p >= 99) { clearInterval(intervalRef.current); return 100; } return p + step; });
    }, 200);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, minWidth: 180, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button onClick={play} style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: playing ? '#c62828' : '#fff', color: playing ? '#fff' : '#1a1a1a',
          fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
        }}>{playing ? '■' : '▶'}</button>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Incoming call</div>
          <div style={{ fontSize: 10, color: '#999' }}>{callerName}</div>
        </div>
      </div>
      <div style={{ height: 3, background: '#333', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#4ade80', borderRadius: 2, transition: 'width 0.2s' }} />
      </div>
      <div style={{ fontSize: 9, color: '#666', marginTop: 6, textAlign: 'center' }}>
        {playing ? 'Playing caller audio...' : progress > 0 ? 'Call ended' : 'Click play to hear the call'}
      </div>
    </div>
  );
}