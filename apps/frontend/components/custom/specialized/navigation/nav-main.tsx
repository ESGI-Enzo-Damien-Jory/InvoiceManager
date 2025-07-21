'use client'

import {
    IconMail,
    IconPlus,
    IconUserPlus,
    IconFilePlus,
    IconSettings,
    IconSearch,
    type Icon,
} from '@tabler/icons-react'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'

interface QuickAction {
    title: string
    icon: Icon
    action: (router: ReturnType<typeof useRouter>) => void
    shortcut?: string
}

interface NavMainProps {
    items: {
        title: string
        url: string
        icon?: Icon
    }[]
    quickActions?: QuickAction[]
}

const defaultQuickActions: QuickAction[] = [
    {
        title: 'New Client',
        icon: IconUserPlus,
        action: (router) => router.push('/clients?create=true'),
        shortcut: 'Ctrl+N',
    },
    {
        title: 'New Item',
        icon: IconPlus,
        action: (router) => router.push('/items?create=true'),
        shortcut: 'Ctrl+I',
    },
    {
        title: 'New Invoice',
        icon: IconFilePlus,
        action: (router) => router.push('/invoices?create=true'),
        shortcut: 'Ctrl+Shift+I',
    },
    {
        title: 'Settings',
        icon: IconSettings,
        action: (router) => router.push('/settings'),
        shortcut: 'Ctrl+,',
    },
]

function normalizeShortcut(shortcut: string) {
    // On gère les variantes "Ctrl+Shift+I" => {ctrl: true, shift: true, key: 'i'}
    const keys = shortcut
        .toLowerCase()
        .split('+')
        .map((k) => k.trim())
    return {
        ctrl: keys.includes('ctrl'),
        shift: keys.includes('shift') || keys.includes('⇧'),
        key:
            keys.find(
                (k) => k !== 'ctrl' && k !== 'shift' && k !== '⇧' && k !== ','
            ) || (keys.includes(',') ? ',' : null),
    }
}

export function NavMain({
    items,
    quickActions = defaultQuickActions,
}: NavMainProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    // Utilisé pour éviter les triggers multiples sur un même raccourci
    const shortcutFiredRef = useRef(false)

    // On pré-génère un index de raccourcis pour lookup rapide
    const shortcutIndex = useMemo(() => 
        quickActions.reduce(
            (acc, action) => {
                if (action.shortcut) {
                    const { ctrl, shift, key } = normalizeShortcut(action.shortcut)
                    acc.push({ ctrl, shift, key, action })
                }
                return acc
            },
            [] as Array<{
                ctrl: boolean
                shift: boolean
                key: string | null
                action: QuickAction
            }>
        ), [quickActions]
    )

    // Handler de raccourcis clavier centralisé et robuste
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // On évite de déclencher plusieurs fois lors de la répétition
            if (shortcutFiredRef.current) return

            // Cmd ou Ctrl+K = Command palette
            if (
                (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) ||
                (e.key === 'k' && (e.ctrlKey || e.metaKey))
            ) {
                e.preventDefault()
                setOpen((o) => !o)
                shortcutFiredRef.current = true
                return
            }

            // On check si le shortcut correspond à une quickAction
            for (const sc of shortcutIndex) {
                if (
                    !!sc.ctrl === !!(e.ctrlKey || e.metaKey) &&
                    !!sc.shift === !!e.shiftKey &&
                    sc.key?.toLowerCase() === e.key.toLowerCase()
                ) {
                    e.preventDefault()
                    sc.action.action(router)
                    setOpen(false)
                    shortcutFiredRef.current = true
                    return
                }
            }
        },
        [router, shortcutIndex]
    )

    // On reset la ref à chaque keyup
    useEffect(() => {
        const reset = () => {
            shortcutFiredRef.current = false
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', reset)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', reset)
        }
    }, [handleKeyDown])

    const handleAction = (action: QuickAction) => {
        action.action(router)
        setOpen(false)
    }

    return (
        <>
            <SidebarGroup>
                <SidebarGroupContent className="flex flex-col gap-2">
                    <SidebarMenu>
                        <SidebarMenuItem className="flex items-center gap-2">
                            <SidebarMenuButton
                                onClick={() => setOpen(true)}
                                tooltip="Quick Actions (Ctrl+K)"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                            >
                                <IconSearch />
                                <span>Quick Actions</span>
                                <div className="ml-auto text-xs opacity-60 group-data-[collapsible=icon]:hidden">
                                    Ctrl+K
                                </div>
                            </SidebarMenuButton>
                            <Button
                                size="icon"
                                className="size-8 group-data-[collapsible=icon]:opacity-0"
                                variant="outline"
                            >
                                <IconMail />
                                <span className="sr-only">Inbox</span>
                            </Button>
                        </SidebarMenuItem>
                    </SidebarMenu>

                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <Link href={item.url}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className="cursor-pointer"
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Quick Actions">
                        {quickActions.map((action) => (
                            <CommandItem
                                key={action.title}
                                onSelect={() => handleAction(action)}
                            >
                                <action.icon />
                                <span>{action.title}</span>
                                {action.shortcut && (
                                    <CommandShortcut>
                                        {action.shortcut}
                                    </CommandShortcut>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Navigation">
                        {items.map((item) => (
                            <CommandItem
                                key={item.url}
                                onSelect={() => {
                                    router.push(item.url)
                                    setOpen(false)
                                }}
                            >
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
