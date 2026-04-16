const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

function getToken() {
  return localStorage.getItem('cyberguard_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Request failed');
  }
  return data;
}

export async function register(username, password) {
  const data = await request('POST', '/auth/register', { username, password });
  localStorage.setItem('cyberguard_token', data.access_token);
  return data;
}

export async function login(username, password) {
  const data = await request('POST', '/auth/login', { username, password });
  localStorage.setItem('cyberguard_token', data.access_token);
  return data;
}

export async function getMe() {
  return request('GET', '/auth/me');
}

export async function generateScenario(difficulty) {
  return request('POST', '/scenarios/generate', { difficulty });
}

export async function submitAnswer(scenarioId, action, timeTaken) {
  return request('POST', '/scenarios/submit', {
    scenario_id: scenarioId,
    action,
    time_taken: timeTaken,
  });
}

export async function getLeaderboard() {
  return request('GET', '/leaderboard');
}

export async function getStats() {
  return request('GET', '/stats');
}

export function logout() {
  localStorage.removeItem('cyberguard_token');
}

export function isLoggedIn() {
  return !!getToken();
}
