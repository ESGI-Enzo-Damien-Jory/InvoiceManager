// =============================================================================
// UI TYPES - COMPONENTS & INTERFACES
// =============================================================================

import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface TableMeta {
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onView?: (item: any) => void
  isDeleting?: string | null
  isUpdating?: string | null
  isLoading?: boolean
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: TableMeta
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  searchPlaceholder?: string
  showSearch?: boolean
  showPagination?: boolean
  pageSize?: number
}

export interface ColumnConfig<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T], row: T) => ReactNode
}

// =============================================================================
// DIALOG & MODAL TYPES
// =============================================================================

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'destructive' | 'default'
}

// =============================================================================
// FORM COMPONENT TYPES
// =============================================================================

export interface UIFormFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
}

export interface SelectFieldProps extends UIFormFieldProps {
  options: Array<{ value: string; label: string }>
  multiple?: boolean
}

export interface DateFieldProps extends UIFormFieldProps {
  minDate?: Date
  maxDate?: Date
  format?: string
}

export interface FileFieldProps extends UIFormFieldProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface NavigationItem {
  title: string
  href: string
  icon?: ReactNode
  badge?: string | number
  children?: NavigationItem[]
  disabled?: boolean
  external?: boolean
}

export interface BreadcrumbItem {
  title: string
  href?: string
  icon?: ReactNode
}

export interface SidebarProps {
  items: NavigationItem[]
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

// =============================================================================
// CARD & LAYOUT TYPES
// =============================================================================

export interface CardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  headerActions?: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'outline' | 'ghost'
}

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

// =============================================================================
// STATE TYPES
// =============================================================================

export interface EmptyStateProps {
  title?: string
  description: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  className?: string
}

export interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
  className?: string
}

// =============================================================================
// FILTER & SEARCH TYPES
// =============================================================================

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterGroup {
  key: string
  label: string
  options: FilterOption[]
  type: 'select' | 'checkbox' | 'radio' | 'date-range'
  multiple?: boolean
}

export interface SearchFiltersProps {
  filters: FilterGroup[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
  onReset?: () => void
  className?: string
}

// =============================================================================
// CHART & DATA VISUALIZATION TYPES
// =============================================================================

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface ChartProps {
  data: ChartDataPoint[]
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  title?: string
  height?: number
  className?: string
}

export interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    percentage: number
    isPositive: boolean
  }
  icon?: ReactNode
  className?: string
}

// =============================================================================
// NOTIFICATION & TOAST TYPES
// =============================================================================

export interface ToastProps {
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface NotificationItem {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: Date
  read?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// =============================================================================
// RESPONSIVE & MOBILE TYPES
// =============================================================================

export interface ResponsiveProps {
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
  className?: string
}

export interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: NavigationItem[]
}

// =============================================================================
// THEME & STYLING TYPES
// =============================================================================

export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  error: string
  warning: string
  success: string
  info: string
}

export interface VariantProps<T> {
  variant?: keyof T
  size?: 'sm' | 'md' | 'lg'
  className?: string
} 