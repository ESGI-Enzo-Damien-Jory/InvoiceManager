'use client'

import * as React from 'react'
import { useState } from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Trash2,
    Plus,
    Columns,
    ChevronDown,
    MoreHorizontal,
    Loader2,
} from 'lucide-react'

import LoadingState from '@/components/custom/loading-state'
import ErrorState from '@/components/custom/error-state'
import EmptyState from '@/components/custom/empty-state'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    useItems,
    useCreateItem,
    useUpdateItem,
    useDeleteItem,
} from '@/hooks/use-items'
import { Item } from '@/types/items'
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

const columns: ColumnDef<Item>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="flex items-center justify-center w-full">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center w-full">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Name
                    {column.getIsSorted() === 'asc' && (
                        <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                    )}
                    {column.getIsSorted() === 'desc' && (
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                </Button>
            </div>
        ),
        cell: ({ row }) => (
            <div className="font-medium text-left">{row.original.name}</div>
        ),
        enableHiding: false,
    },
    {
        accessorKey: 'price',
        header: ({ column }) => (
            <div className="flex items-center justify-end">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Price
                    {column.getIsSorted() === 'asc' && (
                        <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                    )}
                    {column.getIsSorted() === 'desc' && (
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                </Button>
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-right font-medium tabular-nums">
                ${row.original.price.toFixed(2)}
            </div>
        ),
        size: 120,
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Last Updated
                    {column.getIsSorted() === 'asc' && (
                        <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                    )}
                    {column.getIsSorted() === 'desc' && (
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                </Button>
            </div>
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground tabular-nums">
                {new Date(row.original.updated_at).toLocaleDateString()}
            </div>
        ),
        size: 140,
    },
    {
        id: 'actions',
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row, table }) => {
            const meta = table.options.meta as any
            return (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onEdit(row.original)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        disabled={meta?.isUpdating === row.original.id}
                    >
                        {meta?.isUpdating === row.original.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Edit className="h-4 w-4" />
                        )}
                        <span className="sr-only">Edit item</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onDelete(row.original)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        disabled={meta?.isDeleting === row.original.id}
                    >
                        {meta?.isDeleting === row.original.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete item</span>
                    </Button>
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 100,
    },
]

export default function ItemsPage() {
    const { data: items = [], status, error, refetch } = useItems()
    const createMutation = useCreateItem()
    const updateMutation = useUpdateItem()
    const deleteMutation = useDeleteItem()

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null)
    const [itemsToDelete, setItemsToDelete] = useState<Item[]>([])
    const [editingItem, setEditingItem] = useState<Item | null>(null)
    const [formData, setFormData] = useState<ItemFormData>({
        name: '',
        price: '',
    })

    // États pour les loaders individuels
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    )
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const table = useReactTable({
        data: items,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        meta: {
            onEdit: openEditDialog,
            onDelete: (item: Item) => {
                setDeletingItemId(item.id)
                setItemToDelete(item)
            },
            isDeleting: deletingItemId,
            isUpdating: updatingItemId,
        },
    })

    const resetForm = () => {
        setFormData({ name: '', price: '' })
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const price = parseFloat(formData.price)
        if (isNaN(price) || price < 0) {
            alert('Please enter a valid positive number for the price.')
            return
        }

        try {
            await createMutation.mutateAsync({
                name: formData.name.trim(),
                price,
            })

            setIsCreateDialogOpen(false)
            resetForm()
        } catch (error) {
            alert(
                `Failed to create item: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return

        const price = parseFloat(formData.price)
        if (isNaN(price) || price < 0) {
            alert('Please enter a valid positive number for the price.')
            return
        }

        setUpdatingItemId(editingItem.id)

        try {
            await updateMutation.mutateAsync({
                id: editingItem.id,
                payload: {
                    name: formData.name.trim(),
                    price,
                },
            })

            setIsEditDialogOpen(false)
            setEditingItem(null)
            resetForm()
        } catch (error) {
            alert(
                `Failed to update item: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        } finally {
            setUpdatingItemId(null)
        }
    }

    const handleDelete = async () => {
        if (!itemToDelete) return

        try {
            await deleteMutation.mutateAsync(itemToDelete.id)
            setItemToDelete(null)
        } catch (error) {
            alert(
                `Failed to delete item: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        } finally {
            setDeletingItemId(null)
        }
    }

    const handleBulkDelete = async () => {
        if (itemsToDelete.length === 0) return

        try {
            await Promise.all(
                itemsToDelete.map((item) => deleteMutation.mutateAsync(item.id))
            )

            table.resetRowSelection()
            setItemsToDelete([])
        } catch (error) {
            alert(
                `Failed to delete items: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        }
    }

    const getSelectedItems = () => {
        return table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)
    }

    const handleContextMenuBulkDelete = () => {
        const selected = getSelectedItems()
        if (selected.length > 0) {
            setItemsToDelete(selected)
        }
    }

    const handleContextMenuEdit = (item: Item) => {
        openEditDialog(item)
    }

    const handleContextMenuDelete = (item: Item) => {
        setDeletingItemId(item.id)
        setItemToDelete(item)
    }

    function openEditDialog(item: Item) {
        setEditingItem(item)
        setFormData({
            name: item.name,
            price: item.price.toString(),
        })
        setIsEditDialogOpen(true)
    }

    const openCreateDialog = () => {
        resetForm()
        setIsCreateDialogOpen(true)
    }

    // Overlay de loading global pour les mutations importantes
    const isPerformingMutation =
        createMutation.isPending ||
        (deleteMutation.isPending && itemsToDelete.length > 0)

    if (status === 'pending') {
        return <LoadingState message="Loading items…" />
    }

    if (status === 'error') {
        return (
            <ErrorState
                message={error?.message || 'Failed to load items'}
                onRetry={() => refetch()}
            />
        )
    }

    return (
        <>
            {/* Overlay de loading global */}
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

            <div className="flex flex-col gap-4 p-4 lg:p-6 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Items</h1>
                        <p className="text-muted-foreground">
                            Manage your inventory items
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Columns className="h-4 w-4" />
                                    <span className="hidden lg:inline">
                                        Columns
                                    </span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {table
                                    .getAllColumns()
                                    .filter(
                                        (column) =>
                                            typeof column.accessorFn !==
                                                'undefined' &&
                                            column.getCanHide()
                                    )
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(
                                                        !!value
                                                    )
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            onClick={openCreateDialog}
                            variant="outline"
                            size="sm"
                            disabled={createMutation.isPending}
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
                </div>

                {/* Search and Bulk Actions */}
                <div className="flex items-center justify-between gap-4">
                    <Input
                        placeholder="Search items..."
                        value={
                            (table
                                .getColumn('name')
                                ?.getFilterValue() as string) ?? ''
                        }
                        onChange={(event) =>
                            table
                                .getColumn('name')
                                ?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {
                                    table.getFilteredSelectedRowModel().rows
                                        .length
                                }{' '}
                                selected
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleContextMenuBulkDelete}
                                className="h-8"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete Selected
                            </Button>
                        </div>
                    )}
                </div>

                {items.length === 0 ? (
                    <EmptyState
                        title="No items yet"
                        description="You haven't created any items. Click 'New Item' above to get started."
                        linkText="New Item"
                        onLinkClick={openCreateDialog}
                        icon={
                            <Plus className="h-12 w-12 text-muted-foreground" />
                        }
                    />
                ) : (
                    <>
                        {/* Table with Context Menu */}
                        <div className="overflow-hidden rounded-lg border">
                            <ContextMenu>
                                <ContextMenuTrigger asChild>
                                    <Table>
                                        <TableHeader className="bg-muted sticky top-0 z-10">
                                            {table
                                                .getHeaderGroups()
                                                .map((headerGroup) => (
                                                    <TableRow
                                                        key={headerGroup.id}
                                                    >
                                                        {headerGroup.headers.map(
                                                            (header) => {
                                                                return (
                                                                    <TableHead
                                                                        key={
                                                                            header.id
                                                                        }
                                                                        colSpan={
                                                                            header.colSpan
                                                                        }
                                                                        className="h-12"
                                                                        style={{
                                                                            width:
                                                                                header.getSize() !==
                                                                                150
                                                                                    ? header.getSize()
                                                                                    : undefined,
                                                                        }}
                                                                    >
                                                                        {header.isPlaceholder
                                                                            ? null
                                                                            : flexRender(
                                                                                  header
                                                                                      .column
                                                                                      .columnDef
                                                                                      .header,
                                                                                  header.getContext()
                                                                              )}
                                                                    </TableHead>
                                                                )
                                                            }
                                                        )}
                                                    </TableRow>
                                                ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows
                                                ?.length ? (
                                                table
                                                    .getRowModel()
                                                    .rows.map((row) => (
                                                        <ContextMenu
                                                            key={row.id}
                                                        >
                                                            <ContextMenuTrigger
                                                                asChild
                                                            >
                                                                <TableRow
                                                                    data-state={
                                                                        row.getIsSelected() &&
                                                                        'selected'
                                                                    }
                                                                    className="cursor-pointer hover:bg-muted/50 h-12"
                                                                >
                                                                    {row
                                                                        .getVisibleCells()
                                                                        .map(
                                                                            (
                                                                                cell
                                                                            ) => (
                                                                                <TableCell
                                                                                    key={
                                                                                        cell.id
                                                                                    }
                                                                                    className="py-2"
                                                                                >
                                                                                    {flexRender(
                                                                                        cell
                                                                                            .column
                                                                                            .columnDef
                                                                                            .cell,
                                                                                        cell.getContext()
                                                                                    )}
                                                                                </TableCell>
                                                                            )
                                                                        )}
                                                                </TableRow>
                                                            </ContextMenuTrigger>
                                                            <ContextMenuContent className="w-56">
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuEdit(
                                                                            row.original
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        updatingItemId ===
                                                                        row
                                                                            .original
                                                                            .id
                                                                    }
                                                                >
                                                                    {updatingItemId ===
                                                                    row.original
                                                                        .id ? (
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                    )}
                                                                    Edit Item
                                                                </ContextMenuItem>
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuDelete(
                                                                            row.original
                                                                        )
                                                                    }
                                                                    className="text-destructive focus:text-destructive"
                                                                    disabled={
                                                                        deletingItemId ===
                                                                        row
                                                                            .original
                                                                            .id
                                                                    }
                                                                >
                                                                    {deletingItemId ===
                                                                    row.original
                                                                        .id ? (
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                    )}
                                                                    Delete Item
                                                                </ContextMenuItem>
                                                                <ContextMenuSeparator />
                                                                <ContextMenuSub>
                                                                    <ContextMenuSubTrigger>
                                                                        <MoreHorizontal className="h-4 w-4 mr-2" />
                                                                        Bulk
                                                                        Actions
                                                                    </ContextMenuSubTrigger>
                                                                    <ContextMenuSubContent className="w-48">
                                                                        <ContextMenuItem
                                                                            onClick={() => {
                                                                                if (
                                                                                    !row.getIsSelected()
                                                                                ) {
                                                                                    row.toggleSelected()
                                                                                }
                                                                                handleContextMenuBulkDelete()
                                                                            }}
                                                                            disabled={
                                                                                table.getFilteredSelectedRowModel()
                                                                                    .rows
                                                                                    .length ===
                                                                                    0 ||
                                                                                deleteMutation.isPending
                                                                            }
                                                                            className="text-destructive focus:text-destructive"
                                                                        >
                                                                            {deleteMutation.isPending ? (
                                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                            ) : (
                                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                            )}
                                                                            Delete
                                                                            Selected
                                                                            (
                                                                            {
                                                                                table.getFilteredSelectedRowModel()
                                                                                    .rows
                                                                                    .length
                                                                            }
                                                                            )
                                                                        </ContextMenuItem>
                                                                    </ContextMenuSubContent>
                                                                </ContextMenuSub>
                                                            </ContextMenuContent>
                                                        </ContextMenu>
                                                    ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        No results.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-56">
                                    <ContextMenuItem
                                        onClick={openCreateDialog}
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        New Item
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                        onClick={handleContextMenuBulkDelete}
                                        disabled={
                                            table.getFilteredSelectedRowModel()
                                                .rows.length === 0 ||
                                            deleteMutation.isPending
                                        }
                                        className="text-destructive focus:text-destructive"
                                    >
                                        {deleteMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        Delete Selected (
                                        {
                                            table.getFilteredSelectedRowModel()
                                                .rows.length
                                        }
                                        )
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4">
                            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                                {
                                    table.getFilteredSelectedRowModel().rows
                                        .length
                                }{' '}
                                of {table.getFilteredRowModel().rows.length}{' '}
                                row(s) selected.
                            </div>
                            <div className="flex w-full items-center gap-8 lg:w-fit">
                                <div className="hidden items-center gap-2 lg:flex">
                                    <Label
                                        htmlFor="rows-per-page"
                                        className="text-sm font-medium"
                                    >
                                        Rows per page
                                    </Label>
                                    <Select
                                        value={`${table.getState().pagination.pageSize}`}
                                        onValueChange={(value) => {
                                            table.setPageSize(Number(value))
                                        }}
                                    >
                                        <SelectTrigger
                                            size="sm"
                                            className="w-20"
                                            id="rows-per-page"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    table.getState().pagination
                                                        .pageSize
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {[5, 10, 20, 30, 40, 50].map(
                                                (pageSize) => (
                                                    <SelectItem
                                                        key={pageSize}
                                                        value={`${pageSize}`}
                                                    >
                                                        {pageSize}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex w-fit items-center justify-center text-sm font-medium">
                                    Page{' '}
                                    {table.getState().pagination.pageIndex + 1}{' '}
                                    of {table.getPageCount()}
                                </div>
                                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                    <Button
                                        variant="outline"
                                        className="hidden h-8 w-8 p-0 lg:flex"
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">
                                            Go to first page
                                        </span>
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <span className="sr-only">
                                            Go to previous page
                                        </span>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">
                                            Go to next page
                                        </span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hidden h-8 w-8 p-0 lg:flex"
                                        onClick={() =>
                                            table.setPageIndex(
                                                table.getPageCount() - 1
                                            )
                                        }
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <span className="sr-only">
                                            Go to last page
                                        </span>
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Dialogs */}
                <CreateItemDialog
                    isCreateDialogOpen={isCreateDialogOpen}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    handleCreateSubmit={handleCreateSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    resetForm={resetForm}
                    createMutation={createMutation}
                />

                <EditItemDialog
                    isEditDialogOpen={isEditDialogOpen}
                    setIsEditDialogOpen={setIsEditDialogOpen}
                    handleEditSubmit={handleEditSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    setEditingItem={setEditingItem}
                    resetForm={resetForm}
                    updateMutation={updateMutation}
                />

                {/* Delete Single Item Dialog */}
                <AlertDialog
                    open={!!itemToDelete}
                    onOpenChange={() => {
                        setItemToDelete(null)
                        setDeletingItemId(null)
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Item</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "
                                {itemToDelete?.name}"? This action cannot be
                                undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="border-border text-foreground hover:bg-muted hover:border-muted-foreground font-medium bg-transparent"
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

                {/* Delete Multiple Items Dialog */}
                <AlertDialog
                    open={itemsToDelete.length > 0}
                    onOpenChange={() => setItemsToDelete([])}
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
                                        <div className="mt-2 text-sm">
                                            <div className="font-medium">
                                                Items to delete:
                                            </div>
                                            <ul className="list-disc list-inside mt-1 max-h-32 overflow-y-auto">
                                                {itemsToDelete.map((item) => (
                                                    <li key={item.id}>
                                                        {item.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setItemsToDelete([])}
                                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleBulkDelete}
                                disabled={deleteMutation.isPending}
                                className="border-border text-foreground hover:bg-muted hover:border-muted-foreground font-medium bg-transparent"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    `Delete ${itemsToDelete.length} Items`
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
