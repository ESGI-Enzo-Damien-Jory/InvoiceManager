'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
    Mail,
    Phone,
    MapPin,
    Trash2,
    Edit2,
    Plus,
    Calendar,
    FileText,
    User,
    AlertCircle,
    RefreshCw,
    DollarSign,
    Clock,
    CheckCircle,
    Building,
    Globe,
    Star,
    TrendingUp,
    Activity,
} from 'lucide-react'
import CommonPageLayout from '@/components/custom/common-page-layout'
import type { Client } from '@/types/clients'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function ClientPage() {
    const { id } = useParams()
    const router = useRouter()
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            if (!id) {
                setError('No client selected.')
                setLoading(false)
                return
            }
            setLoading(true)
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Authentication required')
                const res = await fetch(`${API_URL}/api/clients/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!res.ok) throw new Error('Failed to load client')
                setClient(await res.json())
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleDelete = async () => {
        if (!client) return
        setActionLoading(true)
        setActionError(null)
        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Authentication required')
            const res = await fetch(`${API_URL}/api/clients/${client.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Delete operation failed')
            router.push('/clients')
        } catch (err: any) {
            setActionError(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const mockStats = {
        totalInvoices: 12,
        totalRevenue: 24750,
        avgInvoiceValue: 2062.5,
        pendingAmount: 3200,
        lastInvoiceDate: '2024-01-15',
        paymentHistory: 92, // percentage
    }

    const mockRecentActivity = [
        {
            type: 'invoice',
            description: 'Invoice #INV-001 created',
            date: '2024-01-15',
            amount: 1500,
        },
        {
            type: 'payment',
            description: 'Payment received for Invoice #INV-002',
            date: '2024-01-10',
            amount: 2300,
        },
        {
            type: 'contact',
            description: 'Contact information updated',
            date: '2024-01-08',
            amount: null,
        },
        {
            type: 'invoice',
            description: 'Invoice #INV-003 sent',
            date: '2024-01-05',
            amount: 800,
        },
    ]

    if (loading) {
        return (
            <CommonPageLayout>
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-6 mb-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-3">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-32" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mb-6">
                            <Skeleton className="h-10 w-28" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                        <Skeleton className="h-px w-full" />
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-lg border bg-card"
                                >
                                    <Skeleton className="h-4 w-16 mb-2" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="h-12 w-full" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-5/6" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-4/5" />
                                <Skeleton className="h-6 w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>
            </CommonPageLayout>
        )
    }

    if (error) {
        return (
            <CommonPageLayout>
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <AlertCircle className="h-16 w-16 text-destructive" />
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">
                                Error Loading Client
                            </h2>
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                </div>
            </CommonPageLayout>
        )
    }

    if (!client) {
        return (
            <CommonPageLayout>
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <User className="h-16 w-16 text-muted-foreground" />
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">
                                Client Not Found
                            </h2>
                            <p className="text-muted-foreground">
                                The requested client could not be found.
                            </p>
                        </div>
                        <Button onClick={() => router.push('/clients')}>
                            Back to Clients
                        </Button>
                    </div>
                </div>
            </CommonPageLayout>
        )
    }

    return (
        <CommonPageLayout>
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border border-background shadow-xl">
                                    {client.avatar ? (
                                        <AvatarImage src={client.avatar} />
                                    ) : (
                                        <AvatarFallback className="text-2xl font-bold ">
                                            {client.first_name?.[0]}
                                            {client.last_name?.[0]}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight">
                                        {client.first_name} {client.last_name}
                                    </h1>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Badge
                                        variant="secondary"
                                        className="font-mono text-xs"
                                    >
                                        ID: {client.id}
                                    </Badge>
                                    <Badge
                                        variant="default"
                                        className="text-xs bg-green-100 text-green-800 border-green-200"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.push(`/clients/${client.id}/edit`)
                                }
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Client</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete the client
                                            and all associated data.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline">
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        $
                                        {mockStats.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Invoices
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {mockStats.totalInvoices}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Avg. Invoice
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        $
                                        {mockStats.avgInvoiceValue.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Pending
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        $
                                        {mockStats.pendingAmount.toLocaleString()}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <Separator />
                </div>

                {actionError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Action Failed</AlertTitle>
                        <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                        <TabsTrigger
                            value="general"
                            className="flex items-center gap-2"
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="invoices"
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Invoices
                        </TabsTrigger>
                        <TabsTrigger
                            value="activity"
                            className="flex items-center gap-2"
                        >
                            <Activity className="h-4 w-4" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-8">
                        {/* Contact Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-semibold">
                                    Contact Information
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="group p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-gray-100">
                                                <Mail className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-sm font-medium text-gray-600">
                                                    Email Address
                                                </label>
                                                <p className="font-semibold text-gray-900">
                                                    {client.email}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Primary contact method
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-gray-100">
                                                <Phone className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-sm font-medium text-gray-600">
                                                    Phone Number
                                                </label>
                                                <p className="font-semibold text-gray-900">
                                                    {client.phone_number ||
                                                        'Not provided'}
                                                </p>
                                                {client.phone_number && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Mobile
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="group p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-full bg-gray-100">
                                                <MapPin className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-sm font-medium text-gray-600">
                                                    Address
                                                </label>
                                                <p className="font-semibold text-gray-900 leading-relaxed">
                                                    {client.address ||
                                                        'Not provided'}
                                                </p>
                                                {client.address && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Billing address
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Account Information */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold">
                                Account Information
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-gray-100">
                                            <Calendar className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">
                                                Last Updated
                                            </label>
                                            <p className="font-semibold text-gray-900">
                                                {formatDate(client.updated_at)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Profile information
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="invoices" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                Invoice Management
                            </h2>
                            <Button
                                onClick={() =>
                                    router.push(
                                        `/clients/${client.id}/invoices/new`
                                    )
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Invoice
                            </Button>
                        </div>

                        <div className="flex flex-col items-center justify-center py-16 space-y-6">
                            <div className="p-6 rounded-full bg-blue-50 border-4 border-blue-100">
                                <FileText className="h-12 w-12 text-blue-600" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-xl font-semibold">
                                    No invoices yet
                                </h3>
                                <p className="text-muted-foreground max-w-md">
                                    Get started by creating your first invoice
                                    for this client. You can track payments,
                                    send reminders, and manage billing all in
                                    one place.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/clients/${client.id}/invoices/new`
                                        )
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Invoice
                                </Button>
                                <Button variant="outline">
                                    <Globe className="mr-2 h-4 w-4" />
                                    View Templates
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                Recent Activity
                            </h2>
                            <Badge variant="secondary">Last 30 days</Badge>
                        </div>

                        <div className="space-y-4">
                            {mockRecentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <div
                                        className={`p-2 rounded-full ${
                                            activity.type === 'invoice'
                                                ? 'bg-blue-100'
                                                : activity.type === 'payment'
                                                  ? 'bg-green-100'
                                                  : 'bg-gray-100'
                                        }`}
                                    >
                                        {activity.type === 'invoice' && (
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        )}
                                        {activity.type === 'payment' && (
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                        )}
                                        {activity.type === 'contact' && (
                                            <User className="h-4 w-4 text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {activity.description}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(activity.date)}
                                        </p>
                                    </div>
                                    {activity.amount && (
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                $
                                                {activity.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </CommonPageLayout>
    )
}
