"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
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

const SAMPLE_QUESTIONS = [
  "Hey ARKA, find the safest route from Guwahati to Imphal.",
  "Hey ARKA, what is the traffic situation?",
  "Hey ARKA, find the nearest hospital.",
  "Hey ARKA, is there any landslide alert in Dima Hasao?",
];

export default function ArkaAiAssistantView() {
  const { setActiveView, t } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceWakeActive, setVoiceWakeActive] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'arka',
      text: "Hello! I am ARKA AI, your specialized logistics & accessibility assistant for Northeast India. How can I help you today?",
      time: 'Just now',
    },
  ]);

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

    // Simulate ARKA AI intelligent response
    setTimeout(() => {
      let arkaResponse: ChatMessage;

      const lower = query.toLowerCase();

      if (lower.includes('guwahati to imphal') || lower.includes('route') || lower.includes('safest route')) {
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: "I analyzed the terrain, slope elevation, and live telemetry. Here is the safest recommended corridor for your transport:",
          time: 'Just now',
          hasRouteCard: true,
          routeData: {
            source: 'Guwahati, Assam',
            destination: 'Imphal, Manipur',
            distance: '485 km',
            eta: '11 hrs 30 mins',
            traffic: '34% (Low)',
            risk: 'LOW',
            accessibility: '91%',
            score: 92,
            explanation:
              'ARKA selected the NH-27 / NH-29 Eastern Spine corridor because it features stabilized road culverts, lower traffic congestion, and 24/7 recovery stations compared to the Dima Hasao hill bypass.',
          },
        };
      } else if (lower.includes('traffic')) {
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: "Current Northeast Corridor Traffic Status: NH-27 between Guwahati and Nagaon is flowing smoothly with low density (34%). However, Dimapur to Kohima hill ascent has heavy convoy congestion (72%) with an approximate 25-minute delay. Drive with standard mountain headway.",
          time: 'Just now',
        };
      } else if (lower.includes('hospital')) {
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: "Nearest primary trauma hospital along the corridor is Guwahati Medical College & Hospital (GMCH), located 4.2 km away (approx. 12 mins travel time). In the eastern sector, Regional Institute of Medical Sciences (RIMS) in Imphal is fully operational with 24/7 ICU support.",
          time: 'Just now',
        };
      } else {
        arkaResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'arka',
          text: `I have received your request regarding: "${query}". I am continuously monitoring highway tolls, rainfall indices, and road conditions across all 8 Northeast states to ensure safe logistics.`,
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

    // Try browser SpeechRecognition if available
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
      const randomQuery = SAMPLE_QUESTIONS[0];
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
          <Volume2 className="w-4 h-4 text-cyan-300" />
          <span className="text-purple-100 font-medium">Wake Phrase:</span>
          <span className="font-bold text-white font-mono">&ldquo;Hey ARKA&rdquo;</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Quick Prompts
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 shrink-0 font-medium shadow-2xs transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                  : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 pb-1">
                <span className="font-bold uppercase tracking-wider">
                  {msg.sender === 'user' ? 'You' : 'ARKA AI Intelligence'}
                </span>
                <span>{msg.time}</span>
              </div>

              <p className="leading-relaxed font-medium">{msg.text}</p>

              {/* Dynamic Route Recommendation Card inside AI Chat */}
              {msg.hasRouteCard && msg.routeData && (
                <div className="bg-white rounded-2xl border border-purple-200 p-4 text-slate-800 space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        AI Recommended Corridor
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {msg.routeData.source} ➔ {msg.routeData.destination}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700">
                        Score: {msg.routeData.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Distance</span>
                      <span className="font-bold">{msg.routeData.distance}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">ETA</span>
                      <span className="font-bold text-blue-600">{msg.routeData.eta}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Traffic</span>
                      <span className="font-bold text-emerald-600">{msg.routeData.traffic}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Accessibility</span>
                      <span className="font-bold text-purple-700">{msg.routeData.accessibility}</span>
                    </div>
                  </div>

                  {/* Route Explanation */}
                  <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-950 space-y-1">
                    <p className="font-bold text-purple-900 text-[11px]">Why ARKA selected this route:</p>
                    <p className="leading-relaxed">{msg.routeData.explanation}</p>
                  </div>

                  {/* Compact Map Preview */}
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <NortheastInteractiveMap heightClass="h-[220px]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Voice & Text Input Box */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2">
        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
              : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
          }`}
          title={isListening ? 'Listening to voice...' : 'Speak to ARKA ("Hey ARKA...")'}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isListening ? 'Listening to speech...' : t('askArka')}
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
