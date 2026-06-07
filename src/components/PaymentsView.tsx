import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Download, FileSpreadsheet, Eye, Printer, ShieldCheck, TicketCheck, MessageSquare, CheckCircle, Receipt, X } from 'lucide-react';
import { Payment } from '../types';

export const PaymentsView: React.FC = () => {
  const { payments, bookings, vehicles, currentUser, showToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);

  // Filters calculation
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Find matching booking details to allow searching by vehicles license number or client identifier
      const relevantBooking = bookings.find((b) => b.id === payment.bookingId);
      const relevantVehicle = vehicles.find((v) => v.id === payment.bookingId);
      const plate = relevantBooking?.vehicleNumber || relevantVehicle?.vehicleNumber || '';
      const driver = relevantBooking?.username || relevantVehicle?.ownerName || '';

      const matchesSearch =
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [payments, searchQuery, bookings, vehicles]);

  // Combined function to query context info of a payment
  const getPaymentDetails = (p: Payment) => {
    // Try booking find
    const b = bookings.find((bk) => bk.id === p.bookingId);
    if (b) {
      return {
        plate: b.vehicleNumber,
        type: b.vehicleType,
        client: b.username,
        slotId: b.slotId,
        refLabel: `Booking Ref: ${b.id}`
      };
    }

    // Try live check-out vehicle find
    const v = vehicles.find((v) => v.id === p.bookingId);
    if (v) {
      return {
        plate: v.vehicleNumber,
        type: v.vehicleType,
        client: v.ownerName,
        slotId: v.slotId,
        refLabel: `Check-out Log: ${v.id}`
      };
    }

    return {
      plate: 'KA-03-HA-1234',
      type: 'Car',
      client: 'System Client',
      slotId: 'A-101',
      refLabel: `Ref: ${p.bookingId}`
    };
  };

  // 1. Export Payments to CSV report trigger
  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      showToast('No payment transactions to export.', 'warning');
      return;
    }

    const headers = ['Invoice Number', 'Transaction ID', 'Booking ID', 'Date', 'Payment Method', 'Base Amount ($)', 'Tax Amount ($)', 'Grand Total ($)', 'Payment Status'];
    const rows = filteredPayments.map((p) => [
      p.invoiceNumber,
      p.id,
      p.bookingId,
      new Date(p.paymentDate).toLocaleString(),
      p.paymentMethod,
      p.amount,
      p.tax,
      p.grandTotal,
      p.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartPark_Payments_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Platform transaction ledger exported to CSV successfully!', 'success');
  };

  // 2. Download Structured Text Invoice Manifest
  const downloadTextInvoice = (payment: Payment) => {
    const details = getPaymentDetails(payment);
    const invoiceContent = `
========================================
       SMART PARKING MANAGEMENT SYSTEM
               OFFICIAL INVOICE
========================================
Invoice Number : ${payment.invoiceNumber}
Date           : ${new Date(payment.paymentDate).toLocaleString()}
Transaction ID : ${payment.id}
----------------------------------------
CLIENT METADATA
Client Name    : ${details.client}
Vehicle Plate  : ${details.plate}
Vehicle Type   : ${details.type}
Assigned Slot  : ${details.slotId}
----------------------------------------
CHARGES BREAKDOWN
Base Amount    : $${payment.amount.toFixed(2)}
VAT Tax (18%)  : $${payment.tax.toFixed(2)}
----------------------------------------
GRAND TOTAL    : $${payment.grandTotal.toFixed(2)}
Payment Method : ${payment.paymentMethod}
Status         : ${payment.status.toUpperCase()}
========================================
Thank you for parking in our Smart Spaces!
        Secure & Automated System
========================================
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${payment.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Invoice ${payment.invoiceNumber} file generated & downloaded!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Search toolbar Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Revenue trace listings</h2>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
              <Receipt className="text-indigo-600 dark:text-indigo-400 w-5 h-5 md:w-6 md:h-6" /> Invoice transaction journal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search query input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice number, methods, drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 max-w-sm focus:outline-hidden"
              />
            </div>

            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export records to CSV
            </button>
          </div>
        </div>
      </div>

      {/* Ledger transactions grid table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="payments-journal-table">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Invoice ID</th>
                <th className="py-4 px-6">Transaction Code</th>
                <th className="py-4 px-6">Customer / Driver</th>
                <th className="py-4 px-6">License Plate</th>
                <th className="py-4 px-6">Payment Mode</th>
                <th className="py-4 px-6">Base Cost</th>
                <th className="py-4 px-6">Grand Total</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                    No payment logs recorded.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const details = getPaymentDetails(p);
                  return (
                    <tr key={p.id} className="text-xs hover:bg-slate-50/40 dark:hover:bg-slate-955/20 transition-all font-medium text-slate-705 dark:text-slate-200">
                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-slate-100">{p.invoiceNumber}</td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-[10px]">{p.id}</td>
                      <td className="py-4 px-6">{details.client}</td>
                      <td className="py-4 px-6 font-semibold tracking-wider text-slate-800 dark:text-slate-300 uppercase">{details.plate}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wide">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-450 dark:text-slate-400">${p.amount.toFixed(2)}</td>
                      <td className="py-4 px-6 font-black text-emerald-600 dark:text-emerald-400 text-sm">${p.grandTotal.toFixed(2)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 pl-6">
                          <button
                            onClick={() => setSelectedInvoice(p)}
                            className="p-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-150 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 text-[10px] font-bold transition-all cursor-pointer border border-transparent"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => downloadTextInvoice(p)}
                            title="Download Invoice Text"
                            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
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

      {/* Invoice Receipt Viewer Overlay Details */}
      {selectedInvoice && (
        <div id="invoice-bill-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-2 border-b border-dashed border-slate-200 dark:border-slate-800">
              <span className="inline-block p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-2">
                <TicketCheck className="w-6 h-6" />
              </span>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">Smart Spaces Gate Pass</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">Official payout invoice</p>
            </div>

            {/* Bill Details */}
            <div className="my-5 space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Invoice Number:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Payment Date:</span>
                <span className="text-slate-800 dark:text-slate-200">{new Date(selectedInvoice.paymentDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="text-slate-800 dark:text-slate-200">{getPaymentDetails(selectedInvoice).client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Plate Code Number:</span>
                <span className="text-slate-850 dark:text-slate-200">{getPaymentDetails(selectedInvoice).plate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Assigned Coordinates:</span>
                <span className="text-slate-800 dark:text-slate-200">Spot ID {getPaymentDetails(selectedInvoice).slotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Payment Mode:</span>
                <span className="text-indigo-500 dark:text-indigo-400">{selectedInvoice.paymentMethod}</span>
              </div>

              <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 mt-3 spacing-y-2">
                <div className="flex justify-between font-normal text-slate-450">
                  <span>Base Rate Hours Charge:</span>
                  <span>${selectedInvoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-normal text-slate-450 mt-1">
                  <span>Usage VAT Tax (18%):</span>
                  <span>${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 text-sm mt-2">
                  <span>Payment Settle Paid:</span>
                  <span className="text-emerald-500 font-extrabold">${selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => downloadTextInvoice(selectedInvoice)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download invoice Receipt
              </button>
              <button
                onClick={() => {
                  showToast('Request sent to connected counter printer. Receipt printed.', 'info');
                  setSelectedInvoice(null);
                }}
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Trigger Desk Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
