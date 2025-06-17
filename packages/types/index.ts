import { Database } from './database.types'

export * from './database.types'

export type Tables = Database['public']['Tables']
export type Row<T extends keyof Tables> = Tables[T]['Row']
export type Insert<T extends keyof Tables> = Tables[T]['Insert']
export type Update<T extends keyof Tables> = Tables[T]['Update']

export type Client = Database['public']['Tables']['clients']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type UserProfile = Database['public']['Tables']['profiles']['Row']

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    email: string
    password: string
    display_name: string
}

export interface ResetPasswordPayload {
    email: string
}

export interface UpdateProfilePayload {
    display_name?: string
    phone_number?: string
}

export interface AuthResponse {
    message: string
}

export interface RegisterResponse extends AuthResponse {
    user?: any
}

export interface SessionData {
    access_token: string
    refresh_token: string
    expires_at: number
    user_id: string
}

export interface CreateClientPayload {
    email: string
    first_name: string
    last_name: string
    address?: string
    phone_number?: string
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {}

export interface CreateItemPayload {
    name: string
    price: number
    avatar?: string
}

export interface UpdateItemPayload extends Partial<CreateItemPayload> {}

export interface CreateInvoicePayload {
    client_id: string
    title: string
    expiration_date?: string
}

export interface UpdateInvoicePayload extends Partial<CreateInvoicePayload> {
    state?: Database['public']['Enums']['invoice_state']
}

export interface CreateInvoiceItemPayload {
    item_id: string
    quantity?: number
    unit_price: number
}

export interface UpdateInvoiceItemPayload
    extends Partial<CreateInvoiceItemPayload> {}

export interface InvoiceWithClient extends Invoice {
    client: Client
}

export interface InvoiceWithItems extends Invoice {
    invoice_items: (InvoiceItem & { item: Item })[]
}

export interface InvoiceComplete extends Invoice {
    client: Client
    invoice_items: (InvoiceItem & { item: Item })[]
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    has_more: boolean
}

export interface ErrorResponse {
    error: string
    code?: string
}

export interface ClientFilters {
    search?: string
    email?: string
}

export interface InvoiceFilters {
    client_id?: string
    state?: Database['public']['Enums']['invoice_state']
    date_from?: string
    date_to?: string
}

export interface ItemFilters {
    search?: string
    price_min?: number
    price_max?: number
}

export type ValidatePayload<T> = {
    [K in keyof T]-?: T[K] extends string | undefined
        ? string
        : T[K] extends number | undefined
          ? number
          : T[K]
}
