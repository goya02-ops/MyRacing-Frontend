import type { Membership } from '../../../types/entities';
import { Badge } from '../../../components/tremor/TremorComponents';

interface Props {
  memberships: Membership[];
}

export default function MembershipHistory({ memberships }: Props) {
  // Combinamos las funciones de formato
  const formatDateTime = (value: Date | string) => {
    const date = new Date(value);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
  
    <div className="space-y-2">
     
      <div className="hidden md:flex text-sm font-semibold text-gray-400 pb-2 px-4 border-b border-gray-700/50">
        <div className="w-1/2">📅 Fecha y Hora de Vigencia</div>
        <div className="w-1/2 text-right">💰 Precio</div>
      </div>

     
      <div className="space-y-2">
       
        {[...memberships].reverse().map((m) => (
          <div
            key={m.id}
            className="flex flex-col md:flex-row items-start md:items-center py-4 px-4 hover:bg-gray-900/50 rounded-lg border-b border-gray-700/50"
          >
           
            <div className="w-full md:w-1/2 mb-2 md:mb-0 font-medium">
              {formatDateTime(m.dateFrom)} hs
            </div>

           
            <div className="w-full md:w-1/2 flex justify-start md:justify-end">
              <Badge variant="neutral" className="text-base">
                ${m.price}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}