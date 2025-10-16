const API_BASE_URL = 'http://localhost:3000/api';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Refresh token expired');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...options.headers as Record<string, string>,
};

if (token) {
  headers['Authorization'] = `Bearer ${token}`; 
}

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Si el token expiró, intentar renovarlo
  if (response.status === 401 || response.status === 403) {
    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        const newToken = await refreshToken();
        isRefreshing = false;
        onRefreshed(newToken);
        
        // Reintentar la petición original con el nuevo token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });
      } catch (error) {
        isRefreshing = false;
        throw error;
      }
    } else {
      // Esperar a que se complete el refresh
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          headers['Authorization'] = `Bearer ${token}`;
          resolve(fetch(`${API_BASE_URL}${url}`, { ...options, headers }));
        });
      });
    }
  }

  return response;
}

export function getStoredUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

export function isAdmin() {
  const user = getStoredUser();
  return user && user.type === 'Admin';
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  }
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}