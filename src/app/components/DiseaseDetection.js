'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, RefreshCw, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function DiseaseDetection({ activePlot, userProfile }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid crop image file.');
      return;
    }

    try {
      // Compress image for fast upload
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      setSelectedImage(compressedFile);

      // Create base64 preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Try another photo.');
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        const mimeType = selectedImage.type;

        // Formulate path and request payload
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                text: "Please diagnose the disease or issue shown in this image of my crop and suggest actionable treatments.",
                isUser: true
              }
            ],
            plotData: activePlot || { crop: 'Vegetable/General' },
            userProfile: userProfile || { language: 'en' },
            imageData: base64Data,
            imageMimeType: mimeType
          })
        });

        if (!response.ok) {
          const errRes = await response.json();
          throw new Error(errRes.error || 'Server error during diagnostic check.');
        }

        const data = await response.json();
        
        // Parse unstructured list from AI into neat sections
        const rawText = data.text;
        setResult(rawText);
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to complete diagnosis. Check internet and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6 animate-fade-in bg-transparent max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl md:text-3.5xl font-black">AI Crop Disease Diagnosis</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Upload a high-quality picture of your plant&apos;s damaged leaves or affected stalks. Our AI Pathologist will diagnose the pathology and outline organic/chemical countermeasures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Upload Zone */}
        <div className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-1.5">
            <UploadCloud className="w-5 h-5 text-emerald-600" /> Upload leaf image
          </h3>

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-emerald-50/20"
            >
              <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-semibold text-gray-700">Drag & drop or Click to Browse</p>
              <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, JPEG up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Crop Leaf Preview" className="object-cover w-full h-full" />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={clearSelection}
                  className="flex-1 py-3 border border-red-100 text-red-650 hover:bg-red-50 text-red-600 rounded-2xl text-sm font-semibold transition-colors"
                >
                  Remove Photo
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Diagnosis
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-3 rounded-2xl">{error}</p>}
        </div>

        {/* Diagnosis Results */}
        <div className="space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 border border-gray-155 border-gray-100 rounded-3xl p-6 shadow-md space-y-4"
            >
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 border-b pb-3">
                <CheckCircle className="w-5 h-5 text-emerald-650 text-emerald-600" /> Diagnostic Report
              </h3>
              
              {/* Parse the response text and split it cleanly */}
              <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
                {result.split('\n').map((line, index) => {
                  if (line.trim().match(/^\d+\./)) {
                    return (
                      <div key={index} className="flex gap-2 items-start font-medium text-gray-800">
                        <span className="text-emerald-700 font-bold">{line.match(/^\d+\./)[0]}</span>
                        <p>{line.replace(/^\d+\./, '').trim()}</p>
                      </div>
                    );
                  }
                  return <p key={index} className={line.includes(':') ? "font-semibold text-gray-800" : ""}>{line}</p>;
                })}
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white/40 border border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-400 space-y-3">
              <HelpCircle className="w-12 h-12 text-gray-300" />
              <p className="text-sm font-medium">Please upload a photo of your leaf on the left and start diagnostic checks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
