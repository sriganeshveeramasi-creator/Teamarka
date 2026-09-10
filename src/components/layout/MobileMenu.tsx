"use client";

import React from 'react';
import { useApp, AppView } from '@/context/AppContext';
import {
  Home,
  LayoutDashboard,
  Navigation,
  Truck,
  Activity,
  CloudRain,
  ShieldAlert,
  MapPin,
  Bot,
  Map,
  AlertTriangle,
  BarChart3,
  HelpCircle,
  UserCheck,
  LogOut,
  X,
  Globe,
  AlertOctagon,
} from 'lucide-react';

interface MobileMenuItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  color?: string;
}

const MOBILE_ITEMS: MobileMenuItem[] = [
  { id: 'landing', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'route-opt', label: 'Route Optimization', icon: Navigation, color: 'text-blue-600' },
  { id: 'tracking', label: 'Shipment Tracking', icon: Truck, badge: '4 Active', color: 'text-emerald-600' },
  { id: 'traffic', label: 'Traffic', icon: Activity, color: 'text-amber-600' },
  { id: 'weather', label: 'Weather', icon: CloudRain, color: 'text-cyan-600' },
  { id: 'risks', label: 'Risk Intelligence', icon: ShieldAlert, badge: 'Alerts', color: 'text-rose-600' },
  { id: 'accessibility', label: 'Accessibility', icon: MapPin, color: 'text-purple-600' },
  { id: 'arka-assistant', label: 'ARKA AI Assistant', icon: Bot, badge: 'AI', color: 'text-violet-600' },
  { id: 'northeast-map', label: 'Northeast Intelligence Map', icon: Map, color: 'text-indigo-600' },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-rose-600' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-amber-600' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, color: 'text-teal-600' },
  { id: 'admin', label: 'Profile', icon: UserCheck, color: 'text-slate-700' },
];

export default function MobileMenu() {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
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
    t,
  } = useApp();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-[85vw] max-w-xs bg-white h-full shadow-2xl flex flex-col p-4 z-10 animate-in slide-in-from-left duration-200 overflow-hidden">
        {/* Top brand header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              A
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">TEAM ARKA</span>
              <p className="text-[10px] text-slate-500 font-medium">Northeast Logistics Grid</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
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
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              emergencyMode ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>🚨 {t('emergencyMode')}</span>
          </button>
        </div>

        {/* Navigation list containing all 15 items in sequence */}
        <nav className="flex-1 overflow-y-auto space-y-1 py-1 pr-1">
          {MOBILE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : item.color || 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700 shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* 15. Logout (Always accessible in menu) */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                logout();
              } else {
                setActiveView('login');
              }
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] text-rose-600 hover:bg-rose-50"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{isAuthenticated ? 'Logout' : 'Login'}</span>
            </div>
            {isAuthenticated && user && (
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[90px]">
                {user.email.split('@')[0]}
              </span>
            )}
          </button>
        </nav>

        {/* Regional Language Picker */}
        <div className="pt-2 border-t border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-blue-600" /> Regional Language
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-1.5 rounded-lg text-left truncate transition-colors ${
                  language === l.code ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
