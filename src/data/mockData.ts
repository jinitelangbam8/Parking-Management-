import { User, ParkingSlot, Booking, Vehicle, Payment } from '../types';

// Helper to generate IDs
export const generateId = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

// Initial Users
export const initialUsers: User[] = [
  {
    id: 'USR-1001',
    username: 'System Administrator',
    email: 'admin@parking.com',
    role: 'admin',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'USR-1002',
    username: 'Jini Telangbam',
    email: 'jinitelangbam8@gmail.com',
    role: 'user',
    plateNumber: 'KA-03-HA-1234',
    phone: '+1 (555) 014-9988',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'USR-1003',
    username: 'Jane Smith',
    email: 'user@parking.com',
    role: 'user',
    plateNumber: 'MH-02-AB-5678',
    phone: '+1 (555) 012-3456',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop'
  }
];

// Initial Slots
export const initialSlots: ParkingSlot[] = [
  // Floor 0 - Ground (Convenient but higher rates)
  { id: 'A-101', floor: 0, number: 101, vehicleType: 'Car', status: 'Occupied', hourlyRate: 15 },
  { id: 'A-102', floor: 0, number: 102, vehicleType: 'Car', status: 'Available', hourlyRate: 15 },
  { id: 'A-103', floor: 0, number: 103, vehicleType: 'Car', status: 'Reserved', hourlyRate: 15 },
  { id: 'A-104', floor: 0, number: 104, vehicleType: 'Car', status: 'Available', hourlyRate: 15 },
  { id: 'A-105', floor: 0, number: 105, vehicleType: 'Car', status: 'Available', hourlyRate: 15 },
  { id: 'A-106', floor: 0, number: 106, vehicleType: 'Car', status: 'Occupied', hourlyRate: 15 },
  { id: 'A-107', floor: 0, number: 107, vehicleType: 'Car', status: 'Available', hourlyRate: 15 },
  { id: 'A-108', floor: 0, number: 108, vehicleType: 'Car', status: 'Available', hourlyRate: 15 },

  { id: 'B-101', floor: 0, number: 201, vehicleType: 'Bike', status: 'Available', hourlyRate: 8 },
  { id: 'B-102', floor: 0, number: 202, vehicleType: 'Bike', status: 'Occupied', hourlyRate: 8 },
  { id: 'B-103', floor: 0, number: 203, vehicleType: 'Bike', status: 'Available', hourlyRate: 8 },
  { id: 'B-104', floor: 0, number: 204, vehicleType: 'Bike', status: 'Available', hourlyRate: 8 },
  { id: 'B-105', floor: 0, number: 205, vehicleType: 'Bike', status: 'Reserved', hourlyRate: 8 },

  { id: 'T-101', floor: 0, number: 301, vehicleType: 'Truck', status: 'Maintenance', hourlyRate: 25 },
  { id: 'T-102', floor: 0, number: 302, vehicleType: 'Truck', status: 'Available', hourlyRate: 25 },
  { id: 'T-103', floor: 0, number: 303, vehicleType: 'Truck', status: 'Available', hourlyRate: 25 },

  // Floor 1
  { id: 'A-201', floor: 1, number: 101, vehicleType: 'Car', status: 'Available', hourlyRate: 12 },
  { id: 'A-202', floor: 1, number: 102, vehicleType: 'Car', status: 'Occupied', hourlyRate: 12 },
  { id: 'A-203', floor: 1, number: 103, vehicleType: 'Car', status: 'Available', hourlyRate: 12 },
  { id: 'A-204', floor: 1, number: 104, vehicleType: 'Car', status: 'Reserved', hourlyRate: 12 },
  { id: 'A-205', floor: 1, number: 105, vehicleType: 'Car', status: 'Available', hourlyRate: 12 },
  { id: 'A-206', floor: 1, number: 106, vehicleType: 'Car', status: 'Available', hourlyRate: 12 },
  { id: 'A-207', floor: 1, number: 107, vehicleType: 'Car', status: 'Available', hourlyRate: 12 },
  { id: 'A-208', floor: 1, number: 108, vehicleType: 'Car', status: 'Maintenance', hourlyRate: 12 },

  { id: 'B-201', floor: 1, number: 201, vehicleType: 'Bike', status: 'Available', hourlyRate: 6 },
  { id: 'B-202', floor: 1, number: 202, vehicleType: 'Bike', status: 'Available', hourlyRate: 6 },
  { id: 'B-203', floor: 1, number: 203, vehicleType: 'Bike', status: 'Occupied', hourlyRate: 6 },
  { id: 'B-204', floor: 1, number: 204, vehicleType: 'Bike', status: 'Available', hourlyRate: 6 },
  { id: 'B-205', floor: 1, number: 205, vehicleType: 'Bike', status: 'Available', hourlyRate: 6 },

  { id: 'T-201', floor: 1, number: 301, vehicleType: 'Truck', status: 'Available', hourlyRate: 20 },
  { id: 'T-202', floor: 1, number: 302, vehicleType: 'Truck', status: 'Reserved', hourlyRate: 20 },
  { id: 'T-203', floor: 1, number: 303, vehicleType: 'Truck', status: 'Available', hourlyRate: 20 },

  // Floor 2
  { id: 'A-301', floor: 2, number: 101, vehicleType: 'Car', status: 'Available', hourlyRate: 10 },
  { id: 'A-302', floor: 2, number: 102, vehicleType: 'Car', status: 'Available', hourlyRate: 10 },
  { id: 'A-303', floor: 2, number: 103, vehicleType: 'Car', status: 'Maintenance', hourlyRate: 10 },
  { id: 'A-304', floor: 2, number: 104, vehicleType: 'Car', status: 'Available', hourlyRate: 10 },
  { id: 'A-305', floor: 2, number: 105, vehicleType: 'Car', status: 'Available', hourlyRate: 10 },
  { id: 'A-306', floor: 2, number: 106, vehicleType: 'Car', status: 'Occupied', hourlyRate: 10 },
  { id: 'A-307', floor: 2, number: 107, vehicleType: 'Car', status: 'Available', hourlyRate: 10 },
  { id: 'A-308', floor: 2, number: 108, vehicleType: 'Car', status: 'Available', hourlyRate: 10 },

  { id: 'B-301', floor: 2, number: 201, vehicleType: 'Bike', status: 'Available', hourlyRate: 5 },
  { id: 'B-302', floor: 2, number: 202, vehicleType: 'Bike', status: 'Available', hourlyRate: 5 },
  { id: 'B-303', floor: 2, number: 203, vehicleType: 'Bike', status: 'Available', hourlyRate: 5 },
  { id: 'B-304', floor: 2, number: 204, vehicleType: 'Bike', status: 'Available', hourlyRate: 5 },
  { id: 'B-305', floor: 2, number: 205, vehicleType: 'Bike', status: 'Available', hourlyRate: 5 },

  { id: 'T-301', floor: 2, number: 301, vehicleType: 'Truck', status: 'Reserved', hourlyRate: 18 },
  { id: 'T-302', floor: 2, number: 302, vehicleType: 'Truck', status: 'Available', hourlyRate: 18 },
  { id: 'T-303', floor: 2, number: 303, vehicleType: 'Truck', status: 'Available', hourlyRate: 18 }
];

// Seed relative times dynamically to avoid stale dates
const now = new Date();
const hoursAgo = (h: number) => {
  const d = new Date(now);
  d.setHours(d.getHours() - h);
  return d.toISOString();
};
const hoursFromNow = (h: number) => {
  const d = new Date(now);
  d.setHours(d.getHours() + h);
  return d.toISOString();
};

// Initial Bookings
export const initialBookings: Booking[] = [
  {
    id: 'BKG-4201',
    slotId: 'A-103',
    userId: 'USR-1002', // Jini
    username: 'Jini Telangbam',
    vehicleNumber: 'KA-03-HA-1234',
    vehicleType: 'Car',
    vehicleName: 'Tesla Model Y',
    startTime: hoursAgo(1),
    endTime: hoursFromNow(3),
    status: 'active',
    durationHours: 4,
    estimatedCost: 60,
    qrCode: 'SMARTPARK_A-103_USR-1002_4201'
  },
  {
    id: 'BKG-5102',
    slotId: 'A-204',
    userId: 'USR-1003', // Jane Smith
    username: 'Jane Smith',
    vehicleNumber: 'MH-02-AB-5678',
    vehicleType: 'Car',
    vehicleName: 'Toyota Prius',
    startTime: hoursAgo(2),
    endTime: hoursFromNow(1),
    status: 'active',
    durationHours: 3,
    estimatedCost: 36,
    qrCode: 'SMARTPARK_A-204_USR-1003_5102'
  },
  {
    id: 'BKG-3188',
    slotId: 'T-301',
    userId: 'USR-1003',
    username: 'Jane Smith',
    vehicleNumber: 'MH-14-KK-8899',
    vehicleType: 'Truck',
    vehicleName: 'Volvo V60 Heavy',
    startTime: hoursAgo(5),
    endTime: hoursAgo(2),
    status: 'completed',
    durationHours: 3,
    estimatedCost: 54,
    qrCode: 'SMARTPARK_T-301_USR-1003_3188'
  },
  {
    id: 'BKG-1122',
    slotId: 'B-101',
    userId: 'USR-1002',
    username: 'Jini Telangbam',
    vehicleNumber: 'KA-03-HA-1234',
    vehicleType: 'Bike',
    vehicleName: 'Yamaha MT-15',
    startTime: hoursAgo(24),
    endTime: hoursAgo(22),
    status: 'completed',
    durationHours: 2,
    estimatedCost: 16,
    qrCode: 'SMARTPARK_B-101_USR-1002_1122'
  }
];

// Initial Vehicles
export const initialVehicles: Vehicle[] = [
  {
    id: 'VEH-9011',
    vehicleNumber: 'KA-03-HA-1234',
    vehicleType: 'Car',
    vehicleName: 'Tesla Model Y',
    ownerName: 'Jini Telangbam',
    entryTime: hoursAgo(1),
    status: 'parked',
    slotId: 'A-103'
  },
  {
    id: 'VEH-8211',
    vehicleNumber: 'KA-04-MM-9900',
    vehicleType: 'Car',
    vehicleName: 'Ford Mustang GT',
    ownerName: 'Marcus Aurelius',
    entryTime: hoursAgo(4),
    status: 'parked',
    slotId: 'A-101'
  },
  {
    id: 'VEH-7123',
    vehicleNumber: 'KA-51-EF-4411',
    vehicleType: 'Bike',
    vehicleName: 'Kawasaki Ninja H2',
    ownerName: 'Bob Vance',
    entryTime: hoursAgo(2),
    status: 'parked',
    slotId: 'B-102'
  },
  {
    id: 'VEH-6194',
    vehicleNumber: 'MH-12-PQ-8765',
    vehicleType: 'Car',
    vehicleName: 'Audi A6 Quattro',
    ownerName: 'Dwight Schrute',
    entryTime: hoursAgo(3),
    status: 'parked',
    slotId: 'A-202'
  },
  {
    id: 'VEH-3188',
    vehicleNumber: 'MH-14-KK-8899',
    vehicleType: 'Truck',
    vehicleName: 'Volvo V60 Heavy',
    ownerName: 'Jane Smith',
    entryTime: hoursAgo(5),
    exitTime: hoursAgo(2),
    durationHours: 3,
    parkingFee: 54,
    status: 'exited',
    slotId: 'T-301'
  },
  {
    id: 'VEH-1122',
    vehicleNumber: 'KA-03-HA-1234',
    vehicleType: 'Bike',
    vehicleName: 'Yamaha MT-15',
    ownerName: 'Jini Telangbam',
    entryTime: hoursAgo(24),
    exitTime: hoursAgo(22),
    durationHours: 2,
    parkingFee: 16,
    status: 'exited',
    slotId: 'B-101'
  }
];

// Initial Payments
export const initialPayments: Payment[] = [
  {
    id: 'TXN-90112',
    bookingId: 'BKG-3188',
    paymentDate: hoursAgo(2),
    amount: 54,
    paymentMethod: 'Credit Card',
    status: 'success',
    tax: 9.72, // 18% tax
    grandTotal: 63.72,
    invoiceNumber: 'INV-2026-001'
  },
  {
    id: 'TXN-42119',
    bookingId: 'BKG-1122',
    paymentDate: hoursAgo(22),
    amount: 16,
    paymentMethod: 'UPI',
    status: 'success',
    tax: 2.88,
    grandTotal: 18.88,
    invoiceNumber: 'INV-2026-002'
  }
];
