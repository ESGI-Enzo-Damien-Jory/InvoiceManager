'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner' // ou autre système de toast

import { GalleryVerticalEnd } from 'lucide-react'
import { LoginForm } from '@/components/blocks/login-form'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('unauthorized') === '1') {
            toast.error("Tu dois être connecté pour accéder à cette page.")
        }
    }, [searchParams])

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-medium"
                    >
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        InMa
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="/placeholder.svg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    width={150}
                    height={150}
                />
            </div>
        </div>
    )
}
