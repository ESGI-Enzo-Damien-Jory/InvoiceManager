import { Checkbox } from '@/components/ui/checkbox'
import { Item } from '@inma/types'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, Loader2, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TableMeta {
    onEdit: (item: Item) => void
    onDelete: (item: Item) => void
    isDeleting: string | null
    isUpdating: string | null
}

export const columns: ColumnDef<Item>[] = [
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
            const meta = table.options.meta as TableMeta | undefined
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
