import type { InforRow } from "./excel-parser.service"

export interface OutstandingRow {
  customer: string
  custName: string
  invoiceDate: number | string
  invoiceNo: string
  poNo: string
  total: number
  payment: number
  remaining: number
  top: string
  invoiceReceived: number | "On process"
  // null = "On process" → leave cell empty
  aging: number | null
}

export interface OutstandingReportData {
  remarkDate: number // Excel serial number
  rows: OutstandingRow[]
  grandTotal: number
}

// Convert ISO date string "YYYY-MM-DD" to Excel serial number.
// Excel serial 1 = Jan 1 1900. Unix epoch (Jan 1 1970) = Excel serial 25569.
export function dateStringToExcelSerial(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 25569
}

export function transformToOutstanding(
  inforRows: InforRow[],
  remarkDateSerial: number
): OutstandingReportData {
  const rows: OutstandingRow[] = inforRows.map((row) => {
    const conf = row.confirmationDate
    // A valid confirmation date is a positive finite number (Excel serial)
    const hasDate = typeof conf === "number" && isFinite(conf) && conf > 0

    return {
      customer: row.customer,
      custName: row.custName,
      invoiceDate: row.invoiceDate,
      invoiceNo: row.invoiceNo,
      poNo: row.poNo,
      total: row.total,
      payment: row.payment,
      remaining: row.remaining,
      top: row.top,
      invoiceReceived: hasDate ? (conf as number) : "On process",
      // AGING = Remark Date − CONFIRMATION DATE (in days)
      // When "On process" (no confirmation date), aging is left blank
      aging: hasDate ? remarkDateSerial - (conf as number) : null,
    }
  })

  const grandTotal = rows.reduce((sum, r) => sum + r.remaining, 0)

  return { remarkDate: remarkDateSerial, rows, grandTotal }
}
