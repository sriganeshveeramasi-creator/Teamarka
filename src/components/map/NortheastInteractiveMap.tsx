"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import type { NortheastInteractiveMapProps } from './RealLeafletMap';

const RealLeafletMap = dynamic(() => import('./RealLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[460px] md:h-[540px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-500">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
        <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
        <span>Loading Real Geographic Navigation Engine...</span>
      </div>
      <p className="text-xs text-slate-500 mt-1.5 font-medium">
        Connecting CartoDB / OpenStreetMap Tiles &bull; NH-27 &bull; NH-29 &bull; NH-2 Corridors
      </p>
    </div>
  ),
});

export default function NortheastInteractiveMap(props: NortheastInteractiveMapProps) {
  return <RealLeafletMap {...props} />;
}
