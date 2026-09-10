"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  MapPin,
  AlertTriangle,
  Radio,
  Fuel,
  Hospital,
  Coffee,
  ChevronRight,
  Maximize2,
  CheckCircle,
} from 'lucide-react';
import { RouteCalcResult } from '@/context/AppContext';

interface NavStep {
  id: number;
  icon: 'straight' | 'right' | 'left' | 'merge' | 'arrive';
  instruction: string;
  subtext?: string;
  distance: string;
  distanceMeters: number;
  highlight?: string;
}

interface GoogleStyleNavMapProps {
  routeResult: RouteCalcResult;
  showAlternativeRoute?: boolean;
  onToggleAlternative?: () => void;
  heightClass?: string;
}

export default function GoogleStyleNavMap({
  routeResult,
  showAlternativeRoute = false,
  onToggleAlternative,
  heightClass = "h-[500px] md:h-[600px]",
}: GoogleStyleNavMapProps) {
  // Navigation State Machine
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 3x, 6x
  const [progress, setProgress] = useState<number>(0); // 0.0 to 1.0 along the route
  const [currentSpeed, setCurrentSpeed] = useState<number>(58); // km/h
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map');
  const [showStepsDrawer, setShowStepsDrawer] = useState<boolean>(false);
  const [activeSearchFilter, setActiveSearchFilter] = useState<string | null>(null);

  // Turn-by-turn Navigation Steps
  const navSteps: NavStep[] = [
    {
      id: 1,
      icon: 'straight',
      instruction: `Head East on Freight Terminal Corridor towards GS Road`,
      subtext: `Clear road • Low traffic`,
      distance: '650 m',
      distanceMeters: 650,
    },
    {
      id: 2,
      icon: 'merge',
      instruction: `Merge onto NH-27 (East-West Highway) towards Nagaon`,
      subtext: `Take right ramp at Khanapara Junction (Signal: 30s)`,
      distance: '2.4 km',
      distanceMeters: 2400,
      highlight: '🚦 30s Signal',
    },
    {
      id: 3,
      icon: 'straight',
      instruction: `Continue on NH-27 through Sonapur Bypass`,
      subtext: `Pass Madanpur Toll Plaza (Fee: ₹120)`,
      distance: '48 km',
      distanceMeters: 48000,
      highlight: '🛣️ Toll ₹120',
    },
    {
      id: 4,
      icon: 'merge',
      instruction: `Take the exit onto NH-29 Eastern Corridor towards Dimapur`,
      subtext: `Pass Nazirakhat Toll Plaza (Fee: ₹85)`,
      distance: '142 km',
      distanceMeters: 142000,
      highlight: '🛣️ Toll ₹85',
    },
    {
      id: 5,
      icon: 'right',
      instruction: `Bear right for Medziphema Hill Climb towards Kohima`,
      subtext: `Caution: Mountain convoy congestion (72% traffic)`,
      distance: '38 km',
      distanceMeters: 38000,
      highlight: '⚠️ Hill Caution',
    },
    {
      id: 6,
      icon: 'straight',
      instruction: `Follow NH-29 / NH-102 south towards Imphal Valley`,
      subtext: `Pass Kanglatongbi Checkpoint`,
      distance: '135 km',
      distanceMeters: 135000,
    },
    {
      id: 7,
      icon: 'arrive',
      instruction: `Arrive at ${routeResult.destCity} Regional Logistics Hub`,
      subtext: `Destination will be on the left`,
      distance: '800 m',
      distanceMeters: 800,
    },
  ];

  // Primary Highway Polyline Points (SVG 0-800 X, 0-600 Y)
  // Guwahati -> Jorabat -> Nagaon -> Lumding -> Dimapur -> Kohima -> Imphal
  const routePoints = [
    { x: 260, y: 310 }, // Guwahati
    { x: 285, y: 318 }, // Jorabat
    { x: 330, y: 295 }, // Nagaon
    { x: 375, y: 335 }, // Lumding
    { x: 405, y: 340 }, // Dimapur
    { x: 438, y: 360 }, // Kohima
    { x: 420, y: 420 }, // Imphal
  ];

  // Alternative NH-37 Route (via Silchar)
  const altRoutePoints = [
    { x: 260, y: 310 },
    { x: 268, y: 360 },
    { x: 325, y: 410 },
    { x: 370, y: 415 },
    { x: 420, y: 420 },
  ];

  // Interpolate Vehicle Position along routePoints based on progress (0 to 1)
  const getVehiclePosition = (prog: number) => {
    const totalSegments = routePoints.length - 1;
    const scaledProg = Math.max(0, Math.min(prog, 0.9999)) * totalSegments;
    const segIndex = Math.floor(scaledProg);
    const segT = scaledProg - segIndex;

    const p1 = routePoints[segIndex];
    const p2 = routePoints[segIndex + 1] || p1;

    const x = p1.x + (p2.x - p1.x) * segT;
    const y = p1.y + (p2.y - p1.y) * segT;

    // Angle of vehicle orientation
    const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angleDeg = (angleRad * 180) / Math.PI;

    return { x, y, angle: angleDeg, segIndex };
  };

  const vehiclePos = getVehiclePosition(progress);

  // Active step in navigation
  const activeStepIndex = Math.min(
    Math.floor(progress * (navSteps.length - 1)),
    navSteps.length - 1
  );
  const activeStep = navSteps[activeStepIndex];
  const nextStep = navSteps[activeStepIndex + 1];

  // Remaining Distance and ETA calculations
  const remainingDistanceKm = Math.max(
    0,
    Math.round(routeResult.distanceKm * (1 - progress))
  );
  const totalMinutes = Math.round(routeResult.distanceKm / 45 * 60);
  const remainingMinutes = Math.max(0, Math.round(totalMinutes * (1 - progress)));
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  const remainingTimeString =
    remainingHours > 0
      ? `${remainingHours} hr ${remainingMins} min`
      : `${remainingMins} min`;

  // Estimated Arrival time based on remaining time
  const getArrivalTime = (remMins: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + remMins);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Drive Animation Effect
  useEffect(() => {
    if (!isNavigating || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          setIsNavigating(false);
          return 1;
        }
        // Advance progress
        const increment = 0.003 * simSpeed;
        const nextProg = Math.min(1, prev + increment);

        // Fluctuate speed slightly
        setCurrentSpeed(Math.round(56 + Math.sin(nextProg * 50) * 8));

        return nextProg;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isNavigating, isPaused, simSpeed]);

  // Voice Announcement via Web Speech API
  const speakInstruction = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Ignore audio failure gracefully
    }
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setIsPaused(false);
    setProgress(0);
    speakInstruction(`Starting navigation to ${routeResult.destCity}. In 650 meters, head east towards GS Road.`);
  };

  const handleExitNavigation = () => {
    setIsNavigating(false);
    setProgress(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const primarySvgPath = routePoints.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  const altSvgPath = altRoutePoints.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  return (
    <div
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden shadow-xl border border-slate-300 font-sans select-none flex flex-col bg-[#e6ecf2]`}
    >
      {/* =========================================================================
          1. GOOGLE MAPS NAVIGATION TOP HEADER (CLASSIC GREEN BANNER)
      ========================================================================= */}
      {isNavigating ? (
        <div className="absolute top-0 left-0 right-0 z-30 bg-[#0f9d58] text-white shadow-lg p-3 sm:p-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-start justify-between gap-3">
            {/* Maneuver Arrow & Big Distance */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                {activeStep.icon === 'merge' ? (
                  <Navigation className="w-7 h-7 text-white transform rotate-45" />
                ) : activeStep.icon === 'right' ? (
                  <div className="text-2xl font-black">↱</div>
                ) : activeStep.icon === 'arrive' ? (
                  <MapPin className="w-7 h-7 text-white" />
                ) : (
                  <div className="text-2xl font-black">↑</div>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">
                    In {activeStep.distance}
                  </span>
                  {activeStep.highlight && (
                    <span className="text-[10px] uppercase font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                      {activeStep.highlight}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug line-clamp-1">
                  {activeStep.instruction}
                </h3>
                {activeStep.subtext && (
                  <p className="text-xs text-emerald-100 mt-0.5 line-clamp-1">
                    {activeStep.subtext}
                  </p>
                )}
              </div>
            </div>

            {/* Audio Voice Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0 transition-colors"
              title={isMuted ? 'Unmute voice navigation' : 'Mute voice navigation'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Next Maneuver Preview Ribbon */}
          {nextStep && (
            <div className="mt-2 pt-2 border-t border-emerald-400/40 flex items-center justify-between text-xs text-emerald-100">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-white">Then:</span>
                <span className="truncate">{nextStep.instruction}</span>
              </div>
              <span className="font-bold text-white shrink-0 ml-2">{nextStep.distance}</span>
            </div>
          )}
        </div>
      ) : (
        /* Standby Top Search / Route Bar (Google Maps Style) */
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200 text-xs text-slate-800">
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold text-slate-900">
              {routeResult.sourceCity} ➔ {routeResult.destCity}
            </span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="font-semibold text-emerald-700">Fastest Route (NH-27)</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200">
            <button
              onClick={() => setMapType(mapType === 'map' ? 'satellite' : 'map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                mapType === 'satellite'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              {mapType === 'map' ? 'Satellite' : 'Map'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. FLOATING RIGHT-SIDE CONTROLS (COMPASS, SPEED, SEARCH, RECENTER)
      ========================================================================= */}
      <div className="absolute right-3 top-24 sm:top-28 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Speedometer (Only during navigation) */}
        {isNavigating && (
          <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-md border border-slate-200 text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-rose-600 text-slate-900 flex items-center justify-center font-black text-[11px] mb-0.5">
              60
            </div>
            <span className="text-sm font-black text-slate-900 leading-none">{currentSpeed}</span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase">km/h</span>
          </div>
        )}

        {/* Compass Button */}
        <button
          onClick={() => {}}
          className="p-2.5 bg-white/95 hover:bg-white text-slate-700 rounded-full shadow-md border border-slate-200 transition-transform active:rotate-45"
          title="Re-align to North"
        >
          <Compass className="w-5 h-5 text-rose-500" />
        </button>

        {/* Search Along Route Button */}
        <button
          onClick={() => setActiveSearchFilter(activeSearchFilter ? null : 'fuel')}
          className={`p-2.5 rounded-full shadow-md border transition-colors ${
            activeSearchFilter
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/95 hover:bg-white text-slate-700 border-slate-200'
          }`}
          title="Search along route"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Recenter Button */}
        <button
          onClick={() => {}}
          className="p-2.5 bg-white/95 hover:bg-white text-blue-600 rounded-full shadow-md border border-slate-200"
          title="Recenter on vehicle"
        >
          <Radio className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Amenities Filter Bar (When Search is clicked) */}
      {activeSearchFilter && (
        <div className="absolute top-20 left-3 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200 text-xs animate-in slide-in-from-left duration-150">
          <button
            onClick={() => setActiveSearchFilter('fuel')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
              activeSearchFilter === 'fuel' ? 'bg-amber-500 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Fuel Stations</span>
          </button>
          <button
            onClick={() => setActiveSearchFilter('hospital')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
              activeSearchFilter === 'hospital' ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Hospitals</span>
          </button>
          <button
            onClick={() => setActiveSearchFilter('food')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
              activeSearchFilter === 'food' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Rest Stops</span>
          </button>
          <button
            onClick={() => setActiveSearchFilter(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          3. GOOGLE MAPS DIGITAL CARTOGRAPHY (CANVAS / SVG)
      ========================================================================= */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <svg
          viewBox="180 160 380 320"
          className="w-full h-full object-cover transition-all duration-300"
          style={{
            background: mapType === 'satellite' ? '#1c2833' : '#f0f4f8',
          }}
        >
          <defs>
            {/* Soft map pattern */}
            <pattern id="gmap-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke={mapType === 'satellite' ? '#2c3e50' : '#e2e8f0'}
                strokeWidth="1"
              />
            </pattern>

            {/* Google Maps Route Glow / Border Filter */}
            <filter id="nav-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
            </filter>
            <filter id="puck-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(26,115,232,0.5)" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect x="0" y="0" width="800" height="600" fill="url(#gmap-grid)" />

          {/* Realistic River Brahmaputra */}
          <path
            d="M 640 180 Q 520 195 440 240 T 330 280 T 220 300 T 170 310"
            fill="none"
            stroke={mapType === 'satellite' ? '#1b4f72' : '#a8d5f5'}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Secondary Street Grid (Grey & White Google style) */}
          <g opacity={mapType === 'satellite' ? '0.3' : '0.7'}>
            <path
              d="M 220 280 L 290 270 L 360 250 L 450 230 M 260 310 L 268 360 M 330 295 L 345 265 M 405 340 L 465 285 M 325 410 L 420 420"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 220 280 L 290 270 L 360 250 L 450 230 M 260 310 L 268 360 M 330 295 L 345 265 M 405 340 L 465 285 M 325 410 L 420 420"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* Alternative Route (NH-37 Greyed Out in Google Maps style) */}
          {showAlternativeRoute && (
            <g className="cursor-pointer" onClick={onToggleAlternative}>
              <path
                d={altSvgPath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={altSvgPath}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Alternative Route Label Bubble */}
              <rect x="330" y="385" width="84" height="20" rx="6" fill="#475569" />
              <text x="372" y="399" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                NH-37 • +45 min
              </text>
            </g>
          )}

          {/* ================================================================
              ACTIVE NAVIGATION ROUTE POLYLINE (GOOGLE BLUE + TRAFFIC SEGMENTS)
          ================================================================ */}
          <g filter="url(#nav-glow)">
            {/* Outer Blue Route Border */}
            <path
              d={primarySvgPath}
              fill="none"
              stroke="#1557bf"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Google Traffic Segments Along Route */}
            {/* Segment 1: Guwahati to Nagaon (Free Flow - Green) */}
            <path
              d="M 260 310 L 285 318 L 330 295"
              fill="none"
              stroke="#1a73e8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Segment 2: Nagaon to Dimapur (Moderate - Orange/Amber) */}
            <path
              d="M 330 295 L 375 335 L 405 340"
              fill="none"
              stroke="#f29900"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Segment 3: Dimapur to Kohima Hill climb (Heavy Traffic - Red 72%) */}
            <path
              d="M 405 340 L 438 360"
              fill="none"
              stroke="#d93025"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Segment 4: Kohima to Imphal (Clear - Google Blue) */}
            <path
              d="M 438 360 L 420 420"
              fill="none"
              stroke="#1a73e8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Road Shields [NH 27], [NH 29] (Google Maps style) */}
          <g id="road-shields">
            {/* NH-27 Shield */}
            <rect x="295" y="300" width="34" height="14" rx="4" fill="#ffffff" stroke="#0f9d58" strokeWidth="1.5" />
            <text x="312" y="310.5" fill="#0f9d58" fontSize="8" fontWeight="bold" textAnchor="middle">
              NH 27
            </text>

            {/* NH-29 Shield */}
            <rect x="382" y="325" width="34" height="14" rx="4" fill="#ffffff" stroke="#1a73e8" strokeWidth="1.5" />
            <text x="399" y="335.5" fill="#1a73e8" fontSize="8" fontWeight="bold" textAnchor="middle">
              NH 29
            </text>
          </g>

          {/* Toll Plazas along Route */}
          <g id="tolls">
            {/* Madanpur Toll */}
            <g transform="translate(285, 318)">
              <circle cx="0" cy="0" r="5" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="-18" y="-18" width="36" height="13" rx="4" fill="#1e3a8a" />
              <text x="0" y="-9" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                ₹120 Toll
              </text>
            </g>

            {/* Nazirakhat Toll */}
            <g transform="translate(375, 335)">
              <circle cx="0" cy="0" r="5" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="-16" y="-18" width="32" height="13" rx="4" fill="#1e3a8a" />
              <text x="0" y="-9" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                ₹85 Toll
              </text>
            </g>
          </g>

          {/* Origin Pin (Guwahati) */}
          <g transform="translate(260, 310)">
            <circle cx="0" cy="0" r="6" fill="#1a73e8" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="-10" fill="#0f172a" fontSize="9" fontWeight="bold" textAnchor="middle">
              {routeResult.sourceCity}
            </text>
          </g>

          {/* Destination Pin (Imphal) - Classic Red Google Pin */}
          <g transform="translate(420, 420)">
            <circle cx="0" cy="0" r="14" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
            <path
              d="M 0 0 C -6 -6 -8 -12 -8 -16 C -8 -22 -3 -26 0 -26 C 3 -26 8 -22 8 -16 C 8 -12 6 -6 0 0 Z"
              fill="#ea4335"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="-16" r="3.5" fill="#ffffff" />
            <text x="0" y="14" fill="#0f172a" fontSize="9.5" fontWeight="900" textAnchor="middle">
              {routeResult.destCity}
            </text>
          </g>

          {/* ================================================================
              ANIMATED DRIVING VEHICLE PUCK (GOOGLE BLUE NAVIGATION CHEVRON)
          ================================================================ */}
          {isNavigating && (
            <g
              transform={`translate(${vehiclePos.x}, ${vehiclePos.y}) rotate(${vehiclePos.angle})`}
              filter="url(#puck-glow)"
              className="transition-transform duration-100"
            >
              {/* Pulsing Light Blue Accuracy Halo */}
              <circle cx="0" cy="0" r="18" fill="#4285f4" fillOpacity="0.25" className="animate-ping" />
              {/* Blue Outer Disc */}
              <circle cx="0" cy="0" r="11" fill="#1a73e8" stroke="#ffffff" strokeWidth="2.5" />
              {/* White Directional Chevron Arrow */}
              <path d="M -4 -5 L 5 0 L -4 5 L -1 0 Z" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>

      {/* =========================================================================
          4. GOOGLE MAPS BOTTOM BAR (STANDBY PREVIEW VS ACTIVE NAVIGATION)
      ========================================================================= */}
      {isNavigating ? (
        /* Active Navigation Bottom Sheet */
        <div className="bg-white border-t border-slate-200 p-4 sm:p-5 shadow-2xl z-30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Remaining Time & Distance */}
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#0f9d58]">
                  {remainingTimeString}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  ({remainingDistanceKm} km)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Expected Arrival: <span className="font-bold text-slate-800">{getArrivalTime(remainingMinutes)}</span> • Vehicle: {routeResult.vehicle.name}
              </p>
            </div>

            {/* Drive Simulation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                title={isPaused ? 'Resume Driving' : 'Pause Driving'}
              >
                {isPaused ? <Play className="w-5 h-5 text-emerald-600" /> : <Pause className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setSimSpeed(simSpeed === 1 ? 3 : simSpeed === 3 ? 6 : 1)}
                className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                title="Simulation Speed Multiplier"
              >
                {simSpeed}x Demo
              </button>

              <button
                onClick={() => setShowStepsDrawer(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
              >
                <span>Steps</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Red Exit Navigation Button (Google Maps Style) */}
              <button
                onClick={handleExitNavigation}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs sm:text-sm border border-rose-200 flex items-center gap-1.5"
                title="Exit Navigation"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Standby Route Preview Bottom Bar (Google Maps Style) */
        <div className="bg-white border-t border-slate-200 p-4 sm:p-5 shadow-lg z-30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700">
                  {routeResult.eta}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  ({routeResult.distanceKm} km)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  Fastest
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Via NH-27 & NH-29 • Route Safety Score: <span className="font-bold text-emerald-700">{routeResult.routeScore}/100</span>
              </p>
            </div>

            {/* START NAVIGATION BUTTON */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStepsDrawer(true)}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors"
              >
                Steps & Details
              </button>

              <button
                onClick={handleStartNavigation}
                className="px-6 py-3 rounded-2xl bg-[#1a73e8] hover:bg-[#1557bf] text-white font-black text-xs sm:text-sm shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>Start Navigation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. EXPANDABLE TURN-BY-TURN DIRECTIONS DRAWER (GOOGLE MAPS STYLE)
      ========================================================================= */}
      {showStepsDrawer && (
        <div className="absolute inset-0 z-40 bg-white flex flex-col animate-in slide-in-from-bottom duration-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-black text-base text-slate-900">Turn-by-Turn Directions</h3>
              <p className="text-xs text-slate-500">
                {routeResult.sourceCity} ➔ {routeResult.destCity} ({routeResult.distanceKm} km)
              </p>
            </div>
            <button
              onClick={() => setShowStepsDrawer(false)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 space-y-2 text-xs sm:text-sm">
            {navSteps.map((s, idx) => (
              <div key={s.id} className="pt-3 pb-2 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-bold text-slate-900 leading-snug">{s.instruction}</p>
                  {s.subtext && <p className="text-xs text-slate-500">{s.subtext}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-slate-600">{s.distance}</span>
                  {s.highlight && (
                    <span className="block text-[10px] font-bold text-emerald-700">
                      {s.highlight}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Total Distance: <span className="font-bold text-slate-900">{routeResult.distanceKm} km</span> • Toll: ₹{routeResult.tollCost}
            </span>
            <button
              onClick={() => {
                setShowStepsDrawer(false);
                if (!isNavigating) handleStartNavigation();
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              {isNavigating ? 'Resume Navigation' : 'Start Navigation Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
