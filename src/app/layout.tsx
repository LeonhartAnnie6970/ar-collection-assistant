import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AR Collection Assistant",
  description: "Aplikasi manajemen aktivitas collection AR",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
