'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
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
    Eye,
    Plus,
    FileText,
    Download,
    Send,
    Copy,
} from 'lucide-react'

import LoadingState from '@/components/custom/loading-state'
import ErrorState from '@/components/custom/error-state'
import EmptyState from '@/components/custom/empty-state'
import { Button } from '@/components/ui/button'
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
    useInvoices,
    useDeleteInvoice,
    useDownloadInvoicePdf,
    useUpdateInvoiceState,
    useCreateInvoice,
} from '@/hooks/use-invoices'
import { formatCurrency } from '@/lib/utils'
import { invoiceColumns as columns } from '@/components/tables/definitions/invoice-columns'
import { Invoice } from '@/types/invoices'

export default function InvoicesPage() {
    const router = useRouter()

    const { data: invoices = [], status, error, refetch } = useInvoices()
    const deleteInvoiceMutation = useDeleteInvoice()
    const downloadPdfMutation = useDownloadInvoicePdf()
    const updateStateMutation = useUpdateInvoiceState()
    const createInvoiceMutation = useCreateInvoice()

    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)
    const [invoicesToDelete, setInvoicesToDelete] = useState<Invoice[]>([])
    const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(
        null
    )
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
        string | null
    >(null)
    const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(
        null
    )

    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    )
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'created_at', desc: true },
    ])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

    const table = useReactTable({
        data: invoices,
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
            onView: (invoice: Invoice) =>
                router.push(`/invoices/${invoice.id}`),
            onEdit: (invoice: Invoice) =>
                router.push(`/invoices/${invoice.id}/edit`),
            onDelete: (invoice: Invoice) => {
                setDeletingInvoiceId(invoice.id)
                setInvoiceToDelete(invoice)
            },
            onDuplicate: async (invoice: Invoice) => {
                try {
                    await createInvoiceMutation.mutateAsync({
                        client_id: invoice.client_id,
                        title: `Copy of ${invoice.title}`,
                        total_amount: invoice.total_amount || 0,
                        expiration_date: invoice.expiration_date || undefined,
                        state: 'Draft',
                        items: [],
                    })
                    alert('Invoice duplicated successfully!')
                } catch {
                    alert('Failed to duplicate invoice')
                }
            },
            onSend: async (invoice: Invoice) => {
                setSendingInvoiceId(invoice.id)
                try {
                    await updateStateMutation.mutateAsync({
                        id: invoice.id,
                        state: 'Sent',
                    })
                    alert('Invoice sent successfully!')
                } catch {
                    alert('Failed to send invoice')
                } finally {
                    setSendingInvoiceId(null)
                }
            },
            onDownload: async (invoice: Invoice) => {
                setDownloadingInvoiceId(invoice.id)
                try {
                    await downloadPdfMutation.mutateAsync(invoice.id)
                } catch {
                    alert('Failed to download PDF')
                } finally {
                    setDownloadingInvoiceId(null)
                }
            },
            isDeleting: deletingInvoiceId,
            isDownloading: downloadingInvoiceId,
            isSending: sendingInvoiceId,
        },
    })

    const handleDelete = async () => {
        if (!invoiceToDelete) return

        try {
            await deleteInvoiceMutation.mutateAsync(invoiceToDelete.id)
            setInvoiceToDelete(null)
            alert('Invoice deleted successfully!')
        } catch {
            alert('Failed to delete invoice')
        } finally {
            setDeletingInvoiceId(null)
        }
    }

    const handleBulkDelete = async () => {
        if (invoicesToDelete.length === 0) return

        try {
            await Promise.all(
                invoicesToDelete.map((invoice) =>
                    deleteInvoiceMutation.mutateAsync(invoice.id)
                )
            )
            table.resetRowSelection()
            setInvoicesToDelete([])
            alert(`${invoicesToDelete.length} invoices deleted successfully!`)
        } catch {
            alert('Failed to delete some invoices')
        }
    }

    const getSelectedInvoices = () =>
        table.getFilteredSelectedRowModel().rows.map((row) => row.original)

    const handleContextMenuBulkDelete = () => {
        const selected = getSelectedInvoices()
        if (selected.length > 0) {
            setInvoicesToDelete(selected)
        }
    }

    const handleContextMenuView = (invoice: Invoice) =>
        router.push(`/invoices/${invoice.id}`)
    const handleContextMenuEdit = (invoice: Invoice) =>
        router.push(`/invoices/${invoice.id}/edit`)
    const handleContextMenuDelete = (invoice: Invoice) => {
        setDeletingInvoiceId(invoice.id)
        setInvoiceToDelete(invoice)
    }

    const handleContextMenuDuplicate = async (invoice: Invoice) => {
        try {
            await createInvoiceMutation.mutateAsync({
                client_id: invoice.client_id,
                title: `Copy of ${invoice.title}`,
                total_amount: invoice.total_amount || 0,
                expiration_date: invoice.expiration_date || undefined,
                state: 'Draft',
                items: [],
            })
            alert('Invoice duplicated successfully!')
        } catch {
            alert('Failed to duplicate invoice')
        }
    }

    const handleContextMenuSend = async (invoice: Invoice) => {
        setSendingInvoiceId(invoice.id)
        try {
            await updateStateMutation.mutateAsync({
                id: invoice.id,
                state: 'Sent',
            })
            alert('Invoice sent successfully!')
        } catch {
            alert('Failed to send invoice')
        } finally {
            setSendingInvoiceId(null)
        }
    }

    const handleContextMenuDownload = async (invoice: Invoice) => {
        setDownloadingInvoiceId(invoice.id)
        try {
            await downloadPdfMutation.mutateAsync(invoice.id)
        } catch {
            alert('Failed to download PDF')
        } finally {
            setDownloadingInvoiceId(null)
        }
    }

    const isPerformingMutation =
        createInvoiceMutation.isPending ||
        updateStateMutation.isPending ||
        (deleteInvoiceMutation.isPending && invoicesToDelete.length > 0)

    if (status === 'pending') {
        return <LoadingState message="Loading invoices…" />
    }

    if (status === 'error') {
        return (
            <ErrorState
                message={error?.message || 'Failed to load invoices'}
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
                            {createInvoiceMutation.isPending &&
                                'Creating invoice...'}
                            {updateStateMutation.isPending &&
                                'Updating invoice...'}
                            {deleteInvoiceMutation.isPending &&
                                invoicesToDelete.length > 0 &&
                                'Deleting invoices...'}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 p-4 lg:p-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Invoices</h1>
                        <p className="text-muted-foreground">
                            Manage your invoices and billing
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
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id === 'title'
                                                ? 'Invoice'
                                                : column.id === 'client'
                                                  ? 'Client'
                                                  : column.id === 'created_at'
                                                    ? 'Date'
                                                    : column.id === 'state'
                                                      ? 'Status'
                                                      : column.id ===
                                                          'total_amount'
                                                        ? 'Amount'
                                                        : column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href="/invoices/new">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={createInvoiceMutation.isPending}
                            >
                                {createInvoiceMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                <span className="hidden lg:inline">
                                    {createInvoiceMutation.isPending
                                        ? 'Creating...'
                                        : 'New Invoice'}
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <Input
                            placeholder="Search invoices..."
                            value={
                                (table
                                    .getColumn('title')
                                    ?.getFilterValue() as string) ?? ''
                            }
                            onChange={(event) =>
                                table
                                    .getColumn('title')
                                    ?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                        <Select
                            value={
                                (table
                                    .getColumn('state')
                                    ?.getFilterValue() as string) ?? 'all'
                            }
                            onValueChange={(value) =>
                                table
                                    .getColumn('state')
                                    ?.setFilterValue(
                                        value === 'all' ? '' : value
                                    )
                            }
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Sent">Sent</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Overdue">Overdue</SelectItem>
                                <SelectItem value="Cancelled">
                                    Cancelled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                                disabled={deleteInvoiceMutation.isPending}
                            >
                                {deleteInvoiceMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete Selected
                            </Button>
                        </div>
                    )}
                </div>

                {invoices.length === 0 ? (
                    <div className="h-full flex justify-center">
                        <EmptyState
                            title="No invoices yet"
                            description="You haven't created any invoices. Click 'New Invoice' above to get started."
                            linkText="New Invoice"
                            onLinkClick={() => router.push('/invoices/new')}
                            icon={
                                <FileText className="h-12 w-12 text-muted-foreground" />
                            }
                        />
                    </div>
                ) : (
                    <>
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
                                                            (header) => (
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
                                                                    View Invoice
                                                                </ContextMenuItem>
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuEdit(
                                                                            row.original
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Invoice
                                                                </ContextMenuItem>
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuDuplicate(
                                                                            row.original
                                                                        )
                                                                    }
                                                                >
                                                                    <Copy className="h-4 w-4 mr-2" />
                                                                    Duplicate
                                                                    Invoice
                                                                </ContextMenuItem>
                                                                <ContextMenuSeparator />
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuDownload(
                                                                            row.original
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        row
                                                                            .original
                                                                            .state ===
                                                                            'Draft' ||
                                                                        downloadingInvoiceId ===
                                                                            row
                                                                                .original
                                                                                .id
                                                                    }
                                                                >
                                                                    {downloadingInvoiceId ===
                                                                    row.original
                                                                        .id ? (
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Download className="h-4 w-4 mr-2" />
                                                                    )}
                                                                    Download PDF
                                                                </ContextMenuItem>
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuSend(
                                                                            row.original
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        row
                                                                            .original
                                                                            .state ===
                                                                            'Draft' ||
                                                                        row
                                                                            .original
                                                                            .state ===
                                                                            'Paid' ||
                                                                        sendingInvoiceId ===
                                                                            row
                                                                                .original
                                                                                .id
                                                                    }
                                                                >
                                                                    {sendingInvoiceId ===
                                                                    row.original
                                                                        .id ? (
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Send className="h-4 w-4 mr-2" />
                                                                    )}
                                                                    Send Invoice
                                                                </ContextMenuItem>
                                                                <ContextMenuSeparator />
                                                                <ContextMenuItem
                                                                    onClick={() =>
                                                                        handleContextMenuDelete(
                                                                            row.original
                                                                        )
                                                                    }
                                                                    className="text-destructive focus:text-destructive"
                                                                    disabled={
                                                                        deletingInvoiceId ===
                                                                        row
                                                                            .original
                                                                            .id
                                                                    }
                                                                >
                                                                    {deletingInvoiceId ===
                                                                    row.original
                                                                        .id ? (
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                    )}
                                                                    Delete
                                                                    Invoice
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
                                                                                deleteInvoiceMutation.isPending
                                                                            }
                                                                            className="text-destructive focus:text-destructive"
                                                                        >
                                                                            {deleteInvoiceMutation.isPending ? (
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
                                        onClick={() =>
                                            router.push('/invoices/new')
                                        }
                                        disabled={
                                            createInvoiceMutation.isPending
                                        }
                                    >
                                        {createInvoiceMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        New Invoice
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                        onClick={handleContextMenuBulkDelete}
                                        disabled={
                                            table.getFilteredSelectedRowModel()
                                                .rows.length === 0 ||
                                            deleteInvoiceMutation.isPending
                                        }
                                        className="text-destructive focus:text-destructive"
                                    >
                                        {deleteInvoiceMutation.isPending ? (
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
                                        onValueChange={(value) =>
                                            table.setPageSize(Number(value))
                                        }
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

                <AlertDialog
                    open={!!invoiceToDelete}
                    onOpenChange={() => {
                        setInvoiceToDelete(null)
                        setDeletingInvoiceId(null)
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {invoiceToDelete?.title}&quot;? This action
                                cannot be undone and will remove all associated
                                data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                disabled={deleteInvoiceMutation.isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteInvoiceMutation.isPending}
                                className="border-border text-foreground hover:bg-muted hover:border-muted-foreground font-medium bg-transparent"
                            >
                                {deleteInvoiceMutation.isPending ? (
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
                    open={invoicesToDelete.length > 0}
                    onOpenChange={() => setInvoicesToDelete([])}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoices</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div>
                                    <p>
                                        Are you sure you want to delete{' '}
                                        {invoicesToDelete.length} invoice
                                        {invoicesToDelete.length !== 1
                                            ? 's'
                                            : ''}
                                        ? This action cannot be undone and will
                                        remove all associated data.
                                    </p>
                                    {invoicesToDelete.length > 0 && (
                                        <div className="mt-2 text-sm">
                                            <div className="font-medium">
                                                Invoices to delete:
                                            </div>
                                            <ul className="list-disc list-inside mt-1 max-h-32 overflow-y-auto">
                                                {invoicesToDelete.map(
                                                    (invoice) => (
                                                        <li key={invoice.id}>
                                                            {invoice.title} -{' '}
                                                            {formatCurrency(
                                                                invoice.total_amount ||
                                                                    0
                                                            )}
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
                                onClick={() => setInvoicesToDelete([])}
                                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                disabled={deleteInvoiceMutation.isPending}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleBulkDelete}
                                disabled={deleteInvoiceMutation.isPending}
                                className="border-border text-foreground hover:bg-muted hover:border-muted-foreground font-medium bg-transparent"
                            >
                                {deleteInvoiceMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    `Delete ${invoicesToDelete.length} Invoices`
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
