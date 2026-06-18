"use client"

import { useEffect, useState, useTransition } from "react"
import { getCustomerHistory } from "@/lib/actions/customer"
import { StatusBadge } from "@/components/status-badge"
import type { Activity } from "@prisma/client"

interface CustomerHistoryProps {
  customerId: number | null
}

export function CustomerHistory({ customerId }: CustomerHistoryProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!customerId) {
      setActivities([])
      return
    }
    startTransition(async () => {
      const data = await getCustomerHistory(customerId)
      setActivities(data as Activity[])
    })
  }, [customerId])

  if (!customerId) return null

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
      <h3 className="text-sm font-semibold text-blue-800 mb-3">Riwayat Follow Up Customer</h3>
      {isPending ? (
        <p className="text-sm text-blue-600">Memuat riwayat...</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-blue-600 italic">Belum ada riwayat follow up.</p>
      ) : (
        <div className="space-y-0">
          {activities.map((activity, i) => (
            <div key={activity.id}>
              {i > 0 && <hr className="border-blue-100 my-3" />}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-medium text-blue-700">
                  {new Date(activity.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <StatusBadge status={activity.status} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{activity.activity}</p>
              {activity.feedback && (
                <p className="text-sm text-gray-500 italic mt-1 leading-relaxed">
                  {activity.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
