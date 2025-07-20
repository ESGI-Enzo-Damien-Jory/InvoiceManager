'use client'

import React from 'react'
import { useInvoices } from '@/hooks/use-invoices'
import { useClients } from '@/hooks/use-clients'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
    Bar, 
    BarChart, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Line, 
    LineChart, 
    PieChart, 
    Pie, 
    Cell, 
    Area, 
    AreaChart,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/utils'
import type { Invoice, Client } from '@/types'

export function AnalyticsCharts({ className }: { className?: string }) {
    const { invoices = [] } = useInvoices()
    const { data: clients = [] } = useClients()

    const chartData = React.useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            return {
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                year: date.getFullYear(),
                revenue: 0,
                sent: 0,
                paid: 0,
                overdue: 0,
                draft: 0,
            }
        }).reverse()

        invoices.forEach((invoice: Invoice) => {
            const invoiceDate = new Date(invoice.created_at)
            const monthIndex = months.findIndex(m => 
                m.month === invoiceDate.toLocaleDateString('en-US', { month: 'short' }) &&
                m.year === invoiceDate.getFullYear()
            )

            if (monthIndex !== -1) {
                months[monthIndex].revenue += invoice.total_amount || 0
                if (invoice.state) {
                    const stateKey = invoice.state.toLowerCase() as keyof typeof months[number]
                    if (stateKey in months[monthIndex]) {
                        (months[monthIndex][stateKey] as number)++
                    }
                }
            }
        })
        return months
    }, [invoices])

    const statusData = React.useMemo(() => {
        const statusMap = new Map<string, number>()
        invoices.forEach(invoice => {
            if (invoice.state) {
                statusMap.set(invoice.state, (statusMap.get(invoice.state) || 0) + 1)
            }
        })
        return Array.from(statusMap.entries()).map(([status, value]) => ({ status, value }))
    }, [invoices])

    const clientData = React.useMemo(() => {
        const clientMap = new Map<string, { name: string; total: number; paid: number; pending: number }>()
        
        invoices.forEach((invoice: Invoice) => {
            const client = clients.find((c: Client) => c.id === invoice.client_id)
            
            if (client) {
                const clientName = `${client.first_name} ${client.last_name}`
                if (!clientMap.has(client.id)) {
                    clientMap.set(client.id, { name: clientName, total: 0, paid: 0, pending: 0 })
                }
                const clientEntry = clientMap.get(client.id)!
                clientEntry.total += invoice.total_amount || 0
                if (invoice.state === 'Paid') clientEntry.paid += invoice.total_amount || 0
                if (invoice.state === 'Sent') clientEntry.pending += invoice.total_amount || 0
            }
        })
        
        return Array.from(clientMap.values()).sort((a, b) => b.total - a.total).slice(0, 5)
    }, [invoices, clients])

    const revenueChartConfig = {
        revenue: { label: "Revenue", color: "var(--chart-1)" },
    } satisfies ChartConfig

    const statusChartConfig = {
        paid: { label: "Paid", color: "var(--chart-1)" },
        sent: { label: "Sent", color: "var(--chart-2)" },
        overdue: { label: "Overdue", color: "var(--chart-3)" },
        draft: { label: "Draft", color: "var(--chart-4)" },
        cancelled: { label: "Cancelled", color: "var(--chart-5)" },
    } satisfies ChartConfig

    const trendsChartConfig = {
        paid: { label: "Paid", color: "var(--chart-1)" },
        sent: { label: "Sent", color: "var(--chart-2)" },
        overdue: { label: "Overdue", color: "var(--chart-3)" },
    } satisfies ChartConfig

    const clientsChartConfig = {
        total: { label: "Total Revenue", color: "var(--chart-1)" },
        paid: { label: "Paid", color: "var(--chart-2)" },
        pending: { label: "Pending", color: "var(--chart-3)" },
    } satisfies ChartConfig

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Revenue Analytics</CardTitle>
                <CardDescription>Comprehensive insights into your business performance</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="revenue" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        <TabsTrigger value="status">Status</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                        <TabsTrigger value="clients">Clients</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="revenue" className="pt-4">
                        <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
                            <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => formatCurrency(value as number)} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Area dataKey="revenue" type="natural" fill="var(--color-revenue)" fillOpacity={0.4} stroke="var(--color-revenue)" />
                            </AreaChart>
                        </ChartContainer>
                    </TabsContent>
                    
                    <TabsContent value="status" className="pt-4">
                        <ChartContainer config={statusChartConfig} className="h-[250px] w-full">
                            <PieChart accessibilityLayer>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={statusData} dataKey="value" nameKey="status" innerRadius={60} strokeWidth={5}>
                                    {statusData.map((entry) => (
                                        <Cell key={entry.status} fill={`var(--color-${entry.status.toLowerCase()})`} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                            </PieChart>
                        </ChartContainer>
                    </TabsContent>
                    
                    <TabsContent value="trends" className="pt-4">
                        <ChartContainer config={trendsChartConfig} className="h-[250px] w-full">
                            <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Line dataKey="paid" type="natural" stroke="var(--color-paid)" strokeWidth={2} dot={false} />
                                <Line dataKey="sent" type="natural" stroke="var(--color-sent)" strokeWidth={2} dot={false} />
                                <Line dataKey="overdue" type="natural" stroke="var(--color-overdue)" strokeWidth={2} dot={false} />
                                <ChartLegend content={<ChartLegendContent />} />
                            </LineChart>
                        </ChartContainer>
                    </TabsContent>
                    
                    <TabsContent value="clients" className="pt-4">
                        <ChartContainer config={clientsChartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={clientData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} />
                                <XAxis dataKey="total" type="number" hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="total" layout="vertical" stackId="a" fill="var(--color-total)" radius={4} />
                                <Bar dataKey="paid" layout="vertical" stackId="a" fill="var(--color-paid)" radius={4} />
                                <Bar dataKey="pending" layout="vertical" stackId="a" fill="var(--color-pending)" radius={4} />
                                <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                        </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}