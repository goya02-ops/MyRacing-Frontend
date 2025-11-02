import { useState } from 'react';
import { logIn } from '../../../services/authService';

type LoginFormValues = {
  emailOrUsername: string;
  password: string;
};

export function useLoginForm({
  setLoading,
  setError,
  onSuccess,
}: {
  setLoading: (v: boolean) => void;
  setError: (msg: string) => void;
  onSuccess: (data: any) => void;
}) {
  const [form, setForm] = useState<LoginFormValues>({
    emailOrUsername: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.emailOrUsername || !form.password) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const data = await logIn(form);
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
