import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Activity } from "@prisma/client"

function formatAmount(amount: number) {
  return amount % 1 === 0 ? amount.toString() : amount.toFixed(2)
}

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 truncate">
                {activity.customer_name}
              </span>
              <span className="text-xs text-gray-500">({activity.collector})</span>
              <StatusBadge status={activity.status} />
            </div>
            {(activity.picCustomer || (activity as typeof activity & { picPhone?: string | null }).picPhone) && (
              <div className="mt-0.5 text-xs text-gray-500 flex items-center gap-2">
                {activity.picCustomer && <span>PIC: {activity.picCustomer}</span>}
                {(activity as typeof activity & { picPhone?: string | null }).picPhone && (
                  <span>· {(activity as typeof activity & { picPhone?: string | null }).picPhone}</span>
                )}
              </div>
            )}

            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-600">
              <span>OS: <strong>{formatAmount(activity.os_amount)} jt</strong></span>
              <span>OD: <strong>{formatAmount(activity.od_amount)} jt</strong></span>
              <span>{activity.invoice_count} inv</span>
              <span>{activity.od_days} hr</span>
            </div>

            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{activity.activity}</p>
            {activity.feedback && (
              <p className="mt-1 text-sm text-gray-500 italic line-clamp-1">
                &ldquo;{activity.feedback}&rdquo;
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
