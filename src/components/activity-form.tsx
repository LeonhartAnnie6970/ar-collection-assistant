"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createActivity, type ActivityStatus } from "@/lib/actions/activity"
import { CustomerCombobox, type CustomerWithSales } from "@/components/customer-combobox"
import { CustomerHistory } from "@/components/customer-history"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STATUS_OPTIONS: ActivityStatus[] = [
  "Waiting Confirmation",
  "Janji Bayar",
  "Sudah Bayar",
  "No Response",
  "Need Follow Up",
]

export function ActivityForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ActivityStatus>("Waiting Confirmation")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithSales | null>(null)
  const [picCustomer, setPicCustomer] = useState("")
  const [manualCollector, setManualCollector] = useState("")

  const today = new Date().toISOString().split("T")[0]

  function handleCustomerSelect(customer: CustomerWithSales | null) {
    setSelectedCustomer(customer)
    if (customer) {
      setPicCustomer(customer.picCustomer ?? "")
      setManualCollector(customer.sales?.name ?? "")
    } else {
      setPicCustomer("")
      setManualCollector("")
    }
  }

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)

    const customerName = (fd.get("customer_name") as string) || ""
    if (!customerName.trim()) {
      setError("Nama customer tidak boleh kosong")
      return
    }

    const collector = selectedCustomer
      ? (selectedCustomer.sales?.name ?? "")
      : manualCollector

    const data = {
      tanggal: fd.get("tanggal") as string,
      customer_name: customerName,
      collector,
      os_amount: parseFloat(fd.get("os_amount") as string),
      od_amount: parseFloat(fd.get("od_amount") as string),
      invoice_count: parseInt(fd.get("invoice_count") as string),
      od_days: parseInt(fd.get("od_days") as string),
      activity: fd.get("activity") as string,
      feedback: fd.get("feedback") as string,
      status,
      customerId: selectedCustomer?.id ?? null,
      picCustomer: picCustomer.trim() || undefined,
    }

    startTransition(async () => {
      const result = await createActivity(data)
      if (result.success) {
        toast.success("Aktivitas berhasil disimpan")
        router.push("/")
      } else {
        setError(result.error ?? "Terjadi kesalahan")
        toast.error(result.error ?? "Gagal menyimpan aktivitas")
      }
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tambah Aktivitas</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tanggal */}
          <div className="space-y-1.5">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input
              id="tanggal"
              name="tanggal"
              type="date"
              defaultValue={today}
              required
            />
          </div>

          {/* Customer Search */}
          <div className="space-y-1.5">
            <Label>Nama Customer</Label>
            <CustomerCombobox onSelect={handleCustomerSelect} />
          </div>

          {/* Sales - auto-fill or manual */}
          <div className="space-y-1.5">
            <Label htmlFor="collector-display">Sales</Label>
            {selectedCustomer ? (
              <Input
                id="collector-display"
                value={selectedCustomer.sales?.name ?? "—"}
                readOnly
                className="bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            ) : (
              <Input
                id="collector-display"
                value={manualCollector}
                onChange={(e) => setManualCollector(e.target.value)}
                placeholder="Nama sales"
              />
            )}
          </div>

          {/* PIC Customer */}
          <div className="space-y-1.5">
            <Label htmlFor="pic-customer">PIC Customer</Label>
            <Input
              id="pic-customer"
              value={picCustomer}
              onChange={(e) => setPicCustomer(e.target.value)}
              placeholder="Nama PIC customer"
            />
          </div>

          {/* Customer History */}
          {selectedCustomer && (
            <CustomerHistory customerId={selectedCustomer.id} />
          )}

          {/* OS & OD Amount */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="os_amount">OS Amount (jt)</Label>
              <Input
                id="os_amount"
                name="os_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="od_amount">OD Amount (jt)</Label>
              <Input
                id="od_amount"
                name="od_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Invoice & OD Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="invoice_count">Jumlah Invoice</Label>
              <Input
                id="invoice_count"
                name="invoice_count"
                type="number"
                min="0"
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="od_days">OD Days</Label>
              <Input
                id="od_days"
                name="od_days"
                type="number"
                min="0"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-1.5">
            <Label htmlFor="activity">Aktivitas</Label>
            <Textarea
              id="activity"
              name="activity"
              placeholder="Deskripsi aktivitas yang dilakukan..."
              rows={3}
              required
            />
          </div>

          {/* Feedback */}
          <div className="space-y-1.5">
            <Label htmlFor="feedback">Feedback Customer</Label>
            <Textarea
              id="feedback"
              name="feedback"
              placeholder="Feedback atau respon dari customer..."
              rows={3}
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ActivityStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Menyimpan..." : "Simpan Aktivitas"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
