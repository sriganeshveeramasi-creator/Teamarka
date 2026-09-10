"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import ActiveRouteIndicator from '@/components/common/ActiveRouteIndicator';
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
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'arka';
  text: string;
  time: string;
  hasRouteCard?: boolean;
  routeData?: {
    source: string;
    destination: string;
    distance: string;
    eta: string;
    traffic: string;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    accessibility: string;
    score: number;
    explanation: string;
  };
}

export default function ArkaAiAssistantView() {
  const { currentRouteResult, routeRisks, routeEmergencyData, setActiveView, t } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceWakeActive, setVoiceWakeActive] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'arka',
      text: `Hello! I am ARKA AI, your specialized logistics & accessibility assistant for Northeast India. I am currently monitoring the active corridor: ${currentRouteResult.sourceCity} (${currentRouteResult.sourceState}) ➔ ${currentRouteResult.destCity} (${currentRouteResult.destState}). How can I assist your convoy today?`,
      time: 'Just now',
    },
  ]);

  const sampleQuestions = [
    `Hey ARKA, find the safest route from ${currentRouteResult.sourceCity} to ${currentRouteResult.destCity}.`,
    `Hey ARKA, what is the traffic situation on this corridor?`,
    `Hey ARKA, find the nearest hospital along this route.`,
    `Hey ARKA, is there any landslide alert reported?`,
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Simulate ARKA AI intelligent response referencing active corridor
    setTimeout(() => {
      let arkaResponse: ChatMessage;
      const lower = query.toLowerCase();

      if (
        lower.includes('route') ||
        lower.includes('safest route') ||
        lower.includes(currentRouteResult.sourceCity.toLowerCase()) ||
        lower.includes(currentRouteResult.destCity.toLowerCase())
      ) {
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: `I analyzed the road network, elevation profile, and active telemetry for your active corridor (${currentRouteResult.sourceCity} to ${currentRouteResult.destCity}). Here is the verified route configuration:`,
          time: 'Just now',
          hasRouteCard: true,
          routeData: {
            source: `${currentRouteResult.sourceCity}, ${currentRouteResult.sourceState}`,
            destination: `${currentRouteResult.destCity}, ${currentRouteResult.destState}`,
            distance: `${currentRouteResult.distanceKm} km`,
            eta: currentRouteResult.eta,
            traffic: `${currentRouteResult.trafficPercent}% (${currentRouteResult.trafficPercent > 35 ? 'Moderate' : 'Low'})`,
            risk: currentRouteResult.landslideRisk,
            accessibility: `${currentRouteResult.accessibilityScore}%`,
            score: currentRouteResult.routeScore,
            explanation: currentRouteResult.reasoning,
          },
        };
      } else if (lower.includes('traffic')) {
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: `Current Corridor Traffic Status: The road between ${currentRouteResult.sourceCity} and ${currentRouteResult.destCity} currently shows ${currentRouteResult.trafficPercent}% density. Real-time road monitoring indicates ${currentRouteResult.trafficPercent > 35 ? 'moderate flow along hill stretches; drive with cautious headway.' : 'smooth transit conditions with minimal bottlenecking.'} Traffic signals: ${currentRouteResult.trafficSignalsCount} synchronized.`,
          time: 'Just now',
        };
      } else if (lower.includes('hospital') || lower.includes('medical') || lower.includes('trauma')) {
        const hosp = routeEmergencyData.nearestHospital;
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: `The nearest primary emergency trauma facility for the ${currentRouteResult.sourceCity} ➔ ${currentRouteResult.destCity} corridor is ${hosp.name} (${hosp.location}), located ${hosp.distanceKm} km away (~${hosp.travelTime} ETA). Status: ${hosp.status}. Emergency Hotline: ${hosp.phone}.`,
          time: 'Just now',
        };
      } else if (lower.includes('landslide') || lower.includes('hazard') || lower.includes('risk')) {
        if (routeRisks.length > 0) {
          const r = routeRisks[0];
          arkaResponse = {
            id: `msg-${Date.now() + 1}`,
            sender: 'arka',
            text: `Hazard Alert along ${currentRouteResult.sourceCity} ➔ ${currentRouteResult.destCity}: ${r.category} alert (${r.severity} Severity, ${r.percentage}% probability) reported at ${r.location}. Observation: ${r.description} Advisory: ${r.advisory}`,
            time: 'Just now',
          };
        } else {
          arkaResponse = {
            id: `msg-${Date.now() + 1}`,
            sender: 'arka',
            text: `Terrain telemetry indicates normal conditions along ${currentRouteResult.sourceCity} ➔ ${currentRouteResult.destCity}. No severe slope failures or road blockages are currently flagged by PWD or Border Roads patrols.`,
            time: 'Just now',
          };
        }
      } else {
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: `I have received your request regarding: "${query}". I am actively tracking distance (${currentRouteResult.distanceKm} km), travel time (${currentRouteResult.eta}), weather risks, and fuel costs for your ${currentRouteResult.sourceCity} ➔ ${currentRouteResult.destCity} corridor (${currentRouteResult.vehicle?.name || 'Mini Truck'}).`,
          time: 'Just now',
        };
      }

      setMessages((prev) => [...prev, arkaResponse]);
    }, 600);
  };

  // Voice toggle simulation / Web Speech API
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        };
        recognition.onerror = () => {
          setIsListening(false);
          simulateVoiceInput();
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch (err) {
        simulateVoiceInput();
      }
    } else {
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const randomQuery = sampleQuestions[0];
      setInputMessage(randomQuery);
      handleSendMessage(randomQuery);
    }, 1800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">ARKA AI</h1>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase backdrop-blur-xs">
                {t('arkaAssistant')}
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              &ldquo;{t('howCanIHelp')}&rdquo; • Multi-modal Voice & Route Assistant
            </p>
          </div>
        </div>

        {/* Voice wake toggle chip */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-purple-100">
            Voice Wake &ldquo;Hey ARKA&rdquo; Active
          </span>
        </div>
      </div>

      {/* Active Route Corridor Banner */}
      <ActiveRouteIndicator />

      {/* Chat Conversation Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4 min-h-[460px] flex flex-col justify-between">
        {/* Messages Feed */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? 'YOU' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] space-y-2 text-xs sm:text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-2xl rounded-tl-xs shadow-xs'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>

                {/* Embedded Route Recommendation Card */}
                {msg.hasRouteCard && msg.routeData && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 shadow-xs space-y-2 text-slate-800">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Recommended Corridor: {msg.routeData.source} ➔ {msg.routeData.destination}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Score: {msg.routeData.score}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-center">
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[9px]">Distance</span>
                        <span className="font-bold text-slate-900">{msg.routeData.distance}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[9px]">ETA</span>
                        <span className="font-bold text-blue-700">{msg.routeData.eta}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[9px]">Traffic</span>
                        <span className="font-bold text-emerald-700">{msg.routeData.traffic}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[9px]">Terrain Risk</span>
                        <StatusBadge level={msg.routeData.risk} size="sm" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-blue-50/50 p-2 rounded-lg leading-relaxed">
                      &ldquo;{msg.routeData.explanation}&rdquo;
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setActiveView('route-opt')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>Open in Route Optimizer</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Area: Sample Questions + Input Bar */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          {/* Quick Chip Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" /> Prompts:
            </span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 rounded-xl font-medium shrink-0 transition-colors cursor-pointer text-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Text & Voice Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask ARKA AI anything about Northeast routes, rain delays, hazards..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-inner"
              />
            </div>

            {/* Mic button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl font-bold transition-all shadow-sm cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              title="Voice Input"
            >
              {isListening ? <Mic className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-purple-700 hover:to-blue-700 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
