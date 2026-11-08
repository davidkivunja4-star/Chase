import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth, PAYMENT_RECIPIENT_PHONE } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { InvestmentPlan, PLAN_CONFIGS } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Check, 
  Copy, 
  X, 
  Lock,
  Crown,
  Zap,
  Award
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { 
    setActiveTab, 
    activeSubscription, 
    hasActiveSubscription, 
    pendingSubscriptionApp, 
    hasPendingSubscription, 
    canSubscribeNewPlan 
  } = useInvestment();
  
  const { 
    pendingInvestorForPlan, 
    chooseInvestorPlan, 
    isInstructionModalOpen, 
    setIsInstructionModalOpen, 
    selectedPlanForInstructions,
    activateInvestorAccountByAdmin,
    userProfile
  } = useAuth();
  
  const { setIsAdminMode, setAdminTab } = useAdmin();

  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [paymentConfirmedNotice, setPaymentConfirmedNotice] = useState<boolean>(false);
  const [simulatedActivationNotice, setSimulatedActivationNotice] = useState<string | null>(null);
  const [maturityLockAlert, setMaturityLockAlert] = useState<string | null>(null);

  const handlePlanSelect = (plan: InvestmentPlan) => {
    if (hasActiveSubscription && activeSubscription) {
      setMaturityLockAlert(
        `A user can subscribe only once to any plan only. After subscribing, the investor will have to wait until maturity. Your current ${activeSubscription.planName} contract (Contract #${activeSubscription.contractNumber}) has ${activeSubscription.daysRemaining} days remaining until maturity (${activeSubscription.maturityDate}).`
      );
      return;
    }
    if (hasPendingSubscription && pendingSubscriptionApp) {
      setMaturityLockAlert(
        `A user can subscribe only once to any plan only. You have a subscription application (#${pendingSubscriptionApp.applicationNumber}) awaiting admin payment confirmation and account activation.`
      );
      return;
    }
    chooseInvestorPlan(plan);
    setPaymentConfirmedNotice(false);
    setSimulatedActivationNotice(null);
  };

  const currentModalPlanConfig = selectedPlanForInstructions 
    ? PLAN_CONFIGS[selectedPlanForInstructions] 
    : PLAN_CONFIGS.HABIBI;

  return (
    <div className="space-y-10">
      {/* Alert Modal for Subscription Lock / Wait for Maturity */}
      {maturityLockAlert && (
        <div className="bg-amber-50 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl flex items-start justify-between gap-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-xs uppercase tracking-wider block">
                Subscription Restricted · Single Active Level Policy
              </strong>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                {maturityLockAlert}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMaturityLockAlert(null)}
            className="p-1 hover:bg-amber-200/60 rounded-lg text-amber-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTIVE SUBSCRIPTION LOCK CARD */}
      {hasActiveSubscription && activeSubscription && (
        <div className="bg-slate-900 border-2 border-amber-400 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                    Subscription Locked
                  </span>
                  <span className="text-xs text-amber-300 font-mono font-bold">
                    Active: #{activeSubscription.contractNumber} ({activeSubscription.planName})
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>+{activeSubscription.dailyReturn.toLocaleString()} KSh / day</span>
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  Active Subscription in Progress · Must Wait Until Maturity
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  A user can subscribe only once to any plan only. After subscribing, the investor will have to wait until maturity. Your current <strong className="text-amber-400">{activeSubscription.planName}</strong> contract is actively earning daily returns with <strong className="text-white font-mono">{activeSubscription.daysRemaining} days remaining</strong> until completion ({activeSubscription.maturityDate}).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab('portfolio')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>View in Portfolio Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cycle Timeline Progress */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2 relative z-10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">
                Cycle Progress: <strong className="text-white font-mono">{activeSubscription.daysElapsed}</strong> of <strong className="text-white font-mono">{activeSubscription.periodDays}</strong> Days Elapsed
              </span>
              <span className="text-amber-400 font-mono font-black">
                {activeSubscription.daysRemaining} Days Remaining Until Maturity
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((activeSubscription.daysElapsed / activeSubscription.periodDays) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Started: <strong className="font-mono text-slate-300">{activeSubscription.startDate}</strong></span>
              <span>Accumulated Returns: <strong className="font-mono text-emerald-400">+KSh {activeSubscription.totalAccumulatedReturn.toLocaleString()}</strong></span>
              <span>Maturity Date: <strong className="font-mono text-amber-300">{activeSubscription.maturityDate}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Registration Step 2: Choose Your Level Banner */}
      {pendingInvestorForPlan && !hasActiveSubscription && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                    Registration Step 2
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Investor: {pendingInvestorForPlan.fullName} ({pendingInvestorForPlan.memberId})
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Choose Your Investment Level to Complete Registration
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Select your preferred investment level below: <strong>Level 1 (Al-fakeer)</strong> (5,000 KSh), <strong>Level 2 Habibi</strong> (10,000 KSh), <strong>Level 3 Dubaj</strong> (20,000 KSh), or <strong>VIP 1 (Hamza)</strong> (50,000 KSh). After choosing, instructions to send money to <strong>0108689276</strong> will be displayed. Note: A user can subscribe only once to any plan only and must wait until maturity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Hero Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="max-w-4xl relative z-10 space-y-4">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>H&D CHASE PLATFORM · Four Curated Investment Levels</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-balance">
            Guaranteed Daily Cash Flow Levels.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Select your preferred investment level with daily return distributions accrued every 24 hours and seamless capital re-investment upon maturity. <em>A user can subscribe only once to any plan only; after subscribing, the investor will wait until maturity.</em>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <button
              onClick={() => handlePlanSelect('AL_FAKEER')}
              className="px-4 py-2.5 rounded-xl transition-colors font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs"
            >
              <span>Level 1: Al-fakeer (5,000 KSh)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePlanSelect('HABIBI')}
              className="px-4 py-2.5 rounded-xl transition-colors font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-xs"
            >
              <span>Level 2: Habibi (10,000 KSh)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePlanSelect('DUBAJ')}
              className="px-4 py-2.5 rounded-xl transition-colors font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-xs"
            >
              <span>Level 3: Dubaj (20,000 KSh)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePlanSelect('HAMZA')}
              className="px-4 py-2.5 rounded-xl transition-colors font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-xs"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>VIP 1: Hamza (50,000 KSh)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden lg:flex items-center justify-center">
          <TrendingUp className="w-72 h-72 text-amber-400" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* --- THE FOUR INVESTMENT LEVELS GRID --- */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Available Investment Levels</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any level below. A user can subscribe only once to any plan only; after subscribing, the investor will wait until maturity.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            <span>Instant Daily Return Accruals</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* LEVEL 1: AL-FAKEER */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/60 p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden transition-all hover:shadow-md hover:border-emerald-400">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    L1
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Level 1 (Al-fakeer)</h3>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                      Entry Investment Level
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  60 DAYS
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[38px]">
                Accessible entry investment level generating steady 200 KSh daily cash returns for 60 consecutive days.
              </p>

              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Investment Capital</span>
                  <strong className="font-mono text-slate-900 dark:text-white text-sm font-black">5,000 KSh</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Daily Return</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-sm font-black">200 KSh / day</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Period</span>
                  <strong className="font-mono text-slate-900 dark:text-white text-sm font-bold">60 Days</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Total Return</span>
                  <strong className="font-mono text-emerald-900 dark:text-emerald-300 text-sm font-black">12,000 KSh</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>200 KSh accrued every 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>12,000 KSh total payouts over 60 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                    Re-invest in any level after maturity
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelect('AL_FAKEER')}
              className={`w-full py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors font-black ${
                hasActiveSubscription
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
              }`}
            >
              {hasActiveSubscription ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Locked ({activeSubscription?.daysRemaining}d to Maturity)</span>
                </>
              ) : (
                <>
                  <span>Subscribe to Level 1 (5,000 KSh)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* LEVEL 2: HABIBI */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-300 dark:border-amber-600/60 p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden transition-all hover:shadow-md hover:border-amber-400">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                    L2
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Level 2 (Habibi)</h3>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                      High-Velocity Cash Flow
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  60 DAYS
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[38px]">
                High-velocity daily cash distribution generating 300 KSh daily returns for 60 consecutive days.
              </p>

              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Investment Capital</span>
                  <strong className="font-mono text-slate-900 dark:text-white text-sm font-black">10,000 KSh</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Daily Return</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-sm font-black">300 KSh / day</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Period</span>
                  <strong className="font-mono text-slate-900 dark:text-white text-sm font-bold">60 Days</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Total Return</span>
                  <strong className="font-mono text-amber-900 dark:text-amber-300 text-sm font-black">18,000 KSh</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>300 KSh accrued every 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>18,000 KSh total payouts over 60 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                    Re-invest in any level after maturity
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelect('HABIBI')}
              className={`w-full py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors font-black ${
                hasActiveSubscription
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-98'
              }`}
            >
              {hasActiveSubscription ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Locked ({activeSubscription?.daysRemaining}d to Maturity)</span>
                </>
              ) : (
                <>
                  <span>Subscribe to Level 2 (10,000 KSh)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* LEVEL 3: DUBAJ */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-sky-300 dark:border-sky-600/60 p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden transition-all hover:shadow-md hover:border-sky-400">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    L3
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Level 3 (Dubaj)</h3>
                    <div className="text-[10px] text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                      Extended Wealth Growth
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                  72 DAYS
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[38px]">
                Institutional-grade capital growth tier generating 500 KSh daily returns for 72 consecutive days.
              </p>

              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-sky-50/70 dark:bg-sky-950/40 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Investment Capital</span>
                  <strong className="font-mono text-slate-900 dark:text-white text-sm font-black">20,000 KSh</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Daily Return</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-sm font-black">500 KSh / day</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Period</span>
                  <strong className="font-mono text-slate-900 dark:text-white text-sm font-bold">72 Days</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Total Return</span>
                  <strong className="font-mono text-sky-950 dark:text-sky-300 text-sm font-black">36,000 KSh</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>500 KSh accrued every 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>36,000 KSh total payouts over 72 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                    Re-invest in any level after maturity
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelect('DUBAJ')}
              className={`w-full py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors font-black ${
                hasActiveSubscription
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-98'
              }`}
            >
              {hasActiveSubscription ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
                  <span>Locked ({activeSubscription?.daysRemaining}d to Maturity)</span>
                </>
              ) : (
                <>
                  <span>Subscribe to Level 3 (20,000 KSh)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* VIP 1: HAMZA */}
          <div className="bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 text-white rounded-3xl border-2 border-amber-400 p-6 shadow-lg flex flex-col justify-between space-y-5 relative overflow-hidden transition-all hover:shadow-xl">
            {/* VIP Ribbon */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
              <Crown className="w-3 h-3 text-slate-950" />
              <span>VIP Tier</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                    VIP
                  </span>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-1.5">
                      <span>VIP 1 (Hamza)</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </h3>
                    <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      Premier High-Yield Tier
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed min-h-[38px]">
                Executive VIP investment tier generating 1,000 KSh daily returns for 70 consecutive days.
              </p>

              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-800/90 rounded-2xl border border-amber-400/30 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Investment Capital</span>
                  <strong className="font-mono text-white text-sm font-black">50,000 KSh</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Daily Return</span>
                  <strong className="font-mono text-emerald-400 text-sm font-black">1,000 KSh / day</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Period</span>
                  <strong className="font-mono text-white text-sm font-bold">70 Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Total Return</span>
                  <strong className="font-mono text-amber-300 text-sm font-black">70,000 KSh</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1,000 KSh accrued every 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>70,000 KSh returns over 70 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-300 text-[11px]">
                    VIP investor dedicated support & priority
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePlanSelect('HAMZA')}
              className={`w-full py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors font-black ${
                hasActiveSubscription
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 active:scale-98'
              }`}
            >
              {hasActiveSubscription ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Locked ({activeSubscription?.daysRemaining}d to Maturity)</span>
                </>
              ) : (
                <>
                  <span>Subscribe to VIP 1 (50,000 KSh)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Subscription & Payment Instructions Modal */}
      {isInstructionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  H&D
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentModalPlanConfig.name} ({currentModalPlanConfig.capitalKsh.toLocaleString()} KSh)
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Subscription & Payment Instructions</div>
                </div>
              </div>
              <button
                onClick={() => setIsInstructionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {simulatedActivationNotice ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold uppercase tracking-wider">
                    Account Activated by Admin
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    Payment Confirmed & Account Active!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    {simulatedActivationNotice}
                  </p>
                  <button
                    onClick={() => {
                      setIsInstructionModalOpen(false);
                      setActiveTab('portfolio');
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Go to My Portfolio Dashboard
                  </button>
                </div>
              ) : paymentConfirmedNotice ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Clock className="w-8 h-8" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
                    Payment Transmitted · Awaiting Admin Confirmation
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    Payment Submission Recorded!
                  </h4>
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-left text-xs space-y-2 font-sans">
                    <div className="font-bold text-amber-950">Instructions:</div>
                    <div className="text-amber-900 leading-relaxed font-bold">
                      Send Money to 0108689276. After admin has confirmed payment, admin will activate the account and the investor will log in and have access to the account.
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        const targetEmail = pendingInvestorForPlan?.email || userProfile?.email || 'investor@hdchase.co.ke';
                        const res = activateInvestorAccountByAdmin(targetEmail);
                        if (res.success) {
                          setSimulatedActivationNotice(res.message);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulate Admin Confirmation & Activate Account</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsInstructionModalOpen(false);
                        setIsAdminMode(true);
                        setAdminTab('subscriptions');
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Open Admin Console (David Kivunja)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Selected Level Details */}
                  <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {currentModalPlanConfig.badge}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {currentModalPlanConfig.name}
                        </h4>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Required Capital</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          KSh {currentModalPlanConfig.capitalKsh.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Daily Return</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                          {currentModalPlanConfig.dailyReturnKsh.toLocaleString()} KSh / day
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Contract Period</span>
                        <strong className="text-slate-900 dark:text-white font-bold font-mono">
                          {currentModalPlanConfig.periodDays} Days ({currentModalPlanConfig.totalReturnKsh.toLocaleString()} KSh return)
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* REQUIRED INSTRUCTIONS BOX */}
                  <div className="bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 text-left text-xs space-y-3 font-sans">
                    <div className="flex items-center gap-2 text-amber-950 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Payment & Account Activation Instructions</span>
                    </div>

                    {/* Phone Card */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-700/60 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Send Money to:</span>
                        <span className="font-mono text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-wider">
                          {PAYMENT_RECIPIENT_PHONE}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(PAYMENT_RECIPIENT_PHONE);
                          setCopiedPhone(true);
                          setTimeout(() => setCopiedPhone(false), 2500);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-200"
                      >
                        {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPhone ? 'Copied!' : 'Copy Number'}</span>
                      </button>
                    </div>

                    {/* Clear instruction text */}
                    <div className="p-3 bg-amber-100/70 rounded-xl text-amber-950 text-xs font-bold leading-relaxed border border-amber-300/60">
                      Send Money to 0108689276. After admin has confirmed payment, admin will activate the account and the investor will log in and have access to the account.
                    </div>

                    <ol className="text-[11px] text-slate-700 space-y-1 list-decimal list-inside font-medium leading-relaxed">
                      <li>Open M-Pesa on your mobile phone.</li>
                      <li>Send <strong>KSh {currentModalPlanConfig.capitalKsh.toLocaleString()}</strong> to <strong>{PAYMENT_RECIPIENT_PHONE}</strong>.</li>
                      <li>Click the confirmation button below after sending.</li>
                      <li>After admin confirms payment, your account will be activated and you will be able to log in and have access to your account.</li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => setPaymentConfirmedNotice(true)}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <span>I Have Sent Money to {PAYMENT_RECIPIENT_PHONE}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        const targetEmail = pendingInvestorForPlan?.email || userProfile?.email || 'investor@hdchase.co.ke';
                        const res = activateInvestorAccountByAdmin(targetEmail);
                        if (res.success) {
                          setSimulatedActivationNotice(res.message);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulate Admin Payment Confirmation & Activate Account</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
