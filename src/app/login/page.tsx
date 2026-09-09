"use client";

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import LoginView from '@/components/views/LoginView';

export default function LoginPage() {
  const { setActiveView } = useApp();

  useEffect(() => {
    setActiveView('login');
  }, [setActiveView]);

  return <LoginView />;
}
