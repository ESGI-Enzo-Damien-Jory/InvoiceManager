'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Client {
    uuid: string
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
    linkPrefix?: string
}

const formatNumber = (value: number) => value.toLocaleString('en-US')

export default function ClientGrid({
    clients,
    linkPrefix = '/clients',
}: ClientGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
                <Link
                    key={client.uuid}
                    href={`${linkPrefix}/${client.uuid}`}
                    className="block"
                >
                    <div className="bg-white rounded-xl overflow-hidden shadow transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-slate-800 text-white">
                                        {client.first_name[0]}
                                        {client.last_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-slate-900">
                                        {client.first_name} {client.last_name}
                                    </h3>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Mail className="w-3 h-3 mr-1 opacity-70" />
                                        <span className="truncate max-w-[180px]">
                                            {client.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'px-2 py-1 text-xs font-medium rounded-full',
                                    client.status === 'Active'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-600'
                                )}
                            >
                                {client.status}
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-slate-500 text-sm">
                                    Total Revenue
                                </div>
                                <div className="font-semibold text-slate-900">
                                    ${formatNumber(client.total_revenue)}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="text-slate-500 text-sm">
                                    Invoices
                                </div>
                                <div className="font-semibold text-slate-900">
                                    {client.total_invoices}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-slate-500 text-sm flex items-center">
                                    {client.unpaid_amount > 0 && (
                                        <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
                                    )}
                                    Unpaid Amount
                                </div>
                                <div
                                    className={cn(
                                        'font-semibold',
                                        client.unpaid_amount > 0
                                            ? 'text-amber-600'
                                            : 'text-slate-900'
                                    )}
                                >
                                    ${formatNumber(client.unpaid_amount)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors border-t">
                            <span className="text-sm font-medium text-slate-700">
                                View Profile
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
