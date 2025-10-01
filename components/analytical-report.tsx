"use client"

import { useState, useMemo } from "react"
import { PieChart, MapPin, PackageX } from "lucide-react"
import type { ProcessedData } from "@/lib/types"
import { ReportFiltersComponent, type ReportFilters } from "./report-filters"

interface AnalyticalReportProps {
  data: ProcessedData | null
}

export function AnalyticalReport({ data }: AnalyticalReportProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    island: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  })

  const { filteredData, topProvinces, topShippers, topRTSDestinations } = useMemo(() => {
    if (!data) return { filteredData: null, topProvinces: [], topShippers: [], topRTSDestinations: [] }

    const sourceData = filters.island === "all" ? data.all : data[filters.island]

    const filtered = sourceData.data.filter((parcel) => {
      if (filters.status !== "all" && parcel.normalizedStatus !== filters.status) {
        return false
      }
      if (filters.dateFrom && parcel.date < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && parcel.date > filters.dateTo) {
        return false
      }
      return true
    })

    // Calculate provinces
    const provinces: { [key: string]: number } = {}
    const shippers: { [key: string]: number } = {}
    filtered.forEach((parcel) => {
      provinces[parcel.province] = (provinces[parcel.province] || 0) + 1
      shippers[parcel.shipper] = (shippers[parcel.shipper] || 0) + 1
    })

    const rtsStatuses = ["CANCELLED", "PROBLEMATIC", "RETURNED"]
    const rtsDestinations: { [key: string]: number } = {}
    filtered
      .filter((p) => rtsStatuses.includes(p.normalizedStatus))
      .forEach((parcel) => {
        rtsDestinations[parcel.province] = (rtsDestinations[parcel.province] || 0) + 1
      })

    const topProvinces = Object.entries(provinces)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const topShippers = Object.entries(shippers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    const topRTSDestinations = Object.entries(rtsDestinations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    // Calculate regional totals
    const luzonTotal = filtered.filter((p) => p.island === "Luzon").length
    const visayasTotal = filtered.filter((p) => p.island === "Visayas").length
    const mindanaoTotal = filtered.filter((p) => p.island === "Mindanao").length

    return {
      filteredData: { luzonTotal, visayasTotal, mindanaoTotal, total: filtered.length },
      topProvinces,
      topShippers,
      topRTSDestinations,
    }
  }, [data, filters])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Upload data to view analytical insights</p>
        </div>
      </div>
    )
  }

  const availableStatuses = Object.keys(data.all.stats)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ANALYTICAL REPORT</h1>
        <p className="text-muted-foreground">Deep insights into regional distribution and shipper performance</p>
      </div>

      <ReportFiltersComponent filters={filters} onFiltersChange={setFilters} availableStatuses={availableStatuses} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Luzon</h2>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">{filteredData?.luzonTotal.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground">Total Parcels</p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Visayas</h2>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">{filteredData?.visayasTotal.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground">Total Parcels</p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Mindanao</h2>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">{filteredData?.mindanaoTotal.toLocaleString() || 0}</p>
          <p className="text-sm text-muted-foreground">Total Parcels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-border/50">
          <h2 className="text-xl font-bold text-foreground mb-4">Top 10 Provinces</h2>
          <div className="space-y-3">
            {topProvinces.map(([province, count], index) => (
              <div key={province} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-6">#{index + 1}</span>
                  <span className="text-sm font-medium text-foreground">{province}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <h2 className="text-xl font-bold text-foreground mb-4">Top 10 Shippers</h2>
          <div className="space-y-3">
            {topShippers.map(([shipper, count], index) => (
              <div key={shipper} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-6">#{index + 1}</span>
                  <span className="text-sm font-medium text-foreground">{shipper}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 border border-red-500/50">
        <div className="flex items-center gap-3 mb-4">
          <PackageX className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-foreground">Top 10 RTS Destinations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topRTSDestinations.map(([destination, count], index) => (
            <div key={destination} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-red-500 w-6">#{index + 1}</span>
                <span className="text-sm font-medium text-foreground">{destination}</span>
              </div>
              <span className="text-sm font-bold text-red-500">{count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
