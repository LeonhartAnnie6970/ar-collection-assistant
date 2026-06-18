import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/prisma"
import { styleHeaderRow, formatDate } from "@/lib/export"

export const runtime = "nodejs"

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "fallback-dev-secret-change-in-production"
  )
}

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("ar_auth")?.value
  if (!token) return new NextResponse("Unauthorized", { status: 401 })

  try {
    await jwtVerify(token, getSecret())
  } catch {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const activities = await prisma.activity.findMany({
    orderBy: [{ tanggal: "desc" }, { created_at: "desc" }],
  })

  const wb = new ExcelJS.Workbook()
  wb.creator = "AR Collection Assistant"
  wb.created = new Date()

  const ws = wb.addWorksheet("Collection Activities")

  ws.columns = [
    { header: "Tanggal", key: "tanggal", width: 14 },
    { header: "Customer", key: "customer_name", width: 32 },
    { header: "Sales", key: "collector", width: 18 },
    { header: "PIC", key: "picCustomer", width: 18 },
    { header: "OS (jt)", key: "os_amount", width: 12 },
    { header: "OD (jt)", key: "od_amount", width: 12 },
    { header: "Inv", key: "invoice_count", width: 8 },
    { header: "OD Days", key: "od_days", width: 10 },
    { header: "Aktivitas", key: "activity", width: 45 },
    { header: "Feedback", key: "feedback", width: 45 },
    { header: "Status", key: "status", width: 22 },
  ]

  styleHeaderRow(ws)

  for (const a of activities) {
    ws.addRow({
      tanggal: formatDate(a.tanggal),
      customer_name: a.customer_name,
      collector: a.collector,
      picCustomer: a.picCustomer ?? "",
      os_amount: a.os_amount,
      od_amount: a.od_amount,
      invoice_count: a.invoice_count,
      od_days: a.od_days,
      activity: a.activity,
      feedback: a.feedback,
      status: a.status,
    })
  }

  ws.eachRow((row, i) => {
    if (i === 1) return
    row.alignment = { wrapText: true, vertical: "top" }
    if (i % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFF" } }
    }
  })

  const buffer = await wb.xlsx.writeBuffer()
  const date = new Date().toISOString().split("T")[0]

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="activities-${date}.xlsx"`,
    },
  })
}
