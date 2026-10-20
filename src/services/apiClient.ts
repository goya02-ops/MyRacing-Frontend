export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

type RefreshSubscriber = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];
// Callback para manejar cuando el refresh token falla
let authFailureHandler: (() => void) | null = null;
export function setAuthFailureHandler(handler: (() => void) | null) {
  authFailureHandler = handler;
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
}

function onRefreshError(error: unknown) {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
}

function addRefreshSubscriber(subscriber: RefreshSubscriber) {
  refreshSubscribers.push(subscriber);
}

async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    authFailureHandler?.(); // ← llama al callback, no window.location
    throw new Error("Refresh token expired");
  }

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  return data.accessToken;
}

//No se usa pero puede ser útil más adelante
export function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = localStorage.getItem("accessToken");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        token = await refreshToken(); if (!token) throw new Error("No refresh token");
        isRefreshing = false;
        onRefreshed(token);

        headers["Authorization"] = `Bearer ${token}`;
        response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });
      } catch (error) {
        isRefreshing = false;
        onRefreshError(error);
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber({
          resolve: (token: string) => {
            headers["Authorization"] = `Bearer ${token}`;
            resolve(fetch(`${API_BASE_URL}${url}`, { ...options, headers }));
          },
          reject,
        });
      });
    }
  }

  return response;
}
