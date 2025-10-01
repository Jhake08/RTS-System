"use client"

import { useMemo, useState } from "react"
import { TrendingUp, Package, CheckCircle, XCircle, PieChart, BarChart3 } from "lucide-react"
import type { ProcessedData, FilterState } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

interface PerformanceReportProps {
  data: ProcessedData | null
}

export function PerformanceReport({ data }: PerformanceReportProps) {
  const [currentRegion, setCurrentRegion] = useState<"all" | "luzon" | "visayas" | "mindanao">("all")
  const [filter, setFilter] = useState<FilterState>({ type: "all", value: "" })

  const { filteredData, regionalRates, pieData, lineData } = useMemo(() => {
    if (!data) return { filteredData: null, regionalRates: [], pieData: [], lineData: [] }

    const sourceData = currentRegion === "all" ? data.all : data[currentRegion]

    let filtered: any[]
    if (filter.type === "all") {
      filtered = sourceData.data
    } else {
      filtered = sourceData.data.filter((parcel) => {
        if (filter.type === "province") {
          return parcel.province.toLowerCase().includes(filter.value.toLowerCase())
        }
        if (filter.type === "month") {
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
          return parcelMonth === Number.parseInt(filter.value, 10)
        }
        if (filter.type === "year") {
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
          return parcelYear === Number.parseInt(filter.value, 10)
        }
        return true
      })
    }

    // Recalculate stats for filtered data
    const stats: { [status: string]: { count: number } } = {}
    filtered.forEach((parcel) => {
      if (!stats[parcel.normalizedStatus]) {
        stats[parcel.normalizedStatus] = { count: 0 }
      }
      stats[parcel.normalizedStatus].count++
    })

    // Calculate regional delivery rates
    const regionalRates = [
      {
        region: "Luzon",
        rate: data.luzon.total > 0 ? ((data.luzon.stats.DELIVERED?.count || 0) / data.luzon.total) * 100 : 0,
      },
      {
        region: "Visayas",
        rate: data.visayas.total > 0 ? ((data.visayas.stats.DELIVERED?.count || 0) / data.visayas.total) * 100 : 0,
      },
      {
        region: "Mindanao",
        rate: data.mindanao.total > 0 ? ((data.mindanao.stats.DELIVERED?.count || 0) / data.mindanao.total) * 100 : 0,
      },
    ]

    // Prepare pie chart data
    const pieData = Object.entries(stats).map(([status, data]) => ({
      name: status,
      value: data.count,
      percentage: ((data.count / filtered.length) * 100).toFixed(1),
    }))

    // Prepare line chart data for delivery and RTS rates over months
    const monthMap: { [key: number]: string } = {
      1: "Jan",
      2: "Feb",
      3: "Mar",
      4: "Apr",
      5: "May",
      6: "Jun",
      7: "Jul",
      8: "Aug",
      9: "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    }

    const monthlyStats: { [month: number]: { delivered: number; rts: number; total: number } } = {}

    filtered.forEach((parcel) => {
      if (!parcel.date) return
      let d: Date
      try {
        if (typeof parcel.date === "number") {
          d = new Date(Date.UTC(1899, 11, 30) + parcel.date * 86400000)
        } else {
          d = new Date(parcel.date.toString().trim())
        }
      } catch {
        return
      }
      const month = d.getMonth() + 1
      if (!monthlyStats[month]) {
        monthlyStats[month] = { delivered: 0, rts: 0, total: 0 }
      }
      monthlyStats[month].total++
      if (parcel.normalizedStatus === "DELIVERED") {
        monthlyStats[month].delivered++
      }
      if (["CANCELLED", "PROBLEMATIC", "RETURNED"].includes(parcel.normalizedStatus)) {
        monthlyStats[month].rts++
      }
    })

    const lineData = Object.entries(monthlyStats)
      .map(([monthStr, stats]) => {
        const month = Number(monthStr)
        return {
          month: monthMap[month],
          deliveredRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0,
          rtsRate: stats.total > 0 ? (stats.rts / stats.total) * 100 : 0,
        }
      })
      .sort((a, b) => Object.keys(monthMap).indexOf(a.month) - Object.keys(monthMap).indexOf(b.month))

    return {
      filteredData: {
        data: filtered,
        stats,
        total: filtered.length,
      },
      regionalRates,
      pieData,
      lineData,
    }
  }, [data, currentRegion, filter])

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

      {/* Region Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button
            variant={currentRegion === "all" ? "default" : "outline"}
            onClick={() => setCurrentRegion("all")}
            className="font-medium"
          >
            All Regions
          </Button>
          <Button
            variant={currentRegion === "luzon" ? "default" : "outline"}
            onClick={() => setCurrentRegion("luzon")}
            className="font-medium"
          >
            Luzon
          </Button>
          <Button
            variant={currentRegion === "visayas" ? "default" : "outline"}
            onClick={() => setCurrentRegion("visayas")}
            className="font-medium"
          >
            Visayas
          </Button>
          <Button
            variant={currentRegion === "mindanao" ? "default" : "outline"}
            onClick={() => setCurrentRegion("mindanao")}
            className="font-medium"
          >
            Mindanao
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-foreground">Filter:</label>
          <select
            value={filter.type}
            onChange={(e) => {
              setFilter({ type: e.target.value as any, value: "" })
            }}
            className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
          >
            <option value="all">All</option>
            <option value="province">Province</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>

          {filter.type === "province" && (
            <Input
              type="text"
              placeholder="Enter province name"
              value={filter.value}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
              className="w-48 h-9 text-sm"
            />
          )}

          {filter.type === "month" && (
            <select
              value={filter.value}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
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

          {filter.type === "year" && (
            <select
              value={filter.value}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
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

          <Button size="sm" onClick={() => {
            if (filter.type !== "all" && !filter.value) {
              alert("Please enter or select a value to filter.")
              return
            }
            // Trigger filtering by updating state (already handled by useMemo)
          }} className="h-9">
            Apply
          </Button>
          <Button size="sm" variant="outline" onClick={() => setFilter({ type: "all", value: "" })} className="h-9 bg-transparent">
            Clear
          </Button>
        </div>
      </div>

      {/* Pie Chart for Status Distribution */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <PieChart className="w-6 h-6" />
          Status Distribution
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <RechartsPieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Regional Delivery Rates Bar Chart */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Regional Delivery Rates (%)
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={regionalRates} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="rate" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart for Monthly Delivery and RTS Rates */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Monthly Delivery & RTS Rates (%)
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="deliveredRate" stroke="#00C49F" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="rtsRate" stroke="#FF8042" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

