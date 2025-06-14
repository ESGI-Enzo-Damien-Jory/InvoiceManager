import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Invoice as BaseInvoice } from '@/types/invoices'
import { ColumnDef } from '@tanstack/react-table'
import {
    Edit,
    ChevronDown,
    User,
    AlertTriangle,
    Eye,
    Loader2,
    Trash2,
    Calendar,
} from 'lucide-react'
import { formatDate, formatCurrency, isOverdue } from '@/lib/utils'
import { StatusBadge } from '@/components/custom/status-badge'

type Invoice = BaseInvoice & {
    clients: {
        id: string
        first_name: string
        last_name: string
        email: string
        address: string | null
        phone_number: string | null
    }
}

interface TableMeta {
    onEdit: (invoice: Invoice) => void
    onDelete: (invoice: Invoice) => void
    onView: (invoice: Invoice) => void
    onDuplicate: (invoice: Invoice) => void
    onSend: (invoice: Invoice) => void
    onDownload: (invoice: Invoice) => void
    isDeleting: string | null
    isDownloading: string | null
    isSending: string | null
}

export const invoiceColumns: ColumnDef<Invoice>[] = [
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
        accessorKey: 'title',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Invoice
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
            <div>
                <div className="font-medium">{row.original.title}</div>
                <div className="text-sm text-muted-foreground font-mono">
                    INV-{row.original.id.slice(0, 8)}
                </div>
            </div>
        ),
        enableHiding: false,
    },
    {
        accessorFn: (row) =>
            `${row.clients.first_name} ${row.clients.last_name}`,
        id: 'client',
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
            <div className="text-left">
                <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <div>
                        <div className="font-medium">
                            {row.original.clients.first_name}{' '}
                            {row.original.clients.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {row.original.clients.email}
                        </div>
                    </div>
                </div>
            </div>
        ),
        size: 250,
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Date
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
                <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="tabular-nums text-sm">
                        {formatDate(row.original.created_at)}
                    </span>
                </div>
                {row.original.expiration_date && (
                    <div
                        className={`text-xs mt-1 ${
                            isOverdue(row.original)
                                ? 'text-red-600 font-medium'
                                : 'text-muted-foreground'
                        }`}
                    >
                        Due: {formatDate(row.original.expiration_date)}
                    </div>
                )}
            </div>
        ),
        size: 150,
    },
    {
        accessorKey: 'state',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Status
                    {column.getIsSorted() === 'asc' && (
                        <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                    )}
                    {column.getIsSorted() === 'desc' && (
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const invoice = row.original
            if (isOverdue(invoice)) {
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-300 animate-pulse">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                    </Badge>
                )
            }
            return <StatusBadge status={invoice.state} />
        },
        size: 120,
    },
    {
        accessorKey: 'total_amount',
        header: ({ column }) => (
            <div className="flex items-center justify-start">
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                    Amount
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
            <div className="font-medium tabular-nums text-muted-foreground">
                {formatCurrency(row.original.total_amount || 0)}
            </div>
        ),
        size: 120,
    },
    {
        id: 'actions',
        header: () => <div className="text-center font-semibold">Actions</div>,
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMeta | undefined
            const invoice = row.original

            return (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onView(invoice)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View invoice</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onEdit(invoice)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit invoice</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => meta?.onDelete(invoice)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        disabled={meta?.isDeleting === invoice.id}
                    >
                        {meta?.isDeleting === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete invoice</span>
                    </Button>
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 120,
    },
]
