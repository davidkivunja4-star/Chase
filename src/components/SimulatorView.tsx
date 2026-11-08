import React, { useState, useMemo } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { InvestmentPlan, PLAN_CONFIGS } from '../types';
import { 
  Calculator, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const { setActiveTab } = useInvestment();

  // Inputs
  const [chosenPlan, setChosenPlan] = useState<InvestmentPlan>('HABIBI');
  const [units, setUnits] = useState<number>(1);
  const [cyclesCount, setCyclesCount] = useState<number>(4); // e.g. 4 consecutive cycles of 60/72 days
  const [autoReinvestProfits, setAutoReinvestProfits] = useState<boolean>(true);

  const planConfig = PLAN_CONFIGS[chosenPlan];
  const initialCapital = planConfig.capitalKsh * units;
  const dailyReturn = planConfig.dailyReturnKsh * units;

  // Compute Cycle Projections
  const cycleProjections = useMemo(() => {
    const list: Array<{
      cycle: number;
      startDay: number;
      endDay: number;
      capitalDeployed: number;
      cycleDailyReturn: number;
      totalCycleProfit: number;
      cumulativeValue: number;
    }> = [];

    let currentCapital = initialCapital;

    for (let c = 1; c <= cyclesCount; c++) {
      const startDay = (c - 1) * planConfig.periodDays + 1;
      const endDay = c * planConfig.periodDays;
      const currentUnits = Math.max(1, Math.floor(currentCapital / planConfig.capitalKsh));
      const currentDailyReturn = currentUnits * planConfig.dailyReturnKsh;
      const totalCycleProfit = currentDailyReturn * planConfig.periodDays;

      if (autoReinvestProfits) {
        // Full reinvestment: capital + profit rolled over
        currentCapital = currentCapital + totalCycleProfit;
      } else {
        // Only capital re-invested, profits claimed
        currentCapital = currentCapital;
      }

      list.push({
        cycle: c,
        startDay,
        endDay,
        capitalDeployed: currentCapital - (autoReinvestProfits ? totalCycleProfit : 0),
        cycleDailyReturn: currentDailyReturn,
        totalCycleProfit,
        cumulativeValue: currentCapital,
      });
    }

    return list;
  }, [chosenPlan, units, cyclesCount, autoReinvestProfits, initialCapital, planConfig]);

  const finalCycle = cycleProjections[cycleProjections.length - 1];
  const totalDays = cyclesCount * planConfig.periodDays;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div>
        <div className="text-xs uppercase tracking-wider text-amber-600 font-bold flex items-center gap-1.5">
          <Calculator className="w-4 h-4" />
          <span>H&D CHASE PLATFORM · Cycle Compounding Engine</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Investment Levels Compounding Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Simulate how daily returns and consecutive re-investments every {planConfig.periodDays} days multiply your wealth across Level 1 (Al-fakeer), Level 2 (Habibi), Level 3 (Dubaj), and VIP 1 (Hamza).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Controls Column */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Simulation Parameters</span>
          </h2>

          {/* Select Base Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">Select Investment Level</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChosenPlan('AL_FAKEER')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  chosenPlan === 'AL_FAKEER'
                    ? 'border-emerald-500 bg-emerald-50/70 font-bold text-emerald-950 ring-2 ring-emerald-400/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Level 1 (Al-fakeer)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">5k KSh · 200/d · 60d</div>
              </button>

              <button
                type="button"
                onClick={() => setChosenPlan('HABIBI')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  chosenPlan === 'HABIBI'
                    ? 'border-amber-500 bg-amber-50/70 font-bold text-amber-950 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Level 2 (Habibi)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">10k KSh · 300/d · 60d</div>
              </button>

              <button
                type="button"
                onClick={() => setChosenPlan('DUBAJ')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  chosenPlan === 'DUBAJ'
                    ? 'border-sky-500 bg-sky-50/70 font-bold text-sky-950 ring-2 ring-sky-400/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Level 3 (Dubaj)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">20k KSh · 500/d · 72d</div>
              </button>

              <button
                type="button"
                onClick={() => setChosenPlan('HAMZA')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  chosenPlan === 'HAMZA'
                    ? 'border-purple-500 bg-purple-50/70 font-bold text-purple-950 ring-2 ring-purple-400/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold">VIP 1 (Hamza)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">50k KSh · 1k/d · 70d</div>
              </button>
            </div>
          </div>

          {/* Starting Units */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label className="font-semibold text-slate-700">Initial Units / Packages</label>
              <span className="font-mono font-bold text-slate-900">
                KSh {initialCapital.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1 Unit ({planConfig.capitalKsh.toLocaleString()} KSh)</span>
              <span>10 Units ({(planConfig.capitalKsh * 10).toLocaleString()} KSh)</span>
            </div>
          </div>

          {/* Number of Consecutive Re-investment Cycles */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label className="font-semibold text-slate-700">Re-investment Cycles</label>
              <span className="font-mono font-bold text-slate-900">
                {cyclesCount} Cycles ({totalDays} Days)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={cyclesCount}
              onChange={(e) => setCyclesCount(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1 Cycle ({planConfig.periodDays}d)</span>
              <span>6 Cycles ({planConfig.periodDays * 6}d)</span>
            </div>
          </div>

          {/* Re-invest Toggle */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReinvestProfits}
                onChange={(e) => setAutoReinvestProfits(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <div>
                <span className="font-bold text-slate-900 block">Compound Re-Investment</span>
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  Upon maturity, automatically roll over both initial capital and accrued daily returns into new packages.
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Subscribe to {planConfig.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Results & Projections Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Projected Outcome After {cyclesCount} Cycles ({totalDays} Days)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <span className="text-xs text-slate-400 block">Initial Starting Capital</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                  KSh {initialCapital.toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Daily Cash Flow Rate</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                  KSh {(finalCycle?.cycleDailyReturn || dailyReturn).toLocaleString()} / day
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Projected Portfolio Value</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
                  KSh {(finalCycle?.cumulativeValue || initialCapital).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Cycle tenure: {planConfig.periodDays} days per round</span>
              <span className="text-emerald-400 font-bold">
                180% Return per completed cycle
              </span>
            </div>
          </div>

          {/* Cycle-by-Cycle Projection Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Cycle-by-Cycle Re-Investment Roadmap
              </h3>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                Plan {chosenPlan} ({planConfig.periodDays}d cycle)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-sans">
                  <tr>
                    <th className="py-3 px-4">Cycle</th>
                    <th className="py-3 px-4">Timeline</th>
                    <th className="py-3 px-4 text-right">Daily Return</th>
                    <th className="py-3 px-4 text-right">Returns Earned</th>
                    <th className="py-3 px-4 text-right">Cumulative Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {cycleProjections.map((cp) => (
                    <tr key={cp.cycle} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                        Cycle {cp.cycle}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-sans">
                        Day {cp.startDay} – {cp.endDay}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        KSh {cp.cycleDailyReturn.toLocaleString()} / day
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-900">
                        +KSh {cp.totalCycleProfit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                        KSh {cp.cumulativeValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
