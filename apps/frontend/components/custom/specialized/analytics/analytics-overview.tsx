'use client'

import { useInvoices } from '@/hooks/use-invoices'
import { useClients } from '@/hooks/use-clients'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    Target,
    Zap,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function AnalyticsOverview() {
    const { invoices = [] } = useInvoices()
    const { data: clients = [] } = useClients()

    // Calculate advanced metrics
    const totalRevenue = invoices.reduce(
        (sum: number, invoice: any) => sum + (invoice.total_amount || 0),
        0
    )

    const totalInvoices = invoices.length
    const totalClients = clients.length

    const sentInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Sent'
    ).length
    const paidInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Paid'
    ).length
    const overdueInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Overdue'
    ).length

    // Calculate conversion rates
    const conversionRate =
        totalInvoices > 0
            ? ((paidInvoices / totalInvoices) * 100).toFixed(1)
            : '0'
    const averageInvoiceValue =
        totalInvoices > 0 ? totalRevenue / totalInvoices : 0

    // Calculate monthly trends (last 3 months)
    const now = new Date()
    const last3Months = Array.from({ length: 3 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            invoices: invoices.filter((invoice: any) => {
                const invoiceDate = new Date(invoice.created_at)
                return (
                    invoiceDate.getMonth() === date.getMonth() &&
                    invoiceDate.getFullYear() === date.getFullYear()
                )
            }).length,
            revenue: invoices
                .filter((invoice: any) => {
                    const invoiceDate = new Date(invoice.created_at)
                    return (
                        invoiceDate.getMonth() === date.getMonth() &&
                        invoiceDate.getFullYear() === date.getFullYear()
                    )
                })
                .reduce(
                    (sum: number, invoice: any) =>
                        sum + (invoice.total_amount || 0),
                    0
                ),
        }
    }).reverse()

    const currentMonth = last3Months[2]
    const previousMonth = last3Months[1]

    const revenueGrowth =
        previousMonth.revenue > 0
            ? (
                  ((currentMonth.revenue - previousMonth.revenue) /
                      previousMonth.revenue) *
                  100
              ).toFixed(1)
            : '0'

    const invoiceGrowth =
        previousMonth.invoices > 0
            ? (
                  ((currentMonth.invoices - previousMonth.invoices) /
                      previousMonth.invoices) *
                  100
              ).toFixed(1)
            : '0'

    const cards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            description: 'Lifetime earnings',
            icon: DollarSign,
            trend: revenueGrowth,
            trendUp: parseFloat(revenueGrowth) >= 0,
            color: 'text-green-600',
        },
        {
            title: 'Conversion Rate',
            value: `${conversionRate}%`,
            description: 'Invoices paid vs sent',
            icon: Target,
            trend: 'High',
            trendUp: true,
            color: 'text-blue-600',
        },
        {
            title: 'Average Invoice',
            value: formatCurrency(averageInvoiceValue),
            description: 'Per invoice value',
            icon: Zap,
            trend: 'Stable',
            trendUp: true,
            color: 'text-purple-600',
        },
        {
            title: 'Active Clients',
            value: totalClients.toString(),
            description: 'Total client base',
            icon: Users,
            trend: '+5.2%',
            trendUp: true,
            color: 'text-orange-600',
        },
    ]

    const statusMetrics = [
        {
            title: 'Sent',
            value: sentInvoices,
            description: 'Awaiting payment',
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
        {
            title: 'Paid',
            value: paidInvoices,
            description: 'Successfully collected',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            title: 'Overdue',
            value: overdueInvoices,
            description: 'Past due date',
            icon: AlertCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Main Metrics */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, index) => (
                    <Card key={index} className="@container/card">
                        <CardHeader>
                            <CardDescription className="flex items-center gap-2">
                                <card.icon className="size-4" />
                                {card.title}
                            </CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {card.value}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs w-fit">
                                {card.trendUp ? (
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                ) : (
                                    <TrendingDown className="mr-1 h-3 w-3" />
                                )}
                                {card.trend}
                            </Badge>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="text-muted-foreground">
                                {card.description}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Status Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                {statusMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`p-3 rounded-lg ${metric.bgColor}`}
                                >
                                    <metric.icon
                                        className={`h-6 w-6 ${metric.color}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {metric.title}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {metric.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {metric.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Monthly Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                    <CardDescription>
                        Revenue and invoice growth over the last 3 months
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {last3Months.map((month, index) => (
                            <div key={index} className="text-center">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {month.month}
                                </p>
                                <p className="text-lg font-bold">
                                    {formatCurrency(month.revenue)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {month.invoices} invoices
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
