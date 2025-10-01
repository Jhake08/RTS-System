"use client"

import { useMemo } from "react"
import { TrendingUp, Package, CheckCircle, XCircle } from "lucide-react"
import type { ProcessedData } from "@/lib/types"

interface PerformanceReportProps {
  data: ProcessedData | null
}

export function PerformanceReport({ data }: PerformanceReportProps) {
  const filteredData = useMemo(() => {
    if (!data) return null

    const sourceData = data.all

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
  }, [data])

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Parcels</p>
          <p className="text-3xl font-bold text-foreground">{filteredData?.total.toLocaleString() || 0}</p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Delivery Rate</p>
          <p className="text-3xl font-bold text-foreground">{deliveryRate}%</p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">RTS Rate</p>
          <p className="text-3xl font-bold text-foreground">{rtsRate}%</p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Delivered</p>
          <p className="text-3xl font-bold text-foreground">
            {(filteredData?.stats.DELIVERED?.count || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="glass rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4">Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredData &&
            Object.entries(filteredData.stats).map(([status, statusData]) => (
              <div key={status} className="p-4 rounded-lg bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-1">{status}</p>
                <p className="text-2xl font-bold text-foreground">{statusData.count.toLocaleString()}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
