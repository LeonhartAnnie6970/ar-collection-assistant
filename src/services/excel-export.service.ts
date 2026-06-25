import ExcelJS from "exceljs"
import type { OutstandingReportData } from "./outstanding-report.service"

const COMPANY_NAME = "PT. SINAR JAYA PRIMA LANGGENG"
const SHEET_NAME = "SJPL_PiutangRpt_1"

const OUTPUT_HEADERS = [
  "CUSTOMER",
  "CUST NAME",
  "INVOICE DATE",
  "INVOICE NO",
  "PO NO",
  "TOTAL",
  "PAYMENT",
  "REMAINING",
  "TOP",
  "INVOICE RECEIVED",
  "AGING",
]

// Column widths measured from expected-outstanding-report.xlsx
const COL_WIDTHS = [11, 36.5, 11, 11, 17, 10, 10, 11, 4.5, 12, 6.5]

const FMT_AMOUNT = "###,###,###,###,##0"
const FMT_DATE = "d-mmm-yy"
const FMT_AGING = "#,##0"

const COLOR_HEADER_BG = "FF444444" // dark gray header row
const COLOR_HEADER_FONT = "FFFFFFFF" // white text
// Grand total: white with -35% tint ≈ light silver (#D9D9D9)
const COLOR_GRAND_TOTAL_BG = "FFD9D9D9"

export async function generateOutstandingExcel(
  data: OutstandingReportData
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "AR Collection Assistant"

  const ws = wb.addWorksheet(SHEET_NAME)

  ws.columns = COL_WIDTHS.map((width) => ({ width }))

  // ── Row 1: Company name ──────────────────────────────────────────────────
  ws.getRow(1).height = 18
  const cellA1 = ws.getCell("A1")
  cellA1.value = COMPANY_NAME
  // TODO: confirm exact font size for company name row
  cellA1.font = { name: "Calibri", size: 14, bold: true }

  // ── Row 2: Intentionally empty ───────────────────────────────────────────

  // ── Row 3: Report title ──────────────────────────────────────────────────
  ws.getRow(3).height = 15.6
  const cellA3 = ws.getCell("A3")
  cellA3.value = "OUTSTANDING A/R"
  cellA3.font = { name: "Calibri", size: 11, bold: true }

  // ── Row 4: Remark Date ───────────────────────────────────────────────────
  const cellA4 = ws.getCell("A4")
  cellA4.value = "Remark Date"
  cellA4.font = { name: "Calibri", size: 11 }

  const cellC4 = ws.getCell("C4")
  cellC4.value = data.remarkDate // Excel serial → displays as date
  cellC4.numFmt = FMT_DATE
  cellC4.font = { name: "Calibri", size: 11 }

  // ── Row 5: Intentionally empty ───────────────────────────────────────────

  // ── Row 6: Column headers ────────────────────────────────────────────────
  const headerRow = ws.getRow(6)
  headerRow.height = 28.8
  OUTPUT_HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    // Calibri, not bold, white — confirmed by user
    cell.font = { name: "Calibri", size: 11, bold: false, color: { argb: COLOR_HEADER_FONT } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER_BG } }
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })

  // ── Data rows (starting at row 7) ────────────────────────────────────────
  data.rows.forEach((row, idx) => {
    const r = ws.getRow(7 + idx)

    r.getCell(1).value = row.customer
    r.getCell(2).value = row.custName

    const cDate = r.getCell(3)
    cDate.value = row.invoiceDate
    if (typeof row.invoiceDate === "number") cDate.numFmt = FMT_DATE

    r.getCell(4).value = row.invoiceNo
    r.getCell(5).value = row.poNo

    const cTotal = r.getCell(6)
    cTotal.value = row.total
    cTotal.numFmt = FMT_AMOUNT

    const cPay = r.getCell(7)
    cPay.value = row.payment
    cPay.numFmt = FMT_AMOUNT

    const cRem = r.getCell(8)
    cRem.value = row.remaining
    cRem.numFmt = FMT_AMOUNT

    r.getCell(9).value = row.top

    const cRecv = r.getCell(10)
    if (row.invoiceReceived === "On process") {
      cRecv.value = "On process"
    } else {
      cRecv.value = row.invoiceReceived
      cRecv.numFmt = FMT_DATE
    }

    // Aging is blank when invoice is "On process"
    if (row.aging !== null) {
      const cAging = r.getCell(11)
      cAging.value = row.aging
      cAging.numFmt = FMT_AGING
    }
  })

  // ── Grand Total row ───────────────────────────────────────────────────────
  const gtRowNum = 7 + data.rows.length
  const gtRow = ws.getRow(gtRowNum)

  // Apply silver background across all 11 columns
  for (let c = 1; c <= OUTPUT_HEADERS.length; c++) {
    gtRow.getCell(c).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_GRAND_TOTAL_BG },
    }
  }

  const cellGTLabel = gtRow.getCell(2)
  cellGTLabel.value = "GRAND TOTAL"
  cellGTLabel.font = { name: "Calibri", size: 11, bold: true }

  const cellGTValue = gtRow.getCell(8)
  cellGTValue.value = data.grandTotal
  cellGTValue.numFmt = FMT_AMOUNT
  cellGTValue.font = { name: "Calibri", size: 11, bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer as ArrayBuffer)
}
