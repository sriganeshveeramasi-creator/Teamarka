"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Radio,
  MapPin,
  Truck,
  ArrowRight,
  Bot,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export default function LandingView() {
  const { setActiveView, setMobileMenuOpen, t } = useApp();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-gradient-to-b from-blue-50/50 via-white to-emerald-50/40">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-12 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Colorful soft ambient glows */}
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headings & Login CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Smart India Hackathon 2026 Initiative</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                TEAM ARKA
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                AI Smart Logistics &<br className="hidden sm:inline" /> Accessibility Intelligence
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium italic pt-1">
                &ldquo;For a Connected Northeast India&rdquo;
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              A purpose-built regional intelligence platform designed specifically for the unique terrain, weather, and logistics corridors of Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura.
            </p>

            {/* Main Action Button: Strictly [ LOGIN ] */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => setActiveView('login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>LOGIN</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <span>☰ Explore Menu</span>
              </button>
            </div>

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0">
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-blue-100 text-left">
                <p className="text-xs text-slate-500 font-medium">Regional Coverage</p>
                <p className="text-sm font-bold text-blue-700">8 NE States</p>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-emerald-100 text-left">
                <p className="text-xs text-slate-500 font-medium">Risk Analysis</p>
                <p className="text-sm font-bold text-emerald-700">Landslide & Flood</p>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-purple-100 text-left">
                <p className="text-xs text-slate-500 font-medium">Speech Ready</p>
                <p className="text-sm font-bold text-purple-700">Hey ARKA AI</p>
              </div>
            </div>
          </div>

          {/* Right Column: Northeast Map Vector Style Canvas */}
          <div className="lg:col-span-6 z-10">
            <div className="bg-white p-2 rounded-3xl shadow-xl border border-slate-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="font-bold text-slate-700">Northeast Digital Corridor View</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Guwahati ⇄ Imphal Gateway</span>
              </div>
              <NortheastInteractiveMap heightClass="h-[360px] sm:h-[420px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-2">
            <h4 className="text-2xl font-black text-blue-600">3,400+ km</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">National & State Highways Mapped</p>
          </div>
          <div className="p-2">
            <h4 className="text-2xl font-black text-emerald-600">92%</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Route Safety Optimization Score</p>
          </div>
          <div className="p-2">
            <h4 className="text-2xl font-black text-purple-600">5 Languages</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">English, Hindi, Assamese, Bengali, Manipuri</p>
          </div>
          <div className="p-2">
            <h4 className="text-2xl font-black text-rose-600">24/7 SOS</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Disaster Emergency Corridor Mode</p>
          </div>
        </div>
      </section>
    </div>
  );
}
