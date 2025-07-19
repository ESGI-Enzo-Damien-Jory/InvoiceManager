'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, FileText, Loader2, Plus, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { invoicesService, type CreateInvoicePayload } from '@/services/invoices'
import { getClients } from '@/services/clients'
import { fetchItems } from '@/services/items'
import { type Client, type Item } from '@inma/types'
import InvoiceForm from '@/components/custom/specialized/invoice-form-new'

export default function NewInvoicePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch clients and items
    const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
        queryKey: ['clients'],
        queryFn: getClients,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const { data: items = [], isLoading: itemsLoading, error: itemsError } = useQuery({
        queryKey: ['items'],
        queryFn: fetchItems,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Create invoice mutation
    const createInvoiceMutation = useMutation({
        mutationFn: (data: CreateInvoicePayload) => invoicesService.create(data),
        onSuccess: (invoice) => {
            toast.success('Invoice created successfully!')
            router.push(`/invoices/${invoice.id}`)
        },
        onError: (error: any) => {
            console.error('Failed to create invoice:', error)
            toast.error(error?.response?.data?.error || 'Failed to create invoice')
        },
    })

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true)
        try {
            const payload: CreateInvoicePayload = {
                client_id: formData.clientId,
                title: formData.title,
                total_amount: formData.total,
                expiration_date: formData.expirationDate,
                state: formData.state || 'Draft',
                items: formData.items.map((item: any) => ({
                    item_id: item.itemId,
                    quantity: item.quantity,
                    unit_price: item.price,
                })),
            }

            await createInvoiceMutation.mutateAsync(payload)
        } catch (error) {
            // Error is handled by the mutation
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push('/invoices')
    }

    if (clientsLoading || itemsLoading) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-24" />
                </div>
                
                <Card>
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

    if (clientsError || itemsError) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Invoices
                    </Button>
                </div>
                
                <Alert variant="destructive">
                    <AlertDescription>
                        {clientsError ? 'Failed to load clients' : 'Failed to load items'}. Please try refreshing the page.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Invoices
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
                        <p className="text-muted-foreground">
                            Create a professional invoice for your client
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Invoice Builder</span>
                </div>
            </div>

            {/* Main Form */}
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        New Invoice Details
                    </CardTitle>
                    <CardDescription>
                        Fill in the invoice information and add items to create your invoice
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InvoiceForm
                        clients={clients}
                        items={items}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
