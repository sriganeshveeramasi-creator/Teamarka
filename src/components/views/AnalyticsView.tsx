"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/common/StatCard';
import ActiveRouteIndicator from '@/components/common/ActiveRouteIndicator';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  CloudRain,
  Activity,
  Truck,
  TrendingUp,
  Navigation,
  IndianRupee,
} from 'lucide-react';

export default function AnalyticsView() {
  const { currentRouteResult, routeAnalytics, t } = useApp();

  const ra = routeAnalytics;

  // Lightweight chart data
  const monthlyDeliveries = [
    { month: 'Apr', completed: 420, delayed: 32 },
    { month: 'May', completed: 480, delayed: 45 },
    { month: 'Jun', completed: 530, delayed: 68 }, // monsoon peak
    { month: 'Jul', completed: 510, delayed: 74 },
    { month: 'Aug', completed: 590, delayed: 41 },
    { month: 'Sep', completed: 640, delayed: 28 },
  ];

  const vehicleFleetUsage = [
    { type: 'Mini Truck', percent: 92, count: '48 Active' },
    { type: 'Four Wheeler', percent: 84, count: '36 Active' },
    { type: 'Lorry (Heavy)', percent: 76, count: '24 Active' },
    { type: 'Express Bike', percent: 96, count: '55 Active' },
    { type: 'State Cargo Bus', percent: 68, count: '14 Active' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
            Regional Fleet Performance & Corridor Metrics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('analytics')}
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl mt-1">
          Summary of deliveries, seasonal weather impact delays, route score efficiency, and vehicle fleet utilization across Northeast states.
        </p>
      </div>

      {/* Active Route Corridor Banner */}
      <ActiveRouteIndicator />

      {/* Active Corridor Analytics Spotlight Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-md border border-indigo-700/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Active Corridor Performance Telemetry
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {ra.corridorName} ({ra.vehicleName})
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            Efficiency Score: {ra.efficiencyScore}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Real Road Distance</span>
            <span className="text-lg font-black text-white">{ra.distanceKm} km</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Calculated ETA</span>
            <span className="text-lg font-black text-cyan-300">{ra.eta}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Fuel / Transit Cost</span>
            <span className="text-lg font-black text-amber-300">₹{ra.fuelCost}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Total with Tolls</span>
            <span className="text-lg font-black text-emerald-300">₹{ra.estimatedCost}</span>
          </div>
        </div>
      </div>

      {/* Regional Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Deliveries"
          value="3,170"
          subtitle="96.2% on-schedule rate"
          icon={CheckCircle2}
          accentColor="green"
          badgeText="+12% this month"
        />
        <StatCard
          title="Delayed Deliveries"
          value="128"
          subtitle="Principally hill weather"
          icon={AlertCircle}
          accentColor="amber"
          badgeText="-4% reduction"
        />
        <StatCard
          title="Regional Efficiency"
          value="94.2%"
          subtitle="AI optimized routing"
          icon={Zap}
          accentColor="blue"
          badgeText="Optimal"
        />
        <StatCard
          title="Avg Vehicle Utilization"
          value="88.5%"
          subtitle="185 active vehicles"
          icon={Truck}
          accentColor="purple"
          badgeText="High Fleet Demand"
        />
      </div>

      {/* Delay Factor Split & Monthly Deliveries Visual Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Delivery Trend (Lightweight CSS SVG Bars) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Freight Volume</h3>
              <p className="text-xs text-slate-500">Completed shipments vs seasonal delays</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                <span className="text-slate-600 font-medium">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-400 inline-block" />
                <span className="text-slate-600 font-medium">Weather Delay</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="space-y-3 pt-2">
            {monthlyDeliveries.map((item) => (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.month}</span>
                  <span className="text-slate-500 font-normal">
                    {item.completed} completed • {item.delayed} delays
                  </span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full rounded-l-full transition-all duration-500"
                    style={{ width: `${(item.completed / 700) * 100}%` }}
                  />
                  <div
                    className="bg-rose-400 h-full rounded-r-full transition-all duration-500"
                    style={{ width: `${(item.delayed / 700) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Delay Factor Distribution & Fleet Usage */}
        <div className="lg:col-span-5 space-y-5">
          {/* Delay Factor Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Corridor Transit Delay Factors</h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-600" /> Weather & Monsoon Inundation
                  </span>
                  <span className="text-cyan-700 font-bold">{ra.delayFactorWeather}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${ra.delayFactorWeather}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600" /> Mountain Convoy & Traffic Density
                  </span>
                  <span className="text-amber-700 font-bold">{ra.delayFactorTraffic}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${ra.delayFactorTraffic}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Slope Hazards & Detours
                  </span>
                  <span className="text-rose-700 font-bold">{ra.delayFactorTerrain}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${ra.delayFactorTerrain}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Utilization Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Vehicle Fleet Utilization Rate</h3>
            <div className="space-y-2 text-xs">
              {vehicleFleetUsage.map((v) => (
                <div key={v.type} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">{v.type}</p>
                    <p className="text-[10px] text-slate-500">{v.count}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-purple-700 text-sm">{v.percent}%</span>
                    <span className="block text-[10px] text-slate-400">deployed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
