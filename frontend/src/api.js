const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

function getToken() { return localStorage.getItem('cyberguard_token'); }
function authHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }

async function request(method, path, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...authHeaders() } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { detail: raw || `Request failed with status ${res.status}` };
  }
  if (!res.ok) throw new Error(data.detail || `Request failed with status ${res.status}`);
  return data;
}

export const register = (u, p) => request('POST', '/auth/register', { username: u, password: p }).then(d => { localStorage.setItem('cyberguard_token', d.access_token); return d; });
export const login = (u, p) => request('POST', '/auth/login', { username: u, password: p }).then(d => { localStorage.setItem('cyberguard_token', d.access_token); return d; });
export const getMe = () => request('GET', '/auth/me');
export const generateScenario = (difficulty, useAi, category) => request('POST', '/scenarios/generate', { difficulty, use_ai: useAi, category });
export const submitAnswer = (scenarioId, action, timeTaken) => request('POST', '/scenarios/submit', { scenario_id: scenarioId, action, time_taken: timeTaken });
export const getLeaderboard = () => request('GET', '/leaderboard');
export const getStats = () => request('GET', '/stats');
export const getThreats = () => request('GET', '/threats');
export const logout = () => localStorage.removeItem('cyberguard_token');
export const isLoggedIn = () => !!getToken();
