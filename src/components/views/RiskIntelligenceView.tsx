"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ACCESSIBILITY_SERVICES, AccessibilityFacility } from '@/data/mockLogistics';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import { searchFacilitiesNearRoute } from '@/utils/corridorGeo';
import {
  generateRiskRoutesForCorridor,
  RiskRoute,
  RouteRiskItem,
} from '@/utils/riskIntelligenceEngine';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  MapPin,
  Waves,
  Mountain,
  CloudRain,
  Eye,
  Construction,
  Filter,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  X,
  Search,
  Phone,
  CheckCircle2,
  Navigation,
  Compass,
  Layers,
  ShieldCheck,
  Activity,
  Car,
  Clock,
  Info,
} from 'lucide-react';

const SERVICE_CATEGORIES = [
  'All Services',
  'Hospital',
  'Fuel Station',
  'Warehouse',
  'Rest Area',
  'Vehicle Repair',
  'Emergency Services',
];

export default function RiskIntelligenceView() {
  const { t, activeRoute } = useApp();

  // Selected route state for detailed view (null = Route Selection Screen)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  // Filter severity state on detailed risk page
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Full screen map modal state
  const [isFullScreenMap, setIsFullScreenMap] = useState<boolean>(false);

  // Nearby places category & search state
  const [nearbyCategory, setNearbyCategory] = useState<string>('All Services');
  const [nearbySearchQuery, setNearbySearchQuery] = useState<string>('');
  const [debouncedNearbyQuery, setDebouncedNearbyQuery] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<AccessibilityFacility | null>(null);

  // Debounce search query (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedNearbyQuery(nearbySearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [nearbySearchQuery]);

  // Dynamically generate and rank 3 alternative routes based on current active route
  // Ordered strictly BEST -> WORST by overall risk score
  const routes: RiskRoute[] = useMemo(() => {
    return generateRiskRoutesForCorridor(
      activeRoute.source,
      activeRoute.destination,
      activeRoute.sourceCoords,
      activeRoute.destCoords
    );
  }, [activeRoute.source, activeRoute.destination, activeRoute.sourceCoords, activeRoute.destCoords]);

  // Reset selected route if active route corridor completely changes
  useEffect(() => {
    setSelectedRouteId(null);
    setSelectedFacility(null);
  }, [activeRoute.id]);

  // Active risk route when in detailed view
  const activeRiskRoute: RiskRoute | null = useMemo(() => {
    if (!selectedRouteId) return null;
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Filter risks by severity tab, strictly preserving DESCENDING order by percentage
  const displayedRisks: RouteRiskItem[] = useMemo(() => {
    if (!activeRiskRoute) return [];
    let list = [...activeRiskRoute.risks];
    if (filterSeverity !== 'ALL') {
      list = list.filter((r) => r.severity === filterSeverity);
    }
    // Strictly sort numerically descending: HIGHEST % -> LOWEST %
    list.sort((a, b) => b.percentage - a.percentage);
    return list;
  }, [activeRiskRoute, filterSeverity]);

  // Nearby facilities within 10 km corridor of active risk route
  // Strictly sorted: NEAREST -> FARTHEST
  const nearbyFacilities = useMemo(() => {
    if (!activeRiskRoute) return [];
    return searchFacilitiesNearRoute(
      ACCESSIBILITY_SERVICES,
      activeRiskRoute.geometry,
      nearbyCategory,
      debouncedNearbyQuery,
      10.0 // Strict 10 km corridor limit
    );
  }, [activeRiskRoute, nearbyCategory, debouncedNearbyQuery]);

  // Escape key handler for full-screen map modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreenMap(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Landslide':
        return Mountain;
      case 'Flood':
        return Waves;
      case 'Heavy Rain':
        return CloudRain;
      case 'Low Visibility':
        return Eye;
      case 'Bridge Restriction':
      case 'Road Blockage':
      case 'Poor Road Condition':
        return Construction;
      case 'Traffic':
        return Car;
      default:
        return AlertTriangle;
    }
  };

  // =========================================================================
  // VIEW 1: ROUTE SELECTION SCREEN ("Select Route for Risk Intelligence")
  // =========================================================================
  if (!activeRiskRoute) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 p-6 rounded-3xl text-white shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Corridor Hazard Evaluation & Safe Route Comparison
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Select Route for Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
            Compare multi-path safety indices for your active corridor from <span className="font-bold underline decoration-white/50">{activeRoute.source}</span> to <span className="font-bold underline decoration-white/50">{activeRoute.destination}</span>. Routes are ranked from safest (Best Route) to highest hazard.
          </p>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-2 text-xs font-semibold text-amber-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Corridor:</span>
            <span className="bg-white/20 px-2.5 py-1 rounded-xl text-white font-extrabold flex items-center gap-1.5">
              <span>{activeRoute.source}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
              <span>{activeRoute.destination}</span>
            </span>
            <span className="text-amber-200 hidden sm:inline">
              ({activeRoute.distanceKm} km • {activeRoute.eta})
            </span>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Available Routes for Risk Intelligence (Ordered Best → Worst)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            3 Evaluated Corridors
          </span>
        </div>

        {/* Route Cards Listed Vertically from TOP TO BOTTOM */}
        <div className="space-y-4">
          {routes.map((route) => {
            const isBest = route.isBest;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  isBest
                    ? 'bg-gradient-to-r from-emerald-50/60 to-white border-emerald-300 ring-2 ring-emerald-100 hover:border-emerald-400'
                    : route.routeNumber === 2
                    ? 'bg-gradient-to-r from-amber-50/40 to-white border-slate-200 hover:border-amber-300'
                    : 'bg-gradient-to-r from-rose-50/40 to-white border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Route Title & Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-xl font-black text-xs sm:text-sm bg-slate-900 text-white shadow-xs">
                        Route {route.routeNumber}
                      </span>

                      {isBest ? (
                        <span className="px-3 py-1 rounded-xl font-black text-xs bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Best Route (Safest)</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 border border-slate-200">
                          {route.tag}
                        </span>
                      )}

                      <span className="text-xs font-bold text-slate-700">
                        {route.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-lg sm:text-xl font-black text-slate-900">
                      <span>{route.source}</span>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                      <span>{route.destination}</span>
                    </div>

                    <p className="text-xs text-slate-600 max-w-2xl">
                      {route.rationale}
                    </p>
                  </div>

                  {/* Right: Key Metrics Bar */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center min-w-[105px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance & ETA</span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 block">
                        {route.distanceKm} km
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 block">
                        {route.eta}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-2xl border text-center min-w-[115px] ${
                      isBest
                        ? 'bg-emerald-50/80 border-emerald-200'
                        : route.routeNumber === 2
                        ? 'bg-amber-50/80 border-amber-200'
                        : 'bg-rose-50/80 border-rose-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Risk Score</span>
                      <span className={`text-lg sm:text-xl font-black block ${
                        isBest ? 'text-emerald-700' : route.routeNumber === 2 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {route.overallRiskScore}/100
                      </span>
                      <span className="text-[10px] font-extrabold uppercase">
                        Level: {route.overallRiskLevel}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center min-w-[125px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Major Risk</span>
                      <span className="text-xs font-black text-rose-600 block truncate max-w-[110px]">
                        {route.majorRisk.category}
                      </span>
                      <span className="text-xs font-black text-slate-900 block">
                        {route.majorRisk.percentage}% Index
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DETAILED RISK INTELLIGENCE VIEW FOR THE SELECTED ROUTE
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setSelectedRouteId(null)}
          className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>← Back to Route Selection</span>
        </button>

        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
          Active Route: Route {activeRiskRoute.routeNumber} ({activeRiskRoute.tag})
        </span>
      </div>

      {/* Dynamic Route Header */}
      <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 p-6 rounded-3xl text-white shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">
              RISK INTELLIGENCE REPORT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-white/20 font-black text-xs backdrop-blur-xs">
              Selected Route: Route {activeRiskRoute.routeNumber}
            </span>
            {activeRiskRoute.isBest && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs shadow-xs">
                ★ Safest Corridor
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {activeRiskRoute.source} → {activeRiskRoute.destination}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1 font-medium">
            {activeRiskRoute.name} • {activeRiskRoute.rationale}
          </p>
        </div>

        {/* 4 Dynamic Metrics Row */}
        <div className="pt-3 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Distance</span>
            <span className="text-base font-black text-white">{activeRiskRoute.distanceKm} km</span>
          </div>
          <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Estimated Travel Time</span>
            <span className="text-base font-black text-white">{activeRiskRoute.eta}</span>
          </div>
          <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Overall Risk Score</span>
            <span className="text-base font-black text-white">{activeRiskRoute.overallRiskScore}/100</span>
          </div>
          <div className="bg-white/15 backdrop-blur-xs p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Risk Level</span>
            <span className="text-base font-black text-white">{activeRiskRoute.overallRiskLevel}</span>
          </div>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Risks by Level:</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Hazards ({activeRiskRoute.risks.length})
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'HIGH'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            HIGH Risk
          </button>
          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'MEDIUM'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            MEDIUM Risk
          </button>
          <button
            onClick={() => setFilterSeverity('LOW')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'LOW'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            LOW Risk
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Risk Cards & 10 km Places | Right = Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk Cards Sorted HIGHEST % -> LOWEST % */}
        <div className="lg:col-span-6 space-y-6">
          {/* Risk Cards Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Route Hazards & Geotechnical Feeds
              </h3>
              <span className="text-[11px] font-bold text-rose-600">
                Sorted: Highest % → Lowest %
              </span>
            </div>

            <div className="space-y-3">
              {displayedRisks.map((risk) => {
                const Icon = getCategoryIcon(risk.category);
                return (
                  <div
                    key={risk.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-2xl ${
                            risk.severity === 'HIGH'
                              ? 'bg-rose-100 text-rose-600'
                              : risk.severity === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                            <span>{risk.category} Risk</span>
                          </h4>
                          <p className="text-xs text-slate-500">{risk.location}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-slate-900">{risk.percentage}%</span>
                        <div className="mt-0.5">
                          <StatusBadge level={risk.severity} size="sm" />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p>
                        <span className="font-semibold text-slate-700">Observation:</span> {risk.description}
                      </p>
                      <p>
                        <span className="font-semibold text-blue-700">Advisory:</span> {risk.advisory}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 10 KM Nearby Corridor Facilities Section */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>Nearby Places within 10 km of Route {activeRiskRoute.routeNumber}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Strict 10 km corridor buffer along the active route.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {nearbyFacilities.length} Places
              </span>
            </div>

            {/* Category Tabs + Search Bar */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNearbyCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                      nearbyCategory === cat
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Nearby Places */}
              <div className="relative">
                <input
                  type="text"
                  value={nearbySearchQuery}
                  onChange={(e) => setNearbySearchQuery(e.target.value)}
                  placeholder="🔍 Search nearby places (hospital, fuel, IOCL, mechanic)..."
                  className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 font-medium transition-all"
                />
                {nearbySearchQuery && (
                  <button
                    onClick={() => setNearbySearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Nearby Place Cards List (Sorted Nearest -> Farthest) */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {nearbyFacilities.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 text-center space-y-2 border border-slate-200">
                  <div className="text-2xl">🔍</div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                    🔍 No places found within 10 km of this route.
                  </h4>
                  <p className="text-xs text-slate-500">
                    Try another search or service category.
                  </p>
                </div>
              ) : (
                nearbyFacilities.map((fac) => (
                  <div
                    key={fac.id}
                    onClick={() => setSelectedFacility(fac)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      selectedFacility?.id === fac.id
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{fac.name}</h5>
                        <p className="text-[11px] text-slate-500">{fac.location}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0">
                        {fac.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] bg-white p-2 rounded-xl border border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Distance</span>
                        <span className="font-bold text-purple-700">
                          {fac.distanceFromRoute !== undefined ? `${fac.distanceFromRoute} km from route` : `${fac.distanceKm} km`}
                        </span>
                      </div>
                      <div className="border-x border-slate-100">
                        <span className="text-slate-400 block text-[9px]">ETA</span>
                        <span className="font-bold text-blue-600">{fac.travelTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Status</span>
                        <span className="font-bold text-emerald-600 truncate block">
                          {fac.status.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Route Interactive Map */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-bold text-slate-800">
                  Route {activeRiskRoute.routeNumber} Corridor Map ({activeRiskRoute.source} → {activeRiskRoute.destination})
                </span>
              </div>

              {/* Full-Screen Map Button */}
              <button
                type="button"
                onClick={() => setIsFullScreenMap(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
                title="Open Full Screen Map"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full-Screen Map</span>
              </button>
            </div>

            {/* Clickable Map Container */}
            <div
              onClick={() => setIsFullScreenMap(true)}
              className="cursor-pointer group relative"
              title="Click to expand full-screen map"
            >
              <div className="absolute top-3 right-3 z-[1000] bg-slate-900/80 hover:bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 shadow-md transition-all group-hover:scale-105">
                <Maximize2 className="w-3 h-3" />
                <span>Click to Expand Full-Screen</span>
              </div>

              <NortheastInteractiveMap
                highlightRoute={true}
                activeRouteGeometry={activeRiskRoute.geometry}
                customRiskMarkers={activeRiskRoute.mapRiskAlerts}
                customFacilityMarkers={nearbyFacilities}
                selectedFacilityId={selectedFacility?.id}
                onSelectFacility={setSelectedFacility}
                fitRouteGeometry={true}
                heightClass="h-[480px] sm:h-[560px]"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <span>
                {selectedFacility
                  ? `Selected: ${selectedFacility.name} (${selectedFacility.distanceFromRoute} km from Route ${activeRiskRoute.routeNumber})`
                  : `Displaying Route ${activeRiskRoute.routeNumber} path, hazard beacons, and 10 km corridor facilities.`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN MAP MODAL EXPERIENCE
          ========================================================================= */}
      {isFullScreenMap && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col p-2 sm:p-5 animate-in fade-in duration-200">
          <div className="flex-1 bg-white rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFullScreenMap(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>✕ Close Map</span>
                </button>

                <div className="hidden sm:block">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Route {activeRiskRoute.routeNumber}: {activeRiskRoute.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500">
                      Score: {activeRiskRoute.overallRiskScore}/100
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeRiskRoute.source} → {activeRiskRoute.destination} ({activeRiskRoute.distanceKm} km • {activeRiskRoute.eta})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-mono hidden md:inline">
                  {nearbyFacilities.length} Facilities • {activeRiskRoute.mapRiskAlerts.length} Hazard Beacons Plotted
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullScreenMap(false)}
                  className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                  title="Close Map (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Large Full Viewport Map */}
            <div className="flex-1 w-full relative">
              <NortheastInteractiveMap
                highlightRoute={true}
                activeRouteGeometry={activeRiskRoute.geometry}
                customRiskMarkers={activeRiskRoute.mapRiskAlerts}
                customFacilityMarkers={nearbyFacilities}
                selectedFacilityId={selectedFacility?.id}
                onSelectFacility={setSelectedFacility}
                fitRouteGeometry={true}
                heightClass="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
