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

  // Upsert all unique Sales
  const uniqueSales = [...new Map(rows.map((r) => [r.salesCode, r])).values()]
  for (const row of uniqueSales) {
    if (!row.salesCode || !row.salesName) continue
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

  // Import customers
  for (const row of rows) {
    if (!row.customerName) continue
    const salesId = row.salesCode ? salesMap.get(row.salesCode.trim()) : undefined

    try {
      const existing = await prisma.customer.findFirst({
        where: {
          name: row.customerName.trim(),
          salesId: salesId ?? null,
        },
      })

      if (existing) {
        result.duplicates++
        continue
      }

      await prisma.customer.create({
        data: {
          name: row.customerName.trim(),
          salesId: salesId ?? null,
          picCustomer: row.picCustomer?.trim() || null,
        },
      })
      result.imported++
    } catch (e) {
      result.errors.push(`Customer ${row.customerName}: ${String(e)}`)
    }
  }

  return result
}
