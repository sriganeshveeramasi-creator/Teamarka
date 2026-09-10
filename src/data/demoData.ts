import {
  NORTHEAST_STATES,
  CityNode,
  StateData,
  VehicleOption,
  VEHICLE_OPTIONS,
  TOLL_GATES,
  TollGate,
  TRAFFIC_SIGNALS,
  TrafficSignal,
  HIGHWAY_ROUTES,
  HighwayRoute,
} from '@/data/northeastData';

import {
  MOCK_SHIPMENTS,
  ShipmentItem,
  RISK_ALERTS,
  RiskIntelligenceAlert,
  ACCESSIBILITY_SERVICES,
  AccessibilityFacility,
} from '@/data/mockLogistics';

export type { AccessibilityFacility, ShipmentItem, RiskIntelligenceAlert };

export interface CityWeather {
  city: string;
  state: string;
  temp: number;
  condition: string;
  rainMm: number;
  windKmh: number;
  visibilityKm: number;
  logisticsImpact: string;
  delayMin: number;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const NORTHEAST_WEATHER: CityWeather[] = [
  {
    city: 'Guwahati',
    state: 'Assam',
    temp: 28,
    condition: 'Partly Cloudy with Showers',
    rainMm: 6.5,
    windKmh: 14,
    visibilityKm: 6.0,
    logisticsImpact: 'Normal freight operations with minor urban spray.',
    delayMin: 10,
    alertLevel: 'LOW',
  },
  {
    city: 'Shillong',
    state: 'Meghalaya',
    temp: 18,
    condition: 'Heavy Hill Rain & Mist',
    rainMm: 42.0,
    windKmh: 24,
    visibilityKm: 1.2,
    logisticsImpact: 'Heavy rainfall may increase travel time by approximately 35 minutes along Barapani-Shillong corridor.',
    delayMin: 35,
    alertLevel: 'HIGH',
  },
  {
    city: 'Dimapur',
    state: 'Nagaland',
    temp: 29,
    condition: 'Humid & Overcast',
    rainMm: 12.0,
    windKmh: 10,
    visibilityKm: 4.5,
    logisticsImpact: 'Smooth highway speeds on plains; slowdown starting near Medziphema hill climb.',
    delayMin: 15,
    alertLevel: 'LOW',
  },
  {
    city: 'Kohima',
    state: 'Nagaland',
    temp: 20,
    condition: 'Dense Fog & Light Rain',
    rainMm: 18.5,
    windKmh: 16,
    visibilityKm: 0.8,
    logisticsImpact: 'Visibility restricted below 1 km. Fog lamps and safe spacing required.',
    delayMin: 25,
    alertLevel: 'MEDIUM',
  },
  {
    city: 'Imphal',
    state: 'Manipur',
    temp: 25,
    condition: 'Intermittent Showers',
    rainMm: 14.0,
    windKmh: 12,
    visibilityKm: 5.0,
    logisticsImpact: 'Clear valley approaches with slight moisture on NH-102.',
    delayMin: 12,
    alertLevel: 'LOW',
  },
  {
    city: 'Agartala',
    state: 'Tripura',
    temp: 31,
    condition: 'Scattered Clouds',
    rainMm: 2.0,
    windKmh: 8,
    visibilityKm: 8.0,
    logisticsImpact: 'Optimal transit conditions across state highway networks.',
    delayMin: 0,
    alertLevel: 'LOW',
  },
  {
    city: 'Silchar',
    state: 'Assam',
    temp: 27,
    condition: 'Overcast & Drizzle',
    rainMm: 16.0,
    windKmh: 11,
    visibilityKm: 4.0,
    logisticsImpact: 'Wet road surfaces near Dima Hasao hill slopes.',
    delayMin: 20,
    alertLevel: 'MEDIUM',
  },
];

export interface CorridorTraffic {
  segment: string;
  highway: string;
  trafficPercent: number;
  level: 'Low' | 'Moderate' | 'Heavy';
  status: string;
  estimatedDelayMins: number;
}

export const CORRIDOR_TRAFFIC_DATA: CorridorTraffic[] = [
  {
    segment: 'Guwahati ➔ Nagaon',
    highway: 'NH-27',
    trafficPercent: 34,
    level: 'Low',
    status: 'Smooth flow, multi-lane divided carriageway',
    estimatedDelayMins: 0,
  },
  {
    segment: 'Nagaon ➔ Lumding',
    highway: 'NH-27 / NH-29',
    trafficPercent: 42,
    level: 'Moderate',
    status: 'Normal commercial freight flow',
    estimatedDelayMins: 4,
  },
  {
    segment: 'Lumding ➔ Dimapur',
    highway: 'NH-29',
    trafficPercent: 38,
    level: 'Low',
    status: 'Level terrain transit, steady headway',
    estimatedDelayMins: 2,
  },
  {
    segment: 'Dimapur ➔ Kohima',
    highway: 'NH-29 Mountain Climb',
    trafficPercent: 72,
    level: 'Heavy',
    status: 'Heavy hill convoy congestion, single-lane rockfall zone at Mile 14',
    estimatedDelayMins: 25,
  },
  {
    segment: 'Kohima ➔ Imphal',
    highway: 'NH-2 / NH-102',
    trafficPercent: 32,
    level: 'Low',
    status: 'Smooth descent into Imphal Valley',
    estimatedDelayMins: 0,
  },
  {
    segment: 'Guwahati ➔ Shillong',
    highway: 'NH-106',
    trafficPercent: 55,
    level: 'Moderate',
    status: 'Rain spray slowdown along Barapani curves',
    estimatedDelayMins: 15,
  },
  {
    segment: 'Shillong ➔ Silchar',
    highway: 'NH-6',
    trafficPercent: 64,
    level: 'Moderate',
    status: 'Frequent fog patches and hill curves',
    estimatedDelayMins: 20,
  },
];

export const DEMO_DATA = {
  states: NORTHEAST_STATES,
  cities: NORTHEAST_STATES.flatMap((s) =>
    s.cities.map((c) => ({ ...c, stateName: s.name, stateId: s.id }))
  ),
  routes: HIGHWAY_ROUTES,
  trafficCorridors: CORRIDOR_TRAFFIC_DATA,
  weather: NORTHEAST_WEATHER,
  tolls: TOLL_GATES,
  signals: TRAFFIC_SIGNALS,
  risks: RISK_ALERTS,
  facilities: ACCESSIBILITY_SERVICES,
  shipments: MOCK_SHIPMENTS,
  vehicles: VEHICLE_OPTIONS,
};

// ================= HELPER LOOKUPS =================

export function findCity(name: string): (CityNode & { stateName: string; stateId: string }) | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return DEMO_DATA.cities.find(
    (c) =>
      c.name.toLowerCase() === clean ||
      c.name.toLowerCase().includes(clean) ||
      clean.includes(c.name.toLowerCase())
  );
}

export function findState(name: string): StateData | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return DEMO_DATA.states.find(
    (s) =>
      s.name.toLowerCase() === clean ||
      s.name.toLowerCase().includes(clean) ||
      clean.includes(s.name.toLowerCase())
  );
}

export function findNearbyFacilities(typeQuery?: string): AccessibilityFacility[] {
  if (!typeQuery) return DEMO_DATA.facilities;
  const q = typeQuery.toLowerCase();

  if (q.includes('hosp') || q.includes('medic') || q.includes('doctor') || q.includes('trauma') || q.includes('clinic')) {
    return DEMO_DATA.facilities.filter((f) => f.type === 'Hospital');
  }
  if (q.includes('fuel') || q.includes('petrol') || q.includes('diesel') || q.includes('gas') || q.includes('ev') || q.includes('cng')) {
    return DEMO_DATA.facilities.filter((f) => f.type === 'Fuel Station');
  }
  if (q.includes('hotel') || q.includes('rest') || q.includes('food') || q.includes('restaurant') || q.includes('eat') || q.includes('stay') || q.includes('sleep') || q.includes('motel') || q.includes('dhaba')) {
    return DEMO_DATA.facilities.filter((f) => f.type === 'Rest Area' || f.type === 'Restaurant / Hotel');
  }
  if (q.includes('ware') || q.includes('storage') || q.includes('depot') || q.includes('hub')) {
    return DEMO_DATA.facilities.filter((f) => f.type === 'Warehouse' || f.type === 'Transport Hub');
  }
  if (q.includes('repair') || q.includes('mechanic') || q.includes('tyre') || q.includes('crane') || q.includes('breakdown') || q.includes('service center')) {
    return DEMO_DATA.facilities.filter((f) => f.type === 'Vehicle Repair');
  }
  if (q.includes('emergency') || q.includes('disaster') || q.includes('police') || q.includes('relief') || q.includes('ndrf')) {
    return DEMO_DATA.facilities.filter((f) => f.type === 'Emergency Services' || f.type === 'Hospital');
  }

  return DEMO_DATA.facilities;
}

export function extractRouteEndpoints(query: string): { source?: string; destination?: string } {
  const q = query.toLowerCase();

  // Pattern 1: "from X to Y"
  const fromToMatch = query.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:[.,?!]|$)/i);
  if (fromToMatch) {
    const srcRaw = fromToMatch[1].trim();
    const dstRaw = fromToMatch[2].trim();
    const srcCity = findCity(srcRaw) || findState(srcRaw);
    const dstCity = findCity(dstRaw) || findState(dstRaw);
    return {
      source: srcCity ? srcCity.name : srcRaw,
      destination: dstCity ? dstCity.name : dstRaw,
    };
  }

  // Pattern 2: "between X and Y"
  const betweenMatch = query.match(/between\s+([a-zA-Z\s]+?)\s+and\s+([a-zA-Z\s]+?)(?:[.,?!]|$)/i);
  if (betweenMatch) {
    const srcRaw = betweenMatch[1].trim();
    const dstRaw = betweenMatch[2].trim();
    const srcCity = findCity(srcRaw) || findState(srcRaw);
    const dstCity = findCity(dstRaw) || findState(dstRaw);
    return {
      source: srcCity ? srcCity.name : srcRaw,
      destination: dstCity ? dstCity.name : dstRaw,
    };
  }

  // Pattern 3: "X to Y"
  const directMatch = query.match(/([a-zA-Z\s]{3,25})\s+to\s+([a-zA-Z\s]{3,25})(?:[.,?!]|$)/i);
  if (directMatch) {
    const srcCandidate = directMatch[1].trim().replace(/^(find|show|safest|best|recommended|route|the|a|for|between)\s+/i, '');
    const dstCandidate = directMatch[2].trim().replace(/\s+(route|please|now|safest|best).*$/i, '');
    const srcMatch = findCity(srcCandidate) || findState(srcCandidate);
    const dstMatch = findCity(dstCandidate) || findState(dstCandidate);
    if (srcMatch && dstMatch) {
      return { source: srcMatch.name, destination: dstMatch.name };
    }
  }

  // Pattern 4: Check mentions of known key hubs
  const allHubs = [
    'Guwahati', 'Imphal', 'Shillong', 'Dimapur', 'Kohima', 'Silchar',
    'Dibrugarh', 'Agartala', 'Jorhat', 'Aizawl', 'Itanagar', 'Gangtok',
    'Assam', 'Manipur', 'Meghalaya', 'Nagaland', 'Mizoram', 'Tripura'
  ];
  const foundHubs: string[] = [];
  for (const hub of allHubs) {
    if (new RegExp(`\\b${hub}\\b`, 'i').test(q)) {
      foundHubs.push(hub);
    }
  }
  if (foundHubs.length >= 2) {
    return { source: foundHubs[0], destination: foundHubs[1] };
  } else if (foundHubs.length === 1) {
    if (new RegExp(`to\\s+${foundHubs[0]}`, 'i').test(q)) {
      return { destination: foundHubs[0] };
    } else if (new RegExp(`from\\s+${foundHubs[0]}`, 'i').test(q)) {
      return { source: foundHubs[0] };
    }
  }

  return {};
}
