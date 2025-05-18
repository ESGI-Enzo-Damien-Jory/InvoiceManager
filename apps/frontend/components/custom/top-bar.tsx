'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface TopbarProps {
    subtitle: string
    title: string
    children?: ReactNode
}

export default function Topbar({ subtitle, title, children }: TopbarProps) {
    return (
        <div className="flex items-center justify-between p-6 overflow-hidden bg-[#fafafa] border-b">
            <SidebarTrigger className="mr-4 p-2" />

            <div className="flex-1">
                <p className="text-gray-500">{subtitle}</p>
                <h1 className="text-4xl font-bold">{title}</h1>
            </div>

            <div className="flex gap-2">{children}</div>
        </div>
    )
}
