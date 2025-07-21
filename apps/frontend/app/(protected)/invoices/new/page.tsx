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
import { invoicesService } from '@/services/invoices'
import { getClients } from '@/services/clients'
import { fetchItems } from '@/services/items'
import type { CreateInvoicePayload, Client, Item } from '@/types'
import InvoiceForm from '@/components/custom/specialized/invoice-form-new'
import LoadingState from '@/components/custom/states/loading-state'
import ErrorState from '@/components/custom/states/error-state'

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
        return <LoadingState message="Loading form data…" />
    }

    if (clientsError || itemsError) {
        return (
            <ErrorState
                message={clientsError?.message || itemsError?.message || 'Failed to load form data'}
                onRetry={() => window.location.reload()}
            />
        )
    }

    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Invoices
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create New Invoice</h1>
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Invoice Details
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
