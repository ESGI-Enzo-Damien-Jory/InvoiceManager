'use client'

import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface Invoice {
    id: string
    date: Date
    dueDate: Date
    title: string
    client: string
    status: 'Paid' | 'Sent' | 'Pending' | 'Overdue'
    amount: number
}

export interface InvoiceTableProps {
    invoices: Invoice[]
    statusColors: Record<Invoice['status'], string>
    invoiceLinkPrefix?: string
    clientLinkPrefix?: string
}

const getStatusStyle = (status: Invoice['status']) => {
    const baseStyle =
        'inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border transition-colors'

    switch (status) {
        case 'Paid':
            return cn(baseStyle, 'bg-green-50 text-green-700 border-green-200')
        case 'Sent':
            return cn(baseStyle, 'bg-blue-50 text-blue-700 border-blue-200')
        case 'Pending':
            return cn(
                baseStyle,
                'bg-yellow-50 text-yellow-700 border-yellow-200'
            )
        case 'Overdue':
            return cn(baseStyle, 'bg-red-50 text-red-700 border-red-200')
        default:
            return cn(baseStyle, 'bg-gray-50 text-gray-700 border-gray-200')
    }
}

export default function InvoiceTable({
    invoices,
    statusColors,
    invoiceLinkPrefix = '/invoices',
    clientLinkPrefix = '/clients',
}: InvoiceTableProps) {
    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        {[
                            'Invoice',
                            'Date',
                            'Due Date',
                            'Title',
                            'Client',
                            'Status',
                            'Amount',
                        ].map((header) => (
                            <TableHead
                                key={header}
                                className={cn(
                                    header === 'Amount'
                                        ? 'text-right pr-4'
                                        : header === 'Invoice'
                                          ? 'text-left pl-4'
                                          : 'text-left'
                                )}
                            >
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((inv) => (
                        <TableRow key={inv.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-blue-600 hover:underline pl-4">
                                <Link href={`${invoiceLinkPrefix}/${inv.id}`}>
                                    {inv.id}
                                </Link>
                            </TableCell>
                            <TableCell>
                                {format(inv.date, 'MM/dd/yyyy')}
                            </TableCell>
                            <TableCell>
                                {format(inv.dueDate, 'MM/dd/yyyy')}
                            </TableCell>
                            <TableCell>{inv.title}</TableCell>
                            <TableCell className="text-blue-600 hover:underline">
                                <Link
                                    href={`${clientLinkPrefix}/${inv.client.replace(/ /g, '-').toLowerCase()}`}
                                >
                                    {inv.client}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <span className={getStatusStyle(inv.status)}>
                                    {inv.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                                ${inv.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
