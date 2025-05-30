import type { Database } from './database'

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type NewInvoice = Database['public']['Tables']['invoices']['Insert']
export type UpdateInvoice = Database['public']['Tables']['invoices']['Update']
