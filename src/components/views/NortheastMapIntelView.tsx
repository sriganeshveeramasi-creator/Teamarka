"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { NORTHEAST_STATES } from '@/data/northeastData';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import ActiveRouteIndicator from '@/components/common/ActiveRouteIndicator';
import {
  Map,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  MapPin,
  Building,
  Navigation2,
  ShieldAlert,
} from 'lucide-react';

export default function NortheastMapIntelView() {
  const { currentRouteResult, t } = useApp();

  const [selectedState, setSelectedState] = useState<string>(currentRouteResult?.destState || 'Assam');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kamrup Metro');
  const [selectedLocality, setSelectedLocality] = useState<string>('Guwahati City Center');
  const [zoomLevel, setZoomLevel] = useState<'state' | 'district' | 'local'>('district');

  // Synchronize state when active route changes
  useEffect(() => {
    if (currentRouteResult?.destState) {
      const sName = currentRouteResult.destState;
      setSelectedState(sName);
      const target = NORTHEAST_STATES.find((s) => s.name === sName);
      if (target && target.cities.length > 0) {
        const destCityObj = target.cities.find((c) => c.name.toLowerCase() === currentRouteResult.destCity.toLowerCase());
        const city = destCityObj || target.cities[0];
        setSelectedDistrict(city.district);
        setSelectedLocality(`${city.name} Hub`);
      }
    }
  }, [currentRouteResult.routeId]);

  const activeStateObj = NORTHEAST_STATES.find((s) => s.name === selectedState) || NORTHEAST_STATES[0];

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const target = NORTHEAST_STATES.find((s) => s.name === stateName);
    if (target && target.cities.length > 0) {
      setSelectedDistrict(target.cities[0].district);
      setSelectedLocality(`${target.cities[0].name} Hub`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
            Geospatial Hierarchy Explorer
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('northeastMap')}
        </h1>
        <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl mt-1">
          Deep zoom analytics across 8 states. View state boundaries, district subdivisions, arterial highways, and localized logistics facilities.
        </p>
      </div>

      {/* Active Route Corridor Banner */}
      <ActiveRouteIndicator />

      {/* Cascading Regional Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Geographic Hierarchy Navigation:</span>
          </div>

          {/* Zoom Tier Buttons */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setZoomLevel('state')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                zoomLevel === 'state'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. State Tier
            </button>
            <button
              onClick={() => setZoomLevel('district')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                zoomLevel === 'district'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. District & Towns
            </button>
            <button
              onClick={() => setZoomLevel('local')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                zoomLevel === 'local'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              3. Local Roads & Facilities
            </button>
          </div>
        </div>

        {/* 3 Dropdown Selectors: State -> District -> Locality */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
              Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {NORTHEAST_STATES.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} (Capital: {s.capital})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
              Select District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {activeStateObj.cities.map((c) => (
                <option key={c.district} value={c.district}>
                  {c.district} District
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
              Select Locality / Transit Node
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {activeStateObj.cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} Hub & Freight Depot
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Display Canvas */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold text-slate-800">
              Active Focus: {selectedLocality}, {selectedDistrict}, {selectedState} • Active Corridor: {currentRouteResult.sourceCity} ➔ {currentRouteResult.destCity}
            </span>
          </div>

          <span className="text-slate-500 text-[11px]">
            Showing layer at {zoomLevel.toUpperCase()} scale
          </span>
        </div>

        <NortheastInteractiveMap
          highlightRoute={true}
          zoomLevel={zoomLevel}
          heightClass="h-[480px] sm:h-[580px]"
        />
      </div>
    </div>
  );
}
