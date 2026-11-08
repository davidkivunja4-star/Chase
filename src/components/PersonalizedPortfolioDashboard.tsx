import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { PLAN_CONFIGS, UserPlanInvestment } from '../types';
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  Wallet, 
  FileCheck, 
  RefreshCw, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  ArrowUpRight, 
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Play,
  FastForward,
  PlusCircle,
  HelpCircle,
  Percent,
  User,
  Lock,
  Gift,
  Share2,
  Copy,
  Check
} from 'lucide-react';

export const PersonalizedPortfolioDashboard: React.FC = () => {
  const { 
    planInvestments,
    subscriptionApplications,
    holdings, 
    properties, 
    walletBalance, 
    historicalPerformance, 
    dripEnabled, 
    toggleDrip, 
    claimDailyReturns,
    advanceSimulationDays,
    setSelectedContractForReinvest,
    setIsReinvestModalOpen,
    setActiveCertificateHolding, 
    setSelectedPropertyForDetail, 
    setIsWalletModalOpen, 
    setActiveTab,
    hasActiveSubscription,
    activeSubscription,
    userReferralCode,
    totalReferralCommissionEarned,
    pendingReferralCommission,
    referrals,
    setIsReferralModalOpen,
    dailyTaskState,
    pendingWithdrawals,
    setIsZariOpen,
    openZariWithPrompt,
  } = useInvestment();
  const { userProfile } = useAuth();
  const { setIsAdminMode, setAdminTab } = useAdmin();

  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | 'ALL'>('6M');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<'ALL' | 'AL_FAKEER' | 'HABIBI' | 'DUBAJ' | 'HAMZA'>('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [dismissedGrantedNotice, setDismissedGrantedNotice] = useState<boolean>(false);

  const latestGrantedWithdrawal = pendingWithdrawals.find((w) => w.status === 'granted');
  const latestPendingWithdrawal = pendingWithdrawals.find((w) => w.status === 'pending');

  // Filter plan investments
  const filteredPlans = planInvestments.filter((p) => {
    if (selectedPlanFilter === 'ALL') return true;
    return p.plan === selectedPlanFilter;
  });

  const activePlans = filteredPlans.filter((p) => p.status === 'active');
  const maturedPlans = filteredPlans.filter((p) => p.status === 'matured');
  const reinvestedPlans = filteredPlans.filter((p) => p.status === 'reinvested');

  // Aggregates
  const totalCapitalInActivePlans = planInvestments
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.capitalInvested, 0);

  const totalDailyReturnRate = planInvestments
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.dailyReturn, 0);

  const totalAccumulatedDailyReturns = planInvestments
    .reduce((sum, p) => sum + p.totalAccumulatedReturn, 0);

  const totalUnclaimedReturns = planInvestments
    .reduce((sum, p) => sum + p.unclaimedReturns, 0);

  const totalPortfolioValue = totalCapitalInActivePlans + totalAccumulatedDailyReturns + walletBalance;

  // Level metrics
  const fakeerPlans = planInvestments.filter((p) => p.plan === 'AL_FAKEER');
  const habibiPlans = planInvestments.filter((p) => p.plan === 'HABIBI');
  const dubajPlans = planInvestments.filter((p) => p.plan === 'DUBAJ');
  const hamzaPlans = planInvestments.filter((p) => p.plan === 'HAMZA');

  const handleExportStatement = (type: string) => {
    setExportNotice(`Generated ${type} for H&D CHASE PLATFORM Account ${userProfile?.memberId || 'HDC-8942-ELITE'}`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const openReinvestModal = (contract: UserPlanInvestment) => {
    setSelectedContractForReinvest(contract);
    setIsReinvestModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Allocation Status Alert Banners */}
      {latestGrantedWithdrawal && !dismissedGrantedNotice && (
        <div className="bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-5 shadow-xl border-2 border-emerald-400 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-emerald-900 px-2.5 py-0.5 rounded-full shadow-xs">
                  ✓ Allocation Successful
                </span>
                <span className="text-xs font-mono text-emerald-200">
                  {latestGrantedWithdrawal.withdrawalNumber}
                </span>
                <span className="text-[11px] text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">
                  Granted within 12h window
                </span>
              </div>
              <div className="text-sm md:text-base font-black text-white">
                KSh {latestGrantedWithdrawal.amountKsh.toLocaleString()} Disbursed to M-Pesa Line ({latestGrantedWithdrawal.mpesaNumber})
              </div>
              <div className="text-xs text-emerald-100 leading-relaxed">
                The admin granted access within the 12-hour timeframe. Payment was disbursed by {latestGrantedWithdrawal.grantedBy || 'Finance Desk'}.
                {latestGrantedWithdrawal.adminNotes ? ` (Memo: ${latestGrantedWithdrawal.adminNotes})` : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
            >
              View in Wallet
            </button>
            <button
              onClick={() => setDismissedGrantedNotice(true)}
              className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Dismiss notification"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {latestPendingWithdrawal && !latestGrantedWithdrawal && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 bg-amber-50/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-700 animate-spin" />
            </div>
            <div className="text-xs text-slate-800">
              <span className="font-bold text-amber-900">M-Pesa 12-Hour Allocation Queue:</span> Withdrawal #{latestPendingWithdrawal.withdrawalNumber} of <strong className="font-mono font-bold text-slate-900">KSh {latestPendingWithdrawal.amountKsh.toLocaleString()}</strong> is queued. The admin can grant access at any time within the 12-hour timeframe without waiting for the full 12 hours.
            </div>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0 text-left"
          >
            Track Status &rarr;
          </button>
        </div>
      )}

      {/* Top Banner: Short Welcome Notice & Investor Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                Investor Welcome Notice
              </span>
              <span className="text-xs text-amber-300 font-mono bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                Special ID: {userProfile?.memberId || 'HDC-8942-INV'}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Private Investor</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome, {userProfile?.displayName || 'David Kivunja'}!
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Welcome back to your personalized investor portfolio dashboard. Monitor your verified member credentials, active investment levels (<strong className="text-emerald-400">Level 1 Al-fakeer</strong>, <strong className="text-amber-400">Level 2 Habibi</strong>, <strong className="text-sky-400">Level 3 Dubaj</strong>, <strong className="text-purple-300">VIP 1 Hamza</strong>), and manage your available cash balance.
            </p>
          </div>

          {/* Quick Actions & Wallet Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Wallet:</span>
              <span className="font-mono font-bold text-emerald-400">
                KSh {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </button>

            {totalUnclaimedReturns > 0 && (
              <button
                onClick={() => claimDailyReturns()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors animate-pulse"
              >
                <Coins className="w-4 h-4" />
                <span>Claim All Returns (KSh {totalUnclaimedReturns.toLocaleString()})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors ${
                hasActiveSubscription
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30'
                  : 'bg-white hover:bg-slate-100 text-slate-900'
              }`}
            >
              {hasActiveSubscription ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plan Active ({activeSubscription?.daysRemaining}d to Maturity)</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-emerald-700" />
                  <span>Subscribe New Plan</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsZariOpen(true)}
              className="px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Ask Zari AI Guide</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background gradient */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Daily Motivation & Yield Task Status Banner */}
      <div className={`rounded-3xl p-5 border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        dailyTaskState.status === 'completed'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : dailyTaskState.status === 'forfeited'
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : 'bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-amber-300/80 text-slate-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
            dailyTaskState.status === 'completed'
              ? 'bg-emerald-600 text-white'
              : dailyTaskState.status === 'forfeited'
              ? 'bg-rose-600 text-white'
              : 'bg-amber-500 text-slate-950 animate-pulse'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm">
                {dailyTaskState.status === 'completed'
                  ? `Today's Daily Task Completed (+KSh ${dailyTaskState.creditedAmountKsh || dailyTaskState.dailyReturnKsh} Accrued)`
                  : dailyTaskState.status === 'forfeited'
                  ? `Today's 24-Hour Task Expired (Return Forfeited)`
                  : `Today's Daily Yield Task: 2 Motivational Videos Ready`}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                dailyTaskState.status === 'completed'
                  ? 'bg-emerald-200 text-emerald-800'
                  : dailyTaskState.status === 'forfeited'
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-amber-400 text-slate-950 font-black'
              }`}>
                {dailyTaskState.status === 'completed'
                  ? 'Completed'
                  : dailyTaskState.status === 'forfeited'
                  ? 'Forfeited'
                  : 'Action Required'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {dailyTaskState.status === 'completed'
                ? `Today's return was credited to your balance. Next task unlocks at cycle reset (24h waiting rule).`
                : dailyTaskState.status === 'forfeited'
                ? `The 24-hour timeframe passed without watching both videos. Today's return was not added to your balance.`
                : `Watch two short inspirational & financial videos to accumulate today's return of KSh ${dailyTaskState.dailyReturnKsh.toLocaleString()} to your account.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs transition-colors shrink-0 ${
            dailyTaskState.status === 'completed'
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
              : dailyTaskState.status === 'forfeited'
              ? 'bg-rose-700 hover:bg-rose-800 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <span>{dailyTaskState.status === 'completed' ? 'View Daily Task' : 'Go to Tasks'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pending Subscription & Re-investment Applications Awaiting Admin Approval & Activation */}
      {subscriptionApplications.filter((a) => a.status === 'pending').length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-950 text-sm">
                    {subscriptionApplications.filter((a) => a.status === 'pending').length} Plan Request(s) Awaiting Admin Payment Confirmation & Plan Activation
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider animate-pulse">
                    Awaiting Activation
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-0.5">
                  When you submit a new subscription or re-invest from any plan, the admin receives your request. Once payment is confirmed, the admin activates your plan and daily returns (Habibi: 300 KSh/day · Dubaj: 500 KSh/day) begin accruing immediately.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAdminMode(true);
                setAdminTab('subscriptions');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs transition-colors shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Switch to Admin to Confirm Payment & Activate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {subscriptionApplications.filter((a) => a.status === 'pending').map((app) => (
              <div key={app.id} className="bg-white rounded-2xl p-4 border border-amber-300 shadow-xs text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold">{app.applicationNumber}</span>
                  {app.requestType === 'REINVESTMENT' ? (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-sans font-bold uppercase text-[9px]">
                      Re-Investment
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-sans font-bold uppercase text-[9px]">
                      New Subscription
                    </span>
                  )}
                </div>

                <div className="font-bold text-slate-900 text-sm font-sans flex items-center justify-between">
                  <span>{app.planName}</span>
                  <span className="text-emerald-700 text-xs font-mono font-black">
                    +{app.dailyReturnKsh.toLocaleString()} KSh / day
                  </span>
                </div>

                {app.requestType === 'REINVESTMENT' && app.sourceContractNumber && (
                  <div className="text-[11px] text-purple-900 font-sans">
                    Rollover from Contract: <strong className="font-mono">#{app.sourceContractNumber}</strong>
                  </div>
                )}

                <div className="text-slate-600 text-[11px] font-sans">
                  Capital: <strong className="font-mono text-slate-900">KSh {app.capitalKsh.toLocaleString()}</strong> ({app.units} unit{app.units > 1 ? 's' : ''} · {app.periodDays} Days)
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Payment Ref: <strong className="font-mono text-slate-800">{app.paymentReference}</strong></span>
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>Pending Activation</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifecycle Simulation Bar (Fast-Forward to Test Maturity & Reinvestment) */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong className="text-amber-950 font-bold block">Testing Lifecycle & Re-investment Simulator:</strong>
            <span className="text-amber-800 text-[11px]">
              Fast-forward timeline to accrue daily returns and reach 60/72 day maturity. A user can subscribe only once to any plan only; once matured, the single-plan lock is released so you can re-invest or choose a new plan!
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => advanceSimulationDays(1)}
            className="px-3 py-1.5 bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            title="Accrue +1 Day of returns"
          >
            <Play className="w-3 h-3 fill-current text-amber-600" />
            <span>+1 Day (Accrue)</span>
          </button>

          <button
            onClick={() => advanceSimulationDays(10)}
            className="px-3 py-1.5 bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            title="Accrue +10 Days"
          >
            <FastForward className="w-3 h-3 text-amber-600" />
            <span>+10 Days</span>
          </button>

          <button
            onClick={() => advanceSimulationDays(60)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            title="Fast-forward straight to maturity"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Fast-Forward to Maturity</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="font-bold text-emerald-700">×</button>
        </div>
      )}

      {/* Investor Profile & Account Credentials 4-Column Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Full Name of the Investor */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Investor Full Name</span>
              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-2 truncate" title={userProfile?.displayName || 'David Kivunja'}>
              {userProfile?.displayName || 'David Kivunja'}
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{userProfile?.accountTier || 'Verified Private Investor'}</span>
          </div>
        </div>

        {/* 2. Special ID Acquired After Registration and Plan Investment */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Special Investor ID</span>
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-2 tracking-tight">
              {userProfile?.memberId || 'HDC-8942-INV'}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 font-mono">
            <span>Allocated upon registration & investment</span>
          </div>
        </div>

        {/* 3. Active Plans */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Plans</span>
              <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400">
                <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </span>
            </div>
            <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-2">
              {activePlans.length} Active {activePlans.length === 1 ? 'Plan' : 'Plans'}
            </div>
          </div>
          <div className="space-y-1 mt-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                {habibiPlans.filter((p) => p.status === 'active').length} Habibi
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 text-[10px] font-bold">
                {dubajPlans.filter((p) => p.status === 'active').length} Dubaj
              </span>
            </div>
            <div className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Limit: 1 active plan at a time until maturity</span>
            </div>
          </div>
        </div>

        {/* 4. Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Balance</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </span>
            </div>
            <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-2">
              KSh {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Available cash</span>
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              Manage Wallet →
            </button>
          </div>
        </div>
      </div>

      {/* Zari AI Concierge & Guidance Spotlight */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Investor Concierge</span>
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                Live FAQs & Guidance
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Meet Zari — Your Personal AI Guide</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Stuck on a platform rule, curious about how the 12-hour withdrawal allocation works, or wondering which investment tier suits your budget? Ask Zari anytime for instant, accurate answers and step-by-step navigation guidance.
              </p>
            </div>

            {/* Quick Interactive FAQ Prompts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => openZariWithPrompt('How do I watch videos and claim my daily return in the Daily Tasks page?')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1"
              >
                <span>Claim Daily Returns?</span>
                <ChevronRight className="w-3 h-3 text-emerald-400" />
              </button>
              <button
                onClick={() => openZariWithPrompt('Explain the 12-hour M-Pesa withdrawal allocation window and when admin can grant access.')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1"
              >
                <span>12h Withdrawal Window?</span>
                <ChevronRight className="w-3 h-3 text-emerald-400" />
              </button>
              <button
                onClick={() => openZariWithPrompt('Why does the platform only allow one active plan at a time until maturity?')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1"
              >
                <span>Single Plan Policy?</span>
                <ChevronRight className="w-3 h-3 text-emerald-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsZariOpen(true)}
              className="px-6 py-3.5 bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>Chat with Zari Now</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Referral Program Spotlight: Earn 10% on Every Subscribed Plan */}
      <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Gift className="w-3.5 h-3.5" />
                <span>10% Instant Referral Bonus</span>
              </span>
              <span className="text-xs text-emerald-300 font-medium">
                {referrals.filter((r) => r.status === 'credited').length} Successful Payouts
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Refer an Investor, Receive 10% of Their Invested Capital
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Invite friends and fellow investors to the HavenShare platform. Whenever a member signs up with your referral code or link and activates any investment plan, <strong>10% of their invested capital</strong> is automatically credited into your wallet in cash!
              </p>
            </div>

            {/* Tier Return Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] text-slate-300 font-medium">Level 1 (5k KSh)</span>
                <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">+500 KSh</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] text-slate-300 font-medium">Level 2 (10k KSh)</span>
                <span className="text-xs sm:text-sm font-black font-mono text-amber-300">+1,000 KSh</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] text-slate-300 font-medium">Level 3 (20k KSh)</span>
                <span className="text-xs sm:text-sm font-black font-mono text-sky-300">+2,000 KSh</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] text-slate-300 font-medium">VIP 1 (50k KSh)</span>
                <span className="text-xs sm:text-sm font-black font-mono text-purple-300">+5,000 KSh</span>
              </div>
            </div>
          </div>

          {/* Quick Share & Referral Stats Box */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-500/40 space-y-4 shrink-0 lg:w-80">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Your Unique Referral Code
              </span>
              <div className="flex items-center justify-between gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800">
                <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                  {userReferralCode || userProfile?.referralCode || 'HDC-DAVID-8942'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(userReferralCode || userProfile?.referralCode || 'HDC-DAVID-8942');
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Commission</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  KSh {totalReferralCommissionEarned.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Invited Members</span>
                <span className="font-mono font-black text-white text-sm">
                  {referrals.length} Investors
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReferralModalOpen(true)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Open Referral Hub & Invite</span>
            </button>
          </div>
        </div>

        {/* Decorative lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Investment Level Breakdown Grid: 4 LEVELS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level 1: Al-fakeer */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-300 dark:border-emerald-600/60 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Level 1 (Al-fakeer)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 font-mono">
                60d
              </span>
            </div>
            <div className="mt-3 p-2.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Capital:</span>
                <strong className="font-mono text-slate-900 dark:text-white font-bold">KSh 5,000</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Daily:</span>
                <strong className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">+200 KSh / d</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Total Return:</span>
                <strong className="font-mono text-emerald-900 dark:text-emerald-300 font-bold">KSh 12,000</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Active: <strong className="font-mono text-slate-900 dark:text-white">{fakeerPlans.filter((p) => p.status === 'active').length}</strong>
            </span>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-bold text-xs flex items-center gap-0.5"
            >
              <span>View Level</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Level 2: Habibi */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-300 dark:border-amber-600/60 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Level 2 (Habibi)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-mono">
                60d
              </span>
            </div>
            <div className="mt-3 p-2.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200/70 dark:border-amber-800/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Capital:</span>
                <strong className="font-mono text-slate-900 dark:text-white font-bold">KSh 10,000</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Daily:</span>
                <strong className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">+300 KSh / d</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Total Return:</span>
                <strong className="font-mono text-amber-950 dark:text-amber-300 font-bold">KSh 18,000</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Active: <strong className="font-mono text-slate-900 dark:text-white">{habibiPlans.filter((p) => p.status === 'active').length}</strong>
            </span>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="text-amber-800 dark:text-amber-400 hover:text-amber-950 font-bold text-xs flex items-center gap-0.5"
            >
              <span>View Level</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Level 3: Dubaj */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-sky-300 dark:border-sky-600/60 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Level 3 (Dubaj)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 font-mono">
                72d
              </span>
            </div>
            <div className="mt-3 p-2.5 bg-sky-50/60 dark:bg-sky-950/40 rounded-xl border border-sky-200/70 dark:border-sky-800/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Capital:</span>
                <strong className="font-mono text-slate-900 dark:text-white font-bold">KSh 20,000</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Daily:</span>
                <strong className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">+500 KSh / d</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Total Return:</span>
                <strong className="font-mono text-sky-950 dark:text-sky-300 font-bold">KSh 36,000</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Active: <strong className="font-mono text-slate-900 dark:text-white">{dubajPlans.filter((p) => p.status === 'active').length}</strong>
            </span>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="text-sky-800 dark:text-sky-400 hover:text-sky-950 font-bold text-xs flex items-center gap-0.5"
            >
              <span>View Level</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* VIP 1: Hamza */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border-2 border-amber-400 dark:border-amber-500/70 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  VIP
                </span>
                <h3 className="text-sm font-black text-white">VIP 1 (Hamza)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                70d
              </span>
            </div>
            <div className="mt-3 p-2.5 bg-slate-800 rounded-xl border border-amber-400/30 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[10px]">Capital:</span>
                <strong className="font-mono text-white font-bold">KSh 50,000</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[10px]">Daily:</span>
                <strong className="font-mono text-emerald-400 font-bold">+1,000 KSh / d</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-[10px]">Total Return:</span>
                <strong className="font-mono text-amber-300 font-bold">KSh 70,000</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-400 text-[11px]">
              Active: <strong className="font-mono text-white">{hamzaPlans.filter((p) => p.status === 'active').length}</strong>
            </span>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-0.5"
            >
              <span>View Level</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: MATURED CONTRACTS (READY TO RE-INVEST) --- */}
      {maturedPlans.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <span>Matured Contracts Ready for Re-Investment</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    {maturedPlans.length} Matured
                  </span>
                </h2>
                <p className="text-xs text-emerald-800">
                  Congratulations! Your investment period is complete. You can now re-invest your capital into <strong>Level 1 (Al-fakeer)</strong>, <strong>Level 2 (Habibi)</strong>, <strong>Level 3 (Dubaj)</strong>, or <strong>VIP 1 (Hamza)</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {maturedPlans.map((contract) => (
              <div 
                key={contract.id}
                className="bg-white rounded-2xl p-5 border border-emerald-300 shadow-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{contract.contractNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 uppercase">
                      100% Matured
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-1">{contract.planName}</h4>
                  <div className="text-[11px] text-slate-500">{contract.propertyTitle}</div>

                  <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-slate-50 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Capital</span>
                      <strong className="text-slate-900">KSh {contract.capitalInvested.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Total Earned</span>
                      <strong className="text-emerald-700 font-bold">KSh {contract.totalAccumulatedReturn.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans">Period</span>
                      <strong className="text-slate-900">{contract.periodDays} Days</strong>
                    </div>
                  </div>
                </div>

                {/* Primary Call to Action */}
                <button
                  onClick={() => openReinvestModal(contract)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Re-Invest Contract into Next Level</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 2: ACTIVE PLAN CONTRACTS --- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Active Investment Levels</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live accruals, daily payout meters, and countdowns to contract maturity
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1">
              <button
                onClick={() => setSelectedPlanFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedPlanFilter === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                All Levels ({planInvestments.length})
              </button>
              <button
                onClick={() => setSelectedPlanFilter('AL_FAKEER')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedPlanFilter === 'AL_FAKEER' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Level 1 (5k)
              </button>
              <button
                onClick={() => setSelectedPlanFilter('HABIBI')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedPlanFilter === 'HABIBI' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Level 2 (10k)
              </button>
              <button
                onClick={() => setSelectedPlanFilter('DUBAJ')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedPlanFilter === 'DUBAJ' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Level 3 (20k)
              </button>
              <button
                onClick={() => setSelectedPlanFilter('HAMZA')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedPlanFilter === 'HAMZA' ? 'bg-purple-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                VIP 1 (50k)
              </button>
            </div>
          </div>
        </div>

        {activePlans.length === 0 ? (
          <div className="p-10 md:p-14 text-center bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Fresh Portfolio • Ready for Your First Investment
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
              You currently have 0 active contracts. Subscribe to one of HavenShare's 4 verified high-yield investment tiers to begin receiving automated daily returns directly into your cash wallet.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-102 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Explore 4 Investment Levels</span>
              </button>
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
              >
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Deposit via M-Pesa</span>
              </button>
              <button
                onClick={() => setIsZariOpen(true)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Zari Guidance</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activePlans.map((contract) => {
              const progressPct = Math.min(100, (contract.daysElapsed / contract.periodDays) * 100);

              return (
                <div key={contract.id} className="p-6 hover:bg-slate-50/50 transition-colors space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          contract.plan === 'HABIBI'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-sky-100 text-sky-900'
                        }`}>
                          {contract.planName}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">{contract.contractNumber}</span>
                        <span className="text-[11px] text-slate-400">· Start: {contract.startDate}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{contract.propertyTitle}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {contract.unclaimedReturns > 0 && (
                        <button
                          onClick={() => claimDailyReturns(contract.id)}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Coins className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Claim KSh {contract.unclaimedReturns.toLocaleString()}</span>
                        </button>
                      )}

                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
                        Maturity: {contract.maturityDate}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Capital Invested</span>
                      <strong className="font-mono text-slate-900 font-bold text-sm">
                        KSh {contract.capitalInvested.toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Daily Return Rate</span>
                      <strong className="font-mono text-emerald-700 font-bold text-sm">
                        KSh {contract.dailyReturn.toLocaleString()} / day
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Accrued to Date</span>
                      <strong className="font-mono text-amber-900 font-bold text-sm">
                        KSh {contract.totalAccumulatedReturn.toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Days Remaining</span>
                      <strong className="font-mono text-slate-900 font-bold text-sm">
                        {contract.daysRemaining} of {contract.periodDays} days
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar towards Maturity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>Day {contract.daysElapsed} of {contract.periodDays} completed ({progressPct.toFixed(0)}%)</span>
                      <span className="font-bold text-slate-700">Maturity Countdown: {contract.daysRemaining} days</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          contract.plan === 'HABIBI' ? 'bg-amber-500' : 'bg-sky-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- SECTION 3: RE-INVESTED HISTORICAL CONTRACTS --- */}
      {reinvestedPlans.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Re-Invested Contracts Archive</span>
              </h3>
              <p className="text-xs text-slate-500">
                Completed cycles successfully rolled over into new 60 or 72 day investment periods
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">{reinvestedPlans.length} Rolled Over</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {reinvestedPlans.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono font-bold text-slate-900">{item.contractNumber}</div>
                  <div className="text-[11px] text-slate-500">{item.planName} · Full {item.periodDays} Days completed</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-700">
                    +KSh {item.totalAccumulatedReturn.toLocaleString()} Earned
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Re-invested into Plan {item.reinvestedIntoPlan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 4: HISTORICAL PERFORMANCE CHART & TAX SUMMARY --- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Historical Portfolio Trajectory (KSh)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Verified asset growth and cumulative daily payout compounding
            </p>
          </div>

          {/* Timeframe Toggles & Statements */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['1M', '3M', '6M', 'ALL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    timeframe === t ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleExportStatement('Annual Payout Statement (PDF)')}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs flex items-center gap-1 font-semibold"
              title="Download Statement"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>

        {/* Visual Growth Bars */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs font-mono">
            {historicalPerformance.map((point) => (
              <div key={point.date} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-slate-500 font-sans text-[11px]">
                  <span>{point.monthLabel}</span>
                  <span className="font-mono text-emerald-700 font-bold">+{point.returnPct}%</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  KSh {point.portfolioValue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 font-sans">
                  Daily Returns: <strong className="text-emerald-700 font-mono">KSh {point.cumulativeDividends.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
