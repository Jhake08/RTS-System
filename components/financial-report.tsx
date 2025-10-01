"use client"

import { useMemo } from "react"
import { DollarSign, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import type { ProcessedData } from "@/lib/types"

interface FinancialReportProps {
  data: ProcessedData | null
}

export function FinancialReport({ data }: FinancialReportProps) {
  const financialData = useMemo(() => {
    if (!data) return null

    const sourceData = data.all

    const filtered = sourceData.data

    // Calculate financial metrics
    const totalCOD = filtered.reduce((sum, parcel) => sum + (parcel.codAmount || 0), 0)
    const totalServiceCharge = filtered.reduce((sum, parcel) => sum + (parcel.serviceCharge || 0), 0)
    const totalShippingCost = filtered.reduce((sum, parcel) => sum + (parcel.totalCost || 0), 0)
    const totalRTSFee = filtered.reduce((sum, parcel) => sum + (parcel.rtsFee || 0), 0)

    // Calculate RTS-specific costs
    const rtsStatuses = ["CANCELLED", "PROBLEMATIC", "RETURNED"]
    const rtsParcels = filtered.filter((p) => rtsStatuses.includes(p.normalizedStatus))
    const rtsShippingCost = rtsParcels.reduce((sum, parcel) => sum + (parcel.totalCost || 0), 0)
    const rtsFeeLost = rtsParcels.reduce((sum, parcel) => sum + (parcel.rtsFee || 0), 0)

    const grossProfit = totalCOD - totalShippingCost
    const netProfit = grossProfit - rtsShippingCost - rtsFeeLost

    return {
      totalCOD,
      totalServiceCharge,
      totalShippingCost,
      totalRTSFee,
      rtsParcelsCount: rtsParcels.length,
      rtsShippingCost,
      rtsFeeLost,
      grossProfit,
      netProfit,
    }
  }, [data])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Upload data to view financial impact analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">FINANCIAL IMPACT REPORT</h1>
        <p className="text-muted-foreground">Comprehensive financial analysis and RTS cost impact</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total COD Amount</p>
          <p className="text-3xl font-bold text-foreground">
            ₱
            {financialData?.totalCOD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Service Charge</p>
          <p className="text-3xl font-bold text-foreground">
            ₱
            {financialData?.totalServiceCharge.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Shipping Cost</p>
          <p className="text-3xl font-bold text-foreground">
            ₱
            {financialData?.totalShippingCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
        </div>

        <div className="glass rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total RTS Fee (20%)</p>
          <p className="text-3xl font-bold text-foreground">
            ₱
            {financialData?.totalRTSFee.toLocaleString(undefined, {
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
            {financialData?.grossProfit.toLocaleString(undefined, {
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
            {financialData?.netProfit.toLocaleString(undefined, {
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
            <p className="text-2xl font-bold text-foreground">{financialData?.rtsParcelsCount.toLocaleString() || 0}</p>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground mb-1">RTS Shipping Cost Lost</p>
            <p className="text-2xl font-bold text-red-500">
              ₱
              {financialData?.rtsShippingCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground mb-1">RTS Fee Impact</p>
            <p className="text-2xl font-bold text-red-500">
              ₱
              {financialData?.rtsFeeLost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4">Financial Summary</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm font-medium text-muted-foreground">Total Revenue Potential (COD)</span>
            <span className="text-sm font-bold text-foreground">
              ₱
              {financialData?.totalCOD.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm font-medium text-muted-foreground">Total Operational Cost</span>
            <span className="text-sm font-bold text-foreground">
              ₱
              {financialData?.totalShippingCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm font-medium text-muted-foreground">Gross Profit</span>
            <span className="text-sm font-bold text-green-500">
              ₱
              {financialData?.grossProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm font-medium text-muted-foreground">RTS Cost Impact</span>
            <span className="text-sm font-bold text-red-500">
              -₱
              {financialData?.rtsShippingCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/20 border border-primary/50">
            <span className="text-base font-bold text-foreground">Net Profit</span>
            <span className="text-base font-bold text-primary">
              ₱
              {financialData?.netProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
