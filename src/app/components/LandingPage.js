'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, ShieldAlert, TrendingUp, HelpCircle, ArrowRight, UserCheck, Heart } from 'lucide-react';

export default function LandingPage({ onStart }) {
  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      title: "Crop Recommendation",
      desc: "Get personalized crop suggestions based on your soil pH, NPK levels, irrigation type, and regional climate."
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-amber-600" />,
      title: "Disease Diagnosis",
      desc: "Upload leaves or crop photos to instantly detect pests and crop diseases with clear treatment recommendations."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Market Price Insights",
      desc: "Track daily Mandi market prices across various Indian states, trends, and sell at the best timing."
    },
    {
      icon: <HelpCircle className="w-8 h-8 text-indigo-600" />,
      title: "AI Chat Assistant",
      desc: "Speak in your regional language (Hindi, Malayalam, English) and get instant answers to any farming questions."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 via-emerald-50 to-white text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
            Krishi <span className="text-emerald-650 text-emerald-600">Sakhi</span>
          </span>
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
        >
          <UserCheck className="w-4 h-4" /> Start App
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            🌱 Your Personal AI Farming Assistant
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight">
            Farming Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700">AI Agents</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Krishi Sakhi uses next-generation artificial intelligence to optimize your crops, diagnose diseases, monitor soil health, and get live mandi rates.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-650/35 transition-all hover:scale-[1.01] active:scale-95 text-base"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-16 md:mt-24"
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-50 hover:border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4 group"
            >
              <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-105 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-950">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Dynamic Analytics/Mock Illustration Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-20 w-full max-w-4xl p-6 md:p-8 rounded-3xl bg-white/40 border border-white/20 backdrop-blur-md shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-left max-w-sm space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Maximize Farm Yields</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Add your land plots, provide soil data (NPK, pH), and receive continuous crop suggestions tailored to current regional dry/wet conditions.
              </p>
              <ul className="space-y-2 text-sm text-emerald-800 font-semibold">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Proactive Pest Alerts</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Personalized Drip Irrigation advice</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Expert Local Support Hotlines</li>
              </ul>
            </div>
            
            {/* Visual Mini Mockup Dashboard */}
            <div className="w-full md:w-96 p-5 rounded-2xl bg-white shadow-xl border border-gray-100 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-bold text-xs text-gray-400 uppercase">Mandi Rates (Jaipur)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">Active</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Bajra (Pearl Millet)</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">₹2,350 / q</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Moong (Green Gram)</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">₹7,800 / q</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-50 py-8 text-center text-xs text-gray-400 w-full mt-12 bg-white/40">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Indian Farmers © {new Date().getFullYear()} Krishi Sakhi.
        </p>
      </footer>
    </div>
  );
}
