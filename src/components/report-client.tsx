"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { getActivitiesByDate } from "@/lib/actions/activity"
import { ActivityCard } from "@/components/activity-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Copy, MessageSquare, Search, Check } from "lucide-react"
import type { Activity } from "@prisma/client"

function formatAmount(amount: number) {
  return amount % 1 === 0 ? amount.toString() : amount.toFixed(2)
}

function generateWhatsAppReport(activities: Activity[]): string {
  if (activities.length === 0) return ""

  return activities
    .map((a) => {
      return `*${a.customer_name}* (${a.collector})

OS ${formatAmount(a.os_amount)} jt
OD ${formatAmount(a.od_amount)} jt (${a.invoice_count} inv, ${a.od_days} hr)

${a.activity}

${a.feedback}`
    })
    .join("\n\n---\n\n")
}

export function ReportClient({ initialDate }: { initialDate: string }) {
  const [date, setDate] = useState(initialDate)
  const [activities, setActivities] = useState<Activity[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [report, setReport] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSearch() {
    if (!date) return
    setShowReport(false)
    startTransition(async () => {
      const result = await getActivitiesByDate(date)
      const data = (result.data ?? []) as Activity[]
      setActivities(data)
      setHasSearched(true)
    })
  }

  function handleGenerateReport() {
    const text = generateWhatsAppReport(activities)
    setReport(text)
    setShowReport(true)
    toast.success("Laporan WhatsApp berhasil dibuat")
  }

  async function handleCopy() {
    if (!report) return
    await navigator.clipboard.writeText(report)
    setCopied(true)
    toast.success("Laporan berhasil disalin")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Button onClick={handleSearch} disabled={isPending} className="w-full sm:w-auto">
              <Search size={16} className="mr-2" />
              {isPending ? "Mencari..." : "Tampilkan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Hasil ({activities.length} aktivitas)
              </h2>
              {activities.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  className="w-full sm:w-auto"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Generate WhatsApp Report
                </Button>
              )}
            </div>

            {activities.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">
                Tidak ada aktivitas pada tanggal ini.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>

          {showReport && report && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-base">Format Laporan WhatsApp</CardTitle>
                    <Button
                      size="sm"
                      variant={copied ? "default" : "outline"}
                      onClick={handleCopy}
                      className="w-full sm:w-auto"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="mr-1.5" />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="mr-1.5" />
                          Copy Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono leading-relaxed text-gray-800 max-h-[500px] overflow-y-auto">
                    {report}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
