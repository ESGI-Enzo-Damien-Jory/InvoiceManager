'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, MapPin, Save, X, Loader2 } from 'lucide-react'

const formSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.string().email(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().optional(),
})

export type FormData = z.infer<typeof formSchema>

export interface ClientFormProps {
    onSubmit: (values: FormData) => Promise<void>
    initialValues?: FormData
    cancelHref?: string
    submitButtonText?: string
}

export default function ClientForm({
    onSubmit,
    initialValues,
    cancelHref = '/clients',
    submitButtonText = 'Submit',
}: ClientFormProps) {
    const router = useRouter()
    const [submitError, setSubmitError] = React.useState<string | null>(null)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues || {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            address: '',
            avatar: '',
        },
    })

    const watchFields = form.watch()

    /** two helpers for initials fallback */
    const getInitials = (first: string, last: string) =>
        `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    const getRandomColor = () => {
        const colors = [
            'bg-red-500',
            'bg-blue-500',
            'bg-green-500',
            'bg-yellow-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-orange-500',
        ]
        return colors[Math.floor(Math.random() * colors.length)]
    }
    const [avatarBg] = React.useState(getRandomColor())

    const handleFormSubmit = async (values: FormData) => {
        setSubmitError(null)
        try {
            await onSubmit(values)
        } catch (err: any) {
            setSubmitError(err.message || 'An unexpected error occurred.')
        }
    }

    const isSubmitting = form.formState.isSubmitting

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleFormSubmit)}
                        className="space-y-6"
                    >
                        {/* names row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['first_name', 'last_name'].map((field) => (
                                <FormField
                                    key={field}
                                    control={form.control}
                                    name={field as 'first_name' | 'last_name'}
                                    render={({ field: f }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {field === 'first_name'
                                                    ? 'First Name'
                                                    : 'Last Name'}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        field === 'first_name'
                                                            ? 'John'
                                                            : 'Doe'
                                                    }
                                                    {...f}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {`Client's ${field.replace('_', ' ')}.`}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>

                        {/* email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Client's email address.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* phone */}
                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+1 (555) 123-4567"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Optional</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* address */}
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="123 Main St, City"
                                            {...field}
                                            className="resize-none"
                                        />
                                    </FormControl>
                                    <FormDescription>Optional</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* avatar URL */}
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Avatar URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Optional</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* actions */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                type="button"
                                asChild
                                disabled={isSubmitting}
                            >
                                <Link href={cancelHref}>
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {isSubmitting ? 'Saving...' : submitButtonText}
                            </Button>
                        </div>

                        {submitError && (
                            <p className="text-sm text-destructive mt-2">
                                {submitError}
                            </p>
                        )}
                    </form>
                </Form>
            </div>

            {/** live preview **/}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Client Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={watchFields.avatar || ''} />
                                <AvatarFallback className={avatarBg}>
                                    {getInitials(
                                        watchFields.first_name || '',
                                        watchFields.last_name || ''
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">
                                {watchFields.first_name
                                    ? `${watchFields.first_name} ${watchFields.last_name}`
                                    : 'Client Name'}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <span>
                                    {watchFields.email || 'email@example.com'}
                                </span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <span>
                                    {watchFields.phone_number || 'Phone number'}
                                </span>
                            </div>

                            <div className="flex items-start space-x-2">
                                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                <span className="flex-1">
                                    {watchFields.address || 'Address'}
                                </span>
                            </div>
                        </div>

                        <Card className="bg-gray-100">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <span className="text-sm font-medium">
                                            Client ID
                                        </span>
                                    </div>
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                        Generated on create
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
