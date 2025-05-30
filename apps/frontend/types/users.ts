import type { Database } from './database'

export type User = Database['public']['Tables']['users']['Row']
export type NewUser = Database['public']['Tables']['users']['Insert']
export type UpdateUser = Database['public']['Tables']['users']['Update']
