'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
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
    useSidebar,
    SidebarMenuAction,
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
    Box,
    Settings,
    Plus,
    User2,
    ChevronUp,
    MoreHorizontal,
} from 'lucide-react'

export function AppSidebar() {
    const pathname = usePathname()
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
                <div className="font-bold text-lg">
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
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === '/'}
                                >
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Home className="h-5 w-5" />
                                        {!isCollapsed && <span>Home</span>}
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
                        <Link href="/invoices/new" passHref>
                            <span className="cursor-pointer">
                                <Plus className="h-4 w-4" />
                            </span>
                        </Link>
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith('/invoices')}
                                >
                                    <Link
                                        href="/invoices"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <FileText className="h-5 w-5" />
                                        {!isCollapsed && (
                                            <span>All Invoices</span>
                                        )}
                                    </Link>
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
                        <Link href="/clients/new" passHref>
                            <span className="cursor-pointer">
                                <Plus className="h-4 w-4" />
                            </span>
                        </Link>
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith('/clients')}
                                >
                                    <Link
                                        href="/clients"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Users className="h-5 w-5" />
                                        {!isCollapsed && (
                                            <span>All Clients</span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Items */}
                <SidebarGroup>
                    <SidebarGroupLabel>Items</SidebarGroupLabel>
                    <SidebarGroupAction title="Add Item">
                        <Link className="cursor-pointer" href="/items/new">
                            <Plus className="h-4 w-4" />
                        </Link>
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith('/items')}
                                >
                                    <Link
                                        href="/items"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Box className="h-5 w-5" />
                                        {!isCollapsed && <span>All Items</span>}
                                    </Link>
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
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith('/settings')}
                                >
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-2 w-full"
                                    >
                                        <Settings className="h-5 w-5" />
                                        {!isCollapsed && (
                                            <span>Preferences</span>
                                        )}
                                    </Link>
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
                                    <div className="flex items-center gap-2">
                                        <User2 className="h-4 w-4" />
                                        {!isCollapsed && (
                                            <span>Enzo Hugonnier</span>
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <ChevronUp className="h-4 w-4" />
                                    )}
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="end"
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
