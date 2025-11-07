import { useEntityQuery } from '../../../hooks/useEntityQuery.ts'; 
import { Simulator, Category, Circuit } from '../../../types/entities.ts';

export function useCombinationDependencies() {

  const { list: allSimulators, isLoading: isLoadingSims } = useEntityQuery(Simulator as any);

  const simulators = (allSimulators as Simulator[]).filter((s: Simulator) => s.status === 'Activo');

  const { list: categories, isLoading: isLoadingCats } = useEntityQuery(Category as any);

  const { list: circuits, isLoading: isLoadingCircs } = useEntityQuery(Circuit as any);
  
  const loadingDependencies = isLoadingSims || isLoadingCats || isLoadingCircs;

  return { 
    simulators, 
    categories: categories as Category[], 
    circuits: circuits as Circuit[],     
    loadingDependencies 
  };
}
