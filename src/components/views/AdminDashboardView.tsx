"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import {
  ShieldCheck,
  Users,
  Activity,
  Truck,
  AlertTriangle,
  Clock,
  CloudRain,
  Navigation,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Laptop,
  Smartphone,
} from 'lucide-react';

interface ActivityLogItem {
  id: string;
  userId?: string;
  name?: string;
  email: string;
  role?: string;
  action: 'LOGIN' | 'LOGOUT' | 'SIGNUP';
  status: 'SUCCESS' | 'FAILED';
  reason?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string | null;
}

export default function AdminDashboardView() {
  const { t } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'activity' | 'users' | 'reports'>('activity');
  const [activeReportTab, setActiveReportTab] = useState<'weather' | 'traffic' | 'risk' | 'logistics'>('weather');

  // Live Database States
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'FAILED'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'recent'>('all');
  const [userSearch, setUserSearch] = useState<string>('');

  const fetchLogs = async (status = statusFilter, time = timeFilter) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/activity-logs?status=${status}&time=${time}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchLogs(statusFilter, timeFilter);
    fetchUsers();
  }, [statusFilter, timeFilter]);

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const successfulCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;

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
          Live MongoDB authentication telemetry, registered accounts directory, and regional supply chain reports.
        </p>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Registered Users"
          value={users.length > 0 ? users.length.toString() : '1'}
          subtitle="Database verified accounts"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          title="Login Activity"
          value={logs.length.toString()}
          subtitle={`${successfulCount} success • ${failedCount} failed`}
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
          title="Security Alerts"
          value={failedCount > 0 ? `${failedCount} Failed` : 'None'}
          subtitle={failedCount > 0 ? 'Failed login audit flagged' : 'System secured'}
          icon={AlertTriangle}
          accentColor={failedCount > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveAdminTab('activity')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeAdminTab === 'activity'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Login Activity</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {logs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeAdminTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeAdminTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Operational Reports</span>
        </button>
      </div>

      {/* SECTION 1: LIVE LOGIN ACTIVITY */}
      {activeAdminTab === 'activity' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Safe Login & Authentication Audit Trail
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Live database records tracking SUCCESS / FAILED attempts, timestamps, and origin telemetry. Passwords never logged.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter: Status */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setStatusFilter('SUCCESS')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'SUCCESS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
                  }`}
                >
                  Successful
                </button>
                <button
                  onClick={() => setStatusFilter('FAILED')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === 'FAILED' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700'
                  }`}
                >
                  Failed
                </button>
              </div>

              {/* Filter: Time */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timeFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timeFilter === 'today' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter('recent')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timeFilter === 'recent' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Recent
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchLogs(statusFilter, timeFilter)}
                disabled={loadingLogs}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Refresh logs from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Querying database logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No activity logs recorded yet</p>
              <p className="text-slate-400 text-xs mt-1">Attempts will be logged here in real-time as users log in or fail authentication.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Email / Mobile</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Login Time</th>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3">IP / Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {log.name || 'Anonymous User'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {log.email}
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          log.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-medium">
                          {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs ${log.status === 'FAILED' ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>
                          {log.reason || (log.status === 'SUCCESS' ? 'Authenticated successfully' : 'Failed')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500 font-mono">
                        <div className="flex items-center gap-1">
                          {log.userAgent?.toLowerCase().includes('mobile') ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="truncate max-w-[130px]" title={log.userAgent}>
                            {log.userAgent ? (log.userAgent.length > 20 ? log.userAgent.slice(0, 20) + '...' : log.userAgent) : 'Browser'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">IP: {log.ip || '127.0.0.1'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LIVE REGISTERED USERS */}
      {activeAdminTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Registered Users (Zero Passwords Exposed)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real database user accounts. Passwords and hashes are cryptographically shielded and never served.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, email, role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Refresh user list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading registered users from database...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No registered users matched</p>
              <p className="text-slate-400 text-xs mt-1">Try clearing your search keyword.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">User Name</th>
                    <th className="py-2.5 px-3">Email / Mobile</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Created At</th>
                    <th className="py-2.5 px-3">Last Login</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {u.id.slice(-6)}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        <div>{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'Never logged in'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: REGIONAL INTELLIGENCE REPORTS */}
      {activeAdminTab === 'reports' && (
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
      )}
    </div>
  );
}
