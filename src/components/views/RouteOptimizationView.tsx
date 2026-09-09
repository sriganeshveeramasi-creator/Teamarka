"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { NORTHEAST_STATES, VEHICLE_OPTIONS } from '@/data/northeastData';
import GoogleStyleNavMap from '@/components/map/GoogleStyleNavMap';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Navigation,
  CheckCircle2,
  AlertCircle,
  Truck,
  Clock,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  FileText,
} from 'lucide-react';

export default function RouteOptimizationView() {
  const { currentRouteResult, calculateRoute, setActiveView, t } = useApp();

  const [sourceState, setSourceState] = useState<string>('Assam');
  const [sourceCity, setSourceCity] = useState<string>('Guwahati');
  const [destState, setDestState] = useState<string>('Manipur');
  const [destCity, setDestCity] = useState<string>('Imphal');
  const [vehicleId, setVehicleId] = useState<string>('mini_truck');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showAltRoute, setShowAltRoute] = useState<boolean>(false);

  // Cascading city options
  const sourceStateObj = NORTHEAST_STATES.find((s) => s.name === sourceState) || NORTHEAST_STATES[0];
  const destStateObj = NORTHEAST_STATES.find((s) => s.name === destState) || NORTHEAST_STATES[2];

  const handleSourceStateChange = (stateName: string) => {
    setSourceState(stateName);
    const targetState = NORTHEAST_STATES.find((s) => s.name === stateName);
    if (targetState && targetState.cities.length > 0) {
      setSourceCity(targetState.cities[0].name);
    }
  };

  const handleDestStateChange = (stateName: string) => {
    setDestState(stateName);
    const targetState = NORTHEAST_STATES.find((s) => s.name === stateName);
    if (targetState && targetState.cities.length > 0) {
      setDestCity(targetState.cities[0].name);
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      calculateRoute(sourceState, sourceCity, destState, destCity, vehicleId);
      setIsCalculating(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">
            Intelligent Hill Logistics Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('routeOptimization')}
        </h1>
        <p className="text-xs sm:text-sm text-cyan-100 max-w-2xl mt-1">
          Select your departure and arrival hubs in Northeast India. ARKA AI evaluates slope gradients, traffic density, toll stations, and landslide vulnerabilities.
        </p>
      </div>

      {/* Main Grid: Form + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cascading Selection Form */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Route Parameters</span>
            </h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Cascading Selectors
            </span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            {/* SOURCE SELECTION */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Source Location (Origin)</span>
              </div>

              {/* Source State */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {t('sourceState')}
                </label>
                <select
                  value={sourceState}
                  onChange={(e) => handleSourceStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NORTHEAST_STATES.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source City */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {t('sourceCity')}
                </label>
                <select
                  value={sourceCity}
                  onChange={(e) => setSourceCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sourceStateObj.cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name} ({city.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DESTINATION SELECTION */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Destination Location</span>
              </div>

              {/* Destination State */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {t('destState')}
                </label>
                <select
                  value={destState}
                  onChange={(e) => handleDestStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NORTHEAST_STATES.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination City */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {t('destCity')}
                </label>
                <select
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {destStateObj.cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name} ({city.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* VEHICLE SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                <span>{t('selectVehicle')}</span>
                <span className="text-[11px] text-slate-500 font-normal">8 Vehicle Classes</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VEHICLE_OPTIONS.map((v) => {
                  const isSelected = vehicleId === v.id;
                  return (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setVehicleId(v.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-xs">{v.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{v.capacity}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FIND BEST ROUTE Button */}
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:opacity-95 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75"
            >
              {isCalculating ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>{t('findBestRoute')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: AI Route Analysis Results & Map */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Result Header Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {t('recommendedRoute')}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {currentRouteResult.sourceCity} ({currentRouteResult.sourceState}) ➔{' '}
                  {currentRouteResult.destCity} ({currentRouteResult.destState})
                </h2>
                <p className="text-xs text-slate-500">
                  Vehicle: <span className="font-semibold text-slate-700">{currentRouteResult.vehicle.name}</span> ({currentRouteResult.vehicle.capacity})
                </p>
              </div>

              {/* Route Score Badge */}
              <div className="text-right bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-2 rounded-2xl border border-emerald-200">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                  {t('routeScore')}
                </p>
                <p className="text-2xl font-black text-emerald-800">
                  {currentRouteResult.routeScore}/100
                </p>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 font-medium">Distance & ETA</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {currentRouteResult.distanceKm} km
                </p>
                <p className="text-[11px] font-semibold text-blue-600">{currentRouteResult.eta}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 font-medium">{t('trafficLevel')}</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                  {currentRouteResult.trafficPercent}%
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentRouteResult.trafficSignalsCount} Signals En Route
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 font-medium">{t('tollGates')}</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {currentRouteResult.tollGatesCount} Gates
                </p>
                <p className="text-[11px] font-semibold text-blue-700">
                  ₹{currentRouteResult.tollCost} Total Toll
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 font-medium">{t('estimatedCost')}</span>
                <p className="text-sm font-bold text-purple-700 mt-0.5">
                  ₹{currentRouteResult.estimatedCost}
                </p>
                <p className="text-[11px] text-slate-500">Fuel + Tolls Incl.</p>
              </div>
            </div>

            {/* Risk & Accessibility Status Badges */}
            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">{t('landslideRisk')}:</span>
                <StatusBadge level={currentRouteResult.landslideRisk} size="sm" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">{t('floodRisk')}:</span>
                <StatusBadge level={currentRouteResult.floodRisk} size="sm" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">{t('roadAccessibility')}:</span>
                <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  {currentRouteResult.accessibilityScore}%
                </span>
              </div>
            </div>

            {/* AI Explanation Box */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>ARKA AI Route Selection Rationale:</span>
              </div>
              <p className="leading-relaxed font-medium">
                &ldquo;{currentRouteResult.reasoning}&rdquo;
              </p>
            </div>

            {/* Alternative Route Toggle Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAltRoute(!showAltRoute)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  showAltRoute
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {showAltRoute ? '✕ Hide Alternative Route' : '🔀 Show Alternative Route (NH-37)'}
              </button>

              <button
                onClick={() => setActiveView('arka-assistant')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Ask ARKA Assistant about this route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alternative Route Comparison card if active */}
            {showAltRoute && (
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">
                    Alternative: NH-37 Southern Hill Bypass (Silchar Corridor)
                  </span>
                  <StatusBadge level="MEDIUM" text="58% Traffic" size="sm" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-slate-700">
                  <div>Distance: <span className="font-semibold">535 km (+50 km)</span></div>
                  <div>ETA: <span className="font-semibold">13 hrs 45 mins</span></div>
                  <div>Landslide: <span className="font-semibold text-amber-700">Moderate Alert</span></div>
                </div>
                <p className="text-[11px] text-amber-800 italic">
                  Note: Recommended for light cargo when NH-27 experiences rockfall clearance maintenance.
                </p>
              </div>
            )}
          </div>

          {/* Google Maps-Style Live Navigation Map */}
          <GoogleStyleNavMap
            routeResult={currentRouteResult}
            showAlternativeRoute={showAltRoute}
            onToggleAlternative={() => setShowAltRoute(!showAltRoute)}
            heightClass="h-[460px] sm:h-[540px]"
          />
        </div>
      </div>
    </div>
  );
}
