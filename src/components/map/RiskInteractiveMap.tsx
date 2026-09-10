"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import type { RiskCorridorMapProps } from './RiskCorridorMap';

const RiskCorridorMap = dynamic(() => import('./RiskCorridorMap'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[440px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-500">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
        <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
        <span>Loading Corridor Risk Cartography...</span>
      </div>
      <p className="text-xs text-slate-500 mt-1.5 font-medium">
        Connecting CartoDB Tiles &bull; Plotting Terrain Hazards &bull; 10 km Buffer Facilities
      </p>
    </div>
  ),
});

export default function RiskInteractiveMap(props: RiskCorridorMapProps) {
  return <RiskCorridorMap {...props} />;
}
