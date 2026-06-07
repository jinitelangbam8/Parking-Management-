import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, ParkingSlot, Booking, Vehicle, Payment, ToastMessage, VehicleType, SlotStatus, PaymentMethod } from '../types';
import { initialUsers, initialSlots, initialBookings, initialVehicles, initialPayments, generateId } from '../data/mockData';

interface AppContextProps {
  // Navigation Routing
  currentPath: string;
  navigateTo: (path: string) => void;

  // Authentication
  currentUser: User | null;
  users: User[];
  login: (email: string, role: 'admin' | 'user') => boolean;
  register: (username: string, email: string, role: 'admin' | 'user', plateNumber?: string, phone?: string) => void;
  logout: () => void;

  // Slots
  slots: ParkingSlot[];
  addSlot: (slot: Omit<ParkingSlot, 'id'>) => void;
  updateSlot: (slot: ParkingSlot) => void;
  deleteSlot: (id: string) => void;

  // Bookings & Reservations
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'userId' | 'username' | 'status' | 'qrCode'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string, paymentMethod: PaymentMethod) => void;

  // Live Vehicle Parking
  vehicles: Vehicle[];
  checkInVehicle: (vehicleNumber: string, vehicleType: VehicleType, ownerName: string, slotId: string, vehicleName?: string) => void;
  checkOutVehicle: (vehicleId: string, paymentMethod: PaymentMethod) => void;

  // Payments & Invoices
  payments: Payment[];
  getPaymentsForBooking: (bookingId: string) => Payment | undefined;

  // Toast System
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // General Settings & Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  systemReset: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation Router (Hash based, e.g. #/dashboard/admin, #/settings)
  const [currentPath, setCurrentPath] = useState<string>('home');

  // Load state from LocalStorage or fall back to Initial datasets
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('park_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('park_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [slots, setSlots] = useState<ParkingSlot[]>(() => {
    const saved = localStorage.getItem('park_slots');
    if (!saved) return initialSlots;
    try {
      const parsed = JSON.parse(saved) as ParkingSlot[];
      // Keep existing states, but append newly specified initial database slots automatically
      const existingIds = new Set(parsed.map((s) => s.id));
      const newlyAdded = initialSlots.filter((s) => !existingIds.has(s.id));
      if (newlyAdded.length > 0) {
        return [...parsed, ...newlyAdded];
      }
      return parsed;
    } catch (e) {
      return initialSlots;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('park_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('park_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('park_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('park_darkMode');
    return saved ? JSON.parse(saved) === 'true' : true;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Watchers to persist back state changes
  useEffect(() => {
    localStorage.setItem('park_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('park_currentUser', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('park_slots', JSON.stringify(slots));
  }, [slots]);

  // Real-time capacity monitor for Parking Zones to alert admins at >= 90%
  const alertedZonesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!slots || slots.length === 0) return;

    const zonesMap: Record<string, { total: number; occupied: number }> = {};
    
    slots.forEach((slot) => {
      const zoneId = slot.id.split('-')[0] || 'Unknown';
      if (!zonesMap[zoneId]) {
        zonesMap[zoneId] = { total: 0, occupied: 0 };
      }
      zonesMap[zoneId].total += 1;
      // All statuses except "Available" count as filled/occupied capacity (Occupied, Reserved, Maintenance)
      if (slot.status !== 'Available') {
        zonesMap[zoneId].occupied += 1;
      }
    });

    const newlyAlerted: string[] = [];

    Object.entries(zonesMap).forEach(([zoneId, stats]) => {
      const capacityPercent = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;
      
      if (capacityPercent >= 90) {
        newlyAlerted.push(zoneId);
        
        // Trigger toast system alert if it was not already alerted in order to avoid spamming
        if (!alertedZonesRef.current.includes(zoneId)) {
          const zoneName = zoneId === 'A' ? 'Zone A (Cars)' : zoneId === 'B' ? 'Zone B (Bikes)' : zoneId === 'T' ? 'Zone T (Trucks)' : `Zone ${zoneId}`;
          showToast(
            `🚨 [SYSTEM ALERT] ${zoneName} has reached ${Math.round(capacityPercent)}% capacity (${stats.occupied}/${stats.total} slots occupied)!`,
            'error'
          );
        }
      }
    });

    // Sync alerted list so that dropping below 90% clears the alert state
    alertedZonesRef.current = newlyAlerted;
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('park_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('park_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('park_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('park_darkMode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync hash routing and browser history navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#/' || hash === '#') {
        setCurrentPath('home');
      } else {
        // Remove leading #/ or #
        const path = hash.replace(/^#\/?/, '');
        setCurrentPath(path);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial parse on load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = `#/${path}`;
    setCurrentPath(path);
  };

  // Toast System helpers
  const showToast = (message: string, type: ToastMessage['type']) => {
    const id = generateId('TST');
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Authentication Operations
  const login = (email: string, role: 'admin' | 'user'): boolean => {
    const targetUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (targetUser) {
      setCurrentUser(targetUser);
      showToast(`Welcome back, ${targetUser.username}!`, 'success');
      navigateTo(role === 'admin' ? 'dashboard/admin' : 'dashboard/user');
      return true;
    } else {
      showToast('Account not found with this role. Please Register first!', 'error');
      return false;
    }
  };

  const register = (
    username: string,
    email: string,
    role: 'admin' | 'user',
    plateNumber?: string,
    phone?: string
  ) => {
    // Check duplication
    const exist = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exist) {
      showToast('This email is already registered!', 'error');
      return;
    }

    const newUser: User = {
      id: generateId('USR'),
      username,
      email,
      role,
      plateNumber,
      phone,
      avatar: `https://images.unsplash.com/photo-${role === 'admin' ? '1573496359142-b8d87734a5a2' : '1535713875002-d1d0cf377fde'}?q=80&w=256&auto=format&fit=crop`
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast('Registration successful! Custom profile synced.', 'success');
    navigateTo(role === 'admin' ? 'dashboard/admin' : 'dashboard/user');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Logged out successfully.', 'info');
    navigateTo('home');
  };

  // Slot Management Operations
  const addSlot = (slotData: Omit<ParkingSlot, 'id'>) => {
    const id = `${slotData.vehicleType.toUpperCase().substring(0, 1)}-${slotData.floor}${slotData.number}`;
    // unique check
    if (slots.some((s) => s.id === id)) {
      showToast(`Slot ID ${id} already exists on this Floor.`, 'error');
      return;
    }

    const newSlot: ParkingSlot = {
      id,
      ...slotData,
      status: 'Available'
    };

    setSlots((prev) => [...prev, newSlot]);
    showToast(`Parking Slot ${id} created successfully!`, 'success');
  };

  const updateSlot = (updatedSlot: ParkingSlot) => {
    setSlots((prev) => prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s)));
    showToast(`Slot ${updatedSlot.id} updated to ${updatedSlot.status}.`, 'info');
  };

  const deleteSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    showToast(`Slot ${id} removed successfully.`, 'warning');
  };

  // Bookings & Reservations Operations
  const createBooking = (bookingData: Omit<Booking, 'id' | 'userId' | 'username' | 'status' | 'qrCode'>) => {
    if (!currentUser) throw new Error('Authentication required');

    const bookingId = generateId('BKG');
    const newBooking: Booking = {
      id: bookingId,
      userId: currentUser.id,
      username: currentUser.username,
      status: 'active',
      qrCode: `SMARTPARK_${bookingData.slotId}_${currentUser.id}_${bookingId}`,
      ...bookingData
    };

    // Update the booking list
    setBookings((prev) => [newBooking, ...prev]);

    // Update the slot status to Reserved
    setSlots((prev) =>
      prev.map((s) => (s.id === bookingData.slotId ? { ...s, status: 'Reserved' as SlotStatus } : s))
    );

    showToast(`Slot reserved successfully! Booking Ref: ${bookingId}`, 'success');
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    );

    // Revert slot back to Available
    setSlots((prev) =>
      prev.map((s) => (s.id === booking.slotId ? { ...s, status: 'Available' as SlotStatus } : s))
    );

    showToast(`Booking ${bookingId} has been cancelled.`, 'warning');
  };

  const completeBooking = (bookingId: string, paymentMethod: PaymentMethod) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Check if slot is currently occupied or reserved
    // Update booking status
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' as const } : b))
    );

    // Create Payment
    const cost = booking.estimatedCost;
    const tax = Number((cost * 0.18).toFixed(2));
    const grand = Number((cost + tax).toFixed(2));

    const newPayment: Payment = {
      id: generateId('TXN'),
      bookingId,
      paymentDate: new Date().toISOString(),
      amount: cost,
      paymentMethod,
      status: 'success',
      tax,
      grandTotal: grand,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Revert slot back to Available
    setSlots((prev) =>
      prev.map((s) => (s.id === booking.slotId ? { ...s, status: 'Available' as SlotStatus } : s))
    );

    showToast(`Invoice generated & paid via ${paymentMethod}!`, 'success');
  };

  // Check in Live Vehicles (Counter-based, for admin check-in)
  const checkInVehicle = (
    vehicleNumber: string,
    vehicleType: VehicleType,
    ownerName: string,
    slotId: string,
    vehicleName?: string
  ) => {
    const id = generateId('VEH');
    const newVehicle: Vehicle = {
      id,
      vehicleNumber,
      vehicleType,
      vehicleName: vehicleName || `Standard ${vehicleType}`,
      ownerName,
      entryTime: new Date().toISOString(),
      status: 'parked',
      slotId
    };

    // Update vehicle records
    setVehicles((prev) => [newVehicle, ...prev]);

    // Update slot to Occupied
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: 'Occupied' as SlotStatus } : s))
    );

    showToast(`Vehicle ${vehicleNumber} checked in at ${slotId}.`, 'success');
  };

  // Check out Live Vehicles & calculate automatic rates
  const checkOutVehicle = (vehicleId: string, paymentMethod: PaymentMethod) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle || vehicle.status === 'exited') return;

    // Get Slot information to get hourly rate
    const slot = slots.find((s) => s.id === vehicle.slotId);
    const hourlyRate = slot ? slot.hourlyRate : 10;

    const exitTime = new Date().toISOString();
    const start = new Date(vehicle.entryTime).getTime();
    const end = new Date(exitTime).getTime();

    // Auto calculate hours (minimum 1 hour)
    const diffMs = end - start;
    const durationHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    const amount = durationHours * hourlyRate;
    const tax = Number((amount * 0.18).toFixed(2));
    const grand = Number((amount + tax).toFixed(2));

    // Update vehicle record
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: 'exited' as const,
              exitTime,
              durationHours,
              parkingFee: amount
            }
          : v
      )
    );

    // Create payment transaction
    const newPayment: Payment = {
      id: generateId('TXN'),
      bookingId: vehicleId, // references the vehicle checkout session
      paymentDate: exitTime,
      amount,
      paymentMethod,
      status: 'success',
      tax,
      grandTotal: grand,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update Slot status to Available
    setSlots((prev) =>
      prev.map((s) => (s.id === vehicle.slotId ? { ...s, status: 'Available' as SlotStatus } : s))
    );

    showToast(`Vehicle ${vehicle.vehicleNumber} checked out. Fee: $${grand}`, 'success');
  };

  const getPaymentsForBooking = (bookingId: string) => {
    return payments.find((p) => p.bookingId === bookingId);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const systemReset = () => {
    localStorage.removeItem('park_users');
    localStorage.removeItem('park_currentUser');
    localStorage.removeItem('park_slots');
    localStorage.removeItem('park_bookings');
    localStorage.removeItem('park_vehicles');
    localStorage.removeItem('park_payments');
    
    setUsers(initialUsers);
    setCurrentUser(null);
    setSlots(initialSlots);
    setBookings(initialBookings);
    setVehicles(initialVehicles);
    setPayments(initialPayments);

    showToast('System variables reset to default demo values!', 'info');
    navigateTo('home');
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigateTo,
        currentUser,
        users,
        login,
        register,
        logout,
        slots,
        addSlot,
        updateSlot,
        deleteSlot,
        bookings,
        createBooking,
        cancelBooking,
        completeBooking,
        vehicles,
        checkInVehicle,
        checkOutVehicle,
        payments,
        getPaymentsForBooking,
        toasts,
        showToast,
        dismissToast,
        isDarkMode,
        toggleDarkMode,
        systemReset
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
