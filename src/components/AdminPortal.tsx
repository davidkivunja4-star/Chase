import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { AdminAddPropertyModal } from './AdminAddPropertyModal';
import { AdminEditPropertyModal } from './AdminEditPropertyModal';
import { InvestmentPlan, PLAN_CONFIGS, PlanSubscriptionApplication, AdminAccessRequest, PendingWithdrawalRequest, NewApplicantRecord } from '../types';
import { 
  Building2, 
  Coins, 
  Users, 
  ArrowLeftRight, 
  ShieldAlert, 
  LayoutDashboard, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Play, 
  TrendingUp, 
  Phone, 
  Mail, 
  Database,
  ArrowRight,
  ArrowUpRight,
  UserCheck,
  User,
  Landmark,
  Clock,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Calendar,
  Search,
  Filter,
  Check,
  X,
  FastForward,
  Send,
  Eye,
  RefreshCw,
  Wallet,
  ShieldCheck,
  HelpCircle,
  CreditCard,
  FileText,
  Hourglass,
  Gift
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { 
    adminTab, 
    setAdminTab, 
    setIsAdminMode, 
    investors, 
    dividendBatches, 
    auditLogs, 
    isAddPropertyModalOpen, 
    setIsAddPropertyModalOpen, 
    selectedPropertyForEdit, 
    setSelectedPropertyForEdit,
    pendingWithdrawals,
    grantPendingWithdrawal,
    subscriptionApplications,
    newApplicants,
    investorTrackers,
    adminAccessRequests,
    approveAdminRequest,
    declineAdminRequest,
    submitAdminAccessRequest,
    acceptPlanSubscription,
    rejectPlanSubscription,
    verifyApplicantKYC,
    advanceAllInvestorPeriods,
    disburseDailyReturnsBatch,
    executeBatchDividendDisbursement,
    verifyInvestorKYC,
    adjustInvestorBalance,
    delistSecondaryOrder
  } = useAdmin();

  const { isSuperAdmin, userProfile } = useAuth();

  const { 
    properties, 
    secondaryListings, 
    submitSubscriptionApplication,
    planInvestments,
    submitReinvestmentRequest 
  } = useInvestment();

  // Local State
  const [disbursementNotice, setDisbursementNotice] = useState<string | null>(null);
  const [selectedBatchPlan, setSelectedBatchPlan] = useState<'ALL' | InvestmentPlan>('ALL');
  const [balanceAdjustInput, setBalanceAdjustInput] = useState<{ [key: string]: string }>({});

  // Subscriptions Filter & Search
  const [subTypeFilter, setSubTypeFilter] = useState<'ALL' | 'NEW_SUBSCRIPTION' | 'REINVESTMENT'>('ALL');
  const [subStatusFilter, setSubStatusFilter] = useState<'ALL' | 'pending' | 'approved' | 'rejected'>('ALL');
  const [subPlanFilter, setSubPlanFilter] = useState<'ALL' | InvestmentPlan>('ALL');
  const [subReferralFilter, setSubReferralFilter] = useState<'ALL' | 'referred' | 'direct'>('ALL');
  const [subSearchQuery, setSubSearchQuery] = useState<string>('');
  const [rejectionReasonPrompt, setRejectionReasonPrompt] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('Payment verification discrepancy');
  const [selectedAppForPaymentModal, setSelectedAppForPaymentModal] = useState<PlanSubscriptionApplication | null>(null);
  const [paymentConfirmedCheck, setPaymentConfirmedCheck] = useState<boolean>(true);
  const [adminActivationNotes, setAdminActivationNotes] = useState<string>('');

  // Applicants Filter & Search
  const [applStatusFilter, setApplStatusFilter] = useState<'ALL' | 'pending_review' | 'verified' | 'accredited'>('ALL');
  const [applReferralFilter, setApplReferralFilter] = useState<'ALL' | 'referred' | 'direct'>('ALL');
  const [applSearchQuery, setApplSearchQuery] = useState<string>('');
  const [selectedApplicantModal, setSelectedApplicantModal] = useState<NewApplicantRecord | null>(null);
  const [smsSentAlert, setSmsSentAlert] = useState<string | null>(null);

  // Tracking Filter & Search
  const [trackPlanFilter, setTrackPlanFilter] = useState<'ALL' | InvestmentPlan>('ALL');
  const [trackStatusFilter, setTrackStatusFilter] = useState<'ALL' | 'active' | 'maturing_soon' | 'matured' | 'reinvested'>('ALL');
  const [trackSearchQuery, setTrackSearchQuery] = useState<string>('');
  const [isAdvancingDay, setIsAdvancingDay] = useState<boolean>(false);

  // Calculations
  const totalPlatformAUM = properties.reduce((sum, p) => sum + p.totalValuation, 0);
  const totalCapitalRaised = properties.reduce((sum, p) => sum + ((p.totalShares - p.sharesRemaining) * p.sharePrice), 0);
  const pendingSubscriptions = subscriptionApplications.filter((a) => a.status === 'pending');
  const approvedSubscriptions = subscriptionApplications.filter((a) => a.status === 'approved');
  const pendingApplicantsCount = newApplicants.filter((a) => a.kycStatus === 'pending_review').length;
  const referredApplicantsCount = newApplicants.filter((a) => a.joinedViaReferral || a.referralCodeUsed || a.source === 'Member Referral').length;
  const referredSubscriptionsCount = subscriptionApplications.filter((a) => a.referralCodeUsed).length;

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptionApplications.filter((app) => {
      const matchType = subTypeFilter === 'ALL' || app.requestType === subTypeFilter;
      const matchStatus = subStatusFilter === 'ALL' || app.status === subStatusFilter;
      const matchPlan = subPlanFilter === 'ALL' || app.plan === subPlanFilter;
      const isReferred = !!(app.referralCodeUsed || app.referrerName);
      const matchReferral = subReferralFilter === 'ALL' || (subReferralFilter === 'referred' ? isReferred : !isReferred);
      const matchSearch = !subSearchQuery || 
        app.applicantName.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
        app.applicantPhone.includes(subSearchQuery) ||
        app.applicationNumber.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
        (app.referralCodeUsed && app.referralCodeUsed.toLowerCase().includes(subSearchQuery.toLowerCase())) ||
        (app.referrerName && app.referrerName.toLowerCase().includes(subSearchQuery.toLowerCase())) ||
        (app.sourceContractNumber && app.sourceContractNumber.toLowerCase().includes(subSearchQuery.toLowerCase()));
      return matchType && matchStatus && matchPlan && matchReferral && matchSearch;
    });
  }, [subscriptionApplications, subTypeFilter, subStatusFilter, subPlanFilter, subReferralFilter, subSearchQuery]);

  // Filtered Applicants
  const filteredApplicants = useMemo(() => {
    return newApplicants.filter((appl) => {
      const matchStatus = applStatusFilter === 'ALL' || appl.kycStatus === applStatusFilter;
      const isReferred = !!(appl.joinedViaReferral || appl.referralCodeUsed || appl.source === 'Member Referral');
      const matchReferral = applReferralFilter === 'ALL' || (applReferralFilter === 'referred' ? isReferred : !isReferred);
      const matchSearch = !applSearchQuery ||
        appl.fullName.toLowerCase().includes(applSearchQuery.toLowerCase()) ||
        appl.email.toLowerCase().includes(applSearchQuery.toLowerCase()) ||
        appl.phoneNumber.includes(applSearchQuery) ||
        appl.idNumberOrPass.toLowerCase().includes(applSearchQuery.toLowerCase()) ||
        (appl.referralCodeUsed && appl.referralCodeUsed.toLowerCase().includes(applSearchQuery.toLowerCase())) ||
        (appl.referrerName && appl.referrerName.toLowerCase().includes(applSearchQuery.toLowerCase()));
      return matchStatus && matchReferral && matchSearch;
    });
  }, [newApplicants, applStatusFilter, applReferralFilter, applSearchQuery]);

  // Filtered Trackers
  const filteredTrackers = useMemo(() => {
    return investorTrackers.filter((tr) => {
      const matchPlan = trackPlanFilter === 'ALL' || tr.plan === trackPlanFilter;
      let matchStatus = true;
      if (trackStatusFilter === 'active') matchStatus = tr.status === 'active';
      else if (trackStatusFilter === 'maturing_soon') matchStatus = tr.status === 'active' && tr.daysRemaining <= 15;
      else if (trackStatusFilter === 'matured') matchStatus = tr.status === 'matured';
      else if (trackStatusFilter === 'reinvested') matchStatus = tr.status === 'reinvested';

      const matchSearch = !trackSearchQuery ||
        tr.investorName.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
        tr.email.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
        tr.phoneNumber.includes(trackSearchQuery) ||
        tr.contractNumber.toLowerCase().includes(trackSearchQuery.toLowerCase());

      return matchPlan && matchStatus && matchSearch;
    });
  }, [investorTrackers, trackPlanFilter, trackStatusFilter, trackSearchQuery]);

  // Staff Access Requests Filter & Search
  const [staffReqStatusFilter, setStaffReqStatusFilter] = useState<'ALL' | 'pending' | 'approved' | 'declined'>('ALL');
  const [staffReqSearchQuery, setStaffReqSearchQuery] = useState<string>('');
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [decliningReasonInput, setDecliningReasonInput] = useState<string>('Administrative authorization criteria not met');

  const pendingAdminReqCount = (adminAccessRequests || []).filter((r) => r.status === 'pending').length;

  // Filtered Admin Requests
  const filteredAdminRequests = useMemo(() => {
    return (adminAccessRequests || []).filter((req) => {
      const matchStatus = staffReqStatusFilter === 'ALL' || req.status === staffReqStatusFilter;
      const matchSearch = !staffReqSearchQuery ||
        req.fullName.toLowerCase().includes(staffReqSearchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(staffReqSearchQuery.toLowerCase()) ||
        req.phoneNumber.includes(staffReqSearchQuery) ||
        req.departmentRole.toLowerCase().includes(staffReqSearchQuery.toLowerCase()) ||
        (req.justification && req.justification.toLowerCase().includes(staffReqSearchQuery.toLowerCase()));

      return matchStatus && matchSearch;
    });
  }, [adminAccessRequests, staffReqStatusFilter, staffReqSearchQuery]);

  // Pending Withdrawals State & Filtering (12-Hour Allocation & Admin Grant Flow)
  const [wdStatusFilter, setWdStatusFilter] = useState<'ALL' | 'pending' | 'granted'>('ALL');
  const [wdSearchQuery, setWdSearchQuery] = useState<string>('');
  const [selectedWdForModal, setSelectedWdForModal] = useState<PendingWithdrawalRequest | null>(null);
  const [allocationPaymentRef, setAllocationPaymentRef] = useState<string>('');
  const [allocationNotes, setAllocationNotes] = useState<string>('');

  const pendingWithdrawalsCount = (pendingWithdrawals || []).filter((w) => w.status === 'pending').length;
  const totalPendingAmount = (pendingWithdrawals || [])
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + w.amountKsh, 0);
  const totalGrantedCount = (pendingWithdrawals || []).filter((w) => w.status === 'granted').length;
  const totalGrantedAmount = (pendingWithdrawals || [])
    .filter((w) => w.status === 'granted')
    .reduce((sum, w) => sum + w.amountKsh, 0);

  const filteredWithdrawals = useMemo(() => {
    return (pendingWithdrawals || []).filter((wd) => {
      const matchStatus = wdStatusFilter === 'ALL' || wd.status === wdStatusFilter;
      const matchSearch = !wdSearchQuery ||
        wd.withdrawalNumber.toLowerCase().includes(wdSearchQuery.toLowerCase()) ||
        wd.investorName.toLowerCase().includes(wdSearchQuery.toLowerCase()) ||
        wd.investorEmail.toLowerCase().includes(wdSearchQuery.toLowerCase()) ||
        wd.mpesaNumber.includes(wdSearchQuery);
      return matchStatus && matchSearch;
    });
  }, [pendingWithdrawals, wdStatusFilter, wdSearchQuery]);

  const handleOpenGrantModal = (wd: PendingWithdrawalRequest) => {
    setSelectedWdForModal(wd);
    setAllocationPaymentRef(`MPESA-B2C-${Math.floor(100000 + Math.random() * 900000)}`);
    setAllocationNotes(`M-Pesa payment allocation verified for ${wd.investorName} (${wd.mpesaNumber}). Disbursed KSh ${wd.amountKsh.toLocaleString()}. Granting success.`);
  };

  const handleConfirmGrantWithdrawal = () => {
    if (!selectedWdForModal) return;
    const res = grantPendingWithdrawal(selectedWdForModal.id, `${allocationNotes} [Ref: ${allocationPaymentRef}]`);
    setSelectedWdForModal(null);
    if (res.success) {
      setDisbursementNotice(`Pending withdrawal #${selectedWdForModal.withdrawalNumber} of KSh ${selectedWdForModal.amountKsh.toLocaleString()} successfully granted! M-Pesa allocation confirmed.`);
      setTimeout(() => setDisbursementNotice(null), 6000);
    }
  };

  const handleDirectGrantWithdrawal = (wdId: string) => {
    const wd = pendingWithdrawals.find(w => w.id === wdId);
    const res = grantPendingWithdrawal(wdId, 'Direct 1-click administrative grant after M-Pesa payment allocation.');
    if (res.success) {
      setDisbursementNotice(`Pending withdrawal #${wd?.withdrawalNumber || wdId} successfully granted! Payment allocation success.`);
      setTimeout(() => setDisbursementNotice(null), 6000);
    }
  };

  // Handler for Simulating New Admin Registration Request
  const handleSimulateAdminRequest = () => {
    const names = [
      { name: 'Kevin Otieno', email: 'k.otieno@hdchase.co.ke', phone: '+254 721 556 789', role: 'Finance & Treasury Administrator' },
      { name: 'Beatrice Wanjiku', email: 'b.wanjiku@compliance.ke', phone: '+254 733 881 920', role: 'Compliance Officer & KYC Auditor' },
      { name: 'Emmanuel Kipruto', email: 'e.kipruto@ops-chase.co.ke', phone: '+254 719 440 112', role: 'Operations & Investor Desk Manager' }
    ];
    const pick = names[Math.floor(Math.random() * names.length)];
    const res = submitAdminAccessRequest({
      userId: `user-sim-${Date.now()}`,
      fullName: pick.name,
      email: pick.email,
      phoneNumber: pick.phone,
      departmentRole: pick.role,
      justification: 'Registration submitted via Admin Portal sign-up: Requesting operator clearance to verify payment references and investor compliance.'
    });
    setDisbursementNotice(res.message);
    setTimeout(() => setDisbursementNotice(null), 6000);
  };

  // Handler for Confirming Declination
  const handleConfirmDeclineRequest = () => {
    if (!decliningRequestId) return;
    const res = declineAdminRequest(decliningRequestId, decliningReasonInput);
    setDisbursementNotice(res.message);
    setDecliningRequestId(null);
    setDecliningReasonInput('Administrative authorization criteria not met');
    setTimeout(() => setDisbursementNotice(null), 6000);
  };

  // Handler for Day Advance Simulation
  const handleAdvanceTimeline = (days: number) => {
    setIsAdvancingDay(true);
    const result = advanceAllInvestorPeriods(days);
    setDisbursementNotice(result.message);
    setTimeout(() => {
      setIsAdvancingDay(false);
      setTimeout(() => setDisbursementNotice(null), 6000);
    }, 400);
  };

  // Handler for Bulk Daily Returns Disburse
  const handleDisburseDailyReturns = () => {
    const result = disburseDailyReturnsBatch(selectedBatchPlan);
    setDisbursementNotice(result.message);
    setTimeout(() => setDisbursementNotice(null), 5000);
  };

  // Handler for Opening Payment Confirmation Modal
  const handleOpenPaymentModal = (app: PlanSubscriptionApplication) => {
    setSelectedAppForPaymentModal(app);
    setPaymentConfirmedCheck(true);
    setAdminActivationNotes(
      app.requestType === 'REINVESTMENT'
        ? `Payment & Rollover verified for ${app.applicantName}. Re-investing into ${app.planName} from Contract #${app.sourceContractNumber || 'matured'}. Plan activated on Day 0/${app.periodDays}.`
        : `Payment of KSh ${app.capitalKsh.toLocaleString()} confirmed via ${app.paymentMethod === 'WALLET' ? 'Wallet Escrow' : `M-Pesa (${app.paymentReference})`}. Activating ${app.planName} contract for ${app.applicantName}.`
    );
  };

  // Handler for Confirming Payment and Activating Plan from Modal
  const handleConfirmAndActivateModal = () => {
    if (!selectedAppForPaymentModal) return;
    const appId = selectedAppForPaymentModal.id;
    const res = acceptPlanSubscription(appId);
    setSelectedAppForPaymentModal(null);
    if (res.success) {
      setDisbursementNotice(res.message);
      setTimeout(() => setDisbursementNotice(null), 6000);
    }
  };

  // Handler for Accept Subscription (Direct 1-Click)
  const handleAcceptSubscription = (id: string) => {
    const res = acceptPlanSubscription(id);
    if (res.success) {
      setDisbursementNotice(res.message);
      setTimeout(() => setDisbursementNotice(null), 5000);
    }
  };

  // Handler for Reject Subscription
  const handleConfirmRejectSubscription = () => {
    if (!rejectionReasonPrompt) return;
    const res = rejectPlanSubscription(rejectionReasonPrompt.id, rejectionReasonText);
    setRejectionReasonPrompt(null);
    setDisbursementNotice(res.message);
    setTimeout(() => setDisbursementNotice(null), 5000);
  };

  // Batch Accept All Pending
  const handleAcceptAllPending = () => {
    let accepted = 0;
    pendingSubscriptions.forEach((app) => {
      acceptPlanSubscription(app.id);
      accepted++;
    });
    setDisbursementNotice(`Batch approval complete: Confirmed payment & activated ${accepted} pending plan subscription(s).`);
    setTimeout(() => setDisbursementNotice(null), 5000);
  };

  // Generate Sample Demo Subscription for rapid testing
  const handleCreateDemoSubscription = (plan: InvestmentPlan) => {
    const names = ['Kiprono Bett', 'Faith Chepngetich', 'Moses Wekesa', 'Grace Nyokabi'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPhone = `+254 7${Math.floor(10000000 + Math.random() * 89999999)}`;
    const randomEmail = `${randomName.toLowerCase().replace(' ', '.')}@kenya-invest.co.ke`;

    submitSubscriptionApplication(plan, 1, 'MPESA_STK', {
      name: randomName,
      email: randomEmail,
      phone: randomPhone,
      notes: `M-Pesa STK auto-checkout. Requesting 1 Unit allocation in ${PLAN_CONFIGS[plan].name}.`
    });

    setDisbursementNotice(`New incoming subscription request simulated for ${randomName} (${PLAN_CONFIGS[plan].name}). Awaiting payment confirmation & activation!`);
    setTimeout(() => setDisbursementNotice(null), 5000);
  };

  // Generate Sample Demo Re-Investment Request for rapid testing
  const handleCreateDemoReinvestment = () => {
    const existingMatured = planInvestments.find((p) => p.status === 'matured') || planInvestments[0];
    const targetPlan: InvestmentPlan = existingMatured?.plan === 'HABIBI' ? 'DUBAJ' : 'HABIBI';
    const targetConfig = PLAN_CONFIGS[targetPlan];
    const maturedCapital = existingMatured ? existingMatured.capitalInvested : 10000;
    const diff = Math.max(0, targetConfig.capitalKsh - maturedCapital);

    const res = submitReinvestmentRequest(
      existingMatured?.id || 'inv-demo',
      targetPlan,
      1,
      diff > 0 ? 'MPESA_STK' : 'MATURED_BALANCE',
      {
        phone: '+254 712 345 678',
        notes: `Simulated investor re-investment request from Contract #${existingMatured?.contractNumber || 'HDC-HBB-1092'}. Target: ${targetConfig.name}. Upgrade difference: KSh ${diff.toLocaleString()} via M-Pesa. Awaiting admin payment confirmation and plan activation.`
      }
    );

    if (res.success) {
      setDisbursementNotice(`New incoming Re-investment Request received! Awaiting admin payment confirmation & plan activation.`);
      setTimeout(() => setDisbursementNotice(null), 5000);
    }
  };

  const handleSendSms = (name: string, phone: string) => {
    setSmsSentAlert(`SMS notification transmitted to ${name} (${phone}): "H&D CHASE PLATFORM: Your investor accreditation has been officially verified."`);
    setTimeout(() => setSmsSentAlert(null), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Admin Status & Command Bar */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <ShieldAlert className="w-4 h-4" />
              <span>H&D CHASE PLATFORM · Operator & Administrative Console</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1">
              Platform Master Console
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Database className="w-3.5 h-3.5" />
                Firestore DB: ai-studio-havensharefracti-0e84de11-f785-4edf-9a9d-3ac51ae68f58
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Super Admin: David Kivunja (davidkivunja4@gmail.com)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAdminMode(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <span>Return to Investor View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 pt-6 mt-6 border-t border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setAdminTab('overview')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              adminTab === 'overview'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          {/* Subscriptions Tab */}
          <button
            onClick={() => setAdminTab('subscriptions')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 relative ${
              adminTab === 'subscriptions'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Plan Subscriptions</span>
            {pendingSubscriptions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                {pendingSubscriptions.length}
              </span>
            )}
          </button>

          {/* Pending Withdrawals Desk Tab */}
          <button
            onClick={() => setAdminTab('withdrawals')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 relative ${
              adminTab === 'withdrawals'
                ? 'bg-rose-700 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-300" />
            <span>Pending Withdrawals</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          {/* New Applicants Tab */}
          <button
            onClick={() => setAdminTab('applicants')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 relative ${
              adminTab === 'applicants'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>New Applicants</span>
            {pendingApplicantsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                {pendingApplicantsCount}
              </span>
            )}
          </button>

          {/* Returns & Period Tracker Tab */}
          <button
            onClick={() => setAdminTab('tracking')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              adminTab === 'tracking'
                ? 'bg-indigo-700 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            <span>Returns & Period Tracker</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          </button>

          {/* Staff & Admin Requests Tab (Super Admin Access Control) */}
          <button
            onClick={() => setAdminTab('staff_access')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 relative ${
              adminTab === 'staff_access'
                ? 'bg-purple-700 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
            <span>Staff & Admin Requests</span>
            {pendingAdminReqCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                {pendingAdminReqCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('properties')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              adminTab === 'properties'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Property Offerings ({properties.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('dividends')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              adminTab === 'dividends'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dividend Engine</span>
          </button>

          <button
            onClick={() => setAdminTab('investors')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              adminTab === 'investors'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Investor Directory ({investors.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('audit')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              adminTab === 'audit'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {disbursementNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{disbursementNotice}</span>
          </div>
          <button onClick={() => setDisbursementNotice(null)} className="text-emerald-700 font-bold p-1">×</button>
        </div>
      )}

      {smsSentAlert && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="font-semibold">{smsSentAlert}</span>
          </div>
          <button onClick={() => setSmsSentAlert(null)} className="text-amber-700 font-bold p-1">×</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB: OVERVIEW & EXECUTIVE CONTROL DESK --- */}
      {/* ========================================================================= */}
      {adminTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Welcome Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                    Master Console
                  </span>
                  <span className="text-xs text-amber-300 font-mono">
                    Super Admin: {userProfile?.displayName || 'David Kivunja'}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Platform Operations & Referral Command Center
                </h2>
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Real-time visibility over investor intake, plan payment verification, and the <strong>10% Referral Attribution System</strong>. Track whether incoming applicants and subscriptions joined through existing member referrals or direct channels.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setAdminTab('subscriptions')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Review Subscriptions ({pendingSubscriptions.length})</span>
                </button>
                <button
                  onClick={() => setAdminTab('applicants')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>New Applicants ({newApplicants.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Platform AUM</span>
                <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
                KSh {totalPlatformAUM.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Across all real estate tiers</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Awaiting Plan Activation</span>
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-2">
                {pendingSubscriptions.length} Applications
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 font-semibold">
                KSh {pendingSubscriptions.reduce((sum, a) => sum + a.capitalKsh, 0).toLocaleString()} pending verification
              </div>
            </div>

            {/* Referral Intake Card */}
            <div className="bg-amber-50/80 dark:bg-amber-950/40 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider">Referral Program</span>
                <span className="p-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  <Gift className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-900 dark:text-amber-300 mt-2">
                {referredApplicantsCount} Referred Members
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-1 font-medium">
                {referredSubscriptionsCount} subscriptions qualified for 10% cash bonus
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Investors</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-2">
                {investors.length} Investors
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active platform accounts</div>
            </div>
          </div>

          {/* Dual Feed: Recent Applications & New Applicants with Referral Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Pending Subscriptions with Referral Status */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Plan Applications</h3>
                    <p className="text-[11px] text-slate-400">Intake queue & referral attribution</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdminTab('subscriptions')}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>View All Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {subscriptionApplications.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Clean Intake Queue</p>
                    <p className="text-[11px] mt-0.5">No pending or unprocessed plan subscription applications.</p>
                  </div>
                ) : (
                  subscriptionApplications.slice(0, 4).map((app) => (
                    <div key={app.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{app.applicantName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{app.applicantEmail} · {app.applicantPhone}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300'
                            : app.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300'
                        }`}>
                          {app.status === 'pending' ? 'Pending Activation' : app.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-sans font-bold text-slate-800 dark:text-slate-200">{app.planName}</span>
                        <strong className="text-slate-900 dark:text-white">KSh {app.capitalKsh.toLocaleString()}</strong>
                      </div>

                      {/* Referral Status Tag */}
                      {app.referralCodeUsed ? (
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-[10px] flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-200">
                            <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Joined via Referral: <code className="font-mono bg-amber-200/80 dark:bg-amber-900 px-1 py-0.2 rounded">{app.referralCodeUsed}</code></span>
                          </div>
                          <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                            +KSh {Math.round(app.capitalKsh * 0.1).toLocaleString()} bonus
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-sans">
                          <User className="w-3 h-3" />
                          <span>Direct application (No referral code)</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: New Applicants with Referral Status */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">New Applicants Directory</h3>
                    <p className="text-[11px] text-slate-400">Identity registry & referral origin</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdminTab('applicants')}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1"
                >
                  <span>View All Registry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {newApplicants.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-amber-500 opacity-80" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Zero Unreviewed Applicants</p>
                    <p className="text-[11px] mt-0.5">All applicant identity verifications are currently cleared.</p>
                  </div>
                ) : (
                  newApplicants.slice(0, 4).map((appl) => {
                    const isReferred = !!(appl.joinedViaReferral || appl.referralCodeUsed || appl.source === 'Member Referral');

                    return (
                      <div key={appl.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                              <span>{appl.fullName}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({appl.country})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{appl.phoneNumber} · {appl.email}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            appl.kycStatus === 'accredited'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : appl.kycStatus === 'verified'
                              ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          }`}>
                            {appl.kycStatus.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Referral Attribution */}
                        {isReferred ? (
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-[10px] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-200">
                              <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Joined via Referral: <code className="font-mono bg-amber-200/80 dark:bg-amber-900 px-1 py-0.2 rounded">{appl.referralCodeUsed || 'HDC-DAVID-8942'}</code></span>
                            </div>
                            <span className="text-amber-800 dark:text-amber-300 text-[10px]">
                              Ref: <strong>{appl.referrerName || 'David Kivunja'}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-sans">
                            <User className="w-3 h-3" />
                            <span>Direct Onboarding (No referral code)</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB: PLAN SUBSCRIPTIONS & RE-INVESTMENT DESK (USER REQUEST #6 & #7) --- */}
      {/* ========================================================================= */}
      {adminTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <FileCheck className="w-4 h-4" />
                <span>Payment Confirmation & Plan Activation Desk</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Plan Subscriptions & Re-investments Intake
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                When a user submits a <strong>New Subscription</strong> or <strong>Re-invests from any plan</strong>, the request arrives here. Review payment confirmation (M-Pesa reference, wallet escrow, or rollover), confirm receipt, and <strong>activate the plan</strong> to commence daily returns (Habibi: 300 KSh/day for 60d · Dubaj: 500 KSh/day for 72d).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAcceptAllPending}
                disabled={pendingSubscriptions.length === 0}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Activate All Pending ({pendingSubscriptions.length})</span>
              </button>

              <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Simulate Intake:</span>
                <button
                  onClick={() => handleCreateDemoSubscription('HABIBI')}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-amber-800 hover:bg-white rounded transition-colors"
                  title="Simulate user subscribing to Habibi Plan (10,000 KSh)"
                >
                  + Habibi (10k)
                </button>
                <button
                  onClick={() => handleCreateDemoSubscription('DUBAJ')}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-sky-800 hover:bg-white rounded transition-colors"
                  title="Simulate user subscribing to Dubaj Plan (20,000 KSh)"
                >
                  + Dubaj (20k)
                </button>
                <button
                  onClick={handleCreateDemoReinvestment}
                  className="px-2 py-1 text-[11px] font-semibold text-purple-700 hover:text-purple-950 hover:bg-white rounded transition-colors flex items-center gap-1"
                  title="Simulate user re-investing matured plan capital"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>+ Re-invest</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Awaiting Activation</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {pendingSubscriptions.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Pending payment verification</div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300">
              <div className="text-[11px] text-amber-900 font-bold flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>Referred Applications</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-800 mt-1">
                {referredSubscriptionsCount}
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">
                KSh {subscriptionApplications.filter(a => a.referralCodeUsed).reduce((sum, a) => sum + Math.round(a.capitalKsh * 0.1), 0).toLocaleString()} 10% bonus
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Pending Capital Queue</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                KSh {pendingSubscriptions.reduce((sum, a) => sum + a.capitalKsh, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">M-Pesa STK / Escrow queued</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Activated Contracts</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {approvedSubscriptions.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Daily returns live & countdown active</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Total Requests</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {subscriptionApplications.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Subscriptions + Re-investments</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500">Request:</span>
              {(['ALL', 'NEW_SUBSCRIPTION', 'REINVESTMENT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSubTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    subTypeFilter === t
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'All Types' : t === 'NEW_SUBSCRIPTION' ? 'New Subscriptions' : 'Re-investments'}
                </button>
              ))}

              <span className="mx-1 text-slate-300">|</span>

              <span className="font-semibold text-slate-500">Referral:</span>
              {(['ALL', 'referred', 'direct'] as const).map((ref) => (
                <button
                  key={ref}
                  onClick={() => setSubReferralFilter(ref)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    subReferralFilter === ref
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ref === 'referred' && <Gift className="w-3 h-3 text-amber-200" />}
                  <span>{ref === 'ALL' ? 'All Origins' : ref === 'referred' ? 'Referred (10% Bonus)' : 'Direct Only'}</span>
                </button>
              ))}

              <span className="mx-1 text-slate-300">|</span>

              <span className="font-semibold text-slate-500">Status:</span>
              {(['ALL', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSubStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors capitalize ${
                    subStatusFilter === st
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'pending' ? 'Pending Activation' : st === 'approved' ? 'Activated' : 'Declined'}
                </button>
              ))}

              <span className="mx-1 text-slate-300">|</span>

              <span className="font-semibold text-slate-500">Level:</span>
              {(['ALL', 'AL_FAKEER', 'HABIBI', 'DUBAJ', 'HAMZA'] as const).map((pl) => (
                <button
                  key={pl}
                  onClick={() => setSubPlanFilter(pl)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    subPlanFilter === pl
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pl === 'ALL' 
                    ? 'All Levels' 
                    : pl === 'AL_FAKEER' 
                    ? 'Level 1 (Al-fakeer)' 
                    : pl === 'HABIBI' 
                    ? 'Level 2 (Habibi)' 
                    : pl === 'DUBAJ' 
                    ? 'Level 3 (Dubaj)' 
                    : 'VIP 1 (Hamza)'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, #..."
                value={subSearchQuery}
                onChange={(e) => setSubSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full md:w-64 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Subscriptions List Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Request # & Type</th>
                    <th className="py-3 px-4">Applicant & Contact</th>
                    <th className="py-3 px-4">Plan & Packages</th>
                    <th className="py-3 px-4 text-right">Capital</th>
                    <th className="py-3 px-4 text-right">Daily Return</th>
                    <th className="py-3 px-4 text-center">Period</th>
                    <th className="py-3 px-4">Payment & Reference</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Payment & Activation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscriptions.map((app) => {
                    const isHabibi = app.plan === 'HABIBI';
                    const isReinvest = app.requestType === 'REINVESTMENT';
                    const isPending = app.status === 'pending';
                    const isApproved = app.status === 'approved';

                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        {/* Column 1: Request Number & Type Badge */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{app.applicationNumber}</span>
                          </div>
                          <div className="mt-1">
                            {isReinvest ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                                <RefreshCw className="w-2.5 h-2.5" />
                                <span>Re-Investment</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                                <span>New Subscription</span>
                              </span>
                            )}
                          </div>
                          {isReinvest && app.sourceContractNumber && (
                            <div className="text-[10px] text-purple-800 font-mono mt-0.5">
                              From: #{app.sourceContractNumber}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {app.appliedAt.slice(0, 16).replace('T', ' ')}
                          </div>
                        </td>

                        {/* Column 2: Applicant & Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{app.applicantName}</div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{app.applicantEmail}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{app.applicantPhone}</span>
                          </div>
                          {app.referralCodeUsed ? (
                            <div className="mt-1.5 p-2 rounded-xl bg-amber-50/80 border border-amber-300 text-[10px] space-y-0.5 shadow-xs">
                              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Joined via Referral: <code className="font-mono bg-amber-200/80 text-amber-950 px-1 py-0.2 rounded font-black">{app.referralCodeUsed}</code></span>
                              </div>
                              <div className="text-amber-900 font-medium text-[10px]">
                                Referrer: <strong>{app.referrerName || 'David Kivunja'}</strong> · 10% Cash Reward: <strong className="text-emerald-700 font-mono font-bold">+KSh {Math.round(app.capitalKsh * 0.1).toLocaleString()}</strong>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              <span>Direct applicant (No referral)</span>
                            </div>
                          )}
                        </td>

                        {/* Column 3: Level & Units */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            app.plan === 'AL_FAKEER'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                              : app.plan === 'HABIBI'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : app.plan === 'DUBAJ'
                              ? 'bg-sky-100 text-sky-900 border-sky-200'
                              : 'bg-purple-100 text-purple-900 border-purple-200'
                          }`}>
                            {PLAN_CONFIGS[app.plan]?.name || app.planName}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1 font-medium">
                            {app.units} Unit{app.units > 1 ? 's' : ''} ({app.capitalKsh.toLocaleString()} KSh)
                          </div>
                        </td>

                        {/* Column 4: Capital Invested */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                          KSh {app.capitalKsh.toLocaleString()}
                          {isReinvest && app.maturedCapitalDeployedKsh && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              Rollover: KSh {app.maturedCapitalDeployedKsh.toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Column 5: Daily Return */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                          +KSh {app.dailyReturnKsh.toLocaleString()} / day
                        </td>

                        {/* Column 6: Period */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-800">{app.periodDays} Days</span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Return: KSh {app.expectedTotalReturnKsh.toLocaleString()}
                          </div>
                        </td>

                        {/* Column 7: Payment Method & Reference */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">
                            {app.paymentMethod === 'MPESA_STK' 
                              ? 'M-Pesa Express STK' 
                              : app.paymentMethod === 'WALLET' 
                              ? 'Cash Wallet Escrow' 
                              : app.paymentMethod === 'MATURED_BALANCE' 
                              ? 'Matured Balance' 
                              : 'Bank Wire'}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                            <CreditCard className="w-3 h-3 text-slate-400" />
                            <span>Ref: {app.paymentReference}</span>
                          </div>
                          <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Payment Verified</span>
                          </div>
                        </td>

                        {/* Column 8: Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {isPending ? 'Awaiting Activation' : app.status}
                          </span>
                          {app.contractNumber && (
                            <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                              Contract: {app.contractNumber}
                            </div>
                          )}
                        </td>

                        {/* Column 9: Payment Confirmation & Activation Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Primary: Confirm Payment & Activate (Opens Detail Modal) */}
                              <button
                                onClick={() => handleOpenPaymentModal(app)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap"
                                title="Review payment verification & activate plan contract"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Confirm & Activate</span>
                              </button>

                              {/* Direct 1-Click Activate */}
                              <button
                                onClick={() => handleAcceptSubscription(app.id)}
                                className="p-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                                title="Direct 1-Click Plan Activation"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              {/* Decline Button */}
                              <button
                                onClick={() => setRejectionReasonPrompt({ id: app.id, name: app.applicantName })}
                                className="p-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                                title="Decline subscription request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 font-mono">
                              {isApproved ? (
                                <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Plan Activated</span>
                                </span>
                              ) : (
                                <span className="text-rose-600 font-semibold">Declined</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No subscription or re-investment applications matching the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB: M-PESA PENDING WITHDRAWALS DESK & PAYMENT ALLOCATION --- */}
      {/* ========================================================================= */}
      {adminTab === 'withdrawals' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
                <ArrowUpRight className="w-4 h-4" />
                <span>M-Pesa Mobile Disbursements & Treasury</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Pending Withdrawals Desk & Payment Allocation
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Review investor withdrawal requests dispatched to their allocated M-Pesa phone number. <strong>The admin can grant access at any time within the 12-hour time frame without having to wait for the 12 hours to finish.</strong> After granting, the users will immediately see in their cash wallet that the allocation was successful.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-2 bg-emerald-950 text-emerald-200 border border-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grantable Within 12h Window</span>
              </div>
            </div>
          </div>

          {/* Mandatory Rule Notice Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs shadow-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider">
                  Flexible 12-Hour Allocation Protocol
                </div>
                <p className="text-emerald-900 font-medium leading-relaxed">
                  "On the pending allocation, the admin can grant access within the 12-hour time frame. The admin doesn't have to wait for the 12 hours to finish. After granting, the user will be able to see that the allocation was successful."
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Allocation</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <Hourglass className="w-4 h-4 animate-spin" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                {pendingWithdrawalsCount}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Total Queue: <span className="font-mono font-bold text-slate-900">KSh {totalPendingAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Granted Disbursements</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                {totalGrantedCount}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Total Disbursed: <span className="font-mono font-bold text-emerald-700">KSh {totalGrantedAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Allocation Policy SLA</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                12 Hours
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Enforced investor withdrawal cooldown window
              </div>
            </div>
          </div>

          {/* Filtering & Search Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Status:
              </span>
              {(['ALL', 'pending', 'granted'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setWdStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                    wdStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Records' : st === 'pending' ? 'Pending Allocation' : 'Granted Success'}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search investor, M-Pesa line, or WD ID..."
                value={wdSearchQuery}
                onChange={(e) => setWdSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Withdrawals Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Withdrawal #</th>
                    <th className="py-3 px-4">Investor</th>
                    <th className="py-3 px-4">Allocated Payment Option</th>
                    <th className="py-3 px-4 text-right">Amount (KSh)</th>
                    <th className="py-3 px-4">Requested At</th>
                    <th className="py-3 px-4">12h Allocation Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWithdrawals.map((wd) => {
                    const isPending = wd.status === 'pending';
                    return (
                      <tr key={wd.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {wd.withdrawalNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{wd.investorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{wd.investorEmail} · {wd.investorId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-mono font-semibold text-[11px] border border-emerald-200/60">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>M-Pesa: {wd.mpesaNumber}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                          KSh {wd.amountKsh.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {new Date(wd.requestedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {new Date(wd.allocatedAtExpected).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              <Hourglass className="w-2.5 h-2.5 animate-spin" />
                              <span>Pending Allocation (12h)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Granted Success</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenGrantModal(wd)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                                title="Grant access now within the 12-hour window. Admin doesn't have to wait for the 12 hours to finish."
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Grant Allocation Success</span>
                              </button>
                              <button
                                onClick={() => handleDirectGrantWithdrawal(wd.id)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                                title="Instant 1-click grant within 12h window"
                              >
                                1-Click
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-emerald-700 font-medium font-mono text-right">
                              Disbursed by Admin ({wd.grantedBy || 'Super Admin'})
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredWithdrawals.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No pending or granted withdrawals matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB: NEW APPLICANTS DIRECTORY (USER REQUEST #6 & #7) --- */}
      {/* ========================================================================= */}
      {adminTab === 'applicants' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                <UserCheck className="w-4 h-4" />
                <span>Onboarding & Identity Registry</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                New Applicants & KYC Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Inspect newly registered applicant profiles, verify mobile phone numbers and national ID/passport documents, and certify account tiers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                Total Registered: <strong>{newApplicants.length} Applicants</strong>
              </span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Total Applicants</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {newApplicants.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Registered accounts</div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300 shadow-xs">
              <div className="text-[11px] text-amber-900 font-bold flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>Joined via Referral</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-800 mt-1">
                {referredApplicantsCount}
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">Qualified for 10% bonus</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Pending Review</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {newApplicants.filter((a) => a.kycStatus === 'pending_review').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Documents submitted</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Verified Investors</div>
              <div className="text-2xl font-bold font-mono text-sky-600 mt-1">
                {newApplicants.filter((a) => a.kycStatus === 'verified').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">ID & M-Pesa verified</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Accredited Clients</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {newApplicants.filter((a) => a.kycStatus === 'accredited').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">HNW & Institutional</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500">Status:</span>
              {(['ALL', 'pending_review', 'verified', 'accredited'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setApplStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    applStatusFilter === st
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Applicants' : st.replace('_', ' ').toUpperCase()}
                </button>
              ))}

              <span className="mx-1 text-slate-300">|</span>

              <span className="font-semibold text-slate-500">Referral:</span>
              {(['ALL', 'referred', 'direct'] as const).map((ref) => (
                <button
                  key={ref}
                  onClick={() => setApplReferralFilter(ref)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    applReferralFilter === ref
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ref === 'referred' && <Gift className="w-3 h-3 text-amber-200" />}
                  <span>{ref === 'ALL' ? 'All Channels' : ref === 'referred' ? 'Referred Only' : 'Direct Only'}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, referral code..."
                value={applSearchQuery}
                onChange={(e) => setApplSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full md:w-64 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Applicants Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Applicant Name</th>
                    <th className="py-3 px-4">Contact (Phone & Email)</th>
                    <th className="py-3 px-4">Referral Origin</th>
                    <th className="py-3 px-4">National ID / Passport</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Preferred Plan</th>
                    <th className="py-3 px-4 text-right">Intended Capital</th>
                    <th className="py-3 px-4 text-center">KYC Status</th>
                    <th className="py-3 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplicants.map((appl) => {
                    const isReferred = !!(appl.joinedViaReferral || appl.referralCodeUsed || appl.source === 'Member Referral');

                    return (
                      <tr key={appl.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{appl.fullName}</div>
                          <div className="text-[10px] text-slate-500">{appl.country}</div>
                          {isReferred && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Gift className="w-2.5 h-2.5 text-amber-600" />
                              <span>Referred Member</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-slate-900 font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{appl.phoneNumber}</span>
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{appl.email}</span>
                          </div>
                        </td>

                        {/* Referral Origin Column */}
                        <td className="py-3.5 px-4 font-sans">
                          {isReferred ? (
                            <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-300 text-[10px] space-y-0.5 shadow-xs">
                              <div className="font-bold text-amber-950 flex items-center gap-1">
                                <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Joined via Referral</span>
                              </div>
                              <div className="text-amber-900 font-mono font-bold text-[10px]">
                                Code: <code className="bg-amber-200/80 px-1.5 py-0.2 rounded font-black text-amber-950">{appl.referralCodeUsed || 'HDC-DAVID-8942'}</code>
                              </div>
                              <div className="text-amber-800 text-[10px]">
                                Referrer: <strong>{appl.referrerName || 'David Kivunja'}</strong>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                              <div className="font-semibold text-slate-700 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Direct Onboarding</span>
                              </div>
                              <div className="text-slate-400 text-[9px]">No referral code used</div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-semibold text-slate-800">{appl.idNumberOrPass}</div>
                          <div className="text-[10px] text-slate-400">{appl.source}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{appl.registeredAt.slice(0, 10)}</div>
                          <div className="text-[10px] text-slate-400">{appl.registeredAt.slice(11, 16)} UTC</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            appl.preferredPlan === 'HABIBI'
                              ? 'bg-amber-100 text-amber-900'
                              : appl.preferredPlan === 'DUBAJ'
                              ? 'bg-indigo-100 text-indigo-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {appl.preferredPlan === 'BOTH' ? 'Both Plans' : `Plan ${appl.preferredPlan}`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          KSh {appl.intendedCapitalKsh.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            appl.kycStatus === 'accredited'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : appl.kycStatus === 'verified'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {appl.kycStatus.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedApplicantModal(appl)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-xs"
                              title="View Full Applicant Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {appl.kycStatus === 'pending_review' && (
                              <button
                                onClick={() => verifyApplicantKYC(appl.id, 'verified')}
                                className="px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1"
                                title="Approve KYC"
                              >
                                <Check className="w-3 h-3" />
                                <span>Verify</span>
                              </button>
                            )}

                            {appl.kycStatus === 'verified' && (
                              <button
                                onClick={() => verifyApplicantKYC(appl.id, 'accredited')}
                                className="px-2 py-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                                title="Accredit Client"
                              >
                                Accredit
                              </button>
                            )}

                            <button
                              onClick={() => handleSendSms(appl.fullName, appl.phoneNumber)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Send SMS notification"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB: TRACK INVESTORS RETURNS AND PERIODS (USER REQUEST #6 & #7) --- */}
      {/* ========================================================================= */}
      {adminTab === 'tracking' && (
        <div className="space-y-6">
          {/* Operations & Timeline Controller Deck */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-800/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <Clock className="w-4 h-4" />
                  <span>Master Investment Lifecycle & Return Engine</span>
                </div>
                <h2 className="text-xl font-black mt-1 text-white">
                  Live Investor Returns & Period Duration Tracker
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl leading-relaxed">
                  Real-time master ledger tracking every investor's active plan duration, elapsed days vs total cycle (60 Days for Habibi, 72 Days for Dubaj), accrued daily returns (300 KSh / 500 KSh), and maturity readiness for re-investment.
                </p>
              </div>

              {/* Simulation & Payout Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleAdvanceTimeline(1)}
                  disabled={isAdvancingDay}
                  className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  title="Simulate 1 full day passing: increments period, adds 300/500 KSh daily return"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Advance +1 Day (Accrue Daily Return)</span>
                </button>

                <button
                  onClick={() => handleAdvanceTimeline(7)}
                  disabled={isAdvancingDay}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-700 flex items-center gap-1"
                >
                  <span>+7 Days</span>
                </button>

                <button
                  onClick={handleDisburseDailyReturns}
                  className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Disburse All Accrued Yield</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-indigo-900/60 text-xs">
              <div>
                <div className="text-indigo-300/70 text-[11px]">Total Active Contracts</div>
                <div className="font-mono font-bold text-lg text-white mt-0.5">
                  {investorTrackers.filter((t) => t.status === 'active').length} Active
                </div>
              </div>
              <div>
                <div className="text-indigo-300/70 text-[11px]">Active Capital Deployed</div>
                <div className="font-mono font-bold text-lg text-emerald-400 mt-0.5">
                  KSh {investorTrackers.filter((t) => t.status === 'active').reduce((sum, t) => sum + t.capitalInvestedKsh, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-indigo-300/70 text-[11px]">Daily Return Accrual Rate</div>
                <div className="font-mono font-bold text-lg text-amber-400 mt-0.5">
                  +KSh {investorTrackers.filter((t) => t.status === 'active').reduce((sum, t) => sum + t.dailyReturnKsh, 0).toLocaleString()} / day
                </div>
              </div>
              <div>
                <div className="text-indigo-300/70 text-[11px]">Total Accumulated Returns</div>
                <div className="font-mono font-bold text-lg text-white mt-0.5">
                  KSh {investorTrackers.reduce((sum, t) => sum + t.totalAccruedReturnsKsh, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-indigo-300/70 text-[11px]">Matured (Re-invest Ready)</div>
                <div className="font-mono font-bold text-lg text-sky-400 mt-0.5">
                  {investorTrackers.filter((t) => t.status === 'matured').length} Contracts
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500">Level:</span>
              {(['ALL', 'AL_FAKEER', 'HABIBI', 'DUBAJ', 'HAMZA'] as const).map((pl) => (
                <button
                  key={pl}
                  onClick={() => setTrackPlanFilter(pl)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    trackPlanFilter === pl
                      ? 'bg-indigo-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pl === 'ALL' 
                    ? 'All Levels' 
                    : pl === 'AL_FAKEER' 
                    ? 'Level 1: Al-fakeer (60d · 200 KSh)' 
                    : pl === 'HABIBI' 
                    ? 'Level 2: Habibi (60d · 300 KSh)' 
                    : pl === 'DUBAJ' 
                    ? 'Level 3: Dubaj (72d · 500 KSh)' 
                    : 'VIP 1: Hamza (70d · 1,000 KSh)'}
                </button>
              ))}

              <span className="mx-1 text-slate-300">|</span>

              <span className="font-semibold text-slate-500">Lifecycle Status:</span>
              {(['ALL', 'active', 'maturing_soon', 'matured', 'reinvested'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTrackStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    trackStatusFilter === st
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'maturing_soon' ? 'Maturing Soon (<15d)' : st.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by investor, contract #, phone..."
                value={trackSearchQuery}
                onChange={(e) => setTrackSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full md:w-64 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Master Investor Tracking Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Investor & Contract</th>
                    <th className="py-3 px-4">Plan & Capital</th>
                    <th className="py-3 px-4 text-center min-w-[180px]">Period Progress</th>
                    <th className="py-3 px-4 text-right">Daily Return Rate</th>
                    <th className="py-3 px-4 text-right">Accrued Return</th>
                    <th className="py-3 px-4 text-right">Unclaimed Yield</th>
                    <th className="py-3 px-4 text-center">Maturity Date</th>
                    <th className="py-3 px-4 text-center">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrackers.map((tr) => {
                    const isHabibi = tr.plan === 'HABIBI';
                    const isMatured = tr.status === 'matured';
                    const isReinvested = tr.status === 'reinvested';
                    const pct = Math.min(100, Math.round((tr.daysElapsed / tr.periodDays) * 100));

                    return (
                      <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{tr.investorName}</div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{tr.phoneNumber}</span>
                          </div>
                          <div className="text-[10px] font-mono font-bold text-indigo-700 mt-0.5">
                            {tr.contractNumber}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            tr.plan === 'AL_FAKEER'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                              : tr.plan === 'HABIBI'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : tr.plan === 'DUBAJ'
                              ? 'bg-sky-100 text-sky-900 border-sky-200'
                              : 'bg-purple-100 text-purple-900 border-purple-200'
                          }`}>
                            {PLAN_CONFIGS[tr.plan]?.name || tr.planName}
                          </span>
                          <div className="font-mono font-bold text-slate-900 mt-1">
                            KSh {tr.capitalInvestedKsh.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {tr.reinvestCycle > 1 ? `Reinvested Cycle #${tr.reinvestCycle}` : 'Initial Cycle'}
                          </div>
                        </td>

                        {/* Period Tracking & Progress */}
                        <td className="py-3.5 px-4">
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="font-bold text-slate-900">
                              Day {tr.daysElapsed} of {tr.periodDays}
                            </span>
                            <span className="font-mono text-slate-500 font-semibold">
                              {tr.daysRemaining} days left ({pct}%)
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 rounded-full ${
                                isMatured
                                  ? 'bg-amber-500'
                                  : isReinvested
                                  ? 'bg-sky-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>Started: {tr.startDate}</span>
                            <span>Matures: {tr.maturityDate}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums text-sm">
                          +KSh {tr.dailyReturnKsh.toLocaleString()} / day
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          <div>KSh {tr.totalAccruedReturnsKsh.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Target: KSh {tr.projectedTotalReturnKsh.toLocaleString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700 tabular-nums">
                          KSh {tr.unclaimedReturnsKsh.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                          <div>{tr.maturityDate}</div>
                          {tr.daysRemaining === 0 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Matured
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              {tr.daysRemaining}d to go
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isMatured
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isReinvested
                              ? 'bg-sky-100 text-sky-900 border border-sky-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {tr.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleAdvanceTimeline(1)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                            title="Simulate 1 day progress on this contract"
                          >
                            +1 Day
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTrackers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No investor records matching the selected period tracking criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: EXECUTIVE OVERVIEW --- */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Platform AUM</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                KSh {totalPlatformAUM.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Across prime portfolio properties</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Capital Funded</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
                KSh {totalCapitalRaised.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Subscribed by retail & private clients</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Pending Plan Subscriptions</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1">
                {pendingSubscriptions.length} Pending
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                <button onClick={() => setAdminTab('subscriptions')} className="text-emerald-700 underline font-semibold">
                  Review & Accept Subscriptions →
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Active Investor Contracts</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
                {investorTrackers.filter((t) => t.status === 'active').length} Active
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                <button onClick={() => setAdminTab('tracking')} className="text-indigo-700 underline font-semibold">
                  Open Period Tracker →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Operator Quick Workflows
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setAdminTab('subscriptions')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Accept Plan Subscriptions</div>
                <p className="text-xs text-slate-500 mt-1">
                  {pendingSubscriptions.length} applications in queue awaiting contract issuance and activation.
                </p>
              </div>

              <div 
                onClick={() => setAdminTab('applicants')}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Review New Applicants</div>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect incoming registration records, phone numbers, and identity verifications.
                </p>
              </div>

              <div 
                onClick={() => setAdminTab('tracking')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Track Returns & Periods</div>
                <p className="text-xs text-slate-500 mt-1">
                  Monitor 60-day and 72-day progress bars, accrue 300/500 KSh daily returns, and manage maturity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB: STAFF ACCESS & ADMIN REQUESTS (SUPER ADMIN GOVERNANCE) --- */}
      {/* ========================================================================= */}
      {adminTab === 'staff_access' && (
        <div className="space-y-6">
          {/* Super Admin Review Desk Header Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>Super Admin Master Governance Desk</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Staff & Administrative Access Requests
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Authorized personnel only. Users who register choosing the <strong>Admin Portal</strong> are queued here. As <strong>Super Admin (David Kivunja)</strong>, you must accept or decline requests before admin access is granted. Investors are strictly blocked from this console.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-purple-300 font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Super Admin: David Kivunja</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">davidkivunja4@gmail.com</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleSimulateAdminRequest}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  title="Generate a demo administrative registration request"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Simulate Admin Request</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total Staff Applications</div>
              <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1">
                {(adminAccessRequests || []).length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Submitted from registration portal</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Pending Super Admin Action</div>
              <div className="text-2xl font-black font-mono tabular-nums text-amber-600 mt-1 flex items-center gap-2">
                <span>{pendingAdminReqCount}</span>
                {pendingAdminReqCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold animate-pulse">
                    Requires Review
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Access locked until approved</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Approved Administrators</div>
              <div className="text-2xl font-black font-mono tabular-nums text-emerald-600 mt-1">
                {(adminAccessRequests || []).filter((r) => r.status === 'approved').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active authorized console operators</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Declined Requests</div>
              <div className="text-2xl font-black font-mono tabular-nums text-rose-600 mt-1">
                {(adminAccessRequests || []).filter((r) => r.status === 'declined').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Admin console access denied</div>
            </div>
          </div>

          {/* Security Governance Notice */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs text-purple-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-purple-900">Platform Security Policy on Admin Access & Investors:</div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                1. <strong>Investors have zero access to the Admin Portal</strong> after registering as an investor. The console button is strictly hidden, and unauthorized access attempts are blocked by automated route guards.
                <br />
                2. <strong>Admin Portal Registration</strong> requires explicit acceptance by Super Admin David Kivunja. When you click <strong>"Accept & Authorize Admin"</strong>, the user's role is immediately elevated and operator privileges are unlocked. When you click <strong>"Decline Request"</strong>, access remains permanently barred.
              </p>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setStaffReqStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  staffReqStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Applications ({(adminAccessRequests || []).length})
              </button>
              <button
                onClick={() => setStaffReqStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  staffReqStatusFilter === 'pending'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>Pending Review</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                  {pendingAdminReqCount}
                </span>
              </button>
              <button
                onClick={() => setStaffReqStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  staffReqStatusFilter === 'approved'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Approved Staff ({(adminAccessRequests || []).filter((r) => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setStaffReqStatusFilter('declined')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  staffReqStatusFilter === 'declined'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Declined ({(adminAccessRequests || []).filter((r) => r.status === 'declined').length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff applicant or role..."
                value={staffReqSearchQuery}
                onChange={(e) => setStaffReqSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Requests Grid / Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            {filteredAdminRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-slate-700 text-sm">No administrative requests found</div>
                <div className="text-xs text-slate-400">
                  {staffReqStatusFilter !== 'ALL'
                    ? `No applications matching filter "${staffReqStatusFilter}".`
                    : 'No staff applications submitted yet.'}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {filteredAdminRequests.map((req) => (
                  <div key={req.id} className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Applicant Details & Department */}
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {req.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          {req.departmentRole}
                        </span>
                        {req.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Super Admin Decision</span>
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Authorized Administrator</span>
                          </span>
                        )}
                        {req.status === 'declined' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                            <X className="w-3 h-3 text-rose-600" />
                            <span>Access Declined</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] font-mono">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Mail className="w-3 h-3 text-purple-600" />
                          <span>{req.email}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{req.phoneNumber}</span>
                        </span>
                        <span className="text-slate-400">
                          Applied: {req.requestedAt.slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>

                      {/* Stated Justification */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700">
                        <strong className="text-slate-900">Stated Access Justification:</strong>
                        <p className="mt-0.5 italic text-slate-600 leading-relaxed">
                          "{req.justification || 'No justification text provided.'}"
                        </p>
                      </div>

                      {/* Review Audit Memo */}
                      {req.reviewedAt && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Decision recorded by {req.reviewedBy} on {req.reviewedAt.slice(0, 16).replace('T', ' ')}
                          {req.declinedReason && (
                            <span className="text-rose-600 font-semibold block mt-0.5">
                              Declined Reason: {req.declinedReason}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions for Super Admin */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => {
                              const res = approveAdminRequest(req.id);
                              setDisbursementNotice(res.message);
                              setTimeout(() => setDisbursementNotice(null), 6000);
                            }}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Request & Authorize Admin</span>
                          </button>

                          <button
                            onClick={() => setDecliningRequestId(req.id)}
                            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline Request</span>
                          </button>
                        </>
                      ) : req.status === 'approved' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Active Operator</span>
                          </span>
                          <button
                            onClick={() => setDecliningRequestId(req.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Revoke Admin Privileges"
                          >
                            Revoke Access
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold">
                            Access Blocked
                          </span>
                          <button
                            onClick={() => {
                              const res = approveAdminRequest(req.id);
                              setDisbursementNotice(res.message);
                              setTimeout(() => setDisbursementNotice(null), 6000);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            Re-evaluate & Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: PROPERTIES --- */}
      {adminTab === 'properties' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-700" />
                <span>Property Offerings Asset Registry</span>
              </h2>
              <p className="text-xs text-slate-500">Live offering circulars registered under Plan 1: HABIBI and Plan 2: DUBAJ</p>
            </div>
            <button
              onClick={() => setIsAddPropertyModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>List New Asset</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Asset Details</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4 text-right">Unit Capital (KSh)</th>
                  <th className="py-3 px-4 text-right">Daily Return</th>
                  <th className="py-3 px-4 text-center">Period</th>
                  <th className="py-3 px-4 text-right">Total Valuation</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{prop.title}</div>
                      <div className="text-[11px] text-slate-400">{prop.city}, {prop.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        prop.plan === 'HABIBI' ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'
                      }`}>
                        Plan {prop.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      KSh {prop.sharePrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      +KSh {prop.dailyReturnKsh || (prop.plan === 'HABIBI' ? 300 : 500)} / day
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {prop.periodDays || (prop.plan === 'HABIBI' ? 60 : 72)} Days
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-semibold">
                      KSh {prop.totalValuation.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedPropertyForEdit(prop)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: DIVIDEND ENGINE --- */}
      {adminTab === 'dividends' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span>Automated Dividend & Yield Disbursement Engine</span>
              </h2>
              <p className="text-xs text-slate-500">Trigger daily return runs for Habibi Plan (300 KSh) and Dubaj Plan (500 KSh)</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBatchPlan}
                onChange={(e) => setSelectedBatchPlan(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
              >
                <option value="ALL">All Active Levels</option>
                <option value="AL_FAKEER">Level 1: Al-fakeer (200 KSh/day)</option>
                <option value="HABIBI">Level 2: Habibi (300 KSh/day)</option>
                <option value="DUBAJ">Level 3: Dubaj (500 KSh/day)</option>
                <option value="HAMZA">VIP 1: Hamza (1,000 KSh/day)</option>
              </select>

              <button
                onClick={() => {
                  const res = executeBatchDividendDisbursement(selectedBatchPlan);
                  setDisbursementNotice(res.message);
                  setTimeout(() => setDisbursementNotice(null), 5000);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Batch Run</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {dividendBatches.map((batch) => (
              <div key={batch.id} className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{batch.batchId}</div>
                  <div className="text-[11px] text-slate-400">{batch.executedAt} · Operator: {batch.executedBy}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    KSh {batch.totalDisbursed.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{batch.investorsBenefited} shareholders credited</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: INVESTORS DIRECTORY --- */}
      {adminTab === 'investors' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700" />
              <span>Registered Member & Shareholder Directory</span>
            </h2>
            <p className="text-xs text-slate-500">Member contacts, phone numbers, total deployed capital, and account balances in KSh</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Investor Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Mobile Phone</th>
                  <th className="py-3 px-4">Member ID & Tier</th>
                  <th className="py-3 px-4 text-right">Capital Invested</th>
                  <th className="py-3 px-4 text-right">Wallet Balance</th>
                  <th className="py-3 px-4 text-center">KYC Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investors.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{inv.displayName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{inv.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-bold">{inv.mobileNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.accountTier}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.memberId}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      KSh {inv.totalInvested.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      KSh {inv.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'accredited' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => adjustInvestorBalance(inv.id, 1000)}
                        className="px-2 py-1 text-[10px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                        title="Add KSh 1,000 credit"
                      >
                        +1,000 KSh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: AUDIT LOGS --- */}
      {adminTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-700" />
              <span>Platform Security & Regulatory Audit Logs</span>
            </h2>
            <p className="text-xs text-slate-500">Immutable record of administrative actions, subscription acceptances, and period progressions</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      log.severity === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{log.timestamp.slice(0, 19).replace('T', ' ')}</span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-1">{log.details}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Actor: {log.actor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Confirmation & Plan Activation Modal (User Request #6) */}
      {selectedAppForPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>Confirm Payment & Activate Plan</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black uppercase">
                      {selectedAppForPaymentModal.requestType === 'REINVESTMENT' ? 'Re-Investment' : 'New Subscription'}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Application #{selectedAppForPaymentModal.applicationNumber} · Received {selectedAppForPaymentModal.appliedAt.slice(0, 16).replace('T', ' ')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppForPaymentModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Applicant Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Applicant & Contact</div>
                <div className="text-sm font-bold text-slate-900">{selectedAppForPaymentModal.applicantName}</div>
                <div className="flex flex-wrap items-center gap-4 text-slate-600 font-mono text-xs pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedAppForPaymentModal.applicantPhone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedAppForPaymentModal.applicantEmail}</span>
                  </span>
                </div>
              </div>

              {/* Plan Financial Terms */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                    selectedAppForPaymentModal.plan === 'HABIBI' 
                      ? 'bg-amber-100 text-amber-950 border border-amber-300' 
                      : 'bg-sky-100 text-sky-950 border border-sky-300'
                  }`}>
                    {selectedAppForPaymentModal.planName}
                  </span>
                  <span className="font-mono text-slate-500 text-xs">
                    {selectedAppForPaymentModal.units} Unit{selectedAppForPaymentModal.units > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Capital Subscribed</span>
                    <strong className="text-slate-900 text-sm">KSh {selectedAppForPaymentModal.capitalKsh.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Daily Return Rate</span>
                    <strong className="text-emerald-700 font-bold text-sm">+KSh {selectedAppForPaymentModal.dailyReturnKsh.toLocaleString()} / day</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-sans block">Contract Period</span>
                    <strong className="text-slate-900 text-sm">{selectedAppForPaymentModal.periodDays} Days</strong>
                  </div>
                </div>

                {selectedAppForPaymentModal.requestType === 'REINVESTMENT' && selectedAppForPaymentModal.sourceContractNumber && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-purple-950 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-sans font-bold">Source Matured Contract:</span>
                      <strong className="font-bold">#{selectedAppForPaymentModal.sourceContractNumber}</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-purple-800">
                      <span className="font-sans">Matured Capital Rolled Over:</span>
                      <span>KSh {(selectedAppForPaymentModal.maturedCapitalDeployedKsh || selectedAppForPaymentModal.capitalKsh).toLocaleString()}</span>
                    </div>
                    {selectedAppForPaymentModal.additionalCapitalPaidKsh !== undefined && selectedAppForPaymentModal.additionalCapitalPaidKsh > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-purple-900 font-bold">
                        <span className="font-sans">Upgrade Difference Paid:</span>
                        <span>+KSh {selectedAppForPaymentModal.additionalCapitalPaidKsh.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Referral Bonus Attribution (10% Investor Reward) */}
              {selectedAppForPaymentModal.referralCodeUsed && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span>10% Referral Bonus Applicable</span>
                    </span>
                    <span className="font-mono font-black text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded text-xs">
                      +KSh {Math.round(selectedAppForPaymentModal.capitalKsh * 0.1).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-900 pt-0.5">
                    Referrer: <strong>{selectedAppForPaymentModal.referrerName || selectedAppForPaymentModal.referrerId}</strong> · Code: <code className="font-mono font-bold text-amber-950">{selectedAppForPaymentModal.referralCodeUsed}</code>
                  </div>
                  <div className="text-[10px] text-amber-800">
                    Upon clicking "Confirm & Activate Plan", 10% of the invested capital will be credited to the referrer's wallet automatically with a recorded referral transaction.
                  </div>
                </div>
              )}

              {/* Payment Verification Box */}
              <div className="p-4 bg-emerald-50/70 border-2 border-emerald-400/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Payment Verification & Confirmation</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Ready to Confirm
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-sans block">Payment Channel</span>
                    <strong className="text-slate-900">
                      {selectedAppForPaymentModal.paymentMethod === 'MPESA_STK' 
                        ? 'Safaricom M-Pesa STK' 
                        : selectedAppForPaymentModal.paymentMethod === 'WALLET' 
                        ? 'Cash Wallet Escrow' 
                        : 'Matured Contract Balance'}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-sans block">Payment Reference</span>
                    <strong className="text-emerald-700 font-bold">{selectedAppForPaymentModal.paymentReference}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono">
                  <span className="font-sans font-medium text-slate-700">Total Funds to Confirm:</span>
                  <strong className="text-base font-black text-slate-950">KSh {selectedAppForPaymentModal.capitalKsh.toLocaleString()}</strong>
                </div>

                {/* Certification Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-slate-800 text-[11px]">
                  <input
                    type="checkbox"
                    checked={paymentConfirmedCheck}
                    onChange={(e) => setPaymentConfirmedCheck(e.target.checked)}
                    className="mt-0.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>
                    <strong>Payment Confirmed Received:</strong> I certify that payment of <strong>KSh {selectedAppForPaymentModal.capitalKsh.toLocaleString()}</strong> has been verified via {selectedAppForPaymentModal.paymentReference}. Activating this contract will immediately start daily accruals and investor countdown.
                  </span>
                </label>

                {/* Admin Notes */}
                <div className="pt-1">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Admin Activation Memo:</label>
                  <textarea
                    rows={2}
                    value={adminActivationNotes}
                    onChange={(e) => setAdminActivationNotes(e.target.value)}
                    className="w-full text-xs p-2 border border-emerald-300 rounded-xl bg-white font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={!paymentConfirmedCheck}
                  onClick={handleConfirmAndActivateModal}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Payment & Activate Plan</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const app = selectedAppForPaymentModal;
                      setSelectedAppForPaymentModal(null);
                      setRejectionReasonPrompt({ id: app.id, name: app.applicantName });
                    }}
                    className="text-rose-600 hover:text-rose-800 font-semibold text-xs py-1"
                  >
                    Decline Request
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAppForPaymentModal(null)}
                    className="text-slate-500 hover:text-slate-800 font-semibold text-xs py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Dialog */}
      {rejectionReasonPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Decline Subscription Application</span>
            </div>
            <p className="text-xs text-slate-600">
              Provide reason for declining the application from <strong>{rejectionReasonPrompt.name}</strong>. If payment was made via wallet, escrowed capital will be returned to the investor.
            </p>
            <input
              type="text"
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-slate-900"
              placeholder="e.g. M-Pesa STK timeout or KYC discrepancy"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionReasonPrompt(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectSubscription}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin: Decline Admin Access Request Dialog */}
      {decliningRequestId && (() => {
        const targetReq = (adminAccessRequests || []).find((r) => r.id === decliningRequestId);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Decline Administrative Privileges</h3>
                  <div className="text-[11px] text-slate-500">Super Admin Governance Action</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">{targetReq?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Staff Email:</span>
                  <span className="font-mono text-slate-700">{targetReq?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department Role:</span>
                  <span className="font-bold text-purple-900">{targetReq?.departmentRole}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-800 block">
                  Select or Enter Reason for Declination:
                </label>
                <select
                  value={decliningReasonInput}
                  onChange={(e) => setDecliningReasonInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 mb-2"
                >
                  <option value="Administrative authorization criteria not met">Administrative authorization criteria not met</option>
                  <option value="Non-whitelisted external domain — Official corporate email required">Non-whitelisted external domain — Official corporate email required</option>
                  <option value="Compliance and regulatory background check incomplete">Compliance and regulatory background check incomplete</option>
                  <option value="Staff quota for this administrative role currently filled">Staff quota for this administrative role currently filled</option>
                  <option value="Custom">Custom note (enter below)</option>
                </select>

                <textarea
                  rows={2}
                  value={decliningReasonInput}
                  onChange={(e) => setDecliningReasonInput(e.target.value)}
                  placeholder="State declination memo to be recorded in audit logs..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                By confirming, this applicant's access to the Admin Portal will be blocked. They will not be able to view administrative dashboards or operator controls.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setDecliningRequestId(null);
                    setDecliningReasonInput('Administrative authorization criteria not met');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeclineRequest}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-xs"
                >
                  Confirm Declination
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Applicant Dossier & Referral Verification Modal */}
      {selectedApplicantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>Applicant KYC & Referral Dossier</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase">
                      {selectedApplicantModal.kycStatus.replace('_', ' ')}
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Registration Date: {selectedApplicantModal.registeredAt.slice(0, 10)} · ID: {selectedApplicantModal.idNumberOrPass}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApplicantModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Applicant Identity Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Full Legal Name</span>
                    <span className="text-base font-black text-slate-900">{selectedApplicantModal.fullName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                    {selectedApplicantModal.country}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Mobile Phone</span>
                    <strong className="text-slate-900 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{selectedApplicantModal.phoneNumber}</span>
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Email Address</span>
                    <strong className="text-slate-900 flex items-center gap-1 truncate" title={selectedApplicantModal.email}>
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{selectedApplicantModal.email}</span>
                    </strong>
                  </div>
                </div>
              </div>

              {/* Referral Status Spotlight (Direct Answer to User Request) */}
              <div className={`p-4 rounded-2xl border ${
                selectedApplicantModal.joinedViaReferral || selectedApplicantModal.referralCodeUsed || selectedApplicantModal.source === 'Member Referral'
                  ? 'bg-amber-50/80 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              } space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    {selectedApplicantModal.joinedViaReferral || selectedApplicantModal.referralCodeUsed || selectedApplicantModal.source === 'Member Referral' ? (
                      <>
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-950 font-black">Joined Through Referral: YES</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-bold">Joined Through Referral: NO (Direct Sign-up)</span>
                      </>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    selectedApplicantModal.joinedViaReferral || selectedApplicantModal.referralCodeUsed || selectedApplicantModal.source === 'Member Referral'
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedApplicantModal.source}
                  </span>
                </div>

                {selectedApplicantModal.joinedViaReferral || selectedApplicantModal.referralCodeUsed || selectedApplicantModal.source === 'Member Referral' ? (
                  <div className="space-y-2 pt-1 border-t border-amber-200 text-xs">
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-500 font-sans block">Referral Code Used</span>
                        <strong className="text-amber-950 text-xs font-black">
                          {selectedApplicantModal.referralCodeUsed || 'HDC-DAVID-8942'}
                        </strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-500 font-sans block">Attributed Referrer</span>
                        <strong className="text-slate-900 text-xs font-bold">
                          {selectedApplicantModal.referrerName || 'David Kivunja'}
                        </strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                      This applicant was referred to HavenShare. When they subscribe to an investment plan, <strong>10% of their invested capital</strong> will automatically be credited to <strong>{selectedApplicantModal.referrerName || 'David Kivunja'}</strong>'s wallet balance.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 leading-relaxed font-sans">
                    This applicant joined directly via the web portal without using an investor referral code. No 10% referral commission will be disbursed upon plan subscription.
                  </p>
                )}
              </div>

              {/* Investment Preferences & Capital */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Preferred Plan</span>
                  <strong className="text-slate-900 font-bold">
                    {selectedApplicantModal.preferredPlan === 'BOTH' ? 'All Plans (Habibi & Dubaj)' : `Plan ${selectedApplicantModal.preferredPlan}`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Target Capital</span>
                  <strong className="text-slate-900 font-mono font-bold">
                    KSh {selectedApplicantModal.intendedCapitalKsh.toLocaleString()}
                  </strong>
                </div>
              </div>

              {selectedApplicantModal.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">KYC & Compliance Memo:</span>
                  <p>{selectedApplicantModal.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {selectedApplicantModal.kycStatus === 'pending_review' && (
                  <button
                    type="button"
                    onClick={() => {
                      verifyApplicantKYC(selectedApplicantModal.id, 'verified');
                      setSelectedApplicantModal(null);
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Verify KYC</span>
                  </button>
                )}

                {selectedApplicantModal.kycStatus === 'verified' && (
                  <button
                    type="button"
                    onClick={() => {
                      verifyApplicantKYC(selectedApplicantModal.id, 'accredited');
                      setSelectedApplicantModal(null);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Elevate to Accredited Client</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedApplicantModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grant Pending Withdrawal Success Modal (Within 12-Hour Timeframe) */}
      {selectedWdForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>Grant M-Pesa Payment Allocation</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black uppercase">
                      Within 12h Window
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Withdrawal #{selectedWdForModal.withdrawalNumber} · Requested {new Date(selectedWdForModal.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedWdForModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              {/* Highlight Note: Admin doesn't have to wait for 12 hours */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Immediate Allocation Authority:</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  The admin can grant access at <strong>any time within the 12-hour timeframe</strong> without having to wait for the 12 hours to finish. After granting, the user will immediately see that the allocation was successful in their cash wallet.
                </p>
              </div>

              {/* Investor Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Investor</span>
                    <strong className="text-sm text-slate-900 font-bold">{selectedWdForModal.investorName}</strong>
                    <div className="text-[11px] text-slate-500 font-mono">{selectedWdForModal.investorEmail}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Withdrawal Amount</span>
                    <strong className="text-lg font-black font-mono text-slate-900">
                      KSh {selectedWdForModal.amountKsh.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500 font-sans">Allocated M-Pesa Recipient:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedWdForModal.mpesaNumber}
                  </span>
                </div>
              </div>

              {/* M-Pesa Transaction Reference */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  M-Pesa B2C Allocation Reference Code:
                </label>
                <input
                  type="text"
                  value={allocationPaymentRef}
                  onChange={(e) => setAllocationPaymentRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="e.g. MPESA-B2C-789124"
                />
              </div>

              {/* Admin Allocation Memo */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  Administrative Disbursement Memo:
                </label>
                <textarea
                  rows={2}
                  value={allocationNotes}
                  onChange={(e) => setAllocationNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="Enter confirmation remarks..."
                />
              </div>

              {/* Confirm Actions */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmGrantWithdrawal}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Grant Allocation Success & Disburse Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWdForModal(null)}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Modals */}
      <AdminAddPropertyModal />
      {selectedPropertyForEdit && (
        <AdminEditPropertyModal
          property={selectedPropertyForEdit}
          onClose={() => setSelectedPropertyForEdit(null)}
        />
      )}
    </div>
  );
};
