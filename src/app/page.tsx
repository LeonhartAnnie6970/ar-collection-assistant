import Link from "next/link"
import { getTodayActivities, getTodayCount } from "@/lib/actions/activity"
import { ActivityCard } from "@/components/activity-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, ClipboardList } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [activitiesResult, count] = await Promise.all([
    getTodayActivities(),
    getTodayCount(),
  ])

  const activities = activitiesResult.data ?? []
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: id })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/activity/new">
            <PlusCircle size={15} className="mr-1.5" />
            <span className="hidden sm:inline">Tambah Aktivitas</span>
            <span className="sm:hidden">Tambah</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2.5">
                <ClipboardList size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Aktivitas Hari Ini</p>
                <p className="text-3xl font-bold text-blue-900">{count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Aktivitas Hari Ini</h2>
        {activities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada aktivitas hari ini.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/activity/new">
                <PlusCircle size={14} className="mr-1.5" />
                Tambah Aktivitas
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
