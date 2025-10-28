export interface AircraftModel {
  id: string;
  manufacturer: string;
  model: string;
  variant: string;
  price: number;
  maxPassengers: number;
  range: number;
  fuelCapacity: number;
  cruiseSpeed: number;
  category: 'narrow-body' | 'wide-body' | 'regional' | 'cargo';
  yearIntroduced: number;
  efficiency: number;
  maintenance: number;
  image: string;
}

export const aircraftModels: AircraftModel[] = [
  // Narrow-body aircraft
  {
    id: 'a320',
    manufacturer: 'Airbus',
    model: 'A320',
    variant: 'A320-200',
    price: 98000000,
    maxPassengers: 180,
    range: 3500,
    fuelCapacity: 6400,
    cruiseSpeed: 840,
    category: 'narrow-body',
    yearIntroduced: 1988,
    efficiency: 85,
    maintenance: 75,
    image: '/src/assets/aircraft/a320.jpg'
  },
  {
    id: 'b737',
    manufacturer: 'Boeing',
    model: '737',
    variant: '737-800',
    price: 96000000,
    maxPassengers: 189,
    range: 3200,
    fuelCapacity: 6875,
    cruiseSpeed: 842,
    category: 'narrow-body',
    yearIntroduced: 1998,
    efficiency: 82,
    maintenance: 78,
    image: '/src/assets/aircraft/b737.jpg'
  },
  {
    id: 'a321',
    manufacturer: 'Airbus',
    model: 'A321',
    variant: 'A321neo',
    price: 129500000,
    maxPassengers: 244,
    range: 4000,
    fuelCapacity: 7980,
    cruiseSpeed: 840,
    category: 'narrow-body',
    yearIntroduced: 2016,
    efficiency: 92,
    maintenance: 85,
    image: '/src/assets/aircraft/a321.jpg'
  },
  {
    id: 'b737max',
    manufacturer: 'Boeing',
    model: '737 MAX',
    variant: '737 MAX 8',
    price: 121600000,
    maxPassengers: 210,
    range: 3550,
    fuelCapacity: 6820,
    cruiseSpeed: 839,
    category: 'narrow-body',
    yearIntroduced: 2017,
    efficiency: 90,
    maintenance: 82,
    image: '/src/assets/aircraft/b737max.jpg'
  },

  // Wide-body aircraft
  {
    id: 'a330',
    manufacturer: 'Airbus',
    model: 'A330',
    variant: 'A330-300',
    price: 264200000,
    maxPassengers: 440,
    range: 6500,
    fuelCapacity: 17400,
    cruiseSpeed: 871,
    category: 'wide-body',
    yearIntroduced: 1993,
    efficiency: 78,
    maintenance: 70,
    image: '/src/assets/aircraft/a330.jpg'
  },
  {
    id: 'b777',
    manufacturer: 'Boeing',
    model: '777',
    variant: '777-300ER',
    price: 375500000,
    maxPassengers: 396,
    range: 7500,
    fuelCapacity: 20570,
    cruiseSpeed: 892,
    category: 'wide-body',
    yearIntroduced: 2004,
    efficiency: 88,
    maintenance: 80,
    image: '/src/assets/aircraft/b777.jpg'
  },
  {
    id: 'a350',
    manufacturer: 'Airbus',
    model: 'A350',
    variant: 'A350-900',
    price: 317400000,
    maxPassengers: 440,
    range: 8000,
    fuelCapacity: 19300,
    cruiseSpeed: 903,
    category: 'wide-body',
    yearIntroduced: 2015,
    efficiency: 95,
    maintenance: 90,
    image: '/src/assets/aircraft/a350.jpg'
  },
  {
    id: 'b787',
    manufacturer: 'Boeing',
    model: '787',
    variant: '787-9 Dreamliner',
    price: 292500000,
    maxPassengers: 420,
    range: 7800,
    fuelCapacity: 18600,
    cruiseSpeed: 903,
    category: 'wide-body',
    yearIntroduced: 2014,
    efficiency: 93,
    maintenance: 88,
    image: '/src/assets/aircraft/b787.jpg'
  },
  {
    id: 'a380',
    manufacturer: 'Airbus',
    model: 'A380',
    variant: 'A380-800',
    price: 445600000,
    maxPassengers: 853,
    range: 8500,
    fuelCapacity: 32000,
    cruiseSpeed: 903,
    category: 'wide-body',
    yearIntroduced: 2007,
    efficiency: 75,
    maintenance: 65,
    image: '/src/assets/aircraft/a380.jpg'
  },

  // Regional aircraft
  {
    id: 'crj900',
    manufacturer: 'Bombardier',
    model: 'CRJ-900',
    variant: 'CRJ-900NextGen',
    price: 46700000,
    maxPassengers: 90,
    range: 1800,
    fuelCapacity: 2840,
    cruiseSpeed: 834,
    category: 'regional',
    yearIntroduced: 2003,
    efficiency: 80,
    maintenance: 75,
    image: '/src/assets/aircraft/crj900.jpg'
  },
  {
    id: 'e190',
    manufacturer: 'Embraer',
    model: 'E-Jet',
    variant: 'E190',
    price: 53700000,
    maxPassengers: 114,
    range: 2200,
    fuelCapacity: 3700,
    cruiseSpeed: 870,
    category: 'regional',
    yearIntroduced: 2005,
    efficiency: 83,
    maintenance: 78,
    image: '/src/assets/aircraft/e190.jpg'
  },
  {
    id: 'atr72',
    manufacturer: 'ATR',
    model: 'ATR 72',
    variant: 'ATR 72-600',
    price: 26800000,
    maxPassengers: 78,
    range: 900,
    fuelCapacity: 1500,
    cruiseSpeed: 511,
    category: 'regional',
    yearIntroduced: 2010,
    efficiency: 85,
    maintenance: 80,
    image: '/src/assets/aircraft/atr72.jpg'
  },

  // Cargo aircraft
  {
    id: 'b747f',
    manufacturer: 'Boeing',
    model: '747',
    variant: '747-8F Freighter',
    price: 418400000,
    maxPassengers: 0,
    range: 4500,
    fuelCapacity: 23800,
    cruiseSpeed: 908,
    category: 'cargo',
    yearIntroduced: 2011,
    efficiency: 70,
    maintenance: 60,
    image: '/src/assets/aircraft/b747f.jpg'
  },
  {
    id: 'a330f',
    manufacturer: 'Airbus',
    model: 'A330',
    variant: 'A330-200F',
    price: 241700000,
    maxPassengers: 0,
    range: 4000,
    fuelCapacity: 17120,
    cruiseSpeed: 871,
    category: 'cargo',
    yearIntroduced: 2010,
    efficiency: 75,
    maintenance: 65,
    image: '/src/assets/aircraft/a330f.jpg'
  },
  {
    id: 'md11f',
    manufacturer: 'McDonnell Douglas',
    model: 'MD-11',
    variant: 'MD-11F',
    price: 157000000,
    maxPassengers: 0,
    range: 3800,
    fuelCapacity: 15600,
    cruiseSpeed: 876,
    category: 'cargo',
    yearIntroduced: 1991,
    efficiency: 65,
    maintenance: 55,
    image: '/src/assets/aircraft/md11f.jpg'
  }
];