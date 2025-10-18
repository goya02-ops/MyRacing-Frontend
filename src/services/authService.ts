export async function logIn(payload: {
  emailOrUsername: string;
  password: string;
}) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión');
  return data;
}

export async function signIn(payload: {
  userName: string;
  realName: string;
  email: string;
  password: string;
}) {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, type: 'common' }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al registrarse');
  return data;
}
