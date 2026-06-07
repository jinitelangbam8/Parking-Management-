import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Calendar, Clock, RotateCcw, AlertCircle, Sparkles, Building, Key, CheckSquare } from 'lucide-react';
import { QRGenerator } from './QRGenerator';

export const DashboardUserView: React.FC = () => {
  const { slots, bookings, currentUser, createBooking, cancelBooking, showToast } = useApp();

  // Dialog State
  const [selectedSlot, setSelectedSlot] = useState<typeof slots[0] | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState(currentUser?.plateNumber || '');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState<'Car' | 'Bike' | 'Truck'>('Car');
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15); // Default start in 15 mins
    return d.toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 3); // Default 3 hours slot
    return d.toISOString().slice(0, 16);
  });

  // Filter slots to only show Available slots
  const [slotFilter, setSlotFilter] = useState<'All' | 'Car' | 'Bike' | 'Truck'>('All');

  const filteredAvailableSlots = useMemo(() => {
    return slots.filter((s) => {
      const isAvailable = s.status === 'Available';
      const matchesType = slotFilter === 'All' || s.vehicleType === slotFilter;
      return isAvailable && matchesType;
    });
  }, [slots, slotFilter]);

  // Personal reservation history
  const personalBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter((b) => b.userId === currentUser.id);
  }, [bookings, currentUser]);

  // Automatic quote calculation
  const quote = useMemo(() => {
    if (!selectedSlot) return { hours: 0, cost: 0, tax: 0, total: 0 };
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (isNaN(start) || isNaN(end) || end <= start) {
      return { hours: 0, cost: 0, tax: 0, total: 0 };
    }

    const diffMs = end - start;
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    const cost = hours * selectedSlot.hourlyRate;
    const tax = Number((cost * 0.18).toFixed(2));
    const total = Number((cost + tax).toFixed(2));

    return { hours, cost, tax, total };
  }, [selectedSlot, startTime, endTime]);

  // Selected Booking details for ticket receipt view
  const [activeTicketBooking, setActiveTicketBooking] = useState<typeof bookings[0] | null>(null);

  const startReservationFlow = (slot: typeof slots[0]) => {
    setSelectedSlot(slot);
    setVehicleType(slot.vehicleType);
    setVehicleNumber(currentUser?.plateNumber || '');
    setVehicleName(
      slot.vehicleType === 'Car'
        ? 'Tesla Model Y'
        : slot.vehicleType === 'Bike'
        ? 'Yamaha MT-15'
        : 'Volvo Heavy Duty'
    );
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !currentUser) return;

    if (!vehicleNumber.trim()) {
      showToast('Please provide your vehicle license plate number!', 'warning');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      showToast('Ending duration must be after your start time!', 'error');
      return;
    }

    try {
      const created = createBooking({
        slotId: selectedSlot.id,
        vehicleNumber: vehicleNumber.toUpperCase(),
        vehicleType: selectedSlot.vehicleType,
        vehicleName: vehicleName.trim() || `Standard ${selectedSlot.vehicleType}`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationHours: quote.hours,
        estimatedCost: quote.cost
      });

      setSelectedSlot(null);
      // Open the visual ticket modal right away!
      setActiveTicketBooking(created);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div id="user-dashboard-wrapper" className="space-y-6">
      {/* Dynamic promo banners or greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white border border-indigo-950 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Need a secure parking parking slot?</h2>
          <p className="text-xs text-indigo-200 mt-1.5 max-w-xl">
            Pick a floor bay below, select your duration quote, and secure a spot instantly with a scanning compatible QR gate ticket pass.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Available Parking Spots list (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-indigo-500" />
              Available Parking Bays
            </h3>
            {/* Filter buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs gap-1">
              {(['All', 'Car', 'Bike', 'Truck'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSlotFilter(type)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    slotFilter === type
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {filteredAvailableSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">All Slots Booked Out!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                There are no currently vacant slots matching your selection. Try clearing filters or try again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredAvailableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-indigo-500" />
                        Bay {slot.id}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider rounded-full uppercase ${
                        slot.vehicleType === 'Car'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/30'
                          : slot.vehicleType === 'Bike'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30'
                      }`}>
                        {slot.vehicleType}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <p className="flex justify-between">
                        <span>Floor Level:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {slot.floor === 0 ? 'Floor Level Ground' : `Floor Level ${slot.floor}`}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Hourly Parking Rate:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">${slot.hourlyRate}/hour</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => startReservationFlow(slot)}
                    className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-indigo-600/10 shadow-lg"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Spot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: User Reservations history summary */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-fit">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
            My Tickets
          </h3>

          {personalBookings.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs">No reservation history loaded on this account.</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Book an available slot left to get a ticket!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {personalBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Slot {b.slotId}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">ID: {b.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-sm uppercase tracking-wider ${
                      b.status === 'active'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20'
                        : b.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20'
                        : 'bg-rose-105 text-rose-700 dark:bg-rose-950/20 bg-rose-100'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  {b.status === 'active' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setActiveTicketBooking(b)}
                        className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Scanner Code
                      </button>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="py-1.5 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Void Ticket
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reservation Dialog Modal */}
      {selectedSlot && (
        <div id="booking-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-500 w-5 h-5" />
              Secure Bay Reservation
            </h3>

            <form onSubmit={handleConfirmReservation} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Slot Coordinates</label>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-sm text-slate-800 dark:text-slate-200">
                  Bay Level {selectedSlot.id} &bull; Type: {selectedSlot.vehicleType} &bull; Rates: ${selectedSlot.hourlyRate}/hr
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  License Plate Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-03-HA-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Vehicle Brand & Model (e.g. Tesla Model 3)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tesla Model Y"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Entry Estimated</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 text-xs text-center focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Exit Estimated</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 text-xs text-center focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Automatic cost layout */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 text-xs space-y-2">
                <h4 className="font-extrabold text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">Automatic Quotation Breakdown</h4>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Usage Duration:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{quote.hours} hours</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Parking Cost:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">${quote.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Vat Tax (18%):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">${quote.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-indigo-100 dark:border-indigo-900/40 my-1 pt-1.5 flex justify-between text-slate-800 dark:text-slate-100 font-bold text-sm">
                  <span>Booking Grand Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${quote.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-500 rounded-xl text-xs transition-colors cursor-pointer shadow-indigo-600/10 shadow-lg"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Ticket Modal (displays QR Code) */}
      {activeTicketBooking && (
        <div id="ticket-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative text-center">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest leading-loose">Validated Entry Ticket</h4>
            <h3 className="text-md font-extrabold text-slate-800 dark:text-slate-100 mt-1">Smart Gate Pass</h3>

            <div className="my-6">
              <QRGenerator value={activeTicketBooking.qrCode} size={150} />
            </div>

            <div className="space-y-2 text-xs text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Slot {activeTicketBooking.slotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Model:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{activeTicketBooking.vehicleName || 'Standard Car'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License Plate:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeTicketBooking.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration Quote:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeTicketBooking.durationHours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Estimated Charge:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">${activeTicketBooking.estimatedCost}</span>
              </div>
            </div>

            {/* Simulated entry actions */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  showToast('Ticket validated! High-definition gate opening confirmed.', 'success');
                  setActiveTicketBooking(null);
                }}
                className="w-full py-2.5 bg-indigo-600 font-bold hover:bg-indigo-500 text-white rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
              >
                Simulate QR Gate Entrance
              </button>
              <button
                onClick={() => setActiveTicketBooking(null)}
                className="w-full py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Dismiss View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
