import api from '@/lib/api'
import type {
    Invoice,
    InvoiceWithClient,
    CreateInvoicePayload,
    UpdateInvoicePayload,
    InvoiceFilters,
} from '@/types'

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
                Accept: 'application/pdf',
            },
        })
        return response.data
    },

    async generateSignedUrl(id: string): Promise<{ signed_url: string }> {
        const response = await api.post(`/invoices/share/${id}`)
        return response.data
    },

    // Generate PDF for an invoice
    async generatePdf(
        invoiceId: string
    ): Promise<{ message: string; pdf_url: string }> {
        const response = await api.post(`/invoices/${invoiceId}/generate-pdf`)
        return response.data
    },

    // Send invoice email
    async sendEmail(
        invoiceId: string,
        customMessage?: string
    ): Promise<{ message: string }> {
        const response = await api.post(`/invoices/${invoiceId}/send-email`, {
            customMessage,
        })
        return response.data
    },

    // Send invoice reminder
    async sendReminder(invoiceId: string): Promise<{ message: string }> {
        const response = await api.post(`/invoices/${invoiceId}/send-reminder`)
        return response.data
    },

    async getClient(clientId: string): Promise<any> {
        const response = await api.get(`/clients/${clientId}`)
        return response.data
    },
}


