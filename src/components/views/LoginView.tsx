"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Globe,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export default function LoginView() {
  const { login, setActiveView, language, setLanguage, languages, t } = useApp();

  const [identifier, setIdentifier] = useState('officer.guwahati@arka-ne.gov.in');
  const [password, setPassword] = useState('arka2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Mobile Number or Email address.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(identifier);
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSuccess(false);
    }, 1800);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Header with Color Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center font-black text-2xl mb-2">
            A
          </div>
          <h2 className="text-xl font-bold tracking-tight">TEAM ARKA</h2>
          <p className="text-xs text-cyan-100 font-medium mt-0.5">
            {t('appTagline')}
          </p>

          {/* Embedded Language Switcher */}
          <div className="mt-4 inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-200" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="text-slate-800">
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Authentication Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800">
              {isSignUpMode ? 'Create New Account' : t('login')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUpMode
                ? 'Register for Northeast Logistics & Accessibility Portal'
                : 'Access live route optimization & regional risk intelligence'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile / Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('identifierPlaceholder')}</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Mobile Number or Email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('passwordPlaceholder')}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>{t('rememberMe')}</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                {t('forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUpMode ? 'Create Account' : t('login')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch & Help Link */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2.5 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setErrorMessage('');
              }}
              className="font-semibold text-blue-600 hover:underline"
            >
              {isSignUpMode ? 'Already have an account? Login' : t('createAccount')}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('help')}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('helpSupport')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900">Reset Password</h4>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Password reset instructions sent to your registered contact.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Enter your email or mobile number to receive a secure recovery code.
                </p>
                <input
                  type="text"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="officer@arka-ne.gov.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
