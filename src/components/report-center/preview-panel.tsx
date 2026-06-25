"use client"

import { FileSpreadsheet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ParsedFileData } from "./upload-panel"

const MAX_VISIBLE_COLS = 12

interface PreviewPanelProps {
  data: ParsedFileData
  onReset: () => void
}

export function PreviewPanel({ data, onReset }: PreviewPanelProps) {
  const visibleHeaders = data.headers.slice(0, MAX_VISIBLE_COLS)
  const extraCols = data.headers.length - MAX_VISIBLE_COLS

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-green-600" />
            <CardTitle className="text-base truncate max-w-xs">{data.fileName}</CardTitle>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-red-600 underline shrink-0"
          >
            Ganti file
          </button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
          <span>Sheet: <strong className="text-gray-700">{data.sheetName}</strong></span>
          <span>Baris data: <strong className="text-gray-700">{data.rowCount}</strong></span>
          <span>Kolom: <strong className="text-gray-700">{data.colCount}</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 mb-2">
          Preview {data.previewRows.length} baris pertama
          {extraCols > 0 && ` · menampilkan ${MAX_VISIBLE_COLS} dari ${data.colCount} kolom`}:
        </p>
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="text-xs w-full">
            <thead>
              <tr className="bg-gray-100">
                {visibleHeaders.map((h, i) => (
                  <th
                    key={i}
                    className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap border-r border-gray-200 last:border-0"
                  >
                    {h}
                  </th>
                ))}
                {extraCols > 0 && (
                  <th className="px-2 py-1.5 text-gray-400 font-normal whitespace-nowrap">
                    +{extraCols} kolom
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.previewRows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  {row.slice(0, MAX_VISIBLE_COLS).map((cell, j) => (
                    <td
                      key={j}
                      className="px-2 py-1.5 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-0 max-w-[150px] truncate"
                    >
                      {String(cell)}
                    </td>
                  ))}
                  {extraCols > 0 && (
                    <td className="px-2 py-1.5 text-gray-400">…</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
