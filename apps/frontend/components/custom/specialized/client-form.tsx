'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, Mail, Phone, MapPin, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
    first_name: z.string().min(2, {
        message: 'First name must be at least 2 characters.',
    }),
    last_name: z.string().min(2, {
        message: 'Last name must be at least 2 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface ClientFormProps {
    onSubmit: (values: FormData) => void
    initialValues?: FormData
    cancelHref?: string
    submitButtonText?: string
}

export default function ClientForm({
    onSubmit,
    initialValues,
    cancelHref = '/clients',
    submitButtonText = 'Create Client',
}: ClientFormProps) {
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

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }

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

    const [avatarBgColor] = React.useState(getRandomColor())

    const handleFormSubmit = (values: FormData) => {
        if (onSubmit) {
            onSubmit(values)
        } else {
            console.log(values)
            alert('Client created successfully!')
        }
    }

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleFormSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="John"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Client's first name
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Doe"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Client's last name
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                        Client's email address for communication
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                    <FormDescription>
                                        Client's phone number (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="123 Main St, City, Country"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Client's physical address (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Avatar URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/avatar.jpg"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        URL to client's avatar image (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" type="button" asChild>
                                <Link href={cancelHref}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                {submitButtonText}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Client Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={watchFields.avatar || ''} />
                                <AvatarFallback className={avatarBgColor}>
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
