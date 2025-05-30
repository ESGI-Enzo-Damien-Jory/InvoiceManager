'use client'

import { FC } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, MapPin, User, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Client } from '@/types/clients'

const formatNumber = (n?: number) =>
    (typeof n === 'number' ? n : 0).toLocaleString('en-US')

const ClientDetails: FC<{ client: Client }> = ({ client }) => (
    <Card className="max-w-2xl mx-auto space-y-6">
        <CardHeader>
            <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={client.avatar ?? undefined} />
                    <AvatarFallback className="bg-slate-800 text-white">
                        {client.first_name?.[0]}
                        {client.last_name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold">
                        {client.first_name} {client.last_name}
                    </h2>
                    <span
                        className={cn(
                            'px-2 py-1 text-sm font-medium rounded-full inline-block',
                            client.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                        )}
                    >
                        {client.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span>{client.phone_number ?? '–'}</span>
                </div>
                <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <span>{client.address ?? '–'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                        <p className="text-sm text-gray-500">Invoices</p>
                        <p className="font-semibold">{client.total_invoices}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="font-semibold">
                            ${formatNumber(client.total_revenue)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                        <p className="text-sm text-gray-500">Unpaid</p>
                        <p
                            className={cn(
                                'font-semibold',
                                (client.unpaid_amount ?? 0) > 0
                                    ? 'text-amber-600'
                                    : 'text-slate-900'
                            )}
                        >
                            ${formatNumber(client.unpaid_amount)}
                        </p>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default ClientDetails
