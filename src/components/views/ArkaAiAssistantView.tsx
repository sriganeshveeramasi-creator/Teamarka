"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import ActiveRouteIndicator from '@/components/common/ActiveRouteIndicator';
import {
  processArkaQuery,
  ArkaAssistantResponse,
  ArkaRouteDetails,
  ArkaMapAction,
} from '@/services/arkaAssistantService';
import {
  DEMO_DATA,
  AccessibilityFacility,
  CityWeather,
  CorridorTraffic,
} from '@/data/demoData';
import { VEHICLE_OPTIONS, VehicleOption } from '@/data/northeastData';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  Navigation,
  Activity,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Truck,
  IndianRupee,
  AlertTriangle,
  Hospital,
  Fuel,
  CheckCircle2,
  AlertOctagon,
  Layers,
  Phone,
  Compass,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'arka';
  text: string;
  time: string;
  response?: ArkaAssistantResponse;
}

const QUICK_ACTION_BUTTONS = [
  { label: '🗺️ Find Route', query: 'Find the safest route from Guwahati to Imphal' },
  { label: '🚦 Traffic', query: 'What is the traffic situation?' },
  { label: '🌦️ Weather', query: 'What is the weather?' },
  { label: '⚠️ Risk', query: 'Is there a landslide risk?' },
  { label: '🏥 Nearby Hospital', query: 'Find the nearest hospital' },
  { label: '⛽ Fuel Station', query: 'Find a fuel station' },
];

export default function ArkaAiAssistantView() {
  const { currentRouteResult, calculateRoute, routeRisks, routeEmergencyData, setActiveView, t } = useApp();

  // Chat conversation state
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Selected vehicle for routing context
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    currentRouteResult?.vehicle?.id || 'mini_truck'
  );

  // Map layer controls synchronized with ARKA AI
  const [mapSettings, setMapSettings] = useState<{
    highlightRoute: boolean;
    showTraffic: boolean;
    showTolls: boolean;
    showSignals: boolean;
    showRisks: boolean;
    showFacilities: boolean;
    activeShipmentPoint?: { x: number; y: number; label?: string };
    focusedPoint?: { x: number; y: number; label?: string };
  }>({
    highlightRoute: true,
    showTraffic: true,
    showTolls: true,
    showSignals: true,
    showRisks: true,
    showFacilities: false,
  });

  const [mapFocusNotice, setMapFocusNotice] = useState<string | null>(null);

  // Conversation history in React state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'arka',
      text: currentRouteResult?.sourceCity
        ? `Hello! I am ARKA AI, your specialized logistics & accessibility assistant for Northeast India. I am currently monitoring the active corridor: ${currentRouteResult.sourceCity} (${currentRouteResult.sourceState}) ➔ ${currentRouteResult.destCity} (${currentRouteResult.destState}). How can I assist your convoy today?`
        : "Hello! I am ARKA AI, your specialized logistics & accessibility assistant for Northeast India. You can ask me about routes, traffic, weather, road risks, tolls, shipments, or nearby emergency facilities.",
      time: 'Just now',
      response: {
        id: 'welcome-resp',
        intent: 'unknown',
        text: "Hello! I am ARKA AI, your specialized logistics & accessibility assistant for Northeast India.",
        suggestedPrompts: [
          'Find the safest route from Guwahati to Imphal',
          'What is the traffic situation?',
          'How many toll gates are there?',
          'What is the weather?',
          'Is there a landslide risk?',
          'Find the nearest hospital',
          'Track my shipment',
        ],
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    `Hey ARKA, find the safest route from ${currentRouteResult?.sourceCity || 'Guwahati'} to ${currentRouteResult?.destCity || 'Imphal'}.`,
    `Hey ARKA, what is the traffic situation on this corridor?`,
    `Hey ARKA, find the nearest hospital along this route.`,
    `Hey ARKA, is there any landslide alert reported?`,
  ];

  const activeVehicle =
    VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleId) ||
    currentRouteResult?.vehicle ||
    VEHICLE_OPTIONS[4];

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  // Handle sending user query to ARKA assistant engine
  const handleSendMessage = (textOverride?: string) => {
    const query = (textOverride || inputMessage).trim();
    if (!query) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to history
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInputMessage('');
    setIsAnalyzing(true);
    setVoiceError(null);

    // Call modular ARKA AI assistant engine with realistic thinking delay
    setTimeout(() => {
      const response = processArkaQuery(query, {
        currentRouteResult,
        selectedVehicleId,
        selectedVehicle: activeVehicle,
      });

      // Synchronize with AppContext when route is returned
      if (response.routeData) {
        calculateRoute(
          response.routeData.sourceState,
          response.routeData.source,
          response.routeData.destState,
          response.routeData.destination,
          selectedVehicleId
        );
      }

      // Synchronize Map Layers with Assistant Action
      if (response.mapAction) {
        setMapSettings((prev) => ({
          ...prev,
          highlightRoute: response.mapAction?.highlightRoute ?? prev.highlightRoute,
          showTraffic: response.mapAction?.showTraffic ?? prev.showTraffic,
          showTolls: response.mapAction?.showTolls ?? prev.showTolls,
          showSignals: response.mapAction?.showSignals ?? prev.showSignals,
          showRisks: response.mapAction?.showRisks ?? prev.showRisks,
          showFacilities: response.mapAction?.showFacilities ?? prev.showFacilities,
          activeShipmentPoint: response.mapAction?.activeShipmentPoint,
          focusedPoint: response.mapAction?.focusedPoint,
        }));

        if (response.intent === 'route') {
          setMapFocusNotice(`Map Updated: Showing Corridor ${response.routeData?.source} ➔ ${response.routeData?.destination}`);
        } else if (response.intent === 'traffic') {
          setMapFocusNotice('Map Updated: Traffic & Signals Layer Highlighted');
        } else if (response.intent === 'tolls') {
          setMapFocusNotice('Map Updated: Toll Plazas Highlighted');
        } else if (response.intent === 'risk') {
          setMapFocusNotice('Map Updated: Active Landslide & Risk Zones Highlighted');
        } else if (response.intent === 'nearby') {
          setMapFocusNotice('Map Updated: Facilities & Services Layer Pinned');
        } else if (response.intent === 'shipment') {
          setMapFocusNotice('Map Updated: Live Fleet GPS Position Pinned');
        }
        setTimeout(() => setMapFocusNotice(null), 4000);
      }

      const arkaMsg: ChatMessage = {
        id: response.id,
        sender: 'arka',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response,
      };

      setMessages((prev) => [...prev, arkaMsg]);
      setIsAnalyzing(false);
    }, 550);
  };

  // Focus Map view on button click
  const handleFocusOnMap = (point?: { x: number; y: number; label?: string }) => {
    if (point) {
      setMapSettings((prev) => ({
        ...prev,
        showFacilities: true,
        focusedPoint: point,
      }));
    }
    setMapFocusNotice('Map Centered & Highlighted');
    setTimeout(() => setMapFocusNotice(null), 3000);

    // Scroll to map smoothly on mobile devices
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Browser Speech Recognition with honest fallback
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceStatusText(null);
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Please use the text input.');
      setTimeout(() => setVoiceError(null), 5000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusText('🎙️ Listening...');
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceStatusText("Got it. I'm analyzing your request.");
        setInputMessage(transcript);
        setIsListening(false);

        // Process recognized text directly
        setTimeout(() => {
          setVoiceStatusText(null);
          handleSendMessage(transcript);
        }, 500);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setVoiceStatusText(null);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access or type your query.');
        } else {
          setVoiceError('Could not recognize voice input. Please speak clearly or use text input.');
        }
        setTimeout(() => setVoiceError(null), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setVoiceStatusText(null);
      setVoiceError('Voice input could not be started. Please use the text input.');
      setTimeout(() => setVoiceError(null), 5000);
    }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-blue-600 p-5 sm:p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner shrink-0">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">ARKA AI</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wide">
                Interactive Assistant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-purple-100 mt-0.5">
              Northeast Logistics, Terrain Accessibility & Hill Fleet Navigator
            </p>
          </div>
        </div>


        {/* Vehicle Selector & Voice Wake Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Vehicle Selector */}
          <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-xs text-white">
            <Truck className="w-4 h-4 text-cyan-300" />
            <span className="text-purple-200 font-medium hidden sm:inline">Vehicle:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
            >
              {VEHICLE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                  {v.name} ({v.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Voice Wake Phrase Tag */}
          <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-xs text-white">
            <Volume2 className="w-4 h-4 text-cyan-300" />
            <span className="text-purple-200 font-medium hidden sm:inline">Voice Wake:</span>
            <span className="font-bold text-white font-mono">&ldquo;Hey ARKA&rdquo;</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>
        </div>
      </div>

      {/* Active Route Corridor Banner */}
      <ActiveRouteIndicator />

      {/* Quick Action Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </p>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click any button to trigger instant logistics analysis
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {QUICK_ACTION_BUTTONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSendMessage(item.query)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 shrink-0 font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Status or Error Alert Banners */}
      {voiceStatusText && (
        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span>{voiceStatusText}</span>
        </div>
      )}

      {voiceError && (
        <div className="p-3 bg-amber-500/10 border border-amber-300 text-amber-900 rounded-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Map Notification Notice */}
      {mapFocusNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{mapFocusNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => handleFocusOnMap()}
            className="text-emerald-700 underline font-bold text-[11px]"
          >
            Scroll to Map
          </button>
        </div>
      )}

      {/* Main Responsive Grid: Map + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (Desktop) / TOP (Mobile): Synchronized Interactive Vector Map */}
        <div
          ref={mapSectionRef}
          className="lg:col-span-5 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 order-1 lg:order-1"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Synchronized Regional Map
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              AI Connected
            </span>
          </div>

          {/* Northeast Interactive SVG Map with external layer controls */}
          <div className="rounded-2xl overflow-hidden border border-slate-700">
            <NortheastInteractiveMap
              highlightRoute={mapSettings.highlightRoute}
              externalShowTraffic={mapSettings.showTraffic}
              externalShowTolls={mapSettings.showTolls}
              externalShowSignals={mapSettings.showSignals}
              externalShowRisks={mapSettings.showRisks}
              externalShowFacilities={mapSettings.showFacilities}
              activeShipmentPoint={mapSettings.activeShipmentPoint}
              focusedPoint={mapSettings.focusedPoint}
              heightClass="h-[320px] sm:h-[380px] lg:h-[440px]"
            />
          </div>

          {/* Quick Map Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600">
            <span className="font-medium">Active Layer States:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full font-bold ${mapSettings.showTraffic ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                Traffic: {mapSettings.showTraffic ? 'ON' : 'OFF'}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${mapSettings.showRisks ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'}`}>
                Risks: {mapSettings.showRisks ? 'ON' : 'OFF'}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${mapSettings.showFacilities ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'}`}>
                Facilities: {mapSettings.showFacilities ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Desktop) / BOTTOM (Mobile): Chat Stream & Input */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[640px] order-2 lg:order-2 overflow-hidden">
          {/* Chat Stream Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                🤖
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm leading-tight">
                  ARKA Conversation Stream
                </h2>
                <p className="text-[11px] text-slate-500">
                  Ready for queries • Vehicle: <span className="font-semibold text-purple-700">{activeVehicle.name}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMessages([
                  {
                    id: `welcome-${Date.now()}`,
                    sender: 'arka',
                    text: 'Conversation reset. How can I assist with your logistics corridors today?',
                    time: 'Just now',
                  },
                ]);
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-purple-600 px-2.5 py-1 rounded-lg hover:bg-purple-50 transition-colors"
              title="Reset Chat Session"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/90 shadow-xs'
                  }`}
                >
                  {/* Sender metadata */}
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 pb-1 border-b border-black/5">
                    <span className="font-bold uppercase tracking-wider">
                      {msg.sender === 'user' ? 'You' : 'ARKA AI Intelligence'}
                    </span>
                    <span>{msg.time}</span>
                  </div>

                  {/* Message Formatted Text */}
                  <div className="leading-relaxed font-medium whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* ================= 1. ROUTE RESULT CARD ================= */}
                  {msg.response?.routeData && (
                    <div className="bg-white rounded-2xl border-2 border-purple-300/80 p-4 text-slate-800 space-y-4 shadow-sm mt-2">
                      {/* Route Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🤖</span>
                          <div>
                            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                              ARKA AI
                            </span>
                            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1">
                              Recommended Route <span className="text-amber-500">⭐</span>
                            </h4>
                          </div>
                        </div>

                        <div className="text-right bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                            Route Score
                          </span>
                          <span className="text-sm font-black text-emerald-700">
                            {msg.response.routeData.routeScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Route Steps Vertical Timeline */}
                      <div className="bg-gradient-to-b from-purple-50/80 to-blue-50/50 p-3.5 rounded-xl border border-purple-100/80">
                        <span className="text-[10px] font-bold uppercase text-purple-800 tracking-wide block mb-2">
                          Corridor Waypoints:
                        </span>
                        <div className="flex flex-col space-y-1 text-xs font-bold text-slate-800">
                          {msg.response.routeData.corridorSteps.map((step, idx, arr) => (
                            <React.Fragment key={step}>
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-emerald-500 ring-2 ring-emerald-200' : idx === arr.length - 1 ? 'bg-rose-500 ring-2 ring-rose-200' : 'bg-purple-500'}`} />
                                <span>{step}</span>
                                {idx === 0 && <span className="text-[10px] text-emerald-700 font-semibold">(Origin)</span>}
                                {idx === arr.length - 1 && <span className="text-[10px] text-rose-700 font-semibold">(Destination)</span>}
                              </div>
                              {idx < arr.length - 1 && (
                                <div className="text-purple-400 pl-1 text-[11px] leading-none">
                                  ↓
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Metrics 2x4 Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Distance</span>
                          <span className="font-black text-slate-800 text-sm">{msg.response.routeData.distanceStr}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">ETA</span>
                          <span className="font-black text-blue-600 text-sm">{msg.response.routeData.etaStr}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Traffic</span>
                          <span className="font-black text-emerald-600 text-sm">
                            {msg.response.routeData.trafficPercent}% ({msg.response.routeData.trafficLevel})
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Traffic Signals</span>
                          <span className="font-black text-amber-600 text-sm">
                            {msg.response.routeData.trafficSignalsCount} (~{msg.response.routeData.signalDelayMins}m delay)
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Toll Gates</span>
                          <span className="font-black text-indigo-600 text-sm">{msg.response.routeData.tollGatesCount} Plazas</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Toll Cost</span>
                          <span className="font-black text-slate-800 text-sm">₹{msg.response.routeData.tollCost}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Risk</span>
                          <span className="font-black text-emerald-700 text-sm">{msg.response.routeData.riskLevel}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Accessibility</span>
                          <span className="font-black text-purple-700 text-sm">{msg.response.routeData.accessibilityScore}%</span>
                        </div>
                      </div>

                      {/* Why this route reasoning */}
                      <div className="p-3 bg-purple-50/90 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-1">
                        <p className="font-bold text-purple-900 text-[11px] uppercase tracking-wide">
                          Why this route?
                        </p>
                        <p className="leading-relaxed italic">
                          &ldquo;{msg.response.routeData.whyThisRoute}&rdquo;
                        </p>
                        {msg.response.routeData.vehicleNote && (
                          <p className="text-[11px] text-purple-800 font-medium pt-1">
                            🚛 {msg.response.routeData.vehicleNote}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons: View on Map & Open Route Engine */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleFocusOnMap()}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>VIEW ON MAP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveView('route-opt')}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Open Full Route Optimization & Turn-by-Turn GPS Page"
                        >
                          <span>Open in Route Engine</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================= 2. NEARBY FACILITIES CARDS ================= */}
                  {msg.response?.facilities && msg.response.facilities.length > 0 && (
                    <div className="space-y-2 mt-2 pt-1 border-t border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Facility Information Cards:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.response.facilities.map((fac) => (
                          <div
                            key={fac.id}
                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="font-bold text-xs text-slate-900 leading-tight">
                                {fac.name}
                              </h5>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold shrink-0">
                                {fac.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              📍 {fac.location}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                              <span>Distance: <strong className="text-slate-800">{fac.distanceKm} km</strong></span>
                              <span>ETA: <strong className="text-blue-600">{fac.travelTime}</strong></span>
                            </div>
                            <div className="flex items-center justify-between pt-1 text-[10px]">
                              <span className="text-emerald-700 font-medium">{fac.status}</span>
                              <button
                                type="button"
                                onClick={() => handleFocusOnMap({ x: fac.x, y: fac.y, label: fac.name })}
                                className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded cursor-pointer"
                              >
                                View on Map
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ================= 3. SUGGESTED FOLLOW-UP PROMPTS ================= */}
                  {msg.response?.suggestedPrompts && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Suggested Follow-ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.response.suggestedPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/90 hover:bg-purple-100 text-purple-800 border border-purple-200/80 font-medium transition-colors cursor-pointer"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* "ARKA is analyzing..." Loading State Indicator */}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-purple-900 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-3 shadow-xs">
                  <div className="relative flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-600 animate-ping absolute" />
                    <span className="w-3 h-3 rounded-full bg-purple-600 relative" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <span>ARKA is analyzing...</span>
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice & Text Input Box */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Input Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                }`}
                title={isListening ? 'Listening (Click to stop)' : 'Click to Speak ("Hey ARKA...")'}
              >
                {isListening ? <Mic className="w-5 h-5 text-white animate-bounce" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? 'Listening to speech...' : 'Ask ARKA about routes, traffic, weather, risks, hospitals...'}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-medium"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
