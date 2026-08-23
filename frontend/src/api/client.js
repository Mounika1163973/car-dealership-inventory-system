const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Thin fetch wrapper that attaches the JWT (if present) and normalizes
 * error handling so callers can just `await request(...)`.
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = data?.error || data?.errors?.join(', ') || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  listVehicles: (token) => request('/vehicles', { token }),
  searchVehicles: (token, params) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
    ).toString();
    return request(`/vehicles/search${query ? `?${query}` : ''}`, { token });
  },
  createVehicle: (token, payload) => request('/vehicles', { method: 'POST', body: payload, token }),
  updateVehicle: (token, id, payload) => request(`/vehicles/${id}`, { method: 'PUT', body: payload, token }),
  deleteVehicle: (token, id) => request(`/vehicles/${id}`, { method: 'DELETE', token }),
  purchaseVehicle: (token, id, amount = 1) =>
    request(`/vehicles/${id}/purchase`, { method: 'POST', body: { amount }, token }),
  restockVehicle: (token, id, amount = 1) =>
    request(`/vehicles/${id}/restock`, { method: 'POST', body: { amount }, token }),
};

export default api;
