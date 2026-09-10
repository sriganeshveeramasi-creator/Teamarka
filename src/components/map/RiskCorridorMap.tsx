"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RiskRouteOption, NearbyPlaceItem } from '@/services/riskRouteService';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Maximize2,
  Minimize2,
  X,
  ArrowLeft,
  MapPin,
  ShieldAlert,
  Hospital,
  Fuel,
  Wrench,
  Building,
  Coffee,
  AlertOctagon,
} from 'lucide-react';

export interface RiskCorridorMapProps {
  route: RiskRouteOption;
  selectedPlace?: NearbyPlaceItem | null;
  heightClass?: string;
  onPlaceClick?: (place: NearbyPlaceItem) => void;
}

export default function RiskCorridorMap({
  route,
  selectedPlace,
  heightClass = 'h-[440px] sm:h-[500px]',
  onPlaceClick,
}: RiskCorridorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fullMapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const fullMapInstanceRef = useRef<L.Map | null>(null);

  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState<boolean>(false);
  const [showRisks, setShowRisks] = useState<boolean>(true);
  const [showPlaces, setShowPlaces] = useState<boolean>(true);

  // Layer groups for standard map
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riskMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const placesLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer groups for full-screen modal map
  const fullRouteLayerRef = useRef<L.LayerGroup | null>(null);
  const fullMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const fullRiskMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const fullPlacesLayerRef = useRef<L.LayerGroup | null>(null);

  // Helper: Draw route and markers on a given Leaflet map instance
  const drawRouteOnMap = (
    map: L.Map,
    routeGroup: L.LayerGroup,
    markersGroup: L.LayerGroup,
    riskGroup: L.LayerGroup,
    placesGroup: L.LayerGroup,
    targetRoute: RiskRouteOption
  ) => {
    // 1. Unconditionally clear old layers (Req #19: No ghost markers)
    routeGroup.clearLayers();
    markersGroup.clearLayers();
    riskGroup.clearLayers();
    placesGroup.clearLayers();

    const geometry = targetRoute.geometry;
    if (!geometry || geometry.length < 2) return;

    // Color based on route ranking
    const routeColor =
      targetRoute.routeNumber === 1 ? '#2563EB' : targetRoute.routeNumber === 2 ? '#D97706' : '#DC2626';

    // 2. Draw polyline with white halo
    L.polyline(geometry, {
      color: '#FFFFFF',
      weight: 8,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeGroup);

    const mainLine = L.polyline(geometry, {
      color: routeColor,
      weight: 5,
      opacity: 0.98,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeGroup);

    mainLine.bindTooltip(
      `<div class="font-sans text-xs font-semibold px-1 py-0.5">
        <b>${targetRoute.name}: ${targetRoute.sourceDisplay} ➔ ${targetRoute.destDisplay}</b><br/>
        <span class="text-blue-400 font-normal">${targetRoute.distanceKm} km • ${targetRoute.eta} • Risk Score: ${targetRoute.overallRiskScore}/100</span>
      </div>`,
      { sticky: true }
    );

    // 3. Draw Origin and Destination Pins
    const [startLat, startLng] = geometry[0];
    const [endLat, endLng] = geometry[geometry.length - 1];

    const originIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div class="relative flex items-center group cursor-pointer -translate-x-1/2 -translate-y-full">
          <div class="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-white whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>${targetRoute.sourceDisplay}</span>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rotate-45 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [100, 26],
      iconAnchor: [50, 26],
    });
    L.marker([startLat, startLng], { icon: originIcon }).addTo(markersGroup);

    const destIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div class="relative flex items-center group cursor-pointer -translate-x-1/2 -translate-y-full">
          <div class="flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-white whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span>${targetRoute.destDisplay}</span>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rotate-45 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [100, 26],
      iconAnchor: [50, 26],
    });
    L.marker([endLat, endLng], { icon: destIcon }).addTo(markersGroup);

    // 4. Draw Route-Specific Risk Markers (Req #10)
    targetRoute.risks.forEach((risk, i) => {
      let iconEmoji = '⚠️';
      let bgClass = 'bg-rose-600';
      if (risk.category === 'Heavy Rain') {
        iconEmoji = '🌧️';
        bgClass = 'bg-blue-600';
      } else if (risk.category === 'Landslide') {
        iconEmoji = '⛰️';
        bgClass = 'bg-amber-600';
      } else if (risk.category === 'Flood') {
        iconEmoji = '🌊';
        bgClass = 'bg-cyan-600';
      } else if (risk.category === 'Road Blockage') {
        iconEmoji = '🚧';
        bgClass = 'bg-red-700';
      } else if (risk.category === 'Low Visibility') {
        iconEmoji = '🌫️';
        bgClass = 'bg-slate-700';
      }

      const riskIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
            <div class="w-6 h-6 rounded-full ${bgClass} text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform animate-pulse">
              <span class="text-[11px]">${iconEmoji}</span>
            </div>
            <div class="hidden group-hover:flex absolute left-6 top-0 bg-slate-900/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap z-50 border border-slate-700">
              ${risk.category}: ${risk.percentage}%
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const m = L.marker([risk.lat, risk.lng], { icon: riskIcon }).addTo(riskGroup);
      m.bindPopup(`
        <div class="p-3 text-slate-100 min-w-[220px] font-sans">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-400">${risk.category} Risk</span>
            <span class="text-xs font-black text-white bg-slate-800 px-1.5 py-0.5 rounded">${risk.percentage}%</span>
          </div>
          <h4 class="font-bold text-sm text-white">${risk.title}</h4>
          <p class="text-xs text-slate-300 mt-1">${risk.description}</p>
          <div class="mt-2 text-[11px] text-amber-300"><b>Advisory:</b> ${risk.advisory}</div>
        </div>
      `, { className: 'arka-map-popup' });
    });

    // 5. Draw Nearby Places Pins within 10 km (Req #14 & #15)
    targetRoute.nearbyPlaces.forEach((place) => {
      let emoji = '📍';
      let pinColor = 'bg-blue-600';
      if (place.category === 'Hospital') {
        emoji = '🏥';
        pinColor = 'bg-rose-600';
      } else if (place.category === 'Fuel Station') {
        emoji = '⛽';
        pinColor = 'bg-blue-600';
      } else if (place.category === 'Vehicle Repair') {
        emoji = '🛠️';
        pinColor = 'bg-amber-600';
      } else if (place.category === 'Warehouse') {
        emoji = '🏬';
        pinColor = 'bg-purple-600';
      } else if (place.category === 'Rest Area') {
        emoji = '☕';
        pinColor = 'bg-emerald-600';
      } else if (place.category === 'Emergency Services') {
        emoji = '🚨';
        pinColor = 'bg-red-600';
      }

      const placeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
            <div class="w-5 h-5 rounded-lg ${pinColor} text-white flex items-center justify-center shadow-md border border-white hover:scale-125 transition-transform">
              <span class="text-[10px]">${emoji}</span>
            </div>
            <div class="hidden group-hover:flex absolute left-5 top-0 bg-slate-900/95 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow whitespace-nowrap z-50 border border-slate-700">
              ${place.name} (${place.distanceFromRouteKm} km from route)
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const pMarker = L.marker([place.lat, place.lng], { icon: placeIcon }).addTo(placesGroup);
      pMarker.on('click', () => {
        if (onPlaceClick) onPlaceClick(place);
      });
      pMarker.bindPopup(`
        <div class="p-3 text-slate-100 min-w-[210px] font-sans">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400">${place.category}</span>
            <span class="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded">${place.distanceFromRouteKm} km from route</span>
          </div>
          <h4 class="font-bold text-sm text-white">${place.name}</h4>
          <p class="text-xs text-slate-300 mt-0.5">${place.location}</p>
          <div class="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs">
            <span class="text-slate-400">Travel time:</span>
            <span class="text-white font-medium">~${place.travelTime}</span>
          </div>
          <div class="text-xs text-cyan-300 mt-1 font-mono">📞 ${place.phone}</div>
        </div>
      `, { className: 'arka-map-popup' });
    });

    // 6. Auto-fit bounds (Req #13)
    try {
      map.fitBounds(L.latLngBounds(geometry), {
        padding: [45, 45],
        maxZoom: 13,
      });
    } catch (e) {
      console.warn('fitBounds error', e);
    }
  };

  // 1. Initialize Standard Map Canvas
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    riskMarkersLayerRef.current = L.layerGroup().addTo(map);
    placesLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Standard Map when route changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      !map ||
      !routeLayerRef.current ||
      !markersLayerRef.current ||
      !riskMarkersLayerRef.current ||
      !placesLayerRef.current
    )
      return;

    drawRouteOnMap(
      map,
      routeLayerRef.current,
      markersLayerRef.current,
      riskMarkersLayerRef.current,
      placesLayerRef.current,
      route
    );
  }, [route.id, route.geometry]);

  // Layer toggles on standard map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !riskMarkersLayerRef.current) return;
    if (showRisks) map.addLayer(riskMarkersLayerRef.current);
    else map.removeLayer(riskMarkersLayerRef.current);
  }, [showRisks]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !placesLayerRef.current) return;
    if (showPlaces) map.addLayer(placesLayerRef.current);
    else map.removeLayer(placesLayerRef.current);
  }, [showPlaces]);

  // 2. Initialize Full-Screen Modal Map Canvas when opened (Req #11 & #12)
  useEffect(() => {
    if (!isFullscreenModalOpen) {
      if (fullMapInstanceRef.current) {
        fullMapInstanceRef.current.remove();
        fullMapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!fullMapContainerRef.current) return;

      const fullMap = L.map(fullMapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: true,
      });

      fullMapInstanceRef.current = fullMap;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(fullMap);

      fullRouteLayerRef.current = L.layerGroup().addTo(fullMap);
      fullMarkersLayerRef.current = L.layerGroup().addTo(fullMap);
      fullRiskMarkersLayerRef.current = L.layerGroup().addTo(fullMap);
      fullPlacesLayerRef.current = L.layerGroup().addTo(fullMap);

      drawRouteOnMap(
        fullMap,
        fullRouteLayerRef.current,
        fullMarkersLayerRef.current,
        fullRiskMarkersLayerRef.current,
        fullPlacesLayerRef.current,
        route
      );
    }, 150);

    return () => {
      clearTimeout(timer);
      if (fullMapInstanceRef.current) {
        fullMapInstanceRef.current.remove();
        fullMapInstanceRef.current = null;
      }
    };
  }, [isFullscreenModalOpen, route.id]);

  // Pan to selected place if clicked
  useEffect(() => {
    if (!selectedPlace) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedPlace.lat, selectedPlace.lng], 12, { animate: true });
    }
    if (fullMapInstanceRef.current) {
      fullMapInstanceRef.current.setView([selectedPlace.lat, selectedPlace.lng], 12, { animate: true });
    }
  }, [selectedPlace]);

  return (
    <>
      {/* 1. STANDARD EMBEDDED MAP CANVAS */}
      <div
        className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 flex flex-col select-none`}
      >
        {/* Top Header Bar */}
        <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex flex-wrap items-center justify-between gap-2">
          {/* Active Route Badge */}
          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow text-slate-800">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                route.routeNumber === 1
                  ? 'bg-blue-600'
                  : route.routeNumber === 2
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
            />
            <span className="font-bold text-slate-900">{route.name}: {route.badge}</span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-600">{route.distanceKm} km • {route.eta}</span>
          </div>

          {/* Controls: Toggles + Full-Screen Button */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 text-xs shadow">
            <button
              onClick={() => setShowRisks(!showRisks)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                showRisks ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Risk Markers"
            >
              <span>⚠️</span>
              <span className="hidden sm:inline">Risks</span>
            </button>

            <button
              onClick={() => setShowPlaces(!showPlaces)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                showPlaces ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Places within 10 km"
            >
              <span>📍</span>
              <span className="hidden sm:inline">Places</span>
            </button>

            {/* Click to expand full-screen (Req #11) */}
            <button
              onClick={() => setIsFullscreenModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Open Large Full-Screen Map View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Map</span>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          onClick={(e) => {
            // If user clicks map directly (not on controls), allow opening full-screen mode
            const target = e.target as HTMLElement;
            if (target.classList.contains('leaflet-container') || target.classList.contains('leaflet-tile')) {
              setIsFullscreenModalOpen(true);
            }
          }}
          className="w-full h-full cursor-pointer"
        />

        {/* Bottom Click-to-Expand Overlay Bar */}
        <button
          type="button"
          onClick={() => setIsFullscreenModalOpen(true)}
          className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/85 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>Click map to open in Full-Screen View (Zoom, Pan, Inspect Risks & POIs)</span>
          </div>
          <span className="text-[11px] text-cyan-200 underline">Open Full Map ➔</span>
        </button>
      </div>

      {/* 2. LARGE FULL-SCREEN MAP MODAL VIEW (Req #11, #12, #13) */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-sm flex flex-col p-2 sm:p-4 animate-in fade-in duration-200 select-none">
          {/* Full-Screen Top Navigation Bar (Req #11) */}
          <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-200 flex items-center justify-between gap-3 mb-2 sm:mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to Risk Intelligence</span>
              </button>

              <div className="hidden md:block h-5 w-px bg-slate-200" />

              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="font-black text-slate-900">{route.name} ({route.badge}):</span>
                <span className="text-slate-600">{route.sourceDisplay} ➔ {route.destDisplay}</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-slate-800">{route.distanceKm} km</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-slate-800">{route.eta}</span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Safety Score {route.overallRiskScore}/100
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (fullMapInstanceRef.current && route.geometry.length > 0) {
                    fullMapInstanceRef.current.fitBounds(L.latLngBounds(route.geometry), { padding: [45, 45] });
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Fit complete route in screen"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fit Route</span>
              </button>

              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <X className="w-4 h-4" />
                <span>✕ Close Map</span>
              </button>
            </div>
          </div>

          {/* Full Screen Leaflet Canvas */}
          <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
            <div ref={fullMapContainerRef} className="w-full h-full" />

            {/* Bottom-right Zoom / Re-center Floating Controls (Req #12) */}
            <div className="absolute right-4 bottom-5 z-[1000] flex flex-col gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-xl text-slate-800">
              <button
                onClick={() => fullMapInstanceRef.current?.zoomIn()}
                className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => fullMapInstanceRef.current?.zoomOut()}
                className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="h-px bg-slate-200 my-0.5" />
              <button
                onClick={() => {
                  if (fullMapInstanceRef.current && route.geometry.length > 0) {
                    fullMapInstanceRef.current.fitBounds(L.latLngBounds(route.geometry), { padding: [50, 50] });
                  }
                }}
                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Center & Fit Route"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-left Map Legend */}
            <div className="absolute left-4 bottom-5 z-[1000] hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-xl text-xs text-slate-700">
              <span className="font-bold text-slate-900">{route.name} Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                <span>Active Path</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Terrain Risks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>Places within 10 km</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
