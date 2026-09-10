import { resolveRouteGeometry, haversineDistanceKm } from './corridorGeo';
import { RiskIntelligenceAlert } from '@/data/mockLogistics';

export interface RouteRiskItem {
  id: string;
  category:
    | 'Heavy Rain'
    | 'Flood'
    | 'Road Blockage'
    | 'Poor Road Condition'
    | 'Landslide'
    | 'Traffic'
    | 'Low Visibility'
    | 'Bridge Restriction';
  percentage: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  advisory: string;
  location: string;
  lat?: number;
  lng?: number;
}

export interface RiskRoute {
  id: string;
  routeNumber: 1 | 2 | 3;
  name: string;
  isBest: boolean;
  tag: 'Best Route' | 'Alternative Route';
  source: string;
  destination: string;
  distanceKm: number;
  eta: string;
  overallRiskScore: number; // e.g. 92, 82, 66 (out of 100). Higher = safer / lower risk
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  majorRisk: {
    category: string;
    percentage: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  risks: RouteRiskItem[]; // Strictly sorted descending by percentage (HIGHEST % -> LOWEST %)
  geometry: [number, number][];
  mapRiskAlerts: RiskIntelligenceAlert[];
  trafficPercent: number;
  tollCount: number;
  signalsCount: number;
  rationale: string;
}

/**
 * Generates 3 dynamically ranked alternative routes for any source -> destination.
 * Ordered strictly BEST -> WORST (lowest overall risk / highest safety score first).
 */
export function generateRiskRoutesForCorridor(
  source: string,
  destination: string,
  sourceCoords?: [number, number],
  destCoords?: [number, number]
): RiskRoute[] {
  // 1. Resolve Primary Baseline Route Geometry
  const base = resolveRouteGeometry(source, destination, sourceCoords, destCoords);
  const baseGeom = base.geometry;
  const baseDist = base.distanceKm || 256.5;

  const baseHours = Math.floor(baseDist / 55);
  const baseMins = Math.round(((baseDist / 55) - baseHours) * 60);
  const baseEtaStr = `${baseHours} hrs ${baseMins > 0 ? `${baseMins} mins` : '15 mins'}`;

  const numPoints = baseGeom.length;
  const midPointIdx = Math.floor(numPoints / 2);
  const q1Idx = Math.max(0, Math.floor(numPoints * 0.25));
  const q3Idx = Math.min(numPoints - 1, Math.floor(numPoints * 0.75));

  // -------------------------------------------------------------
  // ROUTE 1: PRIMARY HIGHWAY EXPRESSWAY (SAFEST CORRIDOR / BEST ROUTE)
  // -------------------------------------------------------------
  const r1Geom: [number, number][] = [...baseGeom];
  const r1Dist = baseDist;
  const r1Eta = baseEtaStr;

  const r1RainPoint = r1Geom[q1Idx] || r1Geom[0];
  const r1LandslidePoint = r1Geom[midPointIdx] || r1Geom[0];
  const r1TrafficPoint = r1Geom[q3Idx] || r1Geom[r1Geom.length - 1];

  const r1Risks: RouteRiskItem[] = [
    {
      id: 'r1-rain',
      category: 'Heavy Rain',
      percentage: 32,
      severity: 'LOW',
      description: `Intermittent rain showers observed along the ${source} expressway corridor; surface drainage clear.`,
      advisory: 'Standard highway wet-tarmac caution. Maintain 65 km/h limit.',
      location: `${source} Expressway Sector`,
      lat: r1RainPoint[0],
      lng: r1RainPoint[1],
    },
    {
      id: 'r1-traffic',
      category: 'Traffic',
      percentage: 28,
      severity: 'LOW',
      description: 'Free-flowing multi-axle freight volume through automated FASTag plazas.',
      advisory: 'Lane discipline enforced by ARKA automated telemetry.',
      location: 'NH Expressway Corridor',
      lat: r1TrafficPoint[0],
      lng: r1TrafficPoint[1],
    },
    {
      id: 'r1-landslide',
      category: 'Landslide',
      percentage: 22,
      severity: 'LOW',
      description: 'Stabilized mountain rock slopes with wire mesh and retaining walls.',
      advisory: 'Geotechnical monitoring normal. All lanes clear.',
      location: 'Foothill Cut Section',
      lat: r1LandslidePoint[0],
      lng: r1LandslidePoint[1],
    },
    {
      id: 'r1-road',
      category: 'Poor Road Condition',
      percentage: 18,
      severity: 'LOW',
      description: 'Engineered 4-lane bitumen highway with reflective median indicators.',
      advisory: 'Smooth transit grade. No significant surface defects.',
      location: 'Primary National Highway',
    },
    {
      id: 'r1-flood',
      category: 'Flood',
      percentage: 14,
      severity: 'LOW',
      description: 'Elevated causeway over regional stream beds with free-flowing culverts.',
      advisory: 'Water levels well below caution threshold.',
      location: 'River Basin Approach',
    },
    {
      id: 'r1-blockage',
      category: 'Road Blockage',
      percentage: 12,
      severity: 'LOW',
      description: '24/7 highway clearance patrol active; zero lane obstruction reported.',
      advisory: 'Standard convoy headway recommended.',
      location: 'Interchange Junctions',
    },
    {
      id: 'r1-fog',
      category: 'Low Visibility',
      percentage: 10,
      severity: 'LOW',
      description: 'Daytime atmospheric visibility exceeding 3 km across open terrain.',
      advisory: 'Headlamps recommended during dawn and twilight.',
      location: 'Plateau Sections',
    },
  ];
  r1Risks.sort((a, b) => b.percentage - a.percentage);

  const r1Alerts: RiskIntelligenceAlert[] = [
    {
      id: 'alert-r1-1',
      category: 'Heavy Rain',
      location: `${source} Foothills (Route 1)`,
      state: 'Northeast Corridor',
      severity: 'LOW',
      percentage: 32,
      description: 'Mild drizzle with clean asphalt drainage.',
      advisory: 'Normal driving caution.',
      x: 300,
      y: 340,
      lat: r1RainPoint[0],
      lng: r1RainPoint[1],
    },
  ];

  const route1: RiskRoute = {
    id: 'route-1',
    routeNumber: 1,
    name: 'Primary Expressway Corridor (NH-27/6 Arterial)',
    isBest: true,
    tag: 'Best Route',
    source,
    destination,
    distanceKm: Number(r1Dist.toFixed(1)),
    eta: r1Eta,
    overallRiskScore: 92,
    overallRiskLevel: 'LOW',
    majorRisk: {
      category: 'Heavy Rain',
      percentage: 32,
      severity: 'LOW',
    },
    risks: r1Risks,
    geometry: r1Geom,
    mapRiskAlerts: r1Alerts,
    trafficPercent: 28,
    tollCount: 2,
    signalsCount: 5,
    rationale: 'Recommended safest corridor by ARKA AI: Lowest overall hazard index, engineered slope retainers, and fastest transit velocity.',
  };

  // -------------------------------------------------------------
  // ROUTE 2: SECONDARY VALLEY BYPASS (ALTERNATIVE ROUTE)
  // -------------------------------------------------------------
  const r2Geom: [number, number][] = baseGeom.map((pt, idx) => {
    if (idx === 0 || idx === numPoints - 1) return pt;
    const factor = Math.sin((idx / (numPoints - 1)) * Math.PI);
    return [
      Number((pt[0] + 0.052 * factor).toFixed(4)),
      Number((pt[1] + 0.038 * factor).toFixed(4)),
    ];
  });

  const r2Dist = Number((baseDist * 1.058).toFixed(1));
  const r2MinsTotal = baseHours * 60 + baseMins + 22;
  const r2Hours = Math.floor(r2MinsTotal / 60);
  const r2Mins = r2MinsTotal % 60;
  const r2Eta = `${r2Hours} hrs ${r2Mins} mins`;

  const r2LandslidePoint = r2Geom[midPointIdx] || r2Geom[0];
  const r2RainPoint = r2Geom[q3Idx] || r2Geom[r2Geom.length - 1];

  const r2Risks: RouteRiskItem[] = [
    {
      id: 'r2-landslide',
      category: 'Landslide',
      percentage: 46,
      severity: 'MEDIUM',
      description: 'Moderate soil moisture on secondary valley hillside cuts with minor loose rock fragments.',
      advisory: 'Maintain 40 km/h speed around unshielded hill curves.',
      location: 'Valley Hill Pass Sector',
      lat: r2LandslidePoint[0],
      lng: r2LandslidePoint[1],
    },
    {
      id: 'r2-rain',
      category: 'Heavy Rain',
      percentage: 42,
      severity: 'MEDIUM',
      description: 'Sustained rain causing puddles and water pooling on unpaved shoulders.',
      advisory: 'Avoid soft road shoulders; maintain safe braking clearance.',
      location: 'River Valley Approach',
      lat: r2RainPoint[0],
      lng: r2RainPoint[1],
    },
    {
      id: 'r2-blockage',
      category: 'Road Blockage',
      percentage: 38,
      severity: 'MEDIUM',
      description: 'Agricultural transit tractors and local market trucks causing periodic bottlenecks.',
      advisory: 'Expect 15-20 min delays near rural highway markets.',
      location: 'Valley Market Junctions',
    },
    {
      id: 'r2-traffic',
      category: 'Traffic',
      percentage: 34,
      severity: 'LOW',
      description: 'Two-lane undivided regional highway with moderate commercial traffic.',
      advisory: 'Keep safe following distance on single-lane overtaking stretches.',
      location: 'State Highway Sector',
    },
    {
      id: 'r2-road',
      category: 'Poor Road Condition',
      percentage: 30,
      severity: 'LOW',
      description: 'Occasional shallow potholes and rough bitumen patches on culvert approaches.',
      advisory: 'Reduce speed when crossing rural bridge culverts.',
      location: 'Rural Highway Link',
    },
    {
      id: 'r2-flood',
      category: 'Flood',
      percentage: 22,
      severity: 'LOW',
      description: 'Seasonal stream runoff near low causeways; water levels monitored.',
      advisory: 'Verify clearance markers before crossing low-lying dip bridges.',
      location: 'River Tributary Crossing',
    },
    {
      id: 'r2-fog',
      category: 'Low Visibility',
      percentage: 18,
      severity: 'LOW',
      description: 'Early morning valley mist pockets reducing visibility to ~700 meters.',
      advisory: 'Switch on low beams and maintain amber fog markers.',
      location: 'Valley Bottom Corridor',
    },
  ];
  r2Risks.sort((a, b) => b.percentage - a.percentage);

  const r2Alerts: RiskIntelligenceAlert[] = [
    {
      id: 'alert-r2-1',
      category: 'Landslide',
      location: `Valley Hill Pass (Route 2)`,
      state: 'Northeast Corridor',
      severity: 'MEDIUM',
      percentage: 46,
      description: 'Minor gravel movement on hill incline.',
      advisory: 'Speed reduced to 40 km/h.',
      x: 320,
      y: 360,
      lat: r2LandslidePoint[0],
      lng: r2LandslidePoint[1],
    },
    {
      id: 'alert-r2-2',
      category: 'Heavy Rain',
      location: `River Basin (Route 2)`,
      state: 'Northeast Corridor',
      severity: 'MEDIUM',
      percentage: 42,
      description: 'Persistent cloud cover and wet surface.',
      advisory: 'Avoid soft road shoulders.',
      x: 340,
      y: 380,
      lat: r2RainPoint[0],
      lng: r2RainPoint[1],
    },
  ];

  const route2: RiskRoute = {
    id: 'route-2',
    routeNumber: 2,
    name: 'State Highway Valley Bypass (Alternate Corridor)',
    isBest: false,
    tag: 'Alternative Route',
    source,
    destination,
    distanceKm: r2Dist,
    eta: r2Eta,
    overallRiskScore: 82,
    overallRiskLevel: 'MEDIUM',
    majorRisk: {
      category: 'Landslide',
      percentage: 46,
      severity: 'MEDIUM',
    },
    risks: r2Risks,
    geometry: r2Geom,
    mapRiskAlerts: r2Alerts,
    trafficPercent: 46,
    tollCount: 1,
    signalsCount: 8,
    rationale: 'Alternative Route 2: Secondary valley link with moderate rain and gravel hazards, suitable when main highway has heavy convoy traffic.',
  };

  // -------------------------------------------------------------
  // ROUTE 3: RIDGE MOUNTAIN GHAT PASS (HIGHEST RISK / THIRD BEST)
  // -------------------------------------------------------------
  const r3Geom: [number, number][] = baseGeom.map((pt, idx) => {
    if (idx === 0 || idx === numPoints - 1) return pt;
    const factor = Math.sin((idx / (numPoints - 1)) * Math.PI);
    return [
      Number((pt[0] - 0.068 * factor).toFixed(4)),
      Number((pt[1] - 0.045 * factor).toFixed(4)),
    ];
  });

  const r3Dist = Number((baseDist * 1.145).toFixed(1));
  const r3MinsTotal = baseHours * 60 + baseMins + 48;
  const r3Hours = Math.floor(r3MinsTotal / 60);
  const r3Mins = r3MinsTotal % 60;
  const r3Eta = `${r3Hours} hrs ${r3Mins} mins`;

  const r3LandslidePoint = r3Geom[midPointIdx] || r3Geom[0];
  const r3FogPoint = r3Geom[q1Idx] || r3Geom[0];
  const r3BlockagePoint = r3Geom[q3Idx] || r3Geom[r3Geom.length - 1];

  const r3Risks: RouteRiskItem[] = [
    {
      id: 'r3-landslide',
      category: 'Landslide',
      percentage: 78,
      severity: 'HIGH',
      description: 'Active geological soil loosening and steep rockfall vulnerability on upper ridge cliffs.',
      advisory: 'Mandatory caution: Heavy hauliers prohibited after sunset; escort required.',
      location: 'Mountain Ridge Ghat Pass',
      lat: r3LandslidePoint[0],
      lng: r3LandslidePoint[1],
    },
    {
      id: 'r3-fog',
      category: 'Low Visibility',
      percentage: 68,
      severity: 'MEDIUM',
      description: 'Dense high-altitude fog bank; sight distance restricted under 120 meters on hairpins.',
      advisory: 'Hazard lights required; convoy speed capped at 25 km/h.',
      location: 'Upper Mountain Pass Summit',
      lat: r3FogPoint[0],
      lng: r3FogPoint[1],
    },
    {
      id: 'r3-blockage',
      category: 'Road Blockage',
      percentage: 62,
      severity: 'MEDIUM',
      description: 'Single-lane alternating movement due to clearance equipment on sharp curves.',
      advisory: 'Expect 30-45 minute holding intervals at mountain checkpoints.',
      location: 'Hairpin Ghat Descent',
      lat: r3BlockagePoint[0],
      lng: r3BlockagePoint[1],
    },
    {
      id: 'r3-road',
      category: 'Poor Road Condition',
      percentage: 54,
      severity: 'MEDIUM',
      description: 'Steep hill incline (>8% grade) with gravel patches and broken pavement edges.',
      advisory: 'Requires high clearance vehicles; test low-gear engine braking.',
      location: 'Mountain Ghat Switchbacks',
    },
    {
      id: 'r3-rain',
      category: 'Heavy Rain',
      percentage: 48,
      severity: 'MEDIUM',
      description: 'Squall showers with cascading water flows crossing the carriageway.',
      advisory: 'Check tire grip and avoid driving through rushing surface runoff.',
      location: 'Ridge Crest Elevation',
    },
    {
      id: 'r3-traffic',
      category: 'Traffic',
      percentage: 44,
      severity: 'MEDIUM',
      description: 'Queuing behind low-gear heavy timber vehicles on narrow mountain incline.',
      advisory: 'No overtaking on blind curves.',
      location: 'Ascent Bottlenecks',
    },
    {
      id: 'r3-flood',
      category: 'Flood',
      percentage: 26,
      severity: 'LOW',
      description: 'Steep slopes prevent standing water, but ravine torrents run close to bridge abutments.',
      advisory: 'Slow down over bridge piers.',
      location: 'Gorge Bridge Span',
    },
  ];
  r3Risks.sort((a, b) => b.percentage - a.percentage);

  const r3Alerts: RiskIntelligenceAlert[] = [
    {
      id: 'alert-r3-1',
      category: 'Landslide',
      location: `Ridge Pass Summit (Route 3)`,
      state: 'Mountain Sector',
      severity: 'HIGH',
      percentage: 78,
      description: 'Rockfall and debris clearance active.',
      advisory: 'Convoy escort mandatory.',
      x: 350,
      y: 400,
      lat: r3LandslidePoint[0],
      lng: r3LandslidePoint[1],
    },
    {
      id: 'alert-r3-2',
      category: 'Low Visibility',
      location: `High Elevation Ghat (Route 3)`,
      state: 'Mountain Sector',
      severity: 'MEDIUM',
      percentage: 68,
      description: 'Heavy mountain fog bank below 100m visibility.',
      advisory: 'Hazard lights on.',
      x: 370,
      y: 410,
      lat: r3FogPoint[0],
      lng: r3FogPoint[1],
    },
    {
      id: 'alert-r3-3',
      category: 'Road Blockage',
      location: `Hairpin Descent (Route 3)`,
      state: 'Mountain Sector',
      severity: 'MEDIUM',
      percentage: 62,
      description: 'Alternating one-way clearance underway.',
      advisory: 'Expect 35m delay.',
      x: 380,
      y: 420,
      lat: r3BlockagePoint[0],
      lng: r3BlockagePoint[1],
    },
  ];

  const route3: RiskRoute = {
    id: 'route-3',
    routeNumber: 3,
    name: 'Mountain Ridge Pass (High Hazard / Ghat Route)',
    isBest: false,
    tag: 'Alternative Route',
    source,
    destination,
    distanceKm: r3Dist,
    eta: r3Eta,
    overallRiskScore: 66,
    overallRiskLevel: 'HIGH',
    majorRisk: {
      category: 'Landslide',
      percentage: 78,
      severity: 'HIGH',
    },
    risks: r3Risks,
    geometry: r3Geom,
    mapRiskAlerts: r3Alerts,
    trafficPercent: 58,
    tollCount: 0,
    signalsCount: 3,
    rationale: 'Alternative Route 3: High-gradient mountain pass with highest exposure to rockfalls and dense fog. Recommended only when lower bypasses are inaccessible.',
  };

  // Return routes strictly ordered BEST -> WORST by overall risk score
  const allRoutes = [route1, route2, route3];
  allRoutes.sort((a, b) => b.overallRiskScore - a.overallRiskScore);
  return allRoutes;
}
