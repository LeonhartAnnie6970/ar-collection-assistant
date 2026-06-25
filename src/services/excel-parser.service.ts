// Parses raw rows from Infor ERP xlsx export.
// Uses header-based column detection with positional fallback.

export interface InforRow {
  customer: string
  custName: string
  invoiceDate: number | string
  invoiceNo: string
  poNo: string
  total: number
  payment: number
  remaining: number
  top: string
  confirmationDate: number | string // Excel serial if present, "" if not
}

interface ColIndices {
  customer: number
  custName: number
  invoiceDate: number
  invoiceNo: number
  poNo: number
  total: number
  payment: number
  remaining: number
  top: number
  confirmationDate: number
}

const HEADER_LOOKUP: Record<string, keyof ColIndices> = {
  "CUSTOMER": "customer",
  "CUST NAME": "custName",
  "INVOICE DATE": "invoiceDate",
  "INVOICE NO": "invoiceNo",
  "INVH PO NO": "poNo",
  "TOTAL": "total",
  "PAYMENT": "payment",
  "REMAINING": "remaining",
  "TOP": "top",
  "CONFIRMATION DATE": "confirmationDate",
}

// Positional fallback: matches Infor's standard 40-column export
const POSITIONAL_FALLBACK: ColIndices = {
  customer: 0,
  custName: 1,
  invoiceDate: 2,
  invoiceNo: 3,
  poNo: 4,
  total: 5,
  payment: 6,
  remaining: 7,
  top: 8,
  confirmationDate: 9,
}

function detectColIndices(headerRow: (string | number)[]): ColIndices {
  const found: Partial<ColIndices> = {}
  headerRow.forEach((h, i) => {
    const key = HEADER_LOOKUP[String(h).trim()]
    if (key) found[key] = i
  })
  return {
    customer: found.customer ?? POSITIONAL_FALLBACK.customer,
    custName: found.custName ?? POSITIONAL_FALLBACK.custName,
    invoiceDate: found.invoiceDate ?? POSITIONAL_FALLBACK.invoiceDate,
    invoiceNo: found.invoiceNo ?? POSITIONAL_FALLBACK.invoiceNo,
    poNo: found.poNo ?? POSITIONAL_FALLBACK.poNo,
    total: found.total ?? POSITIONAL_FALLBACK.total,
    payment: found.payment ?? POSITIONAL_FALLBACK.payment,
    remaining: found.remaining ?? POSITIONAL_FALLBACK.remaining,
    top: found.top ?? POSITIONAL_FALLBACK.top,
    confirmationDate: found.confirmationDate ?? POSITIONAL_FALLBACK.confirmationDate,
  }
}

export function parseInforRows(rawRows: (string | number)[][]): InforRow[] {
  if (!rawRows || rawRows.length < 2) return []

  const col = detectColIndices(rawRows[0])
  const result: InforRow[] = []

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i]
    const customer = String(row[col.customer] ?? "").trim()

    // Skip summary rows (empty customer or Infor's "Sum:" footer)
    if (!customer || customer.startsWith("Sum:")) continue

    const remaining = Number(row[col.remaining])
    // Only include unpaid / partially paid invoices
    if (!isFinite(remaining) || remaining <= 0) continue

    result.push({
      customer,
      custName: String(row[col.custName] ?? "").trim(),
      invoiceDate: row[col.invoiceDate] as number | string,
      invoiceNo: String(row[col.invoiceNo] ?? "").trim(),
      poNo: String(row[col.poNo] ?? "").trim(),
      total: Number(row[col.total]) || 0,
      payment: Number(row[col.payment]) || 0,
      remaining,
      top: String(row[col.top] ?? "").trim(),
      confirmationDate: row[col.confirmationDate] as number | string,
    })
  }

  return result
}
