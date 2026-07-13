'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { signOut } from 'firebase/auth';
import { doc, setDoc, collection, query, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import ProfileModal from './ProfileModal';
import Onboarding from './Onboarding';
import Settings from './Settings';
import Dashboard from './Dashboard';
import CropRecommendation from './CropRecommendation';
import DiseaseDetection from './DiseaseDetection';
import MarketPrices from './MarketPrices';
import { uiStrings } from '../lib/i18n';
import { 
  Sprout, 
  MessageSquare, 
  ShieldAlert, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Send, 
  ChevronDown, 
  Check, 
  FolderSync, 
  Wifi, 
  WifiOff, 
  Download 
} from 'lucide-react';

// Plot Selector Dropdown Modal
function PlotSelectorModal({ plots, activePlot, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col border border-gray-100 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-base font-extrabold text-gray-900">Switch Land Plot</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <ul className="p-3 flex-1 overflow-y-auto space-y-1">
          {plots.map(plot => (
            <li key={plot.id}>
              <button
                onClick={() => onSelect(plot)}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all ${activePlot?.id === plot.id ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-100' : 'hover:bg-gray-50 text-gray-700 font-medium'}`}
              >
                <div className="min-w-0 pr-2">
                  <p className="truncate text-sm">{plot.plotName}</p>
                  <p className="text-[10px] text-gray-400 font-normal truncate mt-0.5">{plot.crop || 'No crop set'} • {plot.landSize || 'No size'}</p>
                </div>
                {activePlot?.id === plot.id && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Chat({ user }) {
  const [userProfile, setUserProfile] = useState(null);
  const [plots, setPlots] = useState([]);
  const [activePlot, setActivePlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPlotSelectorOpen, setIsPlotSelectorOpen] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [plotToEdit, setPlotToEdit] = useState(null);
  const [speechState, setSpeechState] = useState({ isSpeaking: false, isPaused: false, messageId: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [networkStatus, setNetworkStatus] = useState('online');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [micError, setMicError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const synthRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = uiStrings[userProfile?.language] || uiStrings.en;

  // PWA Installation Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setShowInstallButton(false);
        }
        setInstallPrompt(null);
      });
    }
  };

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const plotsColRef = collection(db, "users", user.uid, "plots");

    const unsubUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) setUserProfile(doc.data());
    });

    const unsubPlots = onSnapshot(query(plotsColRef, orderBy("plotName", "asc")), (snapshot) => {
      const userPlots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlots(userPlots);
      if (userPlots.length > 0) {
        if (!activePlot || !userPlots.some(p => p.id === activePlot.id)) {
          setActivePlot(userPlots[0]);
        }
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
        setActivePlot(null);
      }
      setLoading(false);
    });
    return () => { unsubUser(); unsubPlots(); };
  }, [user, activePlot]);

  useEffect(() => {
    if (!activePlot?.id || currentView !== 'chat') { setMessages([]); return; }
    const messagesColRef = collection(db, "users", user.uid, "plots", activePlot.id, "messages");
    const q = query(messagesColRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty && activePlot) {
        const welcomeText = `This is the chat for '${activePlot.plotName}'. How can I help?`;
        setMessages([{ id: 'welcome', text: welcomeText, isUser: false, timestamp: new Date() }]);
      } else {
        const fetchedMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, timestamp: doc.data().timestamp?.toDate() }));
        setMessages(fetchedMessages);
      }
    });
    return () => unsubscribe();
  }, [activePlot, user.uid, currentView]);

  const speak = useCallback((text, messageId) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = userProfile?.language ? `${userProfile.language}-IN` : 'en-IN';
      utterance.onstart = () => setSpeechState({ isSpeaking: true, isPaused: false, messageId });
      utterance.onpause = () => setSpeechState(prev => ({ ...prev, isPaused: true }));
      utterance.onresume = () => setSpeechState(prev => ({ ...prev, isPaused: false }));
      utterance.onend = () => setSpeechState({ isSpeaking: false, isPaused: false, messageId: null });
      utterance.onerror = () => setSpeechState({ isSpeaking: false, isPaused: false, messageId: null });
      synthRef.current.speak(utterance);
    }
  }, [userProfile]);

  const handleSpeechControl = (action) => {
    if (!synthRef.current) return;
    if (action === 'pause') synthRef.current.pause();
    if (action === 'resume') synthRef.current.resume();
    if (action === 'stop') synthRef.current.cancel();
  };

  const handleSendMessage = useCallback(async (text, imageFile = null) => {
    const messageText = text.trim();
    if ((!messageText && !imageFile) || isLoadingAI || !activePlot) return;

    setInputMessage('');
    setImagePreview(null);
    setIsLoadingAI(true);

    const messagesColRef = collection(db, "users", user.uid, "plots", activePlot.id, "messages");

    let imageInfo = null;
    if (imageFile) {
      const reader = new FileReader();
      imageInfo = await new Promise((resolve) => {
        reader.readAsDataURL(imageFile);
        reader.onloadend = () => {
          resolve({
            base64: reader.result.split(',')[1],
            type: imageFile.type,
            url: URL.createObjectURL(imageFile)
          });
        };
      });
    }

    const userMessage = { text: messageText, isUser: true, timestamp: new Date(), imageUrl: imageInfo?.url || null };
    await addDoc(messagesColRef, userMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          plotData: activePlot,
          userProfile,
          imageData: imageInfo?.base64 || null,
          imageMimeType: imageInfo?.type || null
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to get response.');
      const result = await response.json();
      let aiText = result.text;

      if (aiText.includes("PROACTIVE_UPDATE_SUGGESTION:")) {
        const parts = aiText.split("PROACTIVE_UPDATE_SUGGESTION:");
        aiText = parts[0].trim();
        const cropToUpdate = parts[1].trim();
        const updateMessage = {
          text: `Shall I update your plot details to show you are growing ${cropToUpdate}?`,
          isUser: false, isUpdateSuggestion: true, crop: cropToUpdate, timestamp: new Date()
        };
        if (aiText) {
          const aiMsgDoc = await addDoc(messagesColRef, { text: aiText, isUser: false, timestamp: new Date() });
          speak(aiText, aiMsgDoc.id);
        }
        await addDoc(messagesColRef, updateMessage);
      } else {
        const aiResponse = { text: aiText, isUser: false, timestamp: new Date() };
        const docRef = await addDoc(messagesColRef, aiResponse);
        speak(aiText, docRef.id);
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorResponse = { text: `Sorry, an error occurred: ${error.message}`, isUser: false, timestamp: new Date() };
      const docRef = await addDoc(messagesColRef, errorResponse);
      speak(errorResponse.text, docRef.id);
    } finally {
      setIsLoadingAI(false);
    }
  }, [isLoadingAI, messages, activePlot, user.uid, userProfile, speak]);

  const executeSend = useCallback(() => {
    handleSendMessage(inputMessage, imagePreview?.file);
  }, [handleSendMessage, inputMessage, imagePreview]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = userProfile?.language ? `${userProfile.language}-IN` : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setMicError('');
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
        };

        recognition.onerror = (event) => {
          if (event.error === 'not-allowed') {
            setMicError('Microphone permission denied. Please allow access in your browser settings.');
          } else if (event.error !== 'no-speech') {
            setMicError('An error occurred with speech recognition.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [userProfile]);

  const handleSignOut = () => signOut(auth);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      setMicError('Speech recognition is not supported by your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      synthRef.current.cancel();
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setMicError('Could not start microphone. Please try again.');
        setIsListening(false);
      }
    }
  };

  const handleSavePlot = async (plotData) => {
    const plotId = plotToEdit?.id || Date.now().toString();
    const plotDocRef = doc(db, "users", user.uid, "plots", plotId);
    const dataToSave = { ...plotData, location: plotData.location || initialLocation || '' };
    await setDoc(plotDocRef, dataToSave, { merge: true });
    if (!plotToEdit) setActivePlot({ id: plotDocRef.id, ...dataToSave });
    setIsProfileModalOpen(false);
    setPlotToEdit(null);
  };

  const handleUpdateUser = async (userData) => {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, userData, { merge: true });
  };

  const handleUpdateCrop = async (plot, crop) => {
    if (!plot) return;
    const plotDocRef = doc(db, "users", user.uid, "plots", plot.id);
    await setDoc(plotDocRef, { crop: crop }, { merge: true });
    const messagesColRef = collection(db, "users", user.uid, "plots", plot.id, "messages");
    await addDoc(messagesColRef, { text: `Ok, I've updated your plot to show you are growing ${crop}. What's our next step?`, isUser: false, timestamp: new Date() });
  };

  const openModalForNewPlot = () => { setPlotToEdit(null); setIsProfileModalOpen(true); };
  const openModalForEdit = (plot) => { setPlotToEdit(plot); setIsProfileModalOpen(true); };

  const handleOnboardingFinish = (detectedLocation) => {
    setInitialLocation(detectedLocation);
    setShowOnboarding(false);
    openModalForNewPlot();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setImagePreview({ file: compressedFile, url: URL.createObjectURL(compressedFile) });
    } catch (error) {
      console.error("Image compression error:", error);
      setImagePreview({ file, url: URL.createObjectURL(file) });
    }

    event.target.value = null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-green-50 to-emerald-50 text-emerald-800 font-bold text-sm">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        Loading Your Farm...
      </div>
    );
  }
  
  if (showOnboarding) return <Onboarding onComplete={handleOnboardingFinish} />;

  // Sidebar Links Structure
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FolderSync className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'cropRec', label: 'Crop Advisor', icon: <Sprout className="w-5 h-5" /> },
    { id: 'disease', label: 'Disease Scanner', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'market', label: 'Market Prices', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> }
  ];

  return (
    <div className="flex h-screen w-full bg-[#f4f7f5] overflow-hidden text-gray-800 font-sans">
      
      {/* Mobile Sidebar Slide-Over Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-emerald-950 text-white flex flex-col justify-between transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-emerald-900/40">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="bg-emerald-700 text-white p-2.5 rounded-2xl shadow-inner">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight">
              Krishi <span className="text-emerald-450">Sakhi</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-emerald-900 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${currentView === item.id ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-100/75 hover:bg-emerald-900 hover:text-white'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-emerald-900/40 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-emerald-900/25 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-850 flex items-center justify-center font-bold text-emerald-100 text-sm border border-emerald-700/50">
              {userProfile?.name?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate text-white">{userProfile?.name || 'Farmer'}</p>
              <p className="text-[10px] text-emerald-350 truncate text-emerald-400 font-semibold">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-2xl text-xs font-bold transition-all border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header Dashboard Banner */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex justify-between items-center shrink-0 z-25 relative shadow-sm">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-2xl text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Active land plot indicator with drop selector */}
            {activePlot ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlotSelectorOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-extrabold text-gray-800 transition-colors shadow-sm"
                >
                  <span className="max-w-[120px] sm:max-w-[200px] truncate">{activePlot.plotName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
                <button 
                  onClick={() => openModalForEdit(activePlot)}
                  className="p-2 hover:bg-emerald-50 text-emerald-700 rounded-xl transition-colors hidden sm:block border border-transparent hover:border-emerald-100"
                  title="Configure Plot"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={openModalForNewPlot}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold transition-colors shadow-sm"
              >
                + Add Land Plot
              </button>
            )}
          </div>

          {/* Right Header indicators (Network PWA state) */}
          <div className="flex items-center gap-2.5">
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Install PWA</span>
              </button>
            )}

            {networkStatus === 'offline' ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl shrink-0">
                <WifiOff className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Offline</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl shrink-0">
                <Wifi className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Online</span>
              </span>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Inner Panel View Routing */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {currentView === 'dashboard' && (
            <Dashboard
              user={user}
              userProfile={userProfile}
              plots={plots}
              activePlot={activePlot}
              onEditPlot={openModalForEdit}
            />
          )}

          {currentView === 'cropRec' && (
            <CropRecommendation
              activePlot={activePlot}
              userProfile={userProfile}
            />
          )}

          {currentView === 'disease' && (
            <DiseaseDetection
              activePlot={activePlot}
              userProfile={userProfile}
            />
          )}

          {currentView === 'market' && (
            <MarketPrices
              activePlot={activePlot}
            />
          )}

          {currentView === 'settings' && (
            <Settings
              user={user}
              userProfile={userProfile}
              onUpdateUser={handleUpdateUser}
              plots={plots}
              onEditPlot={(plot) => {
                openModalForEdit(plot);
              }}
              onAddNewPlot={openModalForNewPlot}
              onClose={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'chat' && (
            <>
              {/* Messages Panel */}
              <main className="flex-1 overflow-y-auto p-4 bg-[#f8faf8] scroll-smooth">
                <div className="max-w-4xl mx-auto w-full space-y-4 py-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`w-fit max-w-[85%] sm:max-w-[70%] rounded-3xl px-5 py-3.5 relative transition-all duration-300 animate-fade-in ${msg.isUser ? 'bg-emerald-700 text-white shadow-md rounded-tr-none' : 'bg-white text-gray-800 border border-emerald-50 shadow-sm rounded-tl-none'}`}>

                        {msg.imageUrl && (
                          <div className="relative w-[220px] aspect-video mb-3 rounded-2xl overflow-hidden shadow-inner sm:w-[280px] border border-gray-100">
                            <Image
                              src={msg.imageUrl}
                              alt="User upload"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {msg.text && (
                          <p className="text-sm leading-relaxed break-words font-medium" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                        )}

                        {/* Text to Speech Button Controls */}
                        {!msg.isUser && !msg.isUpdateSuggestion && (
                          <div className="absolute -bottom-3 right-4 flex space-x-1 bg-white/95 backdrop-blur-sm border border-gray-150 rounded-full p-0.5 shadow-md">
                            {speechState.isSpeaking && speechState.messageId === msg.id ? (
                              <>
                                <button 
                                  onClick={() => speechState.isPaused ? handleSpeechControl('resume') : handleSpeechControl('pause')} 
                                  className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full w-6 h-6 flex items-center justify-center shadow transition-colors"
                                >
                                  {speechState.isPaused ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                                </button>
                                <button 
                                  onClick={() => handleSpeechControl('stop')} 
                                  className="bg-red-500 text-white hover:bg-red-655 text-red-650 text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => speak(msg.text, msg.id)} 
                                className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full w-6 h-6 flex items-center justify-center shadow transition-colors"
                                title="Listen"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                        
                        {msg.isUpdateSuggestion && (
                          <div className="mt-2.5 pt-2.5 border-t border-emerald-100 flex flex-col space-y-1">
                            <button 
                              onClick={() => handleUpdateCrop(activePlot, msg.crop)} 
                              className="w-full text-left text-xs font-bold text-emerald-700 hover:bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 transition-colors"
                            >
                              {t.updatePlotTo(msg.crop)}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoadingAI && (
                    <div className="flex justify-start">
                      <div className="w-fit rounded-3xl px-5 py-4 bg-white border border-emerald-50 shadow-sm rounded-tl-none flex items-center gap-1.5">
                        <span className="text-xs text-gray-400 font-bold tracking-wide mr-1 uppercase">{t.typing || 'Sakhi is typing'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 typing-dot"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 typing-dot"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 typing-dot"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </main>

              {/* Chat Input Console */}
              <div className="bg-white border-t border-gray-100 shrink-0 p-3 pb-safe-bottom z-10 shadow-lg">
                {imagePreview && (
                  <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl mb-2 flex items-center gap-3 relative animate-fade-in max-w-sm">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white shadow-sm flex-shrink-0">
                      <Image src={imagePreview.url} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-gray-700 truncate">Image Attached</p>
                      <p className="text-[10px] text-gray-450 font-semibold truncate">Ready to analyze leaf pathology</p>
                    </div>
                    <button 
                      onClick={() => setImagePreview(null)} 
                      className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                {micError && <p className="text-xs font-semibold text-red-650 text-center pb-2 text-red-650">{micError}</p>}
                
                <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  
                  <button 
                    title="Camera/Image Upload" 
                    onClick={() => fileInputRef.current.click()} 
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl w-12 h-12 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <input 
                    type="text" 
                    placeholder={imagePreview ? "Ask a question about this crop leaf..." : t.inputPlaceholder} 
                    value={inputMessage} 
                    onChange={(e) => setInputMessage(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && executeSend()} 
                    className="flex-grow px-4.5 py-3 bg-gray-50 border border-gray-250 border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-450 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner" 
                  />

                  <button 
                    onClick={executeSend} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl w-12 h-12 flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>

                  <button 
                    onClick={toggleListen} 
                    className={`text-white rounded-2xl w-12 h-12 flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all ${isListening ? 'mic-active bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- POPUP MODALS --- */}
      {isPlotSelectorOpen && (
        <PlotSelectorModal
          plots={plots}
          activePlot={activePlot}
          onClose={() => setIsPlotSelectorOpen(false)}
          onSelect={(plot) => {
            setActivePlot(plot);
            setIsPlotSelectorOpen(false);
          }}
        />
      )}
      
      {isProfileModalOpen && (
        <ProfileModal 
          plotData={plotToEdit || { location: initialLocation }} 
          onSave={handleSavePlot} 
          onClose={() => { 
            setIsProfileModalOpen(false); 
            setPlotToEdit(null); 
          }} 
        />
      )}
    </div>
  );
}
