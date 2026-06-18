import Link from "next/link"
import { LayoutDashboard, FileText, Upload, Database, LogOut } from "lucide-react"
import { logout } from "@/lib/actions/auth"

export function Navbar() {
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="font-bold text-base md:text-lg tracking-tight whitespace-nowrap">
          AR Collection
        </span>
        <div className="flex items-center gap-1 md:gap-4 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm hover:text-blue-200 transition-colors px-1 py-1"
          >
            <LayoutDashboard size={15} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            href="/report"
            className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm hover:text-blue-200 transition-colors px-1 py-1"
          >
            <FileText size={15} />
            <span className="hidden sm:inline">Report</span>
          </Link>
          <Link
            href="/customers/import"
            className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm hover:text-blue-200 transition-colors px-1 py-1"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">Import</span>
          </Link>
          <Link
            href="/settings/backup"
            className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm hover:text-blue-200 transition-colors px-1 py-1"
          >
            <Database size={15} />
            <span className="hidden sm:inline">Backup</span>
          </Link>
          <form action={logout} className="flex">
            <button
              type="submit"
              className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm hover:text-red-300 transition-colors px-1 py-1 border border-blue-500 rounded-md"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
