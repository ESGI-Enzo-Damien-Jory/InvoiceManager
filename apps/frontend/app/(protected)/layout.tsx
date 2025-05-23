import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/custom/app-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                {children}
            </SidebarProvider>
        </div>
    )
}
