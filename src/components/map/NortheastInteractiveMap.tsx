"use client";

import React, { useEffect, useRef, useState, useId } from 'react';
import {
  NORTHEAST_STATES,
  TOLL_GATES,
  TRAFFIC_SIGNALS,
  HIGHWAY_ROUTES,
  CityNode,
  TollGate,
  TrafficSignal,
  HighwayRoute,
} from '@/data/northeastData';
import { RISK_ALERTS, ACCESSIBILITY_SERVICES, RiskIntelligenceAlert, AccessibilityFacility } from '@/data/mockLogistics';
import {
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Crosshair,
  Maximize2,
  Minimize2,
  Navigation,
  AlertTriangle,
  X,
  Radio,
  Clock,
  Car,
  ChevronRight,
  ExternalLink,
  Shield,
  MapPin,
  Flame,
} from 'lucide-react';

interface NortheastInteractiveMapProps {
  highlightRoute?: boolean;
  showAlternative?: boolean;
  activeShipmentPoint?: { x?: number; y?: number; lat?: number; lng?: number; label?: string };
  emergencyFocus?: boolean;
  interactive?: boolean;
  heightClass?: string;
  zoomLevel?: 'state' | 'district' | 'local';
  activeRouteGeometry?: [number, number][];
  customFacilityMarkers?: (AccessibilityFacility & { distanceFromRoute?: number })[];
  selectedFacilityId?: string | null;
  onSelectFacility?: (fac: AccessibilityFacility | null) => void;
  customRiskMarkers?: RiskIntelligenceAlert[];
  fitRouteGeometry?: boolean;
  onMapClick?: () => void;
}

type MapType = 'roadmap' | 'satellite' | 'terrain';

interface SelectedPlace {
  title: string;
  subtitle: string;
  type: 'city' | 'toll' | 'signal' | 'risk' | 'facility' | 'shipment' | 'route';
  lat: number;
  lng: number;
  details?: Record<string, string | number>;
  statusColor?: string;
  advisory?: string;
}

export default function NortheastInteractiveMap({
  highlightRoute = true,
  showAlternative = false,
  activeShipmentPoint,
  emergencyFocus = false,
  interactive = true,
  heightClass = "h-[480px] md:h-[560px]",
  zoomLevel: propZoomLevel,
  activeRouteGeometry,
  customFacilityMarkers,
  selectedFacilityId,
  onSelectFacility,
  customRiskMarkers,
  fitRouteGeometry = false,
  onMapClick,
}: NortheastInteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routesGroupRef = useRef<any>(null);

  const [mapType, setMapType] = useState<MapType>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showTolls, setShowTolls] = useState<boolean>(true);
  const [showSignals, setShowSignals] = useState<boolean>(true);
  const [showRisks, setShowRisks] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // All cities flattened with state reference
  const allCities = React.useMemo(() => {
    return NORTHEAST_STATES.flatMap((state) =>
      state.cities.map((city) => ({
        ...city,
        stateName: state.name,
        stateColor: state.color,
      }))
    );
  }, []);

  // Filtered search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allCities
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.district.toLowerCase().includes(query) ||
          c.stateName.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [searchQuery, allCities]);

  // Google Maps Tile URLs
  const getGoogleTileUrl = (type: MapType, traffic: boolean) => {
    switch (type) {
      case 'satellite':
        return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      case 'terrain':
        return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      case 'roadmap':
      default:
        return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    }
  };

  // Determine initial coordinates and zoom
  const getInitialZoom = () => {
    if (propZoomLevel === 'local') return 11;
    if (propZoomLevel === 'district') return 8;
    return 7;
  };

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Default center: Central Assam / Northeast Hub
      const defaultCenter: [number, number] = [26.1445, 92.5];
      const initialZoom = getInitialZoom();

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: initialZoom,
        zoomControl: false, // Use our Google-style custom controls
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
      });

      // Add Google attribution in bottom corner
      L.control
        .attribution({
          position: 'bottomright',
          prefix: false,
        })
        .addAttribution('&copy; <span class="font-semibold text-slate-700">Google Maps</span> data')
        .addTo(map);

      // Base Google Layer
      const baseTile = L.tileLayer(getGoogleTileUrl('roadmap', false), {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
      tileLayerRef.current = baseTile;

      // Traffic Overlay Layer
      const trafficTile = L.tileLayer(
        'https://mt1.google.com/vt/lyrs=m,traffic|seconds_into_week:-1&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          opacity: 0.75,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }
      );
      trafficLayerRef.current = trafficTile;
      if (showTraffic) {
        trafficTile.addTo(map);
      }

      // Feature Groups
      markersGroupRef.current = L.featureGroup().addTo(map);
      routesGroupRef.current = L.featureGroup().addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Invalidate size on mount to avoid grey tiles
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Tile Layer when MapType changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getGoogleTileUrl(mapType, showTraffic));
  }, [mapType]);

  // Update Traffic Layer toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !trafficLayerRef.current) return;
    if (showTraffic) {
      if (!mapInstanceRef.current.hasLayer(trafficLayerRef.current)) {
        trafficLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(trafficLayerRef.current)) {
        mapInstanceRef.current.removeLayer(trafficLayerRef.current);
      }
    }
  }, [showTraffic]);

  // Redraw Markers and Routes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    async function updateLayers() {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;
      const markersGroup = markersGroupRef.current;
      const routesGroup = routesGroupRef.current;

      if (!markersGroup || !routesGroup) return;

      markersGroup.clearLayers();
      routesGroup.clearLayers();

      // 1. Draw Routes
      if (highlightRoute) {
        const pointsToDraw =
          activeRouteGeometry && activeRouteGeometry.length > 0
            ? activeRouteGeometry
            : HIGHWAY_ROUTES[0]?.geoPoints;

        if (pointsToDraw && pointsToDraw.length > 0) {
          // Glow / casing line (Google Maps route casing)
          L.polyline(pointsToDraw, {
            color: '#1a73e8',
            weight: 8,
            opacity: 0.4,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(routesGroup);

          // Core Route Line (Google Maps blue)
          const primaryPolyline = L.polyline(pointsToDraw, {
            color: '#4285F4',
            weight: 5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(routesGroup);

          const midIdx = Math.floor(pointsToDraw.length / 2);
          primaryPolyline.on('click', () => {
            setSelectedPlace({
              title: 'Active Transport Corridor',
              subtitle: 'Active Route Corridor Line',
              type: 'route',
              lat: pointsToDraw[midIdx][0],
              lng: pointsToDraw[midIdx][1],
              details: {
                Status: 'Active Corridor Monitored by ARKA AI',
                'Corridor Buffer': '10 km Facilities Search Enabled',
                'Road Condition': 'Stabilized Mountain Highway',
              },
              statusColor: 'text-emerald-600',
            });
          });

          if (fitRouteGeometry && map && pointsToDraw.length > 1) {
            try {
              const bounds = L.latLngBounds(pointsToDraw);
              map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
            } catch (e) {
              // ignore
            }
          }
        }

        // Alternative route
        if (showAlternative) {
          const altRoute = HIGHWAY_ROUTES[1];
          if (altRoute && altRoute.geoPoints) {
            const altPolyline = L.polyline(altRoute.geoPoints, {
              color: '#80868b',
              weight: 5,
              opacity: 0.8,
              dashArray: '6, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(routesGroup);

            altPolyline.on('click', () => {
              setSelectedPlace({
                title: altRoute.name,
                subtitle: `${altRoute.source} → ${altRoute.destination}`,
                type: 'route',
                lat: altRoute.geoPoints[2][0],
                lng: altRoute.geoPoints[2][1],
                details: {
                  Distance: `${altRoute.distanceKm} km`,
                  'Estimated Travel Time': `${altRoute.baseEtaHours} hours`,
                  'Traffic Density': `${altRoute.trafficPercent}% (Moderate)`,
                  Safety: altRoute.riskSummary,
                },
                statusColor: 'text-amber-600',
              });
            });
          }
        }
      }

      // 2. City Markers (Authentic Google Maps Red Pins)
      allCities.forEach((city) => {
        if (!city.lat || !city.lng) return;

        const isMajor = city.hubType === 'major';
        const pinSize = isMajor ? 32 : 24;

        // Custom Google Pin HTML
        const googlePinHtml = `
          <div class="gm-marker-drop group relative -translate-x-1/2 -translate-y-full cursor-pointer">
            <div class="flex flex-col items-center">
              <svg width="${pinSize}" height="${pinSize * 1.3}" viewBox="0 0 24 32" fill="none">
                <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="${
                  isMajor ? '#EA4335' : '#4285F4'
                }" stroke="#FFFFFF" stroke-width="1.5" />
                <circle cx="12" cy="12" r="${isMajor ? 4.5 : 3.5}" fill="#FFFFFF" />
              </svg>
              ${
                isMajor
                  ? `<span class="mt-0.5 px-1.5 py-0.5 rounded-md bg-white/95 text-slate-800 text-[10px] font-bold shadow-md whitespace-nowrap border border-slate-200">${city.name}</span>`
                  : ''
              }
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: googlePinHtml,
          className: 'google-map-marker',
          iconSize: [pinSize, pinSize * 1.3],
          iconAnchor: [pinSize / 2, pinSize * 1.3],
        });

        const marker = L.marker([city.lat, city.lng], { icon }).addTo(markersGroup);

        marker.on('click', () => {
          setSelectedPlace({
            title: `${city.name} Logistics Hub`,
            subtitle: `${city.district}, ${city.stateName}`,
            type: 'city',
            lat: city.lat!,
            lng: city.lng!,
            details: {
              Hub: `${city.hubType?.toUpperCase()} Freight Center`,
              Population: city.population || 'Regional Center',
              Coordinates: `${city.lat?.toFixed(4)}° N, ${city.lng?.toFixed(4)}° E`,
              Status: 'Operational & Connected to NH Corridors',
            },
            statusColor: 'text-emerald-600',
          });
          map.flyTo([city.lat!, city.lng!], 11, { duration: 1.2 });
        });
      });

      // 3. Toll Plazas
      if (showTolls) {
        TOLL_GATES.forEach((toll) => {
          if (!toll.lat || !toll.lng) return;

          const tollHtml = `
            <div class="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center gap-1 bg-white text-slate-800 px-2 py-1 rounded-full shadow-md border border-blue-500 text-[11px] font-bold hover:scale-105 transition-transform">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>₹${toll.cost}</span>
            </div>
          `;

          const icon = L.divIcon({
            html: tollHtml,
            className: 'toll-gate-marker',
            iconSize: [50, 24],
            iconAnchor: [25, 12],
          });

          const marker = L.marker([toll.lat, toll.lng], { icon }).addTo(markersGroup);

          marker.on('click', () => {
            setSelectedPlace({
              title: toll.name,
              subtitle: `${toll.highway} • ${toll.location}`,
              type: 'toll',
              lat: toll.lat!,
              lng: toll.lng!,
              details: {
                'FASTag Fee': `₹${toll.cost} (Commercial Standard)`,
                Highway: toll.highway,
                Status: 'FASTag 2.0 Electronic Clearance Active',
              },
              statusColor: 'text-blue-600',
            });
          });
        });
      }

      // 4. Traffic Signals
      if (showSignals) {
        TRAFFIC_SIGNALS.forEach((sig) => {
          if (!sig.lat || !sig.lng) return;

          const colorBg =
            sig.status === 'green'
              ? 'bg-emerald-500'
              : sig.status === 'yellow'
              ? 'bg-amber-500'
              : 'bg-rose-500';

          const signalHtml = `
            <div class="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 border-2 border-white shadow-lg">
              <span class="w-3.5 h-3.5 rounded-full ${colorBg} animate-pulse"></span>
            </div>
          `;

          const icon = L.divIcon({
            html: signalHtml,
            className: 'traffic-signal-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([sig.lat, sig.lng], { icon }).addTo(markersGroup);

          marker.on('click', () => {
            setSelectedPlace({
              title: sig.name,
              subtitle: sig.location,
              type: 'signal',
              lat: sig.lat!,
              lng: sig.lng!,
              details: {
                'Live State': sig.status.toUpperCase(),
                'Cycle Duration': `${sig.durationSec} seconds`,
                'Intersection Flow': sig.status === 'green' ? 'Normal / Clear' : 'Regulated Transit',
              },
              statusColor:
                sig.status === 'green'
                  ? 'text-emerald-600'
                  : sig.status === 'yellow'
                  ? 'text-amber-600'
                  : 'text-rose-600',
            });
          });
        });
      }

      // 5. Risk Zones / Landslides / Fog
      if (showRisks) {
        const risksToRender = customRiskMarkers !== undefined ? customRiskMarkers : RISK_ALERTS;
        risksToRender.forEach((risk) => {
          if (!risk.lat || !risk.lng) return;

          const riskHtml = `
            <div class="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-lg border border-white text-[11px] font-black animate-bounce">
              <span>⚠️</span>
              <span class="hidden sm:inline">${risk.category}</span>
            </div>
          `;

          const icon = L.divIcon({
            html: riskHtml,
            className: 'risk-alert-marker',
            iconSize: [60, 24],
            iconAnchor: [30, 12],
          });

          const marker = L.marker([risk.lat, risk.lng], { icon }).addTo(markersGroup);

          marker.on('click', () => {
            setSelectedPlace({
              title: `${risk.category} Advisory`,
              subtitle: `${risk.location}, ${risk.state}`,
              type: 'risk',
              lat: risk.lat!,
              lng: risk.lng!,
              details: {
                Severity: risk.severity,
                Impact: `${risk.percentage}% Risk Index`,
                Description: risk.description,
              },
              advisory: risk.advisory,
              statusColor: risk.severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600',
            });
          });
        });
      }

      // 6. Accessibility Facilities
      const facilitiesToRender = customFacilityMarkers !== undefined
        ? customFacilityMarkers
        : showFacilities
        ? ACCESSIBILITY_SERVICES
        : [];

      if (facilitiesToRender.length > 0) {
        facilitiesToRender.forEach((fac) => {
          if (!fac.lat || !fac.lng) return;
          const isSelected = selectedFacilityId === fac.id;

          const getEmoji = (type: string) => {
            switch (type) {
              case 'Hospital': return '🏥';
              case 'Fuel Station': return '⛽';
              case 'Warehouse': return '🏬';
              case 'Rest Area': return '☕';
              case 'Vehicle Repair': return '🔧';
              case 'Emergency Services': return '🛡️';
              default: return '📍';
            }
          };

          const facHtml = `
            <div class="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center gap-1.5 ${
              isSelected ? 'bg-purple-800 ring-4 ring-purple-300 scale-110 z-50' : 'bg-purple-600 hover:bg-purple-700'
            } text-white px-2.5 py-1 rounded-full shadow-xl text-[11px] font-bold border-2 border-white transition-all">
              <span>${getEmoji(fac.type)}</span>
              <span class="max-w-[85px] truncate">${fac.name.split(' ')[0]}</span>
              ${
                fac.distanceFromRoute !== undefined
                  ? `<span class="bg-black/30 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold text-purple-100 whitespace-nowrap">${fac.distanceFromRoute} km</span>`
                  : ''
              }
            </div>
          `;

          const icon = L.divIcon({
            html: facHtml,
            className: 'facility-marker',
            iconSize: [85, 26],
            iconAnchor: [42, 13],
          });

          const marker = L.marker([fac.lat, fac.lng], { icon }).addTo(markersGroup);

          marker.on('click', () => {
            onSelectFacility?.(fac);
            setSelectedPlace({
              title: fac.name,
              subtitle: `${fac.type} • ${fac.location}`,
              type: 'facility',
              lat: fac.lat!,
              lng: fac.lng!,
              details: {
                Type: fac.type,
                Status: fac.status,
                'Distance from Route':
                  fac.distanceFromRoute !== undefined
                    ? `${fac.distanceFromRoute} km from route`
                    : `${fac.distanceKm} km`,
                'Est. Travel Time': fac.travelTime,
                Helpline: fac.phone,
              },
              statusColor: 'text-purple-600',
            });
            map.flyTo([fac.lat!, fac.lng!], 13, { duration: 1.0 });
          });
        });
      }

      // 7. Active Shipment Live Delivery Vehicle
      if (activeShipmentPoint) {
        // Fallback lat/lng if only x/y provided
        let targetLat = activeShipmentPoint.lat;
        let targetLng = activeShipmentPoint.lng;

        if (!targetLat || !targetLng) {
          // Dimapur junction fallback
          targetLat = 25.9095;
          targetLng = 93.7266;
        }

        const vehicleHtml = `
          <div class="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center">
            <span class="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping"></span>
            <div class="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-base">
              🚚
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: vehicleHtml,
          className: 'active-shipment-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const vehicleMarker = L.marker([targetLat, targetLng], { icon }).addTo(markersGroup);

        vehicleMarker.on('click', () => {
          setSelectedPlace({
            title: activeShipmentPoint.label || 'Active Freight Consignment',
            subtitle: 'Real-time GPS Corridor Tracking',
            type: 'shipment',
            lat: targetLat!,
            lng: targetLng!,
            details: {
              'Vehicle Status': 'In Transit (On Schedule)',
              'Live GPS': `${targetLat?.toFixed(4)}° N, ${targetLng?.toFixed(4)}° E`,
              Refresh: '10s Telemetry Active',
            },
            statusColor: 'text-blue-600',
          });
        });
      }
    }

    updateLayers();
  }, [
    mapLoaded,
    mapType,
    showTolls,
    showSignals,
    showRisks,
    showFacilities,
    highlightRoute,
    showAlternative,
    activeShipmentPoint,
    allCities,
    activeRouteGeometry,
    customFacilityMarkers,
    selectedFacilityId,
    customRiskMarkers,
    fitRouteGeometry,
  ]);

  // Focus facility when selectedFacilityId changes
  useEffect(() => {
    if (!selectedFacilityId || !mapInstanceRef.current) return;
    const facilitiesList = customFacilityMarkers || ACCESSIBILITY_SERVICES;
    const fac = facilitiesList.find((f) => f.id === selectedFacilityId);
    if (fac && fac.lat && fac.lng) {
      mapInstanceRef.current.flyTo([fac.lat, fac.lng], 13, { duration: 1.0 });
      setSelectedPlace({
        title: fac.name,
        subtitle: `${fac.type} • ${fac.location}`,
        type: 'facility',
        lat: fac.lat,
        lng: fac.lng,
        details: {
          Type: fac.type,
          Status: fac.status,
          'Distance from Route':
            fac.distanceFromRoute !== undefined
              ? `${fac.distanceFromRoute} km from route`
              : `${fac.distanceKm} km`,
          'Est. Travel Time': fac.travelTime,
          Helpline: fac.phone,
        },
        statusColor: 'text-purple-600',
      });
    }
  }, [selectedFacilityId, customFacilityMarkers]);

  // Handle Search FlyTo
  const handleSelectCity = (city: CityNode & { stateName: string }) => {
    if (!city.lat || !city.lng || !mapInstanceRef.current) return;
    setSearchQuery(city.name);
    setSearchFocused(false);

    mapInstanceRef.current.flyTo([city.lat, city.lng], 12, { duration: 1.5 });

    setSelectedPlace({
      title: `${city.name} Logistics Hub`,
      subtitle: `${city.district}, ${city.stateName}`,
      type: 'city',
      lat: city.lat,
      lng: city.lng,
      details: {
        Hub: `${city.hubType?.toUpperCase()} Freight Center`,
        Population: city.population || 'Regional Center',
        Coordinates: `${city.lat.toFixed(4)}° N, ${city.lng.toFixed(4)}° E`,
      },
      statusColor: 'text-emerald-600',
    });
  };

  // Google Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Center / North Reset
  const handleResetNorth = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.1445, 92.5], 7, { duration: 1.2 });
    }
  };

  // My Location / Hub Center
  const handleCenterHub = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.1445, 91.7362], 12, { duration: 1.2 });
    }
  };

  return (
    <div
      onClick={() => onMapClick?.()}
      className={`relative w-full ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : heightClass
      } rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-[#e5e3df] transition-all`}
    >
      {/* 1. Floating Google Maps Search Bar (Top-Left) */}
      <div className="absolute top-3 left-3 z-[1000] w-[calc(100%-1.5rem)] sm:w-80">
        <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 flex items-center gap-2">
          {/* Google 4-Color G logo style badge */}
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-blue-600" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search Northeast locations & hubs..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleResetNorth}
            className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors"
            title="Directions"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {searchFocused && searchResults.length > 0 && (
          <div className="mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs divide-y divide-slate-100">
            {searchResults.map((city) => (
              <div
                key={city.name}
                onMouseDown={() => handleSelectCity(city)}
                className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">{city.name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">
                      {city.district}, {city.stateName}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {city.hubType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Google Maps Type Switcher (Top-Right / Layer Bar) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200 text-xs">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
            mapType === 'roadmap'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Default
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
            mapType === 'satellite'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
            mapType === 'terrain'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Terrain
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

        {/* Traffic Layer Toggle */}
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            showTraffic
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Toggle Google Live Traffic Layer"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              showTraffic ? 'bg-white animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="hidden sm:inline">Traffic</span>
        </button>
      </div>

      {/* 3. Layer Filter Chips (Below Top Search) */}
      <div className="absolute top-16 left-3 z-[990] hidden sm:flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setShowTolls(!showTolls)}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md border transition-all ${
            showTolls
              ? 'bg-white text-blue-700 border-blue-400'
              : 'bg-white/80 text-slate-500 border-slate-200'
          }`}
        >
          🛣️ Tolls
        </button>
        <button
          onClick={() => setShowSignals(!showSignals)}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md border transition-all ${
            showSignals
              ? 'bg-white text-amber-700 border-amber-400'
              : 'bg-white/80 text-slate-500 border-slate-200'
          }`}
        >
          🚦 Signals
        </button>
        <button
          onClick={() => setShowRisks(!showRisks)}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md border transition-all ${
            showRisks
              ? 'bg-white text-rose-700 border-rose-400'
              : 'bg-white/80 text-slate-500 border-slate-200'
          }`}
        >
          ⚠️ Hazards
        </button>
        <button
          onClick={() => setShowFacilities(!showFacilities)}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md border transition-all ${
            showFacilities
              ? 'bg-white text-purple-700 border-purple-400'
              : 'bg-white/80 text-slate-500 border-slate-200'
          }`}
        >
          🏥 Services
        </button>
      </div>

      {/* 4. Google Maps Floating Controls (Bottom-Right) */}
      <div className="absolute bottom-5 right-3 z-[1000] flex flex-col items-center gap-2">
        {/* Fullscreen & Reset Tools */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1 flex flex-col items-center gap-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCenterHub}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Center Northeast Hub"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetNorth}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Reset North & Corridor View"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Google Zoom In / Out Pill */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1 flex flex-col items-center">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-4 h-[1px] bg-slate-200" />
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Google Live Traffic Legend Pill (Bottom-Left) */}
      <div className="absolute bottom-4 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-200 text-xs text-slate-600">
        <span className="font-bold text-slate-800">Traffic:</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-sm bg-emerald-500 inline-block" />
          <span className="text-[11px]">Fast</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-sm bg-amber-500 inline-block" />
          <span className="text-[11px]">Slow</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-sm bg-rose-600 inline-block" />
          <span className="text-[11px]">Heavy</span>
        </div>
      </div>

      {/* 6. Google Maps Place Detail Card / Modal (Bottom-Left / Centered) */}
      {selectedPlace && (
        <div className="absolute bottom-4 left-3 sm:left-4 z-[1100] w-[calc(100%-1.5rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  {selectedPlace.title}
                </h4>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedPlace.subtitle}
              </p>
            </div>
            <button
              onClick={() => setSelectedPlace(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details Table */}
          {selectedPlace.details && (
            <div className="bg-slate-50 rounded-2xl p-2.5 my-2.5 space-y-1.5 text-xs text-slate-700">
              {Object.entries(selectedPlace.details).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{key}:</span>
                  <span className="font-bold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Advisory warning if risk */}
          {selectedPlace.advisory && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-2.5 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{selectedPlace.advisory}</span>
            </div>
          )}

          {/* Google Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([selectedPlace.lat, selectedPlace.lng], 14, {
                    duration: 1.2,
                  });
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>
            <button
              onClick={() => setSelectedPlace(null)}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 7. Actual Leaflet Canvas for Google Maps Tiles */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
