"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { NORTHEAST_STATES, VEHICLE_OPTIONS, getVillagesForDistrict } from '@/data/northeastData';
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
  MapPin,
  LocateFixed,
  RotateCcw,
} from 'lucide-react';

export default function RouteOptimizationView() {
  const {
    currentRouteResult,
    calculateRoute,
    clearPreviousRoute,
    isRouteCalculating,
    routeError,
    setActiveView,
    t,
  } = useApp();

  const [sourceState, setSourceState] = useState<string>(currentRouteResult?.sourceState || 'Assam');
  const [sourceCity, setSourceCity] = useState<string>(currentRouteResult?.sourceCity || 'Guwahati');
  const [sourceVillage, setSourceVillage] = useState<string>(currentRouteResult?.sourceVillage || 'Dispur');

  const [destState, setDestState] = useState<string>(currentRouteResult?.destState || 'Manipur');
  const [destCity, setDestCity] = useState<string>(currentRouteResult?.destCity || 'Imphal');
  const [destVillage, setDestVillage] = useState<string>(currentRouteResult?.destVillage || 'Imphal City');

  const [vehicleId, setVehicleId] = useState<string>(currentRouteResult?.vehicle?.id || 'mini_truck');
  const [showAltRoute, setShowAltRoute] = useState<boolean>(false);

  // Live Geolocation State
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState<boolean>(
    Boolean(currentRouteResult?.isCurrentLocation)
  );
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{
    lat: number;
    lng: number;
    label?: string;
  } | null>(currentRouteResult?.currentLocationCoords || null);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Synchronize state if active route changes externally (e.g. from localStorage or initial load)
  useEffect(() => {
    if (currentRouteResult) {
      setSourceState(currentRouteResult.sourceState);
      setSourceCity(currentRouteResult.sourceCity);
      if (currentRouteResult.sourceVillage) {
        setSourceVillage(currentRouteResult.sourceVillage);
      }
      setDestState(currentRouteResult.destState);
      setDestCity(currentRouteResult.destCity);
      if (currentRouteResult.destVillage) {
        setDestVillage(currentRouteResult.destVillage);
      }
      if (currentRouteResult.vehicle?.id) {
        setVehicleId(currentRouteResult.vehicle.id);
      }
      if (currentRouteResult.isCurrentLocation && currentRouteResult.currentLocationCoords) {
        setIsUsingCurrentLocation(true);
        setCurrentLocationCoords(currentRouteResult.currentLocationCoords);
      }
    }
  }, [currentRouteResult.routeId]);

  // Clean up geolocation watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Cascading District / City options
  const sourceStateObj = useMemo(
    () => NORTHEAST_STATES.find((s) => s.name === sourceState) || NORTHEAST_STATES[0],
    [sourceState]
  );
  const destStateObj = useMemo(
    () => NORTHEAST_STATES.find((s) => s.name === destState) || NORTHEAST_STATES[2],
    [destState]
  );

  // Cascading Village / Town options (Req #1 & #2)
  const sourceVillages = useMemo(() => {
    return getVillagesForDistrict(sourceState, sourceCity);
  }, [sourceState, sourceCity]);

  const destVillages = useMemo(() => {
    return getVillagesForDistrict(destState, destCity);
  }, [destState, destCity]);

  // 1. Cascading Source Handlers
  const handleSourceStateChange = (stateName: string) => {
    setSourceState(stateName);
    const targetState = NORTHEAST_STATES.find((s) => s.name === stateName);
    if (targetState && targetState.cities.length > 0) {
      const defaultCity = targetState.cities[0].name;
      setSourceCity(defaultCity);
      const vList = getVillagesForDistrict(stateName, defaultCity);
      setSourceVillage(vList[0]?.name || '');
    }
    setValidationError(null);
  };

  const handleSourceCityChange = (cityName: string) => {
    setSourceCity(cityName);
    const vList = getVillagesForDistrict(sourceState, cityName);
    setSourceVillage(vList[0]?.name || '');
    setValidationError(null);
  };

  // 2. Cascading Destination Handlers
  const handleDestStateChange = (stateName: string) => {
    setDestState(stateName);
    const targetState = NORTHEAST_STATES.find((s) => s.name === stateName);
    if (targetState && targetState.cities.length > 0) {
      const defaultCity = targetState.cities[0].name;
      setDestCity(defaultCity);
      const vList = getVillagesForDistrict(stateName, defaultCity);
      setDestVillage(vList[0]?.name || '');
    }
    setValidationError(null);
  };

  const handleDestCityChange = (cityName: string) => {
    setDestCity(cityName);
    const vList = getVillagesForDistrict(destState, cityName);
    setDestVillage(vList[0]?.name || '');
    setValidationError(null);
  };

  // 3. "📍 Use Current Location" Geolocation Handler (Req #3, #9, #10)
  const stopLocationWatch = () => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleToggleCurrentLocation = () => {
    if (isUsingCurrentLocation) {
      // User chooses to switch back to manual selection
      stopLocationWatch();
      setIsUsingCurrentLocation(false);
      setCurrentLocationCoords(null);
      setLocationNotice(null);
      return;
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser. Please select your source manually.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationNotice(null);
    setValidationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const label = `Current Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
        const coords = { lat, lng, label };

        setCurrentLocationCoords(coords);
        setIsUsingCurrentLocation(true);
        setIsDetectingLocation(false);
        setLocationNotice(`📍 GPS Location detected: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);

        // Continuous watch with movement threshold (Req #10)
        let lastLat = lat;
        let lastLng = lng;
        let lastCalcTime = Date.now();

        stopLocationWatch();
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const newLat = watchPos.coords.latitude;
            const newLng = watchPos.coords.longitude;
            const dLat = Math.abs(newLat - lastLat);
            const dLng = Math.abs(newLng - lastLng);
            const elapsed = Date.now() - lastCalcTime;

            // Recalculate route/distance/ETA only when movement is meaningful (>150m or ~0.0015 deg) and elapsed > 20s
            if ((dLat > 0.0015 || dLng > 0.0015) && elapsed > 20000) {
              lastLat = newLat;
              lastLng = newLng;
              lastCalcTime = Date.now();
              const updatedCoords = {
                lat: newLat,
                lng: newLng,
                label: `Current Location (${newLat.toFixed(4)}°N, ${newLng.toFixed(4)}°E)`,
              };
              setCurrentLocationCoords(updatedCoords);

              // Recalculate active route with new GPS coordinates
              calculateRoute(sourceState, sourceCity, destState, destCity, vehicleId, {
                sourceVillage,
                destVillage,
                isCurrentLocation: true,
                currentLocationCoords: updatedCoords,
              });
            }
          },
          (err) => {
            console.warn('[ARKA Geolocation Watch Error]', err.message);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
        );
      },
      (err) => {
        setIsDetectingLocation(false);
        setIsUsingCurrentLocation(false);
        let msg = 'Unable to retrieve your current location. Please select your source manually.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can select your departure location manually using the State, District, and Village selectors below.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS location is currently unavailable. Please select your departure location manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or select manually.';
        }
        setLocationNotice(msg);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // 4. FIND BEST ROUTE Execution (Req #5, #15, #18)
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation 1: Source completeness
    if (!isUsingCurrentLocation && (!sourceState || !sourceCity || !sourceVillage)) {
      setValidationError('Please select complete Source Location (State, District/City, and Village/Town).');
      return;
    }

    // Validation 2: Destination completeness
    if (!destState || !destCity || !destVillage) {
      setValidationError('Please select complete Destination Location (State, District/City, and Village/Town).');
      return;
    }

    // Validation 3: Source and Destination cannot be the same
    if (!isUsingCurrentLocation) {
      const isSameLoc =
        sourceState.toLowerCase() === destState.toLowerCase() &&
        sourceCity.toLowerCase() === destCity.toLowerCase() &&
        sourceVillage.toLowerCase() === destVillage.toLowerCase();

      if (isSameLoc) {
        setValidationError('Source and Destination cannot be the same village. Please choose different locations.');
        return;
      }
    }

    // Clear previous alternative route on new search (Req #5 & #8)
    setShowAltRoute(false);
    clearPreviousRoute();

    // Calculate active route with exact village / GPS coordinates
    await calculateRoute(sourceState, sourceCity, destState, destCity, vehicleId, {
      sourceVillage: isUsingCurrentLocation ? undefined : sourceVillage,
      destVillage,
      isCurrentLocation: isUsingCurrentLocation,
      currentLocationCoords: isUsingCurrentLocation && currentLocationCoords ? currentLocationCoords : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
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
          Select your departure and arrival village hubs in Northeast India. ARKA AI evaluates slope gradients, traffic density, toll stations, and landslide vulnerabilities.
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
              Cascading Village Selectors
            </span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            {/* SOURCE SELECTION SECTION (Req #1 & #3) */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Source Location (Origin)</span>
                </div>

                {/* 📍 Use Current Location Button (Req #3) */}
                <button
                  type="button"
                  onClick={handleToggleCurrentLocation}
                  disabled={isDetectingLocation}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isUsingCurrentLocation
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm hover:bg-emerald-700'
                      : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  }`}
                  title="Detect and use current device GPS location as route origin"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isUsingCurrentLocation ? '✓ GPS Active' : '📍 Use Current Location'}</span>
                </button>
              </div>

              {/* Geolocation Notice / Status Bar */}
              {locationNotice && (
                <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                  isUsingCurrentLocation
                    ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}>
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <div className="flex-1 text-[11px] leading-relaxed">
                    <span>{locationNotice}</span>
                    {isUsingCurrentLocation && (
                      <button
                        type="button"
                        onClick={handleToggleCurrentLocation}
                        className="block mt-1 font-semibold text-blue-700 underline hover:text-blue-900"
                      >
                        Switch back to manual selection
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Source State Selector */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {t('sourceState')}
                </label>
                <select
                  disabled={isUsingCurrentLocation}
                  value={sourceState}
                  onChange={(e) => handleSourceStateChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isUsingCurrentLocation
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-300'
                  }`}
                >
                  {NORTHEAST_STATES.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source District/City Selector */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {t('sourceCity')} (District)
                </label>
                <select
                  disabled={isUsingCurrentLocation}
                  value={sourceCity}
                  onChange={(e) => handleSourceCityChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isUsingCurrentLocation
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-300'
                  }`}
                >
                  {sourceStateObj.cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name} ({city.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Village / Town Selector (Req #1) */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Village / Town (Origin)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {sourceVillages.length} Villages
                  </span>
                </label>
                <select
                  disabled={isUsingCurrentLocation}
                  value={sourceVillage}
                  onChange={(e) => {
                    setSourceVillage(e.target.value);
                    setValidationError(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isUsingCurrentLocation
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-emerald-950 border-emerald-300'
                  }`}
                >
                  {sourceVillages.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} {v.type ? `(${v.type})` : ''}
                    </option>
                  ))}
                </select>
                {isUsingCurrentLocation && (
                  <p className="text-[10px] text-emerald-700 mt-1 font-medium italic">
                    ✓ Using exact live GPS device coordinates as route origin.
                  </p>
                )}
              </div>
            </div>

            {/* DESTINATION SELECTION SECTION (Req #2) */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
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

              {/* Destination District/City */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {t('destCity')} (District)
                </label>
                <select
                  value={destCity}
                  onChange={(e) => handleDestCityChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {destStateObj.cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name} ({city.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Village / Town Selector (Req #2) */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Village / Town (Destination)</span>
                  <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    {destVillages.length} Villages
                  </span>
                </label>
                <select
                  value={destVillage}
                  onChange={(e) => {
                    setDestVillage(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs sm:text-sm bg-white font-semibold text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {destVillages.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} {v.type ? `(${v.type})` : ''}
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

            {/* Validation Notice (Req #18) */}
            {validationError && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Input Requirement</p>
                  <p className="text-amber-800 leading-relaxed">{validationError}</p>
                </div>
              </div>
            )}

            {/* Routing Error Notice */}
            {routeError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Routing Notice</p>
                  <p className="text-rose-700 leading-relaxed">{routeError}</p>
                </div>
              </div>
            )}

            {/* FIND BEST ROUTE Button */}
            <button
              type="submit"
              disabled={isRouteCalculating}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:opacity-95 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isRouteCalculating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Real Road Route...</span>
                </>
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
          <div
            className={`bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 transition-opacity duration-200 ${
              isRouteCalculating ? 'opacity-60' : 'opacity-100'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {t('recommendedRoute')}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {currentRouteResult.isCurrentLocation ? (
                    <span className="text-emerald-700 font-bold">
                      📍 {currentRouteResult.currentLocationCoords?.label || 'Current Location'}
                    </span>
                  ) : (
                    <>
                      {currentRouteResult.sourceVillage || currentRouteResult.sourceCity}
                      <span className="text-xs text-slate-500 font-normal">
                        {' '}({currentRouteResult.sourceCity}, {currentRouteResult.sourceState})
                      </span>
                    </>
                  )}
                  {' '}➔{' '}
                  {currentRouteResult.destVillage || currentRouteResult.destCity}
                  <span className="text-xs text-slate-500 font-normal">
                    {' '}({currentRouteResult.destCity}, {currentRouteResult.destState})
                  </span>
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

            {/* Metrics Breakdown Grid (Req #6 & #11) */}
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

            {/* Risk & Accessibility Status Badges (Req #6 & #7) */}
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

            {/* AI Explanation Box (Req #14) */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>ARKA AI Route Selection Rationale:</span>
              </div>
              <p className="leading-relaxed font-medium">
                &ldquo;{currentRouteResult.reasoning}&rdquo;
              </p>
            </div>

            {/* Alternative Route Toggle Button (Req #8) */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAltRoute(!showAltRoute)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  showAltRoute
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {showAltRoute ? '✕ Hide Alternative Route' : '🔀 Show Alternative Route'}
              </button>

              <button
                onClick={() => setActiveView('arka-assistant')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ask ARKA Assistant about this route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alternative Route Comparison Card if Active (Req #8) */}
            {showAltRoute && (
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">
                    Alternative Bypass Route: {currentRouteResult.destVillage || currentRouteResult.destCity} Corridor
                  </span>
                  <StatusBadge level="MEDIUM" text="Alternative Flow" size="sm" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-slate-700">
                  <div>Distance: <span className="font-semibold">{currentRouteResult.altDistanceKm || Math.round(currentRouteResult.distanceKm * 1.15)} km</span></div>
                  <div>ETA: <span className="font-semibold">{currentRouteResult.altEta || 'Alternative Corridor'}</span></div>
                  <div>Landslide: <span className="font-semibold text-amber-700">Secondary Ridge</span></div>
                </div>
                <p className="text-[11px] text-amber-800 italic">
                  Note: Secondary bypass corridor available for light freight when main transit corridor experiences maintenance.
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
