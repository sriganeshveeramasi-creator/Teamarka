"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import StatCard from '@/components/common/StatCard';
import { TRAFFIC_SIGNALS, TOLL_GATES } from '@/data/northeastData';
import {
  Activity,
  AlertTriangle,
  Radio,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function TrafficIntelligenceView() {
  const { setActiveView, t } = useApp();
  const [selectedCorridor, setSelectedCorridor] = useState('Guwahati ⇄ Imphal');

  const corridors = [
    {
      id: 'c1',
      name: 'Guwahati ⇄ Imphal (NH-27 / NH-29)',
      density: 34,
      status: 'Normal Flow',
      level: 'LOW' as const,
      avgSpeed: '52 km/h',
      signals: 8,
      delay: '0 mins',
      bottleneck: 'Minor slow-down at Khanapara',
    },
    {
      id: 'c2',
      name: 'Guwahati ⇄ Shillong (NH-106)',
      density: 46,
      status: 'Moderate Flow',
      level: 'MEDIUM' as const,
      avgSpeed: '42 km/h',
      signals: 4,
      delay: '+12 mins',
      bottleneck: 'Jorabat Hill Incline truck queue',
    },
    {
      id: 'c3',
      name: 'Dimapur ⇄ Kohima (NH-29 Hill Pass)',
      density: 72,
      status: 'Heavy Congestion',
      level: 'HIGH' as const,
      avgSpeed: '28 km/h',
      signals: 2,
      delay: '+35 mins',
      bottleneck: 'Single-lane roadworks km 14',
    },
    {
      id: 'c4',
      name: 'Kaziranga Corridor (NH-37)',
      density: 38,
      status: 'Regulated Speed',
      level: 'MEDIUM' as const,
      avgSpeed: '40 km/h',
      signals: 3,
      delay: '+8 mins',
      bottleneck: 'Wildlife sanctuary 40 km/h speed cap',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-5 sm:p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
            Real-Time Telemetry & Corridor Density
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('traffic')}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
          Live traffic density indices, signal wait times, toll plaza throughput, and congestion monitors across Northeast national highways.
        </p>
      </div>

      {/* 4 Traffic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Overall Grid Flow"
          value="78%"
          subtitle="Clear passage on major NH"
          icon={Activity}
          accentColor="green"
          badgeText="Normal"
        />
        <StatCard
          title="Active Congestion Hotspots"
          value="2"
          subtitle="Dimapur & Shillong Bypass"
          icon={AlertTriangle}
          accentColor="amber"
          badgeText="Monitored"
        />
        <StatCard
          title="Avg Corridor Speed"
          value="48 km/h"
          subtitle="Mountain & plain composite"
          icon={TrendingUp}
          accentColor="blue"
          badgeText="Optimal"
        />
        <StatCard
          title="Operational Toll Plazas"
          value="14 / 14"
          subtitle="100% FASTag automated"
          icon={CheckCircle2}
          accentColor="purple"
          badgeText="Open"
        />
      </div>

      {/* Corridor Density Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Key Highway Freight Corridors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {corridors.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {c.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Speed: <span className="font-semibold text-slate-700">{c.avgSpeed}</span> • Delay: <span className="font-semibold text-rose-600">{c.delay}</span>
                  </p>
                </div>
                <StatusBadge level={c.level} text={`${c.density}% Density`} size="sm" />
              </div>

              {/* Density Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Traffic Load</span>
                  <span>{c.density}% capacity</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.level === 'HIGH' ? 'bg-rose-500' : c.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${c.density}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{c.bottleneck}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Signals & Tolls + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left: Live Signals & Toll Plaza Feeds */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          {/* Live Signals Box */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚦</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Live Highway Traffic Signals
                  </h3>
                  <p className="text-[11px] text-slate-500">Real-time intersection light cycles</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Sensor Sync
              </span>
            </div>

            <div className="space-y-2.5">
              {TRAFFIC_SIGNALS.map((sig) => (
                <div
                  key={sig.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{sig.name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{sig.location}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          sig.status === 'green'
                            ? 'bg-emerald-500 ring-2 ring-emerald-200 animate-pulse'
                            : sig.status === 'yellow'
                            ? 'bg-amber-500 ring-2 ring-amber-200'
                            : 'bg-rose-500 ring-2 ring-rose-200'
                        }`}
                      />
                      <span className="font-bold uppercase text-[11px] text-slate-700">{sig.status}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Cycle: ~{sig.durationSec}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toll Plazas Box */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛣️</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Northeast Toll Plazas
                  </h3>
                  <p className="text-[11px] text-slate-500">FASTag lane throughput & fee schedules</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('route-opt')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <span>Toll Calculator</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {TOLL_GATES.map((toll) => (
                <div
                  key={toll.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{toll.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Corridor: <span className="font-semibold text-blue-700">{toll.highway}</span> • {toll.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-blue-700 text-sm sm:text-base">₹{toll.cost}</span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Standard Fee</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive Corridor Map with Traffic Highlighted */}
        <div className="lg:col-span-6 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800">Corridor Traffic Simulation</span>
            </div>
            <span className="text-slate-400 text-[11px] font-mono">Sensors: Live</span>
          </div>

          <NortheastInteractiveMap
            highlightRoute={true}
            externalShowTraffic={true}
            externalShowSignals={true}
            externalShowTolls={true}
            externalShowRisks={false}
            heightClass="h-[360px] sm:h-[460px] lg:h-[540px]"
          />

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
            <p className="leading-tight">
              Traffic speed sensors continuously report corridor conditions to optimize AI vehicle routes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
