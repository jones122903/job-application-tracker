const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

async function request(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}/api/applications${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const details = Array.isArray(data?.errors) ? data.errors.join(' ') : '';
    throw new Error([data?.message || `Request failed (${response.status}).`, details].filter(Boolean).join(' '));
  }
  if (data === null) throw new Error('The server returned an unexpected response.');
  return data;
}

export const listApplications = signal => request('', { signal });
export const createApplication = data => request('', { method: 'POST', body: JSON.stringify(data) });
export const updateApplication = (id, data) => request(`/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteApplication = id => request(`/${id}`, { method: 'DELETE' });
