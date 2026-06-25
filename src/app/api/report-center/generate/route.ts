export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { parseInforRows } from "@/services/excel-parser.service"
import { transformToOutstanding, dateStringToExcelSerial } from "@/services/outstanding-report.service"
import { generateOutstandingExcel } from "@/services/excel-export.service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const remarkDate = formData.get("remarkDate") as string | null

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }
    if (!remarkDate || !/^\d{4}-\d{2}-\d{2}$/.test(remarkDate)) {
      return NextResponse.json({ error: "Remark Date tidak valid" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(new Uint8Array(buffer), { type: "array" })

    if (!wb.SheetNames.length) {
      return NextResponse.json({ error: "File tidak memiliki sheet" }, { status: 400 })
    }

    const ws = wb.Sheets[wb.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
    }) as (string | number)[][]

    const inforRows = parseInforRows(rawRows)

    if (inforRows.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data outstanding (REMAINING > 0) yang ditemukan dalam file" },
        { status: 400 }
      )
    }

    const remarkDateSerial = dateStringToExcelSerial(remarkDate)
    const reportData = transformToOutstanding(inforRows, remarkDateSerial)
    const excelBuffer = await generateOutstandingExcel(reportData)

    const fileName = `outstanding-ar-${remarkDate}.xlsx`

    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Gagal generate laporan" }, { status: 500 })
  }
}
