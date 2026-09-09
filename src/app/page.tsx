"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileMenu from '@/components/layout/MobileMenu';

// Views
import LandingView from '@/components/views/LandingView';
import LoginView from '@/components/views/LoginView';
import DashboardView from '@/components/views/DashboardView';
import RouteOptimizationView from '@/components/views/RouteOptimizationView';
import ShipmentTrackingView from '@/components/views/ShipmentTrackingView';
import RiskIntelligenceView from '@/components/views/RiskIntelligenceView';
import WeatherIntelligenceView from '@/components/views/WeatherIntelligenceView';
import AccessibilityView from '@/components/views/AccessibilityView';
import ArkaAiAssistantView from '@/components/views/ArkaAiAssistantView';
import NortheastMapIntelView from '@/components/views/NortheastMapIntelView';
import EmergencyModeView from '@/components/views/EmergencyModeView';
import AnalyticsView from '@/components/views/AnalyticsView';
import AdminDashboardView from '@/components/views/AdminDashboardView';
import HelpSupportView from '@/components/views/HelpSupportView';

export default function Home() {
  const { activeView } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingView />;
      case 'login':
        return <LoginView />;
      case 'dashboard':
        return <DashboardView />;
      case 'route-opt':
        return <RouteOptimizationView />;
      case 'tracking':
        return <ShipmentTrackingView />;
      case 'risks':
        return <RiskIntelligenceView />;
      case 'weather':
        return <WeatherIntelligenceView />;
      case 'accessibility':
        return <AccessibilityView />;
      case 'arka-assistant':
        return <ArkaAiAssistantView />;
      case 'northeast-map':
        return <NortheastMapIntelView />;
      case 'emergency':
        return <EmergencyModeView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'admin':
        return <AdminDashboardView />;
      case 'help':
        return <HelpSupportView />;
      default:
        return <DashboardView />;
    }
  };

  const isFullWidthPage = activeView === 'landing' || activeView === 'login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Global Top Navbar */}
      <Navbar />

      {/* Global Mobile Drawer */}
      <MobileMenu />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on Landing & Login for clean visual presentation) */}
        {!isFullWidthPage && <Sidebar />}

        {/* Dynamic Viewport Content */}
        <main className={`flex-1 overflow-y-auto ${isFullWidthPage ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full'}`}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
