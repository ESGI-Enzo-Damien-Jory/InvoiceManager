import type { Metadata } from 'next'
import './globals.css'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/custom/app-sidebar'

export const metadata: Metadata = {
    title: 'Invoice Manager',
    description: 'Manage and send invoices.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <div className="flex h-screen">
                    <SidebarProvider defaultOpen={true}>
                        <AppSidebar />
                        <main className="flex-1 overflow-auto">
                            <div className="flex items-center p-4 h-1/12">
                                <SidebarTrigger />
                            </div>
                            {children}
                        </main>
                    </SidebarProvider>
                </div>
            </body>
        </html>
    )
}
