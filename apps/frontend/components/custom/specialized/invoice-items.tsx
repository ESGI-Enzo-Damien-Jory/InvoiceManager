'use client'

import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { invoicesService, type InvoiceItem } from '@/services/invoices'

interface InvoiceItemsProps {
    invoiceId: string
}

export function InvoiceItems({ invoiceId }: InvoiceItemsProps) {
    const {
        data: items = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['invoice-items', invoiceId],
        queryFn: () => invoicesService.getItems(invoiceId),
        enabled: !!invoiceId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const calculateSubtotal = () => {
        return items.reduce((total, item) => {
            return total + item.quantity * item.unit_price
        }, 0)
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
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
            <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                    Unable to load invoice items
                </p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                    No items found for this invoice
                </p>
            </div>
        )
    }

    return (
        <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Invoice Items
            </h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div>
                                    <div className="font-medium">
                                        {item.items.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Item ID: {item.item_id.substring(0, 8)}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant="outline">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                ${item.unit_price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                ${(item.quantity * item.unit_price).toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell
                            colSpan={3}
                            className="text-right font-medium"
                        >
                            Total Amount
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                            ${calculateSubtotal().toFixed(2)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
