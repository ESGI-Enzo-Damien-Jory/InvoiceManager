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
    Loader2,
    Mail,
    Bell
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
import { invoicesService, type InvoiceItem } from '@/services/invoices'
import type { Invoice, InvoiceWithClient } from '@/types'
import { toast } from 'sonner'
import LoadingState from '@/components/custom/states/loading-state'
import ErrorState from '@/components/custom/states/error-state'
import { InvoicePreview } from '@/components/custom/specialized/invoice-preview'
import { SendEmailDialog } from '@/components/custom/specialized/invoice-form/send-email-dialog'
import { ShareLinkDialog } from '@/components/custom/specialized/invoice-form/share-link-dialog'

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
    const [showEmailDialog, setShowEmailDialog] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)

    const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId)
    const { 
        downloadInvoice, 
        shareInvoice, 
        sendEmail, 
        sendReminder,
        isGeneratingPdf,
        isSendingEmail,
        isSendingReminder 
    } = useInvoiceActions()

    // Fetch client data separately if invoice exists
    const { data: client } = useQuery({
        queryKey: ['client', invoice?.client_id],
        queryFn: () => invoicesService.getClient(invoice!.client_id),
        enabled: !!invoice?.client_id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Fetch invoice items separately
    const { data: invoiceItems = [] } = useQuery({
        queryKey: ['invoice-items', invoiceId],
        queryFn: () => invoicesService.getItems(invoiceId),
        enabled: !!invoiceId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

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
        setShowShareDialog(true)
    }

    const handleSendEmail = () => {
        setShowEmailDialog(true)
    }

    const handleSendReminder = async () => {
        try {
            await sendReminder(invoiceId)
        } catch (error) {
            console.error('Failed to send reminder:', error)
        }
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
            {(isGeneratingPdf || isSendingEmail || isSendingReminder) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg border flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">
                            {isGeneratingPdf && 'Generating PDF...'}
                            {isSendingEmail && 'Sending email...'}
                            {isSendingReminder && 'Sending reminder...'}
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
                        <InvoicePreview
                            invoice={invoice}
                            client={client}
                            items={invoiceItems.map(item => item.items)}
                            invoiceItems={invoiceItems}
                            onDownload={handleDownload}
                            onShare={handleShare}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="flex items-center gap-2"
                            disabled={isGeneratingPdf}
                        >
                            {isGeneratingPdf ? (
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
                            disabled={invoice.state === 'Draft'}
                        >
                            <Share2 className="h-4 w-4" />
                            Share Link
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendEmail}
                            className="flex items-center gap-2"
                            disabled={invoice.state === 'Draft' || isSendingEmail}
                        >
                            {isSendingEmail ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="h-4 w-4" />
                            )}
                            Send Email
                        </Button>
                        {(invoice.state === 'Sent' || invoice.state === 'Overdue') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSendReminder}
                                className="flex items-center gap-2"
                                disabled={isSendingReminder}
                            >
                                {isSendingReminder ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Bell className="h-4 w-4" />
                                )}
                                Send Reminder
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            disabled={invoice.state !== 'Draft'}
                            className={`flex items-center gap-2 ${
                                invoice.state !== 'Draft' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title={
                                invoice.state !== 'Draft' 
                                    ? `Cannot edit invoice in ${invoice.state} state` 
                                    : 'Edit invoice'
                            }
                        >
                            <Edit className="h-4 w-4" />
                            Edit Invoice
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={invoice.state !== 'Draft' && invoice.state !== 'Cancelled'}
                            className={`flex items-center gap-2 ${
                                invoice.state !== 'Draft' && invoice.state !== 'Cancelled'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'text-destructive hover:text-destructive'
                            }`}
                            title={
                                invoice.state !== 'Draft' && invoice.state !== 'Cancelled'
                                    ? `Cannot delete invoice in ${invoice.state} state`
                                    : 'Delete invoice'
                            }
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Invoice
                        </Button>
                    </div>
                </div>

                {/* Status Alerts */}
                {isOverdue && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This invoice is overdue. The due date was {format(new Date(invoice.expiration_date!), 'PPP')}.
                        </AlertDescription>
                    </Alert>
                )}
                
                {invoice.state !== 'Draft' && (
                    <Alert variant="default">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This invoice is in <strong>{invoice.state}</strong> state and cannot be modified. 
                            Only Draft invoices can be edited or deleted.
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
                                    {client ? `${client.first_name} ${client.last_name}` : 'Loading...'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Email Address
                                </label>
                                <p className="text-sm">{client?.email || 'Loading...'}</p>
                            </div>
                            {client?.phone_number && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Phone Number
                                    </label>
                                    <p className="text-sm tabular-nums">
                                        {client.phone_number}
                                    </p>
                                </div>
                            )}
                            {client?.address && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Address
                                    </label>
                                    <p className="text-sm">
                                        {client.address}
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
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Invoice Items
                            </CardTitle>
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
                                Are you sure you want to delete this invoice? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Send Email Dialog */}
                {client && (
                    <SendEmailDialog
                        isOpen={showEmailDialog}
                        onClose={() => setShowEmailDialog(false)}
                        invoiceId={invoiceId}
                        invoiceTitle={invoice.title}
                        clientEmail={client.email}
                        clientName={`${client.first_name} ${client.last_name}`}
                        onEmailSent={() => {
                            setShowEmailDialog(false)
                            refetch()
                        }}
                    />
                )}

                {/* Share Link Dialog */}
                <ShareLinkDialog
                    isOpen={showShareDialog}
                    onClose={() => setShowShareDialog(false)}
                    invoiceId={invoiceId}
                    invoiceTitle={invoice.title}
                />
            </div>
        </>
    )
}

function InvoiceItemsContent({ invoiceId }: { invoiceId: string }) {
    const { data: invoiceItems = [], isLoading } = useQuery({
        queryKey: ['invoice-items', invoiceId],
        queryFn: () => invoicesService.getItems(invoiceId),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const calculateSubtotal = () => {
        return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        )
    }

    if (invoiceItems.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted-foreground">No items found</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left p-3 font-medium">Item</th>
                            <th className="text-center p-3 font-medium">Qty</th>
                            <th className="text-right p-3 font-medium">Price</th>
                            <th className="text-right p-3 font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.map((item, index) => (
                            <tr key={index} className="border-t">
                                <td className="p-3">
                                    <div>
                                        <div className="font-medium">{item.items.name}</div>
                                    </div>
                                </td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">${item.unit_price.toFixed(2)}</td>
                                <td className="p-3 text-right font-medium">
                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex justify-end">
                <div className="text-right space-y-1">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="ml-2 font-medium">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
