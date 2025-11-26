import { Membership } from '../types/entities.ts';
import { entityMetaByClass } from '../types/entityMeta.ts';
import { fetchWithAuth } from './apiClient.ts';

export async function fetchCurrentMembership(): Promise<Membership> {
  const metadata = entityMetaByClass.get(Membership);
  if (!metadata) throw new Error('Metadatos de Membership no encontrados');

  const res = await fetchWithAuth(`${metadata.endpoint}/current_membership`);

  if (!res.ok) {
    throw new Error('No se pudo obtener el precio de la membresía');
  }

  const json = await res.json();

  return json.data;
}

export async function createPaymentPreference(): Promise<{
  preferenceId: string;
}> {
  const res = await fetchWithAuth(`/payment/create-preference`, {
    method: 'POST',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'No se pudo crear la preferencia de pago');
  }

  return res.json();
}

export async function processPayment(formData: any): Promise<any> {
  const res = await fetchWithAuth(`/payment/process-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error.message || 'Error al procesar el pago. (Error de red/servidor)'
    );
  }

  return res.json();
}
