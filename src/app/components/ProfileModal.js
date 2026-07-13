'use client';

import { useState, useEffect } from 'react';
import { X, Sprout, Database, Save } from 'lucide-react';

export default function ProfileModal({ plotData, onSave, onClose }) {
  const [formData, setFormData] = useState({
    plotName: '',
    location: '',
    landSize: '',
    irrigationSource: 'Rain-fed',
    crop: '',
    soilType: '',
    soilPH: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    sowingDate: '',
    previousCrop: ''
  });

  useEffect(() => {
    if (plotData) {
      setFormData({
        plotName: plotData.plotName || '',
        location: plotData.location || '',
        landSize: plotData.landSize || '',
        irrigationSource: plotData.irrigationSource || 'Rain-fed',
        crop: plotData.crop || '',
        soilType: plotData.soilType || '',
        soilPH: plotData.soilPH || '',
        nitrogen: plotData.nitrogen || '',
        phosphorus: plotData.phosphorus || '',
        potassium: plotData.potassium || '',
        sowingDate: plotData.sowingDate || '',
        previousCrop: plotData.previousCrop || ''
      });
    }
  }, [plotData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-fade-in space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-650 text-emerald-600" /> Farm Plot Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Plot Name</label>
              <input 
                type="text" 
                name="plotName" 
                value={formData.plotName} 
                onChange={handleChange} 
                placeholder="Plot Name (e.g. North Field)" 
                required 
                className="w-full p-3 bg-gray-50 border border-gray-250 rounded-2xl text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Location (e.g. Jaipur, Rajasthan)" 
                required 
                className="w-full p-3 bg-gray-50 border border-gray-250 rounded-2xl text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Land Size</label>
              <input 
                type="text" 
                name="landSize" 
                value={formData.landSize} 
                onChange={handleChange} 
                placeholder="Land Size (e.g. 2.5 Acres)" 
                required 
                className="w-full p-3 bg-gray-50 border border-gray-250 rounded-2xl text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Irrigation Source</label>
              <select 
                name="irrigationSource" 
                value={formData.irrigationSource} 
                onChange={handleChange} 
                className="w-full p-3 bg-gray-50 border border-gray-250 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="Rain-fed">Rain-fed</option>
                <option value="Canal">Canal</option>
                <option value="Borewell/Tubewell">Borewell / Tubewell</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          {/* Soil NPK box */}
          <div className="p-5 bg-emerald-50/40 rounded-3xl border border-emerald-100/50 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-650 text-emerald-600" />
              <h3 className="font-extrabold text-gray-800 text-sm">Soil Lab Report (NPK)</h3>
            </div>
            <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">Fill in details from your soil report. This data powers crop advisor analysis. You can skip these for now if you don&apos;t have them.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Soil Type</label>
                <input 
                  type="text" 
                  name="soilType" 
                  value={formData.soilType} 
                  onChange={handleChange} 
                  placeholder="e.g. Clayey" 
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-850 placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Soil pH</label>
                <input 
                  type="text" 
                  name="soilPH" 
                  value={formData.soilPH} 
                  onChange={handleChange} 
                  placeholder="e.g. 6.8" 
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-850 placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">N (kg/ha)</label>
                <input 
                  type="number" 
                  name="nitrogen" 
                  value={formData.nitrogen} 
                  onChange={handleChange} 
                  placeholder="Nitrogen" 
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-850 placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">P (kg/ha)</label>
                <input 
                  type="number" 
                  name="phosphorus" 
                  value={formData.phosphorus} 
                  onChange={handleChange} 
                  placeholder="Phosphorus" 
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-850 placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">K (kg/ha)</label>
                <input 
                  type="number" 
                  name="potassium" 
                  value={formData.potassium} 
                  onChange={handleChange} 
                  placeholder="Potassium" 
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-gray-850 placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                />
              </div>
            </div>
          </div>

          {/* Sowing / Crop details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current Crop</label>
              <input 
                type="text" 
                name="crop" 
                value={formData.crop} 
                onChange={handleChange} 
                placeholder="Current Crop (e.g. Bajra)" 
                className="w-full p-3 bg-gray-50 border border-gray-250 rounded-2xl text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Sowing Date</label>
              <input 
                type="date" 
                name="sowingDate" 
                value={formData.sowingDate} 
                onChange={handleChange} 
                className="w-full p-3 bg-gray-50 border border-gray-250 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Previous Crop</label>
              <input 
                type="text" 
                name="previousCrop" 
                value={formData.previousCrop} 
                onChange={handleChange} 
                placeholder="Previous Crop (e.g. Fallow)" 
                className="w-full p-3 bg-gray-50 border border-gray-250 rounded-2xl text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm transition-all" 
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-md shadow-emerald-600/10 flex items-center gap-1.5 text-sm font-bold active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" /> Save Plot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}