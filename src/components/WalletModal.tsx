import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Hourglass,
  Info,
  FastForward,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const WalletModal: React.FC = () => {
  const { 
    walletBalance, 
    withdrawFunds, 
    transactions, 
    isWalletModalOpen, 
    setIsWalletModalOpen,
    pendingWithdrawals,
    withdrawalCooldownRemainingMs,
    fastForwardWithdrawalCooldown,
    resetWithdrawalCooldown,
    openZariWithPrompt,
  } = useInvestment();

  const { userProfile } = useAuth();

  // STRICT REQUIREMENT: Deposit option completely removed.
  // Tabs are strictly 'withdraw' (Withdraw to M-Pesa), 'pending' (Pending Withdrawals), and 'history' (Activity Ledger).
  const [mode, setMode] = useState<'withdraw' | 'pending' | 'history'>('withdraw');
  const [amount, setAmount] = useState<string>('5000');
  const allocatedMpesaPhone = userProfile?.mobileNumber || '+254 712 345 678';
  const [phoneNumber, setPhoneNumber] = useState<string>(allocatedMpesaPhone);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isWalletModalOpen) return null;

  const isCooldownActive = withdrawalCooldownRemainingMs > 0;

  const formatRemainingTime = (ms: number) => {
    if (ms <= 0) return '0h 0m 0s';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    if (isCooldownActive) {
      setErrorNotice('The user will be allowed to withdraw again after 12 hours.');
      return;
    }

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorNotice('Please enter a valid withdrawal amount.');
      return;
    }
    if (parsed > walletBalance) {
      setErrorNotice('Withdrawal amount exceeds your available cash wallet balance.');
      return;
    }

    const res = withdrawFunds(parsed, phoneNumber, {
      id: userProfile?.memberId || 'HDC-9102-INV',
      name: userProfile?.displayName || 'David Kivunja',
      email: userProfile?.email || 'davidkivunja4@gmail.com',
    });

    if (!res.success) {
      setErrorNotice(res.message);
    } else {
      // The exact required notice text is returned by res.message
      setSuccessNotice(res.message);
      // Auto-switch to pending view after a moment so user can track status
      setTimeout(() => {
        setMode('pending');
      }, 2500);
    }
  };

  // Filter pending withdrawals for current investor
  const currentPendingWithdrawals = pendingWithdrawals.filter(
    (w) => w.status === 'pending' || w.status === 'granted'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">M-Pesa Cash Wallet</h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">M-Pesa mobile disbursements & withdrawal ledger</div>
            </div>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-6 bg-slate-900 text-white">
          <div className="text-xs text-slate-400 font-medium">Available Cash Wallet Balance</div>
          <div className="text-3xl font-black font-mono tabular-nums mt-1 text-white">
            KSh {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>M-Pesa Regulated Mobile Escrow · 12-Hour Allocation System</span>
          </div>
        </div>

        {/* Segmented Mode Control - DEPOSIT REMOVED COMPLETELY */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold">
          <button
            onClick={() => { setMode('withdraw'); setErrorNotice(null); }}
            className={`py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'withdraw'
                ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
            <span>Withdraw</span>
          </button>
          <button
            onClick={() => { setMode('pending'); setErrorNotice(null); }}
            className={`py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 relative ${
              mode === 'pending'
                ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Allocations ({currentPendingWithdrawals.length})
              {currentPendingWithdrawals.some(w => w.status === 'granted') && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </span>
          </button>
          <button
            onClick={() => { setMode('history'); setErrorNotice(null); }}
            className={`py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'history'
                ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Ledger</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {successNotice && (
            <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successNotice}</div>
            </div>
          )}

          {errorNotice && (
            <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorNotice}</div>
            </div>
          )}

          {mode === 'withdraw' && (
            <div className="space-y-4">
              {/* Mandatory Notice Displayed Directly on Withdrawal Section */}
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-950 rounded-2xl text-xs shadow-xs">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-900 uppercase text-[10px] tracking-wider">
                      Withdrawal Policy & 12-Hour Allocation Window
                    </div>
                    <p className="text-amber-800 leading-relaxed font-medium">
                      Your withdrawal is submitted for 12-hour allocation. The admin can grant access at any time within this 12-hour timeframe without waiting for the full 12 hours to finish. After granting, you will immediately see that the allocation was successful and payment is disbursed to M-Pesa.
                    </p>
                  </div>
                </div>
              </div>

              {/* 12-Hour Cooldown Timer Notice */}
              {isCooldownActive && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      12-Hour Cooldown Active
                    </span>
                    <span className="font-mono font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-lg text-emerald-400">
                      {formatRemainingTime(withdrawalCooldownRemainingMs)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    A withdrawal request is currently in allocation. You will be allowed to withdraw again after the 12-hour period has elapsed.
                  </p>
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={fastForwardWithdrawalCooldown}
                      className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                      title="Fast-forward cooldown by 12 hours for testing"
                    >
                      <FastForward className="w-3 h-3 text-amber-400" />
                      <span>Fast-Forward 12h (Demo Test)</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetWithdrawalCooldown}
                      className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4">
                {/* Allocated Payment Option: M-Pesa */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Allocated Payment Option: M-Pesa</span>
                    </label>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="+254 712 345 678"
                  />
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Funds will be disbursed via Safaricom M-Pesa B2C to this allocated phone number after 12-hour allocation.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Withdrawal Amount (KSh)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono font-bold">KSh</span>
                    <input
                      type="number"
                      min="100"
                      max={walletBalance}
                      step="100"
                      value={amount}
                      disabled={isCooldownActive}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full pl-12 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isCooldownActive ? 'bg-slate-100 dark:bg-slate-800/40 cursor-not-allowed opacity-75' : 'bg-white dark:bg-slate-900'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Available: KSh {walletBalance.toLocaleString()}</span>
                    {!isCooldownActive && walletBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(walletBalance.toString())}
                        className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Withdraw All
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCooldownActive || walletBalance <= 0}
                  className={`w-full py-3.5 px-4 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 mt-2 ${
                    isCooldownActive || walletBalance <= 0
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98 shadow-sm'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-white" />
                  <span>
                    {isCooldownActive 
                      ? `Allowed to withdraw again in ${formatRemainingTime(withdrawalCooldownRemainingMs)}`
                      : walletBalance <= 0
                      ? 'No Balance Available to Withdraw'
                      : `Request Withdrawal of KSh ${parseFloat(amount || '0').toLocaleString()} to M-Pesa`
                    }
                  </span>
                </button>
              </form>
            </div>
          )}

          {mode === 'pending' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>M-Pesa Allocations Status</span>
                <span className="text-[11px] text-slate-500">
                  {currentPendingWithdrawals.length} record(s)
                </span>
              </div>

              {/* Informative Policy Card */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs space-y-1.5 shadow-xs">
                <div className="font-bold text-amber-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>12-Hour Allocation System</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                    Admin Flexible Desk
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Your withdrawal is submitted for 12-hour allocation. The admin can grant access at any time within this 12-hour timeframe without waiting for the full 12 hours to finish. Once granted, your status immediately displays <strong className="text-emerald-400 font-semibold">Allocation Successful</strong> and funds are disbursed to your M-Pesa line.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Questions about your allocation?</span>
                  <button
                    type="button"
                    onClick={() => {
                      openZariWithPrompt('Explain how the 12-hour M-Pesa withdrawal allocation works and how admin grants success.');
                      setIsWalletModalOpen(false);
                    }}
                    className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Ask Zari AI</span>
                  </button>
                </div>
              </div>

              {currentPendingWithdrawals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No pending withdrawals currently.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {currentPendingWithdrawals.map((req) => (
                    req.status === 'granted' ? (
                      /* High-Visibility Emerald Card for Granted Allocation */
                      <div 
                        key={req.id} 
                        className="p-4 rounded-2xl border-2 border-emerald-500 bg-linear-to-br from-emerald-50 via-teal-50/50 to-white text-xs space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Allocation Successful & Disbursed
                            </span>
                            <div className="font-mono font-bold text-slate-900 text-xs mt-1.5">
                              ID: {req.withdrawalNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500 font-medium">Disbursed Amount</div>
                            <div className="font-mono font-black text-base text-emerald-700">
                              KSh {req.amountKsh.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-white/90 rounded-xl border border-emerald-100 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px]">M-Pesa Recipient Line:</span>
                            <span className="font-mono font-bold text-slate-900">{req.mpesaNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Granted Within 12h:</span>
                            <span className="font-semibold text-emerald-800">
                              {req.grantedAt ? new Date(req.grantedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Verified'}
                            </span>
                          </div>
                          {req.adminNotes && (
                            <div className="col-span-2 pt-1.5 border-t border-emerald-100/80">
                              <span className="text-slate-500 block text-[10px]">Admin Reference / Memo:</span>
                              <span className="font-mono text-slate-800 font-semibold text-[11px]">{req.adminNotes}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-emerald-800 font-medium pt-1">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Access Granted by Admin ({req.grantedBy || 'Finance Desk'})
                          </span>
                          <span className="font-mono text-slate-500">
                            {req.grantedAt ? new Date(req.grantedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Amber Card for Pending 12h Window Allocation */
                      <div 
                        key={req.id} 
                        className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 text-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">
                            {req.withdrawalNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Hourglass className="w-2.5 h-2.5 text-amber-600 animate-spin" />
                            Pending Admin Allocation (12h Window)
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-slate-600">
                            To: <span className="font-mono font-semibold text-slate-800">{req.mpesaNumber}</span>
                          </div>
                          <div className="font-mono font-black text-sm text-slate-900">
                            KSh {req.amountKsh.toLocaleString()}
                          </div>
                        </div>

                        <div className="text-[10px] text-amber-800 bg-white/60 p-2 rounded-lg border border-amber-100">
                          Admin can grant access at any moment within this 12-hour timeframe. Once granted, payment will disburse directly to your M-Pesa.
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                          <span>Requested: {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>Max Window: {new Date(req.allocatedAtExpected).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900">Recent Wallet Transactions</div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                {transactions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No transactions recorded yet.</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{tx.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{tx.date}</span>
                          {tx.status === 'processing' && (
                            <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.2 rounded-full">Processing</span>
                          )}
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${
                        tx.type === 'deposit' || tx.type === 'dividend' || tx.type === 'daily_return' || tx.type === 'referral_bonus'
                          ? 'text-emerald-700'
                          : 'text-slate-900'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'dividend' || tx.type === 'daily_return' || tx.type === 'referral_bonus' ? '+' : '-'}
                        KSh {tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
