// Error de API con el status HTTP adjunto, para poder mapear la causa
// (401/404/409/500) a un mensaje útil sin rebotar el número crudo al usuario.
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Extrae un mensaje amigable del body de error (JSON con `message`) y, si no
// es parseable, devuelve el fallback. Nunca expone el status ni el body crudo.
export async function errorMessageFrom(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    if (body?.message) return body.message;
  } catch {
    // El body de error no es JSON parseable: se conserva el mensaje por defecto.
  }
  return fallback;
}

export async function throwApiError(
  res: Response,
  fallback: string,
): Promise<never> {
  throw new ApiError(res.status, await errorMessageFrom(res, fallback));
}

// Lee el status de un error de forma segura (duck-typing), para no depender de
// `instanceof` (frágil ante mocks/módulos duplicados).
export function errorStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}
