'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Signup from './Signup';
import Chat from './Chat';
import LanguageSelection from './LanguageSelection'; // Import new component
import LandingPage from './LandingPage';

export default function AuthWrapper() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check for user profile to get language setting
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().language) {
          setUserProfile(userDoc.data());
        } else {
          setUserProfile(null); // No profile or language set
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleLanguageSet = async () => {
    // Re-fetch the profile after language is set
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    setUserProfile(userDoc.data());
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-green-50 to-emerald-50 text-emerald-800 font-bold text-sm">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        Loading Krishi Sakhi...
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onStart={() => setShowLanding(false)} />;
    }
    return <Signup onBack={() => setShowLanding(true)} />;
  }

  // If user is logged in but has not selected a language, show language selection screen
  if (user && !userProfile?.language) {
    return <LanguageSelection user={user} onComplete={handleLanguageSet} />;
  }

  // Once language is set, Chat component will handle the rest (onboarding, etc.)
  return <Chat user={user} />;
}
