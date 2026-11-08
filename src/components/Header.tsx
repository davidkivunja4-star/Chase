import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvestment } from '../context/InvestmentContext';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Coins, 
  Building2, 
  TrendingUp, 
  Trophy, 
  CheckSquare, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldAlert, 
  Sun, 
  Moon,
  Sparkles,
  Dice5,
  Dices,
  Lock,
  UserPlus
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, rollBonusDice } = useInvestment();
  const { currentUser, isGameMaster, isActivated, logoutPlayer, setIsAuthModalOpen, setAuthMode, switchPlayerForDemo, allPlayers } = useAuth();
  const { isAdminMode, setIsAdminMode, pendingPlayers } = useAdmin();
  const { theme, toggleTheme, isDark } = useTheme();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Monopoly Board Game Brand Wordmark */}
          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('portfolio');
            }}
            className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-red-600 to-red-500 flex items-center justify-center text-white font-black text-base shadow-md border-2 border-amber-300">
              🎩
            </span>
            <div className="text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="tracking-tight uppercase font-black text-red-600 dark:text-red-400">CHASE</span>
                <span className="text-slate-900 dark:text-white">MONOPOLY</span>
              </div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mt-0.5">
                Play Money Edition · Chase Coins
              </span>
            </div>
          </button>

          {/* Zone 2: Main Game Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('portfolio');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isAdminMode && activeTab === 'portfolio'
                  ? 'text-red-600 dark:text-red-400 font-bold border-b-2 border-red-600 dark:border-red-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>My Dashboard</span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('plans');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isAdminMode && activeTab === 'plans'
                  ? 'text-red-600 dark:text-red-400 font-bold border-b-2 border-red-600 dark:border-red-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Property Plans</span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('tasks');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isAdminMode && activeTab === 'tasks'
                  ? 'text-red-600 dark:text-red-400 font-bold border-b-2 border-red-600 dark:border-red-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-sky-500" />
              <span>Earn Coins (Tasks)</span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('leaderboard');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                !isAdminMode && activeTab === 'leaderboard'
                  ? 'text-red-600 dark:text-red-400 font-bold border-b-2 border-red-600 dark:border-red-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('chat');
              }}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 relative ${
                !isAdminMode && activeTab === 'chat'
                  ? 'text-red-600 dark:text-red-400 font-bold border-b-2 border-red-600 dark:border-red-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Chat</span>
            </button>

            {/* FEATURE 2: GAME MASTER ADMIN - ONLY davidkivunja / admin CAN SEE ADMIN BUTTON */}
            {isGameMaster && (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                  isAdminMode
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                    : 'bg-red-700 hover:bg-red-600 text-white shadow-xs'
                }`}
                title="Open Game Master Console"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isAdminMode ? 'Exit Admin' : 'Game Master Admin'}</span>
                {pendingPlayers.length > 0 && !isAdminMode && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-300 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                    {pendingPlayers.length}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Zone 3: Chase Coins Balance + Dice Roll + Player Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Dark Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shrink-0 shadow-2xs"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle dark theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Lucky Dice Roll Bonus button */}
            {currentUser && isActivated && (
              <button
                onClick={rollBonusDice}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95"
                title="Roll the Monopoly dice for a bonus coin drop!"
              >
                <Dices className="w-4 h-4" />
                <span>Roll Dice!</span>
              </button>
            )}

            {/* CHASE COINS PLAY MONEY WALLET - Displayed at top as "CHASE COINS [X]" */}
            {currentUser ? (
              <div 
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 dark:from-amber-950/80 dark:via-yellow-950/50 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500 shadow-xs"
                title={`Your current play money balance: ${currentUser.chaseCoins.toLocaleString()} Chase Coins (CC)`}
              >
                <Coins className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
                <span className="font-mono font-black text-xs sm:text-sm text-slate-950 dark:text-amber-200 tracking-tight whitespace-nowrap">
                  CHASE COINS {currentUser.chaseCoins.toLocaleString()}
                </span>
              </div>
            ) : null}

            {/* User Profile or Register/Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors text-xs font-bold"
                >
                  <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm">
                    {currentUser.avatar || '🎲'}
                  </span>
                  <div className="text-left hidden lg:block">
                    <div className="text-slate-900 dark:text-white truncate max-w-[110px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {currentUser.status === 'activated' ? '✓ Active Player' : '⏳ Pending'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu with LOGOUT BUTTON */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currentUser.avatar || '🎲'}</span>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white">{currentUser.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Phone: {currentUser.phone}</div>
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                            Username: @{currentUser.username}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-slate-500 dark:text-slate-400">Account Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          currentUser.status === 'activated'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {currentUser.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveTab('portfolio');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>My Dashboard & Net Worth</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveTab('tasks');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                      >
                        <CheckSquare className="w-4 h-4 text-sky-500" />
                        <span>Earn Coins (Daily Tasks)</span>
                      </button>

                      {/* FEATURE 2: Switch to David Kivunja Game Master quick-test demo */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsSwitchMenuOpen(!isSwitchMenuOpen);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-500" />
                          <span>Switch Account (Demo)</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {isSwitchMenuOpen && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1 my-1 border border-slate-200 dark:border-slate-700">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Available Demo Accounts:
                          </div>
                          {allPlayers.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                switchPlayerForDemo(p.id);
                                setIsProfileMenuOpen(false);
                                setIsSwitchMenuOpen(false);
                              }}
                              className={`w-full text-left p-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                                p.id === currentUser.id
                                  ? 'bg-amber-100 dark:bg-amber-950/80 font-bold text-amber-900 dark:text-amber-200'
                                  : 'hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="truncate">
                                {p.avatar} {p.name} {p.role === 'admin' ? '(Admin)' : ''}
                              </span>
                              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
                                {p.chaseCoins.toLocaleString()} CC
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* FEATURE 1: LOGOUT BUTTON */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logoutPlayer();
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register to Play</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-2 bg-slate-50 dark:bg-slate-900/80 text-xs font-bold">
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('portfolio');
          }}
          className={`flex flex-col items-center gap-0.5 ${
            !isAdminMode && activeTab === 'portfolio' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('plans');
          }}
          className={`flex flex-col items-center gap-0.5 ${
            !isAdminMode && activeTab === 'plans' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Plans</span>
        </button>
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('tasks');
          }}
          className={`flex flex-col items-center gap-0.5 ${
            !isAdminMode && activeTab === 'tasks' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('leaderboard');
          }}
          className={`flex flex-col items-center gap-0.5 ${
            !isAdminMode && activeTab === 'leaderboard' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Ranks</span>
        </button>
        <button
          onClick={() => {
            setIsAdminMode(false);
            setActiveTab('chat');
          }}
          className={`flex flex-col items-center gap-0.5 relative ${
            !isAdminMode && activeTab === 'chat' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-0 right-1" />
          <span>💬</span>
          <span>Chat</span>
        </button>
        {isGameMaster && (
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`flex flex-col items-center gap-0.5 ${
              isAdminMode ? 'text-amber-500 font-black' : 'text-slate-500'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
