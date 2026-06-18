"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export type ActivityStatus =
  | "Waiting Confirmation"
  | "Janji Bayar"
  | "Sudah Bayar"
  | "No Response"
  | "Need Follow Up"

export interface ActivityFormData {
  tanggal: string
  customer_name: string
  collector: string
  os_amount: number
  od_amount: number
  invoice_count: number
  od_days: number
  activity: string
  feedback: string
  status: ActivityStatus
  customerId?: number | null
  picCustomer?: string
}

export async function createActivity(data: ActivityFormData) {
  try {
    const activity = await prisma.activity.create({
      data: {
        tanggal: new Date(data.tanggal),
        customer_name: data.customer_name,
        collector: data.collector,
        os_amount: data.os_amount,
        od_amount: data.od_amount,
        invoice_count: data.invoice_count,
        od_days: data.od_days,
        activity: data.activity,
        feedback: data.feedback,
        status: data.status,
        customerId: data.customerId ?? null,
        picCustomer: data.picCustomer || null,
      },
    })
    revalidatePath("/")
    revalidatePath("/report")
    return { success: true, data: activity }
  } catch (error) {
    console.error("Error creating activity:", error)
    return { success: false, error: "Gagal menyimpan aktivitas" }
  }
}

export async function getActivitiesByDate(date: string) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const activities = await prisma.activity.findMany({
      where: {
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { created_at: "asc" },
    })
    return { success: true, data: activities }
  } catch (error) {
    console.error("Error fetching activities:", error)
    return { success: false, data: [], error: "Gagal mengambil data aktivitas" }
  }
}

export async function getTodayActivities() {
  const today = new Date()
  const dateStr = today.toISOString().split("T")[0]
  return getActivitiesByDate(dateStr)
}

export async function getTodayCount() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const count = await prisma.activity.count({
      where: {
        tanggal: {
          gte: today,
          lt: tomorrow,
        },
      },
    })
    return count
  } catch {
    return 0
  }
}
