'use client'

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarGroupAction,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuAction,
    useSidebar,
} from '@/components/ui/sidebar'

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import {
    Home,
    FileText,
    Users,
    Settings,
    ChevronUp,
    User2,
    Plus,
    MoreHorizontal,
    Box,
} from 'lucide-react'
import Link from 'next/link'

export function AppSidebar() {
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'

    return (
        <Sidebar
            side="left"
            variant="sidebar"
            collapsible="icon"
            className="h-screen"
        >
            <SidebarHeader className="flex justify-center items-center">
                <div className="font-bold text-lg ">
                    {isCollapsed ? 'IM' : 'InMa'}
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Dashboard */}
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive>
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Home className="h-5 w-5" />
                                        <span
                                            className={
                                                isCollapsed
                                                    ? 'sr-only'
                                                    : 'truncate'
                                            }
                                        >
                                            Home
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Invoices */}
                <SidebarGroup>
                    <SidebarGroupLabel>Invoices</SidebarGroupLabel>
                    <SidebarGroupAction title="Create Invoice">
                        <Plus className="h-4 w-4" />
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href="/invoices"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <FileText className="h-5 w-5" />
                                        <span
                                            className={
                                                isCollapsed
                                                    ? 'sr-only'
                                                    : 'truncate'
                                            }
                                        >
                                            All Invoices
                                        </span>
                                    </a>
                                </SidebarMenuButton>
                                {!isCollapsed && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuAction>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </SidebarMenuAction>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            side="right"
                                            align="start"
                                        >
                                            <DropdownMenuItem>
                                                Export
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                Archive
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Clients */}
                <SidebarGroup>
                    <SidebarGroupLabel>Clients</SidebarGroupLabel>
                    <SidebarGroupAction title="Add Client">
                        <Plus className="h-4 w-4" />
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href="/clients"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Users className="h-5 w-5" />
                                        <span
                                            className={
                                                isCollapsed
                                                    ? 'sr-only'
                                                    : 'truncate'
                                            }
                                        >
                                            All Clients
                                        </span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Items */}
                <SidebarGroup>
                    <SidebarGroupLabel>Items</SidebarGroupLabel>
                    <SidebarGroupAction title="Add Item">
                        <Plus className="h-4 w-4" />
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href="/items"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Box className="h-5 w-5" />
                                        <span
                                            className={
                                                isCollapsed
                                                    ? 'sr-only'
                                                    : 'truncate'
                                            }
                                        >
                                            All Items
                                        </span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Settings */}
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a
                                        href="/settings"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Settings className="h-5 w-5" />
                                        <span
                                            className={
                                                isCollapsed
                                                    ? 'sr-only'
                                                    : 'truncate'
                                            }
                                        >
                                            Preferences
                                        </span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-2">
                <SidebarMenu className="w-full">
                    <SidebarMenuItem className="w-full">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full justify-between">
                                    <span className="flex items-center gap-2">
                                        <User2 className="h-4 w-4" />
                                        <span
                                            className={
                                                isCollapsed
                                                    ? 'sr-only'
                                                    : 'truncate'
                                            }
                                        >
                                            Enzo Hugonnier
                                        </span>
                                    </span>
                                    {!isCollapsed && (
                                        <ChevronUp className="h-4 w-4" />
                                    )}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="min-w-[200px]"
                            >
                                <DropdownMenuItem>
                                    Account Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuItem>Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
