import { useState } from 'react';
import { signIn } from '../services/authService';

type SignInFormValues = {
  userName: string;
  realName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function useSignIn({
  setLoading,
  setError,
  onSuccess,
}: {
  setLoading: (v: boolean) => void;
  setError: (msg: string) => void;
  onSuccess: (data: any) => void;
}) {
  const [form, setForm] = useState<SignInFormValues>({
    userName: '',
    realName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateForm = () => {
    if (!form.userName || !form.realName || !form.email) {
      return 'Todos los campos son obligatorios';
    }
    if (form.password !== form.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    if (form.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const data = await signIn(form);
      onSuccess(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  return { form, handleChange, handleSubmit };
}
