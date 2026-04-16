import { useState, useEffect, useRef } from 'react';
import * as api from './api';

const DIFF = {
  Easy:   { bg: '#e8f5e9', color: '#2e7d32', pts: 10 },
  Medium: { bg: '#fff3e0', color: '#e65100', pts: 20 },
  Hard:   { bg: '#fce4ec', color: '#c62828', pts: 35 },
};

const ACTIONS = [
  { id: 'report', label: 'Report threat',        desc: 'Flag as malicious', icon: '⚑' },
  { id: 'verify', label: 'Verify sender',        desc: 'Confirm legitimacy', icon: '?' },
  { id: 'ignore', label: 'Delete it',            desc: 'Remove from inbox',  icon: '×' },
  { id: 'comply', label: 'Follow instructions',  desc: 'Do what it says',    icon: '→' },
];

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [useAi, setUseAi] = useState(true);

  useEffect(() => {
    if (api.isLoggedIn()) {
      api.getMe()
        .then(u => { setUser(u); setPage('home'); })
        .catch(() => { api.logout(); });
    }
  }, []);

  const handleAuth = (userData) => {
    setUser(userData.user);
    setPage('home');
    setError('');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setPage('login');
  };

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {}
  };

  if (page === 'login') {
    return <AuthPage onAuth={handleAuth} error={error} setError={setError} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <NavBar user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        {page === 'home' && <HomePage user={user} setPage={setPage} difficulty={difficulty} setDifficulty={setDifficulty} useAi={useAi} setUseAi={setUseAi} />}
        {page === 'scenario' && <ScenarioPage user={user} setPage={setPage} refreshUser={refreshUser} difficulty={difficulty} useAi={useAi} />}
        {page === 'leaderboard' && <LeaderboardPage user={user} />}
        {page === 'stats' && <StatsPage />}
      </div>
    </div>
  );
}


// ── NAV ──

function NavBar({ user, page, setPage, onLogout }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 28px', borderBottom: '1px solid #eee', background: '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setPage('home')}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>C</div>
        <span style={{ fontWeight: 600, fontSize: 16 }}>CyberGuard</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { id: 'home', label: 'Home' },
          { id: 'leaderboard', label: 'Leaderboard' },
          { id: 'stats', label: 'Stats' },
        ].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: page === n.id ? '#f0f0f0' : 'transparent',
            color: page === n.id ? '#1a1a1a' : '#888',
            fontSize: 13, fontWeight: 500,
          }}>{n.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ background: '#f5f0e8', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#8b6914' }}>
          {user?.score || 0} pts
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 600,
        }}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <button onClick={onLogout} style={{
          padding: '6px 12px', borderRadius: 6, border: '1px solid #eee',
          background: '#fff', color: '#888', fontSize: 12,
        }}>Logout</button>
      </div>
    </div>
  );
}


// ── AUTH ──

function AuthPage({ onAuth, error, setError }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const data = await fn(username.trim(), password);
      onAuth(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5' }}>
      <div style={{ width: 380, padding: 40, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1a1a1a', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>C</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.5px' }}>CyberGuard</h1>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 32px' }}>
          {mode === 'login' ? 'Sign in to continue training' : 'Create your account'}
        </p>

        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 10,
            fontSize: 15, outline: 'none', marginBottom: 10, boxSizing: 'border-box', background: '#fff',
          }}
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%', padding: '14px 16px', border: '1.5px solid #e0e0e0', borderRadius: 10,
            fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fff',
          }}
        />

        {error && (
          <p style={{ color: '#c62828', fontSize: 13, marginBottom: 10 }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading || !username.trim() || !password.trim()} style={{
          width: '100%', padding: 14, borderRadius: 10, border: 'none',
          background: username.trim() && password.trim() ? '#1a1a1a' : '#e0e0e0',
          color: username.trim() && password.trim() ? '#fff' : '#aaa',
          fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p style={{ marginTop: 16, fontSize: 13, color: '#888' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: '#1a1a1a', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}


// ── HOME ──

function HomePage({ user, setPage, difficulty, setDifficulty, useAi, setUseAi }) {

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Welcome back, {user?.username}</h2>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Analyze suspicious emails. Spot the red flags. Build your score.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Score', val: user?.score || 0, color: '#8b6914' },
          { label: 'Accuracy', val: user?.total_scenarios > 0 ? `${Math.round((user.correct_answers / user.total_scenarios) * 100)}%` : '—', color: '#2e7d32' },
          { label: 'Streak', val: user?.streak || 0, color: '#c62828' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Start a scenario</h3>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Difficulty</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Easy', 'Medium', 'Hard'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                border: difficulty === d ? `2px solid ${DIFF[d].color}` : '1.5px solid #eee',
                background: difficulty === d ? DIFF[d].bg : '#fff',
                color: difficulty === d ? DIFF[d].color : '#999',
                fontSize: 13, fontWeight: 600,
              }}>
                {d} <span style={{ fontSize: 11, fontWeight: 400 }}>({DIFF[d].pts}pts)</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scenario source</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setUseAi(true)} style={{
              flex: 1, padding: '12px 8px', borderRadius: 8,
              border: useAi ? '2px solid #1a1a1a' : '1.5px solid #eee',
              background: useAi ? '#f5f5f5' : '#fff',
              color: useAi ? '#1a1a1a' : '#999',
              fontSize: 13, fontWeight: 600, textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>✨</span>
                <span>AI Generated</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 400, color: '#999', marginTop: 2 }}>Unique every time</div>
            </button>
            <button onClick={() => setUseAi(false)} style={{
              flex: 1, padding: '12px 8px', borderRadius: 8,
              border: !useAi ? '2px solid #1a1a1a' : '1.5px solid #eee',
              background: !useAi ? '#f5f5f5' : '#fff',
              color: !useAi ? '#1a1a1a' : '#999',
              fontSize: 13, fontWeight: 600, textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>📋</span>
                <span>Standard</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 400, color: '#999', marginTop: 2 }}>Pre-built scenarios</div>
            </button>
          </div>
        </div>

        <button onClick={() => setPage('scenario')} style={{
          width: '100%', padding: 14, borderRadius: 10, border: 'none',
          background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 600,
        }}>
          Begin scenario
        </button>
      </div>
    </>
  );
}


// ── SCENARIO ──

function ScenarioPage({ user, setPage, refreshUser, difficulty, useAi }) {
  const [scenario, setScenario] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shuffledActions, setShuffledActions] = useState(ACTIONS);
  const startTime = useRef(Date.now());

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const loadScenario = async () => {
    setLoading(true);
    setSelected(null);
    setResult(null);
    startTime.current = Date.now();
    try {
      const s = await api.generateScenario(difficulty, useAi);
      setScenario(s);
      // Shuffle the options that came from the backend
      const opts = s.options && s.options.length > 0 ? s.options : ACTIONS;
      setShuffledActions(shuffleArray(opts));
    } catch (e) {
      console.error('Failed to load scenario:', e);
    }
    setLoading(false);
  };

  useEffect(() => { loadScenario(); }, []);

  const handleSubmit = async () => {
    if (!selected || !scenario) return;
    setSubmitting(true);
    try {
      const timeTaken = (Date.now() - startTime.current) / 1000;
      const res = await api.submitAnswer(scenario.id, selected, timeTaken);
      setResult(res);
      refreshUser();
    } catch (e) {
      console.error('Submit failed:', e);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
          {useAi ? 'Generating AI scenario...' : 'Loading scenario...'}
        </div>
        <p style={{ fontSize: 13 }}>
          {useAi ? 'AI is crafting a unique threat for you' : 'Preparing a standard scenario'}
        </p>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: '#888' }}>Failed to load scenario.</p>
        <button onClick={loadScenario} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 8, border: '1px solid #eee', background: '#fff', fontSize: 13 }}>
          Try again
        </button>
      </div>
    );
  }

  // ── RESULT VIEW ──
  if (result) {
    return (
      <>
        <div style={{
          textAlign: 'center', padding: '32px 24px', background: '#fff',
          border: '1px solid #eee', borderRadius: 14, marginBottom: 20,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
            background: result.correct ? '#e8f5e9' : '#fce4ec',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: result.correct ? '#2e7d32' : '#c62828',
          }}>
            {result.correct ? '✓' : '✗'}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
            {result.correct ? 'Correct!' : 'Not quite'}
          </h2>
          <p style={{ color: '#888', fontSize: 14, margin: '0 0 4px' }}>
            The right action was: <strong>{(scenario?.options?.find(a => a.id === result.correct_action) || ACTIONS.find(a => a.id === result.correct_action))?.label || result.correct_action}</strong>
          </p>
          {result.correct && (
            <span style={{ fontSize: 13, color: '#8b6914', fontWeight: 600 }}>+{result.points_earned} points</span>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px' }}>Red flags to spot</h3>
          {result.red_flags?.map((f, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 0',
              borderTop: i > 0 ? '1px solid #f5f5f5' : 'none',
            }}>
              <span style={{ color: '#e65100', fontSize: 10, marginTop: 4, flexShrink: 0 }}>●</span>
              <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPage('home')} style={{
            flex: 1, padding: 14, borderRadius: 10, border: '1px solid #eee',
            background: '#fff', fontSize: 14, fontWeight: 500, color: '#666',
          }}>Back to home</button>
          <button onClick={loadScenario} style={{
            flex: 2, padding: 14, borderRadius: 10, border: 'none',
            background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 600,
          }}>Next scenario</button>
        </div>
      </>
    );
  }

  // ── SCENARIO VIEW ──
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 600,
          background: DIFF[scenario.difficulty]?.bg, color: DIFF[scenario.difficulty]?.color,
        }}>{scenario.difficulty}</span>
        <span style={{ fontSize: 12, color: '#999' }}>{scenario.type}</span>
        <button onClick={() => setPage('home')} style={{
          marginLeft: 'auto', fontSize: 12, color: '#999', background: 'none', border: 'none',
        }}>← Back</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{scenario.subject}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: '#c62828',
            }}>
              {scenario.sender_name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{scenario.sender_name}</div>
              <div style={{ fontSize: 12, color: '#c62828', fontFamily: 'monospace' }}>{scenario.sender_email}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 24, fontSize: 14, lineHeight: 1.8, color: '#444', whiteSpace: 'pre-wrap' }}>
          {scenario.body}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          What would you do?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {shuffledActions.map((a, idx) => {
            const icons = ['◆', '◉', '◈', '◇'];
            return (
              <button key={a.id} onClick={() => setSelected(a.id)} style={{
                padding: '14px 16px', borderRadius: 10, textAlign: 'left',
                border: selected === a.id ? '2px solid #1a1a1a' : '1.5px solid #eee',
                background: selected === a.id ? '#f5f5f5' : '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center', color: '#888', marginTop: 2 }}>{icons[idx % 4]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{a.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <button onClick={handleSubmit} disabled={submitting} style={{
          width: '100%', padding: 14, borderRadius: 10, border: 'none',
          background: '#1a1a1a', color: '#fff', fontSize: 15, fontWeight: 600,
          opacity: submitting ? 0.7 : 1,
        }}>
          {submitting ? 'Submitting...' : 'Submit answer'}
        </button>
      )}
    </>
  );
}


// ── LEADERBOARD ──

function LeaderboardPage({ user }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard().then(setBoard).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Leaderboard</h2>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 24px' }}>Top analysts ranked by score</p>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</p>
      ) : board.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
          <p style={{ color: '#999', fontSize: 14 }}>No entries yet. Complete scenarios to get on the board!</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, overflow: 'hidden' }}>
          {board.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 20px',
              borderBottom: i < board.length - 1 ? '1px solid #f5f5f5' : 'none',
              background: entry.username === user?.username ? '#fafaf5' : 'transparent',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, marginRight: 14,
                background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#fef0e1' : '#f5f5f5',
                color: i === 0 ? '#92400e' : i === 1 ? '#475569' : i === 2 ? '#9a3412' : '#999',
              }}>{entry.rank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {entry.username}
                  {entry.username === user?.username && <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}> (you)</span>}
                </div>
                <div style={{ fontSize: 11, color: '#999' }}>{entry.accuracy}% accuracy · {entry.total_scenarios} scenarios</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#8b6914' }}>{entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}


// ── STATS ──

function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</p>;
  if (!stats) return <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Failed to load stats</p>;

  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Your stats</h2>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 24px' }}>Performance breakdown</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { l: 'Score', v: stats.score, c: '#8b6914' },
          { l: 'Completed', v: stats.total, c: '#1a1a1a' },
          { l: 'Correct', v: stats.correct, c: '#2e7d32' },
          { l: 'Accuracy', v: stats.total > 0 ? `${stats.accuracy}%` : '—', c: '#1565c0' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {Object.keys(stats.by_difficulty).length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By difficulty</h3>
          {['Easy', 'Medium', 'Hard'].filter(d => stats.by_difficulty[d]).map(d => {
            const data = stats.by_difficulty[d];
            const pct = Math.round((data.correct / data.total) * 100);
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, width: 60, color: DIFF[d].color }}>{d}</span>
                <div style={{ flex: 1, height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: DIFF[d].color, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#444', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(stats.by_type).length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By attack type</h3>
          {Object.entries(stats.by_type).map(([type, d]) => {
            const pct = Math.round((d.correct / d.total) * 100);
            return (
              <div key={type} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid #f5f5f5',
              }}>
                <span style={{ fontSize: 13, color: '#444' }}>{type}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 70 ? '#2e7d32' : '#e65100' }}>
                  {pct}% ({d.correct}/{d.total})
                </span>
              </div>
            );
          })}
        </div>
      )}

      {stats.total === 0 && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: 14 }}>Complete some scenarios to see your breakdown</p>
        </div>
      )}
    </>
  );
}
