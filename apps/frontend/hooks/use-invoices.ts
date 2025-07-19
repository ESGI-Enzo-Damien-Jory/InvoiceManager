import { useState, useEffect, useCallback } from 'react'
import { invoicesService, type Invoice } from '@/services/invoices'

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await invoicesService.getAll()
            setInvoices(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch invoices')
        } finally {
            setLoading(false)
        }
    }, [])

    const createInvoice = useCallback(async (data: any) => {
        try {
            const newInvoice = await invoicesService.create(data)
            setInvoices(prev => [newInvoice, ...prev])
            return newInvoice
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create invoice')
            throw err
        }
    }, [])

    const updateInvoice = useCallback(async (id: string, data: any) => {
        try {
            const updatedInvoice = await invoicesService.update(id, data)
            setInvoices(prev => prev.map(invoice => 
                invoice.id === id ? updatedInvoice : invoice
            ))
            return updatedInvoice
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update invoice')
            throw err
        }
    }, [])

    const deleteInvoice = useCallback(async (id: string) => {
        try {
            await invoicesService.delete(id)
            setInvoices(prev => prev.filter(invoice => invoice.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete invoice')
            throw err
        }
    }, [])

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

    return {
        invoices,
        loading,
        error,
        fetchInvoices,
        createInvoice,
        updateInvoice,
        deleteInvoice
    }
} 