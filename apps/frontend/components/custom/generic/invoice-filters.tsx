'use client'

import { useState, useMemo, useEffect } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { Invoice } from '@/types'

interface InvoiceFiltersProps {
    invoices: Invoice[]
    onFiltered?: (filtered: Invoice[]) => void
    onCreateNew?: () => void
}

export function InvoiceFilters({ invoices, onFiltered, onCreateNew }: InvoiceFiltersProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredInvoices = useMemo(() => {
        let filtered = [...invoices]

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(invoice => 
                invoice.title.toLowerCase().includes(term) ||
                invoice.id.toLowerCase().includes(term)
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.state === statusFilter)
        }

        return filtered
    }, [invoices, searchTerm, statusFilter])

    // Update parent component when filters change
    useEffect(() => {
        onFiltered?.(filteredInvoices)
    }, [filteredInvoices, onFiltered])

    const clearFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
    }

    const hasActiveFilters = searchTerm || statusFilter !== 'all'

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-9 px-2"
                    >
                        <IconX className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    {filteredInvoices.length} of {invoices.length} invoices
                </span>
                {hasActiveFilters && (
                    <Badge variant="secondary" className="text-xs">
                        Filtered
                    </Badge>
                )}
            </div>
        </div>
    )
} 