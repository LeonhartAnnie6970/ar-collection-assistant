"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Download, FileBarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ParsedFileData } from "./upload-panel"

interface GeneratePanelProps {
  parsedData: ParsedFileData
}

export function GeneratePanel({ parsedData }: GeneratePanelProps) {
  const today = new Date().toISOString().split("T")[0]
  const [remarkDate, setRemarkDate] = useState(today)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState("")

  // Revoke blob URL on unmount to free memory
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [downloadUrl])

  async function handleGenerate() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(null)
    }
    setIsGenerating(true)

    try {
      const fd = new FormData()
      fd.append("file", parsedData.file)
      fd.append("remarkDate", remarkDate)

      const res = await fetch("/api/report-center/generate", {
        method: "POST",
        body: fd,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Gagal generate laporan" }))
        toast.error(err.error ?? "Gagal generate laporan")
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const name = `outstanding-ar-${remarkDate}.xlsx`
      setDownloadUrl(url)
      setDownloadName(name)
      toast.success("Outstanding Report berhasil dibuat")
    } catch {
      toast.error("Terjadi kesalahan saat generate laporan")
    } finally {
      setIsGenerating(false)
    }
  }

  function handleDownload() {
    if (!downloadUrl) return
    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = downloadName
    a.click()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Generate Outstanding Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="space-y-1.5 w-full sm:w-auto">
            <Label htmlFor="remark-date">Remark Date</Label>
            <Input
              id="remark-date"
              type="date"
              value={remarkDate}
              onChange={(e) => {
                setRemarkDate(e.target.value)
                // Reset download when date changes (aging will differ)
                if (downloadUrl) {
                  URL.revokeObjectURL(downloadUrl)
                  setDownloadUrl(null)
                }
              }}
              className="w-full sm:w-48"
            />
            <p className="text-xs text-gray-400">
              Aging dihitung dari tanggal ini
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !remarkDate}
            className="w-full sm:w-auto"
          >
            <FileBarChart size={16} className="mr-2" />
            {isGenerating ? "Generating..." : "Generate Outstanding Report"}
          </Button>
        </div>

        {downloadUrl && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex-1 text-sm text-green-800">
              <strong>{downloadName}</strong> siap didownload
            </div>
            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <Download size={14} className="mr-1.5" />
              Download Excel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
