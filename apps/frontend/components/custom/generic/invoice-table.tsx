'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
    IconDotsVertical, 
    IconDownload, 
    IconEye, 
    IconEdit, 
    IconTrash,
    IconCircleCheckFilled,
    IconSend,
    IconFileText,
    IconAlertTriangle,
    IconX
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Invoice } from '@/services/invoices'
import { formatCurrency } from '@/lib/utils'

interface InvoiceTableProps {
    invoices: Invoice[]
    onView?: (invoice: Invoice) => void
    onEdit?: (invoice: Invoice) => void
    onDelete?: (invoice: Invoice) => void
    onDownload?: (invoice: Invoice) => void
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'Paid':
            return {
                icon: IconCircleCheckFilled,
                className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
                iconClassName: 'fill-green-500 dark:fill-green-400'
            }
        case 'Sent':
            return {
                icon: IconSend,
                className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                iconClassName: 'text-blue-500'
            }
        case 'Draft':
            return {
                icon: IconFileText,
                className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800',
                iconClassName: 'text-gray-500'
            }
        case 'Overdue':
            return {
                icon: IconAlertTriangle,
                className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
                iconClassName: 'text-red-500'
            }
        case 'Cancelled':
            return {
                icon: IconX,
                className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
                iconClassName: 'text-orange-500'
            }
        default:
            return {
                icon: IconFileText,
                className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800',
                iconClassName: 'text-gray-500'
            }
    }
}

export function InvoiceTable({ 
    invoices, 
    onView, 
    onEdit, 
    onDelete, 
    onDownload 
}: InvoiceTableProps) {
    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-b bg-muted/50">
                        <TableHead className="font-semibold">Invoice</TableHead>
                        <TableHead className="font-semibold">Client</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold text-right">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => {
                        const statusConfig = getStatusConfig(invoice.state)
                        const StatusIcon = statusConfig.icon
                        
                        return (
                            <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{invoice.title}</span>
                                        <span className="text-xs text-muted-foreground">{invoice.id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {invoice.clients.first_name} {invoice.clients.last_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{invoice.clients.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {invoice.expiration_date 
                                        ? format(new Date(invoice.expiration_date), 'MMM dd, yyyy')
                                        : '-'
                                    }
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {invoice.total_amount 
                                        ? formatCurrency(invoice.total_amount)
                                        : '-'
                                    }
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${statusConfig.className} px-2 py-1 inline-flex items-center gap-1`}>
                                        <StatusIcon className={`h-3 w-3 ${statusConfig.iconClassName}`} />
                                        {invoice.state}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                                <span className="sr-only">Open menu</span>
                                                <IconDotsVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            {onView && (
                                                <DropdownMenuItem onClick={() => onView(invoice)}>
                                                    <IconEye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                            )}
                                            {onEdit && (
                                                <DropdownMenuItem onClick={() => onEdit(invoice)}>
                                                    <IconEdit className="mr-2 h-4 w-4" />
                                                    Edit Invoice
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            {onDownload && (
                                                <DropdownMenuItem onClick={() => onDownload(invoice)}>
                                                    <IconDownload className="mr-2 h-4 w-4" />
                                                    Download PDF
                                                </DropdownMenuItem>
                                            )}
                                            {onDelete && (
                                                <DropdownMenuItem 
                                                    onClick={() => onDelete(invoice)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <IconTrash className="mr-2 h-4 w-4" />
                                                    Delete Invoice
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
} 