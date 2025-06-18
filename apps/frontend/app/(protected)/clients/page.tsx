'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Client } from '@inma/types'

import {
    useClients,
    useCreateClient,
    useUpdateClient,
    useDeleteClient,
} from '@/hooks/use-clients'
import type { CreateClientPayload } from '@/services/clients'
import CreateClientDialog from '@/components/custom/specialized/clients/create-clients-dialog'
import EditClientDialog from '@/components/custom/specialized/clients/edit-clients-dialog'
import { columns } from '@/types/columns/client'
import DataTable from '@/components/custom/generic/data-table'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

import EmptyState from '@/components/custom/empty-state'
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
    address: '',
    phone_number: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ClientsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { data: clients = [], status, error, refetch } = useClients()
    const createMutation = useCreateClient()
    const updateMutation = useUpdateClient()
    const deleteMutation = useDeleteClient()

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
    const [clientsToDelete, setClientsToDelete] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [deletingClientId, setDeletingClientId] = useState<string | null>(
        null
    )

    const [createFormData, setCreateFormData] =
        useState<ClientFormData>(initialFormData)
    const [editFormData, setEditFormData] =
        useState<ClientFormData>(initialFormData)

    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsCreateDialogOpen(true)
            const url = new URL(window.location.href)
            url.searchParams.delete('create')
            window.history.replaceState({}, '', url.toString())
        }
    }, [searchParams])

    const isPerformingMutation =
        createMutation.isPending ||
        updateMutation.isPending ||
        (deleteMutation.isPending && clientsToDelete.length > 0)

    const resetCreateForm = () => setCreateFormData(initialFormData)
    const resetEditForm = () => setEditFormData(initialFormData)

    const validateForm = (formData: ClientFormData): string | null => {
        if (
            !formData.first_name.trim() ||
            !formData.last_name.trim() ||
            !formData.email.trim()
        ) {
            return 'Please fill in all required fields.'
        }
        if (!EMAIL_REGEX.test(formData.email)) {
            return 'Please enter a valid email address.'
        }
        return null
    }

    const showErrorAlert = (message: string) => {
        alert(message)
    }

    const handleError = (error: unknown, action: string) => {
        const message =
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred.'
        showErrorAlert(`Failed to ${action}: ${message}`)
    }

    const handleRefetch = () => {
        refetch()
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationError = validateForm(createFormData)
        if (validationError) {
            showErrorAlert(validationError)
            return
        }

        try {
            const payload: CreateClientPayload = {
                first_name: createFormData.first_name.trim(),
                last_name: createFormData.last_name.trim(),
                email: createFormData.email.trim(),
                phone_number: createFormData.phone_number.trim() || null,
                address: createFormData.address.trim() || null,
            }
            await createMutation.mutateAsync(payload)
            setIsCreateDialogOpen(false)
            resetCreateForm()
        } catch (error) {
            handleError(error, 'create client')
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClient) return

        const validationError = validateForm(editFormData)
        if (validationError) {
            showErrorAlert(validationError)
            return
        }

        try {
            await updateMutation.mutateAsync({
                clientId: selectedClient.id,
                payload: {
                    first_name: editFormData.first_name.trim(),
                    last_name: editFormData.last_name.trim(),
                    email: editFormData.email.trim(),
                    phone_number: editFormData.phone_number.trim() || null,
                    address: editFormData.address.trim() || null,
                },
            })
            setIsEditDialogOpen(false)
            setSelectedClient(null)
            resetEditForm()
        } catch (error) {
            handleError(error, 'update client')
        }
    }

    const handleDelete = async () => {
        if (!clientToDelete) return

        try {
            await deleteMutation.mutateAsync(clientToDelete.id)
            setClientToDelete(null)
        } catch (error) {
            handleError(error, 'delete client')
        } finally {
            setDeletingClientId(null)
        }
    }

    const handleBulkDelete = async (toDelete: Client[]) => {
        if (toDelete.length === 0) return

        try {
            await Promise.all(
                toDelete.map((client) => deleteMutation.mutateAsync(client.id))
            )
            setClientsToDelete([])
        } catch (error) {
            handleError(error, 'delete clients')
        }
    }

    const openCreateDialog = () => {
        resetCreateForm()
        setIsCreateDialogOpen(true)
    }

    const handleTableEdit = (client: Client) => {
        setSelectedClient(client)
        setIsEditDialogOpen(true)
        setEditFormData({
            first_name: client.first_name,
            last_name: client.last_name,
            email: client.email,
            phone_number: client.phone_number || '',
            address: client.address || '',
        })
    }

    const handleTableView = (client: Client) => {
        router.push(`/clients/${client.id}`)
    }

    const handleTableDelete = (client: Client) => {
        setDeletingClientId(client.id)
        setClientToDelete(client)
    }

    const handleCloseSingleDeleteDialog = () => {
        setClientToDelete(null)
        setDeletingClientId(null)
    }

    const handleCloseBulkDeleteDialog = () => {
        setClientsToDelete([])
    }

    if (status === 'pending') {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-6 w-6 mr-2" />
                <span>Loading clients…</span>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="text-destructive font-semibold">
                    {error?.message || 'Failed to load clients'}
                </div>
                <Button variant="outline" onClick={handleRefetch}>
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <>
            {/* Loading Overlay */}
            {isPerformingMutation && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg border flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">
                            {createMutation.isPending && 'Creating client...'}
                            {updateMutation.isPending && 'Updating client...'}
                            {deleteMutation.isPending &&
                                clientsToDelete.length > 0 &&
                                'Deleting clients...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Clients</h1>
                        <p className="text-muted-foreground">
                            Manage your client relationships
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        disabled={createMutation.isPending}
                        className="flex items-center gap-2"
                    >
                        {createMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                        <span className="hidden lg:inline">
                            {createMutation.isPending
                                ? 'Creating...'
                                : 'New Client'}
                        </span>
                    </Button>
                </div>

                {/* Content */}
                {clients.length === 0 ? (
                    <div className="h-full flex justify-center">
                        <EmptyState
                            title="No clients yet"
                            description="You haven't added any clients. Click 'New Client' above to get started."
                            linkText="New Client"
                            onLinkClick={openCreateDialog}
                            icon={
                                <Users className="h-12 w-12 text-muted-foreground" />
                            }
                        />
                    </div>
                ) : (
                    <DataTable<Client>
                        columns={columns}
                        data={clients}
                        is_loading={false}
                        is_error={false}
                        empty_message="No clients found."
                        on_refetch={handleRefetch}
                        on_edit={handleTableEdit}
                        on_view={handleTableView}
                        on_delete={handleTableDelete}
                        is_deleting={deletingClientId}
                        enable_row_selection
                        enable_bulk_delete
                        on_bulk_delete={handleBulkDelete}
                        search_placeholder="Search clients..."
                        search_column="first_name"
                    />
                )}
            </div>

            {/* Dialogs */}
            <CreateClientDialog
                isCreateDialogOpen={isCreateDialogOpen}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
                handleCreateSubmit={handleCreateSubmit}
                formData={createFormData}
                setFormData={setCreateFormData}
                resetForm={resetCreateForm}
                createMutation={createMutation}
            />

            <EditClientDialog
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                handleEditSubmit={handleEditSubmit}
                formData={editFormData}
                setFormData={setEditFormData}
                resetForm={resetEditForm}
                updateMutation={updateMutation}
                selectedClient={selectedClient}
            />

            {/* Single Delete Dialog */}
            <AlertDialog
                open={!!clientToDelete}
                onOpenChange={handleCloseSingleDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;
                            {clientToDelete?.first_name}{' '}
                            {clientToDelete?.last_name}
                            &quot;? This action cannot be undone and will remove
                            all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog
                open={clientsToDelete.length > 0}
                onOpenChange={handleCloseBulkDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Clients</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                <p>
                                    Are you sure you want to delete{' '}
                                    {clientsToDelete.length} client
                                    {clientsToDelete.length !== 1 ? 's' : ''}?
                                    This action cannot be undone and will remove
                                    all associated data.
                                </p>
                                {clientsToDelete.length > 0 && (
                                    <div className="mt-3">
                                        <div className="font-medium text-sm mb-2">
                                            Clients to delete:
                                        </div>
                                        <div className="max-h-32 overflow-y-auto bg-muted/50 rounded p-2">
                                            <ul className="text-sm space-y-1">
                                                {clientsToDelete.map(
                                                    (client) => (
                                                        <li
                                                            key={client.id}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <span className="w-2 h-2 bg-destructive rounded-full" />
                                                            {client.first_name}{' '}
                                                            {client.last_name}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleCloseBulkDeleteDialog}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkDelete(clientsToDelete)}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                `Delete ${clientsToDelete.length} Client${clientsToDelete.length !== 1 ? 's' : ''}`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
