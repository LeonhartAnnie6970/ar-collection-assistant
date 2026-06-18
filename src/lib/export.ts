import ExcelJS from "exceljs"

export function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const header = sheet.getRow(1)
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } }
  header.alignment = { vertical: "middle", horizontal: "center" }
  header.height = 22
}

export function formatIDR(amount: number) {
  return amount % 1 === 0 ? amount.toString() : amount.toFixed(2)
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
