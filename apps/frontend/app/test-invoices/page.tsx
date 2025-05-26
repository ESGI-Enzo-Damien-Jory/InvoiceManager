'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// PDFme imports
import type { Template } from '@pdfme/common'
import { Viewer } from '@pdfme/ui'
import { text, table } from '@pdfme/schemas'

interface Client {
    id: string
    first_name: string
    last_name: string
    email: string
    address?: string
    phone_number?: string
}

interface Invoice {
    id: string
    title: string
    total_amount: number | null
    state: string
    created_at: string
    expiration_date?: string | null
    pdf_url?: string | null
    clients: Client
}

interface PreviewModalProps {
    invoice: Invoice | null
    isOpen: boolean
    onClose: () => void
}

// Invoice template (should match your backend template)
const invoiceTemplate: Template = {
    basePdf: {
        width: 210,
        height: 297,
        padding: [20, 20, 20, 20],
    },
    schemas: [
        [
            {
                name: 'invoice_title',
                type: 'text',
                position: { x: 20, y: 20 },
                width: 100,
                height: 15,
                fontSize: 28,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#2563eb',
            },
            {
                name: 'invoice_id',
                type: 'text',
                position: { x: 130, y: 20 },
                width: 60,
                height: 10,
                fontSize: 12,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'right',
                fontColor: '#666666',
            },
            {
                name: 'from_label',
                type: 'text',
                position: { x: 20, y: 45 },
                width: 30,
                height: 8,
                fontSize: 12,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#374151',
            },
            {
                name: 'from_name',
                type: 'text',
                position: { x: 20, y: 55 },
                width: 80,
                height: 10,
                fontSize: 14,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#111827',
            },
            {
                name: 'from_email',
                type: 'text',
                position: { x: 20, y: 67 },
                width: 80,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#6b7280',
            },
            {
                name: 'to_label',
                type: 'text',
                position: { x: 20, y: 85 },
                width: 30,
                height: 8,
                fontSize: 12,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#374151',
            },
            {
                name: 'client_name',
                type: 'text',
                position: { x: 20, y: 95 },
                width: 80,
                height: 10,
                fontSize: 14,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#111827',
            },
            {
                name: 'client_email',
                type: 'text',
                position: { x: 20, y: 107 },
                width: 80,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#6b7280',
            },
            {
                name: 'client_address',
                type: 'text',
                position: { x: 20, y: 117 },
                width: 80,
                height: 20,
                fontSize: 10,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#6b7280',
            },
            {
                name: 'issue_date_label',
                type: 'text',
                position: { x: 130, y: 45 },
                width: 35,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#374151',
            },
            {
                name: 'issue_date',
                type: 'text',
                position: { x: 130, y: 55 },
                width: 60,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#111827',
            },
            {
                name: 'due_date_label',
                type: 'text',
                position: { x: 130, y: 70 },
                width: 35,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#374151',
            },
            {
                name: 'due_date',
                type: 'text',
                position: { x: 130, y: 80 },
                width: 60,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#111827',
            },
            {
                name: 'status_label',
                type: 'text',
                position: { x: 130, y: 95 },
                width: 35,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#374151',
            },
            {
                name: 'status',
                type: 'text',
                position: { x: 130, y: 105 },
                width: 60,
                height: 8,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#16a34a',
            },
            {
                name: 'description_label',
                type: 'text',
                position: { x: 20, y: 150 },
                width: 50,
                height: 8,
                fontSize: 12,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#374151',
            },
            {
                name: 'description',
                type: 'text',
                position: { x: 20, y: 162 },
                width: 170,
                height: 15,
                fontSize: 11,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#111827',
            },
            {
                name: 'items_table',
                type: 'table',
                position: { x: 20, y: 180 },
                width: 170,
                height: 60,
                showHead: true,
                head: ['Item', 'Qty', 'Price', 'Total'],
                headWidthPercentages: [40, 20, 20, 20],
                tableStyles: {
                    borderWidth: 0.3,
                    borderColor: '#000000',
                },
                headStyles: {
                    fontName: 'NotoSerifJP-Regular',
                    fontSize: 10,
                    characterSpacing: 0,
                    alignment: 'left',
                    verticalAlignment: 'middle',
                    lineHeight: 1,
                    fontColor: '#ffffff',
                    backgroundColor: '#374151',
                    borderWidth: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                    padding: {
                        top: 3,
                        right: 3,
                        bottom: 3,
                        left: 3,
                    },
                },
                bodyStyles: {
                    fontName: 'NotoSerifJP-Regular',
                    fontSize: 9,
                    characterSpacing: 0,
                    alignment: 'left',
                    verticalAlignment: 'middle',
                    lineHeight: 1,
                    fontColor: '#000000',
                    borderColor: '#888888',
                    backgroundColor: '',
                    alternateBackgroundColor: '#f9f9f9',
                    borderWidth: {
                        top: 0.1,
                        right: 0.1,
                        bottom: 0.1,
                        left: 0.1,
                    },
                    padding: {
                        top: 2,
                        right: 3,
                        bottom: 2,
                        left: 3,
                    },
                },
                columnStyles: {},
            },
            {
                name: 'total_label',
                type: 'text',
                position: { x: 130, y: 250 },
                width: 35,
                height: 12,
                fontSize: 14,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#374151',
            },
            {
                name: 'total_amount',
                type: 'text',
                position: { x: 130, y: 265 },
                width: 60,
                height: 15,
                fontSize: 18,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'left',
                fontColor: '#111827',
            },
            {
                name: 'footer_note',
                type: 'text',
                position: { x: 20, y: 285 },
                width: 170,
                height: 20,
                fontSize: 9,
                fontName: 'NotoSerifJP-Regular',
                alignment: 'center',
                fontColor: '#9ca3af',
            },
        ],
    ],
}

function PreviewModal({ invoice, isOpen, onClose }: PreviewModalProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewerRef = useRef<Viewer | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen || !invoice || !containerRef.current) {
            return
        }

        const initializeViewer = async () => {
            setLoading(true)
            setError(null)

            try {
                // Fetch invoice data with items
                const token = localStorage.getItem('token')
                const res = await fetch(
                    `http://localhost:3333/api/invoices/${invoice.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                )

                if (!res.ok) {
                    throw new Error('Failed to fetch invoice details')
                }

                const invoiceData = await res.json()

                // Format data for PDFme
                const formattedAmount = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(invoice.total_amount || 0)

                const issueDate = new Date(
                    invoice.created_at
                ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })

                const dueDate = invoice.expiration_date
                    ? new Date(invoice.expiration_date).toLocaleDateString(
                          'en-US',
                          {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                          }
                      )
                    : 'No due date'

                const clientName =
                    `${invoice.clients?.first_name || ''} ${invoice.clients?.last_name || ''}`.trim()
                const clientAddress = invoice.clients?.address || ''
                const clientPhone = invoice.clients?.phone_number
                    ? `Phone: ${invoice.clients.phone_number}`
                    : ''
                const fullAddress = [clientAddress, clientPhone]
                    .filter(Boolean)
                    .join('\n')

                // Mock items data (you might need to fetch this separately)
                const tableData = [
                    ['Sample Item 1', '2', '$50.00', '$100.00'],
                    ['Sample Item 2', '1', '$25.00', '$25.00'],
                ]

                const inputs = [
                    {
                        invoice_title: 'INVOICE',
                        invoice_id: `#${invoice.id.substring(0, 8).toUpperCase()}`,
                        from_label: 'FROM:',
                        from_name: 'Your Company Name',
                        from_email: 'your@company.com',
                        to_label: 'BILL TO:',
                        client_name: clientName,
                        client_email: invoice.clients?.email || '',
                        client_address: fullAddress,
                        issue_date_label: 'Issue Date:',
                        issue_date: issueDate,
                        due_date_label: 'Due Date:',
                        due_date: dueDate,
                        status_label: 'Status:',
                        status: invoice.state.toUpperCase(),
                        description_label: 'Description:',
                        description: invoice.title,
                        items_table: tableData,
                        total_label: 'TOTAL:',
                        total_amount: formattedAmount,
                        footer_note:
                            'Thank you for your business! Please contact us if you have any questions about this invoice.',
                    },
                ]

                // Clean up previous viewer
                if (viewerRef.current) {
                    viewerRef.current = null
                }

                // Clear container
                if (containerRef.current) {
                    containerRef.current.innerHTML = ''
                }

                // Create new viewer
                viewerRef.current = new Viewer({
                    domContainer: containerRef.current,
                    template: invoiceTemplate,
                    inputs,
                    plugins: { text, table },
                })
            } catch (err) {
                console.error('Error initializing PDF viewer:', err)
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load preview'
                )
            } finally {
                setLoading(false)
            }
        }

        initializeViewer()

        return () => {
            if (viewerRef.current) {
                viewerRef.current = null
            }
        }
    }, [isOpen, invoice])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        Preview: {invoice?.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="flex-1 p-4 overflow-auto">
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <div
                        ref={containerRef}
                        className="w-full min-h-[600px] border border-gray-200 rounded"
                        style={{ display: loading || error ? 'none' : 'block' }}
                    />
                </div>
            </div>
        </div>
    )
}

export default function TestInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [downloading, setDownloading] = useState<string | null>(null)
    const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    router.push('/test-login')
                    return
                }

                const res = await fetch('http://localhost:3333/api/invoices', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (res.status === 401) {
                    localStorage.removeItem('token')
                    router.push('/test-login')
                    return
                }

                if (!res.ok) {
                    throw new Error(`Failed to fetch invoices: ${res.status}`)
                }

                const data = await res.json()
                setInvoices(data)
            } catch (err) {
                console.error('Error fetching invoices:', err)
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load invoices'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchInvoices()
    }, [router])

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Not set'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) {
            return '$0.00'
        }
        return `$${amount}`
    }

    const downloadPdf = async (id: string, title: string, hasPdf: boolean) => {
        if (!hasPdf) {
            alert('PDF not available for this invoice (might be a draft)')
            return
        }

        setDownloading(id)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(
                `http://localhost:3333/api/invoices/pdf/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('PDF not found')
                }
                throw new Error(`Download failed: ${res.status}`)
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${id.substring(0, 8)}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Error downloading PDF:', err)
            alert(err instanceof Error ? err.message : 'Failed to download PDF')
        } finally {
            setDownloading(null)
        }
    }

    const previewPdf = (invoice: Invoice) => {
        setPreviewInvoice(invoice)
        setShowPreview(true)
    }

    const getStateColor = (state: string) => {
        switch (state) {
            case 'Draft':
                return 'bg-gray-100 text-gray-800'
            case 'Sent':
                return 'bg-blue-100 text-blue-800'
            case 'Paid':
                return 'bg-green-100 text-green-800'
            case 'Overdue':
                return 'bg-red-100 text-red-800'
            case 'Cancelled':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-red-800 font-semibold mb-2">
                        Error Loading Invoices
                    </h2>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Invoices
                    </h1>
                    <div className="text-sm text-gray-500">
                        {invoices.length} invoice
                        {invoices.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {invoices.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📄</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No invoices found
                        </h3>
                        <p className="text-gray-500">
                            Create your first invoice to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {invoice.title}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(invoice.state)}`}
                                                >
                                                    {invoice.state}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>
                                                    <span className="font-medium">
                                                        Client:
                                                    </span>{' '}
                                                    {invoice.clients
                                                        ?.first_name ||
                                                        'N/A'}{' '}
                                                    {invoice.clients
                                                        ?.last_name || ''}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        Email:
                                                    </span>{' '}
                                                    {invoice.clients?.email ||
                                                        'N/A'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        Created:
                                                    </span>{' '}
                                                    {formatDate(
                                                        invoice.created_at
                                                    )}
                                                </p>
                                                {invoice.expiration_date && (
                                                    <p>
                                                        <span className="font-medium">
                                                            Due:
                                                        </span>{' '}
                                                        {formatDate(
                                                            invoice.expiration_date
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900 mb-4">
                                                {formatCurrency(
                                                    invoice.total_amount
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() =>
                                                        previewPdf(invoice)
                                                    }
                                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                                                >
                                                    Preview
                                                </button>

                                                {invoice.pdf_url && (
                                                    <button
                                                        onClick={() =>
                                                            downloadPdf(
                                                                invoice.id,
                                                                invoice.title,
                                                                !!invoice.pdf_url
                                                            )
                                                        }
                                                        disabled={
                                                            downloading ===
                                                            invoice.id
                                                        }
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                                    >
                                                        {downloading ===
                                                        invoice.id
                                                            ? 'Downloading...'
                                                            : 'Download PDF'}
                                                    </button>
                                                )}

                                                {!invoice.pdf_url &&
                                                    invoice.state ===
                                                        'Draft' && (
                                                        <span className="text-xs text-gray-500 px-4 py-2 bg-gray-50 rounded-md">
                                                            PDF available after
                                                            publishing
                                                        </span>
                                                    )}

                                                {!invoice.pdf_url &&
                                                    invoice.state !==
                                                        'Draft' && (
                                                        <span className="text-xs text-red-500 px-4 py-2 bg-red-50 rounded-md">
                                                            PDF generation
                                                            failed
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <PreviewModal
                invoice={previewInvoice}
                isOpen={showPreview}
                onClose={() => {
                    setShowPreview(false)
                    setPreviewInvoice(null)
                }}
            />
        </>
    )
}
