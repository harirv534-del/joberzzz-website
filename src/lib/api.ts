// Django REST client for the web version. Token is kept in sessionStorage; all authorization is enforced server-side.
const BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';
const KEY = 'joberzzz_api_token';
export const getToken = () => sessionStorage.getItem(KEY);
export const clearToken = () => sessionStorage.removeItem(KEY);

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as any) };
  const t = getToken();
  if (t) headers.Authorization = `Token ${t}`;
  if (opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw Object.assign(new Error(j.error || `Request failed (${res.status})`), { status: res.status });
  }
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const r = await api('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) });
  sessionStorage.setItem(KEY, r.token);
  return r.user;
}

// Fetch a protected file with the auth header and return a blob URL (never a public URL).
export async function fetchResumeBlob(appId: string, download = false) {
  const res = await fetch(`${BASE}/applications/${appId}/resume/${download ? '?download=1' : ''}`,
    { headers: { Authorization: `Token ${getToken()}` } });
  if (!res.ok) throw new Error('Resume not available or access denied.');
  return { url: URL.createObjectURL(await res.blob()), type: res.headers.get('Content-Type') || '' };
}
