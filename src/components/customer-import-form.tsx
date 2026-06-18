"use client"

import { useState, useTransition, useRef } from "react"
import { toast } from "sonner"
import { importCustomers, type ImportRow, type ImportResult } from "@/lib/actions/customer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react"

interface PreviewRow {
  salesCode: string
  salesName: string
  customerName: string
  picCustomer: string
}

function parseCSV(text: string): PreviewRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"))

  const colIndex = {
    salesCode: header.findIndex((h) => ["sales_code", "kode_sales", "code"].includes(h)),
    salesName: header.findIndex((h) => ["sales_name", "nama_sales", "sales"].includes(h)),
    customerName: header.findIndex((h) => ["customer_name", "nama_customer", "customer"].includes(h)),
    picCustomer: header.findIndex((h) => ["pic_customer", "pic", "nama_pic"].includes(h)),
  }

  // Fallback: positional (col 0,1,2,3)
  if (colIndex.salesCode === -1) colIndex.salesCode = 0
  if (colIndex.salesName === -1) colIndex.salesName = 1
  if (colIndex.customerName === -1) colIndex.customerName = 2
  if (colIndex.picCustomer === -1) colIndex.picCustomer = 3

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    return {
      salesCode: cols[colIndex.salesCode] ?? "",
      salesName: cols[colIndex.salesName] ?? "",
      customerName: cols[colIndex.customerName] ?? "",
      picCustomer: cols[colIndex.picCustomer] ?? "",
    }
  }).filter((r) => r.customerName)
}

async function parseExcel(file: File): Promise<PreviewRow[]> {
  const XLSX = await import("xlsx")
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" })

  return raw.map((row) => {
    const keys = Object.keys(row).map((k) => k.trim())
    const get = (variants: string[]) => {
      const key = keys.find((k) =>
        variants.some((v) => k.toLowerCase().replace(/\s+/g, "_") === v)
      )
      return key ? String(row[key] ?? "").trim() : ""
    }

    const salesCode =
      get(["sales_code", "kode_sales", "code"]) || String(Object.values(row)[0] ?? "").trim()
    const salesName =
      get(["sales_name", "nama_sales", "sales"]) || String(Object.values(row)[1] ?? "").trim()
    const customerName =
      get(["customer_name", "nama_customer", "customer"]) || String(Object.values(row)[2] ?? "").trim()
    const picCustomer =
      get(["pic_customer", "pic", "nama_pic"]) || String(Object.values(row)[3] ?? "").trim()

    return { salesCode, salesName, customerName, picCustomer }
  }).filter((r) => r.customerName)
}

export function CustomerImportForm() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [fileName, setFileName] = useState("")
  const [parseError, setParseError] = useState("")
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setParseError("")

    try {
      let rows: PreviewRow[] = []
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        const text = await file.text()
        rows = parseCSV(text)
      } else {
        rows = await parseExcel(file)
      }

      if (rows.length === 0) {
        setParseError("Tidak ada data yang bisa dibaca. Pastikan format file sesuai template.")
        setPreview([])
      } else {
        setPreview(rows)
      }
    } catch {
      setParseError("Gagal membaca file. Pastikan format CSV atau Excel (.xlsx) yang valid.")
      setPreview([])
    }
  }

  function handleImport() {
    const importRows: ImportRow[] = preview.map((r) => ({
      salesCode: r.salesCode,
      salesName: r.salesName,
      customerName: r.customerName,
      picCustomer: r.picCustomer || undefined,
    }))

    startTransition(async () => {
      const res = await importCustomers(importRows)
      setResult(res)
      if (res.imported > 0) {
        toast.success(`${res.imported} customer berhasil diimport`)
        setPreview([])
        setFileName("")
        if (fileRef.current) fileRef.current.value = ""
      } else if (res.duplicates > 0 && res.imported === 0) {
        toast.info("Semua customer sudah ada (duplikat)")
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Template info */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-blue-800 font-medium mb-1">Format file yang didukung: CSV atau Excel (.xlsx)</p>
          <p className="text-sm text-blue-700">Kolom yang dibutuhkan (urutan atau nama kolom):</p>
          <code className="text-xs text-blue-900 bg-blue-100 rounded px-2 py-1 mt-1 block">
            sales_code | sales_name | customer_name | pic_customer (opsional)
          </code>
          <p className="text-xs text-blue-600 mt-2">Contoh: SM001 | HENSON | NATLAS REKARTHA INDONESIA | JOHN</p>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <FileSpreadsheet size={28} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {fileName || "Klik untuk pilih file CSV atau Excel"}
            </span>
            <span className="text-xs text-gray-400 mt-1">CSV, XLSX</span>
            <input
              id="file-upload"
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {parseError && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {parseError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Preview — {preview.length} customer
              </CardTitle>
              <Button onClick={handleImport} disabled={isPending}>
                <Upload size={16} className="mr-2" />
                {isPending ? "Mengimport..." : `Import ${preview.length} Customer`}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Kode Sales</th>
                    <th className="pb-2 pr-4 font-medium">Sales</th>
                    <th className="pb-2 pr-4 font-medium">Customer</th>
                    <th className="pb-2 font-medium">PIC</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-gray-600">{row.salesCode}</td>
                      <td className="py-2 pr-4 text-gray-700">{row.salesName}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900">{row.customerName}</td>
                      <td className="py-2 text-gray-600">{row.picCustomer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 50 && (
                <p className="text-xs text-gray-400 mt-2">
                  Menampilkan 50 dari {preview.length} baris...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="border-green-100 bg-green-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-semibold text-green-800">Import Selesai</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{result.totalSales}</p>
                <p className="text-xs text-green-600 mt-0.5">Total Sales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{result.totalCustomers}</p>
                <p className="text-xs text-green-600 mt-0.5">Total Customer</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700">{result.imported}</p>
                <p className="text-xs text-blue-600 mt-0.5">Berhasil Import</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">{result.duplicates}</p>
                <p className="text-xs text-gray-500 mt-0.5">Duplikat (Skip)</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-4 text-xs text-red-700 bg-red-50 border border-red-100 rounded p-3">
                <p className="font-medium mb-1">Error ({result.errors.length}):</p>
                {result.errors.slice(0, 5).map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
