// =============================================================================
// API TYPES - REQUESTS & RESPONSES
// =============================================================================

import type { Database } from '@inma/types'

// =============================================================================
// AUTHENTICATION
// =============================================================================

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

// =============================================================================
// CLIENTS
// =============================================================================

export interface CreateClientPayload {
    email: string
    first_name: string
    last_name: string
    address?: string | null
    phone_number?: string | null
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {}

export interface ClientFilters {
    search?: string
    email?: string
}

// =============================================================================
// ITEMS
// =============================================================================

export interface CreateItemPayload {
    name: string
    price: number
    avatar?: string
}

export interface UpdateItemPayload extends Partial<CreateItemPayload> {}

export interface ItemFilters {
    search?: string
    price_min?: number
    price_max?: number
}

// =============================================================================
// INVOICES
// =============================================================================

export interface CreateInvoicePayload {
    client_id: string
    title: string
    total_amount?: number
    expiration_date?: string
    state?: Database['public']['Enums']['invoice_state']
    items?: Array<{
        item_id: string
        quantity: number
        unit_price: number
    }>
}

export interface UpdateInvoicePayload extends Partial<CreateInvoicePayload> {
    state?: Database['public']['Enums']['invoice_state']
    items?: Array<{
        item_id: string
        quantity: number
        unit_price: number
    }>
}

export interface CreateInvoiceItemPayload {
    invoice_id: string
    item_id: string
    quantity?: number
    unit_price: number
}

export interface UpdateInvoiceItemPayload
    extends Partial<CreateInvoiceItemPayload> {}

export interface InvoiceFilters {
    client_id?: string
    state?: Database['public']['Enums']['invoice_state']
    date_from?: string
    date_to?: string
}

// =============================================================================
// INVOICE SETTINGS
// =============================================================================

export interface InvoiceSettings {
    prefix: string;
    next_number: number;
}

export interface UpdateInvoiceSettingsPayload {
    prefix?: string;
    reset_number?: boolean;
}

// =============================================================================
// PROFILES
// =============================================================================

export interface UpdateProfilePayload {
    display_name?: string
    phone_number?: string
}

// =============================================================================
// ENHANCED ENTITY TYPES
// =============================================================================

export interface InvoiceWithClient {
    id: string
    client_id: string
    created_at: string
    deleted_at: string | null
    expiration_date: string | null
    owner_id: string
    pdf_url: string | null
    state: Database['public']['Enums']['invoice_state']
    title: string
    total_amount: number | null
    updated_at: string
    client: Database['public']['Tables']['clients']['Row']
}

export interface InvoiceWithItems {
    id: string
    client_id: string
    created_at: string
    deleted_at: string | null
    expiration_date: string | null
    owner_id: string
    pdf_url: string | null
    state: Database['public']['Enums']['invoice_state']
    title: string
    total_amount: number | null
    updated_at: string
    invoice_items: (Database['public']['Tables']['invoice_items']['Row'] & {
        item: Database['public']['Tables']['items']['Row']
    })[]
}

export interface InvoiceComplete {
    id: string
    client_id: string
    created_at: string
    deleted_at: string | null
    expiration_date: string | null
    owner_id: string
    pdf_url: string | null
    state: Database['public']['Enums']['invoice_state']
    title: string
    total_amount: number | null
    updated_at: string
    client: Database['public']['Tables']['clients']['Row']
    invoice_items: (Database['public']['Tables']['invoice_items']['Row'] & {
        item: Database['public']['Tables']['items']['Row']
    })[]
}

// =============================================================================
// GENERIC API TYPES
// =============================================================================

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

export interface SuccessResponse<T = any> {
    message: string
    data?: T
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export type ValidatePayload<T> = {
    [K in keyof T]-?: T[K] extends string | undefined
        ? string
        : T[K] extends number | undefined
          ? number
          : T[K]
}
