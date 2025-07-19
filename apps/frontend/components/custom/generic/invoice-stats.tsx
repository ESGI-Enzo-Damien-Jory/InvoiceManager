'use client'

import { IconReceipt, IconCash, IconCheck, IconAlertTriangle, IconFileText, IconSend } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type Invoice } from '@/services/invoices'
import { formatCurrency } from '@/lib/utils'

interface InvoiceStatsProps {
    invoices: Invoice[]
}

export function InvoiceStats({ invoices }: InvoiceStatsProps) {
    const totalInvoices = invoices.length
    const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0)
    const paidInvoices = invoices.filter(invoice => invoice.state === 'Paid').length
    const overdueInvoices = invoices.filter(invoice => invoice.state === 'Overdue').length
    const draftInvoices = invoices.filter(invoice => invoice.state === 'Draft').length
    const sentInvoices = invoices.filter(invoice => invoice.state === 'Sent').length

    const stats = [
        {
            title: 'Total Revenue',
            value: formatCurrency(totalAmount),
            description: 'Sum of all invoices',
            icon: IconReceipt,
            footerText: 'All time earnings'
        },
        {
            title: 'Paid Invoices',
            value: paidInvoices.toString(),
            description: 'Completed payments',
            icon: IconCheck,
            footerText: 'Successful transactions'
        },
        {
            title: 'Pending Invoices',
            value: sentInvoices.toString(),
            description: 'Awaiting payment',
            icon: IconSend,
            footerText: 'Outstanding invoices'
        },
        {
            title: 'Overdue Invoices',
            value: overdueInvoices.toString(),
            description: 'Past due date',
            icon: IconAlertTriangle,
            footerText: 'Requires attention'
        }
    ]

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {stats.map((stat, index) => {
                const IconComponent = stat.icon
                
                return (
                    <Card key={index} className="@container/card">
                        <CardHeader>
                            <CardDescription className="flex items-center gap-2">
                                <IconComponent className="size-4" />
                                {stat.title}
                            </CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {stat.value}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs w-fit">
                                {stat.description}
                            </Badge>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="text-muted-foreground">
                                {stat.footerText}
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
} 