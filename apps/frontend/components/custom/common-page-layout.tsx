import { ReactNode } from "react"

interface CommonPageLayoutProps {
    children?: ReactNode
}

export default function CommonPageLayout({ children }: CommonPageLayoutProps)
{
    return(
        <div className="flex flex-col w-full h-screen justify-around">
            {children}
        </div>
    )
}