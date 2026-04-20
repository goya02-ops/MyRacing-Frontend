import { useState, type FormEvent } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Button,
  Input,
  Card,
} from "../../../components/tremor/TremorComponents.tsx";
import { fetchWithAuth } from "../../../services/apiClient.ts";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md bg-gray-950/20 backdrop-blur-lg border border-gray-700/50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Token inválido
          </h2>
          <p className="text-gray-400 mb-6">
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <Link to="/password-recovery">
            <Button variant="secondary" className="w-full">
              Solicitar nuevo enlace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await fetchWithAuth("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Error al restablecer la contraseña");
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Error al procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md bg-gray-950/20 backdrop-blur-lg border border-gray-700/50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Contraseña actualizada
          </h2>
          <p className="text-gray-400 mb-6">
            Tu contraseña ha sido restablecida exitosamente. Serás redirigido al
            login...
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Ir al login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-gray-950/20 backdrop-blur-lg border border-gray-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Nueva contraseña
        </h2>
        <p className="text-gray-400 mb-6">
          Ingresa tu nueva contraseña y confirmationala.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-400 text-sm">{error}</div>}

          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            required
            autoComplete="new-password"
            className="bg-gray-800 border-gray-700 text-gray-100"
          />

          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            required
            autoComplete="new-password"
            className="bg-gray-800 border-gray-700 text-gray-100"
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            {loading ? "Procesando..." : "Restablecer contraseña"}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              Volver al login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
