"use client"

import { useRef, useState } from "react"
import { FileSpreadsheet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export interface ParsedFileData {
  file: File
  fileName: string
  sheetName: string
  sheetCount: number
  rowCount: number   // data rows (excluding header)
  colCount: number
  headers: string[]
  previewRows: (string | number)[][] // up to 20 data rows
  allRows: (string | number)[][]     // all rows including header (sent to API)
}

interface UploadPanelProps {
  onFileParsed: (data: ParsedFileData) => void
}

export function UploadPanel({ onFileParsed }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function processFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Hanya file .xlsx atau .xls yang didukung")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      const buffer = await file.arrayBuffer()
      const XLSX = await import("xlsx")
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const allRows = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: "",
      }) as (string | number)[][]

      if (allRows.length < 2) {
        setError("File tidak memiliki data yang cukup")
        return
      }

      const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1")

      onFileParsed({
        file,
        fileName: file.name,
        sheetName,
        sheetCount: wb.SheetNames.length,
        rowCount: allRows.length - 1,
        colCount: range.e.c + 1,
        headers: allRows[0].map(String),
        previewRows: allRows.slice(1, 21),
        allRows,
      })
    } catch {
      setError("Gagal membaca file. Pastikan format Excel (.xlsx / .xls) yang valid.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <Card>
      <CardContent className="pt-6 pb-6">
        <div
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          {isLoading ? (
            <p className="text-sm text-gray-500">Memproses file...</p>
          ) : (
            <>
              <FileSpreadsheet size={36} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drag &amp; drop file Infor export di sini
              </p>
              <p className="text-xs text-gray-400 mt-1">atau klik untuk memilih file</p>
              <p className="text-xs text-gray-400 mt-1">.xlsx · .xls</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && (
          <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
