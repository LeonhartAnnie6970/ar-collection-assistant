import { ActivityForm } from "@/components/activity-form"

export const metadata = {
  title: "Tambah Aktivitas | AR Collection Assistant",
}

export default function NewActivityPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Aktivitas Baru</h1>
      <ActivityForm />
    </div>
  )
}
