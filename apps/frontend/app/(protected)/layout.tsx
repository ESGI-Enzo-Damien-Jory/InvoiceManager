import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/custom/app-sidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Layout({ children }: { children: React.ReactNode }) {
    const token = cookies().get('auth_token') // remplace par le nom exact de ton cookie

    if (!token) {
        redirect('/login?unauthorized=1')
    }

    return (
        <div className="flex h-screen">
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                {children}
            </SidebarProvider>
        </div>
    )
}
