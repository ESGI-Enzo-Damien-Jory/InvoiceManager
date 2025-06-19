'use client'

import * as React from 'react'
import {
    flexRender,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type OnChangeFn,
    type RowSelectionState,
    type PaginationState,
    type Column,
} from '@tanstack/react-table'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Columns,
    ChevronDown,
    Loader2,
    Trash2,
    MoreHorizontal,
} from 'lucide-react'

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

type DataTableEmptyStateProps = {
    message?: string
}

type DataTableErrorStateProps = {
    message?: string
    onRetry?: () => void
}

interface DataTableProps<T extends Record<string, unknown>> {
    columns: ColumnDef<T>[]
    data: T[]
    is_loading?: boolean
    is_error?: boolean
    error_message?: string | React.ReactNode
    empty_message?: string | React.ReactNode
    error_state_component?: React.ComponentType<DataTableErrorStateProps>
    empty_state_component?: React.ComponentType<DataTableEmptyStateProps>
    on_refetch?: () => void

    on_edit?: (row: T) => void
    on_delete?: (row: T) => void
    on_view?: (row: T) => void
    is_deleting?: string | null

    enable_row_selection?: boolean
    enable_bulk_delete?: boolean
    on_bulk_delete?: (rows: T[]) => Promise<void> | void
    is_bulk_deleting?: boolean

    get_row_id?: (row: T, index: number) => string

    search_placeholder?: string
    search_column?: string

    header_actions?: React.ReactNode

    render_row_actions?: (row: T) => React.ReactNode

    selection_state?: RowSelectionState
    on_selection_change?: OnChangeFn<RowSelectionState>

    pagination_state?: PaginationState
    on_pagination_change?: OnChangeFn<PaginationState>
}

export default function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    is_loading,
    is_error,
    error_message,
    empty_message,
    error_state_component: ErrorStateComponent,
    empty_state_component: EmptyStateComponent,
    on_refetch,
    on_edit,
    on_delete,
    on_view,
    is_deleting,
    enable_row_selection = true,
    enable_bulk_delete = true,
    on_bulk_delete,
    is_bulk_deleting,
    get_row_id,
    search_placeholder = 'Search...',
    search_column,
    header_actions,
    render_row_actions,
    selection_state,
    on_selection_change,
    pagination_state,
    on_pagination_change,
}: DataTableProps<T>) {
    const [internal_selection, set_internal_selection] =
        React.useState<RowSelectionState>({})
    const row_selection = selection_state ?? internal_selection
    const set_row_selection = on_selection_change ?? set_internal_selection

    const [column_visibility, set_column_visibility] =
        React.useState<VisibilityState>({})
    const [column_filters, set_column_filters] =
        React.useState<ColumnFiltersState>([])
    const [sorting, set_sorting] = React.useState<SortingState>([])
    const [internal_pagination, set_internal_pagination] =
        React.useState<PaginationState>({
            pageIndex: 0,
            pageSize: 10,
        })
    const pagination = pagination_state ?? internal_pagination
    const set_pagination = on_pagination_change ?? set_internal_pagination

    const getColumnAccessorKey = React.useCallback(
        (column: ColumnDef<T>): string | undefined => {
            if ('accessorKey' in column) {
                return column.accessorKey as string
            }
            return undefined
        },
        []
    )

    const search_col = React.useMemo(() => {
        if (search_column) {
            const by_id = columns.find(
                (col) => (col.id ?? getColumnAccessorKey(col)) === search_column
            )
            if (by_id) return by_id
        }

        if (columns.length > 0 && columns[0].id === 'select') {
            return columns[1]
        }
        return columns[0]
    }, [columns, search_column, getColumnAccessorKey])

    const get_column_label = React.useCallback(
        (column: Column<T, unknown>): string => {
            const columnDef = column.columnDef

            if (typeof columnDef.header === 'string') {
                return columnDef.header
            }

            if ('accessorKey' in columnDef && columnDef.accessorKey) {
                const accessorKey = columnDef.accessorKey as string
                return accessorKey
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
            }

            return column.id
                .split('_')
                .map(
                    (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(' ')
        },
        []
    )

    const meta = React.useMemo(
        () => ({
            onEdit: on_edit,
            onDelete: on_delete,
            onView: on_view,
            isDeleting: is_deleting,
            renderRowActions: render_row_actions,
        }),
        [on_edit, on_delete, on_view, is_deleting, render_row_actions]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility: column_visibility,
            rowSelection: row_selection,
            columnFilters: column_filters,
            pagination,
        },
        getRowId:
            get_row_id ??
            ((row, i) => {
                const rowData = row as Record<string, unknown>
                return (
                    rowData.id?.toString() ??
                    rowData.key?.toString() ??
                    (rowData._id ? rowData._id.toString() : undefined) ??
                    `row_${i}`
                )
            }),
        enableRowSelection: enable_row_selection,
        onRowSelectionChange: set_row_selection,
        onSortingChange: set_sorting,
        onColumnFiltersChange: set_column_filters,
        onColumnVisibilityChange: set_column_visibility,
        onPaginationChange: set_pagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        meta,
    })

    const get_selected_rows = React.useCallback(
        () =>
            table.getFilteredSelectedRowModel().rows.map((row) => row.original),
        [table]
    )

    const handle_bulk_delete = React.useCallback(async () => {
        if (on_bulk_delete) {
            await on_bulk_delete(get_selected_rows())
            table.resetRowSelection()
        }
    }, [on_bulk_delete, get_selected_rows, table])

    if (is_loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading…</span>
            </div>
        )
    }

    if (is_error) {
        if (ErrorStateComponent)
            return (
                <ErrorStateComponent
                    message={
                        typeof error_message === 'string'
                            ? error_message
                            : undefined
                    }
                    onRetry={on_refetch}
                />
            )
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="text-destructive font-semibold">
                    {error_message || 'An error occurred.'}
                </div>
                {on_refetch && (
                    <Button variant="outline" onClick={on_refetch}>
                        Retry
                    </Button>
                )}
            </div>
        )
    }

    if (!data || data.length === 0) {
        if (EmptyStateComponent)
            return (
                <EmptyStateComponent
                    message={
                        typeof empty_message === 'string'
                            ? empty_message
                            : undefined
                    }
                />
            )
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground text-lg text-center">
                    {empty_message || 'No data found.'}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4 lg:p-6 h-full">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {search_col &&
                        (() => {
                            const columnId =
                                search_col.id ??
                                getColumnAccessorKey(search_col)
                            if (!columnId) return null

                            return (
                                <Input
                                    placeholder={search_placeholder}
                                    value={
                                        (table
                                            .getColumn(columnId)
                                            ?.getFilterValue() as string) ?? ''
                                    }
                                    onChange={(event) =>
                                        table
                                            .getColumn(columnId)
                                            ?.setFilterValue(event.target.value)
                                    }
                                    className="max-w-sm"
                                />
                            )
                        })()}
                </div>

                <div className="flex items-center gap-2">
                    {enable_row_selection &&
                        table.getFilteredSelectedRowModel().rows.length > 0 &&
                        enable_bulk_delete &&
                        on_bulk_delete && (
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
                                    onClick={handle_bulk_delete}
                                    className="h-8"
                                    disabled={is_bulk_deleting}
                                >
                                    {is_bulk_deleting && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Selected
                                </Button>
                            </div>
                        )}

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
                                            'undefined' && column.getCanHide()
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
                                        {get_column_label(column)}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {header_actions}
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border">
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <Table>
                            <TableHeader className="bg-muted sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className="h-12"
                                                style={{
                                                    width:
                                                        header.getSize() !== 150
                                                            ? header.getSize()
                                                            : undefined,
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        ))}
                                        {render_row_actions && (
                                            <TableHead key="row-actions" />
                                        )}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <ContextMenu key={row.id}>
                                            <ContextMenuTrigger asChild>
                                                <TableRow
                                                    data-state={
                                                        row.getIsSelected() &&
                                                        'selected'
                                                    }
                                                    className="cursor-pointer hover:bg-muted/50 h-14"
                                                >
                                                    {row
                                                        .getVisibleCells()
                                                        .map((cell) => (
                                                            <TableCell
                                                                key={cell.id}
                                                                className="py-2"
                                                            >
                                                                {flexRender(
                                                                    cell.column
                                                                        .columnDef
                                                                        .cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    {render_row_actions && (
                                                        <TableCell>
                                                            {render_row_actions(
                                                                row.original
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            </ContextMenuTrigger>
                                            <ContextMenuContent className="w-56">
                                                {on_view && (
                                                    <ContextMenuItem
                                                        onClick={() =>
                                                            on_view(
                                                                row.original
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </ContextMenuItem>
                                                )}
                                                {on_edit && (
                                                    <ContextMenuItem
                                                        onClick={() =>
                                                            on_edit(
                                                                row.original
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </ContextMenuItem>
                                                )}
                                                {on_delete && (
                                                    <ContextMenuItem
                                                        onClick={() =>
                                                            on_delete(
                                                                row.original
                                                            )
                                                        }
                                                        disabled={
                                                            is_deleting ===
                                                            row.id
                                                        }
                                                    >
                                                        {is_deleting ===
                                                            row.id && (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        )}
                                                        Delete
                                                    </ContextMenuItem>
                                                )}
                                                <ContextMenuSeparator />
                                                {enable_bulk_delete &&
                                                    on_bulk_delete && (
                                                        <ContextMenuSub>
                                                            <ContextMenuSubTrigger>
                                                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                                                Bulk Actions
                                                            </ContextMenuSubTrigger>
                                                            <ContextMenuSubContent className="w-48">
                                                                <ContextMenuItem
                                                                    onClick={() => {
                                                                        if (
                                                                            !row.getIsSelected()
                                                                        )
                                                                            row.toggleSelected()
                                                                        handle_bulk_delete()
                                                                    }}
                                                                    disabled={
                                                                        table.getFilteredSelectedRowModel()
                                                                            .rows
                                                                            .length ===
                                                                            0 ||
                                                                        is_bulk_deleting
                                                                    }
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    {is_bulk_deleting && (
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    )}
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                    Selected (
                                                                    {
                                                                        table.getFilteredSelectedRowModel()
                                                                            .rows
                                                                            .length
                                                                    }
                                                                    )
                                                                </ContextMenuItem>
                                                            </ContextMenuSubContent>
                                                        </ContextMenuSub>
                                                    )}
                                            </ContextMenuContent>
                                        </ContextMenu>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                columns.length +
                                                (render_row_actions ? 1 : 0)
                                            }
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ContextMenuTrigger>
                </ContextMenu>
            </div>

            <div className="flex items-center justify-between px-4">
                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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
                                        table.getState().pagination.pageSize
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </div>
                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                            }
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
