"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: 'blue' | 'cyan' | 'green' | 'purple' | 'orange' | 'amber' | 'red';
  badgeText?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'blue',
  badgeText,
  onClick,
}: StatCardProps) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70 hover:bg-blue-50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
    },
    cyan: {
      bg: 'bg-cyan-50/70 hover:bg-cyan-50',
      border: 'border-cyan-100',
      iconBg: 'bg-cyan-100 text-cyan-600',
      badge: 'bg-cyan-100 text-cyan-800',
    },
    green: {
      bg: 'bg-emerald-50/70 hover:bg-emerald-50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    purple: {
      bg: 'bg-purple-50/70 hover:bg-purple-50',
      border: 'border-purple-100',
      iconBg: 'bg-purple-100 text-purple-600',
      badge: 'bg-purple-100 text-purple-800',
    },
    orange: {
      bg: 'bg-orange-50/70 hover:bg-orange-50',
      border: 'border-orange-100',
      iconBg: 'bg-orange-100 text-orange-600',
      badge: 'bg-orange-100 text-orange-800',
    },
    amber: {
      bg: 'bg-amber-50/70 hover:bg-amber-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-800',
    },
    red: {
      bg: 'bg-rose-50/70 hover:bg-rose-50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-100 text-rose-600',
      badge: 'bg-rose-100 text-rose-800',
    },
  };

  const scheme = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-white border ${scheme.border} shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badgeText && (
        <div className="mt-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${scheme.badge}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
