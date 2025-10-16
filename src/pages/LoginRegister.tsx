import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginRegister.module.css';

type Mode = 'login' | 'register';

export default function LoginRegister() {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  // Formulario de Login
  const [loginForm, setLoginForm] = useState({
    emailOrUsername: '',
    password: '',
  });

  // Formulario de Register
  const [registerForm, setRegisterForm] = useState({
    userName: '',
    realName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      // Guarda usuario y TOKENS en localStorage
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Redirige según tipo de usuario
      if (data.data.type === 'Admin' || data.data.type === 'admin') {
        navigate('/user-admin');
      } else {
        navigate('/'); // O la página principal del usuario
      }
    } catch (error) {
      console.log(error);
      setError('Error de conexión. Intente nuevamente.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!agreeTerms) {
      setError('Debes aceptar los Términos y Condiciones.');
      setLoading(false);
      return;
    }

    // Validaciones
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError('Email inválido');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: registerForm.userName,
          realName: registerForm.realName,
          email: registerForm.email,
          password: registerForm.password,
          type: 'Común', //Iniciamos siempre como usuario común
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al registrarse');
        setLoading(false);
        return;
      }

      // Registro exitoso - guardar token y cambiar a login
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('token', data.token);

      setMode('login'); // Cambia a modo login después de un registro exitoso
      setError('');
      setRegisterForm({
        userName: '',
        realName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');

      // Esperamos a que el usuario inicie sesión
    } catch (error) {
      console.log(error);
      setError('Error de conexión. Intente nuevamente.');
      setLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>
        {mode === 'login' ? 'Iniciar Sesión' : 'Crear una cuenta'}
      </h1>

      {mode === 'login' ? (
        <p className={styles.switchModeText}>
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={styles.switchModeButton}
          >
            Regístrate aquí
          </button>
        </p>
      ) : (
        <p className={styles.switchModeText}>
          ¿Ya tienes una cuenta?{' '}
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={styles.switchModeButton}
          >
            Inicia Sesión
          </button>
        </p>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>
            <input
              type="text"
              name="emailOrUsername"
              value={loginForm.emailOrUsername}
              onChange={handleLoginChange}
              placeholder="Email o Nombre de usuario"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Contraseña"
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePasswordButton}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className={styles.form}>
          <label className={styles.label}>
            <input
              type="text"
              name="userName"
              value={registerForm.userName}
              onChange={handleRegisterChange}
              placeholder="Nombre de Usuario"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <input
              type="text"
              name="realName"
              value={registerForm.realName}
              onChange={handleRegisterChange}
              placeholder="Nombre Real"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <input
              type="email"
              name="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              placeholder="Email"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="Contraseña"
                required
                minLength={6}
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePasswordButton}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <label className={styles.label}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              placeholder="Confirmar Contraseña"
              required
              minLength={6}
              className={styles.input}
            />
          </label>

          <div className={styles.termsContainer}>
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="agreeTerms" className={styles.termsText}>
              Acepto los{' '}
              <a href="/terms" className={styles.termsLink}>
                Términos y Condiciones
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
      )}
    </section>
  );
}
