import { cn } from "@/lib/utils"

const statusConfig: Record<string, string> = {
  "Waiting Confirmation": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Janji Bayar": "bg-blue-100 text-blue-800 border-blue-200",
  "Sudah Bayar": "bg-green-100 text-green-800 border-green-200",
  "No Response": "bg-gray-100 text-gray-700 border-gray-200",
  "Need Follow Up": "bg-red-100 text-red-800 border-red-200",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusConfig[status] ?? "bg-gray-100 text-gray-700 border-gray-200"
      )}
    >
      {status}
    </span>
  )
}
