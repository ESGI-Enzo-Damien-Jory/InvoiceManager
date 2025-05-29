'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/custom/top-bar'
import ErrorState from '@/components/custom/error-state'
import ClientForm from '@/components/custom/specialized/client-form'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function NewClient() {
    const router = useRouter()
    const [error, setError] = React.useState<string | null>(null)

    const handleCreateClient = async (values: any) => {
        setError(null)

        const token = localStorage.getItem('token')
        if (!token) {
            throw new Error('Authentication token missing')
        }

        const res = await fetch(`${API_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(values),
        })

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.message || 'Failed to create client')
        }

        router.push('/clients')
    }

    return (
        <div className="h-screen w-full flex flex-col">
            <Topbar subtitle="Create" title="New Client" />

            {error && (
                <ErrorState message={error} onRetry={() => setError(null)} />
            )}

            <div className="flex-1 overflow-auto">
                <ClientForm
                    onSubmit={handleCreateClient}
                    cancelHref="/clients"
                    submitButtonText="Save Client"
                />
            </div>
        </div>
    )
}
