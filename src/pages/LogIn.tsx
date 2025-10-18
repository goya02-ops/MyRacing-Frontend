import { Link } from 'react-router-dom';

import { useState } from 'react';
import { useLoginForm } from '../hooks/useLoginForm.ts';

import { LoginForm } from '../components/LoginForm.tsx';
import { Button, Card } from '../components/tremor/TremorComponents.tsx';
import { RiCarLine } from '@remixicon/react';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useLoginForm({
    setLoading,
    setError,
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    },
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 lg:px-6">
      <Card className="sm:mx-auto sm:w-full sm:max-w-sm">
        <RiCarLine
          className="mx-auto size-10 text-gray-900 dark:text-gray-50"
          aria-hidden={true}
        />
        <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-50">
          Bienvenido a MyRacing
        </h3>
        <LoginForm
          form={login.form}
          onChange={login.handleChange}
          onSubmit={login.handleSubmit}
          loading={loading}
          error={error}
        />
        <Link to="/signin">
          <Button className="w-full mt-4" variant="secondary">
            Registrarse
          </Button>
        </Link>
      </Card>
    </div>
  );
}
