import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Sun, Moon, Volume2, ShieldAlert, Wifi, Clock, HelpCircle, Power, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { isDarkMode, toggleDarkMode, currentUser, systemReset } = useApp();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="header-bar"
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md px-6 shadow-xs"
    >
      {/* Mobile Toggle & Path info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 focus:outline-hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-405">
            Live Gateway Connected
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        {/* Dynamic UTC Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>{time || '00:00:00'}</span>
        </div>

        {/* Real-Time External Launch Tab Link */}
        <a
          href={typeof window !== 'undefined' ? window.location.origin : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/10 text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Open application in a new tab for real-time camera simulation features"
          id="header-open-tab-link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Open App in New Tab</span>
        </a>

        {/* System Reset Shortcut with warning */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to restore default initial slots, bookings, and users? Your local edits will be refreshed.')) {
              systemReset();
            }
          }}
          title="Restore Demo Defaults"
          className="flex p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-450 hover:text-indigo-550 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors tooltip cursor-pointer"
        >
          <Power className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>

        {/* Dark Mode switcher */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Theme Mode"
          className="flex p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Role Quick Indicator */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
              {currentUser?.username || 'Guest'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium capitalize">
              {currentUser?.role || 'authorized device'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-white/10 border border-indigo-100 dark:border-white/15 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-white">
            {currentUser?.username ? currentUser.username.charAt(0) : 'G'}
          </div>
        </div>
      </div>
    </header>
  );
};
