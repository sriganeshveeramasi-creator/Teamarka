"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  generateRiskRoutes,
  RiskRouteOption,
  RiskRouteAlert,
  NearbyPlaceItem,
} from '@/services/riskRouteService';
import RiskInteractiveMap from '@/components/map/RiskInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import ActiveRouteIndicator from '@/components/common/ActiveRouteIndicator';
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
  Search,
  CheckCircle2,
  Maximize2,
  Phone,
  Clock,
  Navigation,
  Sparkles,
  Layers,
  Hospital,
  Fuel,
  Wrench,
  Building,
  Coffee,
  AlertOctagon,
} from 'lucide-react';

export default function RiskIntelligenceView() {
  const { currentRouteResult, t } = useApp();

  // Selected route state: null means show the Route Selection screen (Req #1)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [placeCategoryFilter, setPlaceCategoryFilter] = useState<string>('ALL');
  const [placeSearchQuery, setPlaceSearchQuery] = useState<string>('');
  const [focusedPlace, setFocusedPlace] = useState<NearbyPlaceItem | null>(null);

  // Generate ranked routes (Ordered BEST -> WORST, Req #2)
  const rankedRoutes = useMemo(() => {
    return generateRiskRoutes(currentRouteResult);
  }, [currentRouteResult.routeId, currentRouteResult.distanceKm]);

  // Reset to Route Selection screen if the global search changes (Req #25 & #26 Test 8)
  useEffect(() => {
    setSelectedRouteId(null);
    setFocusedPlace(null);
  }, [currentRouteResult.routeId]);

  // Authoritative active risk route
  const activeRiskRoute = useMemo(() => {
    if (!selectedRouteId) return null;
    return rankedRoutes.find((r) => r.id === selectedRouteId) || rankedRoutes[0];
  }, [selectedRouteId, rankedRoutes]);

  // Filtered risks for the active route (Req #6 & #7: ALWAYS sorted HIGH % -> LOW %)
  const displayRisks = useMemo(() => {
    if (!activeRiskRoute) return [];
    let list = [...activeRiskRoute.risks];
    if (filterSeverity !== 'ALL') {
      list = list.filter((r) => r.severity === filterSeverity);
    }
    // Strictly sort numerically HIGH % to LOW % (Req #7)
    return list.sort((a, b) => b.percentage - a.percentage);
  }, [activeRiskRoute, filterSeverity]);

  // Filtered & searched nearby places strictly within 10 km corridor (Req #14, #15, #16, #17)
  const filteredNearbyPlaces = useMemo(() => {
    if (!activeRiskRoute) return [];
    let list = [...activeRiskRoute.nearbyPlaces];

    // Category filter
    if (placeCategoryFilter !== 'ALL') {
      list = list.filter((p) => p.category === placeCategoryFilter);
    }

    // Search query filter (Req #17)
    if (placeSearchQuery.trim()) {
      const q = placeSearchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    // Strictly sort NEAREST -> FARTHEST (Req #16)
    return list.sort((a, b) => a.distanceFromRouteKm - b.distanceFromRouteKm);
  }, [activeRiskRoute, placeCategoryFilter, placeSearchQuery]);

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
      default:
        return AlertTriangle;
    }
  };

  const getPlaceIcon = (cat: string) => {
    switch (cat) {
      case 'Hospital':
        return Hospital;
      case 'Fuel Station':
        return Fuel;
      case 'Vehicle Repair':
        return Wrench;
      case 'Warehouse':
        return Building;
      case 'Rest Area':
        return Coffee;
      case 'Emergency Services':
        return AlertOctagon;
      default:
        return MapPin;
    }
  };

  // =========================================================================
  // SCREEN 1: ROUTE SELECTION SCREEN (Req #1, #2, #3)
  // Displayed when user opens Risk Intelligence before selecting a specific route
  // =========================================================================
  if (!activeRiskRoute) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 p-6 rounded-3xl text-white shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Hazard Mitigation & Safe Transit Feeds
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Select Route for Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
            Choose one of the ranked corridor routes connecting{' '}
            <span className="font-semibold text-white">
              {currentRouteResult.isCurrentLocation
                ? currentRouteResult.currentLocationCoords?.label || 'Current GPS Location'
                : currentRouteResult.sourceVillage || currentRouteResult.sourceCity}
            </span>{' '}
            and{' '}
            <span className="font-semibold text-white">
              {currentRouteResult.destVillage || currentRouteResult.destCity}
            </span>{' '}
            to inspect localized terrain hazards and 10 km corridor emergency facilities.
          </p>
        </div>

        {/* Active Route Corridor Banner */}
        <ActiveRouteIndicator />

        {/* Ranking Explanation Subheader (Req #2) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">
              Corridor Alternatives Ranked: BEST ➔ SECOND BEST ➔ THIRD BEST
            </span>
          </div>
          <span className="text-slate-500 font-medium">
            Ranked by overall geomorphic safety score (Lower Overall Risk = Higher Safety)
          </span>
        </div>

        {/* Vertical Route List (Top to Bottom, Req #1 & #3) */}
        <div className="space-y-4">
          {rankedRoutes.map((routeOption) => {
            const isBest = routeOption.routeNumber === 1;
            return (
              <div
                key={routeOption.id}
                onClick={() => setSelectedRouteId(routeOption.id)}
                className={`group bg-white p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-blue-400 relative overflow-hidden ${
                  isBest ? 'border-emerald-300 ring-1 ring-emerald-200/60' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Route Number, Route Name, Path & Distance */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider ${
                          isBest
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : routeOption.routeNumber === 2
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {routeOption.name}
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isBest
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {routeOption.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {routeOption.sourceDisplay} ➔ {routeOption.destDisplay}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        <strong className="text-slate-700">{routeOption.distanceKm} km</strong> • ETA{' '}
                        <strong className="text-slate-700">{routeOption.eta}</strong> • 10 km Buffer Facilities:{' '}
                        <span className="text-blue-600 font-semibold">{routeOption.nearbyPlaces.length} POIs</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle & Right: Risk Score, Risk Level, Major Risk & Action Button */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Overall Risk Score */}
                    <div className="text-left md:text-right bg-slate-50 p-3 rounded-2xl border border-slate-100 min-w-[120px]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                        Safety Score
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        {routeOption.overallRiskScore}/100
                      </span>
                      <div className="mt-0.5">
                        <StatusBadge level={routeOption.riskLevel} size="sm" />
                      </div>
                    </div>

                    {/* Major Risk Cardlet (Req #3) */}
                    <div className="bg-rose-50/60 border border-rose-200/80 p-3 rounded-2xl text-xs min-w-[140px]">
                      <span className="text-[10px] uppercase font-bold text-rose-800 block">
                        Major Risk Factor
                      </span>
                      <p className="font-bold text-rose-950 mt-0.5">
                        {routeOption.majorRisk.category}
                      </p>
                      <p className="text-[11px] font-semibold text-rose-700">
                        {routeOption.majorRisk.percentage}% Probability
                      </p>
                    </div>

                    {/* View Details Action Button */}
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-2xl bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer ml-auto md:ml-0"
                    >
                      <span>Inspect Risks</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
  // SCREEN 2: DETAILED RISK INTELLIGENCE VIEW FOR THE SELECTED ROUTE
  // (Req #4, #5, #6, #7, #8, #9, #10, #14, #15, #16, #17, #24)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* 1. TOP ROUTE HEADER & BACK BUTTON (Req #5 & #24) */}
      <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 p-5 sm:p-6 rounded-3xl text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Back Button (Req #24) */}
            <button
              onClick={() => {
                setSelectedRouteId(null);
                setFocusedPlace(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/25 shadow-sm"
              title="Return to Route Selection List"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Routes</span>
            </button>

            <div className="h-4 w-px bg-white/30 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Risk Intelligence
              </span>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
            {activeRiskRoute.name} ({activeRiskRoute.badge})
          </span>
        </div>

        {/* Route Details Banner */}
        <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {activeRiskRoute.name}: {activeRiskRoute.sourceDisplay} ➔ {activeRiskRoute.destDisplay}
            </h1>
            <p className="text-xs text-amber-100 mt-0.5">
              Authoritative risk telemetry and 10 km corridor safety buffers for this route.
            </p>
          </div>

          {/* Metrics Pill (Req #5) */}
          <div className="flex items-center gap-2 sm:gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs">
            <div>
              <span className="text-[10px] text-amber-200 block uppercase font-bold">Distance</span>
              <span className="font-black text-sm">{activeRiskRoute.distanceKm} km</span>
            </div>
            <span className="text-white/40">|</span>
            <div>
              <span className="text-[10px] text-amber-200 block uppercase font-bold">ETA</span>
              <span className="font-black text-sm">{activeRiskRoute.eta}</span>
            </div>
            <span className="text-white/40">|</span>
            <div>
              <span className="text-[10px] text-amber-200 block uppercase font-bold">Safety Score</span>
              <span className="font-black text-sm text-emerald-300">{activeRiskRoute.overallRiskScore}/100</span>
            </div>
            <span className="text-white/40">|</span>
            <div>
              <span className="text-[10px] text-amber-200 block uppercase font-bold">Risk Level</span>
              <StatusBadge level={activeRiskRoute.riskLevel} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Hazard Categories:</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Hazards ({activeRiskRoute.risks.length})
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSeverity === 'HIGH'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            HIGH Risk
          </button>
          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSeverity === 'MEDIUM'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            MEDIUM Risk
          </button>
          <button
            onClick={() => setFilterSeverity('LOW')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSeverity === 'LOW'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            LOW Risk
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Risks + Nearby Places, Right = Map (Responsive, Req #23) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (col-span-6): Risks List + Nearby Places */}
        <div className="lg:col-span-6 space-y-6">
          {/* SECTION A: RISK CARDS (Sorted Numerically HIGH % -> LOW %, Req #7 & #8) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Corridor Risk Factors (Sorted Highest % to Lowest %)</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                {displayRisks.length} Hazards
              </span>
            </div>

            <div className="space-y-3">
              {displayRisks.length > 0 ? (
                displayRisks.map((risk) => {
                  const Icon = getCategoryIcon(risk.category);
                  const isHigh = risk.severity === 'HIGH';
                  const isMedium = risk.severity === 'MEDIUM';

                  return (
                    <div
                      key={risk.id}
                      className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-2xl ${
                              isHigh
                                ? 'bg-rose-100 text-rose-600'
                                : isMedium
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-emerald-100 text-emerald-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                              {risk.category} Risk
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">{risk.location}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xl font-black ${
                              isHigh
                                ? 'text-rose-600'
                                : isMedium
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {risk.percentage}%
                          </span>
                          <div className="mt-0.5">
                            <StatusBadge level={risk.severity} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p>
                          <span className="font-semibold text-slate-800">Observation:</span>{' '}
                          {risk.description}
                        </p>
                        <p>
                          <span className="font-semibold text-blue-700">Advisory:</span>{' '}
                          {risk.advisory}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                  No hazards match the selected severity filter for {activeRiskRoute.name}.
                </div>
              )}
            </div>
          </div>

          {/* SECTION B: NEARBY PLACES WITHIN 10 KM (Req #14, #15, #16, #17) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  <span>Nearby Places (Within 10 km of Route Corridor)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered Nearest ➔ Farthest along the entire {activeRiskRoute.name} corridor.
                </p>
              </div>
              <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                10 km Corridor Buffer
              </span>
            </div>

            {/* 🔍 Search Input (Req #17) */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search nearby places (e.g. hospital, fuel, mechanic, warehouse)..."
                value={placeSearchQuery}
                onChange={(e) => setPlaceSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-800"
              />
            </div>

            {/* Category Filter Chips (Req #15) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'ALL', label: 'All Services' },
                { id: 'Hospital', label: '🏥 Hospitals' },
                { id: 'Fuel Station', label: '⛽ Fuel' },
                { id: 'Vehicle Repair', label: '🛠️ Repair' },
                { id: 'Warehouse', label: '🏬 Warehouses' },
                { id: 'Rest Area', label: '☕ Rest Areas' },
                { id: 'Emergency Services', label: '🚨 Emergency' },
              ].map((chip) => {
                const isActive = placeCategoryFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setPlaceCategoryFilter(chip.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Nearby Places List (Ordered NEAREST -> FARTHEST, Req #16) */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredNearbyPlaces.length > 0 ? (
                filteredNearbyPlaces.map((place) => {
                  const PlaceIcon = getPlaceIcon(place.category);
                  const isSelected = focusedPlace?.id === place.id;

                  return (
                    <div
                      key={place.id}
                      onClick={() => setFocusedPlace(place)}
                      className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-200'
                          : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 mt-0.5">
                          <PlaceIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900">{place.name}</h5>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({place.category})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{place.location}</p>
                          <p className="text-[11px] text-emerald-700 font-medium mt-1">
                            Status: {place.status}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md text-[11px]">
                          {place.distanceFromRouteKm} km
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">~{place.travelTime} ETA</p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                          📞 {place.phone}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* No Results Message (Req #17) */
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  <MapPin className="w-5 h-5 text-slate-400 mx-auto mb-1.5 opacity-60" />
                  <p className="font-semibold text-slate-700">
                    No places found within 10 km of this route.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try searching for another facility type (hospital, fuel, repair, rest).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (col-span-6): Interactive Map (Req #9, #10, #11, #12, #13) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeRiskRoute.routeNumber === 1
                      ? 'bg-blue-600'
                      : activeRiskRoute.routeNumber === 2
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  } animate-pulse`}
                />
                <span className="font-bold text-slate-800">
                  {activeRiskRoute.name}: Risk Plotter ({activeRiskRoute.sourceDisplay} ➔{' '}
                  {activeRiskRoute.destDisplay})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {activeRiskRoute.distanceKm} km • {activeRiskRoute.eta}
              </span>
            </div>

            {/* Interactive Leaflet Map for Active Risk Route (Req #9 & #10) */}
            <RiskInteractiveMap
              route={activeRiskRoute}
              selectedPlace={focusedPlace}
              heightClass="h-[460px] sm:h-[540px]"
              onPlaceClick={(p) => setFocusedPlace(p)}
            />

            {/* Hint & Full-Screen Instructions */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <span className="text-[11px]">
                💡 Tap on any risk beacon or 10 km facility icon to inspect localized reports.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
