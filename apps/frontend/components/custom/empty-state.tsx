'use client'
import { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
    title?: string
    description: string
    linkText: string
    linkHref: string
}

const EmptyState: FC<EmptyStateProps> = ({
    title = 'Nothing here yet',
    description,
    linkText,
    linkHref,
}) => (
    <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground" />
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
