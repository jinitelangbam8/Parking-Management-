import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, ShieldAlert, Sliders, Moon, Sun, Trash2, Key } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isDarkMode, toggleDarkMode, systemReset, slots, showToast } = useApp();

  const [garageName, setGarageName] = useState('Metro Smart Space Complex @ Bangalore');
  const [globalTax, setGlobalTax] = useState(18);

  const handleSaveSim = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform environment simulation parameters committed!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" id="settings-pane">
      {/* Simulation and configurations settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-201 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2 mb-5">
          General Configurations
        </h3>

        <form onSubmit={handleSaveSim} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Garage Complex Name
            </label>
            <input
              type="text"
              value={garageName}
              onChange={(e) => setGarageName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-255 dark:border-slate-805 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                VAT Tax Rate percentage (%)
              </label>
              <input
                type="number"
                value={globalTax}
                onChange={(e) => setGlobalTax(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-255 dark:border-slate-805 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Visual display Theme
              </label>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-between transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <span>{isDarkMode ? 'Immersive Dark Canvas' : 'High Contrast Light Canvas'}</span>
                {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer bg-indigo-500"
          >
            Save simulation settings
          </button>
        </form>
      </div>

      {/* Dangerous/Platform Level State Reset warning */}
      <div className="p-6 bg-rose-50/50 dark:bg-slate-900 border border-rose-100 dark:border-rose-950/20 rounded-3xl flex items-start gap-4">
        <div className="p-3 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-1.5">
          <h4 className="text-sm font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider">Clean Factory Reset</h4>
          <p className="text-[11px] text-rose-650 dark:text-rose-300 leading-relaxed max-w-lg">
            This commits a full wipe on your `localStorage` collections. It will revert all slots, custom bookings, registered driver license plate records, and transaction receipts back to initial boot configuration coordinates. This is useful for reviewing a fresh demo simulation!
          </p>
          <button
            onClick={() => {
              if (confirm('Verify: Restore clean initial system variables details? This wipes local modifications.')) {
                systemReset();
              }
            }}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
          >
            Reset Database variables
          </button>
        </div>
      </div>
    </div>
  );
};
