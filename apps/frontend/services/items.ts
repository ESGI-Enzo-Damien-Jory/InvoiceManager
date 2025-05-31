import api from '@/lib/api'
import { Item } from '@/types/items'

/** Fetch all items. Browser automatically sends auth cookie. */
export async function fetchItems(): Promise<Item[]> {
    const response = await api.get<Item[]>('/items')
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
