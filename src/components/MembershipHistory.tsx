import type { Membership } from '../types/entities.ts';

interface Props {
  memberships: Membership[];
}

export default function MembershipHistory({ memberships }: Props) {
  const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString();

  const formatTime = (value: Date | string) =>
    new Date(value).toLocaleTimeString();

  return (
    <>
      <h3>📜 Historial de valores</h3>
      <table>
        <thead>
          <tr>
            <th>📅 Fecha</th>
            <th>⏱️ Hora</th>
            <th>💰 Precio</th>
          </tr>
        </thead>
        <tbody>
          {[...memberships].reverse().map((m) => (
            <tr key={m.id}>
              <td>{formatDate(m.dateFrom)}</td>
              <td>{formatTime(m.dateFrom)}</td>
              <td>${m.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
