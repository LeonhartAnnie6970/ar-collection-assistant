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

const COLOR_HEADER_BG = "FF444444"
const COLOR_HEADER_FONT = "FFFFFFFF"
const COLOR_GRAND_TOTAL_BG = "FFD9D9D9"
const COLOR_AGING_OVERDUE = "FFFF0000" // red for aging > 30 days


const NUM_COLS = OUTPUT_HEADERS.length

export async function generateOutstandingExcel(
  data: OutstandingReportData
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "AR Collection Assistant"

  const ws = wb.addWorksheet(SHEET_NAME)

  ws.columns = COL_WIDTHS.map((width) => ({ width }))
  ws.views = [{ showGridLines: false }]

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
  cellA3.font = { name: "Calibri", size: 12, bold: true }

  // ── Row 4: Remark Date ───────────────────────────────────────────────────
  const cellA4 = ws.getCell("A4")
  cellA4.value = "Remark Date"
  // Italic per user request ("kemiringan font")
  cellA4.font = { name: "Calibri", size: 11, italic: true }

  const cellC4 = ws.getCell("C4")
  cellC4.value = data.remarkDate
  cellC4.numFmt = FMT_DATE
  cellC4.font = { name: "Calibri", size: 11, italic: true }

  // ── Row 5: Intentionally empty ───────────────────────────────────────────

  // ── Row 6: Column headers ────────────────────────────────────────────────
  const headerRow = ws.getRow(6)
  headerRow.height = 36 // taller to accommodate wrap text
  OUTPUT_HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    // Calibri, not bold, white — confirmed by user
    cell.font = { name: "Calibri", size: 11, bold: false, color: { argb: COLOR_HEADER_FONT } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER_BG } }
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
  })

  // ── Data rows (starting at row 7) ────────────────────────────────────────
  data.rows.forEach((row, idx) => {
    const r = ws.getRow(7 + idx)

    function bc(colNum: number) {
      const cell = r.getCell(colNum)
        return cell
    }

    bc(1).value = row.customer
    bc(2).value = row.custName

    const cDate = bc(3)
    cDate.value = row.invoiceDate
    if (typeof row.invoiceDate === "number") cDate.numFmt = FMT_DATE

    bc(4).value = row.invoiceNo
    bc(5).value = row.poNo

    const cTotal = bc(6)
    cTotal.value = row.total
    cTotal.numFmt = FMT_AMOUNT

    const cPay = bc(7)
    cPay.value = row.payment
    cPay.numFmt = FMT_AMOUNT

    const cRem = bc(8)
    cRem.value = row.remaining
    cRem.numFmt = FMT_AMOUNT

    bc(9).value = row.top

    const cRecv = bc(10)
    if (row.invoiceReceived === "On process") {
      cRecv.value = "On process"
    } else {
      cRecv.value = row.invoiceReceived
      cRecv.numFmt = FMT_DATE
    }

    // Aging: red when overdue > 30 days, blank when "On process"
    const cAging = bc(11)
    if (row.aging !== null) {
      cAging.value = row.aging
      cAging.numFmt = FMT_AGING
      if (row.aging > 30) {
        cAging.font = { name: "Calibri", size: 11, color: { argb: COLOR_AGING_OVERDUE } }
      }
    }
  })

  // ── Grand Total row ───────────────────────────────────────────────────────
  const gtRowNum = 7 + data.rows.length
  const gtRow = ws.getRow(gtRowNum)

  for (let c = 1; c <= NUM_COLS; c++) {
    const cell = gtRow.getCell(c)
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_GRAND_TOTAL_BG } }
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
