import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Camera, RefreshCw, CheckCircle, AlertTriangle, 
  Search, Upload, CreditCard, Sparkles, AlertOctagon,
  FolderSync, HelpCircle, ArrowRight, ShieldCheck, Check,
  ExternalLink
} from 'lucide-react';
import jsQR from 'jsqr';
import { Booking, PaymentMethod } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { bookings, slots, completeBooking, showToast } = useApp();

  // Core capture and stream states
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [permissionAlert, setPermissionAlert] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scanning results
  const [scannedValue, setScannedValue] = useState<string>('');
  const [matchedBooking, setMatchedBooking] = useState<Booking | null>(null);
  const [scanResultStatus, setScanResultStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Settlement flow within the verified ticket view
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Video and Canvas references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter list of active bookings for the interactive live simulator dropdown
  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'active');
  }, [bookings]);

  // Handle resetting scan results
  const resetScannerState = () => {
    setScannedValue('');
    setMatchedBooking(null);
    setScanResultStatus('idle');
    setIsSettling(false);
  };

  // Safe camera lifecycle management
  useEffect(() => {
    if (!isOpen || !cameraActive || scanResultStatus !== 'idle') return;
    
    let stream: MediaStream | null = null;
    let isActive = true;

    async function startCamera() {
      try {
        setCameraError(false);
        setPermissionAlert(false);
        
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        
        if (isActive && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          
          // Play video with resilience against auto-play policy blocks
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Direct play blocked. Waiting for video load state.", playErr);
          }
        }
      } catch (err: any) {
        console.error("Camera stream retrieval failed:", err);
        if (isActive) {
          setCameraError(true);
          // If permission is denied or blocked by sandbox constraints
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.toLowerCase().includes('permission')) {
            setPermissionAlert(true);
          }
        }
      }
    }

    startCamera();

    // Set up continuous background scanner interval over the video feed
    const scanInterval = setInterval(() => {
      if (!isActive || !videoRef.current || !canvasRef.current || scanResultStatus !== 'idle') return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Adjust canvas viewport to match incoming video frame details
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (qrCode && qrCode.data) {
              handleCodeMatch(qrCode.data);
            }
          } catch (canvasErr) {
            // Squelch background draw failures during component teardowns
          }
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearInterval(scanInterval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, cameraActive, scanResultStatus]);

  // Main logic checking candidate data strings against bookings
  const handleCodeMatch = (codeValue: string) => {
    const trimmed = codeValue.trim();
    if (!trimmed) return;

    // Find a valid matches (case-insensitive)
    const matchingBooking = bookings.find(
      b => b.id.toLowerCase() === trimmed.toLowerCase() || 
           b.vehicleNumber.toLowerCase() === trimmed.toLowerCase()
    );

    setScannedValue(trimmed);
    if (matchingBooking) {
      setMatchedBooking(matchingBooking);
      setScanResultStatus('success');
      showToast(`✅ Scanned & Verified Booking ID: ${matchingBooking.id}`, 'success');
    } else {
      setMatchedBooking(null);
      setScanResultStatus('error');
      showToast(`❌ Unknown Booking code scanned: "${trimmed}"`, 'error');
    }
  };

  // Handle drop-file uploads
  const handleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        
        const context = tempCanvas.getContext('2d');
        if (context) {
          context.drawImage(img, 0, 0);
          try {
            const imageData = context.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (qrCode && qrCode.data) {
              handleCodeMatch(qrCode.data);
            } else {
              showToast("Error: No valid high-contrast QR matrix detected. Try another file.", "error");
            }
          } catch (canvasErr) {
            showToast("Failed to parse uploaded image bytes.", "error");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Perform immediate inline checkout settlement
  const handleBookingCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedBooking) return;

    completeBooking(matchedBooking.id, paymentMethod);
    showToast(`💰 Payment of $${matchedBooking.estimatedCost} settled via ${paymentMethod}!`, 'success');
    
    // Auto refresh local screen booking details
    const updated = bookings.find(b => b.id === matchedBooking.id);
    if (updated) {
      setMatchedBooking(updated);
    } else {
      // Manual sync
      setMatchedBooking({ ...matchedBooking, status: 'completed' });
    }
    setIsSettling(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-10"
            id="qr-scanner-modal"
          >
            {/* Header branding */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-150/20">
                  <Camera className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Gate Scan Terminal</h3>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white mt-1">Verify Reservation QR</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                id="close-scanner-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content box splits between active scanner and validation results */}
            <div className="p-6 space-y-6">
              {scanResultStatus === 'idle' ? (
                // VIEW 1: ACTIVE LIVE SCANNER SCREEN
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Device Camera Feed Screen Frame */}
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    <div className="relative border border-slate-200 dark:border-slate-850 bg-slate-950 rounded-2xl aspect-video overflow-hidden group shadow-lg">
                      
                      {/* Live Canvas context for decoding */}
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Video Stream */}
                      {cameraActive && !cameraError && (
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
                          muted
                          playsInline
                        />
                      )}

                      {/* Camera HUD alignment frame & laser lines */}
                      {cameraActive && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/10">
                          {/* Pulsing neon target box */}
                          <div className="relative w-48 h-48 border-2 border-dashed border-indigo-450/40 rounded-2xl flex items-center justify-center">
                            
                            {/* Brackets around corners */}
                            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-indigo-500 -mt-[3px] -ml-[3px] rounded-tl-md"></div>
                            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-indigo-500 -mt-[3px] -mr-[3px] rounded-tr-md"></div>
                            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-indigo-500 -mb-[3px] -ml-[3px] rounded-bl-md"></div>
                            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-indigo-500 -mb-[3px] -mr-[3px] rounded-br-md"></div>

                            {/* Laser scan horizontal line */}
                            <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-indigo-450 to-transparent shadow-[0_0_12px_#6366f1] animate-[pulse_1.5s_infinite] top-1/2"></div>
                          </div>
                          
                          <span className="mt-4 text-[10px] font-black uppercase tracking-wider text-white/70 backdrop-blur-md bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
                            Align QR code inside framework boundaries
                          </span>
                        </div>
                      )}

                      {/* Camera Alert Placeholder Screen if Denied / Error */}
                      {(cameraError || !cameraActive) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                            <AlertTriangle className="w-8 h-8" />
                          </div>
                          <div className="space-y-1 max-w-sm">
                            <h4 className="text-sm font-extrabold text-white">
                              {permissionAlert ? 'Camera Permission Locked' : 'Camera Feed Offline'}
                            </h4>
                            <p className="text-xs text-slate-400 leading-snug">
                              {permissionAlert 
                                ? 'The application iframe is restricted from initializing the device hardware camera. Click the link below to open the application in a new tab, or use our instant simulator options below!' 
                                : 'Unable to lock connection on media device webcam. Connect standard USB video sources or proceed using direct local files.'}
                            </p>
                            {permissionAlert && (
                              <a
                                href={typeof window !== 'undefined' ? window.location.origin : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-slate-900 border border-indigo-400/30 font-bold text-white text-xs rounded-xl transition-all shadow-sm cursor-pointer mt-2"
                                id="scanner-open-tab-btn"
                              >
                                <ExternalLink className="w-4 h-4" /> Open App in New Tab
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Camera Control action row */}
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <button
                        onClick={() => setCameraActive(!cameraActive)}
                        className={`font-semibold flex items-center gap-1.5 transition-all text-slate-500 dark:text-slate-400 ${cameraActive ? 'hover:text-slate-800' : 'text-indigo-500'}`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${cameraActive ? 'rotate-120' : ''}`} />
                        {cameraActive ? 'Turn Off Video Feed' : 'Launch Web Camera'}
                      </button>

                      <span className="text-[10px] text-slate-400">
                        Resolution auto scale: 640x480 (Safe standard)
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Dynamic fallbacks, file selector & testing simulators */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                    
                    {/* File drop container for scanning */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center space-y-3 relative group transition-all hover:border-indigo-400/50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileScan}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 inline-block">
                        <Upload className="w-5 h-5 mx-auto" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Upload Ticket Image</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                          Drag and drop or select a snapshot of any active QR ticket pass structure.
                        </p>
                      </div>
                    </div>

                    {/* Direct Code Input Box */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Manual Code Input</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter Booking ID (e.g. B-01)"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden rounded-xl text-slate-800 dark:text-white"
                          />
                        </div>
                        <button
                          onClick={() => handleCodeMatch(searchQuery)}
                          disabled={!searchQuery}
                          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                    </div>

                    {/* Quick Simulation Testing Tray */}
                    <div className="p-4 bg-indigo-50/55 dark:bg-indigo-950/15 border border-indigo-100/40 dark:border-indigo-900/10 rounded-2xl">
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 font-bold mb-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Interactive Test Simulator</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-snug mb-3">
                        Testing in iframe environment is difficult. Quickly trigger scanning for any active bookings below to verify.
                      </p>

                      {activeBookings.length === 0 ? (
                        <div className="text-[10px] text-amber-600 dark:text-amber-450 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          No active bookings available to test checkout simulation. Place an order on the user screen first!
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {activeBookings.slice(0, 4).map((b) => (
                            <button
                              key={b.id}
                              onClick={() => {
                                showToast(`🔮 Simulator: Loading ${b.id} QR matrix into virtual scanner...`, 'info');
                                setTimeout(() => handleCodeMatch(b.id), 550);
                              }}
                              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 hover:border-indigo-400 dark:hover:border-indigo-900 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-350 flex justify-between items-center transition-all group/btn"
                            >
                              <div className="truncate pr-2">
                                <span className="font-black text-indigo-600 dark:text-indigo-400 tracking-wider block">{b.id}</span>
                                <span className="text-[9.5px] text-slate-400 block">{b.username} / {b.vehicleNumber}</span>
                              </div>
                              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 py-0.5 px-2 rounded-md font-bold group-hover/btn:bg-indigo-500 group-hover/btn:text-white transition-all shrink-0">
                                Simulated Scan &rarr;
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ) : (
                // VIEW 2: VERIFICATION RESULTS PANEL (SUCCESS OR ERROR MATCH)
                <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50/45 dark:bg-slate-950/20">
                  {scanResultStatus === 'success' && matchedBooking ? (
                    // SUCCESS DECODED SUBVIEW
                    <div className="p-6 space-y-6">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                          <ShieldCheck className="w-8 h-8 animate-bounce" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            Security Verified
                          </span>
                          <h3 className="text-lg font-black text-slate-800 dark:text-white mt-2">
                            Valid Booking Confirmed
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-850 py-6">
                        <div className="space-y-4">
                          <div className="text-xs">
                            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[9.5px]">Booking Identifier</span>
                            <span className="font-extrabold text-slate-800 dark:text-white text-sm tracking-widest">{matchedBooking.id}</span>
                          </div>

                          <div className="text-xs">
                            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[9.5px]">Full Name / Driver</span>
                            <span className="font-semibold text-slate-800 dark:text-white text-sm">{matchedBooking.username}</span>
                          </div>

                          <div className="text-xs">
                            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[9.5px]">License Plate</span>
                            <span className="font-extrabold text-indigo-650 dark:text-indigo-450 text-sm tracking-wider uppercase">
                              {matchedBooking.vehicleNumber}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="text-xs">
                            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[9.5px]">Assigned Parking Spot</span>
                            <span className="font-black text-slate-850 dark:text-white text-sm bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 px-3 py-0.5 rounded-lg inline-block">
                              Slot ID: {matchedBooking.slotId}
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[9.5px]">Duration / Estimate</span>
                            <span className="font-semibold text-slate-800 dark:text-white text-sm">
                              {matchedBooking.durationHours} hrs <span className="text-slate-400">(${matchedBooking.estimatedCost} total value)</span>
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="text-slate-400 font-medium block uppercase tracking-wider text-[9.5px]">Ticket Active Status</span>
                            <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              matchedBooking.status === 'active' 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/45 dark:text-amber-400 border border-amber-200/50' 
                                : matchedBooking.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400 border border-emerald-200/50'
                                : 'bg-rose-100 text-rose-750 dark:bg-rose-955/45 dark:text-rose-455 border'
                            }`}>
                              {matchedBooking.status === 'active' ? 'Active Reservation' : matchedBooking.status === 'completed' ? 'Cleared & Settled' : 'Cancelled / Expired'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Settle Bill Option row */}
                      {matchedBooking.status === 'active' ? (
                        <div className="space-y-4">
                          {isSettling ? (
                            <form onSubmit={handleBookingCheckout} className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm animate-fadeIn">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-indigo-500" /> Confirm Gate Payment Settlement
                              </h4>
                              <div className="grid grid-cols-3 gap-3">
                                {(['UPI', 'Credit Card', 'Cash'] as PaymentMethod[]).map((method) => (
                                  <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-3 text-xs border rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-bold ${paymentMethod === method ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-300 text-slate-600 dark:text-slate-400'}`}
                                  >
                                    <span>{method === 'UPI' ? '📱' : method === 'Credit Card' ? '💳' : '💵'}</span>
                                    <span>{method}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsSettling(false)}
                                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                  Cancel Settle
                                </button>
                                <button
                                  type="submit"
                                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Check className="w-4 h-4" /> Finalize Cashier Check-Out
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => setIsSettling(true)}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent"
                              >
                                <CreditCard className="w-4 h-4" /> Pay & Checkout at Gate
                              </button>
                              <button
                                onClick={resetScannerState}
                                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition-all cursor-pointer"
                              >
                                Scan Another Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> Already Settled / Inactive
                          </div>
                          <button
                            onClick={resetScannerState}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                          >
                            Scan Next QR Code
                          </button>
                        </div>
                      )}

                    </div>
                  ) : (
                    // SCAN FAILED RED CARD ALERT
                    <div className="p-8 text-center space-y-4">
                      <div className="w-16 h-16 bg-rose-500/10 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto text-rose-500">
                        <AlertOctagon className="w-8 h-8" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider">
                          QR Code Recognition Failure
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          We parsed code string <strong className="text-slate-800 dark:text-white italic bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-205 dark:border-slate-850">"{scannedValue}"</strong> successfully, but no active booking has this ID in our parking directory database.
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center max-w-sm mx-auto pt-2">
                        <button
                          onClick={resetScannerState}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-transparent"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Start New Scan
                        </button>
                        <button
                          onClick={() => {
                            resetScannerState();
                            setSearchQuery(scannedValue);
                          }}
                          className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Fill to Manual Search
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom info banner */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-855 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between items-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Secured offline-first verification engine
              </span>
              <span>jsQR v1.4.0 Engine</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
