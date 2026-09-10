"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navigation, ArrowRight, Truck, Clock, IndianRupee } from 'lucide-react';

interface ActiveRouteIndicatorProps {
  compact?: boolean;
}

export default function ActiveRouteIndicator({ compact = false }: ActiveRouteIndicatorProps) {
  const { currentRouteResult, setActiveView } = useApp();

  if (!currentRouteResult) return null;

  const { sourceCity, sourceState, destCity, destState, distanceKm, eta, vehicle, estimatedCost } =
    currentRouteResult;

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-blue-50/90 border border-blue-200/80 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 font-medium text-blue-900 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-bold">{sourceCity}</span>
          <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
          <span className="font-bold">{destCity}</span>
          <span className="text-blue-700/70 ml-1">
            ({distanceKm} km • {eta})
          </span>
        </div>
        <button
          onClick={() => setActiveView('route-opt')}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline shrink-0 cursor-pointer"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-blue-800/60 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-cyan-300 border border-blue-400/30">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 block leading-tight">
              Global Active Corridor
            </span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
              <span>{sourceCity}</span>
              <span className="text-slate-400 font-normal text-[11px]">({sourceState})</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{destCity}</span>
              <span className="text-slate-400 font-normal text-[11px]">({destState})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10">
          <span className="font-bold text-cyan-200">{distanceKm} km</span>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1 font-semibold text-slate-200">
            <Clock className="w-3 h-3 text-emerald-400" />
            {eta}
          </span>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1 font-semibold text-slate-200">
            <Truck className="w-3 h-3 text-blue-300" />
            {vehicle?.name || 'Mini Truck'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-bold text-amber-300">₹{estimatedCost}</span>
        </div>
      </div>

      <button
        onClick={() => setActiveView('route-opt')}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
      >
        <span>Change Route</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
