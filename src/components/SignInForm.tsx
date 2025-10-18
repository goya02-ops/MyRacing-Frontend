import { Button, Input } from './tremor/TremorComponents.tsx';

type Props = {
  form: {
    userName: string;
    realName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  loading: boolean;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function SignInForm({
  form,
  loading,
  error,
  onChange,
  onSubmit,
}: Props) {
  if (error) console.log(error);
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error && <div className="text-red-600">{error}</div>}

      <div>
        <Input
          name="userName"
          value={form.userName}
          onChange={onChange}
          placeholder="Username"
          className="mt-2"
        />
      </div>

      <div>
        <Input
          name="realName"
          value={form.realName}
          onChange={onChange}
          placeholder="Nombre real"
          className="mt-2"
        />
      </div>

      <div>
        <Input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="mt-2"
        />
      </div>

      <div>
        <Input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Contraseña"
          className="mt-2"
        />
      </div>

      <div>
        <Input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={onChange}
          placeholder="Confirmar contraseña"
          className="mt-2"
        />
      </div>

      <Button type="submit" disabled={loading} className="mt-4 w-full">
        {loading ? 'Registrando...' : 'Crear Cuenta'}
      </Button>
    </form>
  );
}
