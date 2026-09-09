"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { NAV_ITEMS } from './Sidebar';
import { X, LogOut, Globe, AlertOctagon } from 'lucide-react';

export default function MobileMenu() {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    activeView,
    setActiveView,
    isAuthenticated,
    logout,
    language,
    setLanguage,
    languages,
    emergencyMode,
    toggleEmergencyMode,
    t,
  } = useApp();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-4 z-10 animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm">TEAM ARKA</span>
              <p className="text-[10px] text-slate-500">Northeast Logistics</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Mode Toggle inside Drawer */}
        <div className="py-2.5">
          <button
            onClick={() => {
              toggleEmergencyMode();
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              emergencyMode ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>🚨 {t('emergencyMode')}</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto space-y-1 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : item.color || 'text-slate-400'}`} />
                  <span>{t(item.labelKey)}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Language picker */}
        <div className="pt-2 border-t border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Language
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-1 rounded text-left ${
                  language === l.code ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Auth action */}
        {isAuthenticated && (
          <div className="pt-2 mt-2 border-t border-slate-200">
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
