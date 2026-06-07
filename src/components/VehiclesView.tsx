import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, PlusCircle, LogOut, ArrowRight, UserCheck, Trash, Filter, Coins, CheckCircle, CreditCard } from 'lucide-react';
import { Vehicle, VehicleType, PaymentMethod } from '../types';

export const VehiclesView: React.FC = () => {
  const { vehicles, slots, checkInVehicle, checkOutVehicle, currentUser, showToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<'All' | VehicleType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'parked' | 'exited'>('All');

  // Check In dialog state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState<VehicleType>('Car');
  const [newOwner, setNewOwner] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');

  // Check out checkout dialog state
  const [checkingOutVehicle, setCheckingOutVehicle] = useState<Vehicle | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('UPI');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter slots suitable for the selected vehicle type
  const availableSlotsList = useMemo(() => {
    return slots.filter((s) => s.status === 'Available' && s.vehicleType === newType);
  }, [slots, newType]);

  // Compute filtered vehicle list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.slotId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = vehicleFilter === 'All' || v.vehicleType === vehicleFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchQuery, vehicleFilter, statusFilter]);

  // Pagination slice
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) {
      showToast('Need a license code plate registration!', 'warning');
      return;
    }
    if (!newOwner.trim()) {
      showToast('Need owner identifier!', 'warning');
      return;
    }
    if (!selectedSlotId) {
      showToast('Please select an available parking slot!', 'warning');
      return;
    }

    checkInVehicle(newPlate.toUpperCase(), newType, newOwner, selectedSlotId);
    
    // Clear Form
    setNewPlate('');
    setNewOwner('');
    setSelectedSlotId('');
    setIsCheckInOpen(false);
  };

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingOutVehicle) return;

    checkOutVehicle(checkingOutVehicle.id, payoutMethod);
    setCheckingOutVehicle(null);
  };

  // Helper to calculate ongoing duration and potential rates for currently parked vehicle
  const getOngoingQuote = (v: Vehicle) => {
    const start = new Date(v.entryTime).getTime();
    const end = new Date().getTime();
    const diffMs = end - start;
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

    const slot = slots.find((s) => s.id === v.slotId);
    const rate = slot ? slot.hourlyRate : 12;
    const amount = hours * rate;
    const tax = Number((amount * 0.18).toFixed(2));
    const total = Number((amount + tax).toFixed(2));

    return { hours, amount, tax, total };
  };

  return (
    <div className="space-y-6">
      {/* Search and control Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Incoming Check-In Trace</h2>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
              <UserCheck className="text-indigo-600 dark:text-indigo-400 w-5 h-5 md:w-6 md:h-6" /> Live Vehicle Logs ledger
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search number, owner, spot..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 max-w-sm focus:outline-hidden"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsCheckInOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md bg-indigo-500"
              >
                <PlusCircle className="w-4 h-4" /> Log Vehicle Check-In
              </button>
            )}
          </div>
        </div>

        {/* Filters and options */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Classification:</span>
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="p-1 px-2 rounded-lg border border-slate-250 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-bold"
            >
              <option value="All">All types</option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="Truck">Truck</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="p-1 px-2 rounded-lg border border-slate-250 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-bold"
            >
              <option value="All">All statuses</option>
              <option value="parked">Currently Parked</option>
              <option value="exited">Checked out (Exited)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table layout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="vehicles-data-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">License Plate</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Owner Name</th>
                <th className="py-4 px-6">Assigned Slot</th>
                <th className="py-4 px-6">Entry timestamp</th>
                <th className="py-4 px-6">Completed fee</th>
                <th className="py-4 px-6">Status</th>
                {isAdmin && <th className="py-4 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-slate-400 text-xs">
                    No matching checked-in vehicles loaded in records.
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((v) => {
                  const isParked = v.status === 'parked';
                  return (
                    <tr key={v.id} className="text-xs hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all font-medium text-slate-700 dark:text-slate-200">
                      <td className="py-4 px-6 font-extrabold tracking-wider">{v.vehicleNumber}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          {v.vehicleType}
                        </span>
                      </td>
                      <td className="py-4 px-6">{v.ownerName}</td>
                      <td className="py-4 px-6 font-black text-indigo-600 dark:text-indigo-400">{v.slotId}</td>
                      <td className="py-4 px-6 text-slate-450 dark:text-slate-400">
                        {new Date(v.entryTime).toLocaleDateString()} {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {isParked ? (
                          <span className="text-amber-500 dark:text-amber-400 italic">Ongoing counter</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">${v.parkingFee?.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isParked ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30' : 'bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {v.status === 'parked' ? 'PARKED' : 'EXITED'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
                          {isParked ? (
                            <button
                              onClick={() => setCheckingOutVehicle(v)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <LogOut className="w-3 h-3" /> Checkout
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Trace Resolved</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-semibold uppercase">
            Page {currentPage} of {totalPages} &bull; Total {filteredVehicles.length} records
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Check In Custom Form Modal */}
      {isCheckInOpen && (
        <div id="check-in-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-855 pb-2 mb-4 flex items-center gap-2">
              <UserCheck className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
              Incoming Vehicle Register
            </h3>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Classification
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      setNewType(e.target.value as VehicleType);
                      setSelectedSlotId(''); // reset available slots query
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-bold"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    License Code Plate
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-03-HA-1234"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden tracking-wider font-extrabold text-indigo-600 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Scott"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Assign available slot
                </label>
                <select
                  required
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-bold text-indigo-600"
                >
                  <option value="">-- Select Spot level --</option>
                  {availableSlotsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      Bay {s.id} - Floor {s.floor} (Rate: ${s.hourlyRate}/hr)
                    </option>
                  ))}
                </select>
                {availableSlotsList.length === 0 && (
                  <p className="text-[10px] text-rose-500 mt-1 font-bold italic">
                    Caution: No available vacant slots matching type {newType} in the directory.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckInOpen(false)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-550 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableSlotsList.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Payment Dialog Modal */}
      {checkingOutVehicle && (
        <div id="checkout-payment-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2 mb-4 flex items-center gap-2">
              <Coins className="text-indigo-600 dark:text-indigo-400 w-5 h-5 animate-bounce" />
              Checkout calculations
            </h3>

            <form onSubmit={handleCheckOutSubmit} className="space-y-4">
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 p-4 rounded-xl dark:bg-slate-950 font-medium">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                  <span>Veh-ID: {checkingOutVehicle.vehicleNumber}</span>
                  <span>Slot: {checkingOutVehicle.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Time:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">{new Date(checkingOutVehicle.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Duration:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{getOngoingQuote(checkingOutVehicle).hours} hours (Minimum 1h)</span>
                </div>
                <div className="flex justify-between">
                  <span>Parking Base Cost:</span>
                  <span className="font-bold text-slate-705 dark:text-slate-300 font-semibold">${getOngoingQuote(checkingOutVehicle).amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vat Tax (18%):</span>
                  <span className="font-bold text-slate-705 dark:text-slate-300 font-semibold">${getOngoingQuote(checkingOutVehicle).tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-150 dark:border-slate-800 my-1 pt-1.5 flex justify-between text-slate-800 dark:text-slate-100 font-black text-sm">
                  <span>Grand Total due:</span>
                  <span className="text-emerald-500 font-extrabold">${getOngoingQuote(checkingOutVehicle).total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Select payment processing method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['UPI', 'Credit Card', 'Debit Card', 'Cash'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayoutMethod(method)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                        payoutMethod === method
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-black'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckingOutVehicle(null)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-550 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-extrabold hover:bg-emerald-505 rounded-xl text-xs transition-transform cursor-pointer shadow-md bg-emerald-500"
                >
                  Process Settle & Open Gate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
