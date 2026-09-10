"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Language, TRANSLATIONS, LANGUAGES, LanguageOption } from '@/data/translations';
import {
  VEHICLE_OPTIONS,
  VehicleOption,
  getCityCoordinates,
  getVillageCoordinates,
} from '@/data/northeastData';
import { PRIMARY_ROAD_COORDINATES, ALT_ROAD_COORDINATES } from '@/data/realGeoData';
import { calculateRoadRoute } from '@/services/routingService';
import {
  generateRouteId,
  getRouteRisks,
  getRouteWeather,
  getRouteServices,
  getRouteEmergencyData,
  getRouteAnalytics,
  getAssistantContext,
  RouteWeatherPoint,
  RouteEmergencyInfo,
  RouteAnalyticsData,
} from '@/services/routeDataService';
import { RiskIntelligenceAlert, AccessibilityFacility } from '@/data/mockLogistics';

export type AppView =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'route-opt'
  | 'tracking'
  | 'risks'
  | 'weather'
  | 'accessibility'
  | 'northeast-map'
  | 'arka-assistant'
  | 'emergency'
  | 'analytics'
  | 'admin'
  | 'help';

export interface RouteCalcResult {
  routeId: string;
  sourceState: string;
  sourceCity: string;
  sourceVillage?: string;
  destState: string;
  destCity: string;
  destVillage?: string;
  isCurrentLocation?: boolean;
  currentLocationCoords?: { lat: number; lng: number; label?: string };
  sourceCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
  geometry?: [number, number][];
  altGeometry?: [number, number][];
  altDistanceKm?: number;
  altEta?: string;
  vehicle: VehicleOption;
  distanceKm: number;
  eta: string;
  trafficPercent: number;
  trafficSignalsCount: number;
  tollGatesCount: number;
  tollCost: number;
  weatherRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  landslideRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  floodRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  accessibilityScore: number;
  estimatedCost: number;
  routeScore: number;
  reasoning: string;
  isAlternative: boolean;
}

export interface RouteCalculationOptions {
  sourceVillage?: string;
  destVillage?: string;
  isCurrentLocation?: boolean;
  currentLocationCoords?: { lat: number; lng: number; label?: string };
}

export interface AppContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  login: (identifier: string) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageOption[];
  emergencyMode: boolean;
  setEmergencyMode: (enabled: boolean) => void;
  toggleEmergencyMode: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentRouteResult: RouteCalcResult;
  activeRoute: RouteCalcResult;
  routeRisks: RiskIntelligenceAlert[];
  routeWeather: { primaryWeather: RouteWeatherPoint; routeWeatherPoints: RouteWeatherPoint[] };
  routeServices: AccessibilityFacility[];
  routeEmergencyData: RouteEmergencyInfo;
  routeAnalytics: RouteAnalyticsData;
  assistantContext: string;
  isRouteCalculating: boolean;
  routeError: string | null;
  clearPreviousRoute: () => void;
  calculateRoute: (
    sourceState: string,
    sourceCity: string,
    destState: string,
    destCity: string,
    vehicleId: string,
    options?: RouteCalculationOptions
  ) => Promise<boolean>;
  t: (key: string) => string;
}

const defaultRouteResult: RouteCalcResult = {
  routeId: 'ARKA_ASSAM_GUWAHATI_TO_MANIPUR_IMPHAL',
  sourceState: 'Assam',
  sourceCity: 'Guwahati',
  sourceVillage: 'Dispur',
  destState: 'Manipur',
  destCity: 'Imphal',
  destVillage: 'Imphal City',
  sourceCoords: { lat: 26.1445, lng: 91.7362 },
  destCoords: { lat: 24.8170, lng: 93.9368 },
  geometry: PRIMARY_ROAD_COORDINATES,
  altGeometry: ALT_ROAD_COORDINATES,
  altDistanceKm: 535,
  altEta: '13 hrs 45 mins',
  vehicle: VEHICLE_OPTIONS[4], // Mini Truck
  distanceKm: 485,
  eta: '11 hrs 30 mins',
  trafficPercent: 34,
  trafficSignalsCount: 8,
  tollGatesCount: 3,
  tollCost: 300,
  weatherRisk: 'LOW',
  landslideRisk: 'LOW',
  floodRisk: 'LOW',
  accessibilityScore: 91,
  estimatedCost: 3450,
  routeScore: 92,
  reasoning: 'ARKA AI selected this primary highway corridor (NH-27 & NH-29) for lower congestion, verified slope stability, and high accessibility.',
  isAlternative: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentRouteResult, setCurrentRouteResult] = useState<RouteCalcResult>(defaultRouteResult);
  const [isRouteCalculating, setIsRouteCalculating] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Restore persisted active route on client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('arka-selected-route');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.sourceCity && parsed.destCity && parsed.distanceKm) {
            setCurrentRouteResult(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('[ARKA] Failed to read stored route from localStorage', e);
    }
  }, []);

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  };

  const login = (identifier: string) => {
    setIsAuthenticated(true);
    setUser({
      name: identifier.includes('@') ? identifier.split('@')[0] : 'Logistics Officer',
      email: identifier.includes('@') ? identifier : `${identifier}@arka-ne.gov.in`,
      role: 'Fleet Coordinator',
    });
    setActiveView('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveView('landing');
    setEmergencyMode(false);
  };

  const toggleEmergencyMode = () => {
    const nextState = !emergencyMode;
    setEmergencyMode(nextState);
    if (nextState) {
      setActiveView('emergency');
    }
  };

  const clearPreviousRoute = useCallback(() => {
    setRouteError(null);
  }, []);

  const calculateRoute = async (
    sourceState: string,
    sourceCity: string,
    destState: string,
    destCity: string,
    vehicleId: string,
    options?: RouteCalculationOptions
  ): Promise<boolean> => {
    const selectedVehicle = VEHICLE_OPTIONS.find((v) => v.id === vehicleId) || VEHICLE_OPTIONS[4];
    setIsRouteCalculating(true);
    setRouteError(null);

    try {
      // 1. Resolve Origin Coordinates
      let originCoords: { lat: number; lng: number; name: string; state: string; district: string } | null = null;
      if (options?.isCurrentLocation && options?.currentLocationCoords) {
        originCoords = {
          lat: options.currentLocationCoords.lat,
          lng: options.currentLocationCoords.lng,
          name: options.currentLocationCoords.label || 'Current Location',
          state: sourceState,
          district: sourceCity,
        };
      } else {
        originCoords =
          getVillageCoordinates(options?.sourceVillage, sourceCity, sourceState) ||
          getCityCoordinates(sourceCity, sourceState);
      }

      // 2. Resolve Destination Coordinates
      const destCoords =
        getVillageCoordinates(options?.destVillage, destCity, destState) ||
        getCityCoordinates(destCity, destState);

      if (!originCoords) {
        throw new Error(
          `Coordinates for origin ${options?.sourceVillage || sourceCity} (${sourceState}) could not be resolved.`
        );
      }
      if (!destCoords) {
        throw new Error(
          `Coordinates for destination ${options?.destVillage || destCity} (${destState}) could not be resolved.`
        );
      }

      // 3. Call Real Road Routing Service (OSRM Road Network with alternatives)
      const routeData = await calculateRoadRoute(
        { lat: originCoords.lat, lng: originCoords.lng, name: originCoords.name },
        { lat: destCoords.lat, lng: destCoords.lng, name: destCoords.name },
        selectedVehicle.speedFactor
      );

      const distanceKm = routeData.distanceKm;
      const eta = routeData.eta;

      const isHillRoute =
        ['Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim'].includes(destState) ||
        ['Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim'].includes(sourceState);

      const traffic = isHillRoute ? Math.min(65, 34 + Math.round((distanceKm % 15))) : Math.min(50, 28 + Math.round((distanceKm % 12)));
      const signals = Math.max(1, Math.floor(distanceKm / 42));
      const tolls = Math.max(0, Math.floor(distanceKm / 110));
      const tollCost = tolls * 95;
      const estimatedCost = Math.round(distanceKm * selectedVehicle.costPerKm + tollCost);

      const landslideRisk = isHillRoute ? (distanceKm > 75 ? 'MEDIUM' : 'LOW') : 'LOW';
      const floodRisk = (sourceState === 'Assam' || destState === 'Assam') && distanceKm > 100 ? 'LOW' : 'LOW';
      const accessibilityScore = isHillRoute ? Math.max(78, 92 - Math.floor(distanceKm / 100)) : 95;
      const routeScore = Math.max(76, Math.min(98, Math.round(96 - (distanceKm > 350 ? 3 : 1) - (isHillRoute ? 2 : 0))));

      const fromLabel = options?.isCurrentLocation
        ? 'Current GPS Location'
        : options?.sourceVillage
        ? `${options.sourceVillage} (${sourceCity})`
        : sourceCity;
      const toLabel = options?.destVillage ? `${options.destVillage} (${destCity})` : destCity;

      const reasoning = `ARKA AI selected this road route (${fromLabel} ➔ ${toLabel}) optimized for distance (${distanceKm} km, ${eta}), lower hill terrain risk (${landslideRisk}), synchronized checkpoints (${signals} signals), and economic toll allocation (₹${tollCost}) suited for ${selectedVehicle.name}.`;

      const newRoute: RouteCalcResult = {
        routeId: generateRouteId(
          sourceState,
          options?.sourceVillage || sourceCity,
          destState,
          options?.destVillage || destCity
        ) + `_${Date.now()}`,
        sourceState,
        sourceCity,
        sourceVillage: options?.sourceVillage,
        destState,
        destCity,
        destVillage: options?.destVillage,
        isCurrentLocation: options?.isCurrentLocation,
        currentLocationCoords: options?.currentLocationCoords,
        sourceCoords: { lat: originCoords.lat, lng: originCoords.lng },
        destCoords: { lat: destCoords.lat, lng: destCoords.lng },
        geometry: routeData.geometry,
        altGeometry: routeData.altGeometry,
        altDistanceKm: routeData.altDistanceKm,
        altEta: routeData.altEta,
        vehicle: selectedVehicle,
        distanceKm,
        eta,
        trafficPercent: traffic,
        trafficSignalsCount: signals,
        tollGatesCount: tolls,
        tollCost,
        weatherRisk: 'LOW',
        landslideRisk,
        floodRisk,
        accessibilityScore,
        estimatedCost,
        routeScore,
        reasoning,
        isAlternative: false,
      };

      setCurrentRouteResult(newRoute);

      // Persist in localStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('arka-selected-route', JSON.stringify(newRoute));
        }
      } catch (e) {
        console.warn('[ARKA] Failed to save route to localStorage', e);
      }

      setIsRouteCalculating(false);
      return true;
    } catch (err: any) {
      if (err.message === 'STALE_REQUEST') {
        return false;
      }
      console.error('[ARKA Route Calculation Error]', err);
      setRouteError(err.message || 'Unable to calculate road route. Please check the locations and try again.');
      setIsRouteCalculating(false);
      return false;
    }
  };

  // Memoized route data derived from the current active route
  const routeRisks = useMemo(() => getRouteRisks(currentRouteResult), [currentRouteResult]);
  const routeWeather = useMemo(() => getRouteWeather(currentRouteResult), [currentRouteResult]);
  const routeServices = useMemo(() => getRouteServices(currentRouteResult), [currentRouteResult]);
  const routeEmergencyData = useMemo(() => getRouteEmergencyData(currentRouteResult), [currentRouteResult]);
  const routeAnalytics = useMemo(() => getRouteAnalytics(currentRouteResult), [currentRouteResult]);
  const assistantContext = useMemo(() => getAssistantContext(currentRouteResult), [currentRouteResult]);

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        isAuthenticated,
        user,
        login,
        logout,
        language,
        setLanguage,
        languages: LANGUAGES,
        emergencyMode,
        setEmergencyMode,
        toggleEmergencyMode,
        mobileMenuOpen,
        setMobileMenuOpen,
        currentRouteResult,
        activeRoute: currentRouteResult,
        routeRisks,
        routeWeather,
        routeServices,
        routeEmergencyData,
        routeAnalytics,
        assistantContext,
        isRouteCalculating,
        routeError,
        clearPreviousRoute,
        calculateRoute,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
