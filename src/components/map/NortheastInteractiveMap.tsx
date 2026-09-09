"use client";

import React, { useState } from 'react';
import {
  NORTHEAST_STATES,
  TOLL_GATES,
  TRAFFIC_SIGNALS,
  HIGHWAY_ROUTES,
  CityNode,
} from '@/data/northeastData';
import { RISK_ALERTS, ACCESSIBILITY_SERVICES } from '@/data/mockLogistics';
import {
  ZoomIn,
  ZoomOut,
  Layers,
  AlertTriangle,
  Radio,
  MapPin,
  ShieldAlert,
  Navigation,
  Sparkles,
  Info,
} from 'lucide-react';

interface NortheastInteractiveMapProps {
  highlightRoute?: boolean;
  showAlternative?: boolean;
  activeShipmentPoint?: { x: number; y: number; label?: string };
  emergencyFocus?: boolean;
  interactive?: boolean;
  heightClass?: string;
  zoomLevel?: 'state' | 'district' | 'local';
}

export default function NortheastInteractiveMap({
  highlightRoute = true,
  showAlternative = false,
  activeShipmentPoint,
  emergencyFocus = false,
  interactive = true,
  heightClass = "h-[450px] md:h-[540px]",
  zoomLevel: propZoomLevel,
}: NortheastInteractiveMapProps) {
  const [zoom, setZoom] = useState<'state' | 'district' | 'local'>(propZoomLevel || 'district');
  const [selectedCity, setSelectedCity] = useState<CityNode | null>(null);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showTolls, setShowTolls] = useState<boolean>(true);
  const [showSignals, setShowSignals] = useState<boolean>(true);
  const [showRisks, setShowRisks] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Highway corridors
  const primaryRoute = HIGHWAY_ROUTES[0];
  const altRoute = HIGHWAY_ROUTES[1];

  const primaryPathD = primaryRoute.points.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  const altPathD = altRoute.points.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  return (
    <div className={`relative w-full ${heightClass} bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-md text-slate-100 select-none flex flex-col`}>
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">NE Regional Vector Map</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            {zoom === 'state' ? 'State Level' : zoom === 'district' ? 'District & Corridors' : 'High Zoom (Local Roads)'}
          </span>
        </div>

        {/* Layer Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 text-xs shadow-sm">
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
              showTraffic ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Traffic Density"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            Traffic
          </button>
          <button
            onClick={() => setShowSignals(!showSignals)}
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showSignals ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Traffic Signals"
          >
            🚦 Signals
          </button>
          <button
            onClick={() => setShowTolls(!showTolls)}
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showTolls ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Toll Gates"
          >
            🛣️ Tolls
          </button>
          <button
            onClick={() => setShowRisks(!showRisks)}
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showRisks ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Risk Zones"
          >
            ⚠️ Risks
          </button>
          <button
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showFacilities ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Accessibility Services"
          >
            🏥 Services
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-3 bottom-14 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md">
        <button
          onClick={() => setZoom(zoom === 'state' ? 'district' : 'local')}
          disabled={zoom === 'local'}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(zoom === 'local' ? 'district' : 'state')}
          disabled={zoom === 'state'}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Traffic Legend Bar */}
      <div className="absolute left-3 bottom-3 z-20 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs shadow-sm">
        <span className="font-semibold text-slate-300">Live Traffic:</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-emerald-500 inline-block" />
          <span className="text-slate-300">Low (0-35%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-amber-500 inline-block" />
          <span className="text-slate-300">Moderate (36-70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-red-500 inline-block" />
          <span className="text-slate-300">Heavy (&gt;70%)</span>
        </div>
      </div>

      {/* SVG Digital Map Canvas */}
      <svg
        viewBox="50 110 650 450"
        className="w-full h-full object-contain cursor-grab active:cursor-grabbing transition-transform duration-300"
        style={{
          transform: zoom === 'local' ? 'scale(1.28) translate(-40px, -20px)' : zoom === 'state' ? 'scale(0.92)' : 'scale(1)',
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          </pattern>

          {/* Route Glow Filters */}
          <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="emergency-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect x="0" y="0" width="800" height="600" fill="url(#grid)" />

        {/* River Brahmaputra Flow Simulation */}
        <path
          d="M 640 180 Q 520 195 440 240 T 330 280 T 220 300 T 170 310"
          fill="none"
          stroke="#0284c7"
          strokeWidth="6"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />

        {/* State Boundaries */}
        <g id="states-layer">
          {NORTHEAST_STATES.map((state) => (
            <g key={state.id}>
              <path
                d={state.svgPath}
                fill={state.color}
                fillOpacity="0.12"
                stroke={state.color}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="transition-all hover:fill-opacity-25"
              />
              {/* State Name Label */}
              <text
                x={state.cities[0]?.x || 300}
                y={(state.cities[0]?.y || 300) - 18}
                fill={state.color}
                fontSize="11"
                fontWeight="700"
                letterSpacing="1"
                textAnchor="middle"
                opacity="0.85"
                className="pointer-events-none"
              >
                {state.name.toUpperCase()}
              </text>
            </g>
          ))}
        </g>

        {/* Highway Networks */}
        <g id="highways-layer">
          {/* Connecting secondary road network */}
          <path
            d="M 120 235 L 260 310 L 268 360 L 288 450 M 260 310 L 365 220 M 440 250 L 530 200 L 615 180 M 325 410 L 365 470 L 365 510"
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.5"
          />

          {/* Alternative Route (NH-37 Southern Hill corridor) */}
          {showAlternative && (
            <g>
              <path
                d={altPathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                opacity="0.85"
              />
            </g>
          )}

          {/* Recommended Route (NH-27 / NH-29 Eastern Corridor) */}
          {highlightRoute && (
            <g filter="url(#route-glow)">
              {/* Outer soft glow line */}
              <path
                d={primaryPathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="8"
                strokeOpacity="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Live Route Segments: Traffic colored */}
              {showTraffic ? (
                <>
                  {/* Guwahati -> Nagaon: Low Traffic (Green) */}
                  <path
                    d="M 260 310 L 285 318 L 330 295"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Nagaon -> Lumding -> Dimapur: Moderate Traffic (Yellow/Orange) */}
                  <path
                    d="M 330 295 L 375 335 L 405 340"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Dimapur -> Kohima: Heavy Hill Traffic (Red - 72%) */}
                  <path
                    d="M 405 340 L 438 360"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Kohima -> Imphal: Low Traffic (Green) */}
                  <path
                    d="M 438 360 L 420 420"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <path
                  d={primaryPathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          )}
        </g>

        {/* Toll Gates */}
        {showTolls && (
          <g id="tolls-layer">
            {TOLL_GATES.map((toll) => (
              <g
                key={toll.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredItem(`${toll.name} – ₹${toll.cost}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <circle cx={toll.x} cy={toll.y} r="8" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
                <text
                  x={toll.x}
                  y={toll.y + 3.5}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ₹
                </text>
                <rect
                  x={toll.x - 30}
                  y={toll.y - 20}
                  width="60"
                  height="14"
                  rx="4"
                  fill="#0f172a"
                  stroke="#3b82f6"
                  strokeWidth="1"
                  className="opacity-90 group-hover:opacity-100"
                />
                <text
                  x={toll.x}
                  y={toll.y - 10}
                  fill="#93c5fd"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {toll.highway} ₹{toll.cost}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Traffic Signals */}
        {showSignals && (
          <g id="signals-layer">
            {TRAFFIC_SIGNALS.map((sig) => (
              <g
                key={sig.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredItem(`${sig.name} (${sig.durationSec}s)`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <circle
                  cx={sig.x}
                  cy={sig.y}
                  r="7"
                  fill={sig.status === 'green' ? '#059669' : sig.status === 'yellow' ? '#d97706' : '#dc2626'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={sig.x}
                  y={sig.y - 10}
                  fill="#fef08a"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  🚦 {sig.durationSec}s
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Risk Alerts & Blockages */}
        {showRisks && (
          <g id="risks-layer">
            {RISK_ALERTS.map((alert) => (
              <g
                key={alert.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredItem(`⚠️ ${alert.category} [${alert.severity} ${alert.percentage}%] - ${alert.location}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <circle
                  cx={alert.x}
                  cy={alert.y}
                  r={alert.severity === 'HIGH' ? '12' : '9'}
                  fill={alert.severity === 'HIGH' ? '#ef4444' : '#f59e0b'}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
                <circle
                  cx={alert.x}
                  cy={alert.y}
                  r="6"
                  fill={alert.severity === 'HIGH' ? '#ef4444' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={alert.x}
                  y={alert.y + 14}
                  fill={alert.severity === 'HIGH' ? '#fca5a5' : '#fde047'}
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {alert.category} {alert.percentage}%
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Accessibility Services (Hospitals, Fuel, Warehouses) */}
        {showFacilities && (
          <g id="facilities-layer">
            {ACCESSIBILITY_SERVICES.map((fac) => (
              <g
                key={fac.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredItem(`${fac.name} (${fac.type})`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <circle cx={fac.x} cy={fac.y} r="6" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x={fac.x}
                  y={fac.y - 8}
                  fill="#e9d5ff"
                  fontSize="7.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {fac.type === 'Hospital' ? '🏥 Hospital' : fac.type === 'Fuel Station' ? '⛽ Fuel' : '📦 Hub'}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Active Shipment Pin (Live Tracking) */}
        {activeShipmentPoint && (
          <g filter="url(#emergency-glow)">
            <circle
              cx={activeShipmentPoint.x}
              cy={activeShipmentPoint.y}
              r="16"
              fill="#06b6d4"
              fillOpacity="0.4"
              className="animate-ping"
            />
            <circle
              cx={activeShipmentPoint.x}
              cy={activeShipmentPoint.y}
              r="8"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <rect
              x={activeShipmentPoint.x - 45}
              y={activeShipmentPoint.y - 28}
              width="90"
              height="18"
              rx="4"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x={activeShipmentPoint.x}
              y={activeShipmentPoint.y - 16}
              fill="#ffffff"
              fontSize="8.5"
              fontWeight="bold"
              textAnchor="middle"
            >
              🚛 {activeShipmentPoint.label || 'Active Fleet'}
            </text>
          </g>
        )}

        {/* Cities & District Nodes (Filtered by Zoom) */}
        <g id="cities-layer">
          {NORTHEAST_STATES.flatMap((s) => s.cities).map((city) => {
            // Visibility logic per zoom level
            const isVisible =
              zoom === 'local'
                ? true
                : zoom === 'district'
                ? city.hubType === 'major' || city.hubType === 'secondary'
                : city.hubType === 'major';

            if (!isVisible) return null;

            const isMajor = city.hubType === 'major';

            return (
              <g
                key={city.name}
                className="cursor-pointer group"
                onClick={() => setSelectedCity(city)}
                onMouseEnter={() => setHoveredItem(`${city.name}, ${city.district}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isMajor ? 4.5 : 3}
                  fill={isMajor ? '#38bdf8' : '#94a3b8'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className="group-hover:fill-emerald-400 transition-colors"
                />
                <text
                  x={city.x}
                  y={city.y - 7}
                  fill={isMajor ? '#f8fafc' : '#cbd5e1'}
                  fontSize={isMajor ? '9.5' : '8'}
                  fontWeight={isMajor ? '700' : '500'}
                  textAnchor="middle"
                  className="drop-shadow"
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Dynamic Hover Tooltip / Status Display */}
      {hoveredItem && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-cyan-300 border border-cyan-500/50 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md">
          {hoveredItem}
        </div>
      )}

      {/* Selected City Modal Popover */}
      {selectedCity && (
        <div className="absolute right-3 top-14 z-30 bg-slate-900/95 border border-slate-700 text-slate-100 p-3 rounded-xl shadow-xl max-w-xs text-xs">
          <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-700">
            <span className="font-bold text-sm text-cyan-400">{selectedCity.name}</span>
            <button
              onClick={() => setSelectedCity(null)}
              className="text-slate-400 hover:text-white text-sm leading-none"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-slate-300">
            <p><span className="text-slate-500">District:</span> {selectedCity.district}</p>
            <p><span className="text-slate-500">Hub Class:</span> <span className="capitalize font-semibold text-emerald-400">{selectedCity.hubType || 'Secondary'}</span></p>
            {selectedCity.population && <p><span className="text-slate-500">Est. Population:</span> {selectedCity.population}</p>}
            <p><span className="text-slate-500">Highway Access:</span> Connected via NH Corridor</p>
          </div>
        </div>
      )}
    </div>
  );
}
