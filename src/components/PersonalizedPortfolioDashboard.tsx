import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { PLAN_CONFIGS } from '../types';
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowRight,
  Dices,
  Trophy,
  CheckSquare,
  ShieldAlert,
  Lock,
  User,
  RefreshCw,
  FastForward
} from 'lucide-react';

export const PersonalizedPortfolioDashboard: React.FC = () => {
  const { 
    userInvestments, 
    activePlan, 
    maturedPlan, 
    transactions, 
    claimDailyPlanDividend, 
    rollBonusDice, 
    completeMaturedDistrict, 
    repurchasePreviousDistrict, 
    fastForwardToMaturity, 
    setActiveTab 
  } = useInvestment();
  const { currentUser, isActivated, setIsAuthModalOpen, setAuthMode } = useAuth();

  const totalInvestedInPlans = userInvestments
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + p.capitalInvested, 0);

  const totalRentAccrued = userInvestments
    .reduce((sum, p) => sum + p.totalAccumulatedReturn, 0);

  const totalNetWorthCoins = (currentUser?.chaseCoins || 0) + totalInvestedInPlans;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Pending Account Notice if newly registered */}
      {currentUser && !isActivated && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              ⏳
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 px-2.5 py-0.5 rounded-full">
                Account Status: Pending Game Master Activation
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Welcome to Monopoly Tycoon, {currentUser.name}!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                Your player account is awaiting Game Master approval (<strong>gamechanger</strong>). The admin will disburse your starter <strong>Chase Coins</strong> play money (<strong>5,000 CC</strong>, <strong>10,000 CC</strong>, <strong>20,000 CC</strong>, or <strong>50,000 CC</strong>). Once activated, you can buy Monopoly property districts and complete daily quests!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guest Welcome Banner if not logged in */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-amber-300">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-200">
              Monopoly Property Tycoon
            </span>
            <h2 className="text-2xl font-black">
              Create Your Player Account to Enter the Board
            </h2>
            <p className="text-xs text-amber-100 max-w-lg leading-relaxed">
              Every player has their own independent Monopoly account and Chase Coins balance. Sign up with your name and phone to join the leaderboard!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setAuthMode('register');
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 bg-white text-slate-900 font-black rounded-xl text-xs hover:bg-slate-100 transition-colors shadow-sm"
            >
              Register Account
            </button>
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2.5 bg-black/25 hover:bg-black/40 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      )}

      {/* PLAYER CREDENTIAL & METRICS BAR */}
      {currentUser && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Player Profile */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-sm shrink-0">
              {currentUser.avatar || '🎲'}
            </span>
            <div className="overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Active Player
              </span>
              <div className="font-black text-slate-900 dark:text-white text-base truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                @{currentUser.username}
              </div>
            </div>
          </div>

          {/* Card 2: Chase Coins Balance */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400/80 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-bold">
              <span>Cash in Hand</span>
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-mono font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
              {currentUser.chaseCoins.toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-1 uppercase tracking-wider">
              Chase Coins (Play Money)
            </div>
          </div>

          {/* Card 3: Total Net Worth */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Monopoly Net Worth</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 mt-1">
              {totalNetWorthCoins.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Coins + Property Holdings
            </div>
          </div>

          {/* Card 4: Active Plan Status */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>Active Property District</span>
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="font-black text-slate-900 dark:text-white text-base truncate mt-1">
              {activePlan ? activePlan.planName : 'No Active Plan'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {activePlan ? `+${activePlan.dailyReturn} Coins/day` : 'Tap Plans to Choose'}
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT: When days are over, the user can make a request to purchase another district or still purchase the one before */}
      {maturedPlan && !activePlan && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 shadow-xl space-y-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center text-2xl shrink-0 font-bold shadow-md">
                🏆
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 font-mono">
                  District Contract Matured · Days Are Over
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  Completed: {maturedPlan.planName}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  All <strong>{maturedPlan.periodDays} days</strong> are over! Total rent collected: <strong>+{maturedPlan.totalAccumulatedReturn.toLocaleString()} CC</strong>. Under Monopoly rules, each user is limited to one plan, but now your slot is unlocked: you can request to purchase another district or still purchase the one before!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => repurchasePreviousDistrict()}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-Purchase Previous ({maturedPlan.planName.split('(')[0].trim()})</span>
              </button>
              <button
                onClick={() => {
                  completeMaturedDistrict();
                  setActiveTab('plans');
                }}
                className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>Purchase Another District</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE MONOPOLY PLAN SHOWCASE (Limited to 1 Plan) */}
      {activePlan ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Active Property Contract (1 Plan Limit)
                </span>
                <span className="font-mono text-xs text-amber-300">
                  #{activePlan.contractNumber}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {activePlan.planName}
              </h2>
              <div className="text-xs text-slate-300 font-mono">
                Location: <strong>{activePlan.boardProperty}</strong>
              </div>
            </div>

            <button
              onClick={claimDailyPlanDividend}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Coins className="w-4 h-4 text-slate-950" />
              <span>COLLECT TODAY'S RENT (+{activePlan.dailyReturn} CC)</span>
            </button>
          </div>

          {/* Progress Timeline */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Tenure Progress: <strong>{activePlan.daysElapsed}</strong> of <strong>{activePlan.periodDays}</strong> Days</span>
              <span className="text-amber-400 font-black font-mono">{activePlan.daysRemaining} Days Left Until Maturity</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((activePlan.daysElapsed / activePlan.periodDays) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <span>Cost: {activePlan.capitalInvested.toLocaleString()} CC</span>
              <span className="text-emerald-400">Total Collected: +{activePlan.totalAccumulatedReturn.toLocaleString()} CC</span>
              <span>Expires: {activePlan.maturityDate}</span>
            </div>

            {/* Simulation test action for days over */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                When days reach 0, you can request another district or re-purchase the same.
              </span>
              <button
                type="button"
                onClick={() => fastForwardToMaturity()}
                className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
                title="Simulate all remaining days finishing immediately to test maturity & re-purchase options"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Simulate Days Over</span>
              </button>
            </div>
          </div>
        </div>
      ) : currentUser && isActivated ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-700 p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center text-3xl mx-auto shadow-inner">
            🏙️
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            You Don't Own Any Property Districts Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Use your available Chase Coins to acquire Baltic, Habibi, Dubaj, or Boardwalk to begin earning daily play rent!
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('plans')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 inline-flex items-center gap-2"
            >
              <span>Explore Property Plans</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* QUICK GAME ACTIONS DUAL ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Complete Tasks Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center text-xl shrink-0">
              ⭐
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Earn More Chase Coins with Daily Quests
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inspect properties, test your Monopoly rules trivia, and build up your streak.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckSquare className="w-4 h-4 text-sky-500" />
            <span>Open Tasks Page</span>
          </button>
        </div>

        {/* Right: Leaderboard Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-xl shrink-0">
              🏆
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Check Monopoly Leaderboard Ranks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                See who has the most Chase Coins and the highest net worth across the board.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>View Full Leaderboard</span>
          </button>
        </div>
      </div>

      {/* ACTIVITY LEDGER (Chase Coins Transactions) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              My Chase Coins Activity Ledger
            </h3>
            <p className="text-xs text-slate-400">
              History of play money grants, plan purchases, rent distributions, and quest rewards.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {transactions.length} record(s)
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{tx.title}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{tx.date}</div>
              </div>
              <div className={`font-mono font-black text-sm ${
                tx.type === 'plan_purchase'
                  ? 'text-red-500'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {tx.type === 'plan_purchase' ? '-' : '+'}{tx.amount.toLocaleString()} CC
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
