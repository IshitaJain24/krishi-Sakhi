'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, RefreshCw, BarChart3, Filter } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function MarketPrices({ activePlot }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  
  const mandiRates = [
    { crop: "Bajra (Pearl Millet)", mandi: "Jaipur Mandi, RJ", price: 2350, prevPrice: 2280, unit: "quintal", trend: "up" },
    { crop: "Moong (Green Gram)", mandi: "Jaipur Mandi, RJ", price: 7800, prevPrice: 7800, unit: "quintal", trend: "stable" },
    { crop: "Mustard (Sarson)", mandi: "Jodhpur Mandi, RJ", price: 5650, prevPrice: 5500, unit: "quintal", trend: "up" },
    { crop: "Wheat (Kanak)", mandi: "Ludhiana Mandi, PB", price: 2275, prevPrice: 2275, unit: "quintal", trend: "stable" },
    { crop: "Rice (Paddy)", mandi: "Karnal Mandi, HR", price: 2180, prevPrice: 2120, unit: "quintal", trend: "up" },
    { crop: "Cotton (Kapaas)", mandi: "Indore Mandi, MP", price: 6800, prevPrice: 7100, unit: "quintal", trend: "down" },
    { crop: "Potato (Aloo)", mandi: "Agra Mandi, UP", price: 1250, prevPrice: 1180, unit: "quintal", trend: "up" },
    { crop: "Onion (Pyaz)", mandi: "Nashik Mandi, MH", price: 2800, prevPrice: 2950, unit: "quintal", trend: "down" }
  ];

  // Mock historical data for the chart
  const historyData = [
    { month: "Jan", Bajra: 2100, Wheat: 2150, Cotton: 7300 },
    { month: "Feb", Bajra: 2150, Wheat: 2190, Cotton: 7200 },
    { month: "Mar", Bajra: 2200, Wheat: 2210, Cotton: 7000 },
    { month: "Apr", Bajra: 2220, Wheat: 2250, Cotton: 6800 },
    { month: "May", Bajra: 2300, Wheat: 2260, Cotton: 6750 },
    { month: "Jun", Bajra: 2350, Wheat: 2275, Cotton: 6800 }
  ];

  const filteredRates = mandiRates.filter(rate => {
    const matchesSearch = rate.mandi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rate.crop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'All' || rate.crop.includes(selectedCrop);
    return matchesSearch && matchesCrop;
  });

  const cropsList = ['All', 'Bajra', 'Wheat', 'Rice', 'Cotton', 'Moong', 'Mustard', 'Potato', 'Onion'];

  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 animate-fade-in bg-transparent max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <BarChart3 className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl md:text-3.5xl font-black">Market Rates (Mandi Prices)</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Live updates of mandi crop rates across Indian states. Track price fluctuations and plan your harvests accordingly.
          </p>
        </div>
      </div>

      {/* Historical Trend Chart (Recharts) */}
      <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
        <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> Price Index Trends (Last 6 Months)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorBajra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="Bajra" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBajra)" />
              <Area type="monotone" dataKey="Wheat" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWheat)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 text-xs font-semibold text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Bajra (Pearl Millet)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Wheat (Kanak)</span>
        </div>
      </div>

      {/* Mandi rates list & filters */}
      <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search crop or mandi..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-250 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-250 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-850 flex-grow sm:flex-grow-0"
            >
              {cropsList.map(crop => (
                <option key={crop} value={crop}>{crop} {crop !== 'All' ? 'only' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live list of rates */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-450 font-bold uppercase tracking-wider text-xs">
                <th className="pb-3 pr-4">Crop name</th>
                <th className="pb-3 pr-4">Mandi (Market)</th>
                <th className="pb-3 text-right pr-4">Rate per Q</th>
                <th className="pb-3 text-right">Daily Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.length > 0 ? (
                filteredRates.map((rate, index) => {
                  const percentChange = ((rate.price - rate.prevPrice) / rate.prevPrice * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pr-4 font-bold text-gray-800">{rate.crop}</td>
                      <td className="py-4 pr-4 text-gray-500 text-xs font-semibold">{rate.mandi}</td>
                      <td className="py-4 text-right pr-4 font-black text-gray-900">₹{rate.price.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        {rate.trend === 'up' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                            <TrendingUp className="w-3 h-3" /> +{percentChange}%
                          </span>
                        )}
                        {rate.trend === 'down' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded-lg">
                            <TrendingDown className="w-3 h-3" /> {percentChange}%
                          </span>
                        )}
                        {rate.trend === 'stable' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
                            - Stable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-400 font-medium">
                    No matching mandi prices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
