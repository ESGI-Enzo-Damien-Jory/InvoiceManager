'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/custom/top-bar'
import ErrorState from '@/components/custom/error-state'
import ClientForm from '@/components/custom/specialized/client-form'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface CreateClientDTO {
    first_name: string
    last_name: string
    email: string
    phone_number?: string
    address?: string
    avatar?: string
}

export default function NewClient() {
    const router = useRouter()
    const [error, setError] = React.useState<string | null>(null)

    const handleCreateClient = async (
        values: CreateClientDTO
    ): Promise<void> => {
        setError(null)

        try {
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
                const data = await res
                    .json()
                    .catch(() => ({}) as { message?: string })
                throw new Error(
                    data.message || `Failed to create client: ${res.status}`
                )
            }

            router.push('/clients')
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError(String(error))
            }
        }
    }

    return (
        <div className="h-screen w-full flex flex-col">
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
