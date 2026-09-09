export interface ShipmentItem {
  id: string;
  source: string;
  sourceState: string;
  destination: string;
  destState: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehiclePlate: string;
  cargoType: string;
  currentLocation: string;
  eta: string;
  trafficPercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  statusStep: 1 | 2 | 3 | 4; // 1: Picked Up, 2: In Transit, 3: Near Destination, 4: Delivered
  statusText: string;
  routeProgress: number; // percentage
  coordinates: { x: number; y: number };
}

export const MOCK_SHIPMENTS: ShipmentItem[] = [
  {
    id: 'ARKA-AS-9021',
    source: 'Guwahati',
    sourceState: 'Assam',
    destination: 'Imphal',
    destState: 'Manipur',
    driverName: 'Bikash Barman',
    driverPhone: '+91 98640 12345',
    vehicleType: 'Mini Truck',
    vehiclePlate: 'AS-01-GC-4481',
    cargoType: 'Emergency Pharmaceuticals',
    currentLocation: 'Dimapur Highway Junction',
    eta: '3 hrs 45 mins',
    trafficPercent: 34,
    riskLevel: 'LOW',
    statusStep: 2,
    statusText: 'In Transit',
    routeProgress: 62,
    coordinates: { x: 405, y: 340 },
  },
  {
    id: 'ARKA-ML-3312',
    source: 'Shillong',
    sourceState: 'Meghalaya',
    destination: 'Silchar',
    destState: 'Assam',
    driverName: 'M. Sangma',
    driverPhone: '+91 94361 88721',
    vehicleType: 'Four Wheeler',
    vehiclePlate: 'ML-05-E-9014',
    cargoType: 'Organic Agricultural Produce',
    currentLocation: 'Jowai Bypass',
    eta: '2 hrs 10 mins',
    trafficPercent: 48,
    riskLevel: 'MEDIUM',
    statusStep: 2,
    statusText: 'In Transit (Rain Delay)',
    routeProgress: 38,
    coordinates: { x: 295, y: 375 },
  },
  {
    id: 'ARKA-TR-7820',
    source: 'Agartala',
    sourceState: 'Tripura',
    destination: 'Dharmanagar',
    destState: 'Tripura',
    driverName: 'Debnath Roy',
    driverPhone: '+91 98620 44321',
    vehicleType: 'Lorry',
    vehiclePlate: 'TR-01-B-2290',
    cargoType: 'Industrial Hardware',
    currentLocation: 'Near Kailashahar Junction',
    eta: '45 mins',
    trafficPercent: 22,
    riskLevel: 'LOW',
    statusStep: 3,
    statusText: 'Near Destination',
    routeProgress: 86,
    coordinates: { x: 318, y: 440 },
  },
  {
    id: 'ARKA-NL-5541',
    source: 'Dimapur',
    sourceState: 'Nagaland',
    destination: 'Kohima',
    destState: 'Nagaland',
    driverName: 'Kevichusa Angami',
    driverPhone: '+91 94360 99812',
    vehicleType: 'Bike',
    vehiclePlate: 'NL-07-K-1102',
    cargoType: 'Diagnostic Lab Samples',
    currentLocation: 'Zubza Mountain Stretch',
    eta: '35 mins',
    trafficPercent: 72,
    riskLevel: 'MEDIUM',
    statusStep: 2,
    statusText: 'In Transit (Heavy Fog)',
    routeProgress: 70,
    coordinates: { x: 425, y: 350 },
  },
];

export interface RiskIntelligenceAlert {
  id: string;
  category: 'Landslide' | 'Flood' | 'Heavy Rain' | 'Road Blockage' | 'Poor Road Condition' | 'Low Visibility' | 'Bridge Restriction';
  location: string;
  state: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  percentage: number;
  description: string;
  advisory: string;
  x: number;
  y: number;
}

export const RISK_ALERTS: RiskIntelligenceAlert[] = [
  {
    id: 'risk-1',
    category: 'Landslide',
    location: 'NH-27 Dima Hasao / Haflong Hill Pass',
    state: 'Assam',
    severity: 'HIGH',
    percentage: 78,
    description: 'Active soil loosening and gravel slip after continuous overnight showers.',
    advisory: 'Heavy vehicles diverted to Lumding-Diphu alternate bypass corridor.',
    x: 355,
    y: 350,
  },
  {
    id: 'risk-2',
    category: 'Flood',
    location: 'NH-37 Kaziranga National Park Corridor',
    state: 'Assam',
    severity: 'MEDIUM',
    percentage: 54,
    description: 'Brahmaputra water level near warning mark on animal movement culverts.',
    advisory: 'Strict 40 km/h speed regulation enforced by forest logistics patrol.',
    x: 390,
    y: 280,
  },
  {
    id: 'risk-3',
    category: 'Heavy Rain',
    location: 'Mawsynram - Cherrapunji Belt',
    state: 'Meghalaya',
    severity: 'HIGH',
    percentage: 92,
    description: 'Extreme monsoon precipitation causing reduced tyre traction and hill runoffs.',
    advisory: 'Allow extra 45 minutes travel buffer for Shillong south transport.',
    x: 264,
    y: 385,
  },
  {
    id: 'risk-4',
    category: 'Road Blockage',
    location: 'NH-29 Mile 14 Rockfall Clearance Zone',
    state: 'Nagaland',
    severity: 'HIGH',
    percentage: 70,
    description: 'Controlled rock clearing underway. Single lane alternating traffic.',
    advisory: 'Wait time estimated at 20-30 minutes during convoy intervals.',
    x: 420,
    y: 350,
  },
  {
    id: 'risk-5',
    category: 'Low Visibility',
    location: 'Mawlai - Umiam Lake Sector',
    state: 'Meghalaya',
    severity: 'MEDIUM',
    percentage: 60,
    description: 'Dense morning fog lowering line-of-sight visibility below 100 meters.',
    advisory: 'Fog lights mandatory; keep 50m minimum following distance.',
    x: 265,
    y: 345,
  },
  {
    id: 'risk-6',
    category: 'Bridge Restriction',
    location: 'Old Saraighat Rail-cum-Road Bridge',
    state: 'Assam',
    severity: 'MEDIUM',
    percentage: 45,
    description: 'Axle load cap of 15 metric tonnes enforced for regular freight.',
    advisory: 'Vehicles exceeding 15T must route via New Saraighat Bridge.',
    x: 255,
    y: 308,
  },
  {
    id: 'risk-7',
    category: 'Poor Road Condition',
    location: 'NH-102 Imphal-Moreh Border Route',
    state: 'Manipur',
    severity: 'LOW',
    percentage: 28,
    description: 'Pothole patch repairs underway near Kakching junction.',
    advisory: 'Minor slowdown of 10-15 minutes expected.',
    x: 430,
    y: 445,
  },
];

export interface AccessibilityFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Fuel Station' | 'Warehouse' | 'Rest Area' | 'Vehicle Repair' | 'Emergency Services' | 'Transport Hub' | 'Restaurant / Hotel';
  location: string;
  distanceKm: number;
  travelTime: string;
  status: string;
  phone: string;
  x: number;
  y: number;
}

export const ACCESSIBILITY_SERVICES: AccessibilityFacility[] = [
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
    id: 'fac-2',
    name: 'Regional Institute of Medical Sciences (RIMS)',
    type: 'Hospital',
    location: 'Lamphelpat, Imphal',
    distanceKm: 3.5,
    travelTime: '10 mins',
    status: 'Open 24/7 (Emergency ICU)',
    phone: '0385-2414629',
    x: 422,
    y: 418,
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
    id: 'fac-5',
    name: 'Northeast Logistics Hub Dimapur',
    type: 'Warehouse',
    location: 'Purana Bazar, Dimapur',
    distanceKm: 6.8,
    travelTime: '15 mins',
    status: 'Cold Storage & FMCG Staging Active',
    phone: '03862-230911',
    x: 408,
    y: 342,
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
  },
];

export interface AdminUserRecord {
  id: string;
  name: string;
  role: 'Logistics Manager' | 'Fleet Controller' | 'Emergency Officer' | 'Regional Analyst';
  email: string;
  lastLogin: string;
  status: 'Active' | 'Verified' | 'Idle';
}

export const ADMIN_USERS_DATA: AdminUserRecord[] = [
  { id: 'usr-1', name: 'Ananya Sharma', role: 'Fleet Controller', email: 'ananya.s@arka-ne.gov.in', lastLogin: 'Today, 02:40 PM', status: 'Active' },
  { id: 'usr-2', name: 'Lalit Mech', role: 'Logistics Manager', email: 'lalit.mech@arka-ne.gov.in', lastLogin: 'Today, 01:15 PM', status: 'Active' },
  { id: 'usr-3', name: 'Nongthombam Singh', role: 'Emergency Officer', email: 'n.singh@arka-ne.gov.in', lastLogin: 'Today, 11:30 AM', status: 'Active' },
  { id: 'usr-4', name: 'Rupjyoti Borah', role: 'Regional Analyst', email: 'rupjyoti@arka-ne.gov.in', lastLogin: 'Yesterday, 05:22 PM', status: 'Verified' },
  { id: 'usr-5', name: 'Daphinda Marbaniang', role: 'Fleet Controller', email: 'd.marbaniang@arka-ne.gov.in', lastLogin: 'Yesterday, 09:10 AM', status: 'Idle' },
];
