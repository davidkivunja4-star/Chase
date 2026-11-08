import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Coins, 
  Crown, 
  Medal, 
  TrendingUp, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Search,
  Building2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { leaderboard } = useInvestment();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = leaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.activePlanName && entry.activePlanName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const top3 = leaderboard.slice(0, 3);
  const myEntry = currentUser ? leaderboard.find((e) => e.playerId === currentUser.id) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Leaderboard Podium Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-amber-300 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-200">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Monopoly High-Rollers Hall of Fame</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Monopoly Chase Coins Leaderboard
          </h1>

          <p className="text-sm text-amber-100 leading-relaxed font-medium">
            Live rankings of all Monopoly property tycoons! Players earn Chase Coins by completing daily quests, collecting rent on active property plans, and rolling lucky dice.
          </p>

          {myEntry && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/25 backdrop-blur-xs border border-white/20 text-xs font-bold mt-2">
              <span className="text-amber-300">Your Current Rank:</span>
              <span className="font-mono font-black text-white text-sm">#{myEntry.rank}</span>
              <span className="text-slate-200">·</span>
              <span className="font-mono text-amber-200 font-bold">{myEntry.chaseCoins.toLocaleString()} Chase Coins</span>
            </div>
          )}
        </div>

        {/* Crown illustration */}
        <div className="absolute right-6 -bottom-6 opacity-20 pointer-events-none text-9xl">
          👑
        </div>
      </div>

      {/* TOP 3 PODIUM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {top3.map((entry, index) => {
          const podiumColor = 
            index === 0
              ? 'border-amber-400 bg-gradient-to-b from-amber-500/10 to-amber-500/5'
              : index === 1
              ? 'border-slate-300 bg-gradient-to-b from-slate-200/20 to-slate-100/5'
              : 'border-amber-700 bg-gradient-to-b from-amber-900/10 to-amber-900/5';

          const crownBadge =
            index === 0 ? '👑 1st Place' : index === 1 ? '🥈 2nd Place' : '🥉 3rd Place';

          return (
            <div
              key={entry.playerId}
              className={`p-6 rounded-3xl border-2 ${podiumColor} dark:bg-slate-900 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs">
                    {crownBadge}
                  </span>
                  <span className="font-mono text-2xl font-black text-amber-500">
                    #{entry.rank}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-sm">
                    {entry.avatar}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {entry.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {entry.activePlanName || 'Free Agent Player'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Chase Coins</span>
                  <strong className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                    {entry.chaseCoins.toLocaleString()} CC
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Tasks Done</span>
                  <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {entry.tasksCompleted} Quests
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Full Tycoon Leaderboard ({leaderboard.length} Players)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked dynamically by total Chase Coins in player wallet and net worth.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Active District Plan</th>
                <th className="py-3 px-4 text-center">Quests Done</th>
                <th className="py-3 px-4 text-right">Chase Coins</th>
                <th className="py-3 px-4 text-right">Total Net Worth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((entry) => {
                const isCurrent = currentUser?.id === entry.playerId;

                return (
                  <tr
                    key={entry.playerId}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-amber-50/70 dark:bg-amber-950/40 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-black text-sm">
                      {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : `#${entry.rank}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{entry.avatar}</span>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{entry.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold text-[9px]">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {entry.status === 'activated' ? '✓ Active Player' : '⏳ Pending'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {entry.activePlanName ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>{entry.activePlanName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No active property</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {entry.tasksCompleted}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                      {entry.chaseCoins.toLocaleString()} CC
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                      {entry.netWorth.toLocaleString()} CC
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
