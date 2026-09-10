import { RouteCalcResult } from '@/context/AppContext';
import { RiskIntelligenceAlert, AccessibilityFacility } from '@/data/mockLogistics';

export interface RouteWeatherPoint {
  city: string;
  state: string;
  role: 'origin' | 'transit' | 'destination';
  temp: number;
  condition: string;
  rainMm: number;
  windKmh: number;
  visibilityKm: number;
  logisticsImpact: string;
  delayMin: number;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RouteEmergencyInfo {
  corridorName: string;
  affectedSector: string;
  affectedDescription: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  bypassCorridor: string;
  bypassDescription: string;
  nearestHospital: {
    name: string;
    location: string;
    distanceKm: number;
    travelTime: string;
    status: string;
    phone: string;
  };
  reliefDepot: {
    name: string;
    location: string;
    distanceKm: number;
    status: string;
  };
  hotlines: {
    title: string;
    number: string;
    subtitle: string;
  }[];
}

export interface RouteAnalyticsData {
  corridorName: string;
  distanceKm: number;
  eta: string;
  efficiencyScore: number;
  trafficDensityPercent: number;
  estimatedCost: number;
  fuelCost: number;
  tollCost: number;
  delayFactorWeather: number;
  delayFactorTraffic: number;
  delayFactorTerrain: number;
  vehicleName: string;
  vehiclePlate: string;
}

// Generates a deterministic slug for the active route
export function generateRouteId(
  sourceState: string,
  sourceCity: string,
  destState: string,
  destCity: string
): string {
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return `ARKA_${clean(sourceState)}_${clean(sourceCity)}_TO_${clean(destState)}_${clean(destCity)}`;
}

// 1. ROUTE-SPECIFIC RISKS
export function getRouteRisks(route: RouteCalcResult): RiskIntelligenceAlert[] {
  const { sourceState, sourceCity, destState, destCity, distanceKm } = route;
  const statesInvolved = new Set([sourceState.toLowerCase(), destState.toLowerCase()]);
  const isHill =
    statesInvolved.has('arunachal pradesh') ||
    statesInvolved.has('meghalaya') ||
    statesInvolved.has('manipur') ||
    statesInvolved.has('nagaland') ||
    statesInvolved.has('mizoram') ||
    statesInvolved.has('sikkim');

  const alerts: RiskIntelligenceAlert[] = [];

  // Arunachal Pradesh Corridor
  if (statesInvolved.has('arunachal pradesh')) {
    alerts.push(
      {
        id: `risk-arunachal-1`,
        category: 'Landslide',
        location: `NH-13 Potin-Ziro Trans-Arunachal Highway Pass`,
        state: 'Arunachal Pradesh',
        severity: distanceKm > 80 ? 'HIGH' : 'MEDIUM',
        percentage: 82,
        description: 'Active soil slippage and shale shifting near Yazali cutting zone after seasonal precipitation.',
        advisory: 'Heavy freight should convoy with local PWD spotter clearance. Single lane alternating passage.',
        x: 405,
        y: 195,
      },
      {
        id: `risk-arunachal-2`,
        category: 'Low Visibility',
        location: `Lower Subansiri Mountain Inversion Zone`,
        state: 'Arunachal Pradesh',
        severity: 'MEDIUM',
        percentage: 64,
        description: 'Dense mountain cloud mist reducing visibility to below 120 meters on winding hairpin ascents.',
        advisory: 'Yellow fog lamps mandatory. Maximum speed limit of 30 km/h enforced on ridge roads.',
        x: 395,
        y: 210,
      },
      {
        id: `risk-arunachal-3`,
        category: 'Road Blockage',
        location: `Banderdewa - Nirjuli Hill Sector`,
        state: 'Arunachal Pradesh',
        severity: 'LOW',
        percentage: 32,
        description: 'Culvert drainage strengthening work underway. Mild crawl during material transfer.',
        advisory: 'Anticipate 10-15 minutes delay during machinery maneuvering.',
        x: 365,
        y: 220,
      }
    );
  }

  // Meghalaya Corridor
  if (statesInvolved.has('meghalaya')) {
    alerts.push(
      {
        id: `risk-meghalaya-1`,
        category: 'Heavy Rain',
        location: `Mawsynram - Cherrapunji - Pynursla Ridge`,
        state: 'Meghalaya',
        severity: 'HIGH',
        percentage: 92,
        description: 'Extreme orographic rainfall causing surface runoffs, aquaplaning risk, and reduced tyre grip.',
        advisory: 'Ensure brake checks at Byrnihat checkpoint. Keep 70m vehicle separation buffer.',
        x: 264,
        y: 385,
      },
      {
        id: `risk-meghalaya-2`,
        category: 'Low Visibility',
        location: `Mawlai - Umiam Lake Sector (NH-6)`,
        state: 'Meghalaya',
        severity: 'MEDIUM',
        percentage: 68,
        description: 'Dense morning hill fog lowering line-of-sight visibility below 100 meters near Barapani.',
        advisory: 'High-beam hazard precautions required; heavy vehicles maintain low gear descent.',
        x: 268,
        y: 345,
      }
    );
  }

  // Manipur / Nagaland / NH-29 Corridor
  if (statesInvolved.has('manipur') || statesInvolved.has('nagaland')) {
    alerts.push(
      {
        id: `risk-nh29-1`,
        category: 'Road Blockage',
        location: `NH-29 Mile 14 Chumukedima Rockfall Zone`,
        state: 'Nagaland',
        severity: 'HIGH',
        percentage: 74,
        description: 'Controlled rock clearing and net anchoring underway. Single lane alternating convoy traffic.',
        advisory: 'Wait time estimated at 20-30 minutes during scheduled clearing intervals.',
        x: 420,
        y: 350,
      },
      {
        id: `risk-manipur-1`,
        category: 'Poor Road Condition',
        location: `NH-102 Imphal-Moreh Border Approach`,
        state: 'Manipur',
        severity: 'LOW',
        percentage: 30,
        description: 'Pothole patch repairs underway near Kakching junction.',
        advisory: 'Minor transit slowdown of 10-15 minutes expected.',
        x: 430,
        y: 445,
      }
    );
  }

  // Assam Plains / Transit Corridors
  if (statesInvolved.has('assam')) {
    alerts.push(
      {
        id: `risk-assam-1`,
        category: 'Flood',
        location: `NH-37 Kaziranga National Park Corridor`,
        state: 'Assam',
        severity: 'MEDIUM',
        percentage: 54,
        description: 'Brahmaputra tributaries approaching cautionary level along flood plain culverts.',
        advisory: 'Strict 40 km/h speed regulation enforced by forest logistics patrol.',
        x: 390,
        y: 280,
      },
      {
        id: `risk-assam-2`,
        category: 'Bridge Restriction',
        location: `Old Saraighat Rail-cum-Road Bridge`,
        state: 'Assam',
        severity: 'MEDIUM',
        percentage: 45,
        description: 'Axle load cap of 15 metric tonnes enforced for regular freight.',
        advisory: 'Vehicles exceeding 15T must route via New Saraighat Bridge.',
        x: 255,
        y: 308,
      }
    );
  }

  // Sikkim Corridor
  if (statesInvolved.has('sikkim')) {
    alerts.push(
      {
        id: `risk-sikkim-1`,
        category: 'Landslide',
        location: `NH-10 Sevoke - Teesta Bridge Stretch`,
        state: 'Sikkim',
        severity: 'HIGH',
        percentage: 85,
        description: 'Teesta basin soil saturation causing rock-slides at 29th Mile.',
        advisory: 'Heavy vehicles diverted to Melli-Jorethang route. Monitor Border Roads Organisation signals.',
        x: 115,
        y: 245,
      }
    );
  }

  // Mizoram / Tripura Corridors
  if (statesInvolved.has('mizoram') || statesInvolved.has('tripura')) {
    alerts.push(
      {
        id: `risk-south-1`,
        category: 'Landslide',
        location: `NH-306 Kolasib Mountain Pass`,
        state: 'Mizoram',
        severity: 'MEDIUM',
        percentage: 62,
        description: 'Monsoon mud-slips along steep ridge turns. Caution advised on sharp hairpins.',
        advisory: 'Ensure anti-skid tyre chains for heavy multi-axle freight during rainfall.',
        x: 360,
        y: 445,
      }
    );
  }

  // Fallback / Active Corridor Dedicated Dynamic Alert
  if (alerts.length === 0) {
    alerts.push({
      id: `risk-custom-1`,
      category: isHill ? 'Landslide' : 'Poor Road Condition',
      location: `${sourceCity} ➔ ${destCity} Arterial Route`,
      state: destState,
      severity: isHill ? 'MEDIUM' : 'LOW',
      percentage: isHill ? 58 : 25,
      description: `Active terrain monitoring on the ${sourceCity} to ${destCity} connector corridor.`,
      advisory: isHill
        ? 'Maintain safe following distance on hill curves; observe speed restrictions.'
        : 'Normal transit corridor with routine highway maintenance underway.',
      x: 350,
      y: 350,
    });
  }

  // Append a few regional background alerts for realistic regional awareness
  const baseRegional: RiskIntelligenceAlert = {
    id: `risk-regional-dima`,
    category: 'Landslide',
    location: 'NH-27 Dima Hasao / Haflong Hill Pass',
    state: 'Assam',
    severity: 'HIGH',
    percentage: 78,
    description: 'Active soil loosening and gravel slip after continuous overnight showers.',
    advisory: 'Heavy vehicles diverted to Lumding-Diphu alternate bypass corridor.',
    x: 355,
    y: 350,
  };

  if (!alerts.some((a) => a.location.includes('Dima Hasao'))) {
    alerts.push(baseRegional);
  }

  return alerts;
}

// 2. ROUTE-SPECIFIC WEATHER
export function getRouteWeather(route: RouteCalcResult): {
  primaryWeather: RouteWeatherPoint;
  routeWeatherPoints: RouteWeatherPoint[];
} {
  const { sourceCity, sourceState, destCity, destState, distanceKm } = route;

  const getCityMetrics = (city: string, state: string, role: 'origin' | 'transit' | 'destination'): RouteWeatherPoint => {
    const s = state.toLowerCase();
    const c = city.toLowerCase();

    if (s.includes('arunachal')) {
      if (c.includes('ziro')) {
        return {
          city,
          state,
          role,
          temp: 18,
          condition: 'Cool & Mountain Mist',
          rainMm: 8.5,
          windKmh: 11,
          visibilityKm: 2.8,
          logisticsImpact: 'Mild mountain mist along Lower Subansiri roads; speed controlled on passes.',
          delayMin: 12,
          alertLevel: 'MEDIUM',
        };
      }
      return {
        city,
        state,
        role,
        temp: 24,
        condition: 'Overcast with Light Rain',
        rainMm: 12.0,
        windKmh: 14,
        visibilityKm: 4.2,
        logisticsImpact: 'Wet road surfaces across foothills. Normal transit speeds for mini trucks.',
        delayMin: 15,
        alertLevel: 'LOW',
      };
    }

    if (s.includes('meghalaya')) {
      return {
        city,
        state,
        role,
        temp: 18,
        condition: 'Heavy Hill Rain & Fog',
        rainMm: 38.5,
        windKmh: 22,
        visibilityKm: 1.4,
        logisticsImpact: 'Significant monsoon precipitation along Barapani-Shillong corridor.',
        delayMin: 30,
        alertLevel: 'HIGH',
      };
    }

    if (s.includes('nagaland')) {
      return {
        city,
        state,
        role,
        temp: 21,
        condition: 'Dense Fog & Mountain Drizzle',
        rainMm: 16.0,
        windKmh: 15,
        visibilityKm: 1.1,
        logisticsImpact: 'Low visibility on Kohima ridge; fog lights mandatory.',
        delayMin: 22,
        alertLevel: 'MEDIUM',
      };
    }

    if (s.includes('manipur')) {
      return {
        city,
        state,
        role,
        temp: 25,
        condition: 'Intermittent Showers',
        rainMm: 14.0,
        windKmh: 12,
        visibilityKm: 5.0,
        logisticsImpact: 'Clear valley approaches with slight moisture on highway pavement.',
        delayMin: 10,
        alertLevel: 'LOW',
      };
    }

    if (s.includes('sikkim')) {
      return {
        city,
        state,
        role,
        temp: 16,
        condition: 'Alpine Rain & Low Clouds',
        rainMm: 28.0,
        windKmh: 18,
        visibilityKm: 1.8,
        logisticsImpact: 'Teesta valley road surfaces wet; steep hairpins require lower gears.',
        delayMin: 25,
        alertLevel: 'HIGH',
      };
    }

    if (s.includes('mizoram') || s.includes('tripura')) {
      return {
        city,
        state,
        role,
        temp: 27,
        condition: 'Scattered Clouds & High Humidity',
        rainMm: 5.0,
        windKmh: 10,
        visibilityKm: 6.5,
        logisticsImpact: 'Fair transit conditions across state highway network.',
        delayMin: 5,
        alertLevel: 'LOW',
      };
    }

    // Default Assam / Plains
    return {
      city,
      state,
      role,
      temp: 28,
      condition: 'Partly Cloudy with Humid Breeze',
      rainMm: 6.5,
      windKmh: 14,
      visibilityKm: 6.0,
      logisticsImpact: 'Normal freight operations with minor moisture on highway surface.',
      delayMin: 8,
      alertLevel: 'LOW',
    };
  };

  const originPoint = getCityMetrics(sourceCity, sourceState, 'origin');
  const destPoint = getCityMetrics(destCity, destState, 'destination');

  // Deterministic intermediate hill transit point
  let midName = `${sourceCity}-${destCity} Ridge Pass`;
  let midState = destState;
  if (sourceState.toLowerCase().includes('arunachal') || destState.toLowerCase().includes('arunachal')) {
    midName = 'Potin Mountain Pass';
    midState = 'Arunachal Pradesh';
  } else if (sourceState.toLowerCase().includes('meghalaya') || destState.toLowerCase().includes('meghalaya')) {
    midName = 'Nongpoh Transit Corridor';
    midState = 'Meghalaya';
  } else if (sourceState.toLowerCase().includes('nagaland') || destState.toLowerCase().includes('manipur')) {
    midName = 'Chumukedima Hill Ascent';
    midState = 'Nagaland';
  } else if (distanceKm > 200) {
    midName = 'Nagaon Express Bypass';
    midState = 'Assam';
  }

  const transitPoint: RouteWeatherPoint = {
    city: midName,
    state: midState,
    role: 'transit',
    temp: Math.min(originPoint.temp, destPoint.temp) - 2,
    condition: 'Intermittent Mountain Rain',
    rainMm: Math.round(((originPoint.rainMm + destPoint.rainMm) / 2 + 6) * 10) / 10,
    windKmh: Math.max(originPoint.windKmh, destPoint.windKmh) + 4,
    visibilityKm: Math.max(0.8, Math.min(originPoint.visibilityKm, destPoint.visibilityKm) - 1.2),
    logisticsImpact: `Active rain and wind along the ${midName} hill sector. Buffer time needed for heavy vehicles.`,
    delayMin: Math.max(12, originPoint.delayMin + 6),
    alertLevel: 'MEDIUM',
  };

  const routeWeatherPoints = [originPoint, transitPoint, destPoint];

  // Pick highest impact or transit point as primary
  const primaryWeather =
    routeWeatherPoints.find((p) => p.alertLevel === 'HIGH') ||
    routeWeatherPoints.find((p) => p.role === 'transit') ||
    destPoint;

  return { primaryWeather, routeWeatherPoints };
}

// 3. ROUTE-SPECIFIC ACCESSIBILITY & HIGHWAY SERVICES
export function getRouteServices(route: RouteCalcResult): AccessibilityFacility[] {
  const { sourceState, sourceCity, destState, destCity } = route;
  const statesInvolved = new Set([sourceState.toLowerCase(), destState.toLowerCase()]);

  const facilities: AccessibilityFacility[] = [];

  // Arunachal Pradesh Services
  if (statesInvolved.has('arunachal pradesh')) {
    facilities.push(
      {
        id: 'srv-ar-1',
        name: 'Tomo Riba Institute of Health (TRIHMS)',
        type: 'Hospital',
        location: 'Naharlagun, Papum Pare',
        distanceKm: 8.5,
        travelTime: '15 mins',
        status: 'Open 24/7 (Trauma & Emergency ICU)',
        phone: '0360-2350331',
        x: 370,
        y: 220,
      },
      {
        id: 'srv-ar-2',
        name: 'Ziro District Civil Hospital',
        type: 'Hospital',
        location: 'Hapoli, Lower Subansiri',
        distanceKm: 4.2,
        travelTime: '10 mins',
        status: 'Open 24/7 (Hill Trauma Clinic)',
        phone: '03788-224231',
        x: 405,
        y: 195,
      },
      {
        id: 'srv-ar-3',
        name: 'IOCL Trans-Arunachal Highway Care Station',
        type: 'Fuel Station',
        location: 'NH-13 Potin Junction',
        distanceKm: 22.0,
        travelTime: '30 mins',
        status: '24 Hours Diesel & Truck Water Point',
        phone: '1800-2333-555',
        x: 390,
        y: 205,
      },
      {
        id: 'srv-ar-4',
        name: 'Naharlagun State Disaster Logistics Depot',
        type: 'Warehouse',
        location: 'Industrial Area, Naharlagun',
        distanceKm: 12.0,
        travelTime: '20 mins',
        status: 'Operational - Relief Staging Warehouse',
        phone: '0360-2244102',
        x: 372,
        y: 218,
      },
      {
        id: 'srv-ar-5',
        name: 'Papum Pare Heavy Vehicle & 4x4 Workshop',
        type: 'Vehicle Repair',
        location: 'NH-415 Nirjuli Bypass',
        distanceKm: 14.5,
        travelTime: '22 mins',
        status: '24/7 Mountain Towing & Hydraulic Repair',
        phone: '+91 94360 22198',
        x: 375,
        y: 215,
      },
      {
        id: 'srv-ar-6',
        name: 'NDRF 12th Battalion Station',
        type: 'Emergency Services',
        location: 'Doimukh Base, Arunachal Pradesh',
        distanceKm: 18.0,
        travelTime: '25 mins',
        status: 'High Readiness - Hill Search & Rescue',
        phone: '112 / 1070',
        x: 368,
        y: 225,
      },
      {
        id: 'srv-ar-7',
        name: 'Yazali Valley Transit Rest Zone',
        type: 'Rest Area',
        location: 'Yazali Riverside, Lower Subansiri',
        distanceKm: 34.0,
        travelTime: '45 mins',
        status: 'Driver Canteen, Showers & Secure Parking',
        phone: '+91 98632 10842',
        x: 398,
        y: 200,
      }
    );
  } else if (statesInvolved.has('meghalaya')) {
    facilities.push(
      {
        id: 'srv-ml-1',
        name: 'Civil Hospital Shillong',
        type: 'Hospital',
        location: 'Police Bazar, Shillong',
        distanceKm: 3.5,
        travelTime: '10 mins',
        status: 'Open 24/7 (Emergency Trauma Ward)',
        phone: '0364-2224100',
        x: 268,
        y: 360,
      },
      {
        id: 'srv-ml-2',
        name: 'IOCL Highway Care Byrnihat',
        type: 'Fuel Station',
        location: 'NH-6 Assam-Meghalaya Border',
        distanceKm: 16.0,
        travelTime: '20 mins',
        status: '24 Hours Diesel & EV Fast Charger',
        phone: '1800-2333-555',
        x: 270,
        y: 325,
      },
      {
        id: 'srv-ml-3',
        name: 'Ri-Bhoi Heavy Vehicle Workshop',
        type: 'Vehicle Repair',
        location: 'Nongpoh Expressway Junction',
        distanceKm: 28.0,
        travelTime: '35 mins',
        status: '24/7 Crane, Tyre & Brake Overhaul',
        phone: '+91 94361 22890',
        x: 265,
        y: 335,
      },
      {
        id: 'srv-ml-4',
        name: 'Barapani Rest & Transit Hub',
        type: 'Rest Area',
        location: 'Umiam Lake Viewpoint, NH-6',
        distanceKm: 20.0,
        travelTime: '25 mins',
        status: 'Secure Truck Yard & 24h Food Court',
        phone: '+91 98640 55192',
        x: 266,
        y: 348,
      }
    );
  }

  // Always include standard Guwahati/Regional backbone facilities if not redundant
  if (facilities.length < 5) {
    facilities.push(
      {
        id: 'fac-1',
        name: 'Guwahati Medical College & Hospital (GMCH)',
        type: 'Hospital',
        location: 'Bhangagarh, Guwahati',
        distanceKm: 4.2,
        travelTime: '12 mins',
        status: 'Open 24/7 (Trauma Center)',
        phone: '0361-2529457',
        x: 262,
        y: 312,
      },
      {
        id: 'fac-3',
        name: 'IOCL Highway Care Super Fuel Station',
        type: 'Fuel Station',
        location: 'NH-27 Sonapur Corridor',
        distanceKm: 18.5,
        travelTime: '22 mins',
        status: '24 Hours Diesel & EV Fast Charger',
        phone: '1800-2333-555',
        x: 280,
        y: 315,
      },
      {
        id: 'fac-4',
        name: 'Central Warehousing Corporation (CWC) Amingaon',
        type: 'Warehouse',
        location: 'Amingaon Inland Container Depot, Assam',
        distanceKm: 12.0,
        travelTime: '20 mins',
        status: 'Operating - High Capacity Storage',
        phone: '0361-2670221',
        x: 252,
        y: 305,
      },
      {
        id: 'fac-6',
        name: 'Assam Highway Heavy Vehicle Repair Hub',
        type: 'Vehicle Repair',
        location: 'NH-27 Byrnihat Border',
        distanceKm: 24.0,
        travelTime: '30 mins',
        status: '24/7 Crane, Tyre & Hydraulic Service',
        phone: '+91 94350 44123',
        x: 270,
        y: 325,
      },
      {
        id: 'fac-7',
        name: 'NDRF 1st Battalion Disaster Relief Station',
        type: 'Emergency Services',
        location: 'Patgaon, Rani, Kamrup',
        distanceKm: 15.2,
        travelTime: '25 mins',
        status: 'Ready - 112 Integrated Rapid Response',
        phone: '112 / 1070',
        x: 248,
        y: 318,
      },
      {
        id: 'fac-8',
        name: 'Brahmaputra Freight & Transit Rest Zone',
        type: 'Rest Area',
        location: 'Kaliabor Bypass, Nagaon',
        distanceKm: 32.0,
        travelTime: '40 mins',
        status: 'Clean Showers, Secure Parking, Food Court',
        phone: '+91 98642 77019',
        x: 350,
        y: 290,
      }
    );
  }

  return facilities;
}

// 4. ROUTE-SPECIFIC EMERGENCY DISASTER MODE DATA
export function getRouteEmergencyData(route: RouteCalcResult): RouteEmergencyInfo {
  const { sourceState, sourceCity, destState, destCity } = route;
  const statesInvolved = new Set([sourceState.toLowerCase(), destState.toLowerCase()]);

  if (statesInvolved.has('arunachal pradesh')) {
    return {
      corridorName: `${sourceCity} ➔ ${destCity} Trans-Arunachal Spine`,
      affectedSector: 'NH-13 Potin-Yazali Hill Cutting KM 48-62',
      affectedDescription:
        'Overnight hill mudslide reported between Potin junction and Yazali. PWD clearance equipment mobilised.',
      severity: 'HIGH',
      bypassCorridor: 'Banderdewa-Doimukh Alternate Valley Bypass',
      bypassDescription:
        'Designated emergency bypass open for medical transports, four-wheel drive relief convoys, and mini trucks under 5 tonnes.',
      nearestHospital: {
        name: 'Tomo Riba Institute of Health Sciences (TRIHMS)',
        location: 'Naharlagun / Itanagar',
        distanceKm: 16.5,
        travelTime: '24 mins',
        status: 'Open 24/7 (Level-1 Trauma Center, 60 emergency beds)',
        phone: '0360-2350331',
      },
      reliefDepot: {
        name: 'Naharlagun State Disaster Supply Warehouse',
        location: 'Naharlagun Transit Depot',
        distanceKm: 18.0,
        status: 'Staged - 5,000 ration kits, fuel bowsers & medical packs',
      },
      hotlines: [
        {
          title: 'Arunachal Pradesh Disaster Management (APSDMA)',
          number: '1070 / 0360-2212222',
          subtitle: 'Itanagar Civil Secretariat Emergency Cell',
        },
        {
          title: 'NDRF 12th Battalion Control Base',
          number: '0360-2277112',
          subtitle: 'Doimukh Rapid Reaction Unit',
        },
        {
          title: 'Lower Subansiri District Disaster Control Room',
          number: '03788-224255',
          subtitle: 'Ziro DC Office Emergency Desk',
        },
      ],
    };
  }

  if (statesInvolved.has('meghalaya')) {
    return {
      corridorName: `${sourceCity} ➔ ${destCity} Khasi-Jaintia Corridor`,
      affectedSector: 'NH-6 Barapani - Mawlai Hill Stretch',
      affectedDescription:
        'Heavy slope precipitation and soil shifting near Umiam viewpoints. One lane restricted for slope clearing.',
      severity: 'HIGH',
      bypassCorridor: 'Shillong Western Bypass Corridor',
      bypassDescription:
        'Designated light vehicle corridor operational via Mawmih-Nongkrem loop.',
      nearestHospital: {
        name: 'Civil Hospital Shillong & Trauma Center',
        location: 'Shillong, East Khasi Hills',
        distanceKm: 8.2,
        travelTime: '15 mins',
        status: 'Open 24/7 (Emergency ICU ready)',
        phone: '0364-2224100',
      },
      reliefDepot: {
        name: 'Meghalaya State Civil Supplies Depot',
        location: 'Mawlai Transit Yard',
        distanceKm: 10.5,
        status: 'Staged - Emergency water purification & rations',
      },
      hotlines: [
        {
          title: 'Meghalaya State Disaster Authority (MSDMA)',
          number: '1070 / 0364-2502098',
          subtitle: 'Shillong Secretariat Control Center',
        },
        {
          title: 'Superintendent of Police Traffic Hotline',
          number: '0364-2222214',
          subtitle: 'East Khasi Hills Convoy Clearance',
        },
      ],
    };
  }

  // Default / Assam / Northeast Spine (NH-27 & NH-29)
  return {
    corridorName: `${sourceCity} ➔ ${destCity} Highway Spine`,
    affectedSector: 'NH-27 Dima Hasao Hill Pass Sector KM 142-158',
    affectedDescription:
      'National Highway slope breakdown identified near Dima Hasao. Heavy vehicle movement temporarily halted.',
    severity: 'HIGH',
    bypassCorridor: 'Lumding-Diphu Alternate Emergency Corridor',
    bypassDescription:
      'Designated green corridor open with military logistics escort. Max axle weight 20T.',
    nearestHospital: {
      name: 'Haflong Civil Hospital & Trauma Center',
      location: 'Haflong, Dima Hasao',
      distanceKm: 14.5,
      travelTime: '22 mins',
      status: 'Open 24/7 (Emergency blood bank & 40 beds ready)',
      phone: '03673-236240',
    },
    reliefDepot: {
      name: 'CWC Lumding Civil Relief Depot',
      location: 'Lumding Rail-Road Junction',
      distanceKm: 32.0,
      status: 'Ready ration stocks and rescue rafts staged',
    },
    hotlines: [
      {
        title: 'Assam State Disaster Authority (ASDMA)',
        number: '1079 / 0361-2237221',
        subtitle: 'Dispur Control Room',
      },
      {
        title: 'NDRF 1st Battalion Rapid Deployment',
        number: '0361-2840027',
        subtitle: 'Patgaon, Kamrup Base',
      },
      {
        title: 'Manipur Disaster Management Control',
        number: '0385-2443441',
        subtitle: 'Babupara, Imphal Desk',
      },
    ],
  };
}

// 5. ROUTE-SPECIFIC ANALYTICS
export function getRouteAnalytics(route: RouteCalcResult): RouteAnalyticsData {
  const { sourceCity, destCity, distanceKm, eta, routeScore, trafficPercent, estimatedCost, tollCost, vehicle } = route;

  const isHill =
    ['Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim'].includes(route.destState) ||
    ['Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim'].includes(route.sourceState);

  const delayWeather = isHill ? 58 : 34;
  const delayTraffic = isHill ? 22 : 46;
  const delayTerrain = 100 - delayWeather - delayTraffic;

  const fuelCost = Math.max(0, estimatedCost - (tollCost || 0));

  return {
    corridorName: `${sourceCity} ➔ ${destCity}`,
    distanceKm,
    eta,
    efficiencyScore: routeScore || 92,
    trafficDensityPercent: trafficPercent || 34,
    estimatedCost,
    fuelCost,
    tollCost: tollCost || 0,
    delayFactorWeather: delayWeather,
    delayFactorTraffic: delayTraffic,
    delayFactorTerrain: delayTerrain,
    vehicleName: vehicle?.name || 'Mini Truck',
    vehiclePlate: 'ARKA-NE-7740',
  };
}

// 6. ARKA AI ASSISTANT CONTEXT PROMPT
export function getAssistantContext(route: RouteCalcResult): string {
  return `
CURRENT ACTIVE LOGISTICS CORRIDOR:
- Origin: ${route.sourceCity}, ${route.sourceState}
- Destination: ${route.destCity}, ${route.destState}
- Transport Vehicle: ${route.vehicle?.name || 'Mini Truck'} (Capacity: ${route.vehicle?.capacity || '2.5 Tons'})
- Calculated Distance: ${route.distanceKm} km (via real road network)
- Estimated Travel Time (ETA): ${route.eta}
- Traffic Density: ${route.trafficPercent}%
- Route Accessibility Score: ${route.accessibilityScore}%
- Toll Plazas: ${route.tollGatesCount} gates (₹${route.tollCost})
- Total Estimated Cost: ₹${route.estimatedCost}
- Primary AI Rationale: ${route.reasoning}
- Slope & Terrain: ${['Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Arunachal Pradesh', 'Sikkim'].includes(route.destState) ? 'Mountainous terrain with hairpin bends and slope monitoring' : 'Plains arterial highway corridor'}
`;
}
