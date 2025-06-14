import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    updateInvoiceState,
    deleteInvoice,
    downloadInvoicePdf,
    getInvoicePreview,
    generateInvoiceSignedUrl,
    type CreateInvoicePayload,
    type UpdateInvoicePayload,
    type Invoice,
} from '@/services/invoices'

/**
 * Hook for fetching all invoices.
 */
export function useInvoices() {
    return useQuery<Invoice[], Error>({
        queryKey: ['invoices'],
        queryFn: fetchInvoices,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook for fetching a single invoice by ID.
 */
export function useInvoice(id: string) {
    return useQuery<Invoice, Error>({
        queryKey: ['invoices', id],
        queryFn: () => fetchInvoiceById(id),
        retry: 1,
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    })
}

/**
 * Hook for creating a new invoice.
 */
export function useCreateInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
        onError: (error) => {
            console.error('Failed to create invoice:', error)
        },
    })
}

/**
 * Hook for updating an existing invoice.
 */
export function useUpdateInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateInvoicePayload
        }) => updateInvoice(id, payload),
        onSuccess: (updatedInvoice) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            queryClient.setQueryData(
                ['invoices', updatedInvoice.id],
                updatedInvoice
            )
        },
        onError: (error) => {
            console.error('Failed to update invoice:', error)
        },
    })
}

/**
 * Hook for updating invoice state only.
 */
export function useUpdateInvoiceState() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            state,
        }: {
            id: string
            state: 'Draft' | 'Sent' | 'Paid'
        }) => updateInvoiceState(id, state),
        onSuccess: (updatedInvoice) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            queryClient.setQueryData(
                ['invoices', updatedInvoice.id],
                updatedInvoice
            )
        },
        onError: (error) => {
            console.error('Failed to update invoice state:', error)
        },
    })
}

/**
 * Hook for deleting an invoice.
 */
export function useDeleteInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteInvoice,
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            queryClient.removeQueries({ queryKey: ['invoices', deletedId] })
        },
        onError: (error) => {
            console.error('Failed to delete invoice:', error)
        },
    })
}

/**
 * Hook for downloading invoice PDF.
 */
export function useDownloadInvoicePdf() {
    return useMutation({
        mutationFn: downloadInvoicePdf,
        onSuccess: (blob, invoiceId) => {
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `invoice-${invoiceId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        },
        onError: (error) => {
            console.error('Failed to download invoice PDF:', error)
        },
    })
}

/**
 * Hook for getting invoice preview.
 */
export function useInvoicePreview(id: string) {
    return useQuery({
        queryKey: ['invoices', id, 'preview'],
        queryFn: () => getInvoicePreview(id),
        retry: 1,
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    })
}

/**
 * Hook for generating signed URL.
 */
export function useGenerateInvoiceSignedUrl() {
    return useMutation({
        mutationFn: ({
            id,
            options,
        }: {
            id: string
            options?: {
                expiresIn?: number
                download?: boolean
                filename?: string
            }
        }) => generateInvoiceSignedUrl(id, options),
        onError: (error) => {
            console.error('Failed to generate signed URL:', error)
        },
    })
}
