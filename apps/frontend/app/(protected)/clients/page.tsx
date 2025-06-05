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
    Columns,
    ChevronDown,
    MoreHorizontal,
    Loader2,
    Phone,
    MapPin,
    Eye,
    UserPlus,
    Users,
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
    useClients,
    useCreateClient,
    useUpdateClient,
    useDeleteClient,
} from '@/hooks/use-clients'
import type { Client, CreateClientPayload } from '@/services/clients'
import CreateClientDialog from '@/components/custom/specialized/clients/create-clients-dialog'
import EditClientDialog from '@/components/custom/specialized/clients/edit-clients-dialog'
import { useRouter } from 'next/navigation'

interface ClientFormData {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    address: string
}

interface TableMeta {
    onEdit: (client: Client) => void
    onDelete: (client: Client) => void
    onView: (client: Client) => void
    isDeleting: string | null
}

const columns: ColumnDef<Client>[] = [
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
                    Client
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
            <div className="flex items-center gap-3">
                <div>
                    <div className="font-medium">
                        {row.original.first_name} {row.original.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.email}
                    </div>
                </div>
            </div>
        ),
        enableHiding: false,
        sortingFn: (rowA, rowB) => {
            const nameA =
                `${rowA.original.first_name} ${rowA.original.last_name}`.toLowerCase()
            const nameB =
                `${rowB.original.first_name} ${rowB.original.last_name}`.toLowerCase()
            return nameA.localeCompare(nameB)
        },
    },
    {
        accessorKey: 'phone_number',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Phone
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
            <div className="text-left">
                {row.original.phone_number ? (
                    <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="tabular-nums">
                            {row.original.phone_number}
                        </span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </div>
        ),
        size: 160,
    },
    {
        accessorKey: 'address',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Address
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
            <div className="text-left max-w-[200px]">
                {row.original.address ? (
                    <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="truncate">{row.original.address}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </div>
        ),
        size: 220,
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
                    Updated
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
                {new Date(row.original.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
            </div>
        ),
        size: 120,
    },
    {
        id: 'actions',
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMeta | undefined
            return (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onView(row.original)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View client</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onEdit(row.original)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit client</span>
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
                        <span className="sr-only">Delete client</span>
                    </Button>
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 120,
    },
]

const initialFormData: ClientFormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
}

export default function ClientsPage() {
    const router = useRouter()
    const { data: clients = [], status, error, refetch } = useClients()
    const createMutation = useCreateClient()
    const updateMutation = useUpdateClient()
    const deleteMutation = useDeleteClient()

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
    const [clientsToDelete, setClientsToDelete] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)

    // États pour les formulaires
    const [createFormData, setCreateFormData] =
        useState<ClientFormData>(initialFormData)
    const [editFormData, setEditFormData] =
        useState<ClientFormData>(initialFormData)

    // État pour les loaders individuels
    const [deletingClientId, setDeletingClientId] = useState<string | null>(
        null
    )

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
        data: clients,
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
            onView: (client: Client) => {
                router.push(`/clients/${client.id}`)
            },
            onEdit: (client: Client) => {
                setSelectedClient(client)
                setIsEditDialogOpen(true)
            },
            onDelete: (client: Client) => {
                setDeletingClientId(client.id)
                setClientToDelete(client)
            },
            isDeleting: deletingClientId,
        },
    })

    const resetCreateForm = () => setCreateFormData(initialFormData)
    const resetEditForm = () => setEditFormData(initialFormData)

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (
            !createFormData.first_name.trim() ||
            !createFormData.last_name.trim() ||
            !createFormData.email.trim()
        ) {
            alert('Please fill in all required fields.')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(createFormData.email)) {
            alert('Please enter a valid email address.')
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
            alert(
                `Failed to create client: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClient) return

        if (
            !editFormData.first_name.trim() ||
            !editFormData.last_name.trim() ||
            !editFormData.email.trim()
        ) {
            alert('Please fill in all required fields.')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(editFormData.email)) {
            alert('Please enter a valid email address.')
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
            alert(
                `Failed to update client: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        }
    }

    const handleDelete = async () => {
        if (!clientToDelete) return

        try {
            await deleteMutation.mutateAsync(clientToDelete.id)
            setClientToDelete(null)
        } catch (error) {
            alert(
                `Failed to delete client: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        } finally {
            setDeletingClientId(null)
        }
    }

    const handleBulkDelete = async () => {
        if (clientsToDelete.length === 0) return

        try {
            await Promise.all(
                clientsToDelete.map((client) =>
                    deleteMutation.mutateAsync(client.id)
                )
            )

            table.resetRowSelection()
            setClientsToDelete([])
        } catch (error) {
            alert(
                `Failed to delete clients: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`
            )
        }
    }

    const getSelectedClients = () => {
        return table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)
    }

    const handleContextMenuBulkDelete = () => {
        const selected = getSelectedClients()
        if (selected.length > 0) {
            setClientsToDelete(selected)
        }
    }

    const handleContextMenuEdit = (client: Client) => {
        setSelectedClient(client)
        setIsEditDialogOpen(true)
    }

    const handleContextMenuView = (client: Client) => {
        router.push(`/clients/${client.id}`)
    }

    const handleContextMenuDelete = (client: Client) => {
        setDeletingClientId(client.id)
        setClientToDelete(client)
    }

    const openCreateDialog = () => {
        resetCreateForm()
        setIsCreateDialogOpen(true)
    }

    const isPerformingMutation =
        createMutation.isPending ||
        updateMutation.isPending ||
        (deleteMutation.isPending && clientsToDelete.length > 0)

    if (status === 'pending') {
        return <LoadingState message="Loading clients…" />
    }

    if (status === 'error') {
        return (
            <ErrorState
                message={error?.message || 'Failed to load clients'}
                onRetry={() => refetch()}
            />
        )
    }

    return (
        <>
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

            <div className="flex flex-col gap-4 p-4 lg:p-6 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Clients</h1>
                        <p className="text-muted-foreground">
                            Manage your client relationships
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
                                                {column.id === 'name'
                                                    ? 'Client'
                                                    : column.id ===
                                                        'phone_number'
                                                      ? 'Phone'
                                                      : column.id ===
                                                          'updated_at'
                                                        ? 'Updated'
                                                        : column.id}
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
                                <UserPlus className="h-4 w-4" />
                            )}
                            <span className="hidden lg:inline">
                                {createMutation.isPending
                                    ? 'Creating...'
                                    : 'New Client'}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Search and Bulk Actions */}
                <div className="flex items-center justify-between gap-4">
                    <Input
                        placeholder="Search clients..."
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
                                                                    className="cursor-pointer hover:bg-muted/50 h-14"
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
                                                                        handleContextMenuView(
                                                                            row.original
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Client
                                                                </ContextMenuItem>
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuEdit(
                                                                            row.original
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Client
                                                                </ContextMenuItem>
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuDelete(
                                                                            row.original
                                                                        )
                                                                    }
                                                                    className="text-destructive focus:text-destructive"
                                                                    disabled={
                                                                        deletingClientId ===
                                                                        row
                                                                            .original
                                                                            .id
                                                                    }
                                                                >
                                                                    {deletingClientId ===
                                                                    row.original
                                                                        .id ? (
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                    )}
                                                                    Delete
                                                                    Client
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
                                            <UserPlus className="h-4 w-4 mr-2" />
                                        )}
                                        New Client
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

                <AlertDialog
                    open={!!clientToDelete}
                    onOpenChange={() => {
                        setClientToDelete(null)
                        setDeletingClientId(null)
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Client</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {clientToDelete?.first_name}{' '}
                                {clientToDelete?.last_name}&quot;? This action
                                cannot be undone and will remove all associated
                                data.
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

                <AlertDialog
                    open={clientsToDelete.length > 0}
                    onOpenChange={() => setClientsToDelete([])}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Clients</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div>
                                    <p>
                                        Are you sure you want to delete{' '}
                                        {clientsToDelete.length} client
                                        {clientsToDelete.length !== 1
                                            ? 's'
                                            : ''}
                                        ? This action cannot be undone and will
                                        remove all associated data.
                                    </p>
                                    {clientsToDelete.length > 0 && (
                                        <div className="mt-2 text-sm">
                                            <div className="font-medium">
                                                Clients to delete:
                                            </div>
                                            <ul className="list-disc list-inside mt-1 max-h-32 overflow-y-auto">
                                                {clientsToDelete.map(
                                                    (client) => (
                                                        <li key={client.id}>
                                                            {client.first_name}{' '}
                                                            {client.last_name}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setClientsToDelete([])}
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
                                    `Delete ${clientsToDelete.length} Clients`
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
