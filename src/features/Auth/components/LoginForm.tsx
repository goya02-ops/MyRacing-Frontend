import { Link } from 'react-router-dom';
import { Button, Input } from '../../../components/tremor/TremorComponents.tsx';
import { useMinimumLoading } from '../../../hooks/useMinimumLoading.ts';

type Props = {
  form: { emailOrUsername: string; password: string };
  loading: boolean;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  errorClassName?: string;
};

export function LoginForm({
  form,
  loading,
  error,
  onChange,
  onSubmit,
  errorClassName = 'text-red-600',
}: Props) {
  const visibleLoading = useMinimumLoading(loading, 300);
  return (
    <form onSubmit={onSubmit} className="space-y-4 w-full">
      {error && <div className={errorClassName}>{error}</div>}

      <Input
        type="text"
        id="emailOrUsername"
        name="emailOrUsername"
        value={form.emailOrUsername}
        onChange={onChange}
        autoComplete="username"
        placeholder="Email o username"
        className="mt-2"
      />

      <Input
        type="password"
        id="password"
        name="password"
        value={form.password}
        onChange={onChange}
        autoComplete="current-password"
        placeholder="Contraseña"
        className="mt-2"
      />

      <Button type="submit" className="mt-4 w-full" isLoading={visibleLoading}>
        {visibleLoading ? 'Cargando...' : 'Iniciar sesión'}
      </Button>

      <div className="text-center mt-4 pt-2">
        <Link
          to="/password-recovery"
          className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
}
