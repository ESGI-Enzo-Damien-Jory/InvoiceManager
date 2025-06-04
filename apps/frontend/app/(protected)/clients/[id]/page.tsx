'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Edit,
    Trash2,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
} from 'lucide-react'

import LoadingState from '@/components/custom/loading-state'
import ErrorState from '@/components/custom/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
    useClient,
    useDeleteClient,
    useUpdateClient,
} from '@/hooks/use-clients'
import EditClientDialog from '@/components/custom/specialized/clients/edit-clients-dialog'

interface ClientFormData {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    address: string
}

const initialFormData: ClientFormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
}

export default function ClientViewPage() {
    const params = useParams()
    const router = useRouter()
    const clientId = params.id as string

    const { data: client, status, error, refetch } = useClient(clientId)
    const deleteMutation = useDeleteClient()
    const updateMutation = useUpdateClient()

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
    const [editFormData, setEditFormData] =
        React.useState<ClientFormData>(initialFormData)

    const handleEdit = () => {
        if (client) {
            setEditFormData({
                first_name: client.first_name,
                last_name: client.last_name,
                email: client.email,
                phone_number: client.phone_number || '',
                address: client.address || '',
            })
            setIsEditDialogOpen(true)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!client) return

        if (
            !editFormData.first_name.trim() ||
            !editFormData.last_name.trim() ||
            !editFormData.email.trim()
        ) {
            alert('Please fill in all required fields.')
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(editFormData.email)) {
            alert('Please enter a valid email address.')
            return
        }

        try {
            await updateMutation.mutateAsync({
                clientId: client.id,
                payload: {
                    first_name: editFormData.first_name.trim(),
                    last_name: editFormData.last_name.trim(),
                    email: editFormData.email.trim(),
                    phone_number: editFormData.phone_number.trim() || null,
                    address: editFormData.address.trim() || null,
                },
            })
            setIsEditDialogOpen(false)
            resetEditForm()
        } catch (error) {
            alert(
                `Failed to update client: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        }
    }

    const resetEditForm = () => setEditFormData(initialFormData)

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(clientId)
            router.push('/clients')
        } catch (error) {
            alert(
                `Failed to delete client: ${
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred.'
                }`
            )
        }
    }

    const handleBack = () => {
        router.push('/clients')
    }

    if (status === 'pending') {
        return <LoadingState message="Loading client details…" />
    }

    if (status === 'error') {
        return (
            <ErrorState
                message={error?.message || 'Failed to load client details'}
                onRetry={() => refetch()}
            />
        )
    }

    if (!client) {
        return (
            <ErrorState
                message="Client not found"
                onRetry={() => router.push('/clients')}
            />
        )
    }

    return (
        <>
            {/* Loading overlay for mutations */}
            {(deleteMutation.isPending || updateMutation.isPending) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg border flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">
                            {deleteMutation.isPending && 'Deleting client...'}
                            {updateMutation.isPending && 'Updating client...'}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Clients
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {client.first_name} {client.last_name}
                            </h1>
                            <p className="text-muted-foreground">
                                Client Details
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="flex items-center gap-2"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Edit className="h-4 w-4" />
                            )}
                            Edit Client
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="flex items-center gap-2 text-destructive hover:text-destructive"
                            disabled={
                                deleteMutation.isPending ||
                                updateMutation.isPending
                            }
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Delete Client
                        </Button>
                    </div>
                </div>

                {/* Client Information Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Full Name
                                </label>
                                <p className="text-lg font-medium">
                                    {client.first_name} {client.last_name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Client ID
                                </label>
                                <p className="text-sm font-mono text-muted-foreground">
                                    {client.id}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Email Address
                                </label>
                                <p className="text-sm">{client.email}</p>
                            </div>
                            {client.phone_number && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Phone Number
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm tabular-nums">
                                            {client.phone_number}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {client.address && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Address
                                    </label>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <p className="text-sm">
                                            {client.address}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                </label>
                                <div className="mt-1">
                                    <Badge variant="secondary">Active</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Created Date
                                </label>
                                <p className="text-sm">
                                    {new Date(
                                        client.created_at
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            {client.updated_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Last Updated
                                    </label>
                                    <p className="text-sm">
                                        {new Date(
                                            client.updated_at
                                        ).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Placeholder for future sections */}
                <div className="space-y-6">
                    {/* Projects Section - Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center py-8">
                                Projects section will be implemented here
                            </p>
                        </CardContent>
                    </Card>

                    {/* Activity Section - Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center py-8">
                                Activity timeline will be implemented here
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Client Dialog */}
                <EditClientDialog
                    isEditDialogOpen={isEditDialogOpen}
                    setIsEditDialogOpen={setIsEditDialogOpen}
                    handleEditSubmit={handleEditSubmit}
                    formData={editFormData}
                    setFormData={setEditFormData}
                    resetForm={resetEditForm}
                    updateMutation={updateMutation}
                    selectedClient={client}
                />

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Client</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete &apos;
                                {client.first_name} {client.last_name}&apos;?
                                This action cannot be undone and will remove all
                                associated data including projects and
                                activities.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                disabled={
                                    deleteMutation.isPending ||
                                    updateMutation.isPending
                                }
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={
                                    deleteMutation.isPending ||
                                    updateMutation.isPending
                                }
                                className="border-border text-foreground hover:bg-muted hover:border-muted-foreground font-medium bg-transparent"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Client'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
