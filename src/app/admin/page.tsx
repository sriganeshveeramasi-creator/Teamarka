"use client";

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import AdminDashboardView from '@/components/views/AdminDashboardView';

export default function AdminPage() {
  const { setActiveView } = useApp();

  useEffect(() => {
    setActiveView('admin');
  }, [setActiveView]);

  return <AdminDashboardView />;
}
