//Comentarios sobre lo que hace luego descartar si es necesario
/**
 * Formatea una fecha/hora a un string localizado (ej. 'DD/MM/AAAA HH:MM').
 * @param value La fecha o string de fecha.
 * @returns La fecha/hora formateada o un mensaje de error/N/A.
 */
export const formatDateTime = (value: Date | string | undefined | null): string => {
  if (!value) return 'N/A';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error de formato';
  }
};