import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
} from '@/services/items'
import { Item } from '@/types/items'

/**
 * Hook for fetching all items.
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

/**
 * Hook for fetching a single item by ID.
 */
export function useItem(id: string) {
    return useQuery<Item, Error>({
        queryKey: ['items', id],
        queryFn: () => fetchItemById(id),
        retry: 1,
        staleTime: 1000 * 60 * 5,
        enabled: !!id, // only fetch if id is provided
    })
}

/**
 * Hook for creating a new item.
 */
export function useCreateItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            // Invalidate and refetch items list
            queryClient.invalidateQueries({ queryKey: ['items'] })
        },
        onError: (error) => {
            console.error('Failed to create item:', error)
        },
    })
}

/**
 * Hook for updating an existing item.
 */
export function useUpdateItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: {
                name?: string
                price?: number
                avatarHex?: string | null
            }
        }) => updateItem(id, payload),
        onSuccess: (updatedItem) => {
            // Update the items list cache
            queryClient.invalidateQueries({ queryKey: ['items'] })
            // Update the specific item cache
            queryClient.setQueryData(['items', updatedItem.id], updatedItem)
        },
        onError: (error) => {
            console.error('Failed to update item:', error)
        },
    })
}

/**
 * Hook for deleting an item.
 */
export function useDeleteItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteItem,
        onSuccess: (_, deletedId) => {
            // Remove from items list cache
            queryClient.invalidateQueries({ queryKey: ['items'] })
            // Remove the specific item cache
            queryClient.removeQueries({ queryKey: ['items', deletedId] })
        },
        onError: (error) => {
            console.error('Failed to delete item:', error)
        },
    })
}
