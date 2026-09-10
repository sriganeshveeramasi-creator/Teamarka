"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import {
  Truck,
  CloudRain,
  Activity,
  AlertTriangle,
  Clock,
  IndianRupee,
  Navigation,
  Wind,
  Droplets,
  Eye,
  ShieldCheck,
  Radio,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardView() {
  const { setActiveView, t, user } = useApp();
  const [showAltRoute, setShowAltRoute] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 p-6 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              Live Command Center
            </span>
            <span className="text-cyan-200 text-xs">• Real-time Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Northeast AI Logistics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100 max-w-2xl mt-1">
            Active monitoring across Guwahati-Shillong-Dimapur-Kohima-Imphal supply corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('route-opt')}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm shadow-sm hover:bg-cyan-50 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>AI Route Planner</span>
          </button>
          <button
            onClick={() => setActiveView('arka-assistant')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/30 border border-white/30 text-white font-bold text-xs sm:text-sm hover:bg-cyan-500/40 backdrop-blur-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Ask ARKA AI</span>
          </button>
        </div>
      </div>

      {/* Authenticated User Session Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'NE'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Welcome back, {user?.name || 'Logistics Officer'}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  user?.role === 'admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : user?.role === 'officer'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {user?.role ? `${user.role.toUpperCase()} ACCESS` : 'VERIFIED USER'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Account: <span className="font-mono text-slate-700 font-semibold">{user?.email || user?.phone || 'admin@arka-ne.gov.in'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Last Login Activity</span>
            <span className="font-semibold text-slate-700">
              {user?.lastLogin
                ? new Date(user.lastLogin).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'Current Active Session'}
            </span>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Core Information Stat Cards: [Weather] [Traffic] [Shipments] [Risks] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Weather */}
        <StatCard
          title={t('presentWeather')}
          value="26°C"
          subtitle="Mild monsoon showers"
          icon={CloudRain}
          accentColor="cyan"
          badgeText="Wet Track"
          onClick={() => setActiveView('weather')}
        />
        {/* 2. Traffic */}
        <StatCard
          title={t('presentTraffic')}
          value="72%"
          subtitle="Heavy: Dimapur-Kohima"
          icon={Activity}
          accentColor="amber"
          badgeText="Moderate Congestion"
          onClick={() => setActiveView('traffic')}
        />
        {/* 3. Shipments */}
        <StatCard
          title={t('activeShipments')}
          value="24"
          subtitle="4 in mountain transit"
          icon={Truck}
          accentColor="blue"
          badgeText="100% On-Grid"
          onClick={() => setActiveView('tracking')}
        />
        {/* 4. Risks */}
        <StatCard
          title={t('activeRisks')}
          value="4"
          subtitle="1 High: Dima Hasao"
          icon={AlertTriangle}
          accentColor="red"
          badgeText="Action Required"
          onClick={() => setActiveView('risks')}
        />
      </div>

      {/* Secondary Efficiency Strip: ETA & Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          title={t('averageETA')}
          value="4.2 hrs"
          subtitle="Within 12m margin across hilly corridors"
          icon={Clock}
          accentColor="green"
          badgeText="94% Efficiency"
          onClick={() => setActiveView('route-opt')}
        />
        <StatCard
          title={t('estimatedCost')}
          value="₹3,450"
          subtitle="Avg fuel + tolls optimized per transit"
          icon={IndianRupee}
          accentColor="purple"
          badgeText="Optimized"
          onClick={() => setActiveView('route-opt')}
        />
      </div>

      {/* Main Interactive Map Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Large Vector Digital Map Canvas */}
        <div className="xl:col-span-8 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Primary Corridor: Guwahati (Assam) ⇄ Imphal (Manipur)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Traffic status, real-time signal timers & toll gate plaza monitoring
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAltRoute(!showAltRoute)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showAltRoute
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {showAltRoute ? 'Hide Alt Route' : 'Show Alt NH-37 Route'}
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <NortheastInteractiveMap
            highlightRoute={true}
            showAlternative={showAltRoute}
            activeShipmentPoint={{ x: 405, y: 340, label: 'ARKA-AS-9021 (Dimapur)' }}
            heightClass="h-[380px] sm:h-[460px]"
          />

          {/* Map Overlay Key Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            {/* Traffic Signal box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>🚦 Live Traffic Signals</span>
              </p>
              <div className="space-y-0.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Khanapara Junction:</span>
                  <span className="font-semibold text-emerald-600">30 sec</span>
                </div>
                <div className="flex justify-between">
                  <span>Jorabat Intersection:</span>
                  <span className="font-semibold text-amber-600">45 sec</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimapur Rail Gate:</span>
                  <span className="font-semibold text-emerald-600">20 sec</span>
                </div>
              </div>
            </div>

            {/* Toll Gates box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>🛣️ Toll Gates Along Route</span>
              </p>
              <div className="space-y-0.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Madanpur Plaza:</span>
                  <span className="font-semibold text-blue-700">₹120</span>
                </div>
                <div className="flex justify-between">
                  <span>Nazirakhat Plaza:</span>
                  <span className="font-semibold text-blue-700">₹85</span>
                </div>
                <div className="flex justify-between">
                  <span>Manderdisa Plaza:</span>
                  <span className="font-semibold text-blue-700">₹95</span>
                </div>
              </div>
            </div>

            {/* Road status box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>⚠️ Corridor Advisories</span>
              </p>
              <div className="space-y-0.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Dima Hasao Hill:</span>
                  <StatusBadge level="HIGH" text="Landslide" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span>Kaziranga NH-37:</span>
                  <StatusBadge level="MEDIUM" text="40 km/h" size="sm" />
                </div>
                <div className="flex justify-between">
                  <span>Saraighat Bridge:</span>
                  <StatusBadge level="MEDIUM" text="&lt;15 Ton" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Present Weather & Fast Action Panel */}
        <div className="xl:col-span-4 space-y-5">
          {/* Weather Widget */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Present Weather</h3>
                  <p className="text-[11px] text-slate-500">Guwahati & Hill Corridors</p>
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">26°C</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <p className="text-[10px] text-slate-500">Rainfall</p>
                <p className="font-bold text-slate-800">4.2 mm/hr</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <Wind className="w-4 h-4 mx-auto text-cyan-500 mb-1" />
                <p className="text-[10px] text-slate-500">Wind</p>
                <p className="font-bold text-slate-800">14 km/h</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <Eye className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <p className="text-[10px] text-slate-500">Visibility</p>
                <p className="font-bold text-slate-800">3.8 km</p>
              </div>
            </div>

            {/* Weather Warning Box */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Weather Logistics Impact Alert</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Intermittent showers between Sonapur and Nagaon. Expected transit delay of ~18 minutes for heavy vehicles.
              </p>
            </div>
          </div>

          {/* Quick AI Route Recommendations Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-3xl border border-blue-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-blue-950">Recommended Route</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Route Score: 92/100
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-blue-100/60">
                <span className="text-slate-500">Route:</span>
                <span className="font-semibold text-slate-900">NH-27 ➔ NH-29 Eastern Spine</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-100/60">
                <span className="text-slate-500">Distance & ETA:</span>
                <span className="font-semibold text-slate-900">485 km • ~11 hrs 30 mins</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-100/60">
                <span className="text-slate-500">Traffic Density:</span>
                <span className="font-semibold text-emerald-700">34% (Low)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Road Accessibility:</span>
                <span className="font-semibold text-blue-700">91% Accessible</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 italic bg-white/70 p-2.5 rounded-xl border border-blue-100">
              &ldquo;ARKA selected this route because it has lower traffic, lower risk and better accessibility for the selected vehicle.&rdquo;
            </p>

            <button
              onClick={() => setActiveView('route-opt')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Customize Route & Vehicle</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
