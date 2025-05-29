'use client'

import * as React from 'react'
import ClientForm from '@/components/custom/specialized/client-form'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/custom/top-bar'

export default function NewClient() {
    const router = useRouter()

    const handleCreateClient = async (formData: any) => {
        try {
            console.log('Creating client:', formData)
            router.push('/clients')
        } catch (error) {
            console.error('Failed to create client:', error)
        }
    }

    return (
        <div className="h-screen w-full">
            <Topbar subtitle="Create" title="New Client" />
            <ClientForm onSubmit={handleCreateClient} />
        </div>
    )
}
