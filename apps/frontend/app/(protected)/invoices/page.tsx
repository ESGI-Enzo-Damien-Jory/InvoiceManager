'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconFileText, IconPlus } from '@tabler/icons-react'
import { useInvoices } from '@/hooks/use-invoices'
import { InvoiceStats } from '@/components/custom/generic/invoice-stats'
import { InvoiceFilters } from '@/components/custom/generic/invoice-filters'
import { InvoiceTable } from '@/components/custom/generic/invoice-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { type Invoice } from '@/services/invoices'
import { invoicesService } from '@/services/invoices'

export default function InvoicesPage() {
    const router = useRouter()
    const { invoices, loading, error, deleteInvoice } = useInvoices()
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices)

    // Update filtered invoices when invoices change
    useEffect(() => {
        setFilteredInvoices(invoices)
    }, [invoices])

    const handleView = (invoice: Invoice) => {
        router.push(`/invoices/${invoice.id}`)
    }

    const handleEdit = (invoice: Invoice) => {
        router.push(`/invoices/${invoice.id}`)
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

    if (loading) {
        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
        )
    }

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {error && (
                <Alert variant="destructive" className="mx-4 lg:mx-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <InvoiceStats invoices={invoices} />

            <div className="px-4 lg:px-6">
                <div className="space-y-4">
                    <InvoiceFilters
                        invoices={invoices}
                        onFiltered={setFilteredInvoices}
                        onCreateNew={handleCreateNew}
                    />
                    
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto max-w-md">
                                <div className="rounded-full bg-muted p-3 w-fit mx-auto mb-4">
                                    <IconFileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {invoices.length === 0 
                                        ? "No invoices yet"
                                        : "No matching invoices"
                                    }
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {invoices.length === 0 
                                        ? "Get started by creating your first invoice to track your business revenue."
                                        : "Try adjusting your search criteria or filters to find what you're looking for."
                                    }
                                </p>
                                {invoices.length === 0 && (
                                    <Button 
                                        onClick={handleCreateNew}
                                        size="lg"
                                    >
                                        <IconPlus className="mr-2 h-4 w-4" />
                                        Create First Invoice
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <InvoiceTable
                            invoices={filteredInvoices}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onDownload={handleDownload}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
