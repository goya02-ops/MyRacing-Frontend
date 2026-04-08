import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../../../components/tremor/TremorComponents.tsx';

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Solicitud de recuperación para:', email);
      setSuccess(true);
    } catch (err) {
      setError('Error al procesar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md bg-gray-950/20 backdrop-blur-lg border border-gray-700/50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Email enviado</h2>
          <p className="text-gray-400 mb-6">
            Si existe una cuenta asociada a ese email, recibirás las instrucciones para recuperar tu contraseña.
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Volver al login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-gray-950/20 backdrop-blur-lg border border-gray-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Recuperar contraseña</h2>
        <p className="text-gray-400 mb-6">
          Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="bg-gray-800 border-gray-700 text-gray-100"
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
              Volver al login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
