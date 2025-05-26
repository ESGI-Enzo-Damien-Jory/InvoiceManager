import { ReactNode } from 'react'

interface CommonCenterLayoutProps {
    children?: ReactNode
}

export default function CommonCenterLayout({
    children,
}: CommonCenterLayoutProps) {
    return <div className="h-full p-8 flex flex-col gap-8">{children}</div>
}
