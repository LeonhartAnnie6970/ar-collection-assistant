import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import ExcelJS from "exceljs"
import { prisma } from "@/lib/prisma"
import { styleHeaderRow } from "@/lib/export"

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

  const [customers, sales] = await Promise.all([
    prisma.customer.findMany({
      include: { sales: true },
      orderBy: { name: "asc" },
    }),
    prisma.sales.findMany({ orderBy: { code: "asc" } }),
  ])

  const wb = new ExcelJS.Workbook()
  wb.creator = "AR Collection Assistant"
  wb.created = new Date()

  // Customers sheet
  const wsCustomers = wb.addWorksheet("Customers")
  wsCustomers.columns = [
    { header: "Nama Customer", key: "name", width: 38 },
    { header: "Kode Sales", key: "salesCode", width: 14 },
    { header: "Sales", key: "salesName", width: 22 },
    { header: "PIC Customer", key: "picCustomer", width: 22 },
  ]
  styleHeaderRow(wsCustomers)
  for (const c of customers) {
    wsCustomers.addRow({
      name: c.name,
      salesCode: c.sales?.code ?? "",
      salesName: c.sales?.name ?? "",
      picCustomer: c.picCustomer ?? "",
    })
  }

  // Sales sheet
  const wsSales = wb.addWorksheet("Sales")
  wsSales.columns = [
    { header: "Kode", key: "code", width: 14 },
    { header: "Nama Sales", key: "name", width: 28 },
    { header: "Jumlah Customer", key: "count", width: 18 },
  ]
  styleHeaderRow(wsSales)

  const countMap = new Map<number, number>()
  for (const c of customers) {
    if (c.salesId) countMap.set(c.salesId, (countMap.get(c.salesId) ?? 0) + 1)
  }
  for (const s of sales) {
    wsSales.addRow({ code: s.code, name: s.name, count: countMap.get(s.id) ?? 0 })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const date = new Date().toISOString().split("T")[0]

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="customers-${date}.xlsx"`,
    },
  })
}
