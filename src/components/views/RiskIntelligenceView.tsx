"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { RISK_ALERTS, RiskIntelligenceAlert } from '@/data/mockLogistics';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  MapPin,
  Waves,
  Mountain,
  CloudRain,
  Eye,
  Construction,
  Filter,
  ArrowRight,
} from 'lucide-react';

export default function RiskIntelligenceView() {
  const { t } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = RISK_ALERTS.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Landslide':
        return Mountain;
      case 'Flood':
        return Waves;
      case 'Heavy Rain':
        return CloudRain;
      case 'Low Visibility':
        return Eye;
      case 'Bridge Restriction':
      case 'Road Blockage':
      case 'Poor Road Condition':
        return Construction;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
            Hazard Mitigation & Safe Transit Feeds
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('riskIntelligence')}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
          Real-time Northeast terrain hazards, landslide warnings, river surge zones, and mountain convoy restrictions.
        </p>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Alerts:</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Hazards ({RISK_ALERTS.length})
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'HIGH'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            HIGH Risk Only
          </button>
          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'MEDIUM'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            MEDIUM Risk
          </button>
          <button
            onClick={() => setFilterSeverity('LOW')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterSeverity === 'LOW'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            LOW Risk
          </button>
        </div>
      </div>

      {/* Main Grid: Cards + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Risk Alert Cards List */}
        <div className="lg:col-span-6 space-y-4">
          {filteredAlerts.map((alert) => {
            const Icon = getCategoryIcon(alert.category);
            return (
              <div
                key={alert.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        alert.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-600'
                          : alert.severity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{alert.category} Risk</h3>
                      <p className="text-xs text-slate-500">{alert.location}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900">{alert.percentage}%</span>
                    <div className="mt-0.5">
                      <StatusBadge level={alert.severity} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><span className="font-semibold text-slate-700">Observation:</span> {alert.description}</p>
                  <p><span className="font-semibold text-blue-700">Advisory:</span> {alert.advisory}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Map of Affected Risk Zones */}
        <div className="lg:col-span-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold text-slate-800">Regional Risk Zone Plotter</span>
            </div>
            <span className="text-slate-500">Northeast Geomorphic Overlay</span>
          </div>

          <NortheastInteractiveMap
            highlightRoute={true}
            heightClass="h-[460px] sm:h-[520px]"
          />

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Hover or tap red/amber beacons on the map to inspect localized geotechnical reports.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
