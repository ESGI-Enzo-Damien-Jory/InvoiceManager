'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, DollarSign, Users } from 'lucide-react'
import { useInvoices } from '@/hooks/use-invoices'
import { InvoiceStats } from '@/components/custom/generic/invoice-stats'
import { InvoiceFilters } from '@/components/custom/generic/invoice-filters'
import { InvoiceTable } from '@/components/custom/generic/invoice-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { type Invoice } from '@/services/invoices'
import { invoicesService } from '@/services/invoices'
import { formatCurrency } from '@/lib/utils'

export default function InvoicesPage() {
    const router = useRouter()
    const { invoices, loading, error, deleteInvoice } = useInvoices()
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices)
    const [searchTerm, setSearchTerm] = useState('')

    const handleFiltered = useCallback((filtered: Invoice[]) => {
        setFilteredInvoices(filtered)
    }, [])

    // Update filtered invoices when invoices change
    useEffect(() => {
        setFilteredInvoices(invoices)
    }, [invoices])

    const handleView = (invoice: Invoice) => {
        router.push(`/invoices/${invoice.id}`)
    }

    const handleEdit = (invoice: Invoice) => {
        router.push(`/invoices/${invoice.id}/edit`)
    }

    const handleDelete = async (invoice: Invoice) => {
        if (confirm(`Are you sure you want to delete invoice "${invoice.title}"?`)) {
            try {
                await deleteInvoice(invoice.id)
            } catch (error) {
                console.error('Failed to delete invoice:', error)
            }
        }
    }

    const handleDownload = async (invoice: Invoice) => {
        try {
            const blob = await invoicesService.downloadPdf(invoice.id)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `invoice-${invoice.id}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Failed to download invoice:', error)
        }
    }

    const handleCreateNew = () => {
        router.push('/invoices/new')
    }

    // Calculate quick stats
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0)
    const paidInvoices = invoices.filter(invoice => invoice.state === 'Paid').length
    const pendingInvoices = invoices.filter(invoice => invoice.state === 'Sent').length
    const overdueInvoices = invoices.filter(invoice => invoice.state === 'Overdue').length

    if (loading) {
        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Header Skeleton */}
                <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="@container/card">
                            <CardHeader>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-20 mb-2" />
                                <Skeleton className="h-5 w-16" />
                            </CardHeader>
                            <CardFooter>
                                <Skeleton className="h-3 w-32" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {error && (
                <div className="px-4 lg:px-6">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Header */}
            <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your invoices and track payments efficiently
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateNew}
                        size="lg"
                        className="flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        New Invoice
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription className="flex items-center gap-2">
                            <DollarSign className="size-4" />
                            Total Revenue
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {formatCurrency(totalRevenue)}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs w-fit">
                            All invoices
                        </Badge>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Lifetime earnings
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription className="flex items-center gap-2">
                            <FileText className="size-4" />
                            Total Invoices
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {invoices.length}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs w-fit">
                            Created
                        </Badge>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            All time invoices
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            Paid Invoices
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {paidInvoices}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs w-fit">
                            Completed
                        </Badge>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Successful payments
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription className="flex items-center gap-2">
                            <Users className="size-4" />
                            Pending
                        </CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {pendingInvoices + overdueInvoices}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs w-fit">
                            Outstanding
                        </Badge>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Awaiting payment
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Content */}
            <div className="px-4 lg:px-6">
                {invoices.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center">
                                No invoices yet
                            </h3>
                            <p className="text-muted-foreground text-center mb-6 max-w-md">
                                Get started by creating your first invoice to track your business revenue and manage client payments.
                            </p>
                            <div className="flex gap-3">
                                <Button 
                                    onClick={handleCreateNew}
                                    size="lg"
                                    className="shadow-sm"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Invoice
                                </Button>
                                <Button 
                                    variant="outline"
                                    size="lg"
                                    onClick={() => window.open('/docs', '_blank')}
                                >
                                    View Documentation
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Invoice Management</CardTitle>
                                        <CardDescription>
                                            Search, filter, and manage your invoices
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search invoices..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filters
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <InvoiceFilters
                                    invoices={invoices}
                                    onFiltered={handleFiltered}
                                    onCreateNew={handleCreateNew}
                                />
                            </CardContent>
                        </Card>
                        
                        {/* Results */}
                        {filteredInvoices.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-3 mb-4">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-center">
                                        No matching invoices
                                    </h3>
                                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                                        Try adjusting your search criteria or filters to find what you're looking for.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button 
                                            onClick={() => {
                                                setFilteredInvoices(invoices)
                                                setSearchTerm('')
                                            }}
                                            variant="outline"
                                        >
                                            View All Invoices
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Invoice List</CardTitle>
                                            <CardDescription>
                                                {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <InvoiceTable
                                        invoices={filteredInvoices}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onDownload={handleDownload}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
