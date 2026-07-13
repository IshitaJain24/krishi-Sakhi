'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, RefreshCw, BarChart2, CheckCircle, Info, Database } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CropRecommendation({ activePlot, userProfile }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputs, setInputs] = useState({
    nitrogen: activePlot?.nitrogen || '',
    phosphorus: activePlot?.phosphorus || '',
    potassium: activePlot?.potassium || '',
    pH: activePlot?.soilPH || '',
    soilType: activePlot?.soilType || 'Loamy',
    irrigation: activePlot?.irrigationSource || 'Rain-fed'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const loadFromActivePlot = () => {
    if (activePlot) {
      setInputs({
        nitrogen: activePlot.nitrogen || '140',
        phosphorus: activePlot.phosphorus || '45',
        potassium: activePlot.potassium || '190',
        pH: activePlot.soilPH || '6.8',
        soilType: activePlot.soilType || 'Clayey',
        irrigation: activePlot.irrigationSource || 'Borewell/Tubewell'
      });
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  const getRecommendation = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate recommendation logic based on agricultural science guidelines
    setTimeout(() => {
      const ph = parseFloat(inputs.pH) || 6.5;
      const n = parseFloat(inputs.nitrogen) || 120;
      const p = parseFloat(inputs.phosphorus) || 40;
      const k = parseFloat(inputs.potassium) || 150;
      
      let cropList = [];
      let fertilizingStrategy = "";

      if (ph < 5.5) {
        cropList = [
          { name: "Potato", match: 92, cycle: "100-120 Days", water: "Medium", profit: "High" },
          { name: "Oats", match: 85, cycle: "90-110 Days", water: "Low", profit: "Medium" }
        ];
        fertilizingStrategy = "Soil is acidic. We recommend adding agricultural lime (calcium carbonate) to increase soil pH to a neutral range (6.0-7.0) before planting.";
      } else if (ph > 7.5) {
        cropList = [
          { name: "Bajra (Pearl Millet)", match: 95, cycle: "85-90 Days", water: "Very Low", profit: "Medium" },
          { name: "Cotton", match: 88, cycle: "150-180 Days", water: "High", profit: "High" },
          { name: "Mustard", match: 84, cycle: "110-120 Days", water: "Low", profit: "Medium" }
        ];
        fertilizingStrategy = "Soil is slightly alkaline. Apply organic matter or sulfur to lower pH, and choose crops like Bajra and Cotton which possess high alkaline soil tolerance.";
      } else {
        // Neutral soil
        if (inputs.irrigation === "Drip Irrigation" || inputs.irrigation === "Borewell/Tubewell") {
          cropList = [
            { name: "Wheat (Sonalika)", match: 96, cycle: "120-130 Days", water: "Medium", profit: "High" },
            { name: "Maize (Corn)", match: 90, cycle: "95-105 Days", water: "Medium", profit: "Medium" },
            { name: "Tomato", match: 86, cycle: "110-120 Days", water: "High", profit: "Very High" }
          ];
        } else {
          cropList = [
            { name: "Gram (Chickpea)", match: 94, cycle: "110-120 Days", water: "Low", profit: "High" },
            { name: "Bajra (Pearl Millet)", match: 89, cycle: "85-90 Days", water: "Very Low", profit: "Medium" },
            { name: "Moong (Green Gram)", match: 85, cycle: "70-75 Days", water: "Low", profit: "Medium" }
          ];
        }
        
        // NPK adjustments
        if (n < 100) {
          fertilizingStrategy = "Nitrogen level is low. Incorporate leguminous crops (like Moong or Chickpea) in crop rotation or apply nitrogen-rich organic compost / urea.";
        } else if (p < 30) {
          fertilizingStrategy = "Phosphorus level is critical. Apply single superphosphate (SSP) or Diammonium Phosphate (DAP) during sowing to encourage robust root systems.";
        } else {
          fertilizingStrategy = "Your NPK levels are balanced. Follow standard maintenance fertilization schedules according to the crop selected.";
        }
      }

      setResult({
        crops: cropList,
        fertilizer: fertilizingStrategy,
        phCategory: ph < 5.5 ? "Acidic" : ph > 7.5 ? "Alkaline" : "Neutral / Ideal",
        npkStatus: `N:${n} P:${p} K:${k} kg/ha`
      });
      setLoading(false);
      
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 }
      });
    }, 1500);
  };

  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 animate-fade-in bg-transparent max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Sprout className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl md:text-3.5xl font-black">AI Crop Recommendation</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Input your soil specifications, and our agricultural algorithm will recommend the most suitable and profitable crops for your farm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="lg:col-span-1 bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-1.5">
              <Database className="w-5 h-5 text-emerald-600" /> Soil Metrics
            </h3>
            {activePlot && (
              <button
                type="button"
                onClick={loadFromActivePlot}
                className="text-xs font-bold text-emerald-650 hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100 transition-colors"
              >
                Load Active Plot
              </button>
            )}
          </div>

          <form onSubmit={getRecommendation} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">N (kg/ha)</label>
                <input
                  type="number"
                  name="nitrogen"
                  value={inputs.nitrogen}
                  onChange={handleInputChange}
                  placeholder="e.g. 140"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">P (kg/ha)</label>
                <input
                  type="number"
                  name="phosphorus"
                  value={inputs.phosphorus}
                  onChange={handleInputChange}
                  placeholder="e.g. 45"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">K (kg/ha)</label>
                <input
                  type="number"
                  name="potassium"
                  value={inputs.potassium}
                  onChange={handleInputChange}
                  placeholder="e.g. 190"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Soil pH (3.0 - 10.0)</label>
              <input
                type="number"
                step="0.1"
                name="pH"
                value={inputs.pH}
                onChange={handleInputChange}
                placeholder="e.g. 6.8"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Soil Texture</label>
              <select
                name="soilType"
                value={inputs.soilType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-850"
              >
                <option value="Loamy">Loamy</option>
                <option value="Sandy">Sandy</option>
                <option value="Clayey">Clayey</option>
                <option value="Black Cotton">Black Cotton</option>
                <option value="Red Soil">Red Soil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Irrigation Method</label>
              <select
                name="irrigation"
                value={inputs.irrigation}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-850"
              >
                <option value="Rain-fed">Rain-fed</option>
                <option value="Canal">Canal</option>
                <option value="Borewell/Tubewell">Borewell / Tubewell</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white rounded-2xl font-bold shadow-md shadow-emerald-650/10 active:scale-98 transition-all text-sm mt-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Soil...
                </>
              ) : (
                <>
                  <BarChart2 className="w-4 h-4" /> Recommend Crops
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Recommendations list */}
              <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" /> Best Matching Crops
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.crops.map((crop, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-100 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800 text-base">{crop.name}</h4>
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1.5">
                            {crop.cycle}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-700">{crop.match}%</span>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Match Score</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-4 pt-3 border-t border-emerald-100/50 text-gray-500">
                        <span>Water: <strong className="text-gray-700">{crop.water}</strong></span>
                        <span>Profit: <strong className="text-emerald-700 font-bold">{crop.profit}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fertilization strategy */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-700">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm">Suggested Fertilization & Soil Management</h4>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">{result.fertilizer}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white/40 border border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-400 space-y-3">
              <Sprout className="w-12 h-12 text-gray-300" />
              <p className="text-sm font-medium">Please enter your soil details on the left and run analysis to see recommended crops.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
