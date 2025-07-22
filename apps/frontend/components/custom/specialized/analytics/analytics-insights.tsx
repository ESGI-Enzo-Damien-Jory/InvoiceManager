'use client'

import { useInvoices } from '@/hooks/use-invoices'
import { useClients } from '@/hooks/use-clients'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    Users,
    Target,
    Zap,
    Award,
    Calendar,
    BarChart3,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function AnalyticsInsights() {
    const { invoices = [] } = useInvoices()
    const { data: clients = [] } = useClients()

    // Calculate insights
    const totalRevenue = invoices.reduce(
        (sum: number, invoice: any) => sum + (invoice.total_amount || 0),
        0
    )

    const totalInvoices = invoices.length
    const sentInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Sent'
    ).length
    const paidInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Paid'
    ).length
    const overdueInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Overdue'
    ).length

    const conversionRate =
        totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0
    const averageInvoiceValue =
        totalInvoices > 0 ? totalRevenue / totalInvoices : 0

    // Calculate monthly performance
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const currentMonthInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.created_at)
        return (
            invoiceDate.getMonth() === currentMonth.getMonth() &&
            invoiceDate.getFullYear() === currentMonth.getFullYear()
        )
    })

    const previousMonthInvoices = invoices.filter((invoice: any) => {
        const invoiceDate = new Date(invoice.created_at)
        return (
            invoiceDate.getMonth() === previousMonth.getMonth() &&
            invoiceDate.getFullYear() === previousMonth.getFullYear()
        )
    })

    const currentMonthRevenue = currentMonthInvoices.reduce(
        (sum: number, invoice: any) => sum + (invoice.total_amount || 0),
        0
    )

    const previousMonthRevenue = previousMonthInvoices.reduce(
        (sum: number, invoice: any) => sum + (invoice.total_amount || 0),
        0
    )

    const revenueGrowth =
        previousMonthRevenue > 0
            ? ((currentMonthRevenue - previousMonthRevenue) /
                  previousMonthRevenue) *
              100
            : 0

    // Generate insights
    const generateInsights = () => {
        const insights = []

        // Revenue insights
        if (revenueGrowth > 0) {
            insights.push({
                type: 'positive',
                icon: TrendingUp,
                title: 'Revenue Growth',
                description: `Your revenue increased by ${revenueGrowth.toFixed(1)}% this month`,
                color: 'text-green-600',
                bgColor: 'bg-green-100 dark:bg-green-900/20',
            })
        } else if (revenueGrowth < 0) {
            insights.push({
                type: 'warning',
                icon: TrendingDown,
                title: 'Revenue Decline',
                description: `Your revenue decreased by ${Math.abs(revenueGrowth).toFixed(1)}% this month`,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            })
        }

        // Conversion rate insights
        if (conversionRate >= 80) {
            insights.push({
                type: 'positive',
                icon: Award,
                title: 'Excellent Conversion',
                description: `${conversionRate.toFixed(1)}% conversion rate is outstanding`,
                color: 'text-green-600',
                bgColor: 'bg-green-100 dark:bg-green-900/20',
            })
        } else if (conversionRate >= 60) {
            insights.push({
                type: 'neutral',
                icon: Target,
                title: 'Good Conversion',
                description: `${conversionRate.toFixed(1)}% conversion rate is above average`,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            })
        } else {
            insights.push({
                type: 'warning',
                icon: AlertTriangle,
                title: 'Low Conversion',
                description: `${conversionRate.toFixed(1)}% conversion rate needs improvement`,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            })
        }

        // Overdue invoices insights
        if (overdueInvoices > 0) {
            insights.push({
                type: 'warning',
                icon: Clock,
                title: 'Overdue Invoices',
                description: `${overdueInvoices} invoices are past due - follow up needed`,
                color: 'text-red-600',
                bgColor: 'bg-red-100 dark:bg-red-900/20',
            })
        }

        // Average invoice value insights
        if (averageInvoiceValue > 1000) {
            insights.push({
                type: 'positive',
                icon: DollarSign,
                title: 'High Value Invoices',
                description: `Average invoice value of ${formatCurrency(averageInvoiceValue)}`,
                color: 'text-green-600',
                bgColor: 'bg-green-100 dark:bg-green-900/20',
            })
        }

        return insights
    }

    // Generate recommendations
    const generateRecommendations = () => {
        const recommendations = []

        if (conversionRate < 70) {
            recommendations.push({
                icon: Target,
                title: 'Improve Follow-up',
                description:
                    'Send payment reminders to increase conversion rate',
                priority: 'high',
            })
        }

        if (overdueInvoices > 0) {
            recommendations.push({
                icon: Clock,
                title: 'Address Overdue Invoices',
                description:
                    'Contact clients with overdue payments immediately',
                priority: 'high',
            })
        }

        if (clients.length < 10) {
            recommendations.push({
                icon: Users,
                title: 'Expand Client Base',
                description: 'Focus on acquiring new clients to grow revenue',
                priority: 'medium',
            })
        }

        if (averageInvoiceValue < 500) {
            recommendations.push({
                icon: DollarSign,
                title: 'Increase Invoice Values',
                description: 'Consider bundling services or raising prices',
                priority: 'medium',
            })
        }

        return recommendations
    }

    // Get top performing clients
    const getTopClients = () => {
        const clientMap = new Map()

        invoices.forEach((invoice: any) => {
            const client = clients.find((c: any) => c.id === invoice.client_id)

            if (client) {
                const clientId = client.id
                const clientName = `${client.first_name} ${client.last_name}`

                if (!clientMap.has(clientId)) {
                    clientMap.set(clientId, {
                        name: clientName,
                        total: 0,
                        invoices: 0,
                    })
                }

                const clientEntry = clientMap.get(clientId)
                clientEntry.total += invoice.total_amount || 0
                clientEntry.invoices += 1
            }
        })

        return Array.from(clientMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 3)
    }

    const insights = generateInsights()
    const recommendations = generateRecommendations()
    const topClients = getTopClients()

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }

    return (
        <div className="space-y-6">
            {/* Key Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Key Insights
                    </CardTitle>
                    <CardDescription>
                        Automated analysis of your business performance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {insights.map((insight, index) => {
                        const InsightIcon = insight.icon
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                                <div
                                    className={`p-2 rounded-lg ${insight.bgColor}`}
                                >
                                    <InsightIcon
                                        className={`h-4 w-4 ${insight.color}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {insight.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Recommendations
                    </CardTitle>
                    <CardDescription>
                        Actionable steps to improve your business
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations.map((rec, index) => {
                        const RecIcon = rec.icon
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                                <RecIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium">
                                            {rec.title}
                                        </p>
                                        <Badge
                                            variant={
                                                rec.priority === 'high'
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                            className="text-xs"
                                        >
                                            {rec.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {rec.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Top Clients */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Top Performing Clients
                    </CardTitle>
                    <CardDescription>
                        Your highest value clients
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {topClients.map((client, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg border"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                    {getInitials(
                                        client.name.split(' ')[0],
                                        client.name.split(' ')[1]
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium">
                                    {client.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {client.invoices} invoices
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">
                                    {formatCurrency(client.total)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Total revenue
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
