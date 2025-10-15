export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('accessToken');
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('No hay refresh token disponible');
    }

    const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (refreshResponse.ok) {
      const { accessToken: newAccessToken } = await refreshResponse.json();
      localStorage.setItem('accessToken', newAccessToken);
      
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`
        }
      });
    } else {
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
  }

  return response;
}