import { ReportClient } from "@/components/report-client"

export const metadata = {
  title: "Report | AR Collection Assistant",
}

export default function ReportPage() {
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Aktivitas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pilih tanggal untuk melihat laporan dan generate format WhatsApp
        </p>
      </div>
      <ReportClient initialDate={today} />
    </div>
  )
}
