import type { Database } from './database'

export type ClientRow = Database['public']['Tables']['clients']['Row']

export interface Client extends ClientRow {
    total_invoices: number
    total_revenue: number
    unpaid_amount: number
    status: 'Active' | 'Inactive'
}
