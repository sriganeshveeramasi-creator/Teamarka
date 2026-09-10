"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '@/context/AppContext';
import {
  PRIMARY_ROAD_COORDINATES,
  GUWAHATI_IMPHAL_BOUNDS,
  ORIGIN_GUWAHATI,
  DESTINATION_IMPHAL,
  RealRiskAlert,
  RealServicePoint,
} from '@/data/realGeoData';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  AlertTriangle,
  Radio,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface NortheastInteractiveMapProps {
  highlightRoute?: boolean;
  showAlternative?: boolean;
  activeShipmentPoint?: { x?: number; y?: number; lat?: number; lng?: number; label?: string };
  emergencyFocus?: boolean;
  interactive?: boolean;
  heightClass?: string;
  zoomLevel?: 'state' | 'district' | 'local';
}

export default function RealLeafletMap({
  highlightRoute = true,
  showAlternative = false,
  activeShipmentPoint,
  emergencyFocus = false,
  interactive = true,
  heightClass = "h-[460px] md:h-[540px]",
}: NortheastInteractiveMapProps) {
  const { currentRouteResult, isRouteCalculating, routeError } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer toggles
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showTolls, setShowTolls] = useState<boolean>(true);
  const [showSignals, setShowSignals] = useState<boolean>(true);
  const [showRisks, setShowRisks] = useState<boolean>(true);
  const [showServices, setShowServices] = useState<boolean>(false);
  const [showAltRoute, setShowAltRoute] = useState<boolean>(showAlternative);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Authoritative Layer Groups (Req #5 & #13)
  const primaryRouteLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const altRouteLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const signalsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tollsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const risksLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const servicesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const shipmentLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Synchronize prop changes
  useEffect(() => {
    setShowAltRoute(showAlternative);
  }, [showAlternative]);

  // 1. Initialize Leaflet Map Instance on Mount (NO static route markers added directly)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
    });

    mapInstanceRef.current = map;

    // CartoDB Voyager tiles (Clean navigation cartography)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: 'ARKA GeoEngine | &copy; OSM' }).addTo(map);

    // Create managed LayerGroups
    primaryRouteLayerGroupRef.current = L.layerGroup().addTo(map);
    altRouteLayerGroupRef.current = L.layerGroup();
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    trafficLayerGroupRef.current = L.layerGroup().addTo(map);
    signalsLayerGroupRef.current = L.layerGroup().addTo(map);
    tollsLayerGroupRef.current = L.layerGroup().addTo(map);
    risksLayerGroupRef.current = L.layerGroup().addTo(map);
    servicesLayerGroupRef.current = L.layerGroup();
    shipmentLayerGroupRef.current = L.layerGroup().addTo(map);

    if (showAltRoute) {
      altRouteLayerGroupRef.current.addTo(map);
    }

    // Initial bounding box
    map.fitBounds(GUWAHATI_IMPHAL_BOUNDS, {
      padding: [45, 45],
      maxZoom: 11,
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. AUTHORITATIVE ROUTE RENDERER & OLD ROUTE PURGE (Req #5, #6, #7, #13)
  // Completely clears all old layers BEFORE rendering the new active route!
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // STEP A: UNCONDITIONALLY CLEAR ALL PREVIOUS LAYERS (Req #5: Fix ghosting bug)
    primaryRouteLayerGroupRef.current?.clearLayers();
    altRouteLayerGroupRef.current?.clearLayers();
    markersLayerGroupRef.current?.clearLayers();
    trafficLayerGroupRef.current?.clearLayers();
    signalsLayerGroupRef.current?.clearLayers();
    tollsLayerGroupRef.current?.clearLayers();
    risksLayerGroupRef.current?.clearLayers();
    servicesLayerGroupRef.current?.clearLayers();
    shipmentLayerGroupRef.current?.clearLayers();

    const routeCoords = currentRouteResult?.geometry;
    if (!routeCoords || routeCoords.length < 2) return;

    // STEP B: RESOLVE CURRENT ORIGIN & DESTINATION COORDINATES & LABELS
    let originLat = 26.1445;
    let originLng = 91.7362;
    let originLabel = 'Origin Hub';

    if (currentRouteResult.isCurrentLocation && currentRouteResult.currentLocationCoords) {
      originLat = currentRouteResult.currentLocationCoords.lat;
      originLng = currentRouteResult.currentLocationCoords.lng;
      originLabel = currentRouteResult.currentLocationCoords.label || 'Current GPS Location';
    } else if (currentRouteResult.sourceCoords) {
      originLat = currentRouteResult.sourceCoords.lat;
      originLng = currentRouteResult.sourceCoords.lng;
      originLabel = currentRouteResult.sourceVillage
        ? `${currentRouteResult.sourceVillage} (${currentRouteResult.sourceCity})`
        : currentRouteResult.sourceCity;
    }

    const destLat = currentRouteResult.destCoords?.lat ?? 24.8170;
    const destLng = currentRouteResult.destCoords?.lng ?? 93.9368;
    const destLabel = currentRouteResult.destVillage
      ? `${currentRouteResult.destVillage} (${currentRouteResult.destCity})`
      : currentRouteResult.destCity;

    // STEP C: DRAW PRIMARY ACTIVE ROUTE POLYLINE
    if (highlightRoute && primaryRouteLayerGroupRef.current) {
      // 1. White border outline
      L.polyline(routeCoords, {
        color: '#FFFFFF',
        weight: 8,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(primaryRouteLayerGroupRef.current);

      // 2. Vibrant ARKA primary route line
      const mainRoutePolyline = L.polyline(routeCoords, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(primaryRouteLayerGroupRef.current);

      mainRoutePolyline.bindTooltip(
        `<div class="font-sans text-xs font-semibold px-1 py-0.5">
          <b>${originLabel} → ${destLabel}</b><br/>
          <span class="text-blue-500 font-normal">${currentRouteResult.distanceKm} km, ${currentRouteResult.eta}</span>
        </div>`,
        { sticky: true, className: 'arka-map-tooltip' }
      );
    }

    // STEP D: DRAW ALTERNATIVE ROUTE ONLY IF REQUESTED (Req #8)
    if (showAltRoute && currentRouteResult.altGeometry && altRouteLayerGroupRef.current) {
      L.polyline(currentRouteResult.altGeometry, {
        color: '#FFFFFF',
        weight: 6,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(altRouteLayerGroupRef.current);

      const altPolyline = L.polyline(currentRouteResult.altGeometry, {
        color: '#6366F1',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(altRouteLayerGroupRef.current);

      altPolyline.bindTooltip(
        `<div class="font-sans text-xs font-semibold px-1 py-0.5">
          <b>Alternative Bypass Corridor</b><br/>
          <span class="text-indigo-400 font-normal">${currentRouteResult.altDistanceKm || Math.round(currentRouteResult.distanceKm * 1.15)} km, ${currentRouteResult.altEta || 'Secondary Hill Pass'}</span>
        </div>`,
        { sticky: true }
      );
    }

    // STEP E: DRAW ROUTE-SPECIFIC MARKERS (Req #5, #7, #9)
    if (markersLayerGroupRef.current) {
      // 1. Origin Marker
      let originHtml = '';
      if (currentRouteResult.isCurrentLocation) {
        // Special GPS pulsating radar pin
        originHtml = `
          <div class="relative flex items-center group cursor-pointer -translate-x-1/2 -translate-y-full">
            <div class="absolute -inset-1 rounded-full bg-blue-500/40 animate-ping"></div>
            <div class="flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-white whitespace-nowrap z-10">
              <span class="w-2 h-2 rounded-full bg-cyan-300 animate-pulse inline-block"></span>
              <span>GPS: ${originLabel}</span>
              <span class="text-[9px] bg-blue-800/80 px-1.5 py-0.2 rounded font-normal uppercase tracking-wider">Live</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45 border-r-2 border-b-2 border-white"></div>
          </div>
        `;
      } else {
        originHtml = `
          <div class="relative flex items-center group cursor-pointer -translate-x-1/2 -translate-y-full">
            <div class="flex items-center gap-1.5 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
              <span class="w-2 h-2 rounded-full bg-emerald-200 animate-ping inline-block"></span>
              <span>${originLabel}</span>
              <span class="text-[9px] bg-emerald-800/80 px-1.5 py-0.2 rounded font-normal uppercase tracking-wider">Origin</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-600 rotate-45 border-r-2 border-b-2 border-white"></div>
          </div>
        `;
      }

      const originIcon = L.divIcon({
        className: 'custom-map-icon',
        html: originHtml,
        iconSize: [120, 34],
        iconAnchor: [60, 34],
      });

      const originMarker = L.marker([originLat, originLng], { icon: originIcon }).addTo(markersLayerGroupRef.current);
      originMarker.bindPopup(`
        <div class="p-3 text-slate-100 min-w-[210px] font-sans">
          <div class="flex items-center gap-1.5 text-xs font-semibold ${currentRouteResult.isCurrentLocation ? 'text-cyan-400' : 'text-emerald-400'} mb-1">
            <span class="w-2 h-2 rounded-full ${currentRouteResult.isCurrentLocation ? 'bg-cyan-400' : 'bg-emerald-400'}"></span>
            ${currentRouteResult.isCurrentLocation ? 'Live GPS Location' : 'Origin Location'}
          </div>
          <h4 class="font-bold text-sm text-white">${originLabel}</h4>
          <div class="mt-2.5 pt-2 border-t border-slate-700/80 text-[11px] text-slate-400 flex justify-between">
            <span>Coordinates:</span>
            <span class="text-white font-mono">${originLat.toFixed(4)}, ${originLng.toFixed(4)}</span>
          </div>
        </div>
      `, { className: 'arka-map-popup' });

      // 2. Destination Marker
      const destIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center group cursor-pointer -translate-x-1/2 -translate-y-full">
            <div class="flex items-center gap-1.5 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
              <span class="w-2 h-2 rounded-full bg-rose-200 inline-block"></span>
              <span>${destLabel}</span>
              <span class="text-[9px] bg-rose-800/80 px-1.5 py-0.2 rounded font-normal uppercase tracking-wider">Dest</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-600 rotate-45 border-r-2 border-b-2 border-white"></div>
          </div>
        `,
        iconSize: [110, 34],
        iconAnchor: [55, 34],
      });

      const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(markersLayerGroupRef.current);
      destMarker.bindPopup(`
        <div class="p-3 text-slate-100 min-w-[210px] font-sans">
          <div class="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
            <span class="w-2 h-2 rounded-full bg-rose-400"></span>
            Delivery Terminal
          </div>
          <h4 class="font-bold text-sm text-white">${destLabel}</h4>
          <div class="mt-2.5 pt-2 border-t border-slate-700/80 text-[11px] text-slate-400 flex justify-between">
            <span>Target Hub:</span>
            <span class="text-rose-300 font-semibold">${currentRouteResult.destState}</span>
          </div>
        </div>
      `, { className: 'arka-map-popup' });

      // 3. Midpoint Corridor Telemetry Waypoint
      if (routeCoords.length > 8) {
        const midIdx = Math.floor(routeCoords.length * 0.5);
        const [midLat, midLng] = routeCoords[midIdx];

        const midIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="relative flex items-center group cursor-pointer -translate-x-1/2 -translate-y-1/2">
              <div class="w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              </div>
              <div class="hidden group-hover:flex absolute left-4 bg-slate-900/95 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap z-50">
                Active Corridor Telemetry
              </div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const midMarker = L.marker([midLat, midLng], { icon: midIcon }).addTo(markersLayerGroupRef.current);
        midMarker.bindPopup(`
          <div class="p-3 text-slate-100 min-w-[200px] font-sans">
            <div class="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-0.5">Active Corridor Telemetry</div>
            <h4 class="font-bold text-sm text-white">${originLabel} ➔ ${destLabel}</h4>
            <div class="text-xs text-slate-300 mt-1">Distance: <span class="text-white font-bold">${currentRouteResult.distanceKm} km</span></div>
            <div class="text-xs text-slate-300 mt-0.5">Traffic Density: <span class="text-emerald-400 font-bold">${currentRouteResult.trafficPercent}%</span></div>
            <div class="text-xs text-slate-400 mt-0.5">Accessibility: <span class="text-blue-400 font-bold">${currentRouteResult.accessibilityScore}%</span></div>
          </div>
        `, { className: 'arka-map-popup' });
      }
    }

    // STEP F: GENERATE ROUTE-SPECIFIC TRAFFIC OVERLAYS (Req #7)
    if (trafficLayerGroupRef.current && routeCoords.length >= 6) {
      const p1 = Math.floor(routeCoords.length * 0.35);
      const p2 = Math.floor(routeCoords.length * 0.70);

      const seg1 = routeCoords.slice(0, p1 + 1);
      const seg2 = routeCoords.slice(p1, p2 + 1);
      const seg3 = routeCoords.slice(p2);

      // Section 1: Smooth Flow (Green)
      L.polyline(seg1, {
        color: '#10B981',
        weight: 4.5,
        opacity: 0.85,
        lineCap: 'round',
      }).bindTooltip(
        `<div class="font-sans text-xs"><b>Departure Sector</b><br/>Traffic Flow: <span style="color:#10B981;font-weight:bold">OPTIMAL</span></div>`,
        { sticky: true }
      ).addTo(trafficLayerGroupRef.current);

      // Section 2: Hill/Transit Segment (Amber)
      L.polyline(seg2, {
        color: '#F59E0B',
        weight: 4.5,
        opacity: 0.85,
        lineCap: 'round',
      }).bindTooltip(
        `<div class="font-sans text-xs"><b>Central Transit Corridor</b><br/>Traffic Flow: <span style="color:#F59E0B;font-weight:bold">MODERATE (${currentRouteResult.trafficPercent}%)</span></div>`,
        { sticky: true }
      ).addTo(trafficLayerGroupRef.current);

      // Section 3: Arrival Approach (Cyan/Blue)
      L.polyline(seg3, {
        color: '#06B6D4',
        weight: 4.5,
        opacity: 0.85,
        lineCap: 'round',
      }).bindTooltip(
        `<div class="font-sans text-xs"><b>Destination Approach Sector</b><br/>Traffic Flow: <span style="color:#06B6D4;font-weight:bold">REGULATED</span></div>`,
        { sticky: true }
      ).addTo(trafficLayerGroupRef.current);
    }

    // STEP G: GENERATE ROUTE-SPECIFIC SIGNALS (Req #7)
    if (signalsLayerGroupRef.current && routeCoords.length > 8) {
      const sigCount = Math.min(6, Math.max(1, currentRouteResult.trafficSignalsCount));
      const step = Math.floor(routeCoords.length / (sigCount + 1));

      for (let i = 1; i <= sigCount; i++) {
        const idx = Math.min(routeCoords.length - 2, i * step);
        const [sLat, sLng] = routeCoords[idx];
        const status = i % 3 === 0 ? 'yellow' : 'green';
        const statusBg = status === 'green' ? 'bg-emerald-500' : 'bg-amber-500';

        const sigIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
              <div class="w-4 h-4 rounded-full ${statusBg} text-white flex items-center justify-center shadow-md border-2 border-white hover:scale-125 transition-transform">
                <div class="w-1 h-1 rounded-full bg-white"></div>
              </div>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const sigMarker = L.marker([sLat, sLng], { icon: sigIcon }).addTo(signalsLayerGroupRef.current);
        sigMarker.bindPopup(`
          <div class="p-2.5 text-slate-100 min-w-[180px] font-sans">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Signal #${i}</span>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${status === 'green' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${status}</span>
            </div>
            <h4 class="font-bold text-xs text-white">Corridor Junction ${i}</h4>
            <div class="text-[11px] text-slate-300 mt-1">Status: Active Synchronized Flow</div>
          </div>
        `, { className: 'arka-map-popup' });
      }
    }

    // STEP H: GENERATE ROUTE-SPECIFIC TOLL PLAZAS (Req #7)
    if (tollsLayerGroupRef.current && currentRouteResult.tollGatesCount > 0 && routeCoords.length > 10) {
      const tollCount = Math.min(4, currentRouteResult.tollGatesCount);
      const step = Math.floor(routeCoords.length / (tollCount + 1));

      for (let i = 1; i <= tollCount; i++) {
        const idx = Math.min(routeCoords.length - 2, i * step);
        const [tLat, tLng] = routeCoords[idx];
        const costPerGate = Math.round(currentRouteResult.tollCost / tollCount);

        const tollIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
              <div class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white hover:scale-115 transition-transform">
                <span class="text-[11px]">🛣️</span>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const tollMarker = L.marker([tLat, tLng], { icon: tollIcon }).addTo(tollsLayerGroupRef.current);
        tollMarker.bindPopup(`
          <div class="p-3 text-slate-100 min-w-[200px] font-sans">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400">NHAI Toll Plaza #${i}</span>
              <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">FASTag</span>
            </div>
            <h4 class="font-bold text-sm text-white">Corridor Toll Gate ${i}</h4>
            <div class="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs">
              <span class="text-slate-400">Tariff:</span>
              <span class="font-bold text-white">₹${costPerGate}</span>
            </div>
          </div>
        `, { className: 'arka-map-popup' });
      }
    }

    // STEP I: GENERATE ROUTE-SPECIFIC RISKS (Req #7)
    if (risksLayerGroupRef.current && routeCoords.length > 8) {
      if (currentRouteResult.landslideRisk !== 'LOW') {
        const rIdx = Math.floor(routeCoords.length * 0.42);
        const [rLat, rLng] = routeCoords[rIdx];
        const isHigh = currentRouteResult.landslideRisk === 'HIGH';

        const riskIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
              <div class="w-6 h-6 rounded-full ${isHigh ? 'bg-red-600' : 'bg-amber-600'} text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform animate-pulse">
                <span class="text-[11px]">⚠️</span>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const riskMarker = L.marker([rLat, rLng], { icon: riskIcon }).addTo(risksLayerGroupRef.current);
        riskMarker.bindPopup(`
          <div class="p-3 text-slate-100 min-w-[220px] font-sans">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-rose-400">Hill Terrain Advisory</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded font-bold ${isHigh ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}">${currentRouteResult.landslideRisk}</span>
            </div>
            <h4 class="font-bold text-sm text-white">Slope Stability Caution</h4>
            <div class="text-xs text-amber-200/90 mt-1">Seasonal precipitation on hill cutting sector. Drive with regulated headway.</div>
          </div>
        `, { className: 'arka-map-popup' });
      }

      if (currentRouteResult.floodRisk !== 'LOW') {
        const fIdx = Math.floor(routeCoords.length * 0.72);
        const [fLat, fLng] = routeCoords[fIdx];

        const floodIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
              <div class="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform animate-pulse">
                <span class="text-[11px]">🌊</span>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const floodMarker = L.marker([fLat, fLng], { icon: floodIcon }).addTo(risksLayerGroupRef.current);
        floodMarker.bindPopup(`
          <div class="p-3 text-slate-100 min-w-[220px] font-sans">
            <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Water Runoff Advisory</span>
            <h4 class="font-bold text-sm text-white">Riverine Drainage Crossing</h4>
            <div class="text-xs text-cyan-200/90 mt-1">Surface water dispersion active. PWD drainage pumps operational.</div>
          </div>
        `, { className: 'arka-map-popup' });
      }
    }

    // STEP J: GENERATE ROUTE-SPECIFIC SERVICES (Req #7)
    if (servicesLayerGroupRef.current && routeCoords.length > 12) {
      const s1 = Math.floor(routeCoords.length * 0.28);
      const [sLat1, sLng1] = routeCoords[s1];

      const fuelIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
            <div class="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md border border-white hover:scale-115 transition-transform">
              <span class="text-[10px]">⛽</span>
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([sLat1, sLng1], { icon: fuelIcon })
        .bindPopup('<div class="p-2 text-xs text-white"><b>Highway Fuel & DEF Station</b><br/>24/7 Diesel & Electric Charging</div>', { className: 'arka-map-popup' })
        .addTo(servicesLayerGroupRef.current);

      const s2 = Math.floor(routeCoords.length * 0.62);
      const [sLat2, sLng2] = routeCoords[s2];
      const hospIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
            <div class="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-md border border-white hover:scale-115 transition-transform">
              <span class="text-[10px]">🏥</span>
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([sLat2, sLng2], { icon: hospIcon })
        .bindPopup('<div class="p-2 text-xs text-white"><b>Emergency Trauma First Aid Unit</b><br/>Civil Hospital Outreach Facility</div>', { className: 'arka-map-popup' })
        .addTo(servicesLayerGroupRef.current);
    }

    // STEP K: ACTIVE FREIGHT SHIPMENT PIN IF SPECIFIED
    if (activeShipmentPoint && shipmentLayerGroupRef.current) {
      let lat = activeShipmentPoint.lat;
      let lng = activeShipmentPoint.lng;
      if (!lat && routeCoords.length > 5) {
        const idx = Math.floor(routeCoords.length * 0.45);
        lat = routeCoords[idx][0];
        lng = routeCoords[idx][1];
      }

      if (lat && lng) {
        const truckIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div class="relative flex items-center group cursor-pointer -translate-x-1/2 -translate-y-1/2">
              <div class="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping"></div>
              <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xl border-2 border-white z-10">
                <span class="text-sm">🚚</span>
              </div>
              <div class="ml-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/50 shadow whitespace-nowrap hidden sm:block">
                ${activeShipmentPoint.label || 'Active Convoy'}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([lat, lng], { icon: truckIcon }).addTo(shipmentLayerGroupRef.current);
      }
    }

    // STEP L: FIT VIEWPORT TO ACTIVE ROUTE (Req #4)
    try {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
      });
    } catch (e) {
      console.warn('[RealLeafletMap fitBounds error]', e);
    }
  }, [currentRouteResult?.routeId, highlightRoute, showAltRoute, activeShipmentPoint]);

  // Sync Layer visibility toggles dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !trafficLayerGroupRef.current) return;
    if (showTraffic) map.addLayer(trafficLayerGroupRef.current);
    else map.removeLayer(trafficLayerGroupRef.current);
  }, [showTraffic]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tollsLayerGroupRef.current) return;
    if (showTolls) map.addLayer(tollsLayerGroupRef.current);
    else map.removeLayer(tollsLayerGroupRef.current);
  }, [showTolls]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !signalsLayerGroupRef.current) return;
    if (showSignals) map.addLayer(signalsLayerGroupRef.current);
    else map.removeLayer(signalsLayerGroupRef.current);
  }, [showSignals]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !risksLayerGroupRef.current) return;
    if (showRisks) map.addLayer(risksLayerGroupRef.current);
    else map.removeLayer(risksLayerGroupRef.current);
  }, [showRisks]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !servicesLayerGroupRef.current) return;
    if (showServices) map.addLayer(servicesLayerGroupRef.current);
    else map.removeLayer(servicesLayerGroupRef.current);
  }, [showServices]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !altRouteLayerGroupRef.current) return;
    if (showAltRoute) map.addLayer(altRouteLayerGroupRef.current);
    else map.removeLayer(altRouteLayerGroupRef.current);
  }, [showAltRoute]);

  // Controls Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const routeCoords = currentRouteResult?.geometry;
    if (routeCoords && routeCoords.length > 1) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(routeCoords), {
        padding: [45, 45],
        maxZoom: 13,
      });
    } else {
      mapInstanceRef.current.fitBounds(GUWAHATI_IMPHAL_BOUNDS, {
        padding: [45, 45],
        maxZoom: 11,
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  // Top banner display strings (Req #6)
  const originDisplay = currentRouteResult.isCurrentLocation
    ? (currentRouteResult.currentLocationCoords?.label || 'Current GPS Location')
    : (currentRouteResult.sourceVillage
        ? `${currentRouteResult.sourceVillage} (${currentRouteResult.sourceCity})`
        : currentRouteResult.sourceCity);

  const destDisplay = currentRouteResult.destVillage
    ? `${currentRouteResult.destVillage} (${currentRouteResult.destCity})`
    : currentRouteResult.destCity;

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : `${heightClass} rounded-2xl`
      } overflow-hidden border border-slate-200 shadow-lg bg-slate-100 flex flex-col font-sans select-none transition-all duration-300`}
    >
      {/* 1. TOP ROUTE INFORMATION BANNER (Clean Navigation SaaS Header) */}
      <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Left: Origin to Destination Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs shadow-md text-slate-800 max-w-full truncate">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                isRouteCalculating ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{originDisplay}</span>
            <span className="text-slate-400 font-normal">→</span>
            <span className="text-rose-600 truncate max-w-[140px] sm:max-w-[200px]">{destDisplay}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-2 text-slate-600 text-[11px] flex-shrink-0">
            <span>
              <strong className="text-slate-800">{currentRouteResult?.distanceKm ?? 0}</strong> km
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-800">{currentRouteResult?.eta ?? '0 mins'}</strong> ETA
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {currentRouteResult?.trafficPercent ?? 34}% Traffic
            </span>
          </div>
        </div>

        {/* Right: Modern Floating Layer Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 text-xs shadow-md overflow-x-auto max-w-full">
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              showTraffic
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Toggle Traffic Flow Segments"
          >
            <span className={`w-2 h-2 rounded-full ${showTraffic ? 'bg-emerald-200' : 'bg-emerald-500'}`} />
            Traffic
          </button>

          <button
            onClick={() => setShowSignals(!showSignals)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              showSignals
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Toggle Traffic Signals"
          >
            <span>🚦</span>
            <span className="hidden md:inline">Signals</span>
          </button>

          <button
            onClick={() => setShowTolls(!showTolls)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              showTolls
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Toggle Toll Plazas"
          >
            <span>🛣️</span>
            <span className="hidden md:inline">Tolls</span>
          </button>

          <button
            onClick={() => setShowRisks(!showRisks)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              showRisks
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Toggle Terrain Risks"
          >
            <span>⚠️</span>
            <span>Risks</span>
          </button>

          <button
            onClick={() => setShowServices(!showServices)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              showServices
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Toggle Emergency Facilities"
          >
            <span>🏥</span>
            <span>Services</span>
          </button>

          <button
            onClick={() => setShowAltRoute(!showAltRoute)}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              showAltRoute
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Toggle Alternative Route"
          >
            <span>Alt</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isRouteCalculating && (
        <div className="absolute inset-0 z-[1001] bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white/95 px-5 py-3 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-800">Calculating real highway route...</span>
          </div>
        </div>
      )}

      {/* Routing Error Notice */}
      {routeError && (
        <div className="absolute top-16 left-3 right-3 z-[1001] bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span className="font-semibold">{routeError}</span>
          </div>
        </div>
      )}

      {/* 2. LEAFLET MAP CANVAS */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 3. BOTTOM-LEFT: CLEAN TRAFFIC FLOW LEGEND */}
      <div className="absolute left-3 bottom-3 z-[1000] hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 text-[11px] shadow-md text-slate-700">
        <span className="font-bold text-slate-900">Traffic:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 rounded-full bg-red-500 inline-block" />
          <span>Heavy</span>
        </div>
      </div>

      {/* 4. BOTTOM-RIGHT: MODERN COMPACT NAVIGATION CONTROLS */}
      <div className="absolute right-3 bottom-4 z-[1000] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/80 shadow-md text-slate-700">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-200 my-0.5" />
        <button
          onClick={handleRecenter}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="Re-center Route View"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
