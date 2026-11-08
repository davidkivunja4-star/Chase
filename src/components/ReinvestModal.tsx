import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAdmin } from '../context/AdminContext';
import { InvestmentPlan, PLAN_CONFIGS } from '../types';
import { 
  X, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  Smartphone,
  Send,
  FileCheck,
  Check
} from 'lucide-react';

export const ReinvestModal: React.FC = () => {
  const { 
    selectedContractForReinvest, 
    setSelectedContractForReinvest, 
    isReinvestModalOpen, 
    setIsReinvestModalOpen,
    submitReinvestmentRequest,
    walletBalance,
    setActiveTab 
  } = useInvestment();

  const { setIsAdminMode, setAdminTab } = useAdmin();

  const [targetPlan, setTargetPlan] = useState<InvestmentPlan>('DUBAJ');
  const [units, setUnits] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'MPESA_STK'>('MPESA_STK');
  const [mpesaNumber, setMpesaNumber] = useState<string>('+254 712 345 678');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);

  if (!isReinvestModalOpen || !selectedContractForReinvest) return null;

  const contract = selectedContractForReinvest;
  const targetConfig = PLAN_CONFIGS[targetPlan];
  const targetCapitalRequired = targetConfig.capitalKsh * units;
  const maturedCapitalAvailable = contract.capitalInvested + contract.unclaimedReturns;
  const netDifference = targetCapitalRequired - maturedCapitalAvailable;

  const hasSufficientFunds = netDifference <= 0 || paymentMethod === 'MPESA_STK' || walletBalance >= netDifference;

  const handleConfirmReinvest = () => {
    setIsSubmitting(true);
    const res = submitReinvestmentRequest(
      contract.id,
      targetPlan,
      units,
      paymentMethod,
      {
        phone: mpesaNumber,
        notes: `Re-investment rollover from matured contract #${contract.contractNumber}. Target: ${targetConfig.name}.`
      }
    );

    setIsSubmitting(false);
    if (res.success && res.applicationId) {
      setSubmittedAppId(res.applicationId);
      setSubmittedAppNumber(`REQ-REINV-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleGoToAdminConsole = () => {
    setIsReinvestModalOpen(false);
    setSelectedContractForReinvest(null);
    setIsAdminMode(true);
    setAdminTab('subscriptions');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Contract Re-Investment Portal</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                  Matured Rollover
                </span>
              </h3>
              <div className="text-[11px] text-slate-500">
                Roll over matured capital and returns into Plan 1 (HABIBI) or Plan 2 (DUBAJ)
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsReinvestModalOpen(false);
              setSelectedContractForReinvest(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[85vh] overflow-y-auto">
          {submittedAppId ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-90 duration-300">
                <FileCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  Request Submitted · Awaiting Admin Plan Activation
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">
                  Re-Investment Request Transmitted!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your rollover request has been transmitted to the platform administrator. Once payment is confirmed, the admin will activate your new plan.
                </p>
              </div>

              {/* Dossier Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Source Matured Contract:</span>
                  <span className="font-bold text-slate-900">{contract.contractNumber} ({contract.planName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Target Plan:</span>
                  <span className="font-bold text-slate-900">{targetConfig.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Total Target Capital:</span>
                  <span className="font-bold text-slate-900">KSh {targetCapitalRequired.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span className="text-slate-500 font-sans">Matured Capital Deployed:</span>
                  <span className="font-bold">KSh {Math.min(targetCapitalRequired, maturedCapitalAvailable).toLocaleString()}</span>
                </div>
                {netDifference > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span className="text-slate-500 font-sans">Upgrade Difference:</span>
                    <span className="font-bold">KSh {netDifference.toLocaleString()} ({paymentMethod === 'WALLET' ? 'Wallet Escrow' : `M-Pesa STK`})</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-emerald-600">
                  <span className="text-slate-500 font-sans">New Daily Return:</span>
                  <span className="font-bold">+KSh {(targetConfig.dailyReturnKsh * units).toLocaleString()} / day ({targetConfig.periodDays} Days)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleGoToAdminConsole}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Switch to Admin Console to Confirm Payment & Activate Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReinvestModalOpen(false);
                    setSelectedContractForReinvest(null);
                    setActiveTab('portfolio');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-xs"
                >
                  Return to Portfolio
                </button>
              </div>
            </div>
          ) : (
            /* CONFIGURATION FORM */
            <>
              {/* Matured Contract Source Summary */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Source Matured Contract: {contract.contractNumber}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800">
                    Cycle #{contract.reinvestCycle || 1} Complete
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-emerald-900">
                  <div>
                    <span className="text-[10px] text-emerald-700 block">Original Capital</span>
                    <strong className="font-mono font-bold text-sm">KSh {contract.capitalInvested.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 block">Total Daily Returns</span>
                    <strong className="font-mono font-bold text-sm text-emerald-700">KSh {contract.totalAccumulatedReturn.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 block">Unclaimed Returns</span>
                    <strong className="font-mono font-bold text-sm">KSh {contract.unclaimedReturns.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Target Plan Selector */}
              {/* Target Level Selector */}
              <div>
                <label className="block text-slate-900 font-bold text-xs mb-2">
                  Select Target Level to Re-Invest:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Level 1 (Al-fakeer) */}
                  <div 
                    onClick={() => setTargetPlan('AL_FAKEER')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      targetPlan === 'AL_FAKEER'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 text-xs">Level 1 (Al-fakeer)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono">
                        60 Days
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5 text-xs text-slate-700 font-mono">
                      <div className="flex justify-between">
                        <span className="font-sans">Capital:</span>
                        <strong className="text-slate-900 font-bold">KSh 5,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans">Daily Return:</span>
                        <strong className="text-emerald-700 font-bold">+200 KSh / day</strong>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Level 2 (Habibi) */}
                  <div 
                    onClick={() => setTargetPlan('HABIBI')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      targetPlan === 'HABIBI'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 text-xs">Level 2 (Habibi)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                        60 Days
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5 text-xs text-slate-700 font-mono">
                      <div className="flex justify-between">
                        <span className="font-sans">Capital:</span>
                        <strong className="text-slate-900 font-bold">KSh 10,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans">Daily Return:</span>
                        <strong className="text-emerald-700 font-bold">+300 KSh / day</strong>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Level 3 (Dubaj) */}
                  <div 
                    onClick={() => setTargetPlan('DUBAJ')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      targetPlan === 'DUBAJ'
                        ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-400/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-950 text-xs">Level 3 (Dubaj)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-mono">
                        72 Days
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5 text-xs text-slate-700 font-mono">
                      <div className="flex justify-between">
                        <span className="font-sans">Capital:</span>
                        <strong className="text-slate-900 font-bold">KSh 20,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans">Daily Return:</span>
                        <strong className="text-emerald-700 font-bold">+500 KSh / day</strong>
                      </div>
                    </div>
                  </div>

                  {/* Option 4: VIP 1 (Hamza) */}
                  <div 
                    onClick={() => setTargetPlan('HAMZA')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      targetPlan === 'HAMZA'
                        ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-400/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-xs flex items-center gap-1">
                        <span>VIP 1 (Hamza)</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono">
                        70 Days
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5 text-xs text-slate-700 font-mono">
                      <div className="flex justify-between">
                        <span className="font-sans">Capital:</span>
                        <strong className="text-slate-900 font-bold">KSh 50,000</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-sans">Daily Return:</span>
                        <strong className="text-emerald-700 font-bold">+1,000 KSh / day</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Units Selection */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Package Units</span>
                  <span className="text-[11px] text-slate-500">
                    Number of {targetConfig.name} units to purchase
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnits(Math.max(1, units - 1))}
                    disabled={units <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm px-2 text-slate-900">{units}</span>
                  <button
                    type="button"
                    onClick={() => setUnits(units + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Re-investment Settlement Breakdown
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Total Target Capital:</span>
                    <span className="font-mono font-bold text-white">KSh {targetCapitalRequired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Funded from Matured Contract:</span>
                    <span className="font-mono font-bold">- KSh {Math.min(targetCapitalRequired, maturedCapitalAvailable).toLocaleString()}</span>
                  </div>
                  {netDifference > 0 ? (
                    <div className="flex justify-between text-amber-300 pt-1 border-t border-slate-800">
                      <span>Upgrade Difference Required:</span>
                      <span className="font-mono font-bold text-amber-400">KSh {netDifference.toLocaleString()}</span>
                    </div>
                  ) : netDifference < 0 ? (
                    <div className="flex justify-between text-emerald-300 pt-1 border-t border-slate-800">
                      <span>Surplus Returned to Wallet:</span>
                      <span className="font-mono font-bold text-emerald-400">+ KSh {Math.abs(netDifference).toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>

                <div className="p-2.5 bg-slate-800 rounded-xl text-[11px] text-emerald-400 flex items-center justify-between">
                  <span>Expected Daily Return:</span>
                  <strong className="font-mono font-bold text-sm">+KSh {(targetConfig.dailyReturnKsh * units).toLocaleString()} / day</strong>
                </div>
              </div>

              {/* Payment Method for Upgrade Difference if netDifference > 0 */}
              {netDifference > 0 && (
                <div className="space-y-2">
                  <label className="text-slate-800 font-bold text-xs block">
                    Payment Source for Upgrade Difference (KSh {netDifference.toLocaleString()}):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('MPESA_STK')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === 'MPESA_STK'
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>M-Pesa Express</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">STK Prompt</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('WALLET')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === 'WALLET'
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cash Wallet</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        KSh {walletBalance.toLocaleString()} bal
                      </div>
                    </button>
                  </div>

                  {paymentMethod === 'MPESA_STK' && (
                    <div className="pt-1">
                      <label className="text-[11px] text-slate-500 font-semibold block mb-1">M-Pesa Registered Number:</label>
                      <input
                        type="text"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                        placeholder="+254 7XX XXX XXX"
                        className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Protocol Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Admin Activation Protocol:</strong> After submitting your re-investment request, the administrator will verify the settlement payment and activate your new plan.
                </span>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReinvestModalOpen(false);
                    setSelectedContractForReinvest(null);
                  }}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!hasSufficientFunds || isSubmitting}
                  onClick={handleConfirmReinvest}
                  className="flex-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    Submit Re-Investment Request
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
