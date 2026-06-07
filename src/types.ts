/**
 * Shared Type Definitions for Smart Parking Management System
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  plateNumber?: string;
  phone?: string;
  avatar?: string;
}

export type SlotStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
export type VehicleType = 'Car' | 'Bike' | 'Truck';

export interface ParkingSlot {
  id: string; // e.g. "A-101"
  floor: number;
  number: number;
  vehicleType: VehicleType;
  status: SlotStatus;
  hourlyRate: number;
}

export type BookingStatus = 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  slotId: string;
  userId: string;
  username: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: BookingStatus;
  durationHours: number;
  estimatedCost: number;
  qrCode: string; // represented as data URL or unique string
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  ownerName: string;
  entryTime: string; // ISO string
  exitTime?: string; // ISO string
  durationHours?: number;
  parkingFee?: number;
  status: 'parked' | 'exited';
  slotId: string;
}

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash';
export type PaymentStatus = 'success' | 'pending' | 'failed';

export interface Payment {
  id: string;
  bookingId: string;
  paymentDate: string; // ISO string
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  tax: number;
  grandTotal: number;
  invoiceNumber: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
