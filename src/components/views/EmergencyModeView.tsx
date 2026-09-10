"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import ActiveRouteIndicator from '@/components/common/ActiveRouteIndicator';
import {
  AlertOctagon,
  PhoneCall,
  ShieldAlert,
  Hospital,
  Warehouse,
  Shield,
  Radio,
  ArrowRight,
  CheckCircle,
  Clock,
  Compass,
} from 'lucide-react';

export default function EmergencyModeView() {
  const { currentRouteResult, routeEmergencyData, toggleEmergencyMode, t } = useApp();
  const [sosSent, setSosSent] = useState(false);

  const handleBroadcastSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 3500);
  };

  const ed = routeEmergencyData;

  return (
    <div className="space-y-6">
      {/* High Alert Emergency Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 rounded-3xl text-white shadow-xl border-4 border-red-400/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md animate-pulse text-white">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 text-xs font-black uppercase tracking-wider">
                  CRITICAL INCIDENT ACTIVE
                </span>
                <span className="text-xs text-red-100 font-bold">• Priority 1 Rapid Response</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                🚨 {t('emergencyMode')} – Disaster Transit Command
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBroadcastSOS}
              disabled={sosSent}
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-red-50 text-red-700 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Radio className="w-4 h-4 text-red-600 animate-ping" />
              <span>{sosSent ? 'SOS BROADCAST DISPATCHED!' : 'BROADCAST SOS ALERT'}</span>
            </button>
            <button
              onClick={toggleEmergencyMode}
              className="px-4 py-2.5 rounded-2xl bg-black/30 hover:bg-black/40 text-white font-bold text-xs sm:text-sm border border-white/20 cursor-pointer"
            >
              Exit Emergency
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-red-100 leading-relaxed max-w-3xl">
          Terrain disruption alert active along {ed.corridorName}. Logistics emergency bypass routing is activated for medical and humanitarian relief convoys.
        </p>
      </div>

      {/* Active Route Corridor Banner */}
      <ActiveRouteIndicator />

      {/* Emergency Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Affected Area card */}
        <div className="bg-white p-5 rounded-3xl border border-red-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Affected Sector
            </span>
            <StatusBadge level={ed.severity} text="CRITICAL" size="sm" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{ed.affectedSector}</h3>
          <p className="text-xs text-slate-600">
            {ed.affectedDescription}
          </p>
        </div>

        {/* Blocked Roads & Detour card */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Emergency Detour Bypass
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Diverted
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{ed.bypassCorridor}</h3>
          <p className="text-xs text-slate-600">
            {ed.bypassDescription}
          </p>
        </div>

        {/* Nearest Hospital card */}
        <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nearest Trauma Center
            </span>
            <Hospital className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{ed.nearestHospital.name}</h3>
          <p className="text-xs text-slate-600">
            Distance: <span className="font-bold text-blue-600">{ed.nearestHospital.distanceKm} km</span> • ETA: {ed.nearestHospital.travelTime}. {ed.nearestHospital.status}
          </p>
        </div>

        {/* Nearest Relief Warehouse card */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Civil Relief Depot
            </span>
            <Warehouse className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{ed.reliefDepot.name}</h3>
          <p className="text-xs text-slate-600">
            Distance: <span className="font-bold text-emerald-600">{ed.reliefDepot.distanceKm} km</span> • {ed.reliefDepot.status}
          </p>
        </div>
      </div>

      {/* Emergency Map & Direct Hotlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Emergency Corridor Map */}
        <div className="lg:col-span-8 bg-white p-4 rounded-3xl border border-red-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="font-bold text-slate-900">
                Active Emergency Corridor Line: {currentRouteResult.sourceCity} ➔ {currentRouteResult.destCity}
              </span>
            </div>
            <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
              High Risk Alert Active
            </span>
          </div>

          <NortheastInteractiveMap
            highlightRoute={true}
            showAlternative={true}
            heightClass="h-[420px] sm:h-[480px]"
          />
        </div>

        {/* Right: Emergency Hotline & Rescue Contacts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-600" />
            <span>Emergency Dispatch Contacts</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200">
              <p className="font-bold text-red-900">National Emergency Toll-Free</p>
              <p className="text-2xl font-black text-red-600 mt-1">112 / 1070</p>
              <p className="text-[11px] text-red-700 mt-0.5">24/7 Integrated Police & Medical Dispatch</p>
            </div>

            {ed.hotlines.map((hl, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">{hl.title}</p>
                <p className="text-sm font-bold text-blue-700">{hl.number}</p>
                <p className="text-[11px] text-slate-500">{hl.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
