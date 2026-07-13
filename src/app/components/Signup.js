'use client';

import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Sprout, Mail, Lock, User, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function Signup({ onBack }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err.message.replace("Firebase:", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-tr from-green-50 via-emerald-50 to-white animate-fade-in font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-3xl border border-emerald-100 shadow-xl relative">
        
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-gray-400 hover:text-emerald-700 transition-colors p-1.5 hover:bg-emerald-50 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center space-y-3">
          <div className="bg-emerald-55 bg-emerald-50 text-emerald-700 p-3.5 rounded-2xl shadow-sm border border-emerald-100">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Krishi <span className="text-emerald-650 text-emerald-600">Sakhi</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-semibold">
            {isLoginView ? 'Welcome back, Farmer!' : 'Your Personal AI Farming Assistant'}
          </p>
        </div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center py-3 bg-white border border-gray-200 hover:border-emerald-200 rounded-2xl shadow-sm hover:scale-[1.01] active:scale-98 transition-all text-gray-700 font-bold text-sm gap-2.5 disabled:opacity-50"
        >
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.05 3.1v2.57h3.31c1.94-1.78 3.06-4.4 3.06-7.47c0-.61-.06-1.21-.17-1.76M12 21c2.43 0 4.47-.8 5.96-2.2l-3.31-2.57c-.92.62-2.1.98-3.65.98c-2.81 0-5.18-1.9-6.03-4.45H1.54v2.66C3.06 18.42 7.24 21 12 21m-6.03-8.27A5.99 5.99 0 0 1 5.7 12c0-.59.1-1.17.27-1.73V7.6H1.54a10.02 10.02 0 0 0 0 8.8l4.43-3.67M12 5.77c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.46 3.09 14.43 2 12 2C7.24 2 3.06 4.58 1.54 7.6h4.43c.85-2.55 3.22-4.45 6.03-4.45Z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center">
          <hr className="flex-grow border-t border-gray-150 border-gray-250 border-gray-200"/>
          <span className="px-3 text-xs text-gray-400 font-bold tracking-widest">OR</span>
          <hr className="flex-grow border-t border-gray-150 border-gray-250 border-gray-200"/>
        </div>

        {/* Tabs for Login / Register */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button
            type="button"
            onClick={() => { setIsLoginView(true); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${isLoginView ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginView(false); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${!isLoginView ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Email form */}
        <form onSubmit={isLoginView ? handleEmailLogin : handleEmailSignup} className="space-y-4">
          {!isLoginView && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          )}
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-emerald-450 shadow-md shadow-emerald-650/10 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {isLoginView ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {error && (
          <div className="text-xs font-semibold text-center text-red-650 bg-red-50 border border-red-100 p-3.5 rounded-2xl flex items-center gap-2 animate-fade-in text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
