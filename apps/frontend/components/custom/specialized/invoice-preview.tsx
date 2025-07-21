'use client'

import { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Eye,
    Download,
    Share2,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import type { Invoice, InvoiceItem, Client } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import template from '../../../templates/template.json'

interface InvoicePreviewProps {
    invoice: Invoice
    client?: Client
    items?: any[]
    invoiceItems?: any[]
    onDownload?: () => void
    onShare?: () => void
}

interface PreviewData {
    billedToInput: string
    info: {
        InvoiceNo: string
        Date: string
    }
    orders: string[][]
    taxInput: {
        rate: string
    }
    paymentInfoInput: string
    shopName: string
    shopAddress: string
}

export function InvoicePreview({
    invoice,
    client,
    items,
    invoiceItems,
    onDownload,
    onShare,
}: InvoicePreviewProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [previewData, setPreviewData] = useState<PreviewData | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (invoice && client && invoiceItems) {
            generatePreviewData()
        }
    }, [invoice, client, invoiceItems])

    const generatePreviewData = () => {
        if (!invoice || !client || !invoiceItems) return

        // Format client address
        const clientAddress = [
            client.first_name + ' ' + client.last_name,
            client.phone_number,
            client.address,
        ]
            .filter(Boolean)
            .join('\n')

        // Format invoice items - use the item data directly from invoiceItems
        const formattedItems = invoiceItems.map((invoiceItem: any) => {
            return [
                invoiceItem.items.name, // Use the name directly from the item
                invoiceItem.quantity.toString(),
                formatCurrency(invoiceItem.unit_price),
                formatCurrency(invoiceItem.quantity * invoiceItem.unit_price),
            ]
        })

        // Calculate totals
        const subtotal = invoiceItems.reduce(
            (sum: number, item: any) => sum + item.quantity * item.unit_price,
            0
        )
        const taxRate = 10 // Default tax rate
        const tax = subtotal * (taxRate / 100)
        const total = subtotal + tax

        // Format payment info with real data
        const paymentInfo = [
            'Invoice Manager',
            'Account Name: ' + client.first_name + ' ' + client.last_name,
            'Email: ' + client.email,
            'Due Date: ' + formatDate(invoice.expiration_date),
        ].join('\n')

        setPreviewData({
            billedToInput: clientAddress,
            info: {
                InvoiceNo: invoice.id.substring(0, 8).toUpperCase(),
                Date: formatDate(invoice.created_at),
            },
            orders: formattedItems,
            taxInput: {
                rate: taxRate.toString(),
            },
            paymentInfoInput: paymentInfo,
            shopName: 'Invoice Manager',
            shopAddress: 'Professional Invoice Management System',
        })
    }

    const handleDownload = async () => {
        if (onDownload) {
            try {
                await onDownload()
                toast.success('Invoice downloaded successfully!')
            } catch (error) {
                console.error('Download failed:', error)
                toast.error('Failed to download invoice')
            }
        }
    }

    const handleShare = async () => {
        if (onShare) {
            try {
                await onShare()
            } catch (error) {
                console.error('Share failed:', error)
                toast.error('Failed to share invoice')
            }
        }
    }

    if (!invoice) {
        return <Skeleton className="h-96 w-full" />
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Preview
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle>Invoice Preview</DialogTitle>
                                <CardDescription>
                                    {invoice.title} - {client?.first_name}{' '}
                                    {client?.last_name}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        invoice.state === 'Paid'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {invoice.state}
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Button size="sm" onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Skeleton className="h-[600px] w-[400px]" />
                            </div>
                        ) : (
                            <div className="h-full overflow-auto">
                                <div className="flex justify-center p-4">
                                    {/* PDF Preview - Always white background for PDF-like appearance */}
                                    <div
                                        className="bg-white shadow-lg border rounded-lg dark:bg-white dark:text-black"
                                        style={{
                                            width: '400px',
                                            minHeight: '600px',
                                        }}
                                    >
                                        {/* PDF Preview Content */}
                                        <div className="p-6 space-y-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">
                                                        ✓
                                                    </span>
                                                </div>
                                                <h1 className="text-2xl font-bold text-right text-black">
                                                    INVOICE
                                                </h1>
                                            </div>

                                            {/* Client and Invoice Info */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                                        Billed to:
                                                    </h3>
                                                    <div className="text-sm whitespace-pre-line text-black">
                                                        {
                                                            previewData?.billedToInput
                                                        }
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-black">
                                                        <div>
                                                            Invoice No.{' '}
                                                            {
                                                                previewData
                                                                    ?.info
                                                                    .InvoiceNo
                                                            }
                                                        </div>
                                                        <div>
                                                            {
                                                                previewData
                                                                    ?.info.Date
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items Table */}
                                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="text-left p-3 font-medium text-black">
                                                                Item
                                                            </th>
                                                            <th className="text-center p-3 font-medium text-black">
                                                                Qty
                                                            </th>
                                                            <th className="text-center p-3 font-medium text-black">
                                                                Price
                                                            </th>
                                                            <th className="text-right p-3 font-medium text-black">
                                                                Total
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {previewData?.orders.map(
                                                            (item, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="border-t border-gray-200"
                                                                >
                                                                    <td className="p-3 text-black">
                                                                        {
                                                                            item[0]
                                                                        }
                                                                    </td>
                                                                    <td className="p-3 text-center text-black">
                                                                        {
                                                                            item[1]
                                                                        }
                                                                    </td>
                                                                    <td className="p-3 text-center text-black">
                                                                        {
                                                                            item[2]
                                                                        }
                                                                    </td>
                                                                    <td className="p-3 text-right text-black">
                                                                        {
                                                                            item[3]
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Totals */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-black">
                                                        Subtotal
                                                    </span>
                                                    <span className="text-black">
                                                        {formatCurrency(
                                                            invoice.total_amount ||
                                                                0
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-black">
                                                        Tax (
                                                        {
                                                            previewData
                                                                ?.taxInput.rate
                                                        }
                                                        %)
                                                    </span>
                                                    <span className="text-black">
                                                        {formatCurrency(
                                                            (invoice.total_amount ||
                                                                0) * 0.1
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-300 pt-2">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span className="text-black">
                                                            Total
                                                        </span>
                                                        <span className="text-black">
                                                            {formatCurrency(
                                                                (invoice.total_amount ||
                                                                    0) * 1.1
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold mb-4 text-black">
                                                    Thank you!
                                                </h3>
                                            </div>

                                            {/* Payment Info */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <h3 className="font-semibold mb-2 text-black">
                                                        Payment Information
                                                    </h3>
                                                    <div className="whitespace-pre-line text-black">
                                                        {
                                                            previewData?.paymentInfoInput
                                                        }
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-lg text-black">
                                                        {previewData?.shopName}
                                                    </div>
                                                    <div className="text-gray-600">
                                                        {
                                                            previewData?.shopAddress
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
