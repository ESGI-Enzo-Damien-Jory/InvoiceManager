import api from '@/lib/api'
import { Client } from '@inma/types'

/**
 * Payload for creating a new client (matches your controller's request.only())
 */
export interface CreateClientPayload {
    first_name: string
    last_name: string
    email: string
    phone_number?: string | null
    address?: string | null
}

/**
 * Payload for updating an existing client (same fields as create)
 */
export interface UpdateClientPayload {
    first_name?: string
    last_name?: string
    email?: string
    phone_number?: string | null
    address?: string | null
}

/**
 * Response from deleting a client (matches your controller)
 */
export interface DeleteClientResponse {
    deleted: boolean
}

/** --------------------------------------------- **
 * 2) Client CRUD operations
 ** --------------------------------------------- **/

/**
 * GET /api/clients
 * - Retrieves all clients for the authenticated user
 * - Returns: Client[] array
 */
export async function getClients(): Promise<Client[]> {
    const response = await api.get<Client[]>('/clients')
    return response.data
}

/**
 * GET /api/clients/:id
 * - Retrieves a single client by ID
 * - Returns: Client entity
 */
export async function getClient(clientId: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/${clientId}`)
    return response.data
}

/**
 * POST /api/clients
 * - Creates a new client
 * - Returns: Client[] array (as per your controller)
 */
export async function createClient(
    payload: CreateClientPayload
): Promise<Client[]> {
    const response = await api.post<Client[]>('/clients', payload)
    return response.data
}

/**
 * PUT /api/clients/:id
 * - Updates an existing client
 * - Returns: Client[] array (as per your controller)
 */
export async function updateClient(
    clientId: string,
    payload: UpdateClientPayload
): Promise<Client[]> {
    const response = await api.put<Client[]>(`/clients/${clientId}`, payload)
    return response.data
}

/**
 * DELETE /api/clients/:id
 * - Soft deletes a client by ID
 * - Returns: DeleteClientResponse with deleted boolean
 */
export async function deleteClient(
    clientId: string
): Promise<DeleteClientResponse> {
    const response = await api.delete<DeleteClientResponse>(
        `/clients/${clientId}`
    )
    return response.data
}
