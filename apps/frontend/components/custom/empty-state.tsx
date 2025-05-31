'use client'

import { FC, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
    title?: string
    description: string
    linkText: string
    linkHref: string
    icon?: ReactNode
}

const EmptyState: FC<EmptyStateProps> = ({
    title = 'Nothing here yet',
    description,
    linkText,
    linkHref,
    icon,
}) => (
    <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-center space-y-4">
            {icon ?? (
                // Icône par défaut si aucune n’est passée
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18"
                    />
                </svg>
            )}
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-center text-sm text-muted-foreground">
                {description}
            </p>
            <Link href={linkHref}>
                <Button variant="outline">{linkText}</Button>
            </Link>
        </div>
    </div>
)

export default EmptyState
