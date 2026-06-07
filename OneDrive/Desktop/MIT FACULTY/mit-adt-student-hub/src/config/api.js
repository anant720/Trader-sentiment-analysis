const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

async function rawRequest(path, options = {}) {
  const token = localStorage.getItem('mit_hub_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });
}

export async function apiRequest(path, options = {}) {
  let response = await rawRequest(path, options);

  if (response.status === 401 && path !== '/auth/refresh' && path !== '/auth/logout') {
    const refreshRes = await rawRequest('/auth/refresh', { method: 'POST' });
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json().catch(() => ({}));
      if (refreshData.accessToken) {
        setAccessToken(refreshData.accessToken);
        response = await rawRequest(path, options);
      }
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem('mit_hub_access_token', token);
  } else {
    localStorage.removeItem('mit_hub_access_token');
  }
}

export default API_BASE_URL;
