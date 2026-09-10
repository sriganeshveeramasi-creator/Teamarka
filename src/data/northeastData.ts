export interface CityNode {
  name: string;
  district: string;
  x: number; // SVG coordinate (0-800)
  y: number; // SVG coordinate (0-600)
  lat?: number;
  lng?: number;
  population?: string;
  hubType?: 'major' | 'secondary' | 'transit';
}

export interface StateData {
  id: string;
  name: string;
  capital: string;
  cities: CityNode[];
  color: string;
  svgPath: string; // state boundary approximate polygon
}

export interface VehicleOption {
  id: string;
  name: string;
  iconName: string;
  capacity: string;
  speedFactor: number;
  costPerKm: number;
  restrictionNote?: string;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: 'bike', name: 'Bike', iconName: 'Bike', capacity: 'Up to 20 kg', speedFactor: 1.1, costPerKm: 4 },
  { id: 'auto', name: 'Auto', iconName: 'CarTaxiFront', capacity: 'Up to 250 kg', speedFactor: 0.8, costPerKm: 7 },
  { id: 'car', name: 'Car', iconName: 'Car', capacity: 'Up to 400 kg', speedFactor: 1.0, costPerKm: 9 },
  { id: 'four_wheeler', name: 'Four Wheeler', iconName: 'Truck', capacity: 'Up to 800 kg', speedFactor: 0.95, costPerKm: 12 },
  { id: 'mini_truck', name: 'Mini Truck', iconName: 'Truck', capacity: 'Up to 2.5 Tons', speedFactor: 0.85, costPerKm: 18 },
  { id: 'lorry', name: 'Lorry', iconName: 'Container', capacity: 'Up to 10 Tons', speedFactor: 0.75, costPerKm: 32 },
  { id: 'heavy_vehicle', name: 'Heavy Vehicle', iconName: 'TrainTrack', capacity: 'Up to 25 Tons', speedFactor: 0.65, costPerKm: 48, restrictionNote: 'Hill gradient restricted on NH-29' },
  { id: 'bus', name: 'Bus', iconName: 'Bus', capacity: 'Up to 45 Passengers / Cargo', speedFactor: 0.8, costPerKm: 26 },
];

export const NORTHEAST_STATES: StateData[] = [
  {
    id: 'assam',
    name: 'Assam',
    capital: 'Dispur',
    color: '#0284c7',
    svgPath: 'M 220 280 L 290 270 L 360 250 L 450 230 L 530 200 L 570 190 L 540 240 L 480 270 L 410 290 L 370 330 L 330 350 L 290 330 L 230 320 Z',
    cities: [
      { name: 'Guwahati', district: 'Kamrup Metro', x: 260, y: 310, lat: 26.1445, lng: 91.7362, hubType: 'major', population: '1.2M' },
      { name: 'Nagaon', district: 'Nagaon', x: 330, y: 295, lat: 26.3465, lng: 92.6840, hubType: 'major', population: '350K' },
      { name: 'Jorhat', district: 'Jorhat', x: 440, y: 250, lat: 26.7509, lng: 94.2037, hubType: 'secondary', population: '220K' },
      { name: 'Dibrugarh', district: 'Dibrugarh', x: 530, y: 200, lat: 27.4728, lng: 94.9120, hubType: 'major', population: '180K' },
      { name: 'Silchar', district: 'Cachar', x: 325, y: 410, lat: 24.8170, lng: 92.7926, hubType: 'major', population: '230K' },
      { name: 'Tezpur', district: 'Sonitpur', x: 345, y: 265, lat: 26.6528, lng: 92.7926, hubType: 'secondary', population: '140K' },
      { name: 'Barpeta', district: 'Barpeta', x: 215, y: 295, lat: 26.3216, lng: 91.0058, hubType: 'secondary', population: '120K' },
    ],
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    capital: 'Shillong',
    color: '#059669',
    svgPath: 'M 215 330 L 305 340 L 320 375 L 295 405 L 205 395 L 180 360 Z',
    cities: [
      { name: 'Shillong', district: 'East Khasi Hills', x: 268, y: 360, lat: 25.5788, lng: 91.8933, hubType: 'major', population: '350K' },
      { name: 'Tura', district: 'West Garo Hills', x: 200, y: 375, lat: 25.5138, lng: 90.2201, hubType: 'secondary', population: '90K' },
      { name: 'Jowai', district: 'West Jaintia Hills', x: 295, y: 375, lat: 25.4452, lng: 92.2126, hubType: 'secondary', population: '40K' },
      { name: 'Nongpoh', district: 'Ri-Bhoi', x: 265, y: 335, lat: 25.9037, lng: 91.8812, hubType: 'transit', population: '35K' },
      { name: 'Cherrapunji', district: 'East Khasi Hills', x: 264, y: 385, lat: 25.2702, lng: 91.7323, hubType: 'secondary', population: '15K' },
    ],
  },
  {
    id: 'manipur',
    name: 'Manipur',
    capital: 'Imphal',
    color: '#9333ea',
    svgPath: 'M 400 370 L 450 375 L 455 450 L 420 480 L 385 460 L 390 400 Z',
    cities: [
      { name: 'Imphal', district: 'Imphal West', x: 420, y: 420, lat: 24.8170, lng: 93.9368, hubType: 'major', population: '420K' },
      { name: 'Thoubal', district: 'Thoubal', x: 425, y: 435, lat: 24.6382, lng: 93.9999, hubType: 'secondary', population: '60K' },
      { name: 'Churachandpur', district: 'Churachandpur', x: 405, y: 455, lat: 24.3332, lng: 93.6766, hubType: 'secondary', population: '55K' },
      { name: 'Bishnupur', district: 'Bishnupur', x: 412, y: 430, lat: 24.6324, lng: 93.7645, hubType: 'transit', population: '30K' },
      { name: 'Ukhrul', district: 'Ukhrul', x: 440, y: 395, lat: 25.1161, lng: 94.3644, hubType: 'secondary', population: '40K' },
    ],
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    capital: 'Kohima',
    color: '#ea580c',
    svgPath: 'M 425 285 L 485 245 L 515 285 L 465 365 L 415 360 Z',
    cities: [
      { name: 'Kohima', district: 'Kohima', x: 438, y: 360, lat: 25.6751, lng: 94.1086, hubType: 'major', population: '120K' },
      { name: 'Dimapur', district: 'Dimapur', x: 405, y: 340, lat: 25.9095, lng: 93.7266, hubType: 'major', population: '250K' },
      { name: 'Mokokchung', district: 'Mokokchung', x: 465, y: 285, lat: 26.3256, lng: 94.5165, hubType: 'secondary', population: '45K' },
      { name: 'Tuensang', district: 'Tuensang', x: 495, y: 305, lat: 26.2798, lng: 94.8290, hubType: 'transit', population: '38K' },
      { name: 'Wokha', district: 'Wokha', x: 445, y: 320, lat: 26.0988, lng: 94.2608, hubType: 'transit', population: '35K' },
    ],
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    capital: 'Aizawl',
    color: '#0891b2',
    svgPath: 'M 350 435 L 390 440 L 395 530 L 350 545 L 340 480 Z',
    cities: [
      { name: 'Aizawl', district: 'Aizawl', x: 365, y: 470, lat: 23.7271, lng: 92.7176, hubType: 'major', population: '310K' },
      { name: 'Lunglei', district: 'Lunglei', x: 365, y: 510, lat: 22.8671, lng: 92.7656, hubType: 'secondary', population: '65K' },
      { name: 'Champhai', district: 'Champhai', x: 388, y: 480, lat: 23.4735, lng: 93.3275, hubType: 'transit', population: '40K' },
      { name: 'Kolasib', district: 'Kolasib', x: 360, y: 445, lat: 24.2246, lng: 92.6773, hubType: 'transit', population: '30K' },
    ],
  },
  {
    id: 'tripura',
    name: 'Tripura',
    capital: 'Agartala',
    color: '#16a34a',
    svgPath: 'M 285 410 L 325 415 L 325 470 L 295 490 L 275 460 Z',
    cities: [
      { name: 'Agartala', district: 'West Tripura', x: 288, y: 450, lat: 23.8315, lng: 91.2868, hubType: 'major', population: '400K' },
      { name: 'Dharmanagar', district: 'North Tripura', x: 320, y: 430, lat: 24.3758, lng: 92.1648, hubType: 'secondary', population: '50K' },
      { name: 'Udaipur', district: 'Gomati', x: 295, y: 468, lat: 23.5336, lng: 91.4883, hubType: 'secondary', population: '40K' },
      { name: 'Kailashahar', district: 'Unakoti', x: 318, y: 440, lat: 24.3314, lng: 92.0069, hubType: 'transit', population: '30K' },
    ],
  },
  {
    id: 'arunachal',
    name: 'Arunachal Pradesh',
    capital: 'Itanagar',
    color: '#2563eb',
    svgPath: 'M 250 200 L 380 170 L 510 140 L 630 130 L 670 190 L 580 200 L 460 215 L 340 230 Z',
    cities: [
      { name: 'Itanagar', district: 'Papum Pare', x: 365, y: 220, lat: 27.0844, lng: 93.6053, hubType: 'major', population: '60K' },
      { name: 'Tawang', district: 'Tawang', x: 245, y: 195, lat: 27.5861, lng: 91.8653, hubType: 'secondary', population: '15K' },
      { name: 'Pasighat', district: 'East Siang', x: 535, y: 165, lat: 28.0664, lng: 95.3265, hubType: 'secondary', population: '30K' },
      { name: 'Ziro', district: 'Lower Subansiri', x: 405, y: 195, lat: 27.5950, lng: 93.8385, hubType: 'transit', population: '15K' },
      { name: 'Tezu', district: 'Lohit', x: 615, y: 180, lat: 27.9136, lng: 96.1627, hubType: 'transit', population: '20K' },
    ],
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    capital: 'Gangtok',
    color: '#d97706',
    svgPath: 'M 90 220 L 130 205 L 145 240 L 115 275 L 80 250 Z',
    cities: [
      { name: 'Gangtok', district: 'East Sikkim', x: 120, y: 235, lat: 27.3389, lng: 88.6065, hubType: 'major', population: '100K' },
      { name: 'Namchi', district: 'South Sikkim', x: 110, y: 255, lat: 27.1666, lng: 88.3508, hubType: 'secondary', population: '15K' },
      { name: 'Geyzing', district: 'West Sikkim', x: 95, y: 245, lat: 27.2889, lng: 88.2435, hubType: 'transit', population: '10K' },
      { name: 'Mangan', district: 'North Sikkim', x: 125, y: 215, lat: 27.5050, lng: 88.5298, hubType: 'transit', population: '6K' },
    ],
  },
];

export interface TollGate {
  id: string;
  name: string;
  highway: string;
  cost: number;
  location: string;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
}

export const TOLL_GATES: TollGate[] = [
  { id: 'toll-1', name: 'Madanpur Toll Plaza', highway: 'NH-27', cost: 120, location: 'Near Baihata Chariali', x: 245, y: 305, lat: 26.3200, lng: 91.7100 },
  { id: 'toll-2', name: 'Nazirakhat Toll Gate', highway: 'NH-27', cost: 85, location: 'Near Sonapur', x: 285, y: 312, lat: 26.1150, lng: 91.9750 },
  { id: 'toll-3', name: 'Raha Toll Plaza', highway: 'NH-37', cost: 110, location: 'Nagaon Bypass', x: 330, y: 300, lat: 26.2300, lng: 92.5200 },
  { id: 'toll-4', name: 'Manderdisa Toll Plaza', highway: 'NH-29', cost: 95, location: 'Near Lumding', x: 375, y: 335, lat: 25.8000, lng: 93.1800 },
];

export interface TrafficSignal {
  id: string;
  name: string;
  durationSec: number;
  location: string;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  status: 'green' | 'yellow' | 'red';
}

export const TRAFFIC_SIGNALS: TrafficSignal[] = [
  { id: 'sig-1', name: 'Signal 1 – Khanapara Junction', durationSec: 30, location: 'Guwahati Outskirts', x: 275, y: 320, lat: 26.1189, lng: 91.8262, status: 'green' },
  { id: 'sig-2', name: 'Signal 2 – Jorabat Intersection', durationSec: 45, location: 'Assam-Meghalaya Border', x: 285, y: 328, lat: 26.1082, lng: 91.8845, status: 'yellow' },
  { id: 'sig-3', name: 'Signal 3 – Dimapur Railway Crossing', durationSec: 20, location: 'Dimapur Entry', x: 400, y: 342, lat: 25.9095, lng: 93.7266, status: 'green' },
  { id: 'sig-4', name: 'Signal 4 – Kanglatongbi Checkpoint', durationSec: 25, location: 'Imphal Valley Approach', x: 418, y: 405, lat: 24.9750, lng: 93.8900, status: 'red' },
];

export interface HighwayRoute {
  id: string;
  name: string;
  source: string;
  destination: string;
  distanceKm: number;
  baseEtaHours: number;
  trafficPercent: number; // e.g. 72%
  riskSummary: string;
  tollGateIds: string[];
  signalIds: string[];
  points: { x: number; y: number }[];
  geoPoints: [number, number][]; // [lat, lng] array
}

export const HIGHWAY_ROUTES: HighwayRoute[] = [
  {
    id: 'ghy-imphal-nh27-nh29',
    name: 'NH-27 & NH-29 Eastern Corridor (Recommended)',
    source: 'Guwahati',
    destination: 'Imphal',
    distanceKm: 485,
    baseEtaHours: 11.5,
    trafficPercent: 34,
    riskSummary: 'Low Risk - Regular hill maintenance active',
    tollGateIds: ['toll-1', 'toll-2', 'toll-4'],
    signalIds: ['sig-1', 'sig-2', 'sig-3'],
    points: [
      { x: 260, y: 310 }, // Guwahati
      { x: 285, y: 318 }, // Jorabat
      { x: 330, y: 295 }, // Nagaon
      { x: 375, y: 335 }, // Lumding
      { x: 405, y: 340 }, // Dimapur
      { x: 438, y: 360 }, // Kohima
      { x: 420, y: 420 }, // Imphal
    ],
    geoPoints: [
      [26.1445, 91.7362], // Guwahati
      [26.1082, 91.8845], // Jorabat
      [26.1150, 91.9750], // Sonapur
      [26.3465, 92.6840], // Nagaon
      [25.7500, 93.1700], // Lumding / Diphu
      [25.9095, 93.7266], // Dimapur
      [25.6751, 94.1086], // Kohima
      [25.1500, 93.9700], // Kangpokpi
      [24.9750, 93.8900], // Kanglatongbi
      [24.8170, 93.9368], // Imphal
    ],
  },
  {
    id: 'ghy-imphal-nh37-silchar',
    name: 'NH-37 Southern Hill Bypass (Alternative)',
    source: 'Guwahati',
    destination: 'Imphal',
    distanceKm: 535,
    baseEtaHours: 13.8,
    trafficPercent: 58,
    riskSummary: 'Moderate Landslide Alert in Dima Hasao section',
    tollGateIds: ['toll-2', 'toll-3'],
    signalIds: ['sig-1', 'sig-4'],
    points: [
      { x: 260, y: 310 }, // Guwahati
      { x: 268, y: 360 }, // Shillong
      { x: 325, y: 410 }, // Silchar
      { x: 370, y: 415 }, // Jiribam
      { x: 420, y: 420 }, // Imphal
    ],
    geoPoints: [
      [26.1445, 91.7362], // Guwahati
      [25.9037, 91.8812], // Nongpoh
      [25.5788, 91.8933], // Shillong
      [25.4452, 92.2126], // Jowai
      [24.8170, 92.7926], // Silchar
      [24.8000, 93.1200], // Jiribam
      [24.8300, 93.6000], // Noney
      [24.8170, 93.9368], // Imphal
    ],
  },
];
