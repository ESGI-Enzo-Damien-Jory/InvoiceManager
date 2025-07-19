'use client'

import { useState, useMemo, useEffect } from 'react'
import { IconSearch, IconFilter, IconPlus, IconDotsVertical } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { type Invoice } from '@/services/invoices'

interface InvoiceFiltersProps {
    invoices: Invoice[]
    onFiltered: (filtered: Invoice[]) => void
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
                invoice.clients.first_name.toLowerCase().includes(term) ||
                invoice.clients.last_name.toLowerCase().includes(term) ||
                invoice.clients.email.toLowerCase().includes(term) ||
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
        onFiltered(filteredInvoices)
    }, [filteredInvoices, onFiltered])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Invoices</h2>
                    <Badge variant="outline" className="text-muted-foreground">
                        {filteredInvoices.length} of {invoices.length}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconFilter className="mr-2 h-4 w-4" />
                                More Filters
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                                <IconSearch className="mr-2 h-4 w-4" />
                                Advanced Search
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <IconFilter className="mr-2 h-4 w-4" />
                                Date Range
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <IconDotsVertical className="mr-2 h-4 w-4" />
                                Export Data
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {onCreateNew && (
                        <Button onClick={onCreateNew} size="sm">
                            <IconPlus className="mr-2 h-4 w-4" />
                            New Invoice
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices, clients, or IDs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Status" />
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
            </div>
        </div>
    )
} 