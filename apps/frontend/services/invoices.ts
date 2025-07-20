import api from '@/lib/api'
import { Row } from '@inma/types'

export type Invoice = Row<'invoices'> & {
    clients: {
        id: string
        first_name: string
        last_name: string
        email: string
        address: string | null
        phone_number: string | null
    }
}

export type InvoiceItem = {
    id: string
    invoice_id: string
    item_id: string
    quantity: number
    unit_price: number
    items: {
        name: string
        price: number
    }
}

export type CreateInvoicePayload = {
    client_id: string
    title: string
    total_amount?: number
    expiration_date?: string
    state?: 'Draft' | 'Sent'
    items?: any[]
}

export type UpdateInvoicePayload = {
    client_id?: string
    title?: string
    total_amount?: number
    expiration_date?: string
    state?: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
    items?: any[]
}

export const invoicesService = {
    async getAll(): Promise<Invoice[]> {
        const response = await api.get('/invoices')
        return response.data
    },

    async getById(id: string): Promise<Invoice> {
        const response = await api.get(`/invoices/${id}`)
        return response.data
    },

    async getItems(id: string): Promise<InvoiceItem[]> {
        const response = await api.get(`/invoices/${id}/items`)
        return response.data
    },

    async create(data: CreateInvoicePayload): Promise<Invoice> {
        const response = await api.post('/invoices', data)
        return response.data
    },

    async update(id: string, data: UpdateInvoicePayload): Promise<Invoice> {
        const response = await api.put(`/invoices/${id}`, data)
        return response.data
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/invoices/${id}`)
    },

    async downloadPdf(id: string): Promise<Blob> {
        const response = await api.get(`/invoices/pdf/${id}`, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/pdf'
            }
        })
        return response.data
    },

    async generateSignedUrl(id: string): Promise<{ signed_url: string }> {
        const response = await api.post(`/invoices/share/${id}`)
        return response.data
    },

    // Generate PDF for an invoice
    async generatePdf(invoiceId: string): Promise<{ message: string; pdf_url: string }> {
      const response = await api.post(`/invoices/${invoiceId}/generate-pdf`)
      return response.data
    }
} 