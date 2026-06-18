import { CustomerImportForm } from "@/components/customer-import-form"

export const metadata = {
  title: "Import Customer | AR Collection Assistant",
}

export default function ImportCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Customer</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload file CSV atau Excel untuk import data customer dan sales secara massal
        </p>
      </div>
      <CustomerImportForm />
    </div>
  )
}
