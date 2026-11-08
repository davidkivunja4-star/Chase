import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { InvestmentPlan, PLAN_CONFIGS } from '../types';
import { 
  X, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Coins, 
  ArrowRight, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  Crown, 
  Clock, 
  TrendingUp,
  Send,
  Zap,
  Info
} from 'lucide-react';

export const ReferralModal: React.FC = () => {
  const { 
    isReferralModalOpen, 
    setIsReferralModalOpen, 
    referrals, 
    userReferralCode, 
    totalReferralCommissionEarned, 
    pendingReferralCommission,
    simulateReferralReward,
    createReferralRecord,
    walletBalance,
    setIsWalletModalOpen
  } = useInvestment();

  const { userProfile } = useAuth();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInviteText, setCopiedInviteText] = useState(false);

  // Invite Form
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePlan, setInvitePlan] = useState<InvestmentPlan>('HABIBI');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // Simulation Form
  const [simName, setSimName] = useState('Sarah Kimani');
  const [simPlan, setSimPlan] = useState<InvestmentPlan>('HABIBI');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isReferralModalOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://hdchase.co.ke';
  const referralLink = `${currentOrigin}/?ref=${userReferralCode}`;
  const inviteMessage = `Join me on H&D Chase Investment Platform and subscribe to daily return wealth levels! Use my referral code ${userReferralCode} when registering: ${referralLink}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyInviteText = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopiedInviteText(true);
    setTimeout(() => setCopiedInviteText(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(inviteMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !invitePhone.trim()) return;

    createReferralRecord(inviteName.trim(), invitePhone.trim(), inviteEmail.trim(), invitePlan);
    setInviteSuccessMsg(`Invitation recorded for ${inviteName}! Link generated.`);
    setInviteName('');
    setInvitePhone('');
    setInviteEmail('');
    setTimeout(() => setInviteSuccessMsg(null), 4000);
  };

  const handleSimulate = (targetPlan?: InvestmentPlan) => {
    const planToUse = targetPlan || simPlan;
    setIsSimulating(true);
    setTimeout(() => {
      simulateReferralReward(simName.trim() || 'Faith Njeri', planToUse);
      setIsSimulating(false);
    }, 400);
  };

  const creditedReferrals = referrals.filter((r) => r.status === 'credited');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden shrink-0 border-b border-emerald-800/40">
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>10% Referral Commission Program</span>
                </span>
                <span className="text-xs text-emerald-300 font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  Code: {userReferralCode}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Refer Investors & Earn 10% Cash
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Invite fellow investors to the platform. Whenever a referred investor subscribes to any level, you receive <strong className="text-emerald-300 font-bold">10% of their invested capital</strong> directly credited to your cash wallet!
              </p>
            </div>
            <button
              onClick={() => setIsReferralModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar in Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-800/40 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="text-[11px] text-emerald-200/80 font-medium">Total Earned</div>
              <div className="text-lg sm:text-xl font-mono font-black text-emerald-300 mt-0.5">
                KSh {totalReferralCommissionEarned.toLocaleString()}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="text-[11px] text-emerald-200/80 font-medium">Credited Referrals</div>
              <div className="text-lg sm:text-xl font-mono font-black text-white mt-0.5">
                {creditedReferrals.length} Investors
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="text-[11px] text-emerald-200/80 font-medium">Commission Rate</div>
              <div className="text-lg sm:text-xl font-mono font-black text-amber-300 mt-0.5">
                10% Direct Cash
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="text-[11px] text-emerald-200/80 font-medium">Wallet Balance</div>
              <div className="text-lg sm:text-xl font-mono font-black text-white mt-0.5">
                KSh {walletBalance.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-7 flex-1">
          {/* Section 1: Referral Link & Code Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referral Code Card */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/40 border-2 border-emerald-300 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-700" />
                  <span>Your Unique Referral Code</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  10% Commission
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-200">
                <span className="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-wider flex-1 px-2 select-all">
                  {userReferralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                Give this code to new investors. They can enter it during sign-up to link your account.
              </p>
            </div>

            {/* Shareable Link Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-800 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Your Direct Invite Link</span>
                </span>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Auto-Applied
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/15">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="bg-transparent font-mono text-xs text-indigo-100 flex-1 px-2 outline-hidden truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  onClick={handleCopyInviteText}
                  className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  title="Copy full invite message"
                >
                  {copiedInviteText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedInviteText ? 'Copied' : 'Copy Message'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: 10% Level Commission Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>10% Commission by Investment Level</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Every level has a fixed capital requirement. You earn exactly 10% of that capital instantly upon their subscription.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Level 1 */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Level 1
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">60 Days</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">Al-fakeer Level</div>
                <div className="text-[11px] text-slate-500">
                  Invested: <strong className="text-slate-800">5,000 KSh</strong>
                </div>
                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-semibold">Your 10% Reward:</span>
                  <span className="font-mono font-black text-emerald-700 text-base">
                    +500 KSh
                  </span>
                </div>
                <button
                  onClick={() => handleSimulate('AL_FAKEER')}
                  className="w-full mt-1 py-1 px-2 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Test 500 KSh Reward</span>
                </button>
              </div>

              {/* Level 2 */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                    Level 2
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">60 Days</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">Habibi Level</div>
                <div className="text-[11px] text-slate-500">
                  Invested: <strong className="text-slate-800">10,000 KSh</strong>
                </div>
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-amber-900 font-semibold">Your 10% Reward:</span>
                  <span className="font-mono font-black text-amber-800 text-base">
                    +1,000 KSh
                  </span>
                </div>
                <button
                  onClick={() => handleSimulate('HABIBI')}
                  className="w-full mt-1 py-1 px-2 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Test 1,000 KSh Reward</span>
                </button>
              </div>

              {/* Level 3 */}
              <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded-full">
                    Level 3
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">72 Days</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">Dubaj Level</div>
                <div className="text-[11px] text-slate-500">
                  Invested: <strong className="text-slate-800">20,000 KSh</strong>
                </div>
                <div className="pt-2 border-t border-sky-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-sky-900 font-semibold">Your 10% Reward:</span>
                  <span className="font-mono font-black text-sky-800 text-base">
                    +2,000 KSh
                  </span>
                </div>
                <button
                  onClick={() => handleSimulate('DUBAJ')}
                  className="w-full mt-1 py-1 px-2 text-[10px] font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Test 2,000 KSh Reward</span>
                </button>
              </div>

              {/* VIP 1 */}
              <div className="p-4 rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/80 to-amber-50/40 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span>VIP 1</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">70 Days</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">Hamza Level</div>
                <div className="text-[11px] text-slate-500">
                  Invested: <strong className="text-slate-800">50,000 KSh</strong>
                </div>
                <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-purple-900 font-semibold">Your 10% Reward:</span>
                  <span className="font-mono font-black text-purple-900 text-base">
                    +5,000 KSh
                  </span>
                </div>
                <button
                  onClick={() => handleSimulate('HAMZA')}
                  className="w-full mt-1 py-1 px-2 text-[10px] font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Test 5,000 KSh Reward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Interactive Simulation & Direct Invite Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick Simulation Interactive Tool */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Demo: Simulate A Referral
                  </h4>
                </div>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-400/20 px-2 py-0.5 rounded-full">
                  Instant Wallet Credit
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test the referral bonus engine. Choose an investor name and level to immediately experience how the 10% bonus is deposited into your wallet.
              </p>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Referred Friend Name</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="e.g. Sarah Kimani"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Subscribed Level</label>
                  <select
                    value={simPlan}
                    onChange={(e) => setSimPlan(e.target.value as InvestmentPlan)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-400 font-medium"
                  >
                    <option value="AL_FAKEER">Level 1: Al-fakeer (5,000 KSh · Bonus: 500 KSh)</option>
                    <option value="HABIBI">Level 2: Habibi (10,000 KSh · Bonus: 1,000 KSh)</option>
                    <option value="DUBAJ">Level 3: Dubaj (20,000 KSh · Bonus: 2,000 KSh)</option>
                    <option value="HAMZA">VIP 1: Hamza (50,000 KSh · Bonus: 5,000 KSh)</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulate()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Simulate & Credit 10% Bonus (+KSh {(PLAN_CONFIGS[simPlan].capitalKsh * 0.1).toLocaleString()})
                  </span>
                </button>
              </div>
            </div>

            {/* Direct Invitation Form */}
            <form onSubmit={handleCreateInvite} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Register A Pre-Invite
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Auto-Tracking</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log a contact you are inviting so the platform can automatically track their status and alert you when they subscribe.
              </p>

              {inviteSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{inviteSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Dennis Mutua"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">Mobile Phone (M-Pesa)</label>
                  <input
                    type="text"
                    required
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="+254 7..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Target Investment Level</label>
                <select
                  value={invitePlan}
                  onChange={(e) => setInvitePlan(e.target.value as InvestmentPlan)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                >
                  <option value="AL_FAKEER">Level 1: Al-fakeer (5,000 KSh · Reward: 500 KSh)</option>
                  <option value="HABIBI">Level 2: Habibi (10,000 KSh · Reward: 1,000 KSh)</option>
                  <option value="DUBAJ">Level 3: Dubaj (20,000 KSh · Reward: 2,000 KSh)</option>
                  <option value="HAMZA">VIP 1: Hamza (50,000 KSh · Reward: 5,000 KSh)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Save Invitation & Generate Referral Link</span>
              </button>
            </form>
          </div>

          {/* Section 4: Referral Ledger & History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Referred Investors & Commission History ({referrals.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time ledger of investors who registered with your referral code and the 10% commission status.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Referred Investor</th>
                      <th className="py-3 px-4">Subscribed Level</th>
                      <th className="py-3 px-4 text-right">Capital Invested</th>
                      <th className="py-3 px-4 text-right">Commission (10%)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((ref) => {
                      const isCredited = ref.status === 'credited';
                      return (
                        <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{ref.referredUserName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{ref.referredUserPhone || ref.referredUserEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {ref.planName || (ref.subscribedPlan ? PLAN_CONFIGS[ref.subscribedPlan]?.name : 'Pending Selection')}
                            </span>
                            {ref.contractNumber && (
                              <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                                #{ref.contractNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            KSh {ref.investedCapitalKsh.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                            +KSh {ref.commissionKsh.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCredited
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {isCredited ? '10% Credited' : 'Pending Activation'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-mono">
                            {ref.createdAt.slice(0, 10)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Commissions are automatically credited to your cash wallet and can be withdrawn via M-Pesa or deployed into any level.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsReferralModalOpen(false);
                setIsWalletModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              View Cash Wallet
            </button>
            <button
              onClick={() => setIsReferralModalOpen(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
