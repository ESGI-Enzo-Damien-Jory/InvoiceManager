import type { Database } from './database'

export type Item = Database['public']['Tables']['items']['Row']
export type NewItem = Database['public']['Tables']['items']['Insert']
export type UpdateItem = Database['public']['Tables']['items']['Update']
