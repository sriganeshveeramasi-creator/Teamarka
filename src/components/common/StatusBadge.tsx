"use client";

import React from 'react';

export type StatusLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'INFO' | 'SUCCESS';

interface StatusBadgeProps {
  level: StatusLevel;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ level, text, size = 'sm' }: StatusBadgeProps) {
  const displayText = text || level;

  const styleMap = {
    LOW: {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-500',
    },
    MEDIUM: {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
    },
    HIGH: {
      bg: 'bg-rose-100 text-rose-800 border-rose-300',
      dot: 'bg-rose-500 animate-pulse',
    },
    INFO: {
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      dot: 'bg-blue-500',
    },
    SUCCESS: {
      bg: 'bg-teal-100 text-teal-800 border-teal-300',
      dot: 'bg-teal-500',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  const currentStyle = styleMap[level] || styleMap.INFO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${
        sizeClasses[size]
      } ${currentStyle.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`} />
      <span>{displayText}</span>
    </span>
  );
}
