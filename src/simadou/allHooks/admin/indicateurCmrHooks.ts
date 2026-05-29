import { useQuery } from '@tanstack/react-query'
import { indicateurCmrService } from '@/simadou/allSercices/indicateurCmrService';

// Gardez votre hook existant pour les composants React
export const useGetIndicateurCmrs= () => {
  return useQuery({
    queryKey: ['indicateur-cmrs'],
    queryFn: () => indicateurCmrService.getAll()
  });
};

// Ajoutez cette fonction pour une utilisation en dehors des composants React
export const getIndicateurCmrs = async () => {
  const response = await indicateurCmrService.getAll();
  return response;
};
