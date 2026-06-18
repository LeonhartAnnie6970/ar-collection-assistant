"use server"

import { prisma } from "@/lib/prisma"

export interface ImportRow {
  salesCode: string
  salesName: string
  customerName: string
  picCustomer?: string
}

export interface ImportResult {
  totalSales: number
  totalCustomers: number
  imported: number
  duplicates: number
  errors: string[]
}

export async function searchCustomers(query: string) {
  if (!query || query.trim().length < 2) return []

  try {
    return await prisma.customer.findMany({
      where: {
        name: { contains: query.trim() },
      },
      include: { sales: true },
      orderBy: { name: "asc" },
      take: 10,
    })
  } catch {
    return []
  }
}

export async function getCustomerHistory(customerId: number) {
  try {
    return await prisma.activity.findMany({
      where: { customerId },
      orderBy: { tanggal: "desc" },
      take: 5,
    })
  } catch {
    return []
  }
}

export async function importCustomers(rows: ImportRow[]): Promise<ImportResult> {
  const result: ImportResult = {
    totalSales: 0,
    totalCustomers: 0,
    imported: 0,
    duplicates: 0,
    errors: [],
  }

  const salesMap = new Map<string, number>()

  // 1. Upsert unique Sales (biasanya <20 records, cepat)
  const uniqueSales = [...new Map(rows.map((r) => [r.salesCode, r])).values()]
    .filter((r) => r.salesCode && r.salesName)

  for (const row of uniqueSales) {
    try {
      const sales = await prisma.sales.upsert({
        where: { code: row.salesCode.trim() },
        update: { name: row.salesName.trim() },
        create: { code: row.salesCode.trim(), name: row.salesName.trim() },
      })
      salesMap.set(row.salesCode.trim(), sales.id)
      result.totalSales++
    } catch (e) {
      result.errors.push(`Sales ${row.salesCode}: ${String(e)}`)
    }
  }

  result.totalCustomers = rows.length

  // 2. Ambil semua customer yang sudah ada dalam 1 query
  const existingCustomers = await prisma.customer.findMany({
    select: { name: true, salesId: true },
  })
  const existingSet = new Set(
    existingCustomers.map((c) => `${c.name}|${c.salesId ?? "null"}`)
  )

  // 3. Filter mana yang baru vs duplikat (di memory, tanpa DB)
  const toCreate: { name: string; salesId: number | null; picCustomer: string | null }[] = []

  for (const row of rows) {
    if (!row.customerName) continue
    const salesId = row.salesCode ? (salesMap.get(row.salesCode.trim()) ?? null) : null
    const key = `${row.customerName.trim()}|${salesId ?? "null"}`

    if (existingSet.has(key)) {
      result.duplicates++
    } else {
      toCreate.push({
        name: row.customerName.trim(),
        salesId,
        picCustomer: row.picCustomer?.trim() || null,
      })
      existingSet.add(key)
    }
  }

  // 4. Insert semua sekaligus dalam 1 query
  if (toCreate.length > 0) {
    try {
      const res = await prisma.customer.createMany({
        data: toCreate,
        skipDuplicates: true,
      })
      result.imported = res.count
    } catch (e) {
      result.errors.push(`Bulk insert error: ${String(e)}`)
    }
  }

  return result
}
