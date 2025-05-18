import { ReactNode } from "react"

interface CommonCenterLayoutProps {
    children?: ReactNode
}

export default function CommonCenterLayout({ children }: CommonCenterLayoutProps)
{
    return(
        <div className="">
            {children}
        </div>
    )
}