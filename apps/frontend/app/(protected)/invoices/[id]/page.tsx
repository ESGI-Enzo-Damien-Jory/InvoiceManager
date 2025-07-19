'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { format, isAfter } from 'date-fns'
import { 
    ArrowLeft, 
    Download, 
    Share2, 
    Edit, 
    Trash2, 
    FileText, 
    Calendar, 
    User, 
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useInvoice, useInvoiceActions } from '@/hooks/use-invoices'
import { invoicesService } from '@/services/invoices'
import { toast } from 'sonner'
import LoadingState from '@/components/custom/states/loading-state'
import ErrorState from '@/components/custom/states/error-state'

const getStatusConfig = (state: string, expirationDate?: string | null) => {
    const now = new Date()
    const isExpired = expirationDate && isAfter(now, new Date(expirationDate))
    
    switch (state) {
        case 'Draft':
            return {
                label: 'Draft',
                variant: 'secondary' as const,
                icon: FileText,
            }
        case 'Sent':
            if (isExpired) {
                return {
                    label: 'Overdue',
                    variant: 'destructive' as const,
                    icon: AlertCircle,
                }
            }
            return {
                label: 'Sent',
                variant: 'default' as const,
                icon: Clock,
            }
        case 'Paid':
            return {
                label: 'Paid',
                variant: 'default' as const,
                icon: CheckCircle,
            }
        case 'Overdue':
            return {
                label: 'Overdue',
                variant: 'destructive' as const,
                icon: AlertCircle,
            }
        case 'Cancelled':
            return {
                label: 'Cancelled',
                variant: 'secondary' as const,
                icon: XCircle,
            }
        default:
            return {
                label: state,
                variant: 'secondary' as const,
                icon: FileText,
            }
    }
}

export default function InvoicePage() {
    const params = useParams()
    const router = useRouter()
    const invoiceId = params.id as string
    
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId)
    const { downloadInvoice, shareInvoice, isDownloading, isSharing } = useInvoiceActions()

    const statusConfig = invoice ? getStatusConfig(invoice.state, invoice.expiration_date) : null
    const StatusIcon = statusConfig?.icon || FileText

    const handleEdit = () => {
        router.push(`/invoices/${invoiceId}/edit`)
    }

    const handleDelete = async () => {
        if (!invoice) return
        
        try {
            await invoicesService.delete(invoiceId)
            toast.success('Invoice deleted successfully')
            router.push('/invoices')
        } catch (error: any) {
            console.error('Failed to delete invoice:', error)
            toast.error(error?.response?.data?.error || 'Failed to delete invoice')
        } finally {
            setShowDeleteDialog(false)
        }
    }

    const handleDownload = () => {
        downloadInvoice(invoiceId)
    }

    const handleShare = () => {
        shareInvoice(invoiceId)
    }

    const handleBack = () => {
        router.push('/invoices')
    }

    if (isLoading) {
        return <LoadingState message="Loading invoice details…" />
    }

    if (error || !invoice) {
        return (
            <ErrorState
                message={error?.message || 'Invoice not found'}
                onRetry={() => refetch()}
            />
        )
    }

    const isExpired = invoice.expiration_date && isAfter(new Date(), new Date(invoice.expiration_date))
    const isOverdue = invoice.state === 'Sent' && isExpired

    return (
        <>
            {/* Loading overlay for mutations */}
            {(isDownloading || isSharing) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg border flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">
                            {isDownloading && 'Downloading PDF...'}
                            {isSharing && 'Generating share link...'}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Invoices
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{invoice.title}</h1>
                            <p className="text-muted-foreground">
                                Invoice #{invoice.id.substring(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="flex items-center gap-2"
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Download PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="flex items-center gap-2"
                            disabled={isSharing || invoice.state === 'Draft'}
                        >
                            {isSharing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Share2 className="h-4 w-4" />
                            )}
                            Share Link
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Invoice
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="flex items-center gap-2 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Invoice
                        </Button>
                    </div>
                </div>

                {/* Overdue Alert */}
                {isOverdue && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This invoice is overdue. The due date was {format(new Date(invoice.expiration_date!), 'PPP')}.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Invoice Information Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Invoice Title
                                </label>
                                <p className="text-lg font-medium">{invoice.title}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Invoice ID
                                </label>
                                <p className="text-sm font-mono text-muted-foreground">
                                    {invoice.id}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                </label>
                                <div className="mt-1">
                                    <Badge variant={statusConfig?.variant} className="flex items-center gap-1">
                                        <StatusIcon className="h-3 w-3" />
                                        {statusConfig?.label}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Client Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Client Name
                                </label>
                                <p className="text-lg font-medium">
                                    {invoice.clients.first_name} {invoice.clients.last_name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Email Address
                                </label>
                                <p className="text-sm">{invoice.clients.email}</p>
                            </div>
                            {invoice.clients.phone_number && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Phone Number
                                    </label>
                                    <p className="text-sm tabular-nums">
                                        {invoice.clients.phone_number}
                                    </p>
                                </div>
                            )}
                            {invoice.clients.address && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Address
                                    </label>
                                    <p className="text-sm">
                                        {invoice.clients.address}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Financial Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Total Amount
                                </label>
                                <p className="text-2xl font-bold">
                                    ${invoice.total_amount?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            {invoice.pdf_url && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        PDF Available
                                    </label>
                                    <div className="mt-1">
                                        <Badge variant="default">Yes</Badge>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Dates Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Important Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Created Date
                                </label>
                                <p className="text-sm">
                                    {new Date(invoice.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            {invoice.expiration_date && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Due Date
                                    </label>
                                    <p className={`text-sm ${isExpired ? 'text-destructive' : ''}`}>
                                        {new Date(invoice.expiration_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Last Updated
                                </label>
                                <p className="text-sm">
                                    {new Date(invoice.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InvoiceItemsContent invoiceId={invoiceId} />
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{invoice.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete Invoice
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}

// Separate component for invoice items to keep the main component clean
function InvoiceItemsContent({ invoiceId }: { invoiceId: string }) {
    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ['invoice-items', invoiceId],
        queryFn: () => invoicesService.getItems(invoiceId),
        enabled: !!invoiceId,
        staleTime: 1000 * 60 * 5,
    })

    const calculateSubtotal = () => {
        return items.reduce((total, item) => {
            return total + (item.quantity * item.unit_price)
        }, 0)
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <p className="text-muted-foreground text-center py-8">
                Unable to load invoice items
            </p>
        )
    }

    if (items.length === 0) {
        return (
            <p className="text-muted-foreground text-center py-8">
                No items found for this invoice
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                        <div className="font-medium">{item.items.name}</div>
                        <div className="text-sm text-muted-foreground">
                            Item ID: {item.item_id.substring(0, 8)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                            {item.quantity} × ${item.unit_price.toFixed(2)}
                        </div>
                        <div className="font-medium">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                    </div>
                </div>
            ))}
            <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                    <span className="text-lg font-bold">
                        ${calculateSubtotal().toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    )
}
