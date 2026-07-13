'use client';

import { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function LanguageSelection({ user, onComplete }) {
    const [loading, setLoading] = useState(false);

    const selectLanguage = async (lang) => {
        setLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        try {
            await setDoc(userDocRef, { language: lang }, { merge: true });
            onComplete(); // Signal to the AuthWrapper that language is set.
        } catch (error) {
            console.error("Error saving language:", error);
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent p-4 animate-fade-in">
            <div className="w-full max-w-md p-8 text-center glass-panel rounded-3xl shadow-xl border border-white/20">
                <div className="bg-green-50 text-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <i className="fas fa-language text-3.5xl"></i>
                </div>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Choose Your Language</h1>
                <p className="text-gray-500 text-sm mt-2 mb-8">Select your preferred language to customize your Krishi Sakhi advisor.</p>
                <div className="space-y-4">
                    <button 
                      onClick={() => selectLanguage('en')} 
                      disabled={loading} 
                      className="w-full px-5 py-3.5 font-bold text-gray-700 bg-white hover:bg-green-50/50 border border-gray-100 hover:border-green-250 hover:border-green-200 rounded-2xl shadow-sm hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-between"
                    >
                        <span>English</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-lg font-semibold">EN</span>
                    </button>
                    <button 
                      onClick={() => selectLanguage('hi')} 
                      disabled={loading} 
                      className="w-full px-5 py-3.5 font-bold text-gray-700 bg-white hover:bg-green-50/50 border border-gray-100 hover:border-green-250 hover:border-green-200 rounded-2xl shadow-sm hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-between"
                    >
                        <span>हिंदी (Hindi)</span>
                        <span className="text-xs bg-orange-50 text-orange-650 px-2.5 py-0.5 rounded-lg font-semibold">HI</span>
                    </button>
                    <button 
                      onClick={() => selectLanguage('ml')} 
                      disabled={loading} 
                      className="w-full px-5 py-3.5 font-bold text-gray-700 bg-white hover:bg-green-50/50 border border-gray-100 hover:border-green-250 hover:border-green-200 rounded-2xl shadow-sm hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-between"
                    >
                        <span>മലയാളം (Malayalam)</span>
                        <span className="text-xs bg-blue-50 text-blue-650 px-2.5 py-0.5 rounded-lg font-semibold">ML</span>
                    </button>
                </div>
                
                <button
                    onClick={() => signOut(auth)}
                    className="mt-6 text-xs text-red-500 hover:text-red-700 font-bold tracking-wide flex items-center justify-center gap-1 mx-auto"
                >
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        </div>
    );
}
