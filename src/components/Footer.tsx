import React from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { ShieldCheck, Dices, Trophy, Coins } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useInvestment();

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Monopoly Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                🎩
              </span>
              <span className="font-black text-slate-900 dark:text-white tracking-tight uppercase">
                H&D CHASE MONOPOLY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              A Monopoly-style property tycoon game using <strong>Chase Coins</strong> play money only. No real money, no M-Pesa, no cash-out, no KSh.
            </p>
          </div>

          {/* Quick Game Links */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Gameplay Modes
            </div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <button onClick={() => setActiveTab('portfolio')} className="hover:text-red-600 dark:hover:text-amber-400 transition-colors">
                  My Player Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('plans')} className="hover:text-red-600 dark:hover:text-amber-400 transition-colors">
                  Monopoly Property Districts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tasks')} className="hover:text-red-600 dark:hover:text-amber-400 transition-colors">
                  Earn Chase Coins (Quests)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('leaderboard')} className="hover:text-red-600 dark:hover:text-amber-400 transition-colors">
                  High-Rollers Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Play Money Disclaimer */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Game Rules & Currency
            </div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <li>100% Play Money Simulation</li>
              <li>In-Game Currency: Chase Coins (CC)</li>
              <li>Zero Financial Risk or Monetary Value</li>
              <li>Game Master Operator: davidkivunja</li>
            </ul>
          </div>

          {/* Monopoly Badge */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Play Simulation Notice
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-[11px]">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Play Money Monopoly Board</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal font-medium">
                Chase Coins are virtual game tokens with no monetary value. Cannot be cashed out, sold, or redeemed for fiat currency.
              </p>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 text-[11px] text-slate-400 space-y-2 leading-relaxed">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} H&D Chase Monopoly Game Edition. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Fair Play Rules</span>
              <span aria-hidden="true">·</span>
              <span>Monopoly Community Chest</span>
              <span aria-hidden="true">·</span>
              <span>Game Master Console</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
