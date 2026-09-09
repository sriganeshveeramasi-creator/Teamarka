"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CloudRain,
  Wind,
  Droplets,
  Eye,
  AlertTriangle,
  Sun,
  CloudLightning,
  Clock,
  Compass,
  MapPin,
} from 'lucide-react';

import { NORTHEAST_WEATHER, CityWeather } from '@/data/demoData';


export default function WeatherIntelligenceView() {
  const { t } = useApp();
  const [selectedCity, setSelectedCity] = useState<CityWeather>(NORTHEAST_WEATHER[1]); // Shillong default

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-cyan-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">
            Meteorological Impact on Freight Schedules
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('weather')}
        </h1>
        <p className="text-xs sm:text-sm text-cyan-100 max-w-2xl mt-1">
          Precipitation rates, cloud cover, and visibility predictions affecting mountain passes and river bridges.
        </p>
      </div>

      {/* Featured Weather Impact Card */}
      <div className="bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-500 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase backdrop-blur-xs">
              Primary Corridor Weather Focus: {selectedCity.city}, {selectedCity.state}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">{selectedCity.temp}°C</h2>
            <p className="text-sm font-medium text-cyan-100 mt-0.5">{selectedCity.condition}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl text-center text-xs">
            <div className="p-2">
              <Droplets className="w-5 h-5 mx-auto text-cyan-300 mb-1" />
              <p className="text-cyan-200">Precipitation</p>
              <p className="font-black text-sm">{selectedCity.rainMm} mm</p>
            </div>
            <div className="p-2 border-x border-white/10">
              <Wind className="w-5 h-5 mx-auto text-cyan-300 mb-1" />
              <p className="text-cyan-200">Wind</p>
              <p className="font-black text-sm">{selectedCity.windKmh} km/h</p>
            </div>
            <div className="p-2">
              <Eye className="w-5 h-5 mx-auto text-cyan-300 mb-1" />
              <p className="text-cyan-200">Visibility</p>
              <p className="font-black text-sm">{selectedCity.visibilityKm} km</p>
            </div>
          </div>
        </div>

        {/* Highlighted Logistics Impact Banner */}
        <div className="p-4 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex items-start gap-3 text-xs sm:text-sm">
          <Clock className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-200 uppercase tracking-wider text-[11px]">
              Weather Impact on Logistics
            </p>
            <p className="font-semibold text-white mt-0.5 leading-relaxed">
              &ldquo;{selectedCity.logisticsImpact}&rdquo;
            </p>
            <p className="text-xs text-cyan-100 mt-1">
              Estimated Transit Schedule Delay: <span className="font-bold text-amber-300">+{selectedCity.delayMin} minutes</span>
            </p>
          </div>
        </div>
      </div>

      {/* Regional City Weather Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Weather Conditions Along Key Northeast Corridors
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NORTHEAST_WEATHER.map((w) => (
            <div
              key={w.city}
              onClick={() => setSelectedCity(w)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                selectedCity.city === w.city
                  ? 'bg-blue-50/80 border-blue-400 shadow-md ring-2 ring-blue-200'
                  : 'bg-white border-slate-200 hover:border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{w.city}</h4>
                  <p className="text-xs text-slate-500">{w.state}</p>
                </div>
                <span className="text-2xl font-black text-slate-900">{w.temp}°C</span>
              </div>

              <p className="text-xs text-slate-600 mb-3 font-medium">{w.condition}</p>

              <div className="grid grid-cols-3 gap-1 py-2 px-2.5 bg-slate-50 rounded-xl text-center text-[11px] text-slate-600 mb-3">
                <div>Rain: <span className="font-bold">{w.rainMm}mm</span></div>
                <div>Wind: <span className="font-bold">{w.windKmh}k/h</span></div>
                <div>Vis: <span className="font-bold">{w.visibilityKm}km</span></div>
              </div>

              <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 text-[11px] text-amber-900">
                <span className="font-bold">Logistics Delay:</span> +{w.delayMin} mins
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
