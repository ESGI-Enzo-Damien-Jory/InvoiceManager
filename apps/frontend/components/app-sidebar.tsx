'use client'

import * as React from 'react'
import {
    IconBox,
    IconCash,
    IconChartBar,
    IconChartLine,
    IconDashboard,
    IconDatabase,
    IconFileExport,
    IconFileText,
    IconFileWord,
    IconHelp,
    IconInnerShadowTop,
    IconReceipt,
    IconReceipt2,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
} from '@tabler/icons-react'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavTreasury } from './nav-treasury'

const data = {
    navMain: [
        {
            title: 'Dashboard',
            url: 'dashboard',
            icon: IconDashboard,
        },
        {
            title: 'Invoices',
            url: 'invoices',
            icon: IconFileText,
        },
        {
            title: 'Analytics',
            url: 'analytics',
            icon: IconChartBar,
        },
        {
            title: 'Items',
            url: 'items',
            icon: IconBox,
        },
        {
            title: 'Clients',
            url: 'clients',
            icon: IconUsers,
        },
    ],
    navSecondary: [
        {
            title: 'Settings',
            url: 'settings',
            icon: IconSettings,
        },
        {
            title: 'Get Help',
            url: 'help',
            icon: IconHelp,
        },
        {
            title: 'Search',
            url: '#',
            icon: IconSearch,
        },
    ],
    documents: [
        {
            name: 'Documents',
            url: 'documents',
            icon: IconFileWord,
        },
        {
            name: 'Templates',
            url: 'templates',
            icon: IconDatabase,
        },
        {
            name: 'Reports',
            url: 'reports',
            icon: IconReport,
        },
    ],
    treasury: [
        {
            name: 'Payments',
            url: 'payments',
            icon: IconCash,
        },
        {
            name: 'Forecast',
            url: 'forecast',
            icon: IconChartLine,
        },
        {
            name: 'Expenses',
            url: 'expenses',
            icon: IconReceipt2,
        },
        {
            name: 'Accounting Exports',
            url: 'accounting-exports',
            icon: IconFileExport,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">
                                    Invoice Manager
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavDocuments items={data.documents} />
                <NavTreasury items={data.treasury} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
