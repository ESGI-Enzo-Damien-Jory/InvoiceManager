'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Edit,
    Download,
    Send,
    Trash2,
    DollarSign,
    Loader2,
    Copy,
    Eye,
    ExternalLink,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

import LoadingState from '@/components/custom/loading-state'
import ErrorState from '@/components/custom/error-state'
import { StatusBadge } from '@/components/custom/status-badge'

import {
    useInvoice,
    useDeleteInvoice,
    useDownloadInvoicePdf,
    useUpdateInvoiceState,
    useCreateInvoice,
    useInvoicePreview,
    useGenerateInvoiceSignedUrl,
} from '@/hooks/use-invoices'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils'

export default function InvoiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const invoiceId = params.id as string

    const { data: invoice, status, error, refetch } = useInvoice(invoiceId)
    const { data: preview } = useInvoicePreview(invoiceId)
    const deleteInvoiceMutation = useDeleteInvoice()
    const downloadPdfMutation = useDownloadInvoicePdf()
    const updateStateMutation = useUpdateInvoiceState()
    const createInvoiceMutation = useCreateInvoice()
    const generateUrlMutation = useGenerateInvoiceSignedUrl()

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const canEdit = invoice?.state === 'Draft'
    const canSend = invoice?.state === 'Draft'
    const canDownload = invoice?.state === 'Sent' || invoice?.state === 'Paid'
    const canMarkPaid = invoice?.state === 'Sent'

    const handleEdit = () => {
        if (canEdit) {
            router.push(`/invoices/${invoiceId}/update`)
        }
    }

    const handleDelete = async () => {
        try {
            await deleteInvoiceMutation.mutateAsync(invoiceId)
            router.push('/invoices')
        } catch {
            alert('Failed to delete invoice')
        }
        setShowDeleteDialog(false)
    }

    const handleSend = async () => {
        try {
            await updateStateMutation.mutateAsync({
                id: invoiceId,
                state: 'Sent',
            })
        } catch {
            alert('Failed to send invoice')
        }
    }

    const handleMarkPaid = async () => {
        try {
            await updateStateMutation.mutateAsync({
                id: invoiceId,
                state: 'Paid',
            })
        } catch {
            alert('Failed to mark as paid')
        }
    }

    const handleDownload = async () => {
        try {
            await downloadPdfMutation.mutateAsync(invoiceId)
        } catch {
            alert('Failed to download PDF')
        }
    }

    const handleDuplicate = async () => {
        if (!invoice) return
        try {
            const newInvoice = await createInvoiceMutation.mutateAsync({
                client_id: invoice.client_id,
                title: `Copy of ${invoice.title}`,
                total_amount: invoice.total_amount || 0,
                expiration_date: invoice.expiration_date || undefined,
                state: 'Draft',
                items: [],
            })
            router.push(`/invoices/${newInvoice.id}`)
        } catch {
            alert('Failed to duplicate invoice')
        }
    }

    const handleGenerateLink = async () => {
        try {
            const result = await generateUrlMutation.mutateAsync({
                id: invoiceId,
                options: { expiresIn: 7 * 24 * 60 * 60 },
            })
            navigator.clipboard.writeText(result.signed_url)
            alert('Link copied to clipboard!')
        } catch {
            alert('Failed to generate link')
        }
    }

    const handlePreview = () => {
        if (preview?.pdf_url) {
            window.open(preview.pdf_url, '_blank')
        }
    }

    if (status === 'pending') {
        return <LoadingState message="Loading invoice..." />
    }

    if (status === 'error') {
        return (
            <ErrorState
                message={error?.message || 'Failed to load invoice'}
                onRetry={() => refetch()}
            />
        )
    }

    if (!invoice) {
        return (
            <ErrorState
                message="Invoice not found"
                onRetry={() => router.push('/invoices')}
            />
        )
    }

    const isOverdueInvoice = isOverdue(invoice)

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="h-8 w-8 p-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">
                                {invoice.title}
                            </h1>
                            <StatusBadge status={invoice.state} />
                            {isOverdueInvoice && (
                                <Badge variant="destructive">Overdue</Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            INV-{invoice.id.slice(0, 8)} • Created{' '}
                            {formatDate(invoice.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {canEdit && (
                        <Button variant="outline" onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}

                    {canSend && (
                        <Button onClick={handleSend}>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                        </Button>
                    )}

                    {canMarkPaid && (
                        <Button variant="outline" onClick={handleMarkPaid}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Mark Paid
                        </Button>
                    )}

                    {canDownload && (
                        <>
                            <Button variant="outline" onClick={handlePreview}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleGenerateLink}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </>
                    )}

                    <Button variant="outline" onClick={handleDuplicate}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invoice Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Amount
                            </p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(invoice.total_amount || 0)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Created
                                </p>
                                <p>{formatDate(invoice.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Updated
                                </p>
                                <p>{formatDate(invoice.updated_at)}</p>
                            </div>
                        </div>

                        {invoice.expiration_date && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Due Date
                                </p>
                                <p
                                    className={
                                        isOverdueInvoice
                                            ? 'text-red-600 font-medium'
                                            : ''
                                    }
                                >
                                    {formatDate(invoice.expiration_date)}
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Status
                            </p>
                            <StatusBadge status={invoice.state} />
                        </div>
                    </CardContent>
                </Card>

                {/* Client Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Name
                            </p>
                            <p className="text-lg font-medium">
                                {invoice.clients.first_name}{' '}
                                {invoice.clients.last_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Email
                            </p>
                            <p>{invoice.clients.email}</p>
                        </div>

                        {invoice.clients.phone_number && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Phone
                                </p>
                                <p>{invoice.clients.phone_number}</p>
                            </div>
                        )}

                        {invoice.clients.address && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Address
                                </p>
                                <p className="whitespace-pre-line">
                                    {invoice.clients.address}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{invoice.title}"?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteInvoiceMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
