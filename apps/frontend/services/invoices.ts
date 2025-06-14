import api from '@/lib/api'

export interface InvoiceItem {
    item_id: string
    quantity: number
    unit_price: number
}

export interface CreateInvoicePayload {
    client_id: string
    title: string
    total_amount: number
    expiration_date?: string
    state: 'Draft' | 'Sent' | 'Paid'
    items: InvoiceItem[]
}

export interface UpdateInvoicePayload {
    client_id?: string
    title?: string
    total_amount?: number
    expiration_date?: string
    state?: 'Draft' | 'Sent' | 'Paid'
    items?: InvoiceItem[]
}

export interface Invoice {
    id: string
    client_id: string
    title: string
    total_amount: number
    expiration_date: string | null
    state: 'Draft' | 'Sent' | 'Paid'
    owner_id: string
    pdf_url: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
    clients: {
        id: string
        first_name: string
        last_name: string
        email: string
        address: string | null
        phone_number: string | null
    }
}

/** Fetch all invoices. Browser automatically sends auth cookie. */
export async function fetchInvoices(): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>('/invoices')
    return response.data
}

/** Fetch a single invoice by ID */
export async function fetchInvoiceById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`)
    return response.data
}

/** Create a new invoice */
export async function createInvoice(
    payload: CreateInvoicePayload
): Promise<Invoice> {
    const response = await api.post<Invoice>('/invoices', payload)
    return response.data
}

/** Update an existing invoice */
export async function updateInvoice(
    id: string,
    payload: UpdateInvoicePayload
): Promise<Invoice> {
    const response = await api.put<Invoice>(`/invoices/${id}`, payload)
    return response.data
}

/** Update invoice state only */
export async function updateInvoiceState(
    id: string,
    state: 'Draft' | 'Sent' | 'Paid'
): Promise<Invoice> {
    const response = await api.put<Invoice>(`/invoices/${id}`, { state })
    return response.data
}

/** Delete an invoice (soft delete) */
export async function deleteInvoice(id: string): Promise<{ deleted: boolean }> {
    const response = await api.delete<{ deleted: boolean }>(`/invoices/${id}`)
    return response.data
}

/** Download invoice PDF */
export async function downloadInvoicePdf(id: string): Promise<Blob> {
    const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob',
    })
    return response.data
}

/** Get invoice preview URL */
export async function getInvoicePreview(
    id: string
): Promise<{ pdf_url: string }> {
    const response = await api.get<{ pdf_url: string }>(
        `/invoices/${id}/preview`
    )
    return response.data
}

/** Generate signed URL for invoice */
export async function generateInvoiceSignedUrl(
    id: string,
    options?: {
        expiresIn?: number
        download?: boolean
        filename?: string
    }
): Promise<{
    signed_url: string
    expires_at: string
    expires_in_seconds: number
}> {
    const response = await api.post(`/invoices/${id}/signed-url`, options || {})
    return response.data
}
