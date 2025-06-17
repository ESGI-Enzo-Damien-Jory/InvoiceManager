import api from '@/lib/api'
import { Item } from '@inma/types'

export interface CreateItemPayload {
    name: string
    price: number
    avatarHex?: string | null
}

export interface UpdateItemPayload {
    name?: string
    price?: number
    avatarHex?: string | null
}

/** Fetch all items. Browser automatically sends auth cookie. */
export async function fetchItems(): Promise<Item[]> {
    const response = await api.get<Item[]>('/items')
    return response.data
}

/** Fetch a single item by ID */
export async function fetchItemById(id: string): Promise<Item> {
    const response = await api.get<Item>(`/items/${id}`)
    return response.data
}

/** Create a new item, passing JSON or bytea hex for avatar. */
export async function createItem(payload: {
    name: string
    price: number
    avatarHex?: string | null
}): Promise<Item> {
    const response = await api.post<Item>('/items', payload)
    return response.data
}

/** Update an existing item */
export async function updateItem(
    id: string,
    payload: {
        name?: string
        price?: number
        avatarHex?: string | null
    }
): Promise<Item> {
    const response = await api.put<Item>(`/items/${id}`, payload)
    return response.data
}

/** Delete an item (soft delete) */
export async function deleteItem(id: string): Promise<{ deleted: boolean }> {
    const response = await api.delete<{ deleted: boolean }>(`/items/${id}`)
    return response.data
}
