'use client'

import * as React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { CalendarIcon, ChevronsUpDown, Plus, Trash2, Calculator, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type Client } from '@inma/types'
import { type Item } from '@inma/types'

const formSchema = z.object({
    title: z.string().min(3, {
        message: 'Title must be at least 3 characters.',
    }),
    clientId: z.string().min(1, {
        message: 'Please select a client.',
    }),
    expirationDate: z.date().optional(),
    state: z.enum(['Draft', 'Sent']),
    items: z
        .array(
            z.object({
                itemId: z.string().min(1, {
                    message: 'Please select an item.',
                }),
                quantity: z.coerce.number().min(1, {
                    message: 'Quantity must be at least 1.',
                }),
                price: z.coerce.number().min(0, {
                    message: 'Price must be a positive number.',
                }),
            })
        )
        .min(1, {
            message: 'Please add at least one item.',
        }),
})

type FormData = z.infer<typeof formSchema>

interface InvoiceFormProps {
    clients: Client[]
    items: Item[]
    onSubmit: (data: FormData & { total: number }) => void
    isSubmitting?: boolean
    onCancel?: () => void
}

export default function InvoiceForm({
    clients,
    items,
    onSubmit,
    isSubmitting = false,
    onCancel,
}: InvoiceFormProps) {
    const [clientOpen, setClientOpen] = React.useState(false)
    const [calendarOpen, setCalendarOpen] = React.useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            clientId: '',
            expirationDate: addDays(new Date(), 30), // Default to 30 days from now
            state: 'Draft',
            items: [{ itemId: '', quantity: 1, price: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        name: 'items',
        control: form.control,
    })

    const watchItems = form.watch('items')
    const watchClientId = form.watch('clientId')

    const selectedClient = clients.find(client => client.id === watchClientId)

    const calculateSubtotal = (): number => {
        return watchItems.reduce((total, item) => {
            return total + (item.quantity || 0) * (item.price || 0)
        }, 0)
    }

    const handleItemSelect = (value: string, index: number): void => {
        const selectedItem = items.find((item) => item.id === value)
        if (selectedItem) {
            form.setValue(`items.${index}.itemId`, value)
            form.setValue(`items.${index}.price`, selectedItem.price)
        }
    }

    const handleFormSubmit = (values: FormData): void => {
        const total = calculateSubtotal()
        onSubmit({ ...values, total })
    }

    const addItem = () => {
        append({ itemId: '', quantity: 1, price: 0 })
    }

    const removeItem = (index: number) => {
        if (fields.length > 1) {
            remove(index)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Web Design Services - March 2024"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    A clear, descriptive title for your invoice
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client</FormLabel>
                                <FormControl>
                                    <Popover open={clientOpen} onOpenChange={setClientOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={clientOpen}
                                                className="w-full justify-between"
                                            >
                                                {field.value
                                                    ? selectedClient
                                                        ? `${selectedClient.first_name} ${selectedClient.last_name}`
                                                        : 'Select client...'
                                                    : 'Select client...'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search clients..." />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        No client found.
                                                        <br />
                                                        <Button
                                                            variant="link"
                                                            className="p-0 h-auto text-orange-500 font-bold hover:underline"
                                                            onClick={() => {
                                                                setClientOpen(false)
                                                                // TODO: Navigate to create client
                                                            }}
                                                        >
                                                            Create one.
                                                        </Button>
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {clients.map((client) => (
                                                            <CommandItem
                                                                key={client.id}
                                                                value={client.id}
                                                                onSelect={(value) => {
                                                                    field.onChange(value)
                                                                    setClientOpen(false)
                                                                }}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
                                                                        {client.first_name} {client.last_name}
                                                                    </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {client.email}
                                                                    </span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription>
                                    The client this invoice is for
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="expirationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription>
                                    When this invoice is due for payment
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Draft">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">Draft</Badge>
                                                <span>Save as draft</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Sent">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default">Sent</Badge>
                                                <span>Send to client</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Draft invoices can be edited, sent invoices are finalized
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Client Information Display */}
                {selectedClient && (
                    <div className="bg-muted/50 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Client Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Name:</span>
                                <span className="ml-2 font-medium">
                                    {selectedClient.first_name} {selectedClient.last_name}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>
                                <span className="ml-2 font-medium">{selectedClient.email}</span>
                            </div>
                            {selectedClient.phone_number && (
                                <div>
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="ml-2 font-medium">{selectedClient.phone_number}</span>
                                </div>
                            )}
                            {selectedClient.address && (
                                <div>
                                    <span className="text-muted-foreground">Address:</span>
                                    <span className="ml-2 font-medium">{selectedClient.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Invoice Items */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Invoice Items</h3>
                            <p className="text-sm text-muted-foreground">
                                Add the products or services for this invoice
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Item</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.itemId`}
                                                render={({ field: itemField }) => (
                                                    <FormItem className="m-0">
                                                        <FormControl>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className="w-full justify-between"
                                                                    >
                                                                        {itemField.value
                                                                            ? items.find(
                                                                                  (item) =>
                                                                                      item.id === itemField.value
                                                                              )?.name
                                                                            : 'Select item...'}
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0">
                                                                    <Command>
                                                                        <CommandInput placeholder="Search items..." />
                                                                        <CommandList>
                                                                            <CommandEmpty>
                                                                                No item found.
                                                                                <br />
                                                                                <Button
                                                                                    variant="link"
                                                                                    className="p-0 h-auto text-orange-500 font-bold hover:underline"
                                                                                    onClick={() => {
                                                                                        // TODO: Navigate to create item
                                                                                    }}
                                                                                >
                                                                                    Create one.
                                                                                </Button>
                                                                            </CommandEmpty>
                                                                            <CommandGroup>
                                                                                {items.map((item) => (
                                                                                    <CommandItem
                                                                                        key={item.id}
                                                                                        value={item.id}
                                                                                        onSelect={(value) => {
                                                                                            handleItemSelect(value, index)
                                                                                        }}
                                                                                    >
                                                                                        <div className="flex justify-between items-center w-full">
                                                                                            <span>{item.name}</span>
                                                                                            <span className="text-muted-foreground">
                                                                                                ${item.price.toFixed(2)}
                                                                                            </span>
                                                                                        </div>
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </CommandList>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field: quantityField }) => (
                                                    <FormItem className="m-0">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                className="w-20"
                                                                {...quantityField}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.price`}
                                                render={({ field: priceField }) => (
                                                    <FormItem className="m-0">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="w-24"
                                                                {...priceField}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ${(
                                                (watchItems[index]?.quantity || 0) *
                                                (watchItems[index]?.price || 0)
                                            ).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={fields.length === 1}
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-medium">
                                        Total Amount
                                    </TableCell>
                                    <TableCell className="font-bold text-lg">
                                        ${calculateSubtotal().toFixed(2)}
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Calculator className="mr-2 h-4 w-4" />
                                Create Invoice
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
} 