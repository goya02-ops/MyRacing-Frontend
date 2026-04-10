import { Membership } from "../types/entities.ts";
import { entityMetaByClass } from "../types/entityMeta.ts";
import { fetchWithAuth } from "./apiClient.ts";
import { API_ROUTES } from "./apiRoutes";

// Para errores de pago
export interface PaymentError extends Error {
  paymentId?: string;
  status?: string;
}

// Respuesta del proceso de pago
export interface PaymentResult {
  paymentId: string;
  status: string;
  [key: string]: unknown;
}

// Estado de pago (para checkPaymentStatus)
export interface PaymentStatus {
  paymentId: string;
  status: "pending" | "approved" | "rejected" | string;
  [key: string]: unknown;
}

// Datos del formulario de pago
export interface PaymentFormData {
  membershipId: number;
  [key: string]: unknown;
}

export async function fetchCurrentMembership(): Promise<Membership> {
  const metadata = entityMetaByClass.get(Membership);
  if (!metadata) throw new Error("Metadatos de Membership no encontrados");

  const res = await fetchWithAuth(`${metadata.endpoint}/current_membership`);

  if (!res.ok) {
    throw new Error("No se pudo obtener el precio de la membresía");
  }

  const json = await res.json();

  return json.data;
}

export async function createPaymentPreference(): Promise<{
  preferenceId: string;
}> {
  const res = await fetchWithAuth(API_ROUTES.PAYMENT.CREATE_PREFERENCE, {
    method: "POST",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "No se pudo crear la preferencia de pago");
  }

  return res.json();
}

export async function processPayment(
  formData: PaymentFormData,
): Promise<PaymentResult> {
  const res = await fetchWithAuth(API_ROUTES.PAYMENT.PROCESS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const errorData = await res.json();

    const customError = new Error(
      errorData.message || "Error al procesar el pago.",
    ) as PaymentError;
    customError.paymentId = errorData.paymentId;
    customError.status = errorData.status;

    throw customError;
  }

  const data = await res.json();
  return data as PaymentResult;
}

export async function checkPaymentStatus(
  paymentId: string,
): Promise<PaymentStatus> {
  const res = await fetchWithAuth(API_ROUTES.PAYMENT.CHECK_STATUS(paymentId));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al verificar el pago.");
  }
  const data = await res.json();
  return data as PaymentStatus;
}
