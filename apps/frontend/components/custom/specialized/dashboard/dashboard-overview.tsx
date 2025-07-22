'use client'

import { useInvoices } from '@/hooks/use-invoices'
import { useClients } from '@/hooks/use-clients'
import { useItems } from '@/hooks/use-items'
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
    Users,
    CreditCard,
    Activity,
    TrendingUp,
    TrendingDown,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function DashboardOverview() {
    const { invoices = [] } = useInvoices()
    const { data: clients = [] } = useClients()
    const { data: items = [] } = useItems()

    // Calculate metrics
    const totalRevenue = invoices.reduce(
        (sum: number, invoice: any) => sum + (invoice.total_amount || 0),
        0
    )

    const totalInvoices = invoices.length
    const totalClients = clients.length
    const totalItems = items.length

    const cards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            description: 'Total revenue from all invoices',
            icon: DollarSign,
            trend: '+20.1%',
            trendUp: true,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            title: 'Total Invoices',
            value: totalInvoices.toString(),
            description: 'Number of invoices created',
            icon: CreditCard,
            trend: '+12.5%',
            trendUp: true,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Active Clients',
            value: totalClients.toString(),
            description: 'Number of active clients',
            icon: Users,
            trend: '+8.2%',
            trendUp: true,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            title: 'Catalog Items',
            value: totalItems.toString(),
            description: 'Items in your catalog',
            icon: Activity,
            trend: '+5.4%',
            trendUp: true,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
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
        </div>
    )
}
