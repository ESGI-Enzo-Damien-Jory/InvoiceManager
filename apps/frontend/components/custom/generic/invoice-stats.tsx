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
            trend: '+12.5%',
            trendIcon: IconCash,
            trendText: 'Revenue this month',
            footerText: 'All time earnings'
        },
        {
            title: 'Paid Invoices',
            value: paidInvoices.toString(),
            description: 'Completed payments',
            icon: IconCheck,
            trend: '+8.2%',
            trendIcon: IconCheck,
            trendText: 'Payment rate improving',
            footerText: 'Successful transactions'
        },
        {
            title: 'Pending Invoices',
            value: sentInvoices.toString(),
            description: 'Awaiting payment',
            icon: IconSend,
            trend: '-5.1%',
            trendIcon: IconSend,
            trendText: 'Reduced pending amount',
            footerText: 'Outstanding invoices'
        },
        {
            title: 'Overdue Invoices',
            value: overdueInvoices.toString(),
            description: 'Past due date',
            icon: IconAlertTriangle,
            trend: '-15.3%',
            trendIcon: IconAlertTriangle,
            trendText: 'Overdue decreasing',
            footerText: 'Requires attention'
        }
    ]

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {stats.map((stat, index) => {
                const IconComponent = stat.icon
                const TrendIcon = stat.trendIcon
                
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
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                    {stat.description}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    <TrendIcon className="size-3 mr-1" />
                                    {stat.trend}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                {stat.trendText}{' '}
                                <TrendIcon className="size-4" />
                            </div>
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