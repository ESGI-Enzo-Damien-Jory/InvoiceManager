import {
    useMutation,
    useQuery,
    useQueryClient,
    UseMutationResult,
    UseQueryResult,
} from '@tanstack/react-query'
import {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    DeleteClientResponse,
} from '@/services/clients'
import type { Client, CreateClientPayload, UpdateClientPayload } from '@/types'

/** --------------------------------------------- **
 * 1) Query hooks for data fetching
 ** --------------------------------------------- **/

/**
 * Hook: useClients
 * Fetches all clients for the authenticated user
 */
export function useClients(): UseQueryResult<Client[], Error> {
    return useQuery<Client[], Error>({
        queryKey: ['clients'],
        queryFn: () => getClients(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    })
}

/**
 * Hook: useClient
 * Fetches a single client by ID
 */
export function useClient(
    clientId: string,
    enabled: boolean = true
): UseQueryResult<Client, Error> {
    return useQuery<Client, Error>({
        queryKey: ['client', clientId],
        queryFn: () => getClient(clientId),
        enabled: enabled && !!clientId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    })
}

/** --------------------------------------------- **
 * 2) Mutation hooks for data modification
 ** --------------------------------------------- **/

/**
 * Hook: useCreateClient
 * Creates a new client
 */
export function useCreateClient(): {
    mutate: (
        payload: CreateClientPayload,
        options?: {
            onSuccess?: (data: Client[]) => void
            onError?: (error: unknown) => void
        }
    ) => void
    mutateAsync: (payload: CreateClientPayload) => Promise<Client[]>
    isPending: boolean
    isError: boolean
    isSuccess: boolean
    error: Error | null
    reset: () => void
} {
    const queryClient = useQueryClient()

    const mutation: UseMutationResult<
        Client[],
        Error,
        CreateClientPayload,
        unknown
    > = useMutation({
        mutationFn: (payload: CreateClientPayload) => createClient(payload),

        onSuccess: (data: Client[]) => {
            // Invalidate clients list to refetch all clients
            queryClient.invalidateQueries({ queryKey: ['clients'] })

            // Set the new client in cache if we have the ID
            if (data && data.length > 0) {
                const newClient = data[0]
                queryClient.setQueryData(['client', newClient.id], newClient)
            }
        },

        onError: (error: Error) => {
            console.error(
                '[useCreateClient] Create client failed:',
                error.message
            )
        },
    })

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

/**
 * Hook: useUpdateClient
 * Updates an existing client
 */
export function useUpdateClient(): {
    mutate: (
        variables: { clientId: string; payload: UpdateClientPayload },
        options?: {
            onSuccess?: (data: Client[]) => void
            onError?: (error: unknown) => void
        }
    ) => void
    mutateAsync: (variables: {
        clientId: string
        payload: UpdateClientPayload
    }) => Promise<Client[]>
    isPending: boolean
    isError: boolean
    isSuccess: boolean
    error: Error | null
    reset: () => void
} {
    const queryClient = useQueryClient()

    const mutation: UseMutationResult<
        Client[],
        Error,
        { clientId: string; payload: UpdateClientPayload },
        unknown
    > = useMutation({
        mutationFn: ({ clientId, payload }) => updateClient(clientId, payload),

        onSuccess: (data: Client[], variables) => {
            // Invalidate clients list to refetch all clients
            queryClient.invalidateQueries({ queryKey: ['clients'] })

            // Update the specific client in cache if we have the updated data
            if (data && data.length > 0) {
                const updatedClient = data[0]
                queryClient.setQueryData(
                    ['client', variables.clientId],
                    updatedClient
                )
            }
        },

        onError: (error: Error) => {
            console.error(
                '[useUpdateClient] Update client failed:',
                error.message
            )
        },
    })

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}

/**
 * Hook: useDeleteClient
 * Soft deletes a client
 */
export function useDeleteClient(): {
    mutate: (
        clientId: string,
        options?: {
            onSuccess?: (data: DeleteClientResponse) => void
            onError?: (error: unknown) => void
        }
    ) => void
    mutateAsync: (clientId: string) => Promise<DeleteClientResponse>
    isPending: boolean
    isError: boolean
    isSuccess: boolean
    error: Error | null
    reset: () => void
} {
    const queryClient = useQueryClient()

    const mutation: UseMutationResult<
        DeleteClientResponse,
        Error,
        string,
        unknown
    > = useMutation({
        mutationFn: (clientId: string) => deleteClient(clientId),

        onSuccess: (_, clientId) => {
            // Remove the client from cache
            queryClient.removeQueries({ queryKey: ['client', clientId] })

            // Invalidate clients list to refetch (since it's soft delete,
            // the client should disappear from the list)
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        },

        onError: (error: Error) => {
            console.error(
                '[useDeleteClient] Delete client failed:',
                error.message
            )
        },
    })

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        error: mutation.error ?? null,
        reset: mutation.reset,
    }
}
