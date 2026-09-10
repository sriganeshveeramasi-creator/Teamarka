import { AccessibilityFacility } from '@/data/mockLogistics';
import { NORTHEAST_STATES } from '@/data/northeastData';

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @returns distance in kilometers
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371.0088 * c;
}

/**
 * Calculates the shortest distance from point P to line segment AB in kilometers.
 */
export function distancePointToSegmentKm(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const midLat = toRad((aLat + bLat) / 2);
  const cosMidLat = Math.cos(midLat);

  // Equirectangular local projection in km
  const dx = toRad(bLng - aLng) * cosMidLat * 6371.0088;
  const dy = toRad(bLat - aLat) * 6371.0088;
  const segLenSq = dx * dx + dy * dy;

  if (segLenSq < 1e-6) {
    return haversineDistanceKm(pLat, pLng, aLat, aLng);
  }

  const px = toRad(pLng - aLng) * cosMidLat * 6371.0088;
  const py = toRad(pLat - aLat) * 6371.0088;

  let t = (px * dx + py * dy) / segLenSq;
  t = Math.max(0, Math.min(1, t));

  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);

  return haversineDistanceKm(pLat, pLng, projLat, projLng);
}

/**
 * Calculates the minimum distance from point (lat, lng) to an active route polyline.
 * @returns minimum distance in kilometers to the route corridor
 */
export function calculateMinDistanceToRoute(
  lat: number,
  lng: number,
  routePolyline: [number, number][]
): number {
  if (!routePolyline || routePolyline.length === 0) return 9999;
  if (routePolyline.length === 1) {
    return haversineDistanceKm(lat, lng, routePolyline[0][0], routePolyline[0][1]);
  }

  let minDistance = Infinity;
  for (let i = 0; i < routePolyline.length - 1; i++) {
    const [aLat, aLng] = routePolyline[i];
    const [bLat, bLng] = routePolyline[i + 1];
    const d = distancePointToSegmentKm(lat, lng, aLat, aLng, bLat, bLng);
    if (d < minDistance) {
      minDistance = d;
    }
  }
  return minDistance;
}

// Synonyms and related search terms for facility types
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  Hospital: [
    'hospital',
    'clinic',
    'medical',
    'trauma',
    'doctor',
    'health',
    'ambulance',
    'emergency room',
    'icu',
    'healthcare',
    'pharma',
    'pharmacy',
    'dispensary',
  ],
  'Fuel Station': [
    'fuel',
    'petrol',
    'diesel',
    'gas',
    'iocl',
    'hp',
    'bpcl',
    'charging',
    'ev',
    'ev charging',
    'pump',
    'station',
    'petrol pump',
    'oil',
  ],
  Warehouse: [
    'warehouse',
    'storage',
    'depot',
    'cargo',
    'freight',
    'logistics hub',
    'container',
    'fmcg',
    'cold storage',
    'godown',
    'staging',
  ],
  'Rest Area': [
    'rest',
    'hotel',
    'restaurant',
    'food',
    'motel',
    'dhaba',
    'parking',
    'cafe',
    'lounge',
    'dining',
    'resort',
    'refreshment',
    'rest area',
  ],
  'Vehicle Repair': [
    'repair',
    'mechanic',
    'workshop',
    'tyre',
    'tire',
    'garage',
    'breakdown',
    'crane',
    'hydraulic',
    'puncture',
    'service center',
    'automobile',
    'truck repair',
  ],
  'Emergency Services': [
    'emergency',
    'police',
    'ndrf',
    'ambulance',
    'fire',
    'disaster',
    'rescue',
    'patrol',
    'checkpoint',
    'relief',
    'crisis',
  ],
};

/**
 * Searches and filters facilities along an active route corridor within a maximum radius (default 10 km).
 * Results are sorted strictly in ascending order of distance: Nearest first.
 */
export function searchFacilitiesNearRoute(
  facilities: AccessibilityFacility[],
  routeGeometry: [number, number][],
  category: string = 'All Services',
  searchQuery: string = '',
  maxRadiusKm: number = 10.0
): (AccessibilityFacility & { distanceFromRoute: number })[] {
  if (!routeGeometry || routeGeometry.length === 0) return [];

  const cleanQuery = searchQuery.trim().toLowerCase();

  // 1. Filter and compute distance to route
  const matches: (AccessibilityFacility & { distanceFromRoute: number })[] = [];

  for (const fac of facilities) {
    if (!fac.lat || !fac.lng) continue;

    // Category Filter
    if (category !== 'All Services' && fac.type !== category) {
      continue;
    }

    // Search Query Filter
    if (cleanQuery) {
      const nameMatch = fac.name.toLowerCase().includes(cleanQuery);
      const locMatch = fac.location.toLowerCase().includes(cleanQuery);
      const typeMatch = fac.type.toLowerCase().includes(cleanQuery);
      const statusMatch = fac.status.toLowerCase().includes(cleanQuery);

      // Check category synonyms
      const synonyms = CATEGORY_SYNONYMS[fac.type] || [];
      const synonymMatch = synonyms.some(
        (syn) => syn.includes(cleanQuery) || cleanQuery.includes(syn)
      );

      // Custom keywords
      const keywords = (fac as any).keywords || [];
      const keywordMatch = keywords.some((kw: string) =>
        kw.toLowerCase().includes(cleanQuery)
      );

      if (!nameMatch && !locMatch && !typeMatch && !statusMatch && !synonymMatch && !keywordMatch) {
        continue;
      }
    }

    // 2. Geometric Minimum Distance to Route Polyline
    const distFromRoute = calculateMinDistanceToRoute(fac.lat, fac.lng, routeGeometry);

    // 3. Strict 10 KM Radius Gate
    if (distFromRoute <= maxRadiusKm) {
      matches.push({
        ...fac,
        distanceFromRoute: Number(distFromRoute.toFixed(1)),
      });
    }
  }

  // 4. Strict Ascending Sort by Distance: Nearest Place First
  matches.sort((a, b) => a.distanceFromRoute - b.distanceFromRoute);

  return matches;
}

// Corridor highway geometries for standard Northeast routes
export const PREDEFINED_CORRIDORS: Record<string, { name: string; geometry: [number, number][]; distanceKm: number; eta: string }> = {
  'jowai-dimapur': {
    name: 'Jowai → Dimapur (NH-6 & NH-27 Corridor)',
    geometry: [
      [25.4452, 92.2126], // Jowai (Origin)
      [25.6800, 92.0500], // Umroi/Barapani Bypass
      [25.9037, 91.8812], // Nongpoh
      [26.0400, 91.8500], // Byrnihat
      [26.1082, 91.8845], // Jorabat Junction
      [26.1150, 91.9750], // Sonapur
      [26.1800, 92.2500], // Jagiroad
      [26.3465, 92.6840], // Nagaon
      [26.1500, 92.9500], // Dokmoka
      [25.8000, 93.1800], // Lumding / Manderdisa
      [25.7500, 93.4500], // Diphu
      [25.9095, 93.7266], // Dimapur (Destination)
    ],
    distanceKm: 310,
    eta: '7 hrs 15 mins',
  },
  'guwahati-imphal': {
    name: 'Guwahati → Imphal (NH-27 & NH-29 Eastern Spine)',
    geometry: [
      [26.1445, 91.7362], // Guwahati (Origin)
      [26.1082, 91.8845], // Jorabat
      [26.1150, 91.9750], // Sonapur
      [26.3465, 92.6840], // Nagaon
      [25.8000, 93.1800], // Lumding
      [25.7500, 93.4500], // Diphu
      [25.9095, 93.7266], // Dimapur
      [25.8000, 93.9000], // Zubza
      [25.6751, 94.1086], // Kohima
      [25.1500, 93.9700], // Kangpokpi
      [24.9750, 93.8900], // Kanglatongbi
      [24.8170, 93.9368], // Imphal (Destination)
    ],
    distanceKm: 485,
    eta: '11 hrs 30 mins',
  },
  'shillong-silchar': {
    name: 'Shillong → Silchar (NH-6 Jaintia Hills Corridor)',
    geometry: [
      [25.5788, 91.8933], // Shillong (Origin)
      [25.5200, 92.0500], // Mawryngkneng
      [25.4452, 92.2126], // Jowai
      [25.3500, 92.3600], // Khliehriat
      [25.1800, 92.4200], // Lumshnong
      [24.9500, 92.5800], // Badarpur Junction
      [24.8800, 92.6800], // Panchgram
      [24.8170, 92.7926], // Silchar (Destination)
    ],
    distanceKm: 215,
    eta: '5 hrs 45 mins',
  },
  'guwahati-shillong': {
    name: 'Guwahati → Shillong (NH-106 Expressway)',
    geometry: [
      [26.1445, 91.7362], // Guwahati
      [26.1189, 91.8262], // Khanapara
      [26.1082, 91.8845], // Jorabat
      [26.0400, 91.8500], // Byrnihat
      [25.9037, 91.8812], // Nongpoh
      [25.7500, 91.8900], // Umsning
      [25.6500, 91.8900], // Umiam / Barapani
      [25.5788, 91.8933], // Shillong
    ],
    distanceKm: 98,
    eta: '2 hrs 30 mins',
  },
};

/**
 * Finds geographic coordinates [lat, lng] for any city in Northeast India.
 */
export function getCityCoordinates(cityName: string): [number, number] | null {
  if (!cityName) return null;
  const norm = cityName.toLowerCase().trim();
  for (const state of NORTHEAST_STATES) {
    for (const city of state.cities) {
      if (city.name.toLowerCase() === norm || city.district.toLowerCase() === norm) {
        if (city.lat && city.lng) {
          return [city.lat, city.lng];
        }
      }
    }
  }
  return null;
}

/**
 * Builds or resolves a route corridor geometry between source and destination.
 */
export function resolveRouteGeometry(
  source: string,
  destination: string,
  sourceCoords?: [number, number],
  destCoords?: [number, number]
): { geometry: [number, number][]; distanceKm: number; eta: string } {
  const key1 = `${source.toLowerCase().trim()}-${destination.toLowerCase().trim()}`;
  if (PREDEFINED_CORRIDORS[key1]) {
    return PREDEFINED_CORRIDORS[key1];
  }

  // Reverse match check
  const key2 = `${destination.toLowerCase().trim()}-${source.toLowerCase().trim()}`;
  if (PREDEFINED_CORRIDORS[key2]) {
    const rev = PREDEFINED_CORRIDORS[key2];
    return {
      geometry: [...rev.geometry].reverse(),
      distanceKm: rev.distanceKm,
      eta: rev.eta,
    };
  }

  // Handle Current Location / GPS routes
  const isCurrentLoc = source.toLowerCase().includes('current location') || source.toLowerCase().includes('gps');
  if (isCurrentLoc) {
    const s = sourceCoords || [25.5788, 91.8933]; // Default current GPS (Shillong corridor)
    const d = destCoords || getCityCoordinates(destination) || [25.9095, 93.7266];

    // Standard Northeast arterial highway spine
    const highwayBackbone: [number, number][] = [
      [25.5788, 91.8933], // Shillong
      [25.9037, 91.8812], // Nongpoh
      [26.0400, 91.8500], // Byrnihat
      [26.1150, 91.9750], // Sonapur
      [26.3465, 92.6840], // Nagaon
      [25.8000, 93.1800], // Lumding
      [25.7500, 93.4500], // Diphu
      [25.9095, 93.7266], // Dimapur
      [25.6751, 94.1086], // Kohima
      [24.8170, 93.9368], // Imphal
    ];

    // Find nearest waypoint on backbone to s
    let startIdx = 0;
    let minStartD = Infinity;
    for (let i = 0; i < highwayBackbone.length; i++) {
      const dVal = haversineDistanceKm(s[0], s[1], highwayBackbone[i][0], highwayBackbone[i][1]);
      if (dVal < minStartD) {
        minStartD = dVal;
        startIdx = i;
      }
    }

    // Find nearest waypoint on backbone to d
    let endIdx = highwayBackbone.length - 1;
    let minEndD = Infinity;
    for (let i = 0; i < highwayBackbone.length; i++) {
      const dVal = haversineDistanceKm(d[0], d[1], highwayBackbone[i][0], highwayBackbone[i][1]);
      if (dVal < minEndD) {
        minEndD = dVal;
        endIdx = i;
      }
    }

    const corridorWaypoints: [number, number][] = [s];
    if (startIdx <= endIdx) {
      for (let i = startIdx + 1; i <= endIdx; i++) {
        corridorWaypoints.push(highwayBackbone[i]);
      }
    } else {
      for (let i = startIdx - 1; i >= endIdx; i--) {
        corridorWaypoints.push(highwayBackbone[i]);
      }
    }
    if (corridorWaypoints.length === 1 || haversineDistanceKm(corridorWaypoints[corridorWaypoints.length - 1][0], corridorWaypoints[corridorWaypoints.length - 1][1], d[0], d[1]) > 5) {
      corridorWaypoints.push(d);
    }

    let totalDist = 0;
    for (let i = 0; i < corridorWaypoints.length - 1; i++) {
      totalDist += haversineDistanceKm(
        corridorWaypoints[i][0],
        corridorWaypoints[i][1],
        corridorWaypoints[i + 1][0],
        corridorWaypoints[i + 1][1]
      );
    }
    totalDist = Math.round(totalDist * 1.12);
    const hours = (totalDist / 42).toFixed(1);

    return {
      geometry: corridorWaypoints,
      distanceKm: totalDist,
      eta: `${hours} hrs`,
    };
  }

  // General resolution using verified city coordinates
  const s: [number, number] = sourceCoords || getCityCoordinates(source) || [26.1445, 91.7362];
  const d: [number, number] = destCoords || getCityCoordinates(destination) || [24.8170, 93.9368];
  const directDist = haversineDistanceKm(s[0], s[1], d[0], d[1]);
  const dist = Math.round(directDist * 1.25);
  const hours = (dist / 45).toFixed(1);

  // Generate realistic intermediate curve waypoint
  const mid: [number, number] = [
    (s[0] + d[0]) / 2 + 0.05,
    (s[1] + d[1]) / 2 - 0.05,
  ];

  return {
    geometry: [s, mid, d],
    distanceKm: dist,
    eta: `${hours} hrs`,
  };
}
