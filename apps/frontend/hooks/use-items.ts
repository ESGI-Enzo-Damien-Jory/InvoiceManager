import { useQuery } from '@tanstack/react-query'
import { fetchItems } from '@/services/items'
import { Item } from '@/types/items'

/**
 * Hook for fetching protected items.
 * React Query will handle caching/loading/error states.
 */
export function useItems() {
    return useQuery<Item[], Error>({
        queryKey: ['items'],
        queryFn: fetchItems,
        retry: 1, // retry once on failure
        staleTime: 1000 * 60 * 5, // keep data fresh for 5 minutes
    })
}
