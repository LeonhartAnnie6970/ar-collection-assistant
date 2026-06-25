import { ReportCenterPanel } from "@/components/report-center/report-center-panel"

export default function ReportCenterPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Report Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload file export Infor ERP untuk menghasilkan Outstanding A/R Report
        </p>
      </div>
      <ReportCenterPanel />
    </div>
  )
}
