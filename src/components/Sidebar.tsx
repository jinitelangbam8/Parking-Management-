import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  HardDriveDownload,
  Car,
  CalendarCheck,
  CreditCard,
  BarChart3,
  User as UserIcon,
  Settings,
  LogOut,
  X,
  Compass,
  Building
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentPath, navigateTo, currentUser, logout } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Navigation Links based on Admin / User structures
  const navItems = isAdmin
    ? [
        { name: 'Dashboard', path: 'dashboard/admin', icon: LayoutDashboard },
        { name: 'Parking Slots', path: 'parking-slots', icon: Building },
        { name: 'Vehicle Logs', path: 'vehicles', icon: Car },
        { name: 'Bookings', path: 'bookings', icon: CalendarCheck },
        { name: 'Payments', path: 'payments', icon: CreditCard },
        { name: 'Reports & Stats', path: 'reports', icon: BarChart3 },
        { name: 'My Profile', path: 'profile', icon: UserIcon },
        { name: 'System Settings', path: 'settings', icon: Settings }
      ]
    : [
        { name: 'Available Slots', path: 'dashboard/user', icon: Compass },
        { name: 'View Grid', path: 'parking-slots', icon: Building },
        { name: 'My Bookings', path: 'bookings', icon: CalendarCheck },
        { name: 'My Payments', path: 'payments', icon: CreditCard },
        { name: 'Profile Detail', path: 'profile', icon: UserIcon },
        { name: 'System Settings', path: 'settings', icon: Settings }
      ];

  const handleNav = (path: string) => {
    navigateTo(path);
    onClose(); // close mobile drawer
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        id="sidebar-container"
        className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r border-slate-200 dark:border-white/10 bg-white/95 dark:bg-white/5 dark:backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white">
                ParkSmart Pro
              </h1>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                Control Hub
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden flex p-1.5 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged in info segment */}
        {currentUser && (
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/2">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop'}
                alt={currentUser.username}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-indigo-100 dark:border-white/10 shadow-sm object-cover"
              />
              <div className="overflow-hidden flex-1">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-white truncate leading-tight">
                  {currentUser.username}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate leading-snug">
                  {currentUser.email}
                </p>
                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase ${
                  isAdmin ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border dark:border-amber-500/20' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border dark:border-emerald-500/20'
                }`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation links */}
        <nav className="flex-1 space-y-1.5 px-3.5 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path === 'dashboard/admin' && currentPath === 'dashboard/admin') || (item.path === 'dashboard/user' && currentPath === 'dashboard/user');
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex w-full items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white font-semibold border dark:border-white/15 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 duration-150 ${
                  isActive ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-slate-450 group-hover:text-slate-600 dark:group-hover:text-slate-350'
                }`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 mt-auto">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
