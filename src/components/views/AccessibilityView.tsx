"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ACCESSIBILITY_SERVICES, AccessibilityFacility } from '@/data/mockLogistics';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import { searchFacilitiesNearRoute } from '@/utils/corridorGeo';
import {
  MapPin,
  Hospital,
  Fuel,
  Warehouse,
  Coffee,
  Wrench,
  Shield,
  Train,
  Clock,
  Phone,
  Search,
  X,
  Navigation,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  'All Services',
  'Hospital',
  'Fuel Station',
  'Warehouse',
  'Rest Area',
  'Vehicle Repair',
  'Emergency Services',
];

const PRESET_ROUTES = [
  { label: 'Jowai → Dimapur', source: 'Jowai', dest: 'Dimapur', isCurrentLocation: false },
  { label: 'Guwahati → Imphal', source: 'Guwahati', dest: 'Imphal', isCurrentLocation: false },
  { label: 'Shillong → Silchar', source: 'Shillong', dest: 'Silchar', isCurrentLocation: false },
  { label: 'Guwahati → Shillong', source: 'Guwahati', dest: 'Shillong', isCurrentLocation: false },
  { label: '📍 Use Current Location → Dimapur', source: 'Current Location', dest: 'Dimapur', isCurrentLocation: true },
];

const GPS_SIMULATION_STOPS = [
  { label: 'Point A (Shillong GPS)', coords: [25.5788, 91.8933] as [number, number], desc: 'NH-6 Meghalaya' },
  { label: 'Point B (Nongpoh GPS)', coords: [25.9037, 91.8812] as [number, number], desc: 'Ri-Bhoi Corridor' },
  { label: 'Point C (Sonapur GPS)', coords: [26.1150, 91.9750] as [number, number], desc: 'Assam Foothills' },
  { label: 'Point D (Nagaon Gateway)', coords: [26.3465, 92.6840] as [number, number], desc: 'Central Assam' },
  { label: 'Point E (Lumding Base)', coords: [25.8000, 93.1800] as [number, number], desc: 'Railway & Road Node' },
];

export default function AccessibilityView() {
  const { t, activeRoute, setRouteByCities } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Services');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<AccessibilityFacility | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Whenever the active route, category, or debounced search changes, reset selected facility and pagination
  useEffect(() => {
    setSelectedFacility(null);
    setVisibleCount(12);
  }, [activeRoute.id, selectedCategory, debouncedQuery]);

  // Dynamically filter places within 10 km of the authoritative active route geometry
  const filteredFacilities = useMemo(() => {
    return searchFacilitiesNearRoute(
      ACCESSIBILITY_SERVICES,
      activeRoute.geometry,
      selectedCategory,
      debouncedQuery,
      10.0 // Strict 10 KM max corridor radius
    );
  }, [activeRoute.geometry, selectedCategory, debouncedQuery]);

  const displayedFacilities = useMemo(() => {
    return filteredFacilities.slice(0, visibleCount);
  }, [filteredFacilities, visibleCount]);

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'Hospital':
        return Hospital;
      case 'Fuel Station':
        return Fuel;
      case 'Warehouse':
        return Warehouse;
      case 'Rest Area':
        return Coffee;
      case 'Vehicle Repair':
        return Wrench;
      case 'Emergency Services':
        return Shield;
      case 'Transport Hub':
        return Train;
      default:
        return MapPin;
    }
  };

  const handleRouteChange = (routeOption: (typeof PRESET_ROUTES)[0]) => {
    setRouteByCities(routeOption.source, routeOption.dest, routeOption.isCurrentLocation);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
            Critical Infrastructure & Highway Support Services
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          Corridor Facilities / All Services
        </h1>
        <p className="text-xs sm:text-sm text-purple-100 max-w-2xl mt-1">
          Quickly discover emergency trauma hospitals, fuel depots, heavy vehicle workshops, and transit rest facilities within a 10 km radius of your active route corridor.
        </p>

        {/* Active Route Corridor Bar */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-purple-100">Active Route:</span>
            <span className="font-extrabold text-white bg-white/20 px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1.5">
              <span>{activeRoute.source}</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-200" />
              <span>{activeRoute.destination}</span>
            </span>
            <span className="text-purple-200 hidden sm:inline">
              ({activeRoute.distanceKm} km • {activeRoute.eta})
            </span>
          </div>

          {/* Quick Route Switcher */}
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-1 rounded-xl text-[11px]">
            <span className="text-purple-200 font-semibold px-1 hidden md:inline">Change Corridor:</span>
            <select
              value={`${activeRoute.source}-${activeRoute.destination}`}
              onChange={(e) => {
                const opt = PRESET_ROUTES.find(
                  (r) => `${r.source}-${r.dest}` === e.target.value
                );
                if (opt) handleRouteChange(opt);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {PRESET_ROUTES.map((r) => (
                <option
                  key={`${r.source}-${r.dest}`}
                  value={`${r.source}-${r.dest}`}
                  className="text-slate-900 font-semibold"
                >
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live GPS Telemetry & Movement Simulator (When Current Location is Active) */}
        {activeRoute.isCurrentLocation && (
          <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-purple-100">
              <LocateFixed className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-bold">Live GPS Telemetry:</span>
              <span className="bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-md font-mono text-[11px] border border-emerald-400/30">
                {activeRoute.sourceCoords[0].toFixed(4)}° N, {activeRoute.sourceCoords[1].toFixed(4)}° E
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-purple-200 text-[11px] font-semibold">Move GPS Location:</span>
              {GPS_SIMULATION_STOPS.map((stop) => {
                const isCurrentStop =
                  Math.abs(activeRoute.sourceCoords[0] - stop.coords[0]) < 0.05 &&
                  Math.abs(activeRoute.sourceCoords[1] - stop.coords[1]) < 0.05;
                return (
                  <button
                    key={stop.label}
                    onClick={() => setRouteByCities('Current Location', activeRoute.destination, true, stop.coords)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      isCurrentStop
                        ? 'bg-emerald-400 text-slate-950 shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                    title={stop.desc}
                  >
                    {stop.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar (Far-Right Edge) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Search Bar at Far Right Edge */}
        <div className="relative shrink-0 md:w-72 lg:w-80">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search nearby places..."
              className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50 font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span className="font-semibold text-slate-700">
            {filteredFacilities.length} {filteredFacilities.length === 1 ? 'place' : 'places'} within 10 km corridor
          </span>
          {debouncedQuery && (
            <span className="text-purple-600 font-bold">
              • Matching &ldquo;{debouncedQuery}&rdquo;
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Sorted: Nearest from route → Farthest
        </span>
      </div>

      {/* Main Grid: Cards + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Facilities List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredFacilities.length === 0 ? (
            /* Empty State / Not Found */
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center text-xl">
                🔍
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  🔍 No places found within 10 km of this route.
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try another search or service category.
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs hover:bg-purple-200 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {displayedFacilities.map((fac) => {
                const Icon = getFacilityIcon(fac.type);
                const isSelected = selectedFacility?.id === fac.id;
                return (
                  <div
                    key={fac.id}
                    onClick={() => setSelectedFacility(fac)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-200 shadow-md'
                        : 'bg-white border-slate-200 hover:border-purple-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">{fac.name}</h3>
                          <p className="text-xs text-slate-500">{fac.location}</p>
                        </div>
                      </div>

                      <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-800 shrink-0">
                        {fac.type}
                      </span>
                    </div>

                    {/* 3 Stats: Dynamic Distance From Route + Est. Travel Time + Status */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Distance</span>
                        <span className="font-bold text-purple-700">
                          {fac.distanceFromRoute !== undefined ? `${fac.distanceFromRoute} km from route` : `${fac.distanceKm} km`}
                        </span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Est. Travel Time</span>
                        <span className="font-bold text-blue-600">{fac.travelTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Status</span>
                        <span className="font-bold text-emerald-600 truncate block">
                          {fac.status.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{fac.status}</span>
                      <a
                        href={`tel:${fac.phone}`}
                        className="flex items-center gap-1 font-bold text-purple-700 hover:underline shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{fac.phone}</span>
                      </a>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button if more results exist */}
              {filteredFacilities.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="w-full py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Load More Places ({filteredFacilities.length - visibleCount} remaining)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: Map Highlighting Facilities */}
        <div className="lg:col-span-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="font-bold text-slate-800">
                10 km Corridor Facilities Layer ({activeRoute.source} → {activeRoute.destination})
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">
              {filteredFacilities.length} Points Plotted
            </span>
          </div>

          <NortheastInteractiveMap
            highlightRoute={true}
            activeRouteGeometry={activeRoute.geometry}
            customFacilityMarkers={filteredFacilities}
            selectedFacilityId={selectedFacility?.id}
            onSelectFacility={setSelectedFacility}
            heightClass="h-[460px] sm:h-[540px]"
          />

          <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 flex items-center justify-between">
            <span>
              {selectedFacility
                ? `Focused: ${selectedFacility.name} (${selectedFacility.distanceFromRoute} km from active route)`
                : 'Click any card or map pin to view distance from route & call helpline.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
