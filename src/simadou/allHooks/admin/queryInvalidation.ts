import type { QueryClient, QueryKey } from '@tanstack/react-query'

/** Invalide puis refetch les requêtes actives (listes visibles derrière un modal inclus). */
export async function invalidateAndRefetch(
  queryClient: QueryClient,
  queryKey: QueryKey
) {
  await queryClient.invalidateQueries({ queryKey })
  await queryClient.refetchQueries({ queryKey, type: 'active' })
}
