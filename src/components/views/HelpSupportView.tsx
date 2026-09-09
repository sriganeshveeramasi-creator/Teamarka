"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Send,
  AlertTriangle,
  FileQuestion,
  Bot,
  Truck,
  Navigation,
  CheckCircle,
  KeyRound,
} from 'lucide-react';

interface FaqItem {
  id: string;
  q: string;
  a: string;
  category: 'Login' | 'Routing' | 'Tracking' | 'Hazards';
}

const FAQS: FaqItem[] = [
  {
    id: 'f-1',
    category: 'Routing',
    q: 'How does ARKA AI calculate route scores across hill corridors?',
    a: 'ARKA AI combines topographical slope gradients, real-time traffic sensor speeds, monsoon rainfall radar indices, and historical geotechnical landslide probability maps to generate a composite score out of 100.',
  },
  {
    id: 'f-2',
    category: 'Login',
    q: 'I cannot remember my officer credentials or password. How do I recover access?',
    a: 'Use the "Forgot Password?" link on the login page or contact your state fleet administrator. Passwords are securely hashed and recovery links are sent directly to your registered government contact.',
  },
  {
    id: 'f-3',
    category: 'Tracking',
    q: 'Why does my shipment show "Rain Delay" in Meghalaya?',
    a: 'During heavy monsoon showers exceeding 35 mm/hr in the Cherrapunji-Shillong corridor, heavy vehicles are mandated to reduce speed to 30 km/h for braking safety, adding an estimated 20-35 minute buffer.',
  },
  {
    id: 'f-4',
    category: 'Hazards',
    q: 'What should I do if my truck encounters a sudden rockfall or landslide?',
    a: 'Immediately activate the red 🚨 EMERGENCY MODE button in the navigation bar. This alerts state control rooms, transmits your coordinates, and maps the nearest emergency shelter and trauma facility.',
  },
  {
    id: 'f-5',
    category: 'Routing',
    q: 'Can heavy multi-axle freight vehicles use Old Saraighat Bridge?',
    a: 'No. Vehicles with axle weights exceeding 15 tonnes are legally restricted from Old Saraighat Bridge and must take the New Saraighat Bridge bypass.',
  },
];

export default function HelpSupportView() {
  const { setActiveView, t } = useApp();

  const [openFaqId, setOpenFaqId] = useState<string>('f-1');
  const [reportState, setReportState] = useState('Assam');
  const [reportHighway, setReportHighway] = useState('NH-27');
  const [reportDetail, setReportDetail] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetail) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportDetail('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 p-6 rounded-3xl text-white shadow-md">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
            Assistance & Community Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          {t('helpSupport')}
        </h1>
        <p className="text-xs sm:text-sm text-teal-100 max-w-2xl mt-1">
          Frequently asked questions, corridor troubleshooting, report incorrect road conditions, and 24/7 helpline contacts.
        </p>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveView('login')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm cursor-pointer transition-all space-y-2"
        >
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 w-fit">
            <KeyRound className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Login & Account Help</h4>
          <p className="text-xs text-slate-500">Credential reset and profile verification</p>
        </div>

        <div
          onClick={() => setActiveView('route-opt')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-cyan-300 shadow-sm cursor-pointer transition-all space-y-2"
        >
          <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-700 w-fit">
            <Navigation className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Route Problems</h4>
          <p className="text-xs text-slate-500">Calculate detours and avoid hill hazards</p>
        </div>

        <div
          onClick={() => setActiveView('tracking')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm cursor-pointer transition-all space-y-2"
        >
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 w-fit">
            <Truck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Shipment Issues</h4>
          <p className="text-xs text-slate-500">GPS telemetry and driver communications</p>
        </div>

        <div
          onClick={() => setActiveView('arka-assistant')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-sm cursor-pointer transition-all space-y-2"
        >
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 w-fit">
            <Bot className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">ARKA AI Help</h4>
          <p className="text-xs text-slate-500">Ask natural language or voice questions</p>
        </div>
      </div>

      {/* Main Grid: FAQs + Report Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: FAQ Accordion */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileQuestion className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-50 font-bold text-xs sm:text-sm text-slate-800"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Report Incorrect Road Information Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t('reportRoadIssue')}
            </h3>
          </div>

          {reportSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you. Your road condition report has been submitted to the state traffic cell.</span>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <p className="text-slate-500">
                Help other drivers and logistics teams by reporting unmapped potholes, bridge weight shifts, or sudden mudslides.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">State</label>
                <select
                  value={reportState}
                  onChange={(e) => setReportState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Assam">Assam</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Sikkim">Sikkim</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Highway / Sector</label>
                <input
                  type="text"
                  value={reportHighway}
                  onChange={(e) => setReportHighway(e.target.value)}
                  placeholder="e.g. NH-27 Mile 14"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Describe Hazard or Issue</label>
                <textarea
                  rows={3}
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  placeholder="Describe road blockage, subsidence, missing warning sign, or toll pricing discrepancy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verification Report</span>
              </button>
            </form>
          )}

          {/* 24/7 Emergency Assistance Callout */}
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs space-y-1">
            <p className="font-bold text-red-900 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>National Disaster Helpline</span>
            </p>
            <p className="text-red-800 text-sm font-black">112 / 1070 (Toll-Free)</p>
            <p className="text-[11px] text-red-600">Immediate response across all 8 Northeast states.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
