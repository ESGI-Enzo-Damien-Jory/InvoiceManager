'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    IconCreditCard,
    IconDotsVertical,
    IconLogout,
    IconNotification,
    IconUserCircle,
} from '@tabler/icons-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'

import { useLogout, useUser } from '@/hooks/use-auth'
import { ProfileModal } from '@/components/custom/specialized/profile-modal'

export function NavUser() {
    const router = useRouter()
    const { isMobile } = useSidebar()
    const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false)

    const { data: userProfile, status: userStatus } = useUser()

    const { logoutMutate, status: logoutStatus } = useLogout()
    const isLoggingOut = logoutStatus === 'pending'

    // Fix: Only redirect on error if we're not already on login page
    React.useEffect(() => {
        if (userStatus === 'error' && window.location.pathname !== '/login') {
            router.replace('/login')
        }
    }, [userStatus, router])

    const handleLogout = React.useCallback(() => {
        logoutMutate({
            onSuccess: () => {
                // Force navigation to login without triggering the useEffect above
                window.location.href = '/login'
            },
            onError: (err: unknown) => {
                console.error('Logout error:', err)
                // Force navigation even on error
                window.location.href = '/login'
            },
        })
    }, [logoutMutate])

    const handleAccountClick = () => {
        setIsProfileModalOpen(true)
    }

    // While user is loading, show nothing or a simple placeholder
    if (userStatus === 'pending') {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Loading user…
            </div>
        )
    }

    // If error and we're on login page, don't render anything
    if (userStatus === 'error') {
        return null
    }

    // Once loaded, userProfile is guaranteed to be defined (or we've redirected)
    const displayName = userProfile?.display_name ?? ''
    const email = userProfile?.email ?? ''
    const avatarUrl = userProfile?.avatar_url

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={avatarUrl || undefined}
                                        alt={displayName}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {displayName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {displayName}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {email}
                                    </span>
                                </div>
                                <IconDotsVertical className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={avatarUrl || undefined}
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            {displayName
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {displayName}
                                        </span>
                                        <span className="text-muted-foreground truncate text-xs">
                                            {email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={handleAccountClick}>
                                    <IconUserCircle className="mr-2 h-4 w-4" />
                                    Account
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <IconCreditCard className="mr-2 h-4 w-4" />
                                    Billing
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <IconNotification className="mr-2 h-4 w-4" />
                                    Notifications
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex items-center"
                            >
                                {isLoggingOut ? (
                                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
                                ) : (
                                    <IconLogout className="mr-2 h-4 w-4" />
                                )}
                                {isLoggingOut ? 'Logging out…' : 'Log out'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            {/* Profile Modal */}
            <ProfileModal
                open={isProfileModalOpen}
                onOpenChange={setIsProfileModalOpen}
            />
        </>
    )
}
