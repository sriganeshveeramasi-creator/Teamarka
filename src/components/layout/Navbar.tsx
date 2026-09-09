"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Menu,
  Globe,
  Bell,
  User,
  AlertOctagon,
  LogOut,
  ChevronDown,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const {
    activeView,
    setActiveView,
    isAuthenticated,
    user,
    logout,
    language,
    setLanguage,
    languages,
    emergencyMode,
    toggleEmergencyMode,
    mobileMenuOpen,
    setMobileMenuOpen,
    t,
  } = useApp();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            onClick={() => setActiveView(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg tracking-tighter">A</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-700 via-cyan-700 to-emerald-700 bg-clip-text text-transparent">
                  TEAM ARKA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 hidden sm:inline-block">
                  NE India
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block font-medium">
                Logistics & Accessibility Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* EMERGENCY MODE Button */}
          <button
            onClick={toggleEmergencyMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              emergencyMode
                ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
            title="Toggle Emergency Disaster Mode"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600 fill-current" />
            <span className="hidden sm:inline">🚨</span>
            <span>{t('emergencyMode')}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="font-semibold hidden md:inline">
                {languages.find((l) => l.code === language)?.nativeName}
              </span>
              <span className="font-semibold md:hidden uppercase">{language}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Regional Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                      language === l.code ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="text-slate-400 font-normal">{l.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-900">Regional Alerts (3)</span>
                  <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">Mark read</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-100 text-rose-900">
                    <p className="font-bold">⚠️ Landslide: NH-27 Dima Hasao</p>
                    <p className="text-[11px] text-rose-700">Soil movement active. Convoys diverted via Diphu.</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                    <p className="font-bold">🚦 Speed Advisory: Kaziranga NH-37</p>
                    <p className="text-[11px] text-amber-700">40 km/h cap enforced due to river water level.</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-900">
                    <p className="font-bold">🌧️ Rainfall Alert: Meghalaya Hills</p>
                    <p className="text-[11px] text-blue-700">Visibility below 150m near Mawlai bypass.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login CTA */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
              <div
                onClick={() => setActiveView('admin')}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-100"
                title="Open Admin / Profile"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[90px]">
                    {user?.name || 'Officer'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-none">Fleet Admin</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveView('login')}
              className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {t('login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
