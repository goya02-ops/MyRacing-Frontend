import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginRegister() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ emailOrUsername: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    userName: '', realName: '', email: '', password: '', confirmPassword: ''
  });

  const handleAuth = async (e: React.FormEvent, endpoint: string, data: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones para registro
    if (endpoint === 'register') {
      if (data.password !== data.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
      if (data.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpoint === 'register' ? { ...data, type: 'Común' } : data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Error');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(result.data));
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);

      navigate(result.data.type === 'Admin' ? '/user-admin' : '/');
    } catch {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <section>
      <div>
        <button onClick={() => { setMode('login'); setError(''); }}>Iniciar Sesión</button>
        <button onClick={() => { setMode('register'); setError(''); }}>Registrarse</button>
      </div>

      {error && <div>{error}</div>}

      {mode === 'login' ? (
        <form onSubmit={(e) => handleAuth(e, 'login', loginForm)}>
          <h2>Iniciar Sesión</h2>
          <input
            type="text"
            placeholder="Email o Usuario"
            value={loginForm.emailOrUsername}
            onChange={(e) => setLoginForm({ ...loginForm, emailOrUsername: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => handleAuth(e, 'register', registerForm)}>
          <h2>Registrarse</h2>
          <input
            type="text"
            placeholder="Nombre de Usuario"
            value={registerForm.userName}
            onChange={(e) => setRegisterForm({ ...registerForm, userName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Nombre Real"
            value={registerForm.realName}
            onChange={(e) => setRegisterForm({ ...registerForm, realName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
      )}
    </section>
  );
}