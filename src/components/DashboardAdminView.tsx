import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building, LockOpen, ShieldAlert, Coins, Car, Users, TrendingUp, ArrowUpRight, CheckCircle, AlertOctagon } from 'lucide-react';

export const DashboardAdminView: React.FC = () => {
  const { slots, bookings, vehicles, payments, navigateTo } = useApp();

  const stats = useMemo(() => {
    const totalSpaces = slots.length;
    const available = slots.filter((s) => s.status === 'Available').length;
    const occupied = slots.filter((s) => s.status === 'Occupied').length;
    const reserved = slots.filter((s) => s.status === 'Reserved').length;
    const maintenance = slots.filter((s) => s.status === 'Maintenance').length;

    const totalRevenue = payments
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + p.grandTotal, 0);

    const activeVehicles = vehicles.filter((v) => v.status === 'parked').length;

    // Occupancy rate calculation
    const occupancyRate = totalSpaces > 0 ? Math.round(((occupied + reserved) / totalSpaces) * 100) : 0;

    return {
      totalSpaces,
      available,
      occupied,
      reserved,
      maintenance,
      totalRevenue,
      activeVehicles,
      occupancyRate
    };
  }, [slots, payments, vehicles]);

  // Aggregate recent activities
  const recentActivities = useMemo(() => {
    // Combine checked-in vehicles and new bookings, sort by timestamp
    const activities = [
      ...vehicles.map((v) => ({
        id: v.id,
        type: 'vehicle_arrival',
        title: `Vehicle Check-In`,
        desc: `${v.vehicleNumber} (${v.vehicleType}) - ${v.ownerName}`,
        time: v.entryTime,
        status: v.status === 'parked' ? 'Active' : 'Completed',
        badgeColor: v.status === 'parked' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
      })),
      ...bookings.map((b) => ({
        id: b.id,
        type: 'booking_created',
        title: `Slot Reservation`,
        desc: `Booking for ${b.vehicleNumber} at Slot ${b.slotId}`,
        time: b.startTime,
        status: b.status,
        badgeColor: b.status === 'active' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : b.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
      }))
    ];

    // Sort descending
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [vehicles, bookings]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 p-6 md:p-8 text-white shadow-lg shadow-indigo-600/10 dark:from-indigo-950 dark:to-slate-900 border border-indigo-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">System Administration dashboard</h2>
            <p className="mt-1.5 text-xs text-indigo-100/80 font-medium">
              Monitor layout availability, perform live vehicle checking operations, and audit financial payments in real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigateTo('vehicles')}
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Check-In Vehicle
            </button>
            <button
              onClick={() => navigateTo('parking-slots')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 border border-indigo-400/30 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Configure Slots
            </button>
          </div>
        </div>
      </div>

      {/* Main statistics cards layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total revenue */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Net Cash Revenue</p>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              +14.2% from yesterday
            </span>
          </div>
        </div>

        {/* Available spaces */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
            <LockOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Available Slots</p>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.available} <span className="text-xs font-medium text-slate-400">/ {stats.totalSpaces} total</span>
            </h3>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-sky-500 h-full"
                style={{ width: `${stats.totalSpaces > 0 ? (stats.available / stats.totalSpaces) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Live parked vehicles */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Active Parked</p>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.activeVehicles} vehicles
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
              Currently using parking resources
            </span>
          </div>
        </div>

        {/* Occupancy factor */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Live Occupancy</p>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.occupancyRate}%
            </h3>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of detailed activities & slot breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Slot status distributions */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Status Allocation
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
                <span>{stats.available} slots ({stats.totalSpaces > 0 ? Math.round((stats.available / stats.totalSpaces) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-lg overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${stats.totalSpaces > 0 ? (stats.available / stats.totalSpaces) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Occupied</span>
                <span>{stats.occupied} slots ({stats.totalSpaces > 0 ? Math.round((stats.occupied / stats.totalSpaces) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-lg overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${stats.totalSpaces > 0 ? (stats.occupied / stats.totalSpaces) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved</span>
                <span>{stats.reserved} slots ({stats.totalSpaces > 0 ? Math.round((stats.reserved / stats.totalSpaces) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-lg overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${stats.totalSpaces > 0 ? (stats.reserved / stats.totalSpaces) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Maintenance</span>
                <span>{stats.maintenance} slots ({stats.totalSpaces > 0 ? Math.round((stats.maintenance / stats.totalSpaces) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-lg overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${stats.totalSpaces > 0 ? (stats.maintenance / stats.totalSpaces) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30">
            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Auto checkout note
            </h4>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-300/80 mt-1.5 leading-relaxed">
              When a vehicle logs checkout, the server releases resources and updates totals immediately. Go to "Vehicle Logs" to perform actions.
            </p>
          </div>
        </div>

        {/* Right column: Recent activities logs */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Recent Activity Trace
            </h3>
            <span className="text-[10px] font-bold text-indigo-500">Live feed</span>
          </div>

          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-sm">No recent trace activities logged yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div
                  key={act.id + act.type}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-xs font-bold ${
                      act.type === 'vehicle_arrival'
                        ? 'bg-sky-100 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400'
                        : 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {act.type === 'vehicle_arrival' ? 'MOVE' : 'BOOK'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{act.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-sm uppercase tracking-wider ${act.badgeColor}`}>
                      {act.status}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
