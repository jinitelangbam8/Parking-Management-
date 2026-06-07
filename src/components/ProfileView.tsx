import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, Mail, Award, CheckCircle } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, showToast } = useApp();

  // State Management
  const [username, setUsername] = useState(currentUser?.username || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [plate, setPlate] = useState(currentUser?.plateNumber || '');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    currentUser.username = username;
    currentUser.phone = phone;
    if (currentUser.role === 'user') {
      currentUser.plateNumber = plate.toUpperCase();
    }

    // Force context write back
    localStorage.setItem('park_currentUser', JSON.stringify(currentUser));
    showToast('Your demographic driver profile credentials updated!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" id="profile-pane">
      {/* Profile Card Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop'}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-slate-800 object-cover"
          />
          <div className="text-center sm:text-left flex-1 space-y-1">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentUser?.username}</h1>
            <p className="text-sm font-semibold text-slate-450 dark:text-slate-500">{currentUser?.email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-indigo-55 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 uppercase">
              {currentUser?.role} account
            </span>
          </div>
        </div>
      </div>

      {/* Account Settings Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2 mb-5">
          Update Info
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Full Username Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-255 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden border-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Linked Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-255 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Platform Account Role
              </label>
              <div className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-slate-400 cursor-not-allowed font-bold capitalize">
                {currentUser?.role}
              </div>
            </div>

            {currentUser?.role === 'user' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Default plate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH-12-PQ-8765"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-255 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-hidden border-slate-200 font-extrabold"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-indigo-600/10 shadow-lg"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Save Demographics change
          </button>
        </form>
      </div>
    </div>
  );
};
