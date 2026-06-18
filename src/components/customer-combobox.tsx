"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import { searchCustomers } from "@/lib/actions/customer"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Customer, Sales } from "@prisma/client"

export type CustomerWithSales = Customer & { sales: Sales | null }

interface CustomerComboboxProps {
  onSelect: (customer: CustomerWithSales | null) => void
}

export function CustomerCombobox({ onSelect }: CustomerComboboxProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CustomerWithSales[]>([])
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState("")
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(
    (q: string) => {
      startTransition(async () => {
        const data = await searchCustomers(q)
        setResults(data as CustomerWithSales[])
        setOpen(data.length > 0)
      })
    },
    []
  )

  useEffect(() => {
    if (query === selectedName) return
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selectedName, doSearch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(customer: CustomerWithSales) {
    setSelectedName(customer.name)
    setQuery(customer.name)
    setOpen(false)
    setResults([])
    onSelect(customer)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (val !== selectedName) {
      setSelectedName("")
      onSelect(null)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Ketik nama customer..."
        autoComplete="off"
        required
      />
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {isPending ? (
            <div className="px-3 py-2 text-sm text-gray-500">Mencari...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan</div>
          ) : (
            results.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(customer)
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-0",
                  "transition-colors"
                )}
              >
                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                {customer.sales && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {customer.sales.code} — {customer.sales.name}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
      {/* Hidden input so customer_name is included in FormData */}
      <input type="hidden" name="customer_name" value={query} />
    </div>
  )
}
