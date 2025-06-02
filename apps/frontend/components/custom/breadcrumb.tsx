'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function buildBreadcrumbs(pathname: string) {
    const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)
    const crumbs: { name: string; href: string }[] = []
    let accumulated = ''

    for (const segment of segments) {
        accumulated += `/${segment}`
        crumbs.push({
            name: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: accumulated,
        })
    }

    return crumbs
}

export function Breadcrumbs() {
    const pathname = usePathname() || '/'
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    if (pathname === '/' || pathname === '') {
        return null
    }

    const crumbs = buildBreadcrumbs(pathname)

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center space-x-1 text-sm"
        >
            {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1
                return (
                    <React.Fragment key={crumb.href}>
                        {isLast ? (
                            <h1 className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                                {crumb.name}
                            </h1>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="
                  text-neutral-700
                  hover:text-neutral-500
                  dark:text-neutral-50
                  dark:hover:text-neutral-300
                  text-base
                  font-medium
                "
                            >
                                {crumb.name}
                            </Link>
                        )}
                        {!isLast && (
                            <span className="text-gray-400 px-1 select-none">
                                /
                            </span>
                        )}
                    </React.Fragment>
                )
            })}
        </nav>
    )
}
