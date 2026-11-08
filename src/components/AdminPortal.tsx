import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdmin, ACTIVATION_STARTER_OPTIONS, ActivationStarterAmount } from '../context/AdminContext';
import { useInvestment } from '../context/InvestmentContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Coins, 
  UserCheck, 
  Clock, 
  UserX, 
  Search, 
  ArrowRight, 
  Sparkles,
  Edit3,
  Dices,
  Plus,
  Check
} from 'lucide-react';

const DISBURSEMENT_PRESETS = [
  {
    amount: 5000 as const,
    label: '5,000 CC',
    district: 'Brown District (Baltic Estate)',
    rent: '200 CC/day · 60 Days',
    badge: 'Option 1',
    tagline: 'Standard Starter Disburse',
  },
  {
    amount: 10000 as const,
    label: '10,000 CC',
    district: 'Orange District (Habibi Towers)',
    rent: '300 CC/day · 60 Days',
    badge: 'Option 2',
    tagline: 'Accelerated District Disburse',
  },
  {
    amount: 20000 as const,
    label: '20,000 CC',
    district: 'Green District (Dubaj Financial)',
    rent: '500 CC/day · 72 Days',
    badge: 'Option 3',
    tagline: 'Prestige High-Roller Disburse',
  },
  {
    amount: 50000 as const,
    label: '50,000 CC',
    district: 'Blue District (VIP Boardwalk)',
    rent: '1,000 CC/day · 70 Days',
    badge: 'Option 4',
    tagline: 'Ultimate Crown Jewel Disburse',
  },
] as const;

export const AdminPortal: React.FC = () => {
  const { isGameMaster, currentUser } = useAuth();
  const { 
    pendingPlayers, 
    allPlayers, 
    selectedOptionMap, 
    setSelectedStarterOption, 
    activatePlayer, 
    grantCoinsToPlayer, 
    suspendPlayerById,
    setIsAdminMode
  } = useAdmin();
  const { setActiveTab } = useInvestment();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuickGrantAmount, setSelectedQuickGrantAmount] = useState<number>(1000);

  if (!isGameMaster) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-red-300 dark:border-red-800 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
          🚫
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Game Master Access Restricted
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Only user <strong>gamechanger</strong> / <strong>davidkivunja</strong> or platform administrators can view and manage the Game Master Admin Panel.
        </p>
        <button
          onClick={() => setIsAdminMode(false)}
          className="px-6 py-2.5 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl"
        >
          Return to Player View
        </button>
      </div>
    );
  }

  const filteredAllPlayers = allPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-red-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Monopoly Game Master Command Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Player Activation & Chase Coins Disbursement
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When activating a player, choose one fixed starting amount (<strong>5,000 CC</strong>, <strong>10,000 CC</strong>, <strong>20,000 CC</strong>, or <strong>50,000 CC</strong>). Play money only — Chase Coins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminMode(false)}
              className="px-4 py-2.5 text-xs font-black bg-white hover:bg-slate-100 text-slate-900 rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Back to Game</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Awaiting Activation</span>
            <strong className="text-xl font-black text-amber-400 font-mono">
              {pendingPlayers.length} Players
            </strong>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Activated Players</span>
            <strong className="text-xl font-black text-emerald-400 font-mono">
              {allPlayers.filter((p) => p.status === 'activated').length}
            </strong>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Total CC In Circulation</span>
            <strong className="text-xl font-black text-amber-300 font-mono">
              {allPlayers.reduce((sum, p) => sum + p.chaseCoins, 0).toLocaleString()} CC
            </strong>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Game Master Operator</span>
            <strong className="text-xs font-black text-amber-400 font-mono block mt-1 flex items-center gap-1">
              <span>👑</span>
              <span>gamechanger</span>
            </strong>
          </div>
        </div>
      </div>

      {/* FEATURE: PENDING PLAYERS SECTION WITH 4 BIG SELECTABLE CARDS */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400 dark:border-amber-500/80 p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xl shadow-xs">
              ⏳
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pending Players Awaiting Activation</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                  {pendingPlayers.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin must select <strong>ONE</strong> of the 4 fixed starting amounts (5,000 CC, 10,000 CC, 20,000 CC, 50,000 CC) before activating.
              </p>
            </div>
          </div>
        </div>

        {pendingPlayers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Pending Players in Queue</p>
            <p className="text-[11px] mt-0.5">All registered players are currently activated with Chase Coins!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingPlayers.map((player) => {
              const selectedAmount = selectedOptionMap[player.id];

              return (
                <div 
                  key={player.id}
                  className="p-5 sm:p-6 rounded-3xl border-2 border-amber-300 dark:border-amber-700/80 bg-amber-50/30 dark:bg-amber-950/20 space-y-5 transition-all shadow-xs"
                >
                  {/* Player Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-amber-800/40 pb-4">
                    <div className="flex items-start gap-3.5">
                      <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shrink-0 shadow-sm border border-amber-300">
                        {player.avatar || '🎲'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 dark:text-white text-base">
                            {player.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                            Awaiting Activation
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                          Username: <strong className="text-slate-900 dark:text-slate-200">@{player.username}</strong> · Phone: {player.phone}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Registered: {new Date(player.joinedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Current Balance in Pending State */}
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-amber-200 dark:border-amber-700/80 text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Balance</span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        {player.chaseCoins.toLocaleString()} CC
                      </span>
                    </div>
                  </div>

                  {/* 4 BIG SELECTABLE BUTTONS / CARDS */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>Select Fixed Starting CC Disbursed:</span>
                      </label>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                        {selectedAmount ? `Selected: ${selectedAmount.toLocaleString()} CC` : 'Please select one option'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {DISBURSEMENT_PRESETS.map((preset) => {
                        const isSelected = selectedAmount === preset.amount;

                        return (
                          <button
                            key={preset.amount}
                            type="button"
                            onClick={() => setSelectedStarterOption(player.id, preset.amount)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between group active:scale-[0.98] ${
                              isSelected
                                ? 'border-amber-500 dark:border-amber-400 bg-amber-100/90 dark:bg-amber-900/40 ring-2 ring-amber-400/80 shadow-md scale-[1.01]'
                                : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isSelected 
                                    ? 'bg-amber-500 text-slate-950 font-mono' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono'
                                }`}>
                                  {preset.badge}
                                </span>
                                {isSelected ? (
                                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-amber-400" />
                                )}
                              </div>

                              <div className="font-mono font-black text-xl text-slate-900 dark:text-white">
                                {preset.label}
                              </div>
                              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                                {preset.district}
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                {preset.rent}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {preset.tagline}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activation Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedAmount ? (
                        <span>
                          Player will start with exactly <strong>{selectedAmount.toLocaleString()} CC</strong> and will be announced in live chat automatically.
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          ⚠️ Select one of the 4 options above before tapping Activate Player.
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedAmount}
                      onClick={() => activatePlayer(player.id)}
                      className={`px-6 py-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 ${
                        selectedAmount
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95 cursor-pointer ring-2 ring-emerald-400/40'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>
                        {selectedAmount 
                          ? `ACTIVATE PLAYER WITH ${selectedAmount.toLocaleString()} CC` 
                          : 'SELECT CC OPTION TO ACTIVATE'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ALL PLAYERS DIRECTORY & QUICK COIN GRANTS */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              All Monopoly Players Directory ({allPlayers.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin inspection of each player's current Chase Coins (CC) balance and active property status.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player name, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Phone / Username</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Plan</th>
                <th className="py-3 px-4 text-right">Chase Coins</th>
                <th className="py-3 px-4 text-right">Game Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAllPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.avatar || '🎲'}</span>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{player.name}</span>
                          {player.role === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-[9px] rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{player.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    <div>{player.phone}</div>
                    <div className="text-[10px] text-slate-400">@{player.username}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      player.status === 'activated'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {player.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {player.activePlanName ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                        {player.activePlanName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No active plan</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-amber-300 text-sm">
                    {player.chaseCoins.toLocaleString()} CC
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {player.status === 'pending' ? (
                        <button
                          onClick={() => activatePlayer(player.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px]"
                        >
                          Activate
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => grantCoinsToPlayer(player.id, 500)}
                            className="px-2 py-1 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 text-amber-900 dark:text-amber-200 font-bold rounded-lg text-[10px]"
                            title="Grant +500 Coins"
                          >
                            +500 CC
                          </button>
                          <button
                            onClick={() => grantCoinsToPlayer(player.id, 2500)}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[10px]"
                            title="Grant +2,500 Coins"
                          >
                            +2.5k CC
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
