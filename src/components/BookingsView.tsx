import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, CalendarDays, Filter, Eye, AlertTriangle, CheckSquare, Coins, X } from 'lucide-react';
import { Booking, BookingStatus, PaymentMethod } from '../types';
import { QRGenerator } from './QRGenerator';

export const BookingsView: React.FC = () => {
  const { bookings, slots, cancelBooking, completeBooking, currentUser, showToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [activeQRBooking, setActiveQRBooking] = useState<Booking | null>(null);

  // Settlement flow
  const [settlingBooking, setSettlingBooking] = useState<Booking | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');

  // Filters calculation
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Role checking protection
      const isOwner = isAdmin || b.userId === currentUser?.id;
      if (!isOwner) return false;

      const matchesSearch =
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slotId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter, isAdmin, currentUser]);

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingBooking) return;

    completeBooking(settlingBooking.id, payMethod);
    setSettlingBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and control shell */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Reservation logs Ledger</h2>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
              <CalendarDays className="text-indigo-600 dark:text-indigo-400 w-5 h-5 md:w-6 md:h-6" /> Platform Booking Directory
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                placeholder="Search plate, spot, username..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 max-w-sm focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-855 flex items-center gap-3 text-xs font-semibold text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Ticket Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden font-bold"
          >
            <option value="All">All configurations</option>
            <option value="active">Active (Reserved)</option>
            <option value="completed">Completed (Paid)</option>
            <option value="cancelled">Cancelled (Voided)</option>
          </select>
        </div>
      </div>

      {/* Bookings table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="bookings-table">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Booking Code</th>
                <th className="py-4 px-6">Driver / Customer</th>
                <th className="py-4 px-6">Plate Number</th>
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6">Bay Level</th>
                <th className="py-4 px-6">Quote Estimated</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                    No bookings logged on this account matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isActive = b.status === 'active';
                  return (
                    <tr key={b.id} className="text-xs hover:bg-slate-50/40 dark:hover:bg-slate-955/20 transition-all font-medium text-slate-700 dark:text-slate-250">
                      <td className="py-2.5 px-6 font-extrabold tracking-widest">{b.id}</td>
                      <td className="py-4 px-6">{b.username}</td>
                      <td className="py-4 px-6 font-semibold tracking-wider uppercase text-slate-900 dark:text-slate-100">{b.vehicleNumber}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-850 text-[9px] font-bold text-slate-500 uppercase tracking-wide w-max">
                            {b.vehicleType}
                          </span>
                          <span className="text-[11px] font-extrabold text-indigo-650 dark:text-indigo-400">
                            {b.vehicleName || 'Standard'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-indigo-600 dark:text-indigo-400">{b.slotId}</td>
                      <td className="py-4 px-6 font-semibold">${b.estimatedCost} <span className="text-[10px] text-slate-400 font-medium">({b.durationHours} hrs)</span></td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          b.status === 'active'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30'
                            : b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-955/30 bg-rose-50'
                        }`}>
                          {b.status === 'active' ? 'Active' : b.status === 'completed' ? 'Settled' : 'Void'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 pl-4">
                          {isActive && (
                            <button
                              onClick={() => setActiveQRBooking(b)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer border border-transparent"
                            >
                              <Eye className="w-3 h-3" /> Ticket Pass
                            </button>
                          )}

                          {isActive && isAdmin && (
                            <button
                              onClick={() => setSettlingBooking(b)}
                              className="p-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              Settle payment
                            </button>
                          )}

                          {isActive && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to void and cancellation active slot reservation ${b.id}?`)) {
                                  cancelBooking(b.id);
                                }
                              }}
                              className="p-1 px-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-455 font-bold rounded-lg text-[10px] transition-all cursor-pointer border border-transparent"
                            >
                              Void
                            </button>
                          )}

                          {!isActive && (
                            <span className="text-[10px] text-slate-400 font-bold uppercase leading-loose tracking-wider">Trace lock</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Pass View Modal */}
      {activeQRBooking && (
        <div id="ticket-pass-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative text-center">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest leading-loose">Validated Entry Ticket</h4>
            <h3 className="text-md font-extrabold text-slate-800 dark:text-slate-100 mt-1">Smart Gate Pass</h3>

            <div className="my-6">
              <QRGenerator value={activeQRBooking.qrCode} size={150} />
            </div>

            <div className="space-y-2 text-xs text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-205 text-xs pb-1 border-b border-slate-200 dark:border-slate-800 mb-2">
                <span>Ref Number: {activeQRBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target slot:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Spot {activeQRBooking.slotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Model:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{activeQRBooking.vehicleName || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License Plate:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeQRBooking.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Type:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{activeQRBooking.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration Reserve:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeQRBooking.durationHours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Estimated Cost:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">${activeQRBooking.estimatedCost}</span>
              </div>
            </div>

            {/* Simulate gate entry action */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  showToast('Ticket validated! Gate opening trace success.', 'success');
                  setActiveQRBooking(null);
                }}
                className="w-full py-2.5 bg-indigo-600 font-bold hover:bg-indigo-505 text-white rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
              >
                Scan Ticket Entry
              </button>
              <button
                onClick={() => setActiveQRBooking(null)}
                className="w-full py-2 hover:bg-slate-100 text-slate-400 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Dismiss View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Payment dialog */}
      {settlingBooking && (
        <div id="booking-settle-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2 mb-4 flex items-center gap-2">
              <Coins className="text-indigo-600 dark:text-indigo-400 w-5 h-5 animate-bounce" />
              Settle payment Booking
            </h3>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 p-4 rounded-xl dark:bg-slate-950 font-medium">
                <div className="flex justify-between font-bold text-slate-850 dark:text-slate-200 text-sm mb-2">
                  <span>Ref: {settlingBooking.id}</span>
                  <span>Spot: {settlingBooking.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicle context:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{settlingBooking.vehicleName || 'Standard'} &bull; {settlingBooking.vehicleNumber} ({settlingBooking.vehicleType})</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{settlingBooking.durationHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Parking Cost:</span>
                  <span className="font-bold text-slate-705 dark:text-slate-350 font-semibold">${settlingBooking.estimatedCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vat Tax (18%):</span>
                  <span className="font-bold text-slate-705 dark:text-slate-350 font-semibold">${(settlingBooking.estimatedCost * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-150 dark:border-slate-800 my-1 pt-1.5 flex justify-between text-slate-805 dark:text-slate-100 font-extrabold text-sm">
                  <span>Grand Total due:</span>
                  <span className="text-emerald-500 font-black">${(settlingBooking.estimatedCost * 1.18).toFixed(2)}</span>
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
                      onClick={() => setPayMethod(method)}
                      className={`py-2 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                        payMethod === method
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-black'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
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
                  onClick={() => setSettlingBooking(null)}
                  className="px-4 py-2 hover:bg-slate-550 text-slate-550 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-extrabold hover:bg-emerald-505 rounded-xl text-xs transition-transform cursor-pointer"
                >
                  Settle Payment Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
