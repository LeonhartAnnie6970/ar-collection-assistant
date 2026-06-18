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

  const [activities, customers, sales] = await Promise.all([
    prisma.activity.findMany({ orderBy: [{ tanggal: "desc" }] }),
    prisma.customer.findMany({ include: { sales: true }, orderBy: { name: "asc" } }),
    prisma.sales.findMany({ orderBy: { code: "asc" } }),
  ])

  const wb = new ExcelJS.Workbook()
  wb.creator = "AR Collection Assistant"
  wb.created = new Date()

  // === Activities ===
  const wsA = wb.addWorksheet("Activities")
  wsA.columns = [
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
  styleHeaderRow(wsA)
  for (const a of activities) {
    wsA.addRow({
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

  // === Customers ===
  const wsC = wb.addWorksheet("Customers")
  wsC.columns = [
    { header: "Nama Customer", key: "name", width: 38 },
    { header: "Kode Sales", key: "salesCode", width: 14 },
    { header: "Sales", key: "salesName", width: 22 },
    { header: "PIC Customer", key: "picCustomer", width: 22 },
  ]
  styleHeaderRow(wsC)
  for (const c of customers) {
    wsC.addRow({
      name: c.name,
      salesCode: c.sales?.code ?? "",
      salesName: c.sales?.name ?? "",
      picCustomer: c.picCustomer ?? "",
    })
  }

  // === Sales ===
  const wsS = wb.addWorksheet("Sales")
  wsS.columns = [
    { header: "Kode", key: "code", width: 14 },
    { header: "Nama Sales", key: "name", width: 28 },
  ]
  styleHeaderRow(wsS)
  for (const s of sales) {
    wsS.addRow({ code: s.code, name: s.name })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const date = new Date().toISOString().split("T")[0]

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="ar-collection-backup-${date}.xlsx"`,
    },
  })
}
