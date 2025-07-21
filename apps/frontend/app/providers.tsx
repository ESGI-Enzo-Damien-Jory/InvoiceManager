'use client'

import { ReactNode, useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ProvidersProps {
    children: ReactNode
}

const queryClient = new QueryClient()

export function Providers({ children }: ProvidersProps) {
    // Apply theme class to <html> globally
    useEffect(() => {
        const THEMES = [
            'theme-ocean',
            'theme-sunset',
            'theme-nord',
            'theme-tokyo',
            'theme-emerald',
            'theme-dracula',
            'theme-catppuccin',
        ]
        const html = document.documentElement
        const applyTheme = () => {
            const stored =
                sessionStorage.getItem('customTheme') || 'theme-ocean'
            html.classList.remove(...THEMES)
            html.classList.add(stored)
        }
        applyTheme()
        window.addEventListener('theme:change', applyTheme)
        return () => window.removeEventListener('theme:change', applyTheme)
    }, [])
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ThemeProvider>
    )
}
