import { useQuery } from '@tanstack/react-query'
import { uniteIndicateurService } from '@/simadou/allSercices/uniteIndicateurService';

// Gardez votre hook existant pour les composants React
export const useGetUniteIndicateurs = () => {
  return useQuery({
    queryKey: ['unite-indicateurs'],
    queryFn: () => uniteIndicateurService.getAll()
  });
};

// Ajoutez cette fonction pour une utilisation en dehors des composants React
export const getUniteIndicateurs = async () => {
  const response = await uniteIndicateurService.getAll();
  return response;
};
