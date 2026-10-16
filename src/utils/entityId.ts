/**
 * Normalización de ids.
 *
 * A lo largo de la app un "id" puede llegar como el número a pelo o como la
 * entidad expandida (por ejemplo `CategoryVersion` en vez de `10`). Este es
 * el único punto donde se tolera esa ambigüedad, para que el resto del
 * código compare y guarde siempre números.
 */

/** Extrae el id numérico de un valor que puede ser una entidad o un id a pelo. */
export const toId = (value: unknown): number | undefined => {
  // typeof null === 'object', así que sin este guard null pasaría por "entidad".
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object') return (value as { id?: number }).id;
  return value as number;
};
