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
                                className={
                                    header === 'Amount'
                                        ? 'text-right'
                                        : 'text-left'
                                }
                            >
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((inv) => (
                        <TableRow key={inv.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-blue-600 hover:underline">
                                <Link href={`${invoiceLinkPrefix}/${inv.id}`}>
                                    {' '}
                                    {inv.id}{' '}
                                </Link>
                            </TableCell>
                            <TableCell>
                                {' '}
                                {format(inv.date, 'MM/dd/yyyy')}{' '}
                            </TableCell>
                            <TableCell>
                                {' '}
                                {format(inv.dueDate, 'MM/dd/yyyy')}{' '}
                            </TableCell>
                            <TableCell> {inv.title} </TableCell>
                            <TableCell className="text-blue-600 hover:underline">
                                <Link
                                    href={`${clientLinkPrefix}/${inv.client.replace(/ /g, '-').toLowerCase()}`}
                                >
                                    {inv.client}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={cn(
                                        'inline-flex items-center px-3 py-0.5 rounded-md text-sm font-medium',
                                        statusColors[inv.status]
                                    )}
                                >
                                    {inv.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                ${inv.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
