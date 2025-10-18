import { Link, useNavigate } from 'react-router-dom';
import { RiFlagFill } from '@remixicon/react';

import { useState } from 'react';
import { useSignIn } from '../hooks/useSignInForm.ts';

import { SignInForm } from '../components/SignInForm.tsx';
import { Card } from '../components/tremor/Card.tsx';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const signIn = useSignIn({
    setLoading,
    setError,
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('token', data.token);
      navigate('/login');
    },
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 lg:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <RiFlagFill
          className="mx-auto size-10 text-gray-900 dark:text-gray-50"
          aria-hidden={true}
        />
        <h3 className="mt-6 text-center text-lg font-bold text-gray-900 dark:text-gray-50">
          Crear una cuenta para MyRacing
        </h3>
        <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <SignInForm
            form={signIn.form}
            onChange={signIn.handleChange}
            onSubmit={signIn.handleSubmit}
            loading={loading}
            error={error}
          />
        </Card>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-500">
          ¿Ya tenés una cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-500 hover:text-blue-600 dark:text-blue-500 hover:dark:text-blue-600"
          >
            Ingresa aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
