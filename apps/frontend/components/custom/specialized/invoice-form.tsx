'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react'
import { useForm, useFieldArray, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface Item {
    itemId: string
    quantity: number
    price: number
}

const formSchema = z.object({
    title: z.string().min(5, {
        message: 'Title must be at least 5 characters.',
    }),
    clientId: z.string().min(1, {
        message: 'Please select a client.',
    }),
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

interface Client {
    value: string
    label: string
}

interface ItemData {
    value: string
    label: string
    price: number
}

const clients: Client[] = [
    { value: '001', label: 'Enzo Hugonnier' },
    { value: '002', label: 'John Doe' },
    { value: '003', label: 'Marc Antoine' },
    { value: '004', label: 'Lucille Beau' },
    { value: '005', label: 'Nicolas Dumont' },
]

const itemsData: ItemData[] = [
    { value: 'item001', label: 'Web Design', price: 500 },
    { value: 'item002', label: 'Logo Design', price: 300 },
    { value: 'item003', label: 'SEO Optimization', price: 250 },
    { value: 'item004', label: 'Content Writing', price: 150 },
    { value: 'item005', label: 'Web Hosting (monthly)', price: 50 },
]

interface InvoiceFormProps {
    onSubmit: (values: FormData, total: number) => void
    initialValues?: FormData
    cancelHref?: string
    submitButtonText?: string
}

export default function InvoiceForm({
    onSubmit,
    initialValues,
    cancelHref = '/invoices',
    submitButtonText = 'Create Invoice',
}: InvoiceFormProps) {
    const [clientOpen, setClientOpen] = React.useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema) as Resolver<FormData>,
        defaultValues: initialValues || {
            title: '',
            clientId: '',
            items: [{ itemId: '', quantity: 1, price: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        name: 'items',
        control: form.control,
    })

    const watchItems = form.watch('items')

    const calculateSubtotal = (): number => {
        return watchItems.reduce((total: number, item: Item) => {
            return total + (item.quantity || 0) * (item.price || 0)
        }, 0)
    }

    const handleItemSelect = (value: string, index: number): void => {
        const selectedItem = itemsData.find((item) => item.value === value)
        if (selectedItem) {
            form.setValue(`items.${index}.itemId`, value)
            form.setValue(`items.${index}.price`, selectedItem.price)
        }
    }

    const handleFormSubmit = (values: FormData): void => {
        if (onSubmit) {
            onSubmit(values, calculateSubtotal())
        } else {
            console.log(values)
            alert(
                `Invoice created successfully! Total: $${calculateSubtotal()}`
            )
        }
    }

    return (
        <div className="p-4 pr-6 flex flex-col gap-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleFormSubmit)}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Invoice title"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The name of your invoice
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
                                        <Popover
                                            open={clientOpen}
                                            onOpenChange={setClientOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={clientOpen}
                                                    className="w-full justify-between"
                                                >
                                                    {field.value
                                                        ? clients.find(
                                                              (client) =>
                                                                  client.value ===
                                                                  field.value
                                                          )?.label
                                                        : 'Select client...'}
                                                    <ChevronsUpDown className="opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search client..." />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            No Client found.
                                                            <br />
                                                            <Link
                                                                href="/clients/new"
                                                                className="text-orange-500 font-bold hover:underline"
                                                            >
                                                                Create one.
                                                            </Link>
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {clients.map(
                                                                (client) => (
                                                                    <CommandItem
                                                                        key={
                                                                            client.value
                                                                        }
                                                                        value={
                                                                            client.value
                                                                        }
                                                                        onSelect={(
                                                                            value: string
                                                                        ) => {
                                                                            field.onChange(
                                                                                value
                                                                            )
                                                                            setClientOpen(
                                                                                false
                                                                            )
                                                                        }}
                                                                    >
                                                                        {
                                                                            client.label
                                                                        }
                                                                        <Check
                                                                            className={cn(
                                                                                'ml-auto',
                                                                                field.value ===
                                                                                    client.value
                                                                                    ? 'opacity-100'
                                                                                    : 'opacity-0'
                                                                            )}
                                                                        />
                                                                    </CommandItem>
                                                                )
                                                            )}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormDescription>
                                        Client the invoice is destined to
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                Invoice Items
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    append({
                                        itemId: '',
                                        quantity: 1,
                                        price: 0,
                                    })
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">
                                                Item
                                            </TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price ($)</TableHead>
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
                                                        render={({
                                                            field: itemField,
                                                        }) => (
                                                            <FormItem className="m-0">
                                                                <FormControl>
                                                                    <Popover>
                                                                        <PopoverTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="outline"
                                                                                role="combobox"
                                                                                className="w-full justify-between"
                                                                            >
                                                                                {itemField.value
                                                                                    ? itemsData.find(
                                                                                          (
                                                                                              item
                                                                                          ) =>
                                                                                              item.value ===
                                                                                              itemField.value
                                                                                      )
                                                                                          ?.label
                                                                                    : 'Select item...'}
                                                                                <ChevronsUpDown className="opacity-50" />
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-full p-0">
                                                                            <Command>
                                                                                <CommandInput placeholder="Search item..." />
                                                                                <CommandList>
                                                                                    <CommandEmpty>
                                                                                        No
                                                                                        item
                                                                                        found.
                                                                                    </CommandEmpty>
                                                                                    <CommandGroup>
                                                                                        {itemsData.map(
                                                                                            (
                                                                                                item
                                                                                            ) => (
                                                                                                <CommandItem
                                                                                                    key={
                                                                                                        item.value
                                                                                                    }
                                                                                                    value={
                                                                                                        item.value
                                                                                                    }
                                                                                                    onSelect={(
                                                                                                        value: string
                                                                                                    ) => {
                                                                                                        handleItemSelect(
                                                                                                            value,
                                                                                                            index
                                                                                                        )
                                                                                                    }}
                                                                                                >
                                                                                                    {
                                                                                                        item.label
                                                                                                    }
                                                                                                    <Check
                                                                                                        className={cn(
                                                                                                            'ml-auto',
                                                                                                            itemField.value ===
                                                                                                                item.value
                                                                                                                ? 'opacity-100'
                                                                                                                : 'opacity-0'
                                                                                                        )}
                                                                                                    />
                                                                                                </CommandItem>
                                                                                            )
                                                                                        )}
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
                                                        render={({
                                                            field: quantityField,
                                                        }) => (
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
                                                        render={({
                                                            field: priceField,
                                                        }) => (
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
                                                <TableCell>
                                                    $
                                                    {(
                                                        (watchItems[index]
                                                            ?.quantity || 0) *
                                                        (watchItems[index]
                                                            ?.price || 0)
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={
                                                            fields.length === 1
                                                        }
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-right font-medium"
                                            >
                                                Total
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                $
                                                {calculateSubtotal().toFixed(2)}
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                        <Button type="submit">{submitButtonText}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
