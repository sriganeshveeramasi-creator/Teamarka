"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_SHIPMENTS, ShipmentItem } from '@/data/mockLogistics';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Truck,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Activity,
  AlertTriangle,
  Radio,
  ArrowRight,
} from 'lucide-react';

export default function ShipmentTrackingView() {
  const { t } = useApp();
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(MOCK_SHIPMENTS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentShipment: ShipmentItem =
    MOCK_SHIPMENTS.find((s) => s.id === selectedShipmentId) || MOCK_SHIPMENTS[0];

  const steps = [
    { step: 1, label: 'Picked Up', desc: 'Depot Dispatch' },
    { step: 2, label: 'In Transit', desc: 'Regional Corridor' },
    { step: 3, label: 'Near Destination', desc: 'Last Mile Entry' },
    { step: 4, label: 'Delivered', desc: 'Recipient Handover' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">
            Real-Time Telemetry & Cargo Milestones
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('shipmentTracking')}
        </h1>
        <p className="text-xs sm:text-sm text-cyan-100 max-w-2xl mt-1">
          Monitor multi-modal freight movement across hilly terrain with automated checkpoint validation.
        </p>
      </div>

      {/* Shipment Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Track Shipment:
          </span>
          {MOCK_SHIPMENTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedShipmentId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedShipmentId === s.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.id} ({s.destination})
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search Shipment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Main Grid: Details + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Shipment Info & Progress Timeline */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{currentShipment.id}</h2>
                <StatusBadge level={currentShipment.riskLevel} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cargo: <span className="font-semibold text-slate-700">{currentShipment.cargoType}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Live Status:</span>
              <p className="text-sm font-black text-blue-600">{currentShipment.statusText}</p>
            </div>
          </div>

          {/* 4-Stage Visual Progress Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transit Progress
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              {steps.map((item) => {
                const isPassed = currentShipment.statusStep >= item.step;
                const isCurrent = currentShipment.statusStep === item.step;
                return (
                  <div key={item.step} className="space-y-1.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                      } ${isCurrent ? 'ring-2 ring-emerald-300' : ''}`}
                    />
                    <div className="pt-1">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-500 hidden sm:block">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500">Route Corridor:</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {currentShipment.source} ➔ {currentShipment.destination}
              </p>
              <p className="text-[11px] text-slate-500">
                {currentShipment.sourceState} to {currentShipment.destState}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500">Current Position:</span>
              <p className="font-bold text-blue-600 mt-0.5">{currentShipment.currentLocation}</p>
              <p className="text-[11px] text-slate-500">ETA: {currentShipment.eta}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500">Driver & Vehicle:</span>
              <p className="font-bold text-slate-900 mt-0.5">{currentShipment.driverName}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {currentShipment.vehicleType} • {currentShipment.vehiclePlate}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500">Corridor Traffic:</span>
              <p className="font-bold text-emerald-600 mt-0.5">
                {currentShipment.trafficPercent}% Moderate
              </p>
              <p className="text-[11px] text-slate-500">No clearance delays</p>
            </div>
          </div>

          {/* Driver Quick Contact */}
          <div className="p-3.5 sm:p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{currentShipment.driverName}</p>
                <p className="text-[11px] text-slate-600 truncate">{currentShipment.driverPhone}</p>
              </div>
            </div>
            <a
              href={`tel:${currentShipment.driverPhone}`}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-1.5 shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Right: Map Panel Synchronized */}
        <div className="lg:col-span-6 bg-white p-3 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="px-3 py-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800">Live GPS Corridor Position</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              Tracking GPS Refresh: 10s
            </span>
          </div>

          <NortheastInteractiveMap
            highlightRoute={true}
            activeShipmentPoint={currentShipment.coordinates}
            heightClass="h-[420px] sm:h-[480px]"
          />
        </div>
      </div>
    </div>
  );
}
