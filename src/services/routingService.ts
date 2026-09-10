// Real Road Routing Service using OSRM (Open Source Routing Machine)
// Translates geographic coordinates into actual highway route geometry, distance, and duration

export interface RoadRouteResponse {
  distanceKm: number;
  durationSeconds: number;
  eta: string;
  geometry: [number, number][]; // [lat, lng] array for Leaflet
  altGeometry?: [number, number][];
  altDistanceKm?: number;
  altEta?: string;
  provider: string;
}

let activeRequestId = 0;

// Helper: Haversine distance calculation in km
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate smooth curved road geometry fallback between two points
function generateFallbackGeometry(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  steps: number = 25,
  curveFactor: number = 0.08
): [number, number][] {
  const pts: [number, number][] = [];
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;

  // Normal vector for curve
  const normalLat = -dLng * curveFactor;
  const normalLng = dLat * curveFactor;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Parabolic arc for natural hill bypass bend
    const arc = Math.sin(t * Math.PI);
    const lat = origin.lat + dLat * t + normalLat * arc;
    const lng = origin.lng + dLng * t + normalLng * arc;
    pts.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  }
  return pts;
}

function formatDuration(seconds: number): string {
  const totalHours = seconds / 3600;
  const hours = Math.floor(totalHours);
  const mins = Math.round((totalHours - hours) * 60);

  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} mins` : ''}`.trim();
  }
  return `${Math.max(1, mins)} mins`;
}

export async function calculateRoadRoute(
  origin: { lat: number; lng: number; name: string },
  destination: { lat: number; lng: number; name: string },
  speedFactor: number = 1.0,
  signal?: AbortSignal
): Promise<RoadRouteResponse> {
  const currentId = ++activeRequestId;

  console.log('[ARKA Routing Engine Request]', {
    requestId: currentId,
    origin: { name: origin.name, lat: origin.lat, lng: origin.lng },
    destination: { name: destination.name, lat: destination.lat, lng: destination.lng },
    provider: 'OSRM Driving Engine (OpenStreetMap Network)',
  });

  // Handle identical origin and destination
  if (
    origin.name.toLowerCase() === destination.name.toLowerCase() ||
    (Math.abs(origin.lat - destination.lat) < 0.0005 && Math.abs(origin.lng - destination.lng) < 0.0005)
  ) {
    return {
      distanceKm: 0,
      durationSeconds: 0,
      eta: '0 mins',
      geometry: [[origin.lat, origin.lng]],
      provider: 'OSRM (Local Node)',
    };
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url, {
      signal: signal || controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`Routing provider responded with status ${response.status}`);
    }

    const data = await response.json();

    if (currentId !== activeRequestId) {
      throw new Error('STALE_REQUEST');
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error(`No drivable road route found between ${origin.name} and ${destination.name}.`);
    }

    // 1. Primary Route
    const route = data.routes[0];
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const rawDuration = route.duration; // seconds
    const adjustedDurationSec = Math.max(60, rawDuration / (speedFactor || 1.0));
    const eta = formatDuration(adjustedDurationSec);

    const geometry: [number, number][] = route.geometry.coordinates.map(
      (pt: [number, number]) => [Number(pt[1].toFixed(5)), Number(pt[0].toFixed(5))]
    );

    // 2. Alternative Route (either from OSRM alternatives or synthetic detour)
    let altGeometry: [number, number][] | undefined;
    let altDistanceKm: number | undefined;
    let altEta: string | undefined;

    if (data.routes.length > 1) {
      const altRoute = data.routes[1];
      altDistanceKm = Math.round((altRoute.distance / 1000) * 10) / 10;
      const altAdjDuration = Math.max(60, altRoute.duration / (speedFactor || 1.0));
      altEta = formatDuration(altAdjDuration);
      altGeometry = altRoute.geometry.coordinates.map((pt: [number, number]) => [
        Number(pt[1].toFixed(5)),
        Number(pt[0].toFixed(5)),
      ]);
    } else {
      // Create a parallel bypass alternative geometry
      altDistanceKm = Math.round(distanceKm * 1.15 * 10) / 10;
      altEta = formatDuration(adjustedDurationSec * 1.22);
      altGeometry = generateFallbackGeometry(origin, destination, 30, -0.12);
    }

    console.log('[ARKA Routing Engine Response]', {
      requestId: currentId,
      distanceKm,
      durationSeconds: Math.round(adjustedDurationSec),
      eta,
      geometryVertices: geometry.length,
      hasAlternative: Boolean(altGeometry),
    });

    return {
      distanceKm,
      durationSeconds: adjustedDurationSec,
      eta,
      geometry,
      altGeometry,
      altDistanceKm,
      altEta,
      provider: 'OSRM Driving Engine',
    };
  } catch (err: any) {
    if (err.name === 'AbortError' || err.message === 'STALE_REQUEST') {
      throw err;
    }
    console.warn('[ARKA Routing Fallback Activated]', err.message);

    // Fallback road calculation based on coordinates
    const directDist = calculateHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    // Northeast road tortuosity factor in hill terrain is ~1.35x direct straight line
    const roadDistKm = Math.max(2, Math.round(directDist * 1.35 * 10) / 10);
    // Average hill speed ~38 km/h adjusted for vehicle
    const avgSpeed = 38 * (speedFactor || 1.0);
    const durationSeconds = Math.round((roadDistKm / avgSpeed) * 3600);
    const eta = formatDuration(durationSeconds);
    const geometry = generateFallbackGeometry(origin, destination, 35, 0.08);

    const altDistanceKm = Math.round(roadDistKm * 1.18 * 10) / 10;
    const altEta = formatDuration(durationSeconds * 1.25);
    const altGeometry = generateFallbackGeometry(origin, destination, 35, -0.14);

    return {
      distanceKm: roadDistKm,
      durationSeconds,
      eta,
      geometry,
      altGeometry,
      altDistanceKm,
      altEta,
      provider: 'ARKA Northeast Fallback Routing Matrix',
    };
  }
}
