'use client'

import { useState } from 'react'
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import * as React from 'react'
import { format } from 'date-fns'

import {
    Plus,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface CardStatsProps {
    discreteTitle: string
    value: number
    percentageValue: number
}

function CardStats({ discreteTitle, value, percentageValue }: CardStatsProps) {
    return (
        <div className="flex-1 text-center">
            <p className="text-gray-500">{discreteTitle}</p>
            <h1 className="text-4xl font-bold">{value}</h1>
            <div className="flex items-center justify-center">
                <p className="text-gray-600 text-sm mr-1">
                    vs last week {percentageValue}%
                </p>
                {percentageValue > 0 ? (
                    <ArrowUpRight className="text-green-400" />
                ) : (
                    <ArrowDownRight className="text-red-400" />
                )}
            </div>
        </div>
    )
}

interface Invoice {
    id: string
    date: Date
    dueDate: Date
    title: string
    client: string
    status: 'Paid' | 'Sent' | 'Pending' | 'Overdue'
    amount: number
}

const sampleInvoices: Invoice[] = [
    {
        id: 'INV001',
        date: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        title: 'Web Services',
        client: 'Enzo Hugonnier',
        status: 'Paid',
        amount: 250.0,
    },
    {
        id: 'INV002',
        date: new Date(new Date().setDate(new Date().getDate() - 3)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 27)),
        title: 'Design Work',
        client: 'Alice Dupont',
        status: 'Sent',
        amount: 400.0,
    },
    {
        id: 'INV003',
        date: new Date(new Date().setDate(new Date().getDate() - 10)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
        title: 'Consulting',
        client: 'Bob Martin',
        status: 'Pending',
        amount: 600.0,
    },
    {
        id: 'INV004',
        date: new Date(new Date().setDate(new Date().getDate() - 15)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        title: 'Logo Design',
        client: 'Emma Johnson',
        status: 'Sent',
        amount: 350.0,
    },
    {
        id: 'INV005',
        date: new Date(new Date().setDate(new Date().getDate() - 18)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 12)),
        title: 'SEO Services',
        client: 'Charles Wilson',
        status: 'Paid',
        amount: 500.0,
    },
    {
        id: 'INV006',
        date: new Date(new Date().setDate(new Date().getDate() - 22)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 8)),
        title: 'Content Writing',
        client: 'Diana Smith',
        status: 'Overdue',
        amount: 325.0,
    },
    {
        id: 'INV007',
        date: new Date(new Date().setDate(new Date().getDate() - 25)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        title: 'Mobile App Development',
        client: 'Frank Miller',
        status: 'Pending',
        amount: 1200.0,
    },
    {
        id: 'INV008',
        date: new Date(new Date().setDate(new Date().getDate() - 30)),
        dueDate: new Date(new Date().setDate(new Date().getDate())),
        title: 'Website Maintenance',
        client: 'Grace Lee',
        status: 'Overdue',
        amount: 180.0,
    },
    {
        id: 'INV009',
        date: new Date(new Date().setDate(new Date().getDate() - 35)),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
        title: 'UI/UX Design',
        client: 'Henry Brown',
        status: 'Paid',
        amount: 750.0,
    },
    {
        id: 'INV010',
        date: new Date(new Date().setDate(new Date().getDate() - 40)),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
        title: 'Email Marketing',
        client: 'Isabella Garcia',
        status: 'Paid',
        amount: 450.0,
    },
    {
        id: 'INV011',
        date: new Date(new Date().setDate(new Date().getDate() - 45)),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 15)),
        title: 'Social Media Management',
        client: 'Jack Taylor',
        status: 'Paid',
        amount: 550.0,
    },
    {
        id: 'INV012',
        date: new Date(new Date().setDate(new Date().getDate() - 50)),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 20)),
        title: 'Video Production',
        client: 'Kelly Anderson',
        status: 'Paid',
        amount: 950.0,
    },
]

const statusColors: Record<Invoice['status'], string> = {
    Paid: 'bg-green-100 text-green-800',
    Sent: 'bg-blue-100 text-blue-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
}

export default function Invoices() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const from = dateRange?.from
    const to = dateRange?.to

    const filteredInvoices =
        from && to
            ? sampleInvoices.filter((inv) => {
                  const invDate = inv.date
                  return (
                      (isAfter(invDate, startOfDay(from)) ||
                          invDate.getTime() === startOfDay(from).getTime()) &&
                      (isBefore(invDate, endOfDay(to)) ||
                          invDate.getTime() === endOfDay(to).getTime())
                  )
              })
            : sampleInvoices

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentInvoices = filteredInvoices.slice(
        indexOfFirstItem,
        indexOfLastItem
    )
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    return (
        <>
            <div className="flex justify-between items-center px-6 py-4">
                <div>
                    <p className="text-gray-500">Overview</p>
                    <h1 className="text-4xl font-bold">Invoices</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Search />
                    </Button>
                    <Button>Send Statements</Button>
                    <Button>Import</Button>
                    <Link href="/invoices/new">
                        <Button>
                            <Plus /> New Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="p-6 space-y-6 h-9/12">
                <div className="flex flex-col md:flex-row bg-white rounded-xl border p-8 gap-4">
                    <CardStats
                        discreteTitle="Paid"
                        value={18}
                        percentageValue={-4.2}
                    />
                    <Separator
                        orientation="vertical"
                        className="hidden md:block mx-4"
                    />
                    <CardStats
                        discreteTitle="Sent"
                        value={25}
                        percentageValue={4.8}
                    />
                    <Separator
                        orientation="vertical"
                        className="hidden md:block mx-4"
                    />
                    <CardStats
                        discreteTitle="Pending"
                        value={10}
                        percentageValue={-2}
                    />
                    <Separator
                        orientation="vertical"
                        className="hidden md:block mx-4"
                    />
                    <CardStats
                        discreteTitle="Overdue"
                        value={2}
                        percentageValue={-1}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-gray-500">Invoice List</p>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Preset Period</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <div className="flex flex-col">
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() =>
                                            setDateRange({
                                                from: new Date(),
                                                to: new Date(),
                                            })
                                        }
                                    >
                                        Today
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => {
                                            const end = new Date()
                                            const start = new Date(end)
                                            start.setDate(end.getDate() - 6)
                                            setDateRange({
                                                from: start,
                                                to: end,
                                            })
                                        }}
                                    >
                                        Last 7 days
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => {
                                            const now = new Date()
                                            setDateRange({
                                                from: new Date(
                                                    now.getFullYear(),
                                                    now.getMonth(),
                                                    1
                                                ),
                                                to: new Date(
                                                    now.getFullYear(),
                                                    now.getMonth() + 1,
                                                    0
                                                ),
                                            })
                                        }}
                                    >
                                        This month
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => {
                                            const now = new Date()
                                            setDateRange({
                                                from: new Date(
                                                    now.getFullYear(),
                                                    now.getMonth() - 1,
                                                    1
                                                ),
                                                to: new Date(
                                                    now.getFullYear(),
                                                    now.getMonth(),
                                                    0
                                                ),
                                            })
                                        }}
                                    >
                                        Last month
                                    </button>
                                    <button
                                        className="p-2 text-left hover:bg-gray-100"
                                        onClick={() => setDateRange(undefined)}
                                    >
                                        Custom range...
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-64 justify-start text-left font-normal',
                                        !from && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {from
                                        ? to
                                            ? `${format(from, 'LLL dd, y')} – ${format(to, 'LLL dd, y')}`
                                            : format(from, 'LLL dd, y')
                                        : 'Pick a date range'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="bg-white rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">
                                    Invoice
                                </TableHead>
                                <TableHead className="text-left">
                                    Date
                                </TableHead>
                                <TableHead className="text-left">
                                    Due Date
                                </TableHead>
                                <TableHead className="text-left">
                                    Title
                                </TableHead>
                                <TableHead className="text-left">
                                    Client
                                </TableHead>
                                <TableHead className="text-left">
                                    Status
                                </TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentInvoices.map((inv) => (
                                <TableRow
                                    key={inv.id}
                                    className="hover:bg-gray-50"
                                >
                                    <TableCell className="font-medium text-blue-600 hover:underline">
                                        <Link href={`/invoices/${inv.id}`}>
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
                                            href={`/clients/${inv.client.replace(' ', '-').toLowerCase()}`}
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

                    <div className="flex items-center justify-between border-t px-4 py-3">
                        <div className="flex items-center text-sm text-gray-500">
                            <span>
                                Showing {indexOfFirstItem + 1} to{' '}
                                {Math.min(
                                    indexOfLastItem,
                                    filteredInvoices.length
                                )}{' '}
                                on {filteredInvoices.length} entries
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Page précédente</span>
                            </Button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            currentPage === i + 1
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => paginate(i + 1)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Page suivante</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
