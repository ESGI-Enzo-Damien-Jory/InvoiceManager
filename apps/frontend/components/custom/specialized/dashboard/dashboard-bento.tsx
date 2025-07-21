'use client'

import { useInvoices } from '@/hooks/use-invoices'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    FileText,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    MoreHorizontal,
    DollarSign,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardBento() {
    const { invoices = [] } = useInvoices()

    // Get recent invoices
    const recentInvoices = invoices
        .sort(
            (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )
        .slice(0, 4)

    // Calculate correct stats
    const sentInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Sent'
    ).length
    const paidInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Paid'
    ).length
    const overdueInvoices = invoices.filter(
        (invoice: any) => invoice.state === 'Overdue'
    ).length
    const totalRevenue = invoices.reduce(
        (sum: number, invoice: any) => sum + (invoice.total_amount || 0),
        0
    )

    const getStatusConfig = (status: string) => {
        const configs = {
            Draft: {
                label: 'Draft',
                variant: 'secondary' as const,
                icon: FileText,
            },
            Sent: { label: 'Sent', variant: 'default' as const, icon: Clock },
            Paid: {
                label: 'Paid',
                variant: 'default' as const,
                icon: CheckCircle,
            },
            Overdue: {
                label: 'Overdue',
                variant: 'destructive' as const,
                icon: AlertCircle,
            },
            Cancelled: {
                label: 'Cancelled',
                variant: 'secondary' as const,
                icon: FileText,
            },
        }
        return configs[status as keyof typeof configs] || configs.Draft
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Stats Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Quick Stats
                    </CardTitle>
                    <CardDescription>Key metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Sent Invoices
                            </p>
                            <p className="text-2xl font-bold">{sentInvoices}</p>
                            <Badge variant="outline" className="text-xs">
                                <Clock className="mr-1 h-3 w-3" />
                                Awaiting payment
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(totalRevenue)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                                <DollarSign className="mr-1 h-3 w-3" />
                                All time
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Paid Invoices
                            </p>
                            <p className="text-2xl font-bold">{paidInvoices}</p>
                            <Badge variant="outline" className="text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Successfully paid
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Overdue Invoices
                            </p>
                            <p className="text-2xl font-bold">
                                {overdueInvoices}
                            </p>
                            <Badge variant="outline" className="text-xs">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Past due date
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Recent Invoices
                            </CardTitle>
                            <CardDescription>
                                Latest invoice activity
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/invoices">View all</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentInvoices.length === 0 ? (
                        <div className="text-center py-6">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No invoices yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentInvoices.map((invoice: any) => {
                                const statusConfig = getStatusConfig(
                                    invoice.state
                                )
                                const StatusIcon = statusConfig.icon

                                return (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(
                                                        invoice.client
                                                            ?.first_name,
                                                        invoice.client
                                                            ?.last_name
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {invoice.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {invoice.client?.first_name}{' '}
                                                    {invoice.client?.last_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={statusConfig.variant}
                                                className="text-xs"
                                            >
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {statusConfig.label}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/invoices/${invoice.id}`}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
