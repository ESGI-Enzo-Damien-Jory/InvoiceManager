import type { Database } from './database'

export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type NewInvoiceItem =
    Database['public']['Tables']['invoice_items']['Insert']
export type UpdateInvoiceItem =
    Database['public']['Tables']['invoice_items']['Update']
