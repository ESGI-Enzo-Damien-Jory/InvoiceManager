'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { generate } from '@pdfme/generator'
import {
    text,
    image,
    barcodes,
    svg,
    multiVariableText,
    table,
    line,
    rectangle,
    ellipse,
    dateTime,
} from '@pdfme/schemas'
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Calculator,
    DollarSign,
    Eye,
    FileText,
    Loader2,
    Package,
    Save,
    Send,
    Trash2,
    User,
    AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useClients } from '@/hooks/use-clients'
import { useItems } from '@/hooks/use-items'
import { useCreateInvoice } from '@/hooks/use-invoices'
import { useUser } from '@/hooks/use-auth'
import { formatCurrency } from '@/lib/utils'
import { ItemSelector } from '@/components/custom/specialized/invoices/item-selector'
import { ClientSelector } from '@/components/custom/specialized/invoices/client-selector'
import { DateSelector } from '@/components/custom/specialized/invoices/date-selector'

interface InvoiceItem {
    item_id: string
    quantity: number
    unit_price: number
    name?: string
}

interface InvoiceFormData {
    client_id: string
    title: string
    expiration_date: Date | undefined
    state: 'Draft' | 'Sent' | 'Paid'
    items: InvoiceItem[]
}

interface Client {
    id: string
    first_name: string
    last_name: string
    email: string
    address?: string | null
    phone_number?: string | null
}

interface Item {
    id: string
    name: string
    price: number
}

const INITIAL_FORM_DATA: InvoiceFormData = {
    client_id: '',
    title: '',
    expiration_date: undefined,
    state: 'Draft',
    items: [],
}

let defaultTemplate: unknown = null
try {
    const templateModule = await import('@/templates/default_template.json')
    defaultTemplate = templateModule.default
} catch {
    console.warn('Template JSON file not found')
}

const calculateTotal = (items: InvoiceItem[]) =>
    items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

const generateInvoiceNumber = () => `INV-${Date.now()}`

const LoadingOverlay = ({ message }: { message: string }) => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card p-6 rounded-lg shadow-lg border flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    </div>
)

const ErrorAlert = ({
    error,
    onDismiss,
}: {
    error: string
    onDismiss: () => void
}) => (
    <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-auto p-1 text-destructive hover:text-destructive"
            >
                ✕
            </Button>
        </AlertDescription>
    </Alert>
)

const EmptyItemsState = () => (
    <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No items added</p>
        <p className="text-sm">Select an item above to get started</p>
    </div>
)

const ClientSummary = ({ client }: { client: Client }) => (
    <div className="p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Client</span>
        </div>
        <div className="space-y-1">
            <div className="font-medium">
                {client.first_name} {client.last_name}
            </div>
            <div className="text-sm text-muted-foreground">{client.email}</div>
            {client.phone_number && (
                <div className="text-sm text-muted-foreground">
                    {client.phone_number}
                </div>
            )}
            {client.address && (
                <div className="text-sm text-muted-foreground">
                    {client.address}
                </div>
            )}
        </div>
    </div>
)

export default function CreateInvoicePage() {
    const router = useRouter()
    const {
        data: clients = [],
        isLoading: clientsLoading,
        error: clientsError,
    } = useClients()
    const {
        data: items = [],
        isLoading: itemsLoading,
        error: itemsError,
    } = useItems()
    const {
        data: currentUser,
        isLoading: userLoading,
        error: userError,
    } = useUser()
    const createMutation = useCreateInvoice()

    const [formData, setFormData] = useState<InvoiceFormData>(INITIAL_FORM_DATA)
    const [showPreview, setShowPreview] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
    const [pdfError, setPdfError] = useState<string | null>(null)

    const totalAmount = useMemo(
        () => calculateTotal(formData.items),
        [formData.items]
    )
    const selectedClient = useMemo(
        () => clients.find((c) => c.id === formData.client_id),
        [clients, formData.client_id]
    )
    const isFormValid = useMemo(
        () => formData.client_id && formData.title && formData.items.length > 0,
        [formData.client_id, formData.title, formData.items.length]
    )

    const transformedClients = useMemo(
        () =>
            clients.map((client) => ({
                ...client,
                address: client.address || undefined,
                phone_number: client.phone_number || undefined,
            })),
        [clients]
    )

    const updateFormData = useCallback((updates: Partial<InvoiceFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }))
    }, [])

    const handleAddItem = useCallback(
        (item: Item) => {
            const existingIndex = formData.items.findIndex(
                (invoiceItem) => invoiceItem.item_id === item.id
            )

            if (existingIndex >= 0) {
                const updatedItems = [...formData.items]
                updatedItems[existingIndex].quantity += 1
                updateFormData({ items: updatedItems })
            } else {
                updateFormData({
                    items: [
                        ...formData.items,
                        {
                            item_id: item.id,
                            quantity: 1,
                            unit_price: item.price,
                            name: item.name,
                        },
                    ],
                })
            }
        },
        [formData.items, updateFormData]
    )

    const handleUpdateItemQuantity = useCallback(
        (index: number, quantity: number) => {
            if (quantity <= 0) {
                updateFormData({
                    items: formData.items.filter((_, i) => i !== index),
                })
                return
            }
            const updatedItems = [...formData.items]
            updatedItems[index].quantity = quantity
            updateFormData({ items: updatedItems })
        },
        [formData.items, updateFormData]
    )

    const handleUpdateItemPrice = useCallback(
        (index: number, price: number) => {
            const updatedItems = [...formData.items]
            updatedItems[index].unit_price = Math.max(0, price)
            updateFormData({ items: updatedItems })
        },
        [formData.items, updateFormData]
    )

    const handleRemoveItem = useCallback(
        (index: number) => {
            updateFormData({
                items: formData.items.filter((_, i) => i !== index),
            })
        },
        [formData.items, updateFormData]
    )

    const generatePDF = useCallback(async () => {
        if (!isFormValid) {
            setPdfError(
                'Please fill in all required fields before generating PDF'
            )
            return
        }

        if (!defaultTemplate) {
            setPdfError(
                'Template not found. Please check template configuration.'
            )
            return
        }

        if (!currentUser) {
            setPdfError(
                'User information not available. Please refresh the page.'
            )
            return
        }

        setPreviewLoading(true)
        setPdfError(null)

        try {
            const plugins = {
                text,
                image,
                qrcode: barcodes.qrcode,
                svg,
                multiVariableText,
                table,
                line,
                rectangle,
                ellipse,
                dateTime,
                rect: rectangle,
                circle: ellipse,
            }

            const invoiceNumber = generateInvoiceNumber()
            const currentDate = new Date()
            const userFullName = currentUser.display_name || ''

            const templateInputs = {
                billedToInput: selectedClient
                    ? `${selectedClient.first_name} ${selectedClient.last_name}\n${selectedClient.email}${
                          selectedClient.phone_number
                              ? `\n${selectedClient.phone_number}`
                              : ''
                      }${selectedClient.address ? `\n${selectedClient.address}` : ''}`
                    : '',

                info: JSON.stringify({
                    InvoiceNo: invoiceNumber,
                    Date: format(currentDate, 'dd MMMM yyyy'),
                }),

                orders: JSON.stringify(
                    formData.items.map((item) => [
                        item.name || '',
                        item.quantity.toString(),
                        item.unit_price.toString(),
                        (item.quantity * item.unit_price).toString(),
                    ])
                ),

                taxInput: JSON.stringify({ rate: '0' }),

                paymentInfoInput: `Payment Method: Bank Transfer\nDue Date: ${
                    formData.expiration_date
                        ? format(formData.expiration_date, 'dd MMMM yyyy')
                        : 'Upon receipt'
                }\nTotal Amount: €${totalAmount.toFixed(2)}`,

                subtotal: totalAmount.toString(),
                date: formData.expiration_date
                    ? format(formData.expiration_date, 'dd MMMM yyyy')
                    : format(currentDate, 'dd MMMM yyyy'),
                shopName: userFullName,
                shopAddress: '',
            }

            const pdf = await generate({
                template: defaultTemplate as Parameters<
                    typeof generate
                >[0]['template'],
                inputs: [templateInputs],
                plugins,
                options: { fallbackFontName: 'NotoSerifJP-Regular' },
            })

            const uint8Array = new Uint8Array(pdf.buffer)
            const blob = new Blob([uint8Array], { type: 'application/pdf' })
            setPdfBlob(blob)
            setShowPreview(true)
        } catch (error) {
            console.error('PDF Generation Error:', error)
            setPdfError(
                `PDF Generation Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        } finally {
            setPreviewLoading(false)
        }
    }, [isFormValid, selectedClient, formData, totalAmount, currentUser])

    const handleSubmit = useCallback(
        async (state: 'Draft' | 'Sent' | 'Paid') => {
            if (!isFormValid) {
                setPdfError('Please fill in all required fields')
                return
            }

            try {
                const payload = {
                    client_id: formData.client_id,
                    title: formData.title,
                    total_amount: totalAmount,
                    expiration_date: formData.expiration_date?.toISOString(),
                    state,
                    items: formData.items.map(
                        ({ item_id, quantity, unit_price }) => ({
                            item_id,
                            quantity,
                            unit_price,
                        })
                    ),
                }

                await createMutation.mutateAsync(payload)
                router.push('/invoices')
            } catch (error) {
                console.error('Submit Error:', error)
                setPdfError(
                    `Error creating invoice: ${error instanceof Error ? error.message : 'Unknown error'}`
                )
            }
        },
        [isFormValid, formData, totalAmount, createMutation, router]
    )

    const downloadPDF = useCallback(() => {
        if (!pdfBlob) return
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `invoice-${formData.title.replace(/\s+/g, '-') || 'preview'}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }, [pdfBlob, formData.title])

    if (clientsLoading || itemsLoading || userLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Card>
                    <CardContent className="flex items-center gap-3 p-6">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading data...</span>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (clientsError || itemsError || userError) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Card>
                    <CardContent className="text-center p-6">
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                        <p className="text-destructive mb-4">
                            Failed to load{' '}
                            {clientsError
                                ? 'clients'
                                : itemsError
                                  ? 'items'
                                  : 'user profile'}
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            {createMutation.isPending && (
                <LoadingOverlay message="Creating invoice..." />
            )}

            <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/invoices')}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">New Invoice</h1>
                            <p className="text-muted-foreground">
                                Create a new invoice for your clients
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={generatePDF}
                            disabled={!isFormValid || previewLoading}
                            className="transition-all"
                        >
                            {previewLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Eye className="h-4 w-4 mr-2" />
                            )}
                            Preview
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSubmit('Draft')}
                            disabled={createMutation.isPending || !isFormValid}
                            className="transition-all"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleSubmit('Sent')}
                            disabled={createMutation.isPending || !isFormValid}
                            className="transition-all"
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Invoice
                        </Button>
                    </div>
                </div>

                {pdfError && (
                    <ErrorAlert
                        error={pdfError}
                        onDismiss={() => setPdfError(null)}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    General Information
                                </CardTitle>
                                <CardDescription>
                                    Set the basic details of your invoice
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="title"
                                            className="text-sm font-medium"
                                        >
                                            Invoice Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                updateFormData({
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Website Development Services"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="expiration_date"
                                            className="text-sm font-medium"
                                        >
                                            Due Date
                                        </Label>
                                        <DateSelector
                                            selectedDate={
                                                formData.expiration_date
                                            }
                                            onDateChange={(date) =>
                                                updateFormData({
                                                    expiration_date: date,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="client"
                                        className="text-sm font-medium"
                                    >
                                        Client *
                                    </Label>
                                    <ClientSelector
                                        clients={transformedClients}
                                        selectedClientId={formData.client_id}
                                        onClientChange={(clientId) =>
                                            updateFormData({
                                                client_id: clientId,
                                            })
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calculator className="h-5 w-5" />
                                    Items
                                </CardTitle>
                                <CardDescription>
                                    Add items to your invoice (
                                    {formData.items.length} item
                                    {formData.items.length !== 1 ? 's' : ''})
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ItemSelector
                                    items={items}
                                    onAddItem={handleAddItem}
                                    disabled={createMutation.isPending}
                                />

                                {formData.items.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="font-medium">
                                                        Item
                                                    </TableHead>
                                                    <TableHead className="w-24 font-medium">
                                                        Qty
                                                    </TableHead>
                                                    <TableHead className="w-32 font-medium">
                                                        Unit Price
                                                    </TableHead>
                                                    <TableHead className="w-32 text-right font-medium">
                                                        Total
                                                    </TableHead>
                                                    <TableHead className="w-12"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {formData.items.map(
                                                    (item, index) => (
                                                        <TableRow
                                                            key={`${item.item_id}-${index}`}
                                                        >
                                                            <TableCell className="font-medium">
                                                                {item.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateItemQuantity(
                                                                            index,
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                1
                                                                        )
                                                                    }
                                                                    className="w-full tabular-nums"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={
                                                                        item.unit_price
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateItemPrice(
                                                                            index,
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                0
                                                                        )
                                                                    }
                                                                    className="w-full tabular-nums"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium tabular-nums">
                                                                {formatCurrency(
                                                                    item.quantity *
                                                                        item.unit_price
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRemoveItem(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <EmptyItemsState />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <DollarSign className="h-5 w-5" />
                                    Summary
                                </CardTitle>
                                <CardDescription>
                                    Invoice total: {formatCurrency(totalAmount)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedClient && (
                                    <ClientSummary client={selectedClient} />
                                )}

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Articles ({formData.items.length})
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            TVA (0%)
                                        </span>
                                        <span className="tabular-nums">
                                            {formatCurrency(0)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span className="tabular-nums text-lg">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                {formData.expiration_date && (
                                    <div className="p-3 bg-muted/50 rounded-lg border">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Due{' '}
                                                </span>
                                                <span className="font-medium tabular-nums">
                                                    {format(
                                                        formData.expiration_date,
                                                        'dd/MM/yyyy'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
                    <AlertDialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Invoice Preview</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="flex-1 overflow-hidden min-h-[75vh]">
                            {pdfBlob && (
                                <iframe
                                    src={URL.createObjectURL(pdfBlob)}
                                    className="w-full h-full border rounded"
                                    title="Invoice Preview"
                                />
                            )}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setShowPreview(false)}
                            >
                                Close
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={downloadPDF}>
                                Download
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    )
}
