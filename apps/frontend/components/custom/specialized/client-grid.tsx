'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client } from '@/types/clients'

export interface ClientGridProps {
    clients: Client[]
    linkPrefix?: string
}

const formatNumber = (n?: number) =>
    (typeof n === 'number' ? n : 0).toLocaleString('en-US')

export default function ClientGrid({
    clients = [],
    linkPrefix = '/clients',
}: ClientGridProps) {
    if (!clients.length) {
        return (
            <p className="text-center py-10 text-sm text-muted-foreground">
                No clients to display.
            </p>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
                <Link
                    key={c.id}
                    href={`${linkPrefix}/${c.id}`}
                    className="bg-white rounded-xl overflow-hidden border shadow transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                    <span className="sr-only">
                        View profile of {c.first_name} {c.last_name}
                    </span>

                    <div className="flex justify-between items-center p-4 border-b">
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarFallback className="bg-slate-800 text-white">
                                    {c.first_name?.[0] ?? 'C'}
                                    {c.last_name?.[0] ?? ''}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h3 className="font-medium text-slate-900 truncate">
                                    {c.first_name} {c.last_name}
                                </h3>
                                <div className="flex items-center text-sm text-slate-500 truncate">
                                    <Mail className="w-3 h-3 mr-1 opacity-70 flex-shrink-0" />
                                    <span className="truncate">{c.email}</span>
                                </div>
                            </div>
                        </div>
                        <span
                            className={cn(
                                'px-2 py-1 text-xs font-medium rounded-full flex-shrink-0',
                                c.status === 'Active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                            )}
                        >
                            {c.status}
                        </span>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">
                                Total Revenue
                            </span>
                            <span className="font-semibold text-slate-900">
                                ${formatNumber(c.total_revenue)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">
                                Invoices
                            </span>
                            <span className="font-semibold text-slate-900">
                                {formatNumber(c.total_invoices)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="flex items-center text-slate-500 text-sm">
                                {(c.unpaid_amount ?? 0) > 0 && (
                                    <AlertCircle className="w-3 h-3 mr-1 text-amber-500 flex-shrink-0" />
                                )}
                                Unpaid
                            </span>
                            <span
                                className={cn(
                                    'font-semibold',
                                    (c.unpaid_amount ?? 0) > 0
                                        ? 'text-amber-600'
                                        : 'text-slate-900'
                                )}
                            >
                                ${formatNumber(c.unpaid_amount)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t">
                        <span className="text-sm font-medium text-slate-700">
                            View Profile
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
