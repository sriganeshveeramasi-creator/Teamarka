export interface VillageNode {
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  type?: 'village' | 'town' | 'locality';
}

export interface CityNode {
  name: string;
  district: string;
  lat: number;
  lng: number;
  x: number; // SVG coordinate (0-800) fallback
  y: number; // SVG coordinate (0-600) fallback
  population?: string;
  hubType?: 'major' | 'secondary' | 'transit';
  villages?: VillageNode[];
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
      {
        name: 'Guwahati',
        district: 'Kamrup Metro',
        lat: 26.1445,
        lng: 91.7362,
        x: 260,
        y: 310,
        hubType: 'major',
        population: '1.2M',
        villages: [
          { name: 'Dispur', district: 'Kamrup Metro', state: 'Assam', lat: 26.1445, lng: 91.7915, type: 'town' },
          { name: 'Khanapara', district: 'Kamrup Metro', state: 'Assam', lat: 26.1242, lng: 91.8214, type: 'locality' },
          { name: 'Jalukbari', district: 'Kamrup Metro', state: 'Assam', lat: 26.1550, lng: 91.6620, type: 'town' },
          { name: 'Sonapur', district: 'Kamrup Metro', state: 'Assam', lat: 26.1154, lng: 91.9752, type: 'town' },
          { name: 'Panikhaiti', district: 'Kamrup Metro', state: 'Assam', lat: 26.2110, lng: 91.8540, type: 'village' },
          { name: 'Chandrapur', district: 'Kamrup Metro', state: 'Assam', lat: 26.2350, lng: 91.9210, type: 'village' },
          { name: 'Azara', district: 'Kamrup Metro', state: 'Assam', lat: 26.1280, lng: 91.6150, type: 'locality' },
        ],
      },
      {
        name: 'Nagaon',
        district: 'Nagaon',
        lat: 26.3475,
        lng: 92.6841,
        x: 330,
        y: 295,
        hubType: 'major',
        population: '350K',
        villages: [
          { name: 'Nagaon Town', district: 'Nagaon', state: 'Assam', lat: 26.3475, lng: 92.6841, type: 'town' },
          { name: 'Raha', district: 'Nagaon', state: 'Assam', lat: 26.2301, lng: 92.5190, type: 'town' },
          { name: 'Kaliabor', district: 'Nagaon', state: 'Assam', lat: 26.5480, lng: 92.9850, type: 'town' },
          { name: 'Samaguri', district: 'Nagaon', state: 'Assam', lat: 26.4350, lng: 92.8340, type: 'village' },
          { name: 'Dhing', district: 'Nagaon', state: 'Assam', lat: 26.4710, lng: 92.4620, type: 'town' },
        ],
      },
      {
        name: 'Jorhat',
        district: 'Jorhat',
        lat: 26.7509,
        lng: 94.2037,
        x: 440,
        y: 250,
        hubType: 'secondary',
        population: '220K',
        villages: [
          { name: 'Jorhat Town', district: 'Jorhat', state: 'Assam', lat: 26.7509, lng: 94.2037, type: 'town' },
          { name: 'Titabar', district: 'Jorhat', state: 'Assam', lat: 26.5820, lng: 94.2010, type: 'town' },
          { name: 'Mariani', district: 'Jorhat', state: 'Assam', lat: 26.6620, lng: 94.3310, type: 'town' },
          { name: 'Teok', district: 'Jorhat', state: 'Assam', lat: 26.8320, lng: 94.4210, type: 'village' },
        ],
      },
      {
        name: 'Dibrugarh',
        district: 'Dibrugarh',
        lat: 27.4728,
        lng: 94.9120,
        x: 530,
        y: 200,
        hubType: 'major',
        population: '180K',
        villages: [
          { name: 'Dibrugarh Town', district: 'Dibrugarh', state: 'Assam', lat: 27.4728, lng: 94.9120, type: 'town' },
          { name: 'Chabua', district: 'Dibrugarh', state: 'Assam', lat: 27.4810, lng: 95.1780, type: 'town' },
          { name: 'Naharkatia', district: 'Dibrugarh', state: 'Assam', lat: 27.2790, lng: 95.2580, type: 'town' },
          { name: 'Moranhat', district: 'Dibrugarh', state: 'Assam', lat: 27.1850, lng: 94.9280, type: 'village' },
        ],
      },
      {
        name: 'Silchar',
        district: 'Cachar',
        lat: 24.8333,
        lng: 92.7789,
        x: 325,
        y: 410,
        hubType: 'major',
        population: '230K',
        villages: [
          { name: 'Silchar Town', district: 'Cachar', state: 'Assam', lat: 24.8333, lng: 92.7789, type: 'town' },
          { name: 'Lakhipur', district: 'Cachar', state: 'Assam', lat: 24.7950, lng: 93.0120, type: 'town' },
          { name: 'Dholai', district: 'Cachar', state: 'Assam', lat: 24.5980, lng: 92.8420, type: 'village' },
          { name: 'Udharbond', district: 'Cachar', state: 'Assam', lat: 24.9120, lng: 92.8940, type: 'village' },
        ],
      },
      {
        name: 'Tezpur',
        district: 'Sonitpur',
        lat: 26.6528,
        lng: 92.7926,
        x: 345,
        y: 265,
        hubType: 'secondary',
        population: '140K',
        villages: [
          { name: 'Tezpur Town', district: 'Sonitpur', state: 'Assam', lat: 26.6528, lng: 92.7926, type: 'town' },
          { name: 'Dhekiajuli', district: 'Sonitpur', state: 'Assam', lat: 26.7020, lng: 92.4980, type: 'town' },
          { name: 'Jamugurihat', district: 'Sonitpur', state: 'Assam', lat: 26.7280, lng: 92.9510, type: 'village' },
        ],
      },
      {
        name: 'Barpeta',
        district: 'Barpeta',
        lat: 26.3216,
        lng: 91.0060,
        x: 215,
        y: 295,
        hubType: 'secondary',
        population: '120K',
        villages: [
          { name: 'Barpeta Town', district: 'Barpeta', state: 'Assam', lat: 26.3216, lng: 91.0060, type: 'town' },
          { name: 'Howly', district: 'Barpeta', state: 'Assam', lat: 26.4250, lng: 90.9650, type: 'town' },
          { name: 'Sarthebari', district: 'Barpeta', state: 'Assam', lat: 26.3580, lng: 91.2280, type: 'village' },
        ],
      },
    ],
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    capital: 'Shillong',
    color: '#059669',
    svgPath: 'M 215 330 L 305 340 L 320 375 L 295 405 L 205 395 L 180 360 Z',
    cities: [
      {
        name: 'Shillong',
        district: 'East Khasi Hills',
        lat: 25.5788,
        lng: 91.8933,
        x: 268,
        y: 360,
        hubType: 'major',
        population: '350K',
        villages: [
          { name: 'Shillong City', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.5788, lng: 91.8933, type: 'town' },
          { name: 'Upper Shillong', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.5410, lng: 91.8480, type: 'locality' },
          { name: 'Mawphlang', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.4520, lng: 91.7580, type: 'village' },
          { name: 'Smit', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.5280, lng: 91.9540, type: 'village' },
          { name: 'Laitlyngkot', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.4380, lng: 91.8350, type: 'village' },
          { name: 'Mylliem', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.4950, lng: 91.8210, type: 'village' },
        ],
      },
      {
        name: 'Cherrapunji',
        district: 'East Khasi Hills',
        lat: 25.2702,
        lng: 91.7323,
        x: 264,
        y: 385,
        hubType: 'secondary',
        population: '15K',
        villages: [
          { name: 'Cherrapunji (Sohra)', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.2702, lng: 91.7323, type: 'town' },
          { name: 'Mawlynnong', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.2016, lng: 91.9167, type: 'village' },
          { name: 'Pynursla', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.3080, lng: 91.9020, type: 'town' },
          { name: 'Mawkdok', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.3520, lng: 91.7580, type: 'village' },
          { name: 'Tyrna', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.2350, lng: 91.6850, type: 'village' },
        ],
      },
      {
        name: 'Jowai',
        district: 'West Jaintia Hills',
        lat: 25.4520,
        lng: 92.2030,
        x: 295,
        y: 375,
        hubType: 'secondary',
        population: '40K',
        villages: [
          { name: 'Jowai Town', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.4520, lng: 92.2030, type: 'town' },
          { name: 'Thadlaskein', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.5012, lng: 92.1812, type: 'village' },
          { name: 'Nartiang', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.5780, lng: 92.2150, type: 'village' },
          { name: 'Amlarem', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.2890, lng: 92.1020, type: 'village' },
          { name: 'Ialong', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.4710, lng: 92.2420, type: 'village' },
          { name: 'Wahiajer', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.5230, lng: 92.1480, type: 'village' },
          { name: 'Mukhla', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.4850, lng: 92.1790, type: 'village' },
          { name: 'Dawki', district: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.1850, lng: 92.0180, type: 'town' },
        ],
      },
      {
        name: 'Nongpoh',
        district: 'Ri-Bhoi',
        lat: 25.9030,
        lng: 91.8810,
        x: 265,
        y: 335,
        hubType: 'transit',
        population: '35K',
        villages: [
          { name: 'Nongpoh Town', district: 'Ri-Bhoi', state: 'Meghalaya', lat: 25.9030, lng: 91.8810, type: 'town' },
          { name: 'Byrnihat', district: 'Ri-Bhoi', state: 'Meghalaya', lat: 26.0540, lng: 91.8670, type: 'town' },
          { name: 'Umling', district: 'Ri-Bhoi', state: 'Meghalaya', lat: 25.9520, lng: 91.8740, type: 'village' },
          { name: 'Umsning', district: 'Ri-Bhoi', state: 'Meghalaya', lat: 25.7530, lng: 91.8910, type: 'village' },
          { name: 'Umiam', district: 'Ri-Bhoi', state: 'Meghalaya', lat: 25.6650, lng: 91.8950, type: 'village' },
        ],
      },
      {
        name: 'Tura',
        district: 'West Garo Hills',
        lat: 25.5138,
        lng: 90.2201,
        x: 200,
        y: 375,
        hubType: 'secondary',
        population: '90K',
        villages: [
          { name: 'Tura Town', district: 'West Garo Hills', state: 'Meghalaya', lat: 25.5138, lng: 90.2201, type: 'town' },
          { name: 'Asanang', district: 'West Garo Hills', state: 'Meghalaya', lat: 25.5420, lng: 90.3150, type: 'village' },
          { name: 'Rongram', district: 'West Garo Hills', state: 'Meghalaya', lat: 25.5890, lng: 90.2670, type: 'village' },
          { name: 'Garobadha', district: 'West Garo Hills', state: 'Meghalaya', lat: 25.5410, lng: 90.0420, type: 'village' },
        ],
      },
    ],
  },
  {
    id: 'manipur',
    name: 'Manipur',
    capital: 'Imphal',
    color: '#9333ea',
    svgPath: 'M 400 370 L 450 375 L 455 450 L 420 480 L 385 460 L 390 400 Z',
    cities: [
      {
        name: 'Imphal',
        district: 'Imphal West',
        lat: 24.8170,
        lng: 93.9368,
        x: 420,
        y: 420,
        hubType: 'major',
        population: '420K',
        villages: [
          { name: 'Imphal City', district: 'Imphal West', state: 'Manipur', lat: 24.8170, lng: 93.9368, type: 'town' },
          { name: 'Lamphelpat', district: 'Imphal West', state: 'Manipur', lat: 24.8250, lng: 93.9180, type: 'locality' },
          { name: 'Langthabal', district: 'Imphal West', state: 'Manipur', lat: 24.7550, lng: 93.9450, type: 'village' },
          { name: 'Sekmai', district: 'Imphal West', state: 'Manipur', lat: 24.9750, lng: 93.8820, type: 'town' },
          { name: 'Lamsang', district: 'Imphal West', state: 'Manipur', lat: 24.8720, lng: 93.8650, type: 'village' },
        ],
      },
      {
        name: 'Thoubal',
        district: 'Thoubal',
        lat: 24.6387,
        lng: 94.0040,
        x: 425,
        y: 435,
        hubType: 'secondary',
        population: '60K',
        villages: [
          { name: 'Thoubal Town', district: 'Thoubal', state: 'Manipur', lat: 24.6387, lng: 94.0040, type: 'town' },
          { name: 'Kakching', district: 'Thoubal', state: 'Manipur', lat: 24.4850, lng: 93.9850, type: 'town' },
          { name: 'Wangjing', district: 'Thoubal', state: 'Manipur', lat: 24.6010, lng: 94.0320, type: 'town' },
          { name: 'Lilong', district: 'Thoubal', state: 'Manipur', lat: 24.7210, lng: 93.9480, type: 'village' },
        ],
      },
      {
        name: 'Churachandpur',
        district: 'Churachandpur',
        lat: 24.3333,
        lng: 93.6833,
        x: 405,
        y: 455,
        hubType: 'secondary',
        population: '55K',
        villages: [
          { name: 'Churachandpur Town', district: 'Churachandpur', state: 'Manipur', lat: 24.3333, lng: 93.6833, type: 'town' },
          { name: 'Tuibong', district: 'Churachandpur', state: 'Manipur', lat: 24.3510, lng: 93.6980, type: 'locality' },
          { name: 'Lamka', district: 'Churachandpur', state: 'Manipur', lat: 24.3380, lng: 93.6750, type: 'locality' },
          { name: 'Singngat', district: 'Churachandpur', state: 'Manipur', lat: 24.1680, lng: 93.5950, type: 'village' },
        ],
      },
      {
        name: 'Bishnupur',
        district: 'Bishnupur',
        lat: 24.6333,
        lng: 93.7667,
        x: 412,
        y: 430,
        hubType: 'transit',
        population: '30K',
        villages: [
          { name: 'Bishnupur Town', district: 'Bishnupur', state: 'Manipur', lat: 24.6333, lng: 93.7667, type: 'town' },
          { name: 'Moirang', district: 'Bishnupur', state: 'Manipur', lat: 24.5020, lng: 93.7710, type: 'town' },
          { name: 'Nambol', district: 'Bishnupur', state: 'Manipur', lat: 24.7120, lng: 93.8350, type: 'village' },
        ],
      },
      {
        name: 'Ukhrul',
        district: 'Ukhrul',
        lat: 25.1167,
        lng: 94.3667,
        x: 440,
        y: 395,
        hubType: 'secondary',
        population: '40K',
        villages: [
          { name: 'Ukhrul Town', district: 'Ukhrul', state: 'Manipur', lat: 25.1167, lng: 94.3667, type: 'town' },
          { name: 'Shirui', district: 'Ukhrul', state: 'Manipur', lat: 25.1250, lng: 94.4320, type: 'village' },
          { name: 'Jessami', district: 'Ukhrul', state: 'Manipur', lat: 25.6210, lng: 94.5520, type: 'village' },
        ],
      },
    ],
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    capital: 'Kohima',
    color: '#ea580c',
    svgPath: 'M 425 285 L 485 245 L 515 285 L 465 365 L 415 360 Z',
    cities: [
      {
        name: 'Dimapur',
        district: 'Dimapur',
        lat: 25.9068,
        lng: 93.7275,
        x: 405,
        y: 340,
        hubType: 'major',
        population: '250K',
        villages: [
          { name: 'Dimapur Town', district: 'Dimapur', state: 'Nagaland', lat: 25.9068, lng: 93.7275, type: 'town' },
          { name: 'Chumukedima', district: 'Dimapur', state: 'Nagaland', lat: 25.7920, lng: 93.7820, type: 'town' },
          { name: 'Medziphema', district: 'Dimapur', state: 'Nagaland', lat: 25.7580, lng: 93.8640, type: 'town' },
          { name: 'Purana Bazar', district: 'Dimapur', state: 'Nagaland', lat: 25.9180, lng: 93.7460, type: 'locality' },
          { name: 'Diphupar', district: 'Dimapur', state: 'Nagaland', lat: 25.8620, lng: 93.7650, type: 'village' },
          { name: 'Niuland', district: 'Dimapur', state: 'Nagaland', lat: 25.8850, lng: 93.9210, type: 'town' },
        ],
      },
      {
        name: 'Kohima',
        district: 'Kohima',
        lat: 25.6751,
        lng: 94.1086,
        x: 438,
        y: 360,
        hubType: 'major',
        population: '120K',
        villages: [
          { name: 'Kohima City', district: 'Kohima', state: 'Nagaland', lat: 25.6751, lng: 94.1086, type: 'town' },
          { name: 'Jakhama', district: 'Kohima', state: 'Nagaland', lat: 25.5920, lng: 94.1480, type: 'village' },
          { name: 'Khonoma', district: 'Kohima', state: 'Nagaland', lat: 25.6480, lng: 94.0210, type: 'village' },
          { name: 'Kigwema', district: 'Kohima', state: 'Nagaland', lat: 25.6120, lng: 94.1280, type: 'village' },
          { name: 'Viswema', district: 'Kohima', state: 'Nagaland', lat: 25.5680, lng: 94.1620, type: 'village' },
        ],
      },
      {
        name: 'Mokokchung',
        district: 'Mokokchung',
        lat: 26.3250,
        lng: 94.5200,
        x: 465,
        y: 285,
        hubType: 'secondary',
        population: '45K',
        villages: [
          { name: 'Mokokchung Town', district: 'Mokokchung', state: 'Nagaland', lat: 26.3250, lng: 94.5200, type: 'town' },
          { name: 'Ungma', district: 'Mokokchung', state: 'Nagaland', lat: 26.3050, lng: 94.5050, type: 'village' },
          { name: 'Mopungchuket', district: 'Mokokchung', state: 'Nagaland', lat: 26.3810, lng: 94.5380, type: 'village' },
          { name: 'Changtongya', district: 'Mokokchung', state: 'Nagaland', lat: 26.5410, lng: 94.6850, type: 'town' },
        ],
      },
      {
        name: 'Tuensang',
        district: 'Tuensang',
        lat: 26.2800,
        lng: 94.8300,
        x: 495,
        y: 305,
        hubType: 'transit',
        population: '38K',
        villages: [
          { name: 'Tuensang Town', district: 'Tuensang', state: 'Nagaland', lat: 26.2800, lng: 94.8300, type: 'town' },
          { name: 'Noklak', district: 'Tuensang', state: 'Nagaland', lat: 26.1950, lng: 95.0080, type: 'village' },
          { name: 'Longkhim', district: 'Tuensang', state: 'Nagaland', lat: 26.2150, lng: 94.6980, type: 'village' },
        ],
      },
      {
        name: 'Wokha',
        district: 'Wokha',
        lat: 26.1000,
        lng: 94.2600,
        x: 445,
        y: 320,
        hubType: 'transit',
        population: '35K',
        villages: [
          { name: 'Wokha Town', district: 'Wokha', state: 'Nagaland', lat: 26.1000, lng: 94.2600, type: 'town' },
          { name: 'Bhandari', district: 'Wokha', state: 'Nagaland', lat: 26.1280, lng: 94.0250, type: 'village' },
          { name: 'Sanis', district: 'Wokha', state: 'Nagaland', lat: 26.1850, lng: 94.1650, type: 'village' },
        ],
      },
    ],
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    capital: 'Aizawl',
    color: '#0891b2',
    svgPath: 'M 350 435 L 390 440 L 395 530 L 350 545 L 340 480 Z',
    cities: [
      {
        name: 'Aizawl',
        district: 'Aizawl',
        lat: 23.7271,
        lng: 92.7176,
        x: 365,
        y: 470,
        hubType: 'major',
        population: '310K',
        villages: [
          { name: 'Aizawl City', district: 'Aizawl', state: 'Mizoram', lat: 23.7271, lng: 92.7176, type: 'town' },
          { name: 'Durtlang', district: 'Aizawl', state: 'Mizoram', lat: 23.7850, lng: 92.7350, type: 'locality' },
          { name: 'Sairang', district: 'Aizawl', state: 'Mizoram', lat: 23.8050, lng: 92.6580, type: 'village' },
          { name: 'Lengpui', district: 'Aizawl', state: 'Mizoram', lat: 23.8380, lng: 92.6280, type: 'village' },
        ],
      },
      {
        name: 'Lunglei',
        district: 'Lunglei',
        lat: 22.8900,
        lng: 92.7300,
        x: 365,
        y: 510,
        hubType: 'secondary',
        population: '65K',
        villages: [
          { name: 'Lunglei Town', district: 'Lunglei', state: 'Mizoram', lat: 22.8900, lng: 92.7300, type: 'town' },
          { name: 'Hnahthial', district: 'Lunglei', state: 'Mizoram', lat: 22.9680, lng: 92.9320, type: 'village' },
          { name: 'Tlabung', district: 'Lunglei', state: 'Mizoram', lat: 22.8980, lng: 92.4850, type: 'village' },
        ],
      },
      {
        name: 'Champhai',
        district: 'Champhai',
        lat: 23.4700,
        lng: 93.3300,
        x: 388,
        y: 480,
        hubType: 'transit',
        population: '40K',
        villages: [
          { name: 'Champhai Town', district: 'Champhai', state: 'Mizoram', lat: 23.4700, lng: 93.3300, type: 'town' },
          { name: 'Zokhawthar', district: 'Champhai', state: 'Mizoram', lat: 23.3650, lng: 93.4280, type: 'village' },
          { name: 'Khawbung', district: 'Champhai', state: 'Mizoram', lat: 23.1850, lng: 93.1950, type: 'village' },
        ],
      },
      {
        name: 'Kolasib',
        district: 'Kolasib',
        lat: 24.2200,
        lng: 92.6800,
        x: 360,
        y: 445,
        hubType: 'transit',
        population: '30K',
        villages: [
          { name: 'Kolasib Town', district: 'Kolasib', state: 'Mizoram', lat: 24.2200, lng: 92.6800, type: 'town' },
          { name: 'Vairengte', district: 'Kolasib', state: 'Mizoram', lat: 24.5080, lng: 92.7650, type: 'village' },
          { name: 'Bilkhawthlir', district: 'Kolasib', state: 'Mizoram', lat: 24.3250, lng: 92.7150, type: 'village' },
        ],
      },
    ],
  },
  {
    id: 'tripura',
    name: 'Tripura',
    capital: 'Agartala',
    color: '#16a34a',
    svgPath: 'M 285 410 L 325 415 L 325 470 L 295 490 L 275 460 Z',
    cities: [
      {
        name: 'Agartala',
        district: 'West Tripura',
        lat: 23.8315,
        lng: 91.2868,
        x: 288,
        y: 450,
        hubType: 'major',
        population: '400K',
        villages: [
          { name: 'Agartala City', district: 'West Tripura', state: 'Tripura', lat: 23.8315, lng: 91.2868, type: 'town' },
          { name: 'Ranirbazar', district: 'West Tripura', state: 'Tripura', lat: 23.8320, lng: 91.3650, type: 'town' },
          { name: 'Jirania', district: 'West Tripura', state: 'Tripura', lat: 23.8180, lng: 91.4250, type: 'village' },
          { name: 'Mohanpur', district: 'West Tripura', state: 'Tripura', lat: 23.9720, lng: 91.3650, type: 'village' },
        ],
      },
      {
        name: 'Dharmanagar',
        district: 'North Tripura',
        lat: 24.3700,
        lng: 92.1700,
        x: 320,
        y: 430,
        hubType: 'secondary',
        population: '50K',
        villages: [
          { name: 'Dharmanagar Town', district: 'North Tripura', state: 'Tripura', lat: 24.3700, lng: 92.1700, type: 'town' },
          { name: 'Panisagar', district: 'North Tripura', state: 'Tripura', lat: 24.2620, lng: 92.1480, type: 'town' },
          { name: 'Kanchanpur', district: 'North Tripura', state: 'Tripura', lat: 23.9750, lng: 92.2150, type: 'village' },
        ],
      },
      {
        name: 'Udaipur',
        district: 'Gomati',
        lat: 23.5300,
        lng: 91.4800,
        x: 295,
        y: 468,
        hubType: 'secondary',
        population: '40K',
        villages: [
          { name: 'Udaipur Town', district: 'Gomati', state: 'Tripura', lat: 23.5300, lng: 91.4800, type: 'town' },
          { name: 'Amarpur', district: 'Gomati', state: 'Tripura', lat: 23.5320, lng: 91.6420, type: 'village' },
          { name: 'Matabari', district: 'Gomati', state: 'Tripura', lat: 23.5150, lng: 91.4980, type: 'village' },
        ],
      },
      {
        name: 'Kailashahar',
        district: 'Unakoti',
        lat: 24.3300,
        lng: 92.0000,
        x: 318,
        y: 440,
        hubType: 'transit',
        population: '30K',
        villages: [
          { name: 'Kailashahar Town', district: 'Unakoti', state: 'Tripura', lat: 24.3300, lng: 92.0000, type: 'town' },
          { name: 'Kumarghat', district: 'Unakoti', state: 'Tripura', lat: 24.1620, lng: 92.0350, type: 'town' },
        ],
      },
    ],
  },
  {
    id: 'arunachal',
    name: 'Arunachal Pradesh',
    capital: 'Itanagar',
    color: '#2563eb',
    svgPath: 'M 250 200 L 380 170 L 510 140 L 630 130 L 670 190 L 580 200 L 460 215 L 340 230 Z',
    cities: [
      {
        name: 'Itanagar',
        district: 'Papum Pare',
        lat: 27.0844,
        lng: 93.6053,
        x: 365,
        y: 220,
        hubType: 'major',
        population: '60K',
        villages: [
          { name: 'Itanagar Capital', district: 'Papum Pare', state: 'Arunachal Pradesh', lat: 27.0844, lng: 93.6053, type: 'town' },
          { name: 'Naharlagun', district: 'Papum Pare', state: 'Arunachal Pradesh', lat: 27.1080, lng: 93.6980, type: 'town' },
          { name: 'Doimukh', district: 'Papum Pare', state: 'Arunachal Pradesh', lat: 27.1420, lng: 93.7510, type: 'town' },
          { name: 'Banderdewa', district: 'Papum Pare', state: 'Arunachal Pradesh', lat: 27.1250, lng: 93.8210, type: 'village' },
          { name: 'Nirjuli', district: 'Papum Pare', state: 'Arunachal Pradesh', lat: 27.1320, lng: 93.7380, type: 'village' },
        ],
      },
      {
        name: 'Ziro',
        district: 'Lower Subansiri',
        lat: 27.5950,
        lng: 93.8317,
        x: 405,
        y: 195,
        hubType: 'transit',
        population: '15K',
        villages: [
          { name: 'Ziro Town', district: 'Lower Subansiri', state: 'Arunachal Pradesh', lat: 27.5950, lng: 93.8317, type: 'town' },
          { name: 'Hapoli', district: 'Lower Subansiri', state: 'Arunachal Pradesh', lat: 27.5750, lng: 93.8250, type: 'town' },
          { name: 'Yazali', district: 'Lower Subansiri', state: 'Arunachal Pradesh', lat: 27.4280, lng: 93.7550, type: 'village' },
          { name: 'Yachuli', district: 'Lower Subansiri', state: 'Arunachal Pradesh', lat: 27.4850, lng: 93.7850, type: 'village' },
          { name: 'Old Ziro', district: 'Lower Subansiri', state: 'Arunachal Pradesh', lat: 27.6150, lng: 93.8420, type: 'village' },
        ],
      },
      {
        name: 'Tawang',
        district: 'Tawang',
        lat: 27.5860,
        lng: 91.8594,
        x: 245,
        y: 195,
        hubType: 'secondary',
        population: '15K',
        villages: [
          { name: 'Tawang Town', district: 'Tawang', state: 'Arunachal Pradesh', lat: 27.5860, lng: 91.8594, type: 'town' },
          { name: 'Jang', district: 'Tawang', state: 'Arunachal Pradesh', lat: 27.5850, lng: 92.0150, type: 'village' },
          { name: 'Lumla', district: 'Tawang', state: 'Arunachal Pradesh', lat: 27.5350, lng: 91.7150, type: 'village' },
          { name: 'Zemithang', district: 'Tawang', state: 'Arunachal Pradesh', lat: 27.7020, lng: 91.7180, type: 'village' },
        ],
      },
      {
        name: 'Pasighat',
        district: 'East Siang',
        lat: 28.0667,
        lng: 95.3333,
        x: 535,
        y: 165,
        hubType: 'secondary',
        population: '30K',
        villages: [
          { name: 'Pasighat Town', district: 'East Siang', state: 'Arunachal Pradesh', lat: 28.0667, lng: 95.3333, type: 'town' },
          { name: 'Ruksin', district: 'East Siang', state: 'Arunachal Pradesh', lat: 27.8420, lng: 95.2280, type: 'village' },
          { name: 'Mebo', district: 'East Siang', state: 'Arunachal Pradesh', lat: 28.0250, lng: 95.4420, type: 'village' },
        ],
      },
      {
        name: 'Tezu',
        district: 'Lohit',
        lat: 27.9167,
        lng: 96.1667,
        x: 615,
        y: 180,
        hubType: 'transit',
        population: '20K',
        villages: [
          { name: 'Tezu Town', district: 'Lohit', state: 'Arunachal Pradesh', lat: 27.9167, lng: 96.1667, type: 'town' },
          { name: 'Sunpura', district: 'Lohit', state: 'Arunachal Pradesh', lat: 27.8150, lng: 95.9850, type: 'village' },
          { name: 'Wakro', district: 'Lohit', state: 'Arunachal Pradesh', lat: 27.7780, lng: 96.3580, type: 'village' },
        ],
      },
    ],
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    capital: 'Gangtok',
    color: '#d97706',
    svgPath: 'M 90 220 L 130 205 L 145 240 L 115 275 L 80 250 Z',
    cities: [
      {
        name: 'Gangtok',
        district: 'East Sikkim',
        lat: 27.3389,
        lng: 88.6065,
        x: 120,
        y: 235,
        hubType: 'major',
        population: '100K',
        villages: [
          { name: 'Gangtok City', district: 'East Sikkim', state: 'Sikkim', lat: 27.3389, lng: 88.6065, type: 'town' },
          { name: 'Singtam', district: 'East Sikkim', state: 'Sikkim', lat: 27.2350, lng: 88.4980, type: 'town' },
          { name: 'Rangpo', district: 'East Sikkim', state: 'Sikkim', lat: 27.1780, lng: 88.5280, type: 'town' },
          { name: 'Pakyong', district: 'East Sikkim', state: 'Sikkim', lat: 27.2420, lng: 88.5850, type: 'village' },
        ],
      },
      {
        name: 'Namchi',
        district: 'South Sikkim',
        lat: 27.1667,
        lng: 88.3500,
        x: 110,
        y: 255,
        hubType: 'secondary',
        population: '15K',
        villages: [
          { name: 'Namchi Town', district: 'South Sikkim', state: 'Sikkim', lat: 27.1667, lng: 88.3500, type: 'town' },
          { name: 'Jorethang', district: 'South Sikkim', state: 'Sikkim', lat: 27.1350, lng: 88.3120, type: 'town' },
          { name: 'Ravangla', district: 'South Sikkim', state: 'Sikkim', lat: 27.3080, lng: 88.3650, type: 'village' },
        ],
      },
      {
        name: 'Geyzing',
        district: 'West Sikkim',
        lat: 27.2833,
        lng: 88.2500,
        x: 95,
        y: 245,
        hubType: 'transit',
        population: '10K',
        villages: [
          { name: 'Geyzing Town', district: 'West Sikkim', state: 'Sikkim', lat: 27.2833, lng: 88.2500, type: 'town' },
          { name: 'Pelling', district: 'West Sikkim', state: 'Sikkim', lat: 27.3180, lng: 88.2420, type: 'village' },
          { name: 'Yuksom', district: 'West Sikkim', state: 'Sikkim', lat: 27.3680, lng: 88.2250, type: 'village' },
        ],
      },
      {
        name: 'Mangan',
        district: 'North Sikkim',
        lat: 27.5167,
        lng: 88.5333,
        x: 125,
        y: 215,
        hubType: 'transit',
        population: '6K',
        villages: [
          { name: 'Mangan Town', district: 'North Sikkim', state: 'Sikkim', lat: 27.5167, lng: 88.5333, type: 'town' },
          { name: 'Chungthang', district: 'North Sikkim', state: 'Sikkim', lat: 27.6050, lng: 88.6480, type: 'village' },
          { name: 'Lachung', district: 'North Sikkim', state: 'Sikkim', lat: 27.6890, lng: 88.7450, type: 'village' },
        ],
      },
    ],
  },
];

export function getVillagesForDistrict(stateName: string, districtOrCityName: string): VillageNode[] {
  const state = NORTHEAST_STATES.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
  if (!state) return [];
  const city = state.cities.find(
    (c) => c.name.toLowerCase() === districtOrCityName.toLowerCase() || c.district.toLowerCase() === districtOrCityName.toLowerCase()
  );
  if (city && city.villages && city.villages.length > 0) {
    return city.villages;
  }
  // If no explicit villages array, create at least the district headquarter town
  if (city) {
    return [{
      name: `${city.name} Main`,
      district: city.district,
      state: state.name,
      lat: city.lat,
      lng: city.lng,
      type: 'town',
    }];
  }
  return [];
}

export function getVillageCoordinates(
  villageName?: string,
  districtOrCityName?: string,
  stateName?: string
): { lat: number; lng: number; name: string; state: string; district: string } | null {
  if (!villageName) {
    return districtOrCityName ? getCityCoordinates(districtOrCityName, stateName) : null;
  }

  // 1. Check with state and district filter
  for (const state of NORTHEAST_STATES) {
    if (stateName && state.name.toLowerCase() !== stateName.toLowerCase()) continue;
    for (const city of state.cities) {
      if (
        districtOrCityName &&
        city.name.toLowerCase() !== districtOrCityName.toLowerCase() &&
        city.district.toLowerCase() !== districtOrCityName.toLowerCase()
      ) {
        continue;
      }
      if (city.villages) {
        const found = city.villages.find((v) => v.name.toLowerCase() === villageName.toLowerCase());
        if (found) {
          return { lat: found.lat, lng: found.lng, name: found.name, state: state.name, district: city.district };
        }
      }
    }
  }

  // 2. Global search across all villages
  for (const state of NORTHEAST_STATES) {
    for (const city of state.cities) {
      if (city.villages) {
        const found = city.villages.find((v) => v.name.toLowerCase() === villageName.toLowerCase());
        if (found) {
          return { lat: found.lat, lng: found.lng, name: found.name, state: state.name, district: city.district };
        }
      }
    }
  }

  // 3. Fallback to city/district coordinates if village was not found directly
  if (districtOrCityName) {
    return getCityCoordinates(districtOrCityName, stateName);
  }

  return null;
}

export function getCityCoordinates(
  cityName: string,
  stateName?: string
): { lat: number; lng: number; name: string; state: string; district: string } | null {
  for (const state of NORTHEAST_STATES) {
    if (stateName && state.name.toLowerCase() !== stateName.toLowerCase()) continue;
    const city = state.cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase() || c.district.toLowerCase() === cityName.toLowerCase()
    );
    if (city) {
      return { lat: city.lat, lng: city.lng, name: city.name, state: state.name, district: city.district };
    }
  }
  for (const state of NORTHEAST_STATES) {
    const city = state.cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase() || c.district.toLowerCase() === cityName.toLowerCase()
    );
    if (city) {
      return { lat: city.lat, lng: city.lng, name: city.name, state: state.name, district: city.district };
    }
  }
  return null;
}

export interface TollGate {
  id: string;
  name: string;
  highway: string;
  cost: number;
  location: string;
  x: number;
  y: number;
}

export const TOLL_GATES: TollGate[] = [
  { id: 'toll-1', name: 'Madanpur Toll Plaza', highway: 'NH-27', cost: 120, location: 'Near Baihata Chariali', x: 245, y: 305 },
  { id: 'toll-2', name: 'Nazirakhat Toll Gate', highway: 'NH-27', cost: 85, location: 'Near Sonapur', x: 285, y: 312 },
  { id: 'toll-3', name: 'Raha Toll Plaza', highway: 'NH-37', cost: 110, location: 'Nagaon Bypass', x: 330, y: 300 },
  { id: 'toll-4', name: 'Manderdisa Toll Plaza', highway: 'NH-29', cost: 95, location: 'Near Lumding', x: 375, y: 335 },
];

export interface TrafficSignal {
  id: string;
  name: string;
  durationSec: number;
  location: string;
  x: number;
  y: number;
  status: 'green' | 'yellow' | 'red';
}

export const TRAFFIC_SIGNALS: TrafficSignal[] = [
  { id: 'sig-1', name: 'Signal 1 – Khanapara Junction', durationSec: 30, location: 'Guwahati Outskirts', x: 275, y: 320, status: 'green' },
  { id: 'sig-2', name: 'Signal 2 – Jorabat Intersection', durationSec: 45, location: 'Assam-Meghalaya Border', x: 285, y: 328, status: 'yellow' },
  { id: 'sig-3', name: 'Signal 3 – Dimapur Railway Crossing', durationSec: 20, location: 'Dimapur Entry', x: 400, y: 342, status: 'green' },
  { id: 'sig-4', name: 'Signal 4 – Kanglatongbi Checkpoint', durationSec: 25, location: 'Imphal Valley Approach', x: 418, y: 405, status: 'red' },
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
      { x: 260, y: 310 },
      { x: 285, y: 318 },
      { x: 330, y: 295 },
      { x: 375, y: 335 },
      { x: 405, y: 340 },
      { x: 438, y: 360 },
      { x: 420, y: 420 },
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
      { x: 260, y: 310 },
      { x: 268, y: 360 },
      { x: 325, y: 410 },
      { x: 370, y: 415 },
      { x: 420, y: 420 },
    ],
  },
];
