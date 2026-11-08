import React, { useState } from 'react';
import { Property } from '../types';
import { useInvestment } from '../context/InvestmentContext';
import { useAdmin } from '../context/AdminContext';
import { 
  X, 
  Wallet, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  Plus, 
  Minus,
  RefreshCw,
  Coins,
  Smartphone,
  Send,
  Lock
} from 'lucide-react';

interface InvestModalProps {
  property: Property;
  onClose: () => void;
}

export const InvestModal: React.FC<InvestModalProps> = ({ property, onClose }) => {
  const { 
    walletBalance, 
    investInProperty, 
    submitSubscriptionApplication,
    depositFunds, 
    setActiveCertificateHolding, 
    holdings, 
    setActiveTab,
    hasActiveSubscription,
    activeSubscription,
    hasPendingSubscription,
    pendingSubscriptionApp
  } = useInvestment();

  const { setIsAdminMode, setAdminTab } = useAdmin();

  const [shares, setShares] = useState<number>(1);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedCertId, setCompletedCertId] = useState<string | null>(null);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string | null>(null);

  // Submission preference
  const [submissionFlow, setSubmissionFlow] = useState<'admin_approval' | 'instant'>('admin_approval');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA_STK' | 'WALLET'>('MPESA_STK');
  const [mpesaNumber, setMpesaNumber] = useState<string>('+254 712 345 678');

  const isHabibi = property.plan === 'HABIBI';
  const dailyReturnPerUnit = isHabibi ? 300 : 500;
  const periodDays = isHabibi ? 60 : 72;
  const totalCost = shares * property.sharePrice;
  const projectedDailyReturn = shares * dailyReturnPerUnit;
  const projectedTotalReturn = projectedDailyReturn * periodDays;
  const hasSufficientFunds = walletBalance >= totalCost;
  const shortageAmount = Math.max(0, totalCost - walletBalance);

  const handleSharesChange = (delta: number) => {
    setShares((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (property.sharesRemaining && next > property.sharesRemaining) return property.sharesRemaining;
      return next;
    });
  };

  const handleDirectInput = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) {
      setShares(1);
    } else if (property.sharesRemaining && num > property.sharesRemaining) {
      setShares(property.sharesRemaining);
    } else {
      setShares(num);
    }
  };

  const handleQuickAddDifference = () => {
    depositFunds(Math.ceil(shortageAmount), 'M-Pesa Express');
    setErrorMsg(null);
  };

  const handleExecuteInvestment = () => {
    setErrorMsg(null);
    if (hasActiveSubscription && activeSubscription) {
      setErrorMsg(`A user can subscribe only once to any plan only. You have an active contract (#${activeSubscription.contractNumber}) with ${activeSubscription.daysRemaining} days remaining until maturity. Please wait until maturity.`);
      return;
    }
    if (hasPendingSubscription && pendingSubscriptionApp) {
      setErrorMsg(`A user can subscribe only once to any plan only. You have an application (#${pendingSubscriptionApp.applicationNumber}) awaiting admin confirmation.`);
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Please acknowledge the H&D CHASE PLATFORM offering circular terms before proceeding.');
      return;
    }

    if (submissionFlow === 'admin_approval') {
      // Submit application for Admin Acceptance
      const res = submitSubscriptionApplication(
        property.plan,
        shares,
        paymentMethod,
        {
          name: 'David Kivunja',
          email: 'davidkivunja4@gmail.com',
          phone: mpesaNumber,
          notes: `Subscription application for ${shares} unit(s) in ${property.title}. Payment: ${paymentMethod === 'WALLET' ? 'Wallet Escrow' : `M-Pesa (${mpesaNumber})`}.`,
          propertyId: property.id
        }
      );

      if (res.success) {
        setSubmittedAppId(res.applicationId);
        setSubmittedAppNumber(`APP-${property.plan === 'HABIBI' ? 'HBB' : 'DBJ'}-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      // Instant execution
      const res = investInProperty(property.id, shares);
      if (!res.success) {
        setErrorMsg(res.message);
      } else if (res.certificateId) {
        setCompletedCertId(res.certificateId);
      }
    }
  };

  const handleGoToAdminConsole = () => {
    onClose();
    setIsAdminMode(true);
    setAdminTab('subscriptions');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              H&D CHASE PLATFORM · Subscription
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Subscribe to {isHabibi ? 'Plan 1: HABIBI' : 'Plan 2: DUBAJ'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* SUCCESS SCREEN: SUBMITTED FOR ADMIN APPROVAL */}
          {submittedAppId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-90 duration-300">
                <FileCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  Awaiting Admin Payment Confirmation & Plan Activation
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">
                  Subscription Request Transmitted!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your subscription request has been sent to the Admin. Once payment is confirmed, the admin will activate your plan and daily returns (Habibi: 300 KSh/day · Dubaj: 500 KSh/day) will start.
                </p>
              </div>

              {/* Summary Dossier Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Investment Plan:</span>
                  <span className="font-bold text-slate-900">{isHabibi ? 'Plan 1: HABIBI' : 'Plan 2: DUBAJ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Capital Subscribed:</span>
                  <span className="font-bold text-slate-900">KSh {totalCost.toLocaleString()} ({shares} unit{shares > 1 ? 's' : ''})</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span className="text-slate-500 font-sans">Daily Return Rate:</span>
                  <span className="font-bold">+KSh {projectedDailyReturn.toLocaleString()} / day</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span className="font-sans text-slate-500">Contract Duration:</span>
                  <span className="font-bold">{periodDays} Days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-sans">Payment Method:</span>
                  <span className="font-bold text-slate-800">{paymentMethod === 'MPESA_STK' ? `M-Pesa (${mpesaNumber})` : 'Cash Wallet Escrow'}</span>
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
                    onClose();
                    setActiveTab('portfolio');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-xs"
                >
                  View in My Portfolio Dashboard
                </button>
              </div>
            </div>
          ) : completedCertId ? (
            /* INSTANT EXECUTION CERTIFICATE */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Investment Contract Active!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  Contract #{completedCertId} activated. Your daily returns of KSh {projectedDailyReturn.toLocaleString()}/day have commenced for {periodDays} days.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveTab('portfolio');
                  }}
                  className="flex-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-xs"
                >
                  View in Portfolio
                </button>
              </div>
            </div>
          ) : (
            /* CONFIGURATION & APPLICATION SUBMISSION FORM */
            <>
              {/* Plan Card Banner */}
              <div className={`p-4 rounded-2xl border ${
                isHabibi ? 'bg-amber-50/70 border-amber-200' : 'bg-indigo-50/70 border-indigo-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white shadow-2xs">
                      {isHabibi ? 'Plan 1: HABIBI' : 'Plan 2: DUBAJ'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {property.title}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">Unit Capital</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      KSh {property.sharePrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Rule Banner if User already has an Active Subscription */}
              {hasActiveSubscription && activeSubscription && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-xs space-y-2 text-amber-950">
                  <div className="flex items-center gap-2 font-black text-amber-950 uppercase tracking-wider text-[11px]">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Subscription Policy: 1 Active Plan Limit</span>
                  </div>
                  <p className="text-amber-900 leading-relaxed font-semibold">
                    A user can subscribe only once to any plan only. After subscribing, the investor will have to wait until maturity.
                  </p>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-300 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Active Plan:</span>
                      <span className="font-bold text-slate-900">{activeSubscription.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Contract:</span>
                      <span className="font-bold text-slate-800">#{activeSubscription.contractNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Wait Time:</span>
                      <span className="font-bold text-amber-700">{activeSubscription.daysRemaining} Days Until Maturity ({activeSubscription.maturityDate})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Unit Stepper */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 font-bold text-xs">Number of Packages / Units</label>
                  <span className="font-mono text-slate-500 text-[11px]">
                    1 unit = KSh {property.sharePrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSharesChange(-1)}
                    disabled={shares <= 1}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-slate-800 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={property.sharesRemaining}
                    value={shares}
                    onChange={(e) => handleDirectInput(e.target.value)}
                    className="flex-1 py-2 px-3 text-center border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />

                  <button
                    type="button"
                    onClick={() => handleSharesChange(1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Financial Returns Metrics */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 font-mono">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="font-sans">Total Capital:</span>
                  <span className="text-sm font-bold text-white">KSh {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-400">
                  <span className="font-sans">Daily Return Rate:</span>
                  <span className="text-sm font-bold">+KSh {projectedDailyReturn.toLocaleString()} / day</span>
                </div>
                <div className="flex justify-between items-center text-xs text-amber-300">
                  <span className="font-sans">Duration Period:</span>
                  <span className="text-sm font-bold">{periodDays} Days</span>
                </div>
                <div className="flex justify-between items-center text-xs text-white pt-2 border-t border-slate-800">
                  <span className="font-sans font-bold">Total Accumulated Returns:</span>
                  <span className="text-sm font-black text-amber-400">+KSh {projectedTotalReturn.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-slate-700 font-bold text-xs block">Payment Source & Mobile</label>
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
                      <span>M-Pesa STK Push</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">Instant STK Prompt</div>
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

              {/* Approval Workflow Choice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Subscription Flow</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSubmissionFlow('admin_approval')}
                    className={`py-2 px-2.5 rounded-lg border text-left transition-all ${
                      submissionFlow === 'admin_approval'
                        ? 'border-emerald-600 bg-emerald-100/60 font-bold text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-600 font-medium'
                    }`}
                  >
                    <div>Admin Payment Confirm & Activation</div>
                    <div className="text-[10px] text-slate-500 font-normal">Admin confirms payment & activates plan</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmissionFlow('instant')}
                    className={`py-2 px-2.5 rounded-lg border text-left transition-all ${
                      submissionFlow === 'instant'
                        ? 'border-emerald-600 bg-emerald-100/60 font-bold text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-600 font-medium'
                    }`}
                  >
                    <div>Instant Auto-Activate</div>
                    <div className="text-[10px] text-slate-500 font-normal">Direct contract issuance</div>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>
                  I confirm subscription to {isHabibi ? 'Plan 1: HABIBI (10,000 KSh · 60 Days)' : 'Plan 2: DUBAJ (20,000 KSh · 72 Days)'} with daily return accruals and re-investment rights upon maturity.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteInvestment}
                  disabled={hasActiveSubscription}
                  className={`flex-2 py-3 px-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs text-xs ${
                    hasActiveSubscription
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {hasActiveSubscription ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Subscription Locked: Wait for Maturity ({activeSubscription?.daysRemaining}d Left)</span>
                    </>
                  ) : submissionFlow === 'admin_approval' ? (
                    <>
                      <span>Submit Subscription (KSh {totalCost.toLocaleString()})</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Instant Activate (KSh {totalCost.toLocaleString()})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
