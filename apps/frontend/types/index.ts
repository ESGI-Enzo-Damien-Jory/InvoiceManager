import type { Database } from '@inma/types'

// Database types from packages
export type {
    Database,
    Tables,
    Row,
    Insert,
    Update,
    Enums,
    CompositeTypes,
} from '@inma/types'

// Core entity types
export type {
    Client,
    Item,
    Invoice,
    InvoiceItem,
    UserProfile,
} from '@inma/types'

// API & Service types
export * from './api'
export * from './forms'
export * from './ui'
export * from './business'

// Table columns
export * from './columns'

// Re-export commonly used types for convenience
export type InvoiceState = Database['public']['Enums']['invoice_state']
export type Json = Database['public']['Tables']['clients']['Row']['address']

// =============================================================================
// COMMONLY USED TYPE ALIASES
// =============================================================================

// Database table types
export type ClientsTable = Database['public']['Tables']['clients']['Row']
export type ItemsTable = Database['public']['Tables']['items']['Row']
export type InvoicesTable = Database['public']['Tables']['invoices']['Row']
export type InvoiceItemsTable =
    Database['public']['Tables']['invoice_items']['Row']
export type ProfilesTable = Database['public']['Tables']['profiles']['Row']

// Database insert types
export type ClientsInsert = Database['public']['Tables']['clients']['Insert']
export type ItemsInsert = Database['public']['Tables']['items']['Insert']
export type InvoicesInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceItemsInsert =
    Database['public']['Tables']['invoice_items']['Insert']
export type ProfilesInsert = Database['public']['Tables']['profiles']['Insert']

// Database update types
export type ClientsUpdate = Database['public']['Tables']['clients']['Update']
export type ItemsUpdate = Database['public']['Tables']['items']['Update']
export type InvoicesUpdate = Database['public']['Tables']['invoices']['Update']
export type InvoiceItemsUpdate =
    Database['public']['Tables']['invoice_items']['Update']
export type ProfilesUpdate = Database['public']['Tables']['profiles']['Update']
