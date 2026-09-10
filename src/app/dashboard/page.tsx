"use client";

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import DashboardView from '@/components/views/DashboardView';

export default function DashboardPage() {
  const { setActiveView } = useApp();

  useEffect(() => {
    setActiveView('dashboard');
  }, [setActiveView]);

  return <DashboardView />;
}
