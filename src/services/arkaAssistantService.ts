import {
  DEMO_DATA,
  extractRouteEndpoints,
  findCity,
  findState,
  findNearbyFacilities,
  AccessibilityFacility,
  CityWeather,
  CorridorTraffic,
} from '@/data/demoData';
import { RouteCalcResult } from '@/context/AppContext';
import { VehicleOption, VEHICLE_OPTIONS } from '@/data/northeastData';

export type ArkaIntent =
  | 'route'
  | 'traffic'
  | 'weather'
  | 'risk'
  | 'tolls'
  | 'nearby'
  | 'shipment'
  | 'emergency'
  | 'why_route'
  | 'unknown';

export interface ArkaRouteDetails {
  source: string;
  sourceState: string;
  destination: string;
  destState: string;
  corridorSteps: string[];
  distanceKm: number;
  distanceStr: string;
  etaStr: string;
  trafficPercent: number;
  trafficLevel: string;
  trafficSignalsCount: number;
  signalDelayMins: number;
  tollGatesCount: number;
  tollCost: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  accessibilityScore: number;
  routeScore: number;
  whyThisRoute: string;
  vehicleName: string;
  vehicleNote?: string;
}

export interface ArkaMapAction {
  highlightRoute?: boolean;
  showAlternative?: boolean;
  showTraffic?: boolean;
  showTolls?: boolean;
  showSignals?: boolean;
  showRisks?: boolean;
  showFacilities?: boolean;
  emergencyFocus?: boolean;
  activeShipmentPoint?: { x: number; y: number; label?: string };
  focusedPoint?: { x: number; y: number; label?: string };
}

export interface ArkaAssistantResponse {
  id: string;
  intent: ArkaIntent;
  text: string;
  routeData?: ArkaRouteDetails;
  facilities?: AccessibilityFacility[];
  weatherList?: CityWeather[];
  trafficList?: CorridorTraffic[];
  mapAction?: ArkaMapAction;
  suggestedPrompts?: string[];
}

export interface ArkaQueryContext {
  currentRouteResult?: RouteCalcResult;
  selectedVehicleId?: string;
  selectedVehicle?: VehicleOption;
}

/**
 * Main AI Assistant processor for ARKA logistics platform.
 * Analyzes natural language queries and extracts intent, parameters, and structured response data.
 */
export function processArkaQuery(
  rawQuery: string,
  context: ArkaQueryContext = {}
): ArkaAssistantResponse {
  const query = rawQuery.trim();
  // Strip "Hey ARKA" or "ARKA" trigger prefixes
  const cleanQuery = query.replace(/^hey\s+arka[,.]?\s*/i, '').replace(/^arka[,.]?\s*/i, '').trim();
  const lower = cleanQuery.toLowerCase();
  const resId = `arka-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const activeVehicle =
    context.selectedVehicle ||
    VEHICLE_OPTIONS.find((v) => v.id === context.selectedVehicleId) ||
    (context.currentRouteResult ? context.currentRouteResult.vehicle : VEHICLE_OPTIONS[4]);

  // ================= 1. WHY ROUTE / EXPLANATION =================
  if (
    lower.includes('why did you choose') ||
    lower.includes('why this route') ||
    lower.includes('why choose') ||
    lower.includes('route score') ||
    lower.includes('why select')
  ) {
    const vehicleNote = activeVehicle.restrictionNote
      ? ` It also accounts for ${activeVehicle.name} constraints (${activeVehicle.restrictionNote}).`
      : ` It is fully optimized for the selected ${activeVehicle.name}.`;

    return {
      id: resId,
      intent: 'why_route',
      text: `I selected this route because it has lower traffic (34% vs 58%), fewer high-risk landslide areas (the NH-27/29 Eastern Spine has stabilized culverts compared to the Dima Hasao hill bypass), 3 active FASTag toll plazas, and a high accessibility score (91%).${vehicleNote}`,
      mapAction: {
        highlightRoute: true,
        showTraffic: true,
        showRisks: true,
      },
      suggestedPrompts: [
        'What is the traffic situation?',
        'How many toll gates are there?',
        'Is there a landslide risk?',
      ],
    };
  }

  // ================= 2. ROUTE FINDING & OPTIMIZATION =================
  const endpoints = extractRouteEndpoints(cleanQuery);
  const isExplicitRouteQuery =
    (lower.includes('route') ||
     lower.includes('corridor') ||
     lower.includes('direction') ||
     lower.includes('how to reach') ||
     lower.includes('safest route') ||
     lower.includes('best route') ||
     lower.includes('find a route') ||
     (lower.includes('from ') && lower.includes(' to ')) ||
     (lower.includes('between ') && lower.includes(' and ')) ||
     (Boolean(endpoints.source) && Boolean(endpoints.destination))) &&
    !lower.includes('why did you choose') &&
    !lower.includes('why this route') &&
    !lower.includes('is this route safe') &&
    !lower.includes('is the route safe') &&
    !lower.includes('how safe is');

  if (isExplicitRouteQuery) {
    // If neither source nor destination could be found, or query is just "find a route" / "which route should I take?"
    if (!endpoints.source && !endpoints.destination) {
      return {
        id: resId,
        intent: 'route',
        text: 'Please provide the source and destination. Example: Guwahati to Imphal.',
        suggestedPrompts: [
          'Find the safest route from Guwahati to Imphal',
          'Safest route from Assam to Manipur',
          'Route from Shillong to Silchar',
        ],
      };
    }

    // Default to Guwahati and Imphal if one is specified or partially matched
    const sourceCityName = endpoints.source || 'Guwahati';
    const destCityName = endpoints.destination || 'Imphal';

    // Find city/state metadata
    const srcCityObj = findCity(sourceCityName);
    const dstCityObj = findCity(destCityName);
    const srcState = srcCityObj?.stateName || (findState(sourceCityName)?.name || 'Assam');
    const dstState = dstCityObj?.stateName || (findState(destCityName)?.name || 'Manipur');

    // Calculate distance & specifics
    let distance = 485;
    let eta = '10h 25m';
    let corridorSteps = ['Guwahati', 'Nagaon', 'Dimapur', 'Kohima', 'Imphal'];
    let tollCost = 365;
    let tollCount = 3;
    let signals = 8;
    let score = 92;
    let traffic = 34;
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let accessibility = 91;

    if (
      (sourceCityName.toLowerCase().includes('shillong') || sourceCityName.toLowerCase().includes('meghalaya')) &&
      (destCityName.toLowerCase().includes('silchar') || destCityName.toLowerCase().includes('cachar'))
    ) {
      distance = 215;
      eta = '6h 15m';
      corridorSteps = ['Shillong', 'Jowai', 'Khliehriat', 'Silchar'];
      tollCost = 170;
      tollCount = 2;
      signals = 4;
      score = 88;
      traffic = 48;
      risk = 'MEDIUM';
      accessibility = 86;
    } else if (
      sourceCityName.toLowerCase().includes('guwahati') &&
      destCityName.toLowerCase().includes('shillong')
    ) {
      distance = 98;
      eta = '2h 45m';
      corridorSteps = ['Guwahati', 'Byrnihat', 'Nongpoh', 'Umiam', 'Shillong'];
      tollCost = 110;
      tollCount = 1;
      signals = 5;
      score = 94;
      traffic = 40;
      risk = 'LOW';
      accessibility = 93;
    }

    const stepsDisplay = corridorSteps.join(' → ');

    // Vehicle specific restriction note
    const vehicleNote = activeVehicle.restrictionNote
      ? `This route is suitable for the selected ${activeVehicle.name} based on the available demo road restrictions (${activeVehicle.restrictionNote}).`
      : `This route is suitable for the selected ${activeVehicle.name} based on current gradient and axle load parameters.`;

    const explanationText =
      `Based on the current demo data, I recommend the ${stepsDisplay} route.\n\n` +
      `Route Score: ${score}/100\n` +
      `Traffic: ${traffic}%\n` +
      `Risk: ${risk === 'LOW' ? 'Low' : risk === 'MEDIUM' ? 'Moderate' : 'High'}\n` +
      `Estimated ETA: ${eta}\n\n` +
      `This route is recommended because it has lower traffic and lower overall risk. ${vehicleNote}`;

    const routeData: ArkaRouteDetails = {
      source: sourceCityName,
      sourceState: srcState,
      destination: destCityName,
      destState: dstState,
      corridorSteps,
      distanceKm: distance,
      distanceStr: `${distance} km`,
      etaStr: eta,
      trafficPercent: traffic,
      trafficLevel: traffic < 36 ? 'Low' : traffic < 70 ? 'Moderate' : 'Heavy',
      trafficSignalsCount: signals,
      signalDelayMins: Math.round(signals * 0.75),
      tollGatesCount: tollCount,
      tollCost,
      riskLevel: risk,
      accessibilityScore: accessibility,
      routeScore: score,
      whyThisRoute: 'Lower traffic and lower risk compared with the available alternatives.',
      vehicleName: activeVehicle.name,
      vehicleNote,
    };

    return {
      id: resId,
      intent: 'route',
      text: explanationText,
      routeData,
      mapAction: {
        highlightRoute: true,
        showTraffic: true,
        showTolls: true,
        showSignals: true,
        showRisks: true,
        showFacilities: false,
      },
      suggestedPrompts: [
        'What is the traffic?',
        'How many toll gates are there?',
        'What is the weather?',
        'Why did you choose this route?',
      ],
    };
  }

  // ================= 3. TOLL GATES & PRICING =================
  if (
    lower.includes('toll') ||
    lower.includes('toll gate') ||
    lower.includes('toll gates') ||
    lower.includes('how much toll') ||
    lower.includes('toll cost') ||
    lower.includes('toll fee')
  ) {
    return {
      id: resId,
      intent: 'tolls',
      text: `There are 3 toll gates on the recommended route:\n\n1. Madanpur Toll Plaza (NH-27) – ₹120\n2. Nazirakhat Toll Gate (NH-27) – ₹85\n3. Manderdisa Toll Plaza (NH-29) – ₹95 (or Raha Toll Plaza – ₹110)\n\nEstimated total toll:\n₹365\n\nAll plazas are equipped with FASTag auto-clearance and dedicated multi-axle freight lanes.`,
      mapAction: {
        showTolls: true,
        highlightRoute: true,
      },
      suggestedPrompts: [
        'Find the safest route from Guwahati to Imphal',
        'What is the traffic?',
        'Is this route safe?',
      ],
    };
  }

  // ================= 4. TRAFFIC INFORMATION =================
  if (
    lower.includes('traffic') ||
    lower.includes('congestion') ||
    lower.includes('jam') ||
    lower.includes('delay') ||
    lower.includes('heavy traffic') ||
    lower.includes('signals') ||
    lower.includes('signal delay')
  ) {
    return {
      id: resId,
      intent: 'traffic',
      text: `Current demo traffic level on the selected route is 34%. Traffic is currently moderate.\n\n• Traffic: 34%\n• Level: Moderate\n• Traffic Signals: 8\n• Estimated signal delay: 6 minutes\n• Road congestion:\n  - Guwahati to Nagaon (NH-27): 34% (Low density, free flowing)\n  - Nagaon to Dimapur (NH-29): 42% (Moderate commercial transport)\n  - Dimapur to Kohima: 72% (Heavy mountain convoy headway)\n  - Kohima to Imphal: 32% (Low density, smooth descent)\n\nSignals are dynamically sequenced to prioritize heavy freight haulers.`,
      trafficList: DEMO_DATA.trafficCorridors,
      mapAction: {
        showTraffic: true,
        showSignals: true,
        highlightRoute: true,
      },
      suggestedPrompts: [
        'What is the weather?',
        'How many toll gates are there?',
        'Find the safest route from Guwahati to Imphal',
      ],
    };
  }

  // ================= 5. WEATHER INFORMATION =================
  if (
    lower.includes('weather') ||
    lower.includes('rain') ||
    lower.includes('raining') ||
    lower.includes('monsoon') ||
    lower.includes('fog') ||
    lower.includes('visibility')
  ) {
    return {
      id: resId,
      intent: 'weather',
      text: `Weather on the selected route is currently moderate. Rain may increase estimated travel time by approximately 35 minutes along hill sectors.\n\nCurrent demo telemetry along the corridor:\n• Guwahati: 28°C, Partly Cloudy with Showers (Rain: 6.5mm, Wind: 14 km/h)\n• Shillong: 18°C, Heavy Hill Rain & Mist (Rain: 42.0mm, Delay: ~35 min)\n• Dimapur: 29°C, Humid & Overcast (Rain: 12.0mm)\n• Kohima: 20°C, Dense Fog & Light Rain (Visibility: 0.8 km)\n• Imphal: 25°C, Intermittent Showers (Rain: 14.0mm)\n\n[Note: Telemetry generated from current regional weather demo grid.]`,
      weatherList: DEMO_DATA.weather,
      mapAction: {
        showRisks: true,
        highlightRoute: true,
      },
      suggestedPrompts: [
        'Is there a landslide risk?',
        'What is the traffic?',
        'Find a fuel station',
      ],
    };
  }

  // ================= 6. RISK / LANDSLIDE / ROAD SAFETY =================
  if (
    lower.includes('landslide') ||
    lower.includes('flood') ||
    lower.includes('danger') ||
    lower.includes('blockage') ||
    lower.includes('rockfall') ||
    lower.includes('is this route safe') ||
    lower.includes('is it safe') ||
    lower.includes('how safe') ||
    lower.includes('show risk') ||
    lower.includes('risk alert') ||
    lower.includes('risk')
  ) {
    return {
      id: resId,
      intent: 'risk',
      text: `Current demo risk intelligence alerts for Northeast corridors:\n\n• Landslide Alert: NH-27 Dima Hasao / Haflong Hill Pass (Severity: HIGH 78%) – Active soil loosening. Heavy cargo diverted to Lumding bypass.\n• Road Blockage: NH-29 Mile 14 Rockfall Clearance Zone (Severity: HIGH 70%) – Single lane alternating traffic; wait time approx. 20-30 minutes.\n• Flood Risk: NH-37 Kaziranga National Park Corridor (Severity: MEDIUM 54%) – Strict 40 km/h speed limit.\n• Low Visibility: Mawlai-Umiam Lake sector (Severity: MEDIUM 60%) – Fog lamps required.\n\nThe recommended Guwahati ➔ Imphal Eastern Spine (NH-27 / NH-29) successfully bypasses the critical Dima Hasao slip zone, maintaining an overall LOW corridor risk score.`,
      mapAction: {
        showRisks: true,
        highlightRoute: true,
      },
      suggestedPrompts: [
        'Find the safest route from Guwahati to Imphal',
        'Find the nearest hospital',
        'Emergency',
      ],
    };
  }

  // ================= 7. EMERGENCY / ACCIDENT / SOS =================
  if (
    lower.includes('emergency') ||
    lower.includes('accident') ||
    lower.includes('sos') ||
    lower.includes('breakdown') ||
    lower.includes('road blocked') ||
    lower.includes('ambulance') ||
    lower.includes('police') ||
    lower.includes('disaster')
  ) {
    return {
      id: resId,
      intent: 'emergency',
      text: `🚨 CRITICAL EMERGENCY ASSISTANCE PROTOCOL ACTIVATED:\n\n• National Emergency Helpline: 112 (Disaster Response: 1070)\n• Nearest Primary Trauma Hospital: Guwahati Medical College & Hospital (GMCH) – 0361-2529457 (4.2 km)\n• Imphal Valley Emergency Hospital: Regional Institute of Medical Sciences (RIMS) – 0385-2414629 (3.5 km)\n• 24/7 Heavy Recovery & Crane Service: Assam Highway Recovery Hub – +91 94350 44123\n• NDRF 1st Battalion Station: Patgaon Kamrup (Ready - 112 Integrated)\n• Active Obstruction: NH-29 Mile 14 has single-lane alternating passage due to rockfall clearance.\n\nPriority medical & recovery escort can be coordinated via ARKA Emergency Mode.`,
      mapAction: {
        emergencyFocus: true,
        showFacilities: true,
        showRisks: true,
      },
      suggestedPrompts: [
        'Find the nearest hospital',
        'Find the safest route from Guwahati to Imphal',
        'Find vehicle repair',
      ],
    };
  }

  // ================= 8. NEARBY SERVICES (HOSPITAL, FUEL, HOTEL, WAREHOUSE, REPAIR) =================
  if (
    lower.includes('hospital') ||
    lower.includes('fuel') ||
    lower.includes('petrol') ||
    lower.includes('diesel') ||
    lower.includes('hotel') ||
    lower.includes('restaurant') ||
    lower.includes('food') ||
    lower.includes('warehouse') ||
    lower.includes('repair') ||
    lower.includes('mechanic') ||
    lower.includes('nearby') ||
    lower.includes('service')
  ) {
    const facilities = findNearbyFacilities(lower);
    let categoryTitle = 'Nearby Facilities';
    if (lower.includes('hospital')) categoryTitle = 'Nearby Trauma Hospitals';
    else if (lower.includes('fuel') || lower.includes('petrol') || lower.includes('diesel')) categoryTitle = 'Highway Fuel & EV Stations';
    else if (lower.includes('hotel') || lower.includes('restaurant') || lower.includes('food')) categoryTitle = 'Rest Areas & Dining';
    else if (lower.includes('warehouse') || lower.includes('storage')) categoryTitle = 'Logistics Warehouses & Staging Hubs';
    else if (lower.includes('repair') || lower.includes('mechanic')) categoryTitle = 'Heavy Vehicle Repair Hubs';

    const listLines = facilities.slice(0, 3).map((f, i) => {
      return `${i + 1}. ${f.name}\n   • Location: ${f.location}\n   • Distance: ${f.distanceKm} km (approx. ${f.travelTime})\n   • Status: ${f.status}\n   • Contact: ${f.phone}`;
    });

    return {
      id: resId,
      intent: 'nearby',
      text: `Found the following ${categoryTitle} along the active corridor:\n\n${listLines.join('\n\n')}\n\nFacilities have been pinned on your interactive map view.`,
      facilities: facilities.slice(0, 4),
      mapAction: {
        showFacilities: true,
        focusedPoint: facilities[0] ? { x: facilities[0].x, y: facilities[0].y, label: facilities[0].name } : undefined,
      },
      suggestedPrompts: [
        'Find the nearest hospital',
        'Find a fuel station',
        'Find a hotel',
        'Find a warehouse',
      ],
    };
  }

  // ================= 9. SHIPMENT TRACKING =================
  if (
    lower.includes('shipment') ||
    lower.includes('track') ||
    lower.includes('tracking') ||
    lower.includes('where is my shipment') ||
    lower.includes('cargo') ||
    lower.includes('where is my truck') ||
    lower.includes('what is my eta')
  ) {
    const shipment = DEMO_DATA.shipments[0]; // ARKA-AS-9021

    return {
      id: resId,
      intent: 'shipment',
      text: `Live Tracking Telemetry for Consignment [${shipment.id}]:\n\n• Cargo: ${shipment.cargoType}\n• Corridor: ${shipment.source} (${shipment.sourceState}) ➔ ${shipment.destination} (${shipment.destState})\n• Current Location: ${shipment.currentLocation}\n• Route Progress: ${shipment.routeProgress}% completed\n• Status: ${shipment.statusText}\n• Live ETA: ${shipment.eta}\n• Traffic Density: ${shipment.trafficPercent}% (Low)\n• Driver: ${shipment.driverName} (${shipment.driverPhone})\n• Vehicle: ${shipment.vehicleType} [${shipment.vehiclePlate}]\n\nThe active GPS telemetry pin is visible on your map.`,
      mapAction: {
        activeShipmentPoint: { ...shipment.coordinates, label: shipment.id },
        highlightRoute: true,
      },
      suggestedPrompts: [
        'What is the traffic?',
        'What is the weather?',
        'Find the nearest hospital',
      ],
    };
  }

  // ================= 10. FALLBACK / UNKNOWN =================
  return {
    id: resId,
    intent: 'unknown',
    text: "I'm not sure I understood that. You can ask me about routes, traffic, weather, risks, shipments or nearby facilities.",
    suggestedPrompts: [
      'Find the safest route from Guwahati to Imphal',
      'What is the traffic situation?',
      'What is the weather?',
      'Is there a landslide risk?',
      'Find the nearest hospital',
      'Track my shipment',
    ],
  };
}
