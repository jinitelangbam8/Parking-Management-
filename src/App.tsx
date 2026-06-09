import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';

// View Imports
import { DashboardAdminView } from './components/DashboardAdminView';
import { DashboardUserView } from './components/DashboardUserView';
import { ParkingSlotsView } from './components/ParkingSlotsView';
import { VehiclesView } from './components/VehiclesView';
import { BookingsView } from './components/BookingsView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';

import { Car, ShieldAlert, ArrowRight, Sparkles, LogIn, UserPlus, Users, Key, Monitor, Compass, Eye, ShieldCheck, ExternalLink, Mail, Send } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, navigateTo, currentUser, login, register, showToast } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authentication forms local state
  const [authEmail, setAuthEmail] = useState('');
  const [authRole, setAuthRole] = useState<'admin' | 'user'>('user');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'user'>('user');
  const [regPlate, setRegPlate] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Handle Login Event
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      showToast('Please provide your authentic email address!', 'warning');
      return;
    }
    login(authEmail.trim(), authRole);
  };

  // Handle Register Event
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      showToast('Name and email are strictly mandatory fields.', 'warning');
      return;
    }
    if (regRole === 'user' && !regPlate.trim()) {
      showToast('Vehicles license plate is requested for driving accounts.', 'warning');
      return;
    }

    register(regName.trim(), regEmail.trim(), regRole, regPlate.trim(), regPhone.trim());
  };

  // Route Protection & View Selection Switch
  const renderSelectedView = () => {
    const isAuth = !!currentUser;
    const adminMode = currentUser?.role === 'admin';

    switch (currentPath) {
      case 'home':
        return <HomeLandingView />;
      
      case 'login':
        return (
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
              <div className="text-center space-y-2 mb-6">
                <Car className="w-10 h-10 text-indigo-600 mx-auto" />
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Sign in to your Portal</h2>
                <p className="text-xs text-slate-400">Select your authorization channel and enter your registered email</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Role Switch tab selectors */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Portal Access</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAuthRole('user')}
                      className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        authRole === 'user'
                          ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-450 hover:text-slate-800'
                      }`}
                    >
                      Driver Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('admin')}
                      className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        authRole === 'admin'
                          ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-450 hover:text-slate-800'
                      }`}
                    >
                      Control Center
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@parking.com or admin@parking.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 dark:bg-slate-950 dark:text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-indigo-650/15 shadow-lg bg-indigo-500"
                  >
                    Authenticate Access <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-xs space-x-2">
                <span className="text-slate-400">First time reservation?</span>
                <button onClick={() => navigateTo('register')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
                  Create custom Account
                </button>
              </div>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
              <div className="text-center space-y-2 mb-6">
                <Sparkles className="w-10 h-10 text-indigo-600 mx-auto animate-spin-slow" />
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Setup Demographic Account</h2>
                <p className="text-xs text-slate-400 font-medium">Verify your license code configurations instantly</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Role selection toggle */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Configure Account classification</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRegRole('user')}
                      className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        regRole === 'user'
                          ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-450 hover:text-slate-800'
                      }`}
                    >
                      Driver Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('admin')}
                      className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        regRole === 'admin'
                          ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-450 hover:text-slate-800'
                      }`}
                    >
                      Control Center Admin
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sandra Bullock"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-205 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email credentials</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sandra@bul.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-205 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                </div>

                {regRole === 'user' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Vehicle License Plate</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KA-03-HA-1234"
                      value={regPlate}
                      onChange={(e) => setRegPlate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden uppercase font-extrabold tracking-widest text-indigo-605 text-xs text-indigo-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 (555) 000-0000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 text-xs focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-indigo-650/15 shadow-lg bg-indigo-500"
                >
                  Verify Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center text-xs space-x-2">
                <span className="text-slate-400">Already registered?</span>
                <button onClick={() => navigateTo('login')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
                  Authenticate login
                </button>
              </div>
            </div>
          </div>
        );

      // Protected Routing Switches
      default:
        // Auth route protect
        if (!isAuth) {
          showToast('Protected entry. Authorize credentials first.', 'warning');
          navigateTo('login');
          return null;
        }

        switch (currentPath) {
          case 'dashboard/admin':
            if (!adminMode) { navigateTo('dashboard/user'); return null; }
            return <DashboardAdminView />;
          
          case 'dashboard/user':
            return <DashboardUserView />;

          case 'parking-slots':
            return <ParkingSlotsView />;

          case 'vehicles':
            if (!adminMode) { navigateTo('dashboard/user'); return null; }
            return <VehiclesView />;

          case 'bookings':
            return <BookingsView />;

          case 'payments':
            return <PaymentsView />;

          case 'reports':
            if (!adminMode) { navigateTo('dashboard/user'); return null; }
            return <ReportsView />;

          case 'profile':
            return <ProfileView />;

          case 'settings':
            return <SettingsView />;

          default:
            return <HomeLandingView />;
        }
    }
  };

  // Determine if full header/sidebar frame should wrap the content
  const hasShellFrame = currentPath !== 'home' && currentPath !== 'login' && currentPath !== 'register';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden select-none">
      {/* Background Mesh Gradient Effects (visible in Dark Mode) */}
      <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="hidden dark:block absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {hasShellFrame ? (
        <div className="min-h-screen flex relative z-10">
          {/* Header & Sidebar Structure components */}
          <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col md:pl-68 w-full min-h-screen">
            <Header onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
            
            <main id="main-view-container" className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
              {renderSelectedView()}
            </main>

            {/* Quick Stats Footer */}
            <footer className="h-12 bg-indigo-600 dark:bg-white/5 dark:backdrop-blur-md dark:border-t dark:border-white/10 px-6 md:px-8 flex items-center justify-between text-xs font-medium text-white dark:text-slate-300 z-10 shrink-0 w-full">
              <div className="flex gap-6">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> 
                  System Status: Operational
                </span>
                <span className="hidden sm:inline opacity-85">Server Latency: 24ms</span>
              </div>
              <div className="flex gap-6 items-center uppercase tracking-widest text-[10px] opacity-80">
                <span className="hidden md:inline">Security Node 04: Active</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  Bangalore Spaces Complex
                </span>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        /* Flat single landing frames (Login, Register, Home) */
        <div className="w-full relative z-10">
          {renderSelectedView()}
        </div>
      )}

      {/* Slide Toast notice indicators */}
      <ToastContainer />
    </div>
  );
};

// Isolated Home Landing View component
const HomeLandingView: React.FC = () => {
  const { navigateTo, login, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast(`Successfully signed up: ${email}! You will receive live system update notifications.`, 'success');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden" id="landing-screen">
      {/* Dynamic ambient star colors background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-sky-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header levels */}
      <header className="flex h-16 w-full items-center justify-between px-6 md:px-12 border-b border-white/5 relative z-10 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8.5 h-8.5 bg-indigo-600 rounded-lg text-white">
            <Car className="w-5 h-5" />
          </div>
          <span className="text-sm font-black tracking-tight">SmartParking Control</span>
        </div>

        <div className="flex gap-3 items-center">
          <a
            href={typeof window !== 'undefined' ? window.location.origin : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-400/30 text-indigo-400 hover:text-white hover:bg-indigo-500/10 transition-all text-xs font-bold cursor-pointer"
            id="landing-open-tab-link"
          >
            <ExternalLink className="w-3.5 h-3.5" /> <span>Open in New Tab</span>
          </a>
          <button
            onClick={() => navigateTo('login')}
            className="px-4 py-2 hover:bg-white/5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Authenticate Portal
          </button>
          <button
            onClick={() => navigateTo('register')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 font-bold text-white text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 bg-indigo-500"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Hero center segment */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10 max-w-4xl mx-auto space-y-8 py-16">
        <div className="inline-flex items-center gap-2 p-1 px-3 border border-white/10 rounded-full text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-white/5 bg-slate-900/40 animate-fade-in font-sans">
          <Sparkles className="w-3.5 h-3.5" /> High Precision Space Automation
        </div>

        <div className="space-y-4 font-sans">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl">
            Space control solutions for <span className="bg-gradient-to-r from-indigo-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">Smart Parking complexes</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
            An automated, real-time control system leveraging live directory coordinates, automatic pricing quote calculations, barcode QR scanners, and structured CSV logs.
          </p>
        </div>

        {/* Demo Fast Entry portals launchers for evaluation */}
        <div className="w-full max-w-3xl mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 pt-8 border-t border-white/5 font-sans">
          {/* Admin entry card option */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all text-left flex flex-col justify-between group">
            <div>
              <span className="p-2 bg-indigo-605/10 bg-indigo-600/10 text-indigo-400 rounded-lg inline-block mb-3.5">
                <Monitor className="w-5 h-5" />
              </span>
              <h3 className="text-md font-bold text-slate-100">Control Center System Admin</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5 leading-normal">
                Manage lot coordinates, edit pricing tariffs, manual log vehicle check-in Arrivals, and print financial invoice papers in real-time.
              </p>
            </div>
            {/* Instant log button */}
            <button
              onClick={() => login('admin@parking.com', 'admin')}
              className="py-2 px-3 bg-white/10 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold rounded-lg flex items-center justify-between group-hover:bg-indigo-600/20 group-hover:text-indigo-400 cursor-pointer"
            >
              <span>Instant Enter as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* User driving entry card option */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-505/30 hover:border-sky-500/30 transition-all text-left flex flex-col justify-between group">
            <div>
              <span className="p-2 bg-sky-600/10 text-sky-400 rounded-lg inline-block mb-3.5">
                <Compass className="w-5 h-5" />
              </span>
              <h3 className="text-md font-bold text-slate-100">Authorized Driver Portal</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5 leading-normal">
                Search nearby vacant spots, reserve customized hourly time durations, get verified vector QR scanner tickets, and download detailed PDFs.
              </p>
            </div>
            {/* Instant log button */}
            <button
              onClick={() => login('jinitelangbam8@gmail.com', 'user')}
              className="py-2 px-3 bg-white/10 hover:bg-sky-600 hover:text-white transition-all text-xs font-bold rounded-lg flex items-center justify-between group-hover:bg-sky-600/20 group-hover:text-sky-400 cursor-pointer"
            >
              <span>Instant Enter as Driver</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Transparent Glass-Morphism Email Newsletter Component */}
      <div className="w-full max-w-4xl mx-auto px-6 mb-16 relative z-10 font-sans" id="newsletter-signup-container">
        <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500/20 transition-all duration-300">
          <div className="text-left space-y-1.5 md:max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] uppercase font-bold tracking-wider">
              <Mail className="w-3.5 h-3.5" /> System Dispatch Hub
            </div>
            <h3 className="text-lg font-black text-slate-100">Subscribe for System Updates</h3>
            <p className="text-slate-400 text-[11px] leading-normal font-medium">
              Join to collect update notifications for system expansions, live QR scanner status alerts, and offline parking space management schedules.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            {subscribed ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-fade-in" id="newsletter-success-notice">
                <span className="text-base">✓</span> <span>Subscription active! Live update notifications setup complete.</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-950/60 text-white placeholder-slate-500 border border-white/10 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    id="newsletter-email-input"
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 shrink-0"
                  id="newsletter-submit-btn"
                >
                  <span>Notify Me</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Footer info levels */}
      <footer className="py-6 border-t border-white/5 text-center text-[10px] text-slate-500 uppercase tracking-widest relative z-10 bg-slate-950/20">
        Smart Parking Management System &bull; Clean offline-first Local database. Secure authorizations.
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
