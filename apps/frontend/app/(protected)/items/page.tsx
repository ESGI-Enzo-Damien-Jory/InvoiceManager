'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import type { Item } from '@/types'

import {
    useItems,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
} from '@/hooks/use-items'
import DataTable from '@/components/custom/generic/data-table'
import { itemColumns } from '@/types'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

import EmptyState from '@/components/custom/states/empty-state'
import CreateItemDialog from '@/components/custom/specialized/items/create-item-dialog'
import EditItemDialog from '@/components/custom/specialized/items/edit-item-dialog'
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

interface ItemFormData {
    name: string
    price: string
}

const initialFormData: ItemFormData = {
    name: '',
    price: '',
}

export default function ItemsPage() {
    const searchParams = useSearchParams()

    // Queries & Mutations
    const { data: items = [], status, error, refetch } = useItems()
    const createMutation = useCreateItem()
    const updateMutation = useUpdateItem()
    const deleteMutation = useDeleteItem()

    // Dialog States
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    // Selection States
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null)
    const [itemsToDelete, setItemsToDelete] = useState<Item[]>([])
    const [editingItem, setEditingItem] = useState<Item | null>(null)
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

    // Form Data States
    const [createFormData, setCreateFormData] =
        useState<ItemFormData>(initialFormData)
    const [editFormData, setEditFormData] =
        useState<ItemFormData>(initialFormData)

    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsCreateDialogOpen(true)
            const url = new URL(window.location.href)
            url.searchParams.delete('create')
            window.history.replaceState({}, '', url.toString())
        }
    }, [searchParams])

    // Computed States
    const isPerformingMutation =
        createMutation.isPending ||
        (deleteMutation.isPending && itemsToDelete.length > 0)

    // Utility Functions
    const resetCreateForm = () => setCreateFormData(initialFormData)
    const resetEditForm = () => setEditFormData(initialFormData)

    const validateForm = (formData: ItemFormData): string | null => {
        if (!formData.name.trim()) {
            return 'Please enter an item name.'
        }

        const price = parseFloat(formData.price)
        if (isNaN(price) || price < 0) {
            return 'Please enter a valid positive number for the price.'
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

    // Event Handlers
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
            const price = parseFloat(createFormData.price)
            await createMutation.mutateAsync({
                name: createFormData.name.trim(),
                price,
            })
            setIsCreateDialogOpen(false)
            resetCreateForm()
        } catch (error) {
            handleError(error, 'create item')
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return

        const validationError = validateForm(editFormData)
        if (validationError) {
            showErrorAlert(validationError)
            return
        }

        try {
            const price = parseFloat(editFormData.price)
            await updateMutation.mutateAsync({
                id: editingItem.id,
                payload: {
                    name: editFormData.name.trim(),
                    price,
                },
            })
            setIsEditDialogOpen(false)
            setEditingItem(null)
            resetEditForm()
        } catch (error) {
            handleError(error, 'update item')
        }
    }

    const handleDelete = async () => {
        if (!itemToDelete) return

        try {
            await deleteMutation.mutateAsync(itemToDelete.id)
            setItemToDelete(null)
        } catch (error) {
            handleError(error, 'delete item')
        } finally {
            setDeletingItemId(null)
        }
    }

    const handleBulkDelete = async (toDelete: Item[]) => {
        if (toDelete.length === 0) return

        try {
            await Promise.all(
                toDelete.map((item) => deleteMutation.mutateAsync(item.id))
            )
            setItemsToDelete([])
        } catch (error) {
            handleError(error, 'delete items')
        }
    }

    const openCreateDialog = () => {
        resetCreateForm()
        setIsCreateDialogOpen(true)
    }

    const handleTableEdit = (item: Item) => {
        setEditingItem(item)
        setEditFormData({
            name: item.name,
            price: item.price.toString(),
        })
        setIsEditDialogOpen(true)
    }

    const handleTableDelete = (item: Item) => {
        setDeletingItemId(item.id)
        setItemToDelete(item)
    }

    const handleCloseSingleDeleteDialog = () => {
        setItemToDelete(null)
        setDeletingItemId(null)
    }

    const handleCloseBulkDeleteDialog = () => {
        setItemsToDelete([])
    }

    // Loading State
    if (status === 'pending') {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-6 w-6 mr-2" />
                <span>Loading items…</span>
            </div>
        )
    }

    // Error State
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="text-destructive font-semibold">
                    {error?.message || 'Failed to load items'}
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
                            {createMutation.isPending && 'Creating item...'}
                            {deleteMutation.isPending &&
                                itemsToDelete.length > 0 &&
                                'Deleting items...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Items</h1>
                        <p className="text-muted-foreground">
                            Manage your inventory items
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
                            <Plus className="h-4 w-4" />
                        )}
                        <span className="hidden lg:inline">
                            {createMutation.isPending
                                ? 'Creating...'
                                : 'New Item'}
                        </span>
                    </Button>
                </div>

                {/* Content */}
                {items.length === 0 ? (
                    <div className="h-full flex justify-center">
                        <EmptyState
                            title="No items yet"
                            description="You haven't created any items. Click 'New Item' above or press Ctrl+K to get started."
                            linkText="New Item"
                            onLinkClick={openCreateDialog}
                            icon={
                                <Plus className="h-12 w-12 text-muted-foreground" />
                            }
                        />
                    </div>
                ) : (
                    <DataTable<Item>
                        columns={itemColumns}
                        data={items}
                        is_loading={false}
                        is_error={false}
                        empty_message="No items found."
                        on_refetch={handleRefetch}
                        on_edit={handleTableEdit}
                        on_delete={handleTableDelete}
                        is_deleting={deletingItemId}
                        enable_row_selection
                        enable_bulk_delete
                        on_bulk_delete={handleBulkDelete}
                        search_placeholder="Search items..."
                        search_column="name"
                    />
                )}
            </div>

            {/* Dialogs */}
            <CreateItemDialog
                isCreateDialogOpen={isCreateDialogOpen}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
                handleCreateSubmit={handleCreateSubmit}
                formData={createFormData}
                setFormData={setCreateFormData}
                resetForm={resetCreateForm}
                createMutation={createMutation}
            />

            <EditItemDialog
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                handleEditSubmit={handleEditSubmit}
                formData={editFormData}
                setFormData={setEditFormData}
                setEditingItem={setEditingItem}
                resetForm={resetEditForm}
                updateMutation={updateMutation}
            />

            {/* Single Delete Dialog */}
            <AlertDialog
                open={!!itemToDelete}
                onOpenChange={handleCloseSingleDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;
                            {itemToDelete?.name}&quot;? This action cannot be
                            undone.
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
                open={itemsToDelete.length > 0}
                onOpenChange={handleCloseBulkDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Items</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                <p>
                                    Are you sure you want to delete{' '}
                                    {itemsToDelete.length} item
                                    {itemsToDelete.length !== 1 ? 's' : ''}?
                                    This action cannot be undone.
                                </p>
                                {itemsToDelete.length > 0 && (
                                    <div className="mt-3">
                                        <div className="font-medium text-sm mb-2">
                                            Items to delete:
                                        </div>
                                        <div className="max-h-32 overflow-y-auto bg-muted/50 rounded p-2">
                                            <ul className="text-sm space-y-1">
                                                {itemsToDelete.map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span className="w-2 h-2 bg-destructive rounded-full" />
                                                        {item.name} - $
                                                        {item.price.toFixed(2)}
                                                    </li>
                                                ))}
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
                            onClick={() => handleBulkDelete(itemsToDelete)}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                `Delete ${itemsToDelete.length} Item${itemsToDelete.length !== 1 ? 's' : ''}`
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
