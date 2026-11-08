import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Wallet, 
  Building2, 
  TrendingUp, 
  ArrowLeftRight, 
  Calculator, 
  User, 
  LogOut, 
  ChevronDown, 
  Phone, 
  ShieldAlert, 
  Settings,
  Gift,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    walletBalance, 
    setIsWalletModalOpen, 
    subscriptionApplications, 
    setIsReferralModalOpen,
    dailyTaskState,
    setIsZariOpen
  } = useInvestment();
  const { userProfile, canAccessAdminPortal, isInvestor, setIsAuthModalOpen, setAuthMode, logoutUser } = useAuth();
  const { isAdminMode, setIsAdminMode } = useAdmin();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pendingSubCount = subscriptionApplications ? subscriptionApplications.filter((a) => a.status === 'pending').length : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('portfolio');
            }}
            className="text-lg font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm border border-slate-800 dark:border-emerald-500">
              H&D
            </span>
            <span className="tracking-tight uppercase">H&D CHASE PLATFORM</span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('portfolio');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isAdminMode && activeTab === 'portfolio'
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Personalized Portfolio</span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('marketplace');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isAdminMode && activeTab === 'marketplace'
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Investment Levels</span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('simulator');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isAdminMode && activeTab === 'simulator'
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Wealth Simulator</span>
            </button>

            {/* Admin Console Navigation Toggle - Strictly Restricted to Authorized Personnel */}
            {canAccessAdminPortal ? (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isAdminMode
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-400/40'
                    : 'text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800'
                }`}
                title="Toggle Administrative Operator Console"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isAdminMode ? 'Exit Admin' : 'Admin Console'}</span>
                {pendingSubCount > 0 && !isAdminMode && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                    {pendingSubCount}
                  </span>
                )}
              </button>
            ) : userProfile?.role === 'admin' && userProfile?.adminStatus === 'pending_approval' ? (
              <div 
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-help"
                title="Your Admin Portal registration is currently pending review by Super Admin David Kivunja"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Admin Request Pending</span>
              </div>
            ) : null}
          </nav>

          {/* Zone 3: Wallet + Auth actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors shrink-0 shadow-2xs"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle dark theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Cash Wallet */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Open Cash Wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Wallet:</span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                KSh {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </button>

            {/* Ask Zari AI Guide */}
            <button
              onClick={() => setIsZariOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-lg transition-all shadow-2xs whitespace-nowrap"
              title="Ask Zari AI Investor Guide & FAQs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ask Zari</span>
            </button>

            {/* User Account / Login Button */}
            {userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-800 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shadow-xs relative"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[110px] truncate">{userProfile.displayName || userProfile.email.split('@')[0]}</span>
                  {dailyTaskState && (dailyTaskState.status === 'pending' || dailyTaskState.status === 'in_progress') && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Daily video task pending" />
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Profile dropdown menu */}
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{userProfile.displayName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{userProfile.email}</div>
                      {userProfile.mobileNumber && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{userProfile.mobileNumber}</span>
                        </div>
                      )}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full inline-block">
                          {userProfile.accountTier}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {userProfile.memberId}
                        </span>
                      </div>
                    </div>

                    {/* Dark Theme Option Section */}
                    <div 
                      className="px-4 py-2.5 my-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between border-b border-slate-100 dark:border-slate-800"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-indigo-950 text-indigo-400' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            Dark Theme
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {isDark ? 'Obsidian mode active' : 'Light mode active'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isDark ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                        aria-label="Toggle dark theme"
                      >
                        <span
                          className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isDark ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        >
                          {isDark ? (
                            <Moon className="w-3 h-3 text-slate-900" />
                          ) : (
                            <Sun className="w-3 h-3 text-amber-500" />
                          )}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setIsAdminMode(false);
                        setActiveTab('portfolio');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>My Portfolio Dashboard</span>
                    </button>

                    {/* Daily Video Tasks */}
                    <button
                      onClick={() => {
                        setIsAdminMode(false);
                        setActiveTab('tasks');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Daily Video Tasks</span>
                      </div>
                      {dailyTaskState && dailyTaskState.status === 'completed' ? (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full">
                          ✓ Done
                        </span>
                      ) : dailyTaskState && dailyTaskState.status === 'forfeited' ? (
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded-full">
                          Forfeited
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                          Pending
                        </span>
                      )}
                    </button>

                    {/* Refer & Earn (10% Commission) */}
                    <button
                      onClick={() => {
                        setIsReferralModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Refer & Earn</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        10% Bonus
                      </span>
                    </button>

                    {/* Ask Zari AI Guide */}
                    <button
                      onClick={() => {
                        setIsZariOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Ask Zari (AI FAQs & Guide)</span>
                      </div>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        AI
                      </span>
                    </button>

                    {/* Admin Console Entry - Strictly for Authorized Personnel */}
                    {canAccessAdminPortal && (
                      <button
                        onClick={() => {
                          setIsAdminMode(!isAdminMode);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold flex items-center gap-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{isAdminMode ? 'Return to Investor View' : 'Open Admin Console'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Switch Investor Account</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        logoutUser();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-2 bg-slate-50 dark:bg-slate-950 text-xs">
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('portfolio');
          }}
          className={`px-2 py-1.5 font-medium whitespace-nowrap shrink-0 ${
            !isAdminMode && activeTab === 'portfolio' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Portfolio
        </button>
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('marketplace');
          }}
          className={`px-2 py-1.5 font-medium whitespace-nowrap shrink-0 ${
            !isAdminMode && activeTab === 'marketplace' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Plans
        </button>
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('tasks');
          }}
          className={`px-2 py-1.5 font-medium whitespace-nowrap shrink-0 flex items-center gap-1 ${
            !isAdminMode && activeTab === 'tasks' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Tasks</span>
          {dailyTaskState && (dailyTaskState.status === 'pending' || dailyTaskState.status === 'in_progress') && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setIsReferralModalOpen(true)}
          className="px-2 py-1.5 font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded-md whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          <Gift className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
          <span>Refer 10%</span>
        </button>
        {canAccessAdminPortal && (
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`px-2 py-1.5 font-bold whitespace-nowrap shrink-0 ${
              isAdminMode ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {isAdminMode ? 'Exit Admin' : 'Admin'}
          </button>
        )}
      </div>
    </header>
  );
};
