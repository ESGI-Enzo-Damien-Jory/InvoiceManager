import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Invoice Manager',
    description: 'Manage and send invoices.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
