import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLoginForm } from '../hooks/useLoginForm';
import { useSignIn } from '../hooks/useSignInForm';

interface AuthFormLogic {
  form: any; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  error: string;
}

interface AuthPageLogic {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  loginLogic: AuthFormLogic;
  signInLogic: AuthFormLogic;
  handleLoginSubmit: (e: React.FormEvent) => void;
  handleSignInSubmit: (e: React.FormEvent) => void;
  successMessage: string;
}

export function useAuthPageLogic(): AuthPageLogic {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [successMessage, setSuccessMessage] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const login = useLoginForm({
    setLoading: setLoginLoading,
    setError: setLoginError,
    onSuccess: (data: any) => { 
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.data);
      navigate('/');
    },
  });

  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const signIn = useSignIn({
    setLoading: setSignInLoading,
    setError: setSignInError,
    onSuccess: () => {
      setSuccessMessage('¡Registro exitoso! Por favor, inicia sesión.');
      setIsActive(false);
      setLoginError('');
    },
  });

  const handleLoginSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSuccessMessage('');
    login.handleSubmit(e);
  }, [login]);

  const handleSignInSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMessage('');
    signIn.handleSubmit(e);
  }, [signIn]);

  return {
    isActive,
    setIsActive,
    handleLoginSubmit,
    handleSignInSubmit,
    successMessage,
    loginLogic: {
        form: login.form,
        onChange: login.handleChange,
        loading: loginLoading,
        error: loginError || successMessage,
    },
    signInLogic: {
        form: signIn.form,
        onChange: signIn.handleChange,
        loading: signInLoading,
        error: signInError,
    },
  };
}