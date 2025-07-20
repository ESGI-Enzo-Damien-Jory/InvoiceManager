// =============================================================================
// TABLE COLUMN TYPES - CENTRALIZED COLUMN DEFINITIONS
// =============================================================================

import type { ColumnDef } from '@tanstack/react-table'
import type { Client, Item, Invoice, InvoiceItem } from '@inma/types'
import type { TableMeta } from './ui'

// =============================================================================
// CLIENT TABLE COLUMNS
// =============================================================================

export interface ClientTableMeta extends TableMeta {
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onView: (client: Client) => void
  isDeleting: string | null
  isUpdating: string | null
}

export type ClientColumnDef = ColumnDef<Client, any>

// =============================================================================
// ITEM TABLE COLUMNS
// =============================================================================

export interface ItemTableMeta extends TableMeta {
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  isDeleting: string | null
  isUpdating: string | null
}

export type ItemColumnDef = ColumnDef<Item, any>

// =============================================================================
// INVOICE TABLE COLUMNS
// =============================================================================

export interface InvoiceTableMeta extends TableMeta {
  onEdit: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  onView: (invoice: Invoice) => void
  onDownload: (invoice: Invoice) => void
  onSend: (invoice: Invoice) => void
  isDeleting: string | null
  isUpdating: string | null
  isSending: string | null
}

export type InvoiceColumnDef = ColumnDef<Invoice, any>

// =============================================================================
// INVOICE ITEM TABLE COLUMNS
// =============================================================================

export interface InvoiceItemTableMeta extends TableMeta {
  onEdit: (item: InvoiceItem) => void
  onDelete: (item: InvoiceItem) => void
  isDeleting: string | null
  isUpdating: string | null
}

export type InvoiceItemColumnDef = ColumnDef<InvoiceItem, any>

// =============================================================================
// GENERIC TABLE TYPES
// =============================================================================

export interface SortableColumn {
  id: string
  label: string
  sortable: boolean
  align?: 'left' | 'center' | 'right'
  width?: number | string
}

export interface FilterableColumn {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'number' | 'boolean'
  options?: Array<{ value: string; label: string }>
}

export interface TableConfig<T> {
  columns: ColumnDef<T, any>[]
  sortableColumns: SortableColumn[]
  filterableColumns: FilterableColumn[]
  defaultSort?: { id: keyof T; desc: boolean }
  pageSize?: number
  searchable?: boolean
}

// =============================================================================
// DASHBOARD TABLE TYPES
// =============================================================================

export interface DashboardTableData {
  id: string
  title: string
  status: string
  amount: number
  date: string
  client: string
}

export interface DashboardTableMeta extends TableMeta {
  onView: (item: DashboardTableData) => void
}

export type DashboardColumnDef = ColumnDef<DashboardTableData, any>

// =============================================================================
// ACTIVITY TABLE TYPES
// =============================================================================

export interface ActivityTableData {
  id: string
  action: string
  description: string
  user: string
  timestamp: string
  type: 'create' | 'update' | 'delete' | 'system'
}

export interface ActivityTableMeta extends TableMeta {
  onView: (item: ActivityTableData) => void
}

export type ActivityColumnDef = ColumnDef<ActivityTableData, any>

// =============================================================================
// NOTIFICATION TABLE TYPES
// =============================================================================

export interface NotificationTableData {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: string
  read: boolean
}

export interface NotificationTableMeta extends TableMeta {
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export type NotificationColumnDef = ColumnDef<NotificationTableData, any> 