// =============================================================================
// TABLE COLUMNS - CENTRALIZED COLUMN DEFINITIONS
// =============================================================================

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Loader2, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Send,
  Phone,
  MapPin,
  Mail,
  User,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Client, Item, Invoice } from '@inma/types'

// =============================================================================
// TABLE META TYPES
// =============================================================================

export interface ClientTableMeta {
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  onView?: (client: Client) => void
  isDeleting?: string | null
  isUpdating?: string | null
}

export interface ItemTableMeta {
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  isDeleting?: string | null
  isUpdating?: string | null
}

export interface InvoiceTableMeta {
  onEdit?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
  onView?: (invoice: Invoice) => void
  onDownload?: (invoice: Invoice) => void
  onSend?: (invoice: Invoice) => void
  isDeleting?: string | null
  isUpdating?: string | null
  isSending?: string | null
}

// =============================================================================
// CLIENT COLUMNS
// =============================================================================

export const clientColumns: ColumnDef<Client, any>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'first_name',
    header: 'Prénom',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.getValue('first_name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'last_name',
    header: 'Nom',
    cell: ({ row }) => <span>{row.getValue('last_name')}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue('email')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'phone_number',
    header: 'Téléphone',
    cell: ({ row }) => {
      const phone = row.getValue('phone_number') as string
      return phone ? (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{phone}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'address',
    header: 'Adresse',
    cell: ({ row }) => {
      const address = row.getValue('address') as string
      return address ? (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[200px] truncate">{address}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Modifié le',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updated_at'))
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(date, 'dd/MM/yyyy', { locale: fr })}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const client = row.original
      const meta = table.options.meta as ClientTableMeta
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onView?.(client)}
            disabled={meta.isUpdating === client.id}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onEdit?.(client)}
            disabled={meta.isUpdating === client.id}
          >
            {meta.isUpdating === client.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onDelete?.(client)}
            disabled={meta.isDeleting === client.id}
          >
            {meta.isDeleting === client.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    },
  },
]

// =============================================================================
// ITEM COLUMNS
// =============================================================================

export const itemColumns: ColumnDef<Item, any>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.avatar || undefined} />
          <AvatarFallback>
            <FileText className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Prix',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span>{new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(row.getValue('price'))}</span>
      </div>
    ),
  },
  {
    accessorKey: 'updated_at',
    header: 'Modifié le',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updated_at'))
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(date, 'dd/MM/yyyy', { locale: fr })}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const item = row.original
      const meta = table.options.meta as ItemTableMeta
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onEdit?.(item)}
            disabled={meta.isUpdating === item.id}
          >
            {meta.isUpdating === item.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onDelete?.(item)}
            disabled={meta.isDeleting === item.id}
          >
            {meta.isDeleting === item.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    },
  },
]

// =============================================================================
// INVOICE COLUMNS
// =============================================================================

export const invoiceColumns: ColumnDef<Invoice, any>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue('title')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'state',
    header: 'Statut',
    cell: ({ row }) => {
      const state = row.getValue('state') as string
      const getStateConfig = (state: string) => {
        switch (state) {
          case 'Draft':
            return { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' }
          case 'Sent':
            return { label: 'Envoyée', color: 'bg-blue-100 text-blue-800' }
          case 'Paid':
            return { label: 'Payée', color: 'bg-green-100 text-green-800' }
          case 'Overdue':
            return { label: 'En retard', color: 'bg-red-100 text-red-800' }
          case 'Cancelled':
            return { label: 'Annulée', color: 'bg-yellow-100 text-yellow-800' }
          default:
            return { label: state, color: 'bg-gray-100 text-gray-800' }
        }
      }
      
      const config = getStateConfig(state)
      return (
        <Badge className={cn('font-medium', config.color)}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'total_amount',
    header: 'Montant',
    cell: ({ row }) => {
      const amount = row.getValue('total_amount') as number
      return amount ? (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            }).format(amount)}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Créée le',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(date, 'dd/MM/yyyy', { locale: fr })}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'expiration_date',
    header: 'Échéance',
    cell: ({ row }) => {
      const date = row.getValue('expiration_date') as string
      return date ? (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(date), 'dd/MM/yyyy', { locale: fr })}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const invoice = row.original
      const meta = table.options.meta as InvoiceTableMeta
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onView?.(invoice)}
            disabled={meta.isUpdating === invoice.id}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onDownload?.(invoice)}
            disabled={meta.isUpdating === invoice.id}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onSend?.(invoice)}
            disabled={meta.isSending === invoice.id}
          >
            {meta.isSending === invoice.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onEdit?.(invoice)}
            disabled={meta.isUpdating === invoice.id}
          >
            {meta.isUpdating === invoice.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onDelete?.(invoice)}
            disabled={meta.isDeleting === invoice.id}
          >
            {meta.isDeleting === invoice.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    },
  },
] 