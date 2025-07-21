// =============================================================================
// BUSINESS TYPES - DOMAIN LOGIC & BUSINESS RULES
// =============================================================================

import type { Database } from '@inma/types'

// =============================================================================
// INVOICE BUSINESS TYPES
// =============================================================================

export type InvoiceState = Database['public']['Enums']['invoice_state']

export interface InvoiceStatus {
    state: InvoiceState
    label: string
    color: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: string
    description: string
}

export interface InvoiceCalculation {
    subtotal: number
    tax: number
    total: number
    currency: string
}

export interface InvoiceTimeline {
    created_at: string
    sent_at?: string
    paid_at?: string
    overdue_at?: string
    cancelled_at?: string
}

export interface InvoiceStats {
    total: number
    paid: number
    pending: number
    overdue: number
    cancelled: number
    totalAmount: number
    paidAmount: number
    pendingAmount: number
    overdueAmount: number
}

// =============================================================================
// CLIENT BUSINESS TYPES
// =============================================================================

export interface ClientStats {
    total: number
    active: number
    inactive: number
    totalInvoices: number
    totalAmount: number
    averageInvoiceAmount: number
}

export interface ClientActivity {
    lastInvoiceDate?: string
    totalInvoices: number
    totalPaid: number
    totalPending: number
    averagePaymentTime?: number // in days
}

export interface ClientWithStats {
    id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string | null
    address: string | null
    avatar?: string
    status?: 'Active' | 'Inactive'
    total_invoices?: number
    total_revenue?: number
    unpaid_amount?: number
    updated_at: string
    deleted_at: string | null
    user_id: string
}

// =============================================================================
// ITEM BUSINESS TYPES
// =============================================================================

export interface ItemStats {
    total: number
    active: number
    inactive: number
    totalSold: number
    totalRevenue: number
    averagePrice: number
}

export interface ItemUsage {
    itemId: string
    itemName: string
    totalQuantity: number
    totalRevenue: number
    usageCount: number
    lastUsed?: string
}

// =============================================================================
// DASHBOARD & ANALYTICS TYPES
// =============================================================================

export interface DashboardStats {
    invoices: InvoiceStats
    clients: ClientStats
    items: ItemStats
    revenue: RevenueStats
}

export interface RevenueStats {
    currentMonth: number
    previousMonth: number
    growth: number
    trend: 'up' | 'down' | 'stable'
    currency: string
}

export interface ChartData {
    labels: string[]
    datasets: Array<{
        label: string
        data: number[]
        backgroundColor?: string
        borderColor?: string
    }>
}

export interface TimeSeriesData {
    date: string
    value: number
    label?: string
}

// =============================================================================
// NOTIFICATION & ALERT TYPES
// =============================================================================

export interface BusinessAlert {
    id: string
    type: 'invoice_overdue' | 'payment_received' | 'client_activity' | 'system'
    title: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    timestamp: string
    read: boolean
    actionUrl?: string
    metadata?: Record<string, any>
}

export interface NotificationPreferences {
    email: boolean
    push: boolean
    sms: boolean
    invoiceAlerts: boolean
    paymentAlerts: boolean
    systemAlerts: boolean
}

// =============================================================================
// EXPORT & IMPORT TYPES
// =============================================================================

export interface ExportOptions {
    format: 'pdf' | 'csv' | 'excel' | 'json'
    dateRange?: {
        from: string
        to: string
    }
    filters?: Record<string, any>
    includeDeleted?: boolean
}

export interface ImportResult {
    success: number
    failed: number
    errors: Array<{
        row: number
        field: string
        message: string
    }>
    warnings: Array<{
        row: number
        field: string
        message: string
    }>
}

// =============================================================================
// WORKFLOW & PROCESS TYPES
// =============================================================================

export interface InvoiceWorkflow {
    currentState: InvoiceState
    availableTransitions: InvoiceState[]
    requiredFields: string[]
    validationRules: Record<string, any>
    nextActions: Array<{
        action: string
        label: string
        state: InvoiceState
        icon: string
    }>
}

export interface ApprovalWorkflow {
    requiresApproval: boolean
    approvers: string[]
    currentApprover?: string
    approvalHistory: Array<{
        approver: string
        status: 'approved' | 'rejected' | 'pending'
        timestamp: string
        comment?: string
    }>
}

// =============================================================================
// INTEGRATION & EXTERNAL TYPES
// =============================================================================

export interface PaymentGateway {
    id: string
    name: string
    type: 'stripe' | 'paypal' | 'bank_transfer' | 'check'
    enabled: boolean
    config: Record<string, any>
}

export interface EmailTemplate {
    id: string
    name: string
    subject: string
    body: string
    variables: string[]
    type: 'invoice_sent' | 'payment_reminder' | 'payment_received' | 'welcome'
}

export interface WebhookEvent {
    id: string
    type: string
    payload: Record<string, any>
    timestamp: string
    processed: boolean
    retryCount: number
}

// =============================================================================
// AUDIT & LOGGING TYPES
// =============================================================================

export interface AuditLog {
    id: string
    userId: string
    action: string
    resource: string
    resourceId: string
    changes?: Record<string, { old: any; new: any }>
    timestamp: string
    ipAddress?: string
    userAgent?: string
}

export interface ActivityLog {
    id: string
    userId: string
    activity: string
    description: string
    metadata?: Record<string, any>
    timestamp: string
}

// =============================================================================
// SETTINGS & CONFIGURATION TYPES
// =============================================================================

export interface CompanySettings {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    logo?: string
    taxId?: string
    currency: string
    timezone: string
    dateFormat: string
    language: string
}

export interface InvoiceSettings {
    defaultTerms: string
    defaultNotes: string
    autoNumbering: boolean
    numberPrefix: string
    taxRate: number
    currency: string
    dueDateDays: number
    allowPartialPayments: boolean
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    dateFormat: string
    currency: string
    notifications: NotificationPreferences
    dashboard: {
        layout: string
        widgets: string[]
    }
}
