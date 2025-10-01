"use client"

import { useMemo, useState } from "react"
import { TrendingUp, Package, CheckCircle, XCircle } from "lucide-react"
import type { ProcessedData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PerformanceReportProps {
  data: ProcessedData | null
}

export function PerformanceReport({ data }: PerformanceReportProps) {
  const [filterType, setFilterType] = useState<"all" | "province" | "month" | "year">("all")
  const [filterValue, setFilterValue] = useState("")

  const filteredData = useMemo(() => {
    if (!data) return null

    const sourceData = data.all

    if (filterType === "all") {
      const filtered = sourceData.data

      // Recalculate stats for filtered data
      const stats: { [status: string]: { count: number } } = {}
      filtered.forEach((parcel) => {
        if (!stats[parcel.normalizedStatus]) {
          stats[parcel.normalizedStatus] = { count: 0 }
        }
        stats[parcel.normalizedStatus].count++
      })

      return {
        data: filtered,
        stats,
        total: filtered.length,
      }
    }

    const filtered = sourceData.data.filter((parcel) => {
      if (filterType === "province") {
        return parcel.province.toLowerCase().includes(filterValue.toLowerCase())
      }
      if (filterType === "month") {
        if (!parcel.date) return false
        let parcelMonth: number
        try {
          let d: Date
          if (typeof parcel.date === "number") {
            d = new Date(Date.UTC(1899, 11, 30) + parcel.date * 86400000)
          } else {
            d = new Date(parcel.date.toString().trim())
          }
          if (isNaN(d.getTime())) {
            const parts = parcel.date.toString().split(" ")[0].split("-")
            parcelMonth = Number.parseInt(parts[1], 10)
          } else {
            parcelMonth = d.getMonth() + 1
          }
        } catch (e) {
          const parts = parcel.date.toString().split(" ")[0].split("-")
          parcelMonth = Number.parseInt(parts[1], 10)
        }
        return parcelMonth === Number.parseInt(filterValue, 10)
      }
      if (filterType === "year") {
        if (!parcel.date) return false
        let parcelYear: number
        try {
          let d: Date
          if (typeof parcel.date === "number") {
            d = new Date(Date.UTC(1899, 11, 30) + parcel.date * 86400000)
          } else {
            d = new Date(parcel.date.toString().trim())
          }
          if (isNaN(d.getTime())) {
            const parts = parcel.date.toString().split(" ")[0].split("-")
            parcelYear = Number.parseInt(parts[0], 10)
          } else {
            parcelYear = d.getFullYear()
          }
        } catch (e) {
          const parts = parcel.date.toString().split(" ")[0].split("-")
          parcelYear = Number.parseInt(parts[0], 10)
        }
        return parcelYear === Number.parseInt(filterValue, 10)
      }
      return true
    })

    // Recalculate stats for filtered data
    const stats: { [status: string]: { count: number } } = {}
    filtered.forEach((parcel) => {
      if (!stats[parcel.normalizedStatus]) {
        stats[parcel.normalizedStatus] = { count: 0 }
      }
      stats[parcel.normalizedStatus].count++
    })

    return {
      data: filtered,
      stats,
      total: filtered.length,
    }
  }, [data, filterType, filterValue])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Upload data to view performance metrics</p>
        </div>
      </div>
    )
  }

  const deliveryRate = filteredData
    ? (((filteredData.stats.DELIVERED?.count || 0) / filteredData.total) * 100).toFixed(2)
    : "0.00"
  const rtsRate = filteredData
    ? (
        (((filteredData.stats.CANCELLED?.count || 0) +
          (filteredData.stats.PROBLEMATIC?.count || 0) +
          (filteredData.stats.RETURNED?.count || 0)) /
          filteredData.total) *
        100
      ).toFixed(2)
    : "0.00"

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">PERFORMANCE REPORT</h1>
        <p className="text-muted-foreground">Comprehensive delivery and operational performance metrics</p>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-foreground">Filter:</label>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as any)
            setFilterValue("")
          }}
          className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
        >
          <option value="all">All</option>
          <option value="province">Province</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>

        {filterType === "province" && (
          <Input
            type="text"
            placeholder="Enter province name"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-48 h-9 text-sm"
          />
        )}

        {filterType === "month" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
          >
            <option value="">Select month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        )}

        {filterType === "year" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
          >
            <option value="">Select year</option>
            {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => (
              <option key={2000 + i} value={String(2000 + i)}>
                {2000 + i}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => {
            if (filterType !== "all" && !filterValue) {
              alert("Please enter or select a value to filter.")
              return
            }
            // Trigger filtering by updating state (already handled by useMemo)
          }}
          className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Apply
        </button>

        <button
          onClick={() => {
            setFilterType("all")
            setFilterValue("")
          }}
          className="px-4 py-1.5 rounded-md border border-border text-sm font-semibold hover:bg-secondary/50 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Parcels</p>
          <p className="text-3xl font-bold text-foreground">{filteredData?.total.toLocaleString() || 0}</p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total COD Amount</p>
          <p className="text-3xl font-bold text-foreground">
            ₱
            {filteredData?.totalCOD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Operational Cost</p>
          <p className="text-3xl font-bold text-foreground">
            ₱
            {filteredData?.totalShippingCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">RTS Cost Impact</p>
          <p className="text-3xl font-bold text-foreground">
            -₱
            {filteredData?.rtsShippingCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-green-500/50">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-foreground">Gross Profit</h2>
          </div>
          <p className="text-4xl font-bold text-green-500 mb-2">
            ₱
            {filteredData?.grossProfit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
          <p className="text-sm text-muted-foreground">Total COD - Shipping Costs</p>
        </div>

        <div className="glass rounded-xl p-6 border border-blue-500/50">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-foreground">Net Profit</h2>
          </div>
          <p className="text-4xl font-bold text-blue-500 mb-2">
            ₱
            {filteredData?.netProfit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
          <p className="text-sm text-muted-foreground">Gross Profit - RTS Impact</p>
        </div>
      </div>

      <div className="glass rounded-xl p-6 border border-red-500/50">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-foreground">RTS Financial Impact</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground mb-1">RTS Parcels</p>
            <p className="text-2xl font-bold text-foreground">{filteredData?.rtsParcelsCount.toLocaleString() || 0}</p>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground mb-1">RTS Shipping Cost Lost</p>
            <p className="text-2xl font-bold text-red-500">
              ₱
              {filteredData?.rtsShippingCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground mb-1">RTS Fee Impact</p>
            <p className="text-2xl font-bold text-red-500">
              ₱
              {filteredData?.rtsFeeLost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
