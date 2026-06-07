import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Search, Filter, PlusCircle, PenTool, Trash2, Building, Layers, ShieldCheck, HeartPulse, Hammer } from 'lucide-react';
import { ParkingSlot, SlotStatus, VehicleType } from '../types';

export const ParkingSlotsView: React.FC = () => {
  const { slots, bookings, vehicles, addSlot, updateSlot, deleteSlot, currentUser, showToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  // State Management
  const [activeFloor, setActiveFloor] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vehicleFilter, setVehicleFilter] = useState<'All' | 'Car' | 'Bike' | 'Truck'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | SlotStatus>('All');

  // Creating Slot dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNumber, setNewNumber] = useState<number>(101);
  const [newFloor, setNewFloor] = useState<number>(0);
  const [newType, setNewType] = useState<VehicleType>('Car');
  const [newRate, setNewRate] = useState<number>(12);

  // Editing Slot dialog state
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);

  // Filters calculation
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Floor filter matches the visual section selected
      const matchesFloor = slot.floor === activeFloor;
      
      // Query filter searches slot ID or plate coordinates
      const matchesSearch = slot.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter matches
      const matchesType = vehicleFilter === 'All' || slot.vehicleType === vehicleFilter;

      // Status Filter matches
      const matchesStatus = statusFilter === 'All' || slot.status === statusFilter;

      return matchesFloor && matchesSearch && matchesType && matchesStatus;
    });
  }, [slots, activeFloor, searchQuery, vehicleFilter, statusFilter]);

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNumber <= 0) {
      showToast('Number must be positive!', 'warning');
      return;
    }
    if (newRate <= 0) {
      showToast('Rate must be positive!', 'warning');
      return;
    }

    addSlot({
      floor: newFloor,
      number: newNumber,
      vehicleType: newType,
      status: 'Available',
      hourlyRate: newRate
    });

    setIsAddOpen(false);
  };

  const handleEditSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    if (editingSlot.hourlyRate <= 0) {
      showToast('Rate must be positive!', 'warning');
      return;
    }

    updateSlot(editingSlot);
    setEditingSlot(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Header toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Interactive Lot Directory</h2>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
              <Layers className="text-indigo-600 dark:text-indigo-400 w-5 h-5 md:w-6 md:h-6" /> Parking Bay layout map
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                placeholder="Search slot ID (e.g. A-101)..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 max-w-xs focus:outline-hidden"
              />
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <PlusCircle className="w-4 h-4" /> Add Parking Slot
              </button>
            )}
          </div>
        </div>

        {/* Filters bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap items-center justify-between gap-4">
          {/* Floor level tabs selector */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-xs font-medium border border-slate-100 dark:border-slate-850">
            {([0, 1, 2] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveFloor(lvl)}
                className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeFloor === lvl
                    ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {lvl === 0 ? 'Ground' : `Floor ${lvl}`}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Type:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value as any)}
                className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-semibold focus:outline-hidden"
              >
                <option value="All">All Types</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="p-1 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-semibold focus:outline-hidden"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Visual map indicators legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 p-3.5 px-6 rounded-xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available</span>
        <span className="flex items-center gap-1.5 font-semibold"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Occupied (Active)</span>
        <span className="flex items-center gap-1.5 font-semibold"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Reserved (Ticketed)</span>
        <span className="flex items-center gap-1.5 font-semibold"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Maintenance</span>
      </div>

      {/* Slots grid list */}
      {filteredSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Building className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">No slots match</h3>
          <p className="text-xs text-slate-450 mt-1 max-w-sm">No slots found matching your current floor configuration search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredSlots.map((slot) => {
            let statusColor = 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400';
            let dotColor = 'bg-emerald-500';

            if (slot.status === 'Occupied') {
              statusColor = 'border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-400';
              dotColor = 'bg-indigo-500';
            } else if (slot.status === 'Reserved') {
              statusColor = 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400';
              dotColor = 'bg-amber-500';
            } else if (slot.status === 'Maintenance') {
              statusColor = 'border-slate-200 bg-slate-50/40 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400';
              dotColor = 'bg-slate-400';
            }

            // Lookup active parked vehicle or active reservation ticket
            let occupantName = '';
            let occupantPlate = '';

            if (slot.status === 'Occupied') {
              const activeVehicle = vehicles.find((v) => v.slotId === slot.id && v.status === 'parked');
              if (activeVehicle) {
                occupantName = activeVehicle.vehicleName || 'Standard Car';
                occupantPlate = activeVehicle.vehicleNumber;
              }
            } else if (slot.status === 'Reserved') {
              const activeBooking = bookings.find((b) => b.slotId === slot.id && b.status === 'active');
              if (activeBooking) {
                occupantName = activeBooking.vehicleName || 'Standard Car';
                occupantPlate = activeBooking.vehicleNumber;
              }
            }

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border-2 shadow-xs flex flex-col justify-between transition-all group ${statusColor}`}
              >
                {/* ID Header level */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-tight uppercase">Bay {slot.id}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">{slot.vehicleType}</span>
                </div>

                {/* Subdetails content */}
                <div className="mt-3 mb-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                      <span className="text-[10px] font-black tracking-wider uppercase">{slot.status}</span>
                    </div>

                    {occupantName ? (
                      <div className="mt-2 p-1.5 rounded-xl bg-white/70 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 shadow-xs">
                        <div className="text-[10px] font-black text-slate-800 dark:text-slate-100 truncate" title={occupantName}>
                          🚗 {occupantName}
                        </div>
                        <div className="text-[9px] font-bold tracking-widest font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 uppercase">
                          {occupantPlate}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold mt-1 opacity-80">${slot.hourlyRate}/hr</p>
                    )}
                  </div>
                </div>

                {/* Admin context shortcuts */}
                {isAdmin ? (
                  <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-900 pb-0.5 pt-2 mt-1">
                    <button
                      onClick={() => setEditingSlot(slot)}
                      className="p-1 px-2 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-bold border border-slate-150 dark:border-slate-800 transition-colors cursor-pointer"
                    >
                      Config
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove slot allocation ${slot.id} completely?`)) {
                          deleteSlot(slot.id);
                        }
                      }}
                      title="Remove Slot"
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-[9px] font-semibold opacity-60 text-right mt-1 uppercase">
                    F{slot.floor} Grid Pos
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Dialog Modal */}
      {isAddOpen && (
        <div id="add-slot-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2 mb-4 flex items-center gap-2">
              <PlusCircle className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
              Add Parking Slot
            </h3>

            <form onSubmit={handleAddSlotSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Floor Level
                  </label>
                  <select
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-semibold"
                  >
                    <option value={0}>Ground Floor (0)</option>
                    <option value={1}>Floor 1</option>
                    <option value={2}>Floor 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Bay Number
                  </label>
                  <input
                    type="number"
                    min={101}
                    max={999}
                    required
                    value={newNumber}
                    onChange={(e) => setNewNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Suitable Vehicle Class
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Car', 'Bike', 'Truck'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                        newType === type
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold'
                          : 'border-slate-200 text-slate-500 dark:border-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-550 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-500 rounded-xl text-xs cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Slot Dialog Modal */}
      {editingSlot && (
        <div id="edit-slot-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2 mb-4 flex items-center gap-2">
              <PenTool className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
              Configure Slot {editingSlot.id}
            </h3>

            <form onSubmit={handleEditSlotSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Current Status
                </label>
                <select
                  value={editingSlot.status}
                  onChange={(e) => setEditingSlot({ ...editingSlot, status: e.target.value as SlotStatus })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-semibold"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Hourly Price ($)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editingSlot.hourlyRate}
                  onChange={(e) => setEditingSlot({ ...editingSlot, hourlyRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-550 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-500 rounded-xl text-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
