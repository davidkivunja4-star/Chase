import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvestment } from '../context/InvestmentContext';
import { 
  X, 
  User, 
  Phone, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Dices
} from 'lucide-react';

const MONOPOLY_AVATARS = ['🎩', '🚗', '🐕', '🚢', '👞', '🐱', '🐴', '🏆'];

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authMode, 
    setAuthMode, 
    registerPlayer, 
    loginPlayer,
    switchPlayerForDemo,
    allPlayers
  } = useAuth();

  const { setActiveTab } = useInvestment();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🎩');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'register') {
      const res = registerPlayer(name, phone, password, selectedAvatar);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed.');
      } else {
        setSuccessMessage('Player account created! You are currently pending Game Master Admin activation. Once activated with Chase Coins, you can begin buying property plans!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setActiveTab('portfolio');
        }, 1800);
      }
    } else {
      const res = loginPlayer(phone || name, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed.');
      } else {
        setSuccessMessage(`Welcome back, ${res.player?.name}!`);
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setActiveTab('portfolio');
        }, 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-amber-400 dark:border-amber-500 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Monopoly Header Strip */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white p-5 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-white text-slate-900 font-black text-xl flex items-center justify-center shadow-md">
              {selectedAvatar}
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                Play Money Edition
              </div>
              <h3 className="text-xl font-black tracking-tight leading-tight">
                {authMode === 'register' ? 'Join Monopoly Tycoon' : 'Player Login'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-amber-100 mt-2 leading-relaxed">
            {authMode === 'register'
              ? 'Create your personal player account with name, phone, and password. No real money or cash-outs.'
              : 'Log in to your personalized Monopoly board dashboard and view your Chase Coins.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`py-3 text-center transition-colors ${
              authMode === 'login'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-amber-400 border-b-2 border-red-600 dark:border-amber-400 font-black'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Existing Player Login
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`py-3 text-center transition-colors ${
              authMode === 'register'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-amber-400 border-b-2 border-red-600 dark:border-amber-400 font-black'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            New Player Registration
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                {/* Choose Monopoly Avatar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Choose Your Monopoly Piece Token:
                  </label>
                  <div className="flex items-center justify-between gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {MONOPOLY_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                          selectedAvatar === av
                            ? 'bg-amber-400 scale-110 shadow-md ring-2 ring-amber-500'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Player Name / Real Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dennis Kiprono"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (or Username)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={authMode === 'register' ? 'e.g. 0712345678' : '0712345678 or brian_tycoon'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
            >
              <span>{authMode === 'register' ? 'Create My Monopoly Account' : 'Log In to My Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Strip */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Or Quick Log In with Demo Preset:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  switchPlayerForDemo('player-brian-02');
                  setIsAuthModalOpen(false);
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-800 dark:text-slate-200 font-bold transition-colors text-left"
              >
                <div className="truncate">🚗 Brian Ochieng</div>
                <div className="text-[10px] text-emerald-600 font-mono">12,400 Coins</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  switchPlayerForDemo('admin-david-01');
                  setIsAuthModalOpen(false);
                }}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-800 dark:text-red-200 font-bold transition-colors text-left border border-red-200 dark:border-red-800/60"
              >
                <div className="truncate">🎩 davidkivunja (Admin)</div>
                <div className="text-[10px] text-amber-600 font-mono">Game Master</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
