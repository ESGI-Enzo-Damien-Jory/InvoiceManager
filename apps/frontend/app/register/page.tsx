'use client'

import { useState } from 'react'
import { GalleryVerticalEnd } from 'lucide-react'
import { RegisterForm } from '@/components/blocks/register-form'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            InMa
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs space-y-4">
            {!confirmationMessage ? (
              <RegisterForm onSuccess={(msg) => setConfirmationMessage(msg)} />
            ) : (
              <div className="rounded-md bg-green-100 p-4 text-center text-green-700 dark:bg-green-900 dark:text-green-300">
                {confirmationMessage}
              </div>
            )}
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
