"use client";

import React from 'react';
import { useApp, AppView } from '@/context/AppContext';
import {
  Home,
  LayoutDashboard,
  Navigation,
  Truck,
  ShieldAlert,
  CloudRain,
  MapPin,
  Map,
  Bot,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  UserCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  labelKey: string;
  icon: React.ElementType;
  badge?: string;
  color?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'landing', labelKey: 'home', icon: Home },
  { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'route-opt', labelKey: 'routeOptimization', icon: Navigation, color: 'text-blue-600' },
  { id: 'tracking', labelKey: 'shipmentTracking', icon: Truck, badge: '4 Active', color: 'text-emerald-600' },
  { id: 'risks', labelKey: 'riskIntelligence', icon: ShieldAlert, badge: 'Alerts', color: 'text-rose-600' },
  { id: 'weather', labelKey: 'weather', icon: CloudRain, color: 'text-cyan-600' },
  { id: 'accessibility', labelKey: 'accessibility', icon: MapPin, color: 'text-purple-600' },
  { id: 'northeast-map', labelKey: 'northeastMap', icon: Map, color: 'text-indigo-600' },
  { id: 'arka-assistant', labelKey: 'arkaAssistant', icon: Bot, badge: 'AI', color: 'text-violet-600' },
  { id: 'emergency', labelKey: 'emergencyMode', icon: AlertTriangle, color: 'text-rose-600' },
  { id: 'analytics', labelKey: 'analytics', icon: BarChart3, color: 'text-amber-600' },
  { id: 'admin', labelKey: 'adminDashboard', icon: UserCheck, color: 'text-slate-600' },
  { id: 'help', labelKey: 'helpSupport', icon: HelpCircle, color: 'text-teal-600' },
];

export default function Sidebar() {
  const { activeView, setActiveView, isAuthenticated, logout, t } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 select-none">
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Main Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : item.color || 'text-slate-400'}`} />
                <span className="truncate">{t(item.labelKey)}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    item.badge === 'AI'
                      ? 'bg-purple-100 text-purple-700'
                      : item.badge === 'Alerts'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="pt-3 border-t border-slate-200 mt-2 space-y-2">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Northeast Logistics Grid</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
            Connected across 8 states • Real-time AI road safety intelligence
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
