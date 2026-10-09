// Backend base URL (Render). Local dev me khali rahega, to Vite proxy use hoga.
const BASE = import.meta.env.VITE_API_URL || '';

// Fetch wrapper: attaches JWT, supports JSON and FormData (file uploads)
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const isForm = body instanceof FormData;
  const res = await fetch(BASE + '/api' + path, {
    method,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// Uploaded images/videos ke liye helper
export const fileUrl = (p) => (p && p.startsWith('/') ? BASE + p : p);
