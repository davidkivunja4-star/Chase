import React from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { PLAN_CONFIGS, InvestmentPlan } from '../types';
import { 
  Building2, 
  Coins, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Dices, 
  Flame, 
  Award,
  Construction,
  RefreshCw
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { 
    purchasePlanWithCoins, 
    activePlan, 
    maturedPlan, 
    repurchasePreviousDistrict, 
    completeMaturedDistrict, 
    setActiveTab 
  } = useInvestment();
  const { currentUser, isActivated, setIsAuthModalOpen, setAuthMode } = useAuth();

  const plansList = Object.values(PLAN_CONFIGS);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Monopoly Hero Header */}
      <div className="bg-gradient-to-r from-red-700 via-amber-600 to-amber-500 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border-2 border-amber-300">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-200">
            <Sparkles className="w-4 h-4" />
            <span>Monopoly Board Districts · Play Money Only</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Choose Your Monopoly Property Plan
          </h1>

          <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-medium">
            Invest your <strong>Chase Coins</strong> to acquire Monopoly property districts. Collect daily rent coins accrued every 24 hours, boost your leaderboard net worth, and compound your wealth across Baltic, Habibi, Dubaj, Boardwalk, and more!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentUser ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/25 backdrop-blur-xs border border-white/20 text-xs font-mono font-black">
                <Coins className="w-4 h-4 text-amber-300" />
                <span>Your Available Balance: {currentUser.chaseCoins.toLocaleString()} Chase Coins</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 bg-white text-slate-900 font-black rounded-xl text-xs hover:bg-slate-100 transition-colors shadow-md flex items-center gap-2"
              >
                <span>Register to Choose a Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative Monopoly icon */}
        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none text-8xl sm:text-9xl">
          🎲
        </div>
      </div>

      {/* REQUIREMENT: When days are over, the user can make a request to purchase another district or still purchase the one before */}
      {maturedPlan && !activePlan && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-600 rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-2xl shrink-0 shadow-sm border border-emerald-300">
              🏆
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                Contract Matured · Days Are Over
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Completed: {maturedPlan.planName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                All <strong>{maturedPlan.periodDays} days</strong> are over! Total rent collected: <strong>+{maturedPlan.totalAccumulatedReturn.toLocaleString()} CC</strong>. Under Monopoly rules, each user is limited to one plan, but now you can request to purchase another district or still purchase the one before!
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => repurchasePreviousDistrict()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Purchase Previous ({maturedPlan.planName.split('(')[0].trim()})</span>
            </button>
            <button
              onClick={() => completeMaturedDistrict()}
              className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Pick Another District
            </button>
          </div>
        </div>
      )}

      {/* Active Plan Status Notice if player currently has an ongoing property */}
      {activePlan && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shrink-0 shadow-xs">
              🎩
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                Single Active District Policy (1 Plan Limit)
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                Active Contract: {activePlan.planName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Property: <strong>{activePlan.boardProperty}</strong> · Collecting <strong>{activePlan.dailyReturn} CC</strong> daily rent · <strong>{activePlan.daysRemaining} days left</strong> until maturity.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-4 py-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap shadow-xs"
          >
            View in Dashboard
          </button>
        </div>
      )}

      {/* Pending Account Notice */}
      {currentUser && !isActivated && (
        <div className="bg-amber-500/10 border-2 border-amber-500 text-amber-900 dark:text-amber-200 rounded-3xl p-5 flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="text-xs leading-relaxed">
            <strong className="block font-black text-sm">Account Pending Game Master Activation</strong>
            Your player account has been created. The Game Master (<strong>gamechanger</strong>) must activate your account and assign your starter Chase Coins before you can buy property plans.
          </div>
        </div>
      )}

      {/* GRID OF THE 5 MONOPOLY DISTRICT PLANS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {plansList.map((plan) => {
          const hasEnoughCoins = currentUser ? currentUser.chaseCoins >= plan.costCoins : false;
          const isThisPlanActive = activePlan?.plan === plan.plan;

          return (
            <div
              key={plan.plan}
              className={`bg-white dark:bg-slate-900 rounded-3xl border-2 overflow-hidden shadow-md flex flex-col justify-between transition-all hover:shadow-xl ${
                isThisPlanActive
                  ? 'border-emerald-500 ring-2 ring-emerald-400/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-400'
              }`}
            >
              {/* Monopoly Property Card Header Strip */}
              <div className={`${plan.colorScheme.monopolyHeader} text-white p-4 text-center font-black relative`}>
                <div className="text-[10px] uppercase tracking-widest opacity-80">
                  {plan.levelLabel}
                </div>
                <div className="text-base font-black tracking-tight truncate">
                  {plan.boardProperty}
                </div>
                <div className="text-[11px] font-mono font-bold mt-0.5 bg-black/20 rounded-full py-0.5 px-2 inline-block">
                  {plan.badge}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed min-h-[36px]">
                      {plan.backingDescription}
                    </p>
                  </div>

                  {/* Financial Matrix (Play Money Chase Coins) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Purchase Cost:</span>
                      <strong className="font-mono font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        {plan.costCoins.toLocaleString()} CC
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Daily Rent Return:</span>
                      <strong className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +{plan.dailyReturnCoins.toLocaleString()} CC/day
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                      <strong className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {plan.periodDays} Days
                      </strong>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Total Play Profit:</span>
                      <strong className="font-mono font-black text-amber-600 dark:text-amber-400">
                        +{plan.totalReturnCoins.toLocaleString()} CC
                      </strong>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{plan.dailyReturnCoins} Coins accrued every 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Boosts your Leaderboard Net Worth</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="pt-2">
                  {plan.isUnderConstruction ? (
                    <button
                      disabled
                      className="w-full py-3 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-purple-300 dark:border-purple-800 shadow-2xs"
                    >
                      <Construction className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Under Construction (Locked)</span>
                    </button>
                  ) : !currentUser ? (
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                    >
                      Log in to Purchase
                    </button>
                  ) : isThisPlanActive ? (
                    <button
                      disabled
                      className="w-full py-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Active District Plan</span>
                    </button>
                  ) : activePlan ? (
                    <button
                      disabled
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Locked (1 Plan Limit · {activePlan.daysRemaining}d left)</span>
                    </button>
                  ) : !isActivated ? (
                    <button
                      disabled
                      className="w-full py-3 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Awaiting Admin Activation</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => purchasePlanWithCoins(plan.plan)}
                      disabled={!hasEnoughCoins}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                        hasEnoughCoins
                          ? 'bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white active:scale-98 cursor-pointer'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        {hasEnoughCoins
                          ? `Buy for ${plan.costCoins.toLocaleString()} CC`
                          : 'Not enough Chase Coins'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
