import type { Database } from './database'

export type InvoiceHistory =
    Database['public']['Tables']['invoice_history']['Row']
export type NewInvoiceHistory =
    Database['public']['Tables']['invoice_history']['Insert']
export type UpdateInvoiceHistory =
    Database['public']['Tables']['invoice_history']['Update']
