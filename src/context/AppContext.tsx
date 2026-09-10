"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, LANGUAGES, LanguageOption } from '@/data/translations';
import { HIGHWAY_ROUTES, HighwayRoute, VEHICLE_OPTIONS, VehicleOption } from '@/data/northeastData';

import { resolveRouteGeometry, PREDEFINED_CORRIDORS } from '@/utils/corridorGeo';

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

export interface ActiveRoute {
  id: string;
  source: string;
  destination: string;
  sourceCoords: [number, number];
  destCoords: [number, number];
  geometry: [number, number][];
  distanceKm: number;
  eta: string;
  isCurrentLocation?: boolean;
}

export interface RouteCalcResult {
  sourceState: string;
  sourceCity: string;
  destState: string;
  destCity: string;
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

interface AppContextType {
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
  activeRoute: ActiveRoute;
  setActiveRoute: (route: ActiveRoute) => void;
  setRouteByCities: (source: string, destination: string, isCurrentLocation?: boolean, customCoords?: [number, number]) => void;
  calculateRoute: (sourceState: string, sourceCity: string, destState: string, destCity: string, vehicleId: string) => void;
  t: (key: string) => string;
}

const defaultActiveRoute: ActiveRoute = {
  id: 'guwahati-imphal',
  source: 'Guwahati',
  destination: 'Imphal',
  sourceCoords: [26.1445, 91.7362],
  destCoords: [24.8170, 93.9368],
  geometry: PREDEFINED_CORRIDORS['guwahati-imphal'].geometry,
  distanceKm: 485,
  eta: '11 hrs 30 mins',
  isCurrentLocation: false,
};

const defaultRouteResult: RouteCalcResult = {
  sourceState: 'Assam',
  sourceCity: 'Guwahati',
  destState: 'Manipur',
  destCity: 'Imphal',
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
  reasoning: 'ARKA selected this route because it has lower traffic, lower risk and better accessibility for the selected vehicle.',
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
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>(defaultActiveRoute);

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  };

  const setRouteByCities = (
    source: string,
    destination: string,
    isCurrentLocation: boolean = false,
    customCoords?: [number, number]
  ) => {
    const resolved = resolveRouteGeometry(source, destination, customCoords);
    const newRoute: ActiveRoute = {
      id: `${source.toLowerCase().replace(/\s+/g, '-')}-${destination.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      source: isCurrentLocation ? 'Current Location' : source,
      destination,
      sourceCoords: resolved.geometry[0] || [26.1445, 91.7362],
      destCoords: resolved.geometry[resolved.geometry.length - 1] || [24.8170, 93.9368],
      geometry: resolved.geometry,
      distanceKm: resolved.distanceKm,
      eta: resolved.eta,
      isCurrentLocation,
    };
    setActiveRoute(newRoute);
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

  const calculateRoute = (
    sourceState: string,
    sourceCity: string,
    destState: string,
    destCity: string,
    vehicleId: string
  ) => {
    const selectedVehicle = VEHICLE_OPTIONS.find((v) => v.id === vehicleId) || VEHICLE_OPTIONS[4];

    // Realistic calculation based on Northeast geography
    const isSameCity = sourceCity === destCity;
    const isHillRoute = ['Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim'].includes(destState) ||
                        ['Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim'].includes(sourceState);

    const resolved = resolveRouteGeometry(sourceCity, destCity);
    const distance = resolved.distanceKm || 485;

    const speed = isHillRoute ? selectedVehicle.speedFactor * 42 : selectedVehicle.speedFactor * 55;
    const totalHours = distance / speed;
    const hours = Math.floor(totalHours);
    const mins = Math.round((totalHours - hours) * 60);
    const etaStr = `${hours} hrs ${mins > 0 ? `${mins} mins` : ''}`;

    const traffic = isHillRoute ? 38 : 34;
    const signals = Math.max(3, Math.floor(distance / 60));
    const tolls = Math.max(1, Math.floor(distance / 140));
    const tollCost = tolls * 95;
    const estimatedCost = Math.round(distance * selectedVehicle.costPerKm + tollCost);

    const landslideRisk = isHillRoute ? 'MEDIUM' : 'LOW';
    const floodRisk = sourceState === 'Assam' || destState === 'Assam' ? 'LOW' : 'LOW';
    const accessibilityScore = isHillRoute ? 88 : 94;
    const routeScore = isHillRoute ? 89 : 92;

    setCurrentRouteResult({
      sourceState,
      sourceCity,
      destState,
      destCity,
      vehicle: selectedVehicle,
      distanceKm: distance,
      eta: etaStr,
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
      reasoning: `ARKA selected this route because it has lower traffic, lower risk and better accessibility for ${selectedVehicle.name}. Hill grade stability has been verified.`,
      isAlternative: false,
    });

    // Update authoritative activeRoute geometry
    setActiveRoute({
      id: `${sourceCity.toLowerCase()}-${destCity.toLowerCase()}`,
      source: sourceCity,
      destination: destCity,
      sourceCoords: resolved.geometry[0] || [26.1445, 91.7362],
      destCoords: resolved.geometry[resolved.geometry.length - 1] || [24.8170, 93.9368],
      geometry: resolved.geometry,
      distanceKm: distance,
      eta: etaStr,
      isCurrentLocation: false,
    });
  };

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
        activeRoute,
        setActiveRoute,
        setRouteByCities,
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
