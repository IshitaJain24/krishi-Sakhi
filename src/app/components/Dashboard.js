'use client';

import React from 'react';
import { uiStrings } from '../lib/i18n';
import { 
  CloudSun, 
  BellRing, 
  Coins, 
  Landmark, 
  Plus, 
  PenTool, 
  BarChart4, 
  Info, 
  Layers, 
  Droplets,
  Sprout,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function Dashboard({ user, userProfile, plots, activePlot, onEditPlot }) {
  const t = uiStrings[userProfile?.language] || uiStrings.en;

  const getRealTimeContext = (location) => {
    const isJaipur = /jaipur/i.test(location || '');
    return {
      location: location || "your area",
      weather: `Sunny with clear skies. High of 34°C. Low of 22°C.`,
      alert: isJaipur ? `Moderate white grub activity reported in the Jaipur region. Monitor root health.` : "No major pest alerts for your region.",
      mandiPrices: isJaipur ? [
          { crop: "Bajra (Pearl Millet)", price: "₹2,350 / quintal" },
          { crop: "Moong (Green Gram)", price: "₹7,800 / quintal" },
      ] : [
          { crop: "Wheat", price: "₹2,125 / quintal" },
          { crop: "Mustard", price: "₹5,450 / quintal" },
      ],
      scheme: "The state government has announced a 50% subsidy on drip irrigation systems. Last date to apply is Oct 31st."
    };
  };
  
  const realTimeContext = getRealTimeContext(activePlot?.location);

  // Compile NPK chart data
  const nVal = parseFloat(activePlot?.nitrogen) || 0;
  const pVal = parseFloat(activePlot?.phosphorus) || 0;
  const kVal = parseFloat(activePlot?.potassium) || 0;
  const chartData = [
    { name: 'N (Nitrogen)', value: nVal, color: '#34d399' },
    { name: 'P (Phosphorus)', value: pVal, color: '#60a5fa' },
    { name: 'K (Potassium)', value: kVal, color: '#fbbf24' }
  ];
  const hasSoilData = nVal > 0 || pVal > 0 || kVal > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent animate-fade-in max-w-5xl mx-auto w-full">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-emerald-700/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <Sprout className="w-[180px] h-[180px]" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-semibold backdrop-blur-md text-emerald-100 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse"></span>
            Active Land Profile
          </span>
          <h1 className="text-2xl md:text-3.5xl font-black tracking-tight">
            {t.welcome(user?.displayName || userProfile?.name || 'Farmer')}
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-xl">
            {t.farmSummary || 'Manage your agricultural plots, monitor weather, check market prices, and chat with AI.'}
          </p>
        </div>
      </div>
      
      {/* NPK Chart & Quick Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Soil Health Recharts Panel */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5">
                <BarChart4 className="w-5 h-5 text-emerald-650 text-emerald-600" /> Soil Nutrient Balance (NPK)
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Metrics in kg/hectare</p>
            </div>
            {activePlot && (
              <button 
                onClick={() => onEditPlot(activePlot)}
                className="text-xs font-bold text-emerald-650 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 transition-colors"
              >
                Update Report
              </button>
            )}
          </div>

          {hasSoilData ? (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-200/60 text-gray-500 space-y-3">
              <Info className="w-8 h-8 text-emerald-650 text-emerald-600" />
              <p className="text-xs font-bold text-gray-700 max-w-sm">No soil test values found for this plot. Add NPK metrics to unlock crop advisor analysis.</p>
              <button
                onClick={() => onEditPlot(activePlot)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Soil Report
              </button>
            </div>
          )}
        </div>

        {/* Irrigation and Crop Stats */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-emerald-650 text-emerald-600" /> Land Details
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Active Plot stats</p>
          </div>

          {activePlot ? (
            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Current Crop</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{activePlot.crop || 'Not Planted'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="bg-blue-50 text-blue-700 p-2.5 rounded-xl">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Water Resource</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{activePlot.irrigationSource || 'Rain-fed'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-6 flex-1 flex items-center justify-center">No active plot selected.</p>
          )}
        </div>
      </div>
      
      {/* Grid of Key Info Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weather Widget */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 rounded-3xl relative overflow-hidden group shadow-lg text-white">
           <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
             <CloudSun className="w-40 h-40" />
           </div>
           <div className="flex items-center mb-4">
             <div className="bg-white/20 text-white p-3 rounded-2xl mr-4">
               <CloudSun className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-extrabold text-lg">{t.weatherIn(realTimeContext.location)}</h3>
               <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Live Forecast</p>
             </div>
           </div>
           <p className="text-blue-50 text-sm leading-relaxed font-semibold">{realTimeContext.weather}</p>
        </div>
        
        {/* Alerts Widget */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl relative overflow-hidden group shadow-lg text-white">
           <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
             <BellRing className="w-40 h-40" />
           </div>
           <div className="flex items-center mb-4">
             <div className="bg-white/20 text-white p-3 rounded-2xl mr-4">
               <BellRing className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-extrabold text-lg">{t.localAlert || 'Local Alerts'}</h3>
               <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">Critical Advisory</p>
             </div>
           </div>
           <p className="text-amber-50 text-sm leading-relaxed font-semibold">{realTimeContext.alert}</p>
        </div>
        
        {/* Mandi Prices Widget */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl relative overflow-hidden group shadow-md">
           <div className="flex items-center mb-4">
             <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl mr-4 group-hover:scale-105 transition-transform">
               <Coins className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-extrabold text-lg text-gray-800">{t.mandiPrices || 'Market Rates'}</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Daily Mandi Prices</p>
             </div>
           </div>
           <ul className="space-y-3 text-sm">
              {realTimeContext.mandiPrices.map(item => (
                <li key={item.crop} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-650 font-semibold">{item.crop}</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl text-xs">{item.price}</span>
                </li>
              ))}
           </ul>
        </div>
        
        {/* Govt Schemes Widget */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-950 p-6 rounded-3xl relative overflow-hidden group shadow-lg text-white">
           <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
             <Landmark className="w-40 h-40" />
           </div>
           <div className="flex items-center mb-4">
             <div className="bg-white/20 text-white p-3 rounded-2xl mr-4">
               <Landmark className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-extrabold text-lg">{t.govtSchemes || 'Government Schemes'}</h3>
               <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Active Subsidies</p>
             </div>
           </div>
           <p className="text-emerald-100 text-sm leading-relaxed font-semibold">{realTimeContext.scheme}</p>
        </div>
      </div>

      {/* Your Plots Section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-800">{t.yourPlots}</h2>
              <p className="text-xs text-gray-400 font-medium">Monitor and manage individual land profiles</p>
            </div>
            <button 
              onClick={() => onEditPlot(null)} 
              className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl hover:bg-emerald-700 active:scale-95 shadow-md flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> {t.addNew}
            </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plots.length > 0 ? plots.map(plot => (
            <div 
              key={plot.id} 
              className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-250 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex items-center">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl mr-3.5 group-hover:bg-emerald-100 transition-colors">
                  <Sprout className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-gray-800 text-sm truncate">{plot.plotName}</p>
                  <p className="text-[11px] text-gray-450 font-semibold mt-0.5 truncate">
                    {plot.crop || 'Crop not set'} • {plot.landSize || 'Size not set'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 pt-3 border-t border-gray-50">
                <button 
                  onClick={() => onEditPlot(plot)} 
                  className="px-3.5 py-1.5 bg-emerald-55 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <PenTool className="w-3.5 h-3.5" /> {t.editPlot}
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-10 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <Sprout className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-xs mb-4 font-semibold">{t.noPlots}</p>
                <button 
                  onClick={() => onEditPlot(null)} 
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl transition-all active:scale-95 shadow-md"
                >
                  {t.createFirstPlot}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}