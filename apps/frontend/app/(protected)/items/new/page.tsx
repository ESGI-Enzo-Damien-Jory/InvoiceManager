'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import ErrorState from '@/components/custom/error-state'
import ItemForm, {
    CreateItemDTO,
} from '@/components/custom/specialized/item-form'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

function fileToHex(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const buffer = reader.result as ArrayBuffer
            const bytes = new Uint8Array(buffer)
            let hex = ''
            for (const b of bytes) {
                hex += b.toString(16).padStart(2, '0')
            }
            resolve(hex)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(file)
    })
}

export default function NewItemPage() {
    const router = useRouter()
    const [error, setError] = React.useState<string | null>(null)

    const handleCreate = async (data: CreateItemDTO) => {
        setError(null)
        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('No token')
            let avatarHex: string | null = null
            if (data.avatar && data.avatar.length > 0) {
                avatarHex = await fileToHex(data.avatar[0])
            }
            const payload = {
                name: data.name,
                price: data.price,
                avatar: avatarHex,
            }
            const res = await fetch(`${API_URL}/api/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const p = await res.json().catch(() => ({}))
                throw new Error(p.message || 'Failed')
            }
            await router.push('/items')
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="h-screen w-full flex flex-col">
            {error && (
                <ErrorState message={error} onRetry={() => setError(null)} />
            )}
            <div className="flex-1 overflow-auto p-4">
                <ItemForm
                    onSubmit={handleCreate}
                    cancelHref="/items"
                    submitButtonText="Save"
                />
            </div>
        </div>
    )
}
