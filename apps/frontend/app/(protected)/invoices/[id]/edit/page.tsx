'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, FileText, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { invoicesService, type UpdateInvoicePayload } from '@/services/invoices'
import { getClients } from '@/services/clients'
import { fetchItems } from '@/services/items'
import { type Client, type Item } from '@inma/types'
import InvoiceForm from '@/components/custom/specialized/invoice-form-new'

export default function EditInvoicePage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const invoiceId = params.id as string
    
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch invoice data
    const { data: invoice, isLoading: invoiceLoading, error: invoiceError } = useQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: () => invoicesService.getById(invoiceId),
        enabled: !!invoiceId,
    })

    // Fetch invoice items
    const { data: invoiceItems = [], isLoading: itemsLoading, error: itemsError } = useQuery({
        queryKey: ['invoice-items', invoiceId],
        queryFn: () => invoicesService.getItems(invoiceId),
        enabled: !!invoiceId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Fetch clients and items
    const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
        queryKey: ['clients'],
        queryFn: getClients,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const { data: items = [], isLoading: allItemsLoading, error: allItemsError } = useQuery({
        queryKey: ['items'],
        queryFn: fetchItems,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Update invoice mutation
    const updateInvoiceMutation = useMutation({
        mutationFn: (data: UpdateInvoicePayload) => invoicesService.update(invoiceId, data),
        onSuccess: (invoice) => {
            // Invalidate and refetch the invoice data
            queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
            queryClient.invalidateQueries({ queryKey: ['invoice-items', invoiceId] })
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            
            toast.success('Invoice updated successfully!')
            router.push(`/invoices/${invoiceId}`)
        },
        onError: (error: any) => {
            console.error('Failed to update invoice:', error)
            toast.error(error?.response?.data?.error || 'Failed to update invoice')
        },
    })

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true)
        try {
            const payload: UpdateInvoicePayload = {
                client_id: formData.clientId,
                title: formData.title,
                total_amount: formData.total,
                expiration_date: formData.expirationDate,
                state: formData.state,
                items: formData.items.map((item: any) => ({
                    item_id: item.itemId,
                    quantity: item.quantity,
                    unit_price: item.price,
                })),
            }

            await updateInvoiceMutation.mutateAsync(payload)
        } catch (error) {
            // Error is handled by the mutation
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push(`/invoices/${invoiceId}`)
    }

    // Prepare initial values for the form
    const getInitialValues = () => {
        if (!invoice) return null

        // Convert invoice items to form format
        const formItems = invoiceItems.length > 0 
            ? invoiceItems.map(item => ({
                itemId: item.item_id,
                quantity: item.quantity,
                price: item.unit_price,
            }))
            : [{ itemId: '', quantity: 1, price: 0 }]

        // Map state to form-compatible values
        const formState = invoice.state === 'Draft' || invoice.state === 'Sent' 
            ? invoice.state 
            : 'Draft'

        return {
            title: invoice.title,
            clientId: invoice.client_id,
            expirationDate: invoice.expiration_date ? new Date(invoice.expiration_date) : undefined,
            state: formState,
            items: formItems,
        }
    }

    if (invoiceLoading || itemsLoading || clientsLoading || allItemsLoading) {
        return (
            <div className="flex flex-col gap-6 p-6 pt-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-24" />
                </div>
                
                <Card className="w-full">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <Skeleton className="h-64 w-full" />
                        <div className="flex justify-end gap-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (invoiceError || itemsError || clientsError || allItemsError || !invoice) {
        return (
            <div className="flex flex-col gap-6 p-6 pt-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Invoice
                    </Button>
                </div>
                
                <Alert variant="destructive">
                    <AlertDescription>
                        {invoiceError?.message || itemsError?.message || clientsError?.message || allItemsError?.message || 'Invoice not found'}. Please try refreshing the page.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    const initialValues = getInitialValues()

    // Check if invoice can be edited
    if (invoice.state !== 'Draft') {
        return (
            <div className="flex flex-col gap-6 p-6 pt-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Invoice
                    </Button>
                </div>
                
                <Alert variant="destructive">
                    <AlertDescription>
                        This invoice is in <strong>{invoice.state}</strong> state and cannot be edited. 
                        Only Draft invoices can be modified.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6 pt-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Invoice
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Invoice</h1>
                        <p className="text-muted-foreground">
                            Update invoice details and items
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Invoice Editor</span>
                </div>
            </div>

            {/* Main Form */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Edit Invoice Details
                    </CardTitle>
                    <CardDescription>
                        Update the invoice information and modify items as needed
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {initialValues && (
                        <InvoiceForm
                            clients={clients}
                            items={items}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            onCancel={handleCancel}
                            initialValues={initialValues}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 