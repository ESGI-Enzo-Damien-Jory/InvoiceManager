import { Client } from "@inma/types"
import { ColumnDef } from "@tanstack/react-table"
import { ChevronDown, Phone, MapPin, Eye, Edit, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface TableMeta {
    onEdit: (client: Client) => void
    onDelete: (client: Client) => void
    onView: (client: Client) => void
    isDeleting: string | null
}

export const columns: ColumnDef<Client>[] = [
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