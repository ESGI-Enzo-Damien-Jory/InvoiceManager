import { Separator } from '@radix-ui/react-separator'
import CardStats from './card-stats'

export default function CardStatsList() {
    return (
        <div className="flex flex-col md:flex-row bg-white rounded-xl border p-8 gap-4">
            <CardStats title="Paid" value={18} delta={-4.2} />
            <Separator
                orientation="vertical"
                className="hidden md:block mx-4"
            />
            <CardStats title="Sent" value={25} delta={4.8} />
            <Separator
                orientation="vertical"
                className="hidden md:block mx-4"
            />
            <CardStats title="Pending" value={10} delta={-2} />
            <Separator
                orientation="vertical"
                className="hidden md:block mx-4"
            />
            <CardStats title="Overdue" value={2} delta={-1} />
        </div>
    )
}
