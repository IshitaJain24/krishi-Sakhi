'use client';

import React, { useState, useEffect } from 'react';
import { uiStrings } from '../lib/i18n';
import { 
  User, 
  MapPin, 
  Sliders, 
  Trash2, 
  Wifi, 
  WifiOff, 
  PhoneCall, 
  Info, 
  Sprout, 
  Plus, 
  PenTool, 
  Globe 
} from 'lucide-react';

export default function Settings({ user, userProfile, onUpdateUser, plots, onEditPlot, onAddNewPlot, onClose }) {
  const t = uiStrings[userProfile?.language] || uiStrings.en;
  const [networkStatus, setNetworkStatus] = useState('online');
  const [storageUsage, setStorageUsage] = useState(null);

  // Network Status Detection
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate storage usage (for PWA)
  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage ? (estimate.usage / 1024 / 1024).toFixed(2) : 'N/A';
        const quota = estimate.quota ? (estimate.quota / 1024 / 1024).toFixed(2) : 'N/A';
        setStorageUsage({ used, quota });
      });
    }
  }, []);

  const handleNameChange = () => {
    const newName = prompt("Enter your new name:", userProfile?.name || "");
    if (newName && newName.trim() !== "") {
      onUpdateUser({ name: newName });
    }
  };

  const handleLangChange = (e) => {
    onUpdateUser({ language: e.target.value });
  };

  const clearCache = async () => {
    if (window.confirm(t.clearCacheConfirm || "Are you sure you want to clear the cache?")) {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        }
        alert(t.cacheCleared || "Cache cleared successfully!");
        window.location.reload();
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert("Error clearing cache. Please try again.");
      }
    }
  };

  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 animate-fade-in bg-transparent max-w-5xl mx-auto w-full">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Sliders className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl md:text-3.5xl font-black">{t.settingsTitle || "Settings"}</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Configure your personal farmer profile, manage land plots, monitor app storage, or reach out to government agricultural helplines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User Profile Card */}
        <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5 border-b pb-3">
            <User className="w-5 h-5 text-emerald-600" /> {t.yourProfile || "Your Profile"}
          </h3>
          <div className="space-y-4 text-sm font-medium">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.name || "Name"}</p>
                <p className="text-gray-850 font-bold">{userProfile?.name || 'Farmer'}</p>
              </div>
              <button 
                onClick={handleNameChange} 
                className="text-xs font-bold text-emerald-650 hover:underline bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                {t.change || "Change"}
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase">{t.email || "Email"}</p>
              <p className="text-gray-850 font-bold">{user?.email}</p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2">
              <label htmlFor="lang-select" className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-gray-400" /> {t.appLang || "App Language"}
              </label>
              <select 
                id="lang-select" 
                value={userProfile?.language || 'en'} 
                onChange={handleLangChange} 
                className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Farm Plots Section */}
        <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5">
              <Sprout className="w-5 h-5 text-emerald-600" /> {t.yourPlots || "Your Plots"}
            </h3>
            <button 
              onClick={onAddNewPlot} 
              className="text-xs font-bold text-emerald-650 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> {t.addNew || "Add New"}
            </button>
          </div>
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {plots.length > 0 ? plots.map(plot => (
              <div key={plot.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3 hover:border-emerald-100 transition-all duration-300">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-gray-800 text-sm truncate">{plot.plotName}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{plot.location} • {plot.landSize} • {plot.crop || t.noCrop || "No crop"}</p>
                </div>
                <button 
                  onClick={() => onEditPlot(plot)} 
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-emerald-100"
                >
                  <PenTool className="w-3 h-3" /> {t.editPlot || "Edit"}
                </button>
              </div>
            )) : (
              <p className="py-6 text-center text-xs text-gray-400 font-semibold">{t.noPlots || "No plots added yet"}</p>
            )}
          </div>
        </div>

        {/* PWA & System Settings Section */}
        <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5 border-b pb-3">
            <Info className="w-5 h-5 text-emerald-600" /> {t.appSettings || "App Settings"}
          </h3>
          <div className="space-y-3 text-sm font-medium">
            {storageUsage && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
                <p className="text-gray-800 font-bold text-sm">{t.storageUsage || "Storage Usage"}</p>
                <p className="text-xs text-gray-500 mt-1 leading-normal">{t.storageUsed || "Used"}: {storageUsage.used} MB / {storageUsage.quota} MB</p>
              </div>
            )}
            
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5 flex justify-between items-center">
              <div>
                <p className="text-gray-800 font-bold text-sm">{t.clearCache || "Clear Cache"}</p>
                <p className="text-[10px] text-gray-450 mt-0.5 leading-normal">{t.clearCacheDesc || "Free cached offline assets space"}</p>
              </div>
              <button 
                onClick={clearCache} 
                className="text-xs font-bold text-red-650 bg-red-50 border border-red-100 px-3.5 py-2 rounded-xl hover:bg-red-100 transition-colors shadow-sm text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> {t.clearCacheButton || "Clear"}
              </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5 flex justify-between items-center">
              <div>
                <p className="text-gray-800 font-bold text-sm">{t.networkStatus || "Network Connection"}</p>
                <p className="text-[10px] text-gray-450 mt-0.5 leading-normal">Online / Offline indicator</p>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-xl">
                {networkStatus === 'online' ? (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> {t.online || "Online"}</span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl flex items-center gap-1"><WifiOff className="w-3.5 h-3.5" /> {t.offline || "Offline"}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Helpline Section */}
        <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5 border-b pb-3">
            <PhoneCall className="w-5 h-5 text-emerald-600" /> {t.helplineTitle || "Agricultural Helplines"}
          </h3>
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="font-bold text-gray-800 text-sm">{t.kcc || "Kisan Call Center"}</p>
                <p className="text-[10px] text-gray-450 leading-relaxed mt-0.5">{t.kccDesc || "Toll-free agricultural support from experts"}</p>
              </div>
              <a 
                href="tel:18001801551" 
                className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold transition-all shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" /> 1800-180-1551
              </a>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
              <p className="font-bold text-gray-800 text-sm">{t.localOfficer || "Local Agriculture Officer"}</p>
              <p className="text-xs text-gray-500 leading-normal mt-1">{t.localOfficerDesc || "Reach out to your local Block Development block office for soil reports & subsidies."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}