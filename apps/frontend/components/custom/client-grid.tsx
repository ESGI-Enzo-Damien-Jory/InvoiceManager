'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Mail, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

export interface Client {
    id: string
    first_name: string
    last_name: string
    email: string
    total_invoices: number
    total_revenue: number
    unpaid_amount: number
    status: 'Active' | 'Inactive'
}

export interface ClientGridProps {
    clients: Client[]
    statusColors: Record<Client['status'], string>
    linkPrefix?: string
}

export default function ClientGrid({
    clients,
    statusColors,
    linkPrefix = '/clients',
}: ClientGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
                <Card
                    key={client.id}
                    className="group border-2 border-transparent hover:border-2  hover:border-orange-200 flex flex-col h-full"
                >
                    <CardContent className="flex-1 p-4 flex flex-col justify-between">
                        <div className="flex items-start space-x-4">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarFallback className="bg-indigo-50 text-indigo-700 text-base">
                                    {client.first_name[0]}
                                    {client.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-medium truncate">
                                    {client.first_name} {client.last_name}
                                </h4>
                                <div className="mt-1 flex items-center text-sm text-gray-500 truncate">
                                    <Mail className="w-4 h-4 mr-1" />
                                    <span>{client.email}</span>
                                </div>
                            </div>
                            <span
                                className={cn(
                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                    statusColors[client.status]
                                )}
                            >
                                {client.status}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-3 text-center text-sm text-gray-600">
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {client.total_invoices}
                                </p>
                                <p>Invoices</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    ${client.total_revenue.toFixed(0)}
                                </p>
                                <p>Revenue</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    ${client.unpaid_amount.toFixed(0)}
                                </p>
                                <p>Unpaid</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-2">
                        <Link
                            href={`${linkPrefix}/${client.id}`}
                            className="w-full text-center block py-2 text-orange-500 font-semibold hover:underline"
                        >
                            View Profile →
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
