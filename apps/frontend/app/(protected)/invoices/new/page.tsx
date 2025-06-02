'use client'

import { z } from 'zod'
import InvoiceForm from '@/components/custom/specialized/invoice-form'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
    title: z.string().min(5),
    clientId: z.string().min(1),
    items: z
        .array(
            z.object({
                itemId: z.string().min(1),
                quantity: z.coerce.number().min(1),
                price: z.coerce.number().min(0),
            })
        )
        .min(1),
})

type FormData = z.infer<typeof formSchema>

export default function NewInvoice() {
    const handleSubmit = (values: FormData, total: number) => {
        console.log('Invoice data:', values)
        console.log('Total amount:', total)
        alert(`Invoice created successfully! Total: $${total.toFixed(2)}`)
    }

    return (
        <div className="h-screen w-full">
            <div className="flex">
                <InvoiceForm
                    onSubmit={handleSubmit}
                    cancelHref="/invoices"
                    submitButtonText="Create Invoice"
                />
            </div>
        </div>
    )
}
