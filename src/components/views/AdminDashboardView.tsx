"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ADMIN_USERS_DATA } from '@/data/mockLogistics';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  ShieldCheck,
  Users,
  Activity,
  Truck,
  AlertTriangle,
  FileText,
  Clock,
  CloudRain,
  Navigation,
  Lock,
} from 'lucide-react';

export default function AdminDashboardView() {
  const { t } = useApp();
  const [activeReportTab, setActiveReportTab] = useState<'weather' | 'traffic' | 'risk' | 'logistics'>('weather');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-blue-950 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Internal Governance & State Fleet Operations
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('adminDashboard')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
          Regional monitoring system, telemetry dispatch controls, safe account logs (passwords securely protected), and aggregated reports.
        </p>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Registered Users"
          value="1,420"
          subtitle="Regional portal users"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          title="Active Users Online"
          value="235"
          subtitle="Live sessions logged"
          icon={Activity}
          accentColor="green"
        />
        <StatCard
          title="Active Shipments"
          value="84"
          subtitle="Cross-state freight"
          icon={Truck}
          accentColor="purple"
        />
        <StatCard
          title="Active Fleet Vehicles"
          value="185"
          subtitle="GPS telemetry active"
          icon={Navigation}
          accentColor="orange"
        />
        <StatCard
          title="Current System Alerts"
          value="4"
          subtitle="Hazard warnings"
          icon={AlertTriangle}
          accentColor="red"
        />
      </div>

      {/* Safe User Activity Audit Table (Strictly NO Passwords) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Safe Account & Administrative Activity Log
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict privacy compliance: Credentials and passwords are cryptographically shielded and never displayed.
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Audit Level: Secure
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Officer / User</th>
                <th className="py-2.5 px-3">Role Designation</th>
                <th className="py-2.5 px-3">Email Contact</th>
                <th className="py-2.5 px-3">Last Login Activity</th>
                <th className="py-2.5 px-3">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ADMIN_USERS_DATA.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-3 font-semibold text-blue-700">{u.role}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{u.email}</td>
                  <td className="py-3 px-3 text-slate-600">{u.lastLogin}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.status === 'Verified'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Tabbed Regional Intelligence Reports */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Regional Operational Reports</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational summaries generated for state logistics coordination
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveReportTab('weather')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeReportTab === 'weather' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Weather Report
            </button>
            <button
              onClick={() => setActiveReportTab('traffic')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeReportTab === 'traffic' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Traffic Report
            </button>
            <button
              onClick={() => setActiveReportTab('risk')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeReportTab === 'risk' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Risk Report
            </button>
            <button
              onClick={() => setActiveReportTab('logistics')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeReportTab === 'logistics' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Logistics Report
            </button>
          </div>
        </div>

        {/* WEATHER REPORT */}
        {activeReportTab === 'weather' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Weather Observation</th>
                  <th className="py-2.5 px-3">Weather Alert Level</th>
                  <th className="py-2.5 px-3">Logistics Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Assam</td>
                  <td className="py-2.5 px-3">28°C, Light Pre-monsoon Rain</td>
                  <td className="py-2.5 px-3"><StatusBadge level="LOW" size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-600">Minor 10m slowdown near Sonapur belt</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Meghalaya</td>
                  <td className="py-2.5 px-3">18°C, Heavy Mountain Rain & Fog</td>
                  <td className="py-2.5 px-3"><StatusBadge level="HIGH" size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-600">+35m delay on Barapani-Shillong corridor</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Nagaland</td>
                  <td className="py-2.5 px-3">20°C, Dense Morning Fog</td>
                  <td className="py-2.5 px-3"><StatusBadge level="MEDIUM" size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-600">Fog lamps mandatory on Kohima passes</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Manipur</td>
                  <td className="py-2.5 px-3">25°C, Partly Cloudy</td>
                  <td className="py-2.5 px-3"><StatusBadge level="LOW" size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-600">Normal valley speed schedules active</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TRAFFIC REPORT */}
        {activeReportTab === 'traffic' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">City / Sector</th>
                  <th className="py-2.5 px-3">Traffic Density</th>
                  <th className="py-2.5 px-3">Congested Corridors</th>
                  <th className="py-2.5 px-3">Average Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-bold">Assam</td>
                  <td className="py-2.5 px-3">Guwahati Bypass</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">34% (Low)</td>
                  <td className="py-2.5 px-3">Jorabat Intercept</td>
                  <td className="py-2.5 px-3 font-semibold">+8 mins</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Nagaland</td>
                  <td className="py-2.5 px-3">Dimapur-Kohima</td>
                  <td className="py-2.5 px-3 text-rose-600 font-bold">72% (Heavy)</td>
                  <td className="py-2.5 px-3">NH-29 Mile 14</td>
                  <td className="py-2.5 px-3 font-semibold text-rose-600">+25 mins</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Meghalaya</td>
                  <td className="py-2.5 px-3">Shillong City</td>
                  <td className="py-2.5 px-3 text-amber-600 font-bold">54% (Moderate)</td>
                  <td className="py-2.5 px-3">Mawlai Bypass</td>
                  <td className="py-2.5 px-3 font-semibold">+15 mins</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* RISK REPORT */}
        {activeReportTab === 'risk' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3">Hazard Type</th>
                  <th className="py-2.5 px-3">Key Location</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Enforced Control Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Landslide Risk</td>
                  <td className="py-2.5 px-3">NH-27 Dima Hasao Pass</td>
                  <td className="py-2.5 px-3"><StatusBadge level="HIGH" text="78% HIGH" size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-600">Heavy trucks diverted to Lumding-Diphu corridor</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Flood Risk</td>
                  <td className="py-2.5 px-3">NH-37 Kaziranga Corridor</td>
                  <td className="py-2.5 px-3"><StatusBadge level="MEDIUM" text="54% MED" size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-600">40 km/h speed limit on animal culvert roads</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-800">Bridge Restriction</td>
                  <td className="py-2.5 px-3">Old Saraighat Bridge</td>
                  <td className="py-2.5 px-3"><StatusBadge level="MEDIUM" text="&lt;15T Limit" size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-600">Over-weight vehicles directed to New Saraighat Bridge</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* LOGISTICS REPORT */}
        {activeReportTab === 'logistics' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Current Value</th>
                  <th className="py-2.5 px-3">Benchmark</th>
                  <th className="py-2.5 px-3">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-bold">Active Shipments</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">84 Active</td>
                  <td className="py-2.5 px-3">Target: 100</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Healthy</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Delayed Shipments</td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">4 Shipments</td>
                  <td className="py-2.5 px-3">&lt; 8 Allowed</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Within Tolerance</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Completed Today</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">62 Completed</td>
                  <td className="py-2.5 px-3">Target: 50</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Ahead of Schedule</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Corridor Efficiency</td>
                  <td className="py-2.5 px-3 font-bold text-purple-700">94.2%</td>
                  <td className="py-2.5 px-3">Target: 90%</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Exemplary</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
