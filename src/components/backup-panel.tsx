"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileSpreadsheet, Database, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExportItem {
  label: string
  description: string
  url: string
  icon: React.ReactNode
}

const exports: ExportItem[] = [
  {
    label: "Export Activities",
    description: "Semua data collection activities dalam format Excel",
    url: "/api/export/activities",
    icon: <FileSpreadsheet size={20} className="text-blue-600" />,
  },
  {
    label: "Export Customers & Sales",
    description: "Master data customer dan sales dalam format Excel",
    url: "/api/export/customers",
    icon: <FileSpreadsheet size={20} className="text-green-600" />,
  },
  {
    label: "Export All Data",
    description: "Semua data (Activities + Customers + Sales) dalam satu file",
    url: "/api/export/all",
    icon: <Database size={20} className="text-purple-600" />,
  },
]

export function BackupPanel() {
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function handleExport(item: ExportItem) {
    setLoading(item.url)
    setDone(null)
    try {
      const res = await fetch(item.url)
      if (!res.ok) throw new Error("Export gagal")

      const blob = await res.blob()
      const contentDisposition = res.headers.get("Content-Disposition") ?? ""
      const match = contentDisposition.match(/filename="(.+?)"/)
      const filename = match?.[1] ?? "export.xlsx"

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      setDone(item.url)
      toast.success(`${item.label} berhasil diunduh`)
    } catch {
      toast.error(`Gagal mengunduh ${item.label}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {exports.map((item) => (
        <Card key={item.url} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5">{item.icon}</div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </div>
              <Button
                onClick={() => handleExport(item)}
                disabled={loading === item.url}
                variant={done === item.url ? "outline" : "default"}
                size="sm"
                className="shrink-0"
              >
                {loading === item.url ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                    Mengunduh...
                  </>
                ) : done === item.url ? (
                  <>
                    <CheckCircle size={14} className="mr-1.5 text-green-600" />
                    Selesai
                  </>
                ) : (
                  <>
                    <Download size={14} className="mr-1.5" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
