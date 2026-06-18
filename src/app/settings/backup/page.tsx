import { BackupPanel } from "@/components/backup-panel"

export const metadata = {
  title: "Backup Data | AR Collection Assistant",
}

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backup Data</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Export data ke file Excel untuk backup atau analisis
        </p>
      </div>
      <BackupPanel />
    </div>
  )
}
