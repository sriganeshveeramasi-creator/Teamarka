"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ACCESSIBILITY_SERVICES, AccessibilityFacility } from '@/data/mockLogistics';
import NortheastInteractiveMap from '@/components/map/NortheastInteractiveMap';
import {
  MapPin,
  Hospital,
  Fuel,
  Warehouse,
  Coffee,
  Wrench,
  Shield,
  Train,
  Utensils,
  Hotel,
  Clock,
  Phone,
  Filter,
} from 'lucide-react';

const CATEGORIES = [
  'All Services',
  'Hospital',
  'Fuel Station',
  'Warehouse',
  'Rest Area',
  'Vehicle Repair',
  'Emergency Services',
];

export default function AccessibilityView() {
  const { t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Services');
  const [selectedFacility, setSelectedFacility] = useState<AccessibilityFacility | null>(null);

  const filteredFacilities = ACCESSIBILITY_SERVICES.filter((fac) => {
    if (selectedCategory === 'All Services') return true;
    return fac.type === selectedCategory;
  });

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'Hospital':
        return Hospital;
      case 'Fuel Station':
        return Fuel;
      case 'Warehouse':
        return Warehouse;
      case 'Rest Area':
        return Coffee;
      case 'Vehicle Repair':
        return Wrench;
      case 'Emergency Services':
        return Shield;
      case 'Transport Hub':
        return Train;
      default:
        return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
            Critical Infrastructure & Highway Support Services
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('accessibility')}
        </h1>
        <p className="text-xs sm:text-sm text-purple-100 max-w-2xl mt-1">
          Quickly discover emergency trauma hospitals, fuel depots, heavy vehicle workshops, and transit rest facilities across the Northeast corridor.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Cards + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Facilities List */}
        <div className="lg:col-span-6 space-y-3">
          {filteredFacilities.map((fac) => {
            const Icon = getFacilityIcon(fac.type);
            const isSelected = selectedFacility?.id === fac.id;
            return (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-200 shadow-md'
                    : 'bg-white border-slate-200 hover:border-purple-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{fac.name}</h3>
                      <p className="text-xs text-slate-500">{fac.location}</p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-800">
                    {fac.type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Distance</span>
                    <span className="font-bold text-slate-800">{fac.distanceKm} km</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Est. Travel Time</span>
                    <span className="font-bold text-blue-600">{fac.travelTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span className="font-bold text-emerald-600 truncate block">{fac.status.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span className="font-medium">{fac.status}</span>
                  <a
                    href={`tel:${fac.phone}`}
                    className="flex items-center gap-1 font-bold text-purple-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{fac.phone}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Map Highlighting Facilities */}
        <div className="lg:col-span-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="font-bold text-slate-800">Accessibility Geospatial Layer</span>
            </div>
            <span className="text-slate-500">Hospitals • Fuel • Depots</span>
          </div>

          <NortheastInteractiveMap
            highlightRoute={true}
            activeShipmentPoint={
              selectedFacility
                ? { x: selectedFacility.x, y: selectedFacility.y, label: selectedFacility.name.slice(0, 18) }
                : undefined
            }
            heightClass="h-[460px] sm:h-[520px]"
          />

          <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 flex items-center justify-between">
            <span>Tap any service card to focus its geo-coordinates on the Northeast map corridor.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
