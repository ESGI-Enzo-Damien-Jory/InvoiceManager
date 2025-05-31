'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { DateRange } from 'react-day-picker'
import Pagination from '@/components/custom/pagination'
import CardStatsList from '@/components/custom/specialized/card-stats-list'
import ListFilters from '@/components/custom/specialized/list-filters'
import InvoiceTable from '@/components/custom/specialized/invoice-table'

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

export default function InvoicesPage() {
    const allInvoices = useRef(sampleInvoices).current

    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
    const [searchResults, setSearchResults] = useState<Invoice[]>(allInvoices)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const handleSearch = (results: Invoice[]) => {
        setSearchResults(results)
        setCurrentPage(1)
    }

    let displayedInvoices = [...searchResults]
    const from = dateRange?.from
    const to = dateRange?.to

    if (from && to) {
        displayedInvoices = displayedInvoices.filter((inv) => {
            const d = inv.date
            return (
                (isAfter(d, startOfDay(from)) ||
                    d.getTime() === startOfDay(from).getTime()) &&
                (isBefore(d, endOfDay(to)) ||
                    d.getTime() === endOfDay(to).getTime())
            )
        })
    }

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range)
        setCurrentPage(1)
    }

    const totalPages = Math.ceil(displayedInvoices.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(
        startIndex + itemsPerPage,
        displayedInvoices.length
    )
    const currentInvoices = displayedInvoices.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    return (
        <>
            <CardStatsList />

            <ListFilters<Invoice>
                subtitle="Invoice List"
                items={allInvoices}
                searchKeys={['id', 'title', 'client', 'status']}
                onFiltered={handleSearch}
                dateRange={dateRange}
                setDateRange={handleDateRangeChange}
            />

            <InvoiceTable
                invoices={currentInvoices}
                invoiceLinkPrefix="/invoices"
                clientLinkPrefix="/clients"
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                startIndex={startIndex + 1}
                endIndex={endIndex}
                totalEntries={displayedInvoices.length}
            />
        </>
    )
}
