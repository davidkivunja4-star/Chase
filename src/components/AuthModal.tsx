import React, { useState, useEffect } from 'react';
import { useAuth, PAYMENT_RECIPIENT_PHONE, INSTRUCTION_NOTICE } from '../context/AuthContext';
import { useInvestment } from '../context/InvestmentContext';
import { useAdmin } from '../context/AdminContext';
import { RegisteredInvestorRecord } from '../types';
import { 
  X, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  ShieldAlert,
  Building2,
  Clock,
  Check,
  Copy,
  ArrowRight,
  Gift
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authMode, 
    setAuthMode, 
    registerUser, 
    loginUser,
    switchUserRoleForDemo,
    activateInvestorAccountByAdmin
  } = useAuth();

  const { setActiveTab } = useInvestment();
  const { setIsAdminMode, setAdminTab } = useAdmin();

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [referralCodeInput, setReferralCodeInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setReferralCodeInput(ref.toUpperCase());
      }
    }
  }, [isAuthModalOpen]);

  // Admin Registration States
  const [accountType, setAccountType] = useState<'investor' | 'admin'>('investor');
  const [departmentRole, setDepartmentRole] = useState<string>('Compliance Officer & KYC Auditor');
  const [justification, setJustification] = useState<string>('Need administrative access to review new investor identities and verify plan subscription payments.');
  const [adminRequestSubmitted, setAdminRequestSubmitted] = useState<boolean>(false);
  const [pendingActivationRecord, setPendingActivationRecord] = useState<RegisteredInvestorRecord | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic format validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (!mobileNumber.trim()) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    setIsLoading(true);

    if (authMode === 'register') {
      const result = await registerUser(
        email.trim(), 
        password, 
        mobileNumber.trim(), 
        displayName.trim(),
        accountType,
        accountType === 'admin' ? { departmentRole, justification } : undefined,
        referralCodeInput.trim() || undefined
      );

      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed.');
      } else if (result.isPendingAdminApproval) {
        setAdminRequestSubmitted(true);
      } else if (result.isInvestorPendingPlan) {
        // Direct the user immediately to the Plan page
        setActiveTab('marketplace');
        setIsAuthModalOpen(false);
        resetForm();
      }
    } else {
      const result = await loginUser(email.trim(), password, mobileNumber.trim());
      setIsLoading(false);
      if (!result.success) {
        if (result.isPendingPaymentActivation && result.investorRecord) {
          setPendingActivationRecord(result.investorRecord);
        } else if (result.isPendingPlanSelection) {
          // Direct to plan page
          setActiveTab('marketplace');
          setIsAuthModalOpen(false);
        } else {
          setErrorMessage(result.error || 'Login failed.');
        }
      }
    }
  };

  const handleQuickPreset = (preset: 'super_admin' | 'investor' | 'pending_admin' | 'approved_admin') => {
    switchUserRoleForDemo(preset);
    setIsAuthModalOpen(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setMobileNumber('');
    setDisplayName('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setAdminRequestSubmitted(false);
    setPendingActivationRecord(null);
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-xs">
              H&D
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">H&D CHASE PLATFORM</h3>
              <div className="text-[11px] text-slate-500">
                {authMode === 'register' ? 'Registration & Access Portal' : 'Secure Member Sign In'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              resetForm();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        {!adminRequestSubmitted && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                authMode === 'login'
                  ? 'border-slate-900 text-slate-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                authMode === 'register'
                  ? 'border-slate-900 text-slate-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account (Register)
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {pendingActivationRecord ? (
            /* INVESTOR ACCOUNT PENDING PAYMENT & ADMIN ACTIVATION STATE */
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  Account Pending Activation
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">
                  Admin Payment Confirmation Required
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your registration and plan selection ({pendingActivationRecord.selectedPlan === 'HABIBI' ? 'Plan 1: HABIBI (10,000 KSh)' : pendingActivationRecord.selectedPlan === 'DUBAJ' ? 'Plan 2: DUBAJ (20,000 KSh)' : 'Investment Plan'}) have been registered.
                </p>
              </div>

              {/* Required Instructions Box */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 text-left text-xs space-y-3 font-sans">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Payment & Activation Instructions</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Send Money to:</span>
                    <span className="font-mono text-base sm:text-lg font-black text-emerald-700 tracking-wider">
                      {PAYMENT_RECIPIENT_PHONE}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(PAYMENT_RECIPIENT_PHONE);
                      setCopiedPhone(true);
                      setTimeout(() => setCopiedPhone(false), 2500);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-200"
                  >
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPhone ? 'Copied!' : 'Copy Number'}</span>
                  </button>
                </div>

                <div className="p-3 bg-amber-100/70 rounded-xl text-amber-950 text-xs font-bold leading-relaxed border border-amber-300/60">
                  After admin has confirmed payment, admin will activate the account and the investor will log in and have access to the account.
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 font-mono pt-1 border-t border-amber-200/60">
                  <div className="flex justify-between">
                    <span>Investor Full Name:</span>
                    <span className="font-bold text-slate-900">{pendingActivationRecord.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Investor ID:</span>
                    <span className="font-bold text-amber-900">{pendingActivationRecord.memberId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Plan:</span>
                    <span className="font-bold text-slate-900">
                      {pendingActivationRecord.selectedPlan === 'HABIBI' ? 'Plan 1: HABIBI (10,000 KSh)' : 'Plan 2: DUBAJ (20,000 KSh)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const res = activateInvestorAccountByAdmin(pendingActivationRecord.email);
                    if (res.success) {
                      setSuccessMessage('Account activated! Logging you in...');
                      loginUser(pendingActivationRecord.email, '');
                    }
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Admin Confirmation & Activate Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setIsAdminMode(true);
                    setAdminTab('subscriptions');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Open Admin Console (David Kivunja)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingActivationRecord(null);
                    resetForm();
                  }}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Return to Login
                </button>
              </div>
            </div>
          ) : adminRequestSubmitted ? (

            /* ADMIN REGISTRATION SUCCESS / AWAITING SUPER ADMIN STATE */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-90 duration-300">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  Awaiting Super Admin Approval
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">
                  Admin Registration Queued!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your request to register as an Administrator (<strong>{departmentRole}</strong>) has been transmitted to <strong>Super Admin David Kivunja</strong>.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Staff Applicant:</span>
                  <span className="font-bold text-slate-900">{displayName || email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Requested Role:</span>
                  <span className="font-bold text-amber-900">{departmentRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Access Status:</span>
                  <span className="font-bold text-amber-700">Pending Super Admin Authorization</span>
                </div>
                <p className="text-[11px] text-amber-800 font-sans pt-1 border-t border-amber-200/80">
                  Note: Investors and unapproved accounts cannot access the Admin Portal. Once Super Admin accepts your request in the Master Console, your admin privileges will be granted.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    resetForm();
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-xs"
                >
                  Return to Main Portal
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Account Type Selector (Registration Mode) */}
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <label className="block text-slate-900 font-bold text-xs">
                      Select Registration Portal:
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Option 1: Investor Account */}
                      <div
                        onClick={() => setAccountType('investor')}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          accountType === 'investor'
                            ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Investor</span>
                          </span>
                          {accountType === 'investor' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Direct access to Habibi & Dubaj high-yield plans.
                        </div>
                        <div className="mt-2 text-[9px] font-mono text-emerald-700 font-semibold uppercase">
                          Standard Investor
                        </div>
                      </div>

                      {/* Option 2: Admin Portal Registration */}
                      <div
                        onClick={() => setAccountType('admin')}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          accountType === 'admin'
                            ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>Admin Portal</span>
                          </span>
                          {accountType === 'admin' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Platform operator & staff. Requires Super Admin approval.
                        </div>
                        <div className="mt-2 text-[9px] font-mono text-amber-800 font-bold uppercase">
                          Staff Access Only
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Banner regarding access restriction */}
                    {accountType === 'investor' ? (
                      <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                        <strong>Security Policy:</strong> After registering as an investor, you will receive full access to fractional offerings and portfolios. Investors cannot view or access the administrative operator console.
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                        <strong>Super Admin Approval Required:</strong> Admin portal registration is strictly restricted. Super Admin David Kivunja will review your application and must accept your request before admin access is unlocked.
                      </div>
                    )}
                  </div>
                )}

                {/* Full Legal Name */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder={accountType === 'admin' ? 'e.g. James Mwangi' : 'e.g. David Kivunja'}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {accountType === 'admin' && authMode === 'register' ? 'Official Staff Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder={accountType === 'admin' ? 'staff.name@hdchase.co.ke' : 'investor@gmail.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-semibold">
                      Mobile Number
                    </label>
                    <span className="text-[10px] text-slate-400">SMS / 2FA / M-Pesa</span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+254 7XX XXX XXX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-semibold">
                      Password
                    </label>
                    {authMode === 'register' && (
                      <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Referral Code (Investor Registration Mode) */}
                {authMode === 'register' && accountType === 'investor' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-500" />
                        <span>Referral Code (Optional)</span>
                      </label>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>10% Referrer Reward</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. HDC-DAVID-8942"
                        value={referralCodeInput}
                        onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs font-mono uppercase tracking-wider bg-slate-50/50"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Were you invited by an existing investor? Their wallet will receive 10% of your subscribed plan capital upon confirmation.
                    </p>
                  </div>
                )}

                {/* Admin Role Specific Fields */}
                {authMode === 'register' && accountType === 'admin' && (
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Requested Administrative Role / Department:
                      </label>
                      <select
                        value={departmentRole}
                        onChange={(e) => setDepartmentRole(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-medium focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="Compliance Officer & KYC Auditor">Compliance Officer & KYC Auditor</option>
                        <option value="Finance & Treasury Administrator">Finance & Treasury Administrator</option>
                        <option value="Operations & Investor Desk Manager">Operations & Investor Desk Manager</option>
                        <option value="Property & Offering Manager">Property & Offering Manager</option>
                        <option value="Platform Security Auditor">Platform Security Auditor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Access Justification for Super Admin:
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="State reason why administrative permissions are required..."
                        className="w-full p-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs mt-3 ${
                    accountType === 'admin' && authMode === 'register'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Request...</span>
                    </>
                  ) : authMode === 'register' ? (
                    accountType === 'admin' ? (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        <span>Submit Admin Registration for Approval</span>
                      </>
                    ) : (
                      <span>Complete Investor Registration</span>
                    )
                  ) : (
                    <span>Sign In to Platform</span>
                  )}
                </button>
              </form>

              {/* Testing / Demo Quick Presets */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Testing Role Switcher:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">1-Click Test</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('super_admin')}
                    className="p-2 text-left bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-900 font-semibold transition-colors"
                    title="Switch to Super Admin David Kivunja"
                  >
                    <div className="font-bold flex items-center gap-1 text-slate-950">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Super Admin</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">davidkivunja4@gmail.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickPreset('investor')}
                    className="p-2 text-left bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-900 font-semibold transition-colors"
                    title="Switch to Standard Investor"
                  >
                    <div className="font-bold flex items-center gap-1 text-slate-950">
                      <Building2 className="w-3 h-3 text-slate-600" />
                      <span>Investor</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">No Admin Portal access</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickPreset('pending_admin')}
                    className="p-2 text-left bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-950 font-semibold transition-colors"
                    title="Switch to Pending Admin Applicant"
                  >
                    <div className="font-bold flex items-center gap-1 text-amber-900">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Admin</span>
                    </div>
                    <div className="text-[10px] text-amber-700 truncate">Awaiting Super Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickPreset('approved_admin')}
                    className="p-2 text-left bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-950 font-semibold transition-colors"
                    title="Switch to Approved Operator"
                  >
                    <div className="font-bold flex items-center gap-1 text-emerald-900">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Approved Admin</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 truncate">Authorized Staff Access</div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
