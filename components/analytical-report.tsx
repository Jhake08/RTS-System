"use client"

import { useMemo, useState } from "react"
import { PieChart, MapPin, PackageX } from "lucide-react"
import type { ProcessedData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AnalyticalReportProps {
  data: ProcessedData | null
}

export function AnalyticalReport({ data }: AnalyticalReportProps) {
  const [filterType, setFilterType] = useState<"all" | "province" | "month" | "year">("all")
  const [filterValue, setFilterValue] = useState("")

  const { filteredData, topProvinces, topShippers, topRTSDestinations } = useMemo(() => {
    if (!data) return { filteredData: null, topProvinces: [], topShippers: [], topRTSDestinations: [] }

    const sourceData = data.all

    if (filterType === "all") {
      const filtered = sourceData.data

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
      const luzonTotal = filtered.filter((p) => p.island === "luzon").length
      const visayasTotal = filtered.filter((p) => p.island === "visayas").length
      const mindanaoTotal = filtered.filter((p) => p.island === "mindanao").length

      return {
        filteredData: { luzonTotal, visayasTotal, mindanaoTotal, total: filtered.length },
        topProvinces,
        topShippers,
        topRTSDestinations,
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
    const luzonTotal = filtered.filter((p) => p.island === "luzon").length
    const visayasTotal = filtered.filter((p) => p.island === "visayas").length
    const mindanaoTotal = filtered.filter((p) => p.island === "mindanao").length

    return {
      filteredData: { luzonTotal, visayasTotal, mindanaoTotal, total: filtered.length },
      topProvinces,
      topShippers,
      topRTSDestinations,
    }
  }, [data, filterType, filterValue])

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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ANALYTICAL REPORT</h1>
        <p className="text-muted-foreground">Deep insights into regional distribution and shipper performance</p>
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
