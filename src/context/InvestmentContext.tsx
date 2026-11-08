import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Property, 
  UserHolding, 
  Transaction, 
  SecondaryMarketListing, 
  InvestmentPlan,
  HistoricalPerformancePoint,
  UserPlanInvestment,
  PLAN_CONFIGS,
  PlanSubscriptionApplication,
  PendingWithdrawalRequest,
  ReferralRecord,
  DailyTaskState,
  DailyTaskVideo,
  DailyTaskStatus
} from '../types';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_HOLDINGS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SECONDARY_LISTINGS,
  INITIAL_HISTORICAL_PERFORMANCE,
  INITIAL_PLAN_INVESTMENTS 
} from '../data/mockProperties';
import { INITIAL_PLAN_APPLICATIONS } from '../data/mockAdminData';
import { generateDailyTaskState } from '../data/mockDailyTasks';

export const WITHDRAWAL_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 Hours strictly

export const getPlanCode = (p: InvestmentPlan): string => {
  switch (p) {
    case 'AL_FAKEER': return 'FKR';
    case 'HABIBI': return 'HBB';
    case 'DUBAJ': return 'DBJ';
    case 'HAMZA': return 'HMZ';
    default: return 'LVL';
  }
};

export const INITIAL_PENDING_WITHDRAWALS: PendingWithdrawalRequest[] = [];

export const INITIAL_REFERRALS: ReferralRecord[] = [];

interface InvestmentContextType {
  properties: Property[];
  holdings: UserHolding[];
  planInvestments: UserPlanInvestment[];
  subscriptionApplications: PlanSubscriptionApplication[];
  walletBalance: number; // in KSh
  transactions: Transaction[];
  secondaryListings: SecondaryMarketListing[];
  historicalPerformance: HistoricalPerformancePoint[];
  dripEnabled: boolean;
  activeTab: 'marketplace' | 'portfolio' | 'simulator' | 'tasks';
  selectedPropertyForDetail: Property | null;
  selectedPropertyForInvest: Property | null;
  selectedContractForReinvest: UserPlanInvestment | null;
  isReinvestModalOpen: boolean;
  activeCertificateHolding: { holding: UserHolding; property: Property } | null;
  isWalletModalOpen: boolean;
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  
  // Pending Withdrawals & 12h Allocation Controls
  pendingWithdrawals: PendingWithdrawalRequest[];
  lastWithdrawalTimestamp: number | null;
  withdrawalCooldownRemainingMs: number;
  grantWithdrawalSuccess: (withdrawalId: string, adminActor?: string, adminNotes?: string) => { success: boolean; message: string };
  fastForwardWithdrawalCooldown: () => void;
  resetWithdrawalCooldown: () => void;

  // Actions
  setActiveTab: (tab: 'marketplace' | 'portfolio' | 'simulator' | 'tasks') => void;
  setSelectedPropertyForDetail: (property: Property | null) => void;
  setSelectedPropertyForInvest: (property: Property | null) => void;
  setSelectedContractForReinvest: (contract: UserPlanInvestment | null) => void;
  setIsReinvestModalOpen: (open: boolean) => void;
  setActiveCertificateHolding: (data: { holding: UserHolding; property: Property } | null) => void;
  setIsWalletModalOpen: (open: boolean) => void;
  investInPlan: (plan: InvestmentPlan, units?: number, propertyId?: string) => { success: boolean; message: string; contractNumber?: string };
  submitSubscriptionApplication: (
    plan: InvestmentPlan, 
    units?: number, 
    paymentMethod?: 'MPESA_STK' | 'WALLET' | 'BANK_TRANSFER',
    applicantDetails?: { name?: string; email?: string; phone?: string; notes?: string; propertyId?: string }
  ) => { success: boolean; message: string; applicationId: string };
  submitReinvestmentRequest: (
    sourceContractId: string, 
    targetPlan: InvestmentPlan, 
    units?: number,
    paymentMethod?: 'MPESA_STK' | 'WALLET' | 'MATURED_BALANCE',
    applicantDetails?: { phone?: string; notes?: string }
  ) => { success: boolean; message: string; applicationId?: string };
  acceptSubscriptionApplication: (applicationId: string) => { success: boolean; message: string; contractNumber?: string };
  rejectSubscriptionApplication: (applicationId: string, reason?: string) => { success: boolean; message: string };
  reinvestContract: (contractId: string, targetPlan: InvestmentPlan, units?: number) => { success: boolean; message: string };
  claimDailyReturns: (contractId?: string) => { success: boolean; message: string; amountClaimed: number };
  advanceSimulationDays: (days: number) => void;
  investInProperty: (propertyId: string, shares: number) => { success: boolean; message: string; certificateId?: string };
  buySecondaryListing: (listingId: string) => { success: boolean; message: string };
  listSharesForSale: (propertyId: string, shares: number, askPricePerShare: number) => { success: boolean; message: string };
  depositFunds: (amount: number, method?: string) => void;
  withdrawFunds: (
    amount: number, 
    mpesaNumber?: string, 
    investorDetails?: { id?: string; name?: string; email?: string }
  ) => { success: boolean; message: string; pendingWithdrawal?: PendingWithdrawalRequest };
  toggleDrip: () => void;
  triggerManualDividendPayout: () => void;
  dismissNotification: () => void;
  showNotice: (message: string, type?: 'success' | 'info' | 'error') => void;
  setPlanInvestments: React.Dispatch<React.SetStateAction<UserPlanInvestment[]>>;
  setSubscriptionApplications: React.Dispatch<React.SetStateAction<PlanSubscriptionApplication[]>>;

  // Strict Policy: A user can subscribe only once to any plan only. After subscribing, the investor will have to wait until maturity.
  activeSubscription: UserPlanInvestment | undefined;
  hasActiveSubscription: boolean;
  pendingSubscriptionApp: PlanSubscriptionApplication | undefined;
  hasPendingSubscription: boolean;
  canSubscribeNewPlan: boolean;
  subscriptionLockReason: string | null;

  // 10% Referral System
  referrals: ReferralRecord[];
  userReferralCode: string;
  totalReferralCommissionEarned: number;
  pendingReferralCommission: number;
  isReferralModalOpen: boolean;
  setIsReferralModalOpen: (open: boolean) => void;
  createReferralRecord: (
    referredName: string, 
    referredPhone: string, 
    referredEmail: string, 
    targetPlan?: InvestmentPlan
  ) => { success: boolean; message: string; referralRecord: ReferralRecord };
  simulateReferralReward: (referredName: string, plan: InvestmentPlan) => { success: boolean; message: string; commissionKsh: number };

  // Daily Tasks System (2 Motivational Videos per 24 Hours)
  dailyTaskState: DailyTaskState;
  currentDailyReturnAvailableKsh: number;
  updateVideoWatchProgress: (videoId: string, progressPct: number) => void;
  completeVideoTask: (videoId: string) => void;
  claimDailyTaskReturn: () => { success: boolean; message: string; amountCredited: number };
  simulateForfeitDailyTask: () => void;
  simulateNextDayTask: () => void;
  resetTodayTask: () => void;

  // Zari AI Concierge & FAQ Guide
  isZariOpen: boolean;
  setIsZariOpen: (open: boolean) => void;
  zariInitialPrompt: string | null;
  openZariWithPrompt: (prompt?: string) => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

if (typeof window !== 'undefined') {
  try {
    const isCleaned = localStorage.getItem('hdchase_cleaned_v4_zero_active');
    if (!isCleaned) {
      [
        'hdchase_properties_v3_ksh',
        'hdchase_holdings_v3_ksh',
        'hdchase_holdings_v2',
        'hdchase_plan_investments_v3_ksh',
        'hdchase_plan_investments_v2',
        'hdchase_applications_v3_ksh',
        'hdchase_applications_v2',
        'hdchase_wallet_v3_ksh',
        'hdchase_wallet_v2',
        'hdchase_transactions_v3_ksh',
        'hdchase_transactions_v2',
        'hdchase_secondary_v3_ksh',
        'hdchase_pending_withdrawals_v2',
        'hdchase_last_withdrawal_time_v2',
        'hdchase_referrals_v1',
        'hdchase_admin_investors_v1',
        'hdchase_admin_batches_v1',
        'hdchase_admin_audit_v1',
        'hdchase_admin_applicants_v1',
        'hdchase_admin_trackers_v1',
        'hdchase_admin_requests_v1'
      ].forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('hdchase_cleaned_v4_zero_active', 'true');
    }
  } catch {
    // ignore
  }
}

const STORAGE_KEYS = {
  PROPERTIES: 'hdchase_properties_v4_clean',
  HOLDINGS: 'hdchase_holdings_v4_clean',
  PLAN_INVESTMENTS: 'hdchase_plan_investments_v4_clean',
  APPLICATIONS: 'hdchase_applications_v4_clean',
  WALLET: 'hdchase_wallet_v4_clean',
  TRANSACTIONS: 'hdchase_transactions_v4_clean',
  SECONDARY: 'hdchase_secondary_v4_clean',
  DRIP: 'hdchase_drip_v4_clean',
  PENDING_WITHDRAWALS: 'hdchase_pending_withdrawals_v4_clean',
  LAST_WITHDRAWAL_TIME: 'hdchase_last_withdrawal_time_v4_clean',
  REFERRALS: 'hdchase_referrals_v4_clean',
  REFERRAL_CODE: 'hdchase_user_referral_code_v4_clean',
  DAILY_TASKS: 'hdchase_daily_tasks_v4_clean',
};

export const InvestmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PENDING_WITHDRAWALS);
      return saved ? JSON.parse(saved) : INITIAL_PENDING_WITHDRAWALS;
    } catch {
      return INITIAL_PENDING_WITHDRAWALS;
    }
  });

  const [lastWithdrawalTimestamp, setLastWithdrawalTimestamp] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_WITHDRAWAL_TIME);
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const withdrawalCooldownRemainingMs = Math.max(
    0,
    lastWithdrawalTimestamp ? (WITHDRAWAL_COOLDOWN_MS - (currentTime - lastWithdrawalTimestamp)) : 0
  );

  const [holdings, setHoldings] = useState<UserHolding[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
      return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
    } catch {
      return INITIAL_HOLDINGS;
    }
  });

  const [planInvestments, setPlanInvestments] = useState<UserPlanInvestment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAN_INVESTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_PLAN_INVESTMENTS;
    } catch {
      return INITIAL_PLAN_INVESTMENTS;
    }
  });

  const [subscriptionApplications, setSubscriptionApplications] = useState<PlanSubscriptionApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_PLAN_APPLICATIONS;
    } catch {
      return INITIAL_PLAN_APPLICATIONS;
    }
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WALLET);
      return saved ? parseFloat(saved) : 0.00; // Fresh 0.00 KSh balance
    } catch {
      return 0.00;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [secondaryListings, setSecondaryListings] = useState<SecondaryMarketListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECONDARY);
      return saved ? JSON.parse(saved) : INITIAL_SECONDARY_LISTINGS;
    } catch {
      return INITIAL_SECONDARY_LISTINGS;
    }
  });

  const [historicalPerformance] = useState<HistoricalPerformancePoint[]>(INITIAL_HISTORICAL_PERFORMANCE);

  const [dripEnabled, setDripEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIP);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [activeTab, setActiveTab] = useState<'marketplace' | 'portfolio' | 'simulator' | 'tasks'>('portfolio');
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<Property | null>(null);
  const [selectedPropertyForInvest, setSelectedPropertyForInvest] = useState<Property | null>(null);
  const [selectedContractForReinvest, setSelectedContractForReinvest] = useState<UserPlanInvestment | null>(null);
  const [isReinvestModalOpen, setIsReinvestModalOpen] = useState<boolean>(false);
  const [activeCertificateHolding, setActiveCertificateHolding] = useState<{ holding: UserHolding; property: Property } | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Zari AI Concierge & FAQ Guide Modal State
  const [isZariOpen, setIsZariOpen] = useState<boolean>(false);
  const [zariInitialPrompt, setZariInitialPrompt] = useState<string | null>(null);

  const openZariWithPrompt = (prompt?: string) => {
    if (prompt) setZariInitialPrompt(prompt);
    setIsZariOpen(true);
  };

  // Daily Tasks State (2 Motivational/Financial Videos per 24h cycle)
  const activeContractsForTasks = planInvestments.filter((p) => p.status === 'active');
  const currentDailyReturnAvailableKsh = activeContractsForTasks.length > 0
    ? activeContractsForTasks.reduce((sum, c) => sum + c.dailyReturn, 0)
    : 300; // Starter return tier if no active contracts

  const [dailyTaskState, setDailyTaskState] = useState<DailyTaskState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return generateDailyTaskState(1, currentDailyReturnAvailableKsh, 0, 0, 0);
  });

  // 10% Referral Program State
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFERRALS);
      return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
    } catch {
      return INITIAL_REFERRALS;
    }
  });

  const [userReferralCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFERRAL_CODE);
      if (saved) return saved;
      const userProfileStr = localStorage.getItem('hdchase_user_profile_v3');
      if (userProfileStr) {
        const prof = JSON.parse(userProfileStr);
        if (prof.referralCode) return prof.referralCode;
      }
    } catch {
      // ignore
    }
    return 'HDC-DAVID-8942';
  });

  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
  }, [referrals]);

  const totalReferralCommissionEarned = referrals
    .filter((r) => r.status === 'credited')
    .reduce((sum, r) => sum + r.commissionKsh, 0);

  const pendingReferralCommission = referrals
    .filter((r) => r.status === 'pending_subscription')
    .reduce((sum, r) => sum + r.commissionKsh, 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAN_INVESTMENTS, JSON.stringify(planInvestments));
  }, [planInvestments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(subscriptionApplications));
  }, [subscriptionApplications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLET, walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SECONDARY, JSON.stringify(secondaryListings));
  }, [secondaryListings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIP, JSON.stringify(dripEnabled));
  }, [dripEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PENDING_WITHDRAWALS, JSON.stringify(pendingWithdrawals));
  }, [pendingWithdrawals]);

  useEffect(() => {
    if (lastWithdrawalTimestamp) {
      localStorage.setItem(STORAGE_KEYS.LAST_WITHDRAWAL_TIME, lastWithdrawalTimestamp.toString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_WITHDRAWAL_TIME);
    }
  }, [lastWithdrawalTimestamp]);

  // Persist daily task state to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(dailyTaskState));
  }, [dailyTaskState]);

  // Sync return rate when pending
  useEffect(() => {
    if (dailyTaskState.status === 'pending' || dailyTaskState.status === 'in_progress') {
      if (dailyTaskState.dailyReturnKsh !== currentDailyReturnAvailableKsh) {
        setDailyTaskState((prev) => ({
          ...prev,
          dailyReturnKsh: currentDailyReturnAvailableKsh,
        }));
      }
    }
  }, [currentDailyReturnAvailableKsh, dailyTaskState.status, dailyTaskState.dailyReturnKsh]);

  // Self-enforcing 24-hour timeframe & skip penalty:
  // Admin doesn't have to see who has accomplished the task and who doesn't because
  // if a user skips a task, the money won't reflect on the balance and if the 24 hour time frame is over,
  // then the user loses the daily return of that day and has to wait for a new task.
  useEffect(() => {
    if (dailyTaskState.status === 'pending' || dailyTaskState.status === 'in_progress') {
      const expiresTime = new Date(dailyTaskState.expiresAt).getTime();
      if (currentTime > expiresTime) {
        setDailyTaskState((prev) => ({
          ...prev,
          status: 'forfeited',
          streakCount: 0,
          forfeitCount: prev.forfeitCount + 1,
        }));
      }
    }
  }, [currentTime, dailyTaskState.expiresAt, dailyTaskState.status]);

  const showNotice = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const dismissNotification = () => setNotification(null);

  // --- SUBSCRIPTION POLICY ENFORCEMENT ---
  // Platform Rule: A user can subscribe only once to any plan only. After subscribing, the investor will have to wait until maturity.
  const activeSubscription = planInvestments.find(
    (p) => p.status === 'active' && p.daysRemaining > 0
  );
  const hasActiveSubscription = Boolean(activeSubscription);

  const pendingSubscriptionApp = subscriptionApplications.find(
    (a) => a.status === 'pending'
  );
  const hasPendingSubscription = Boolean(pendingSubscriptionApp);

  const canSubscribeNewPlan = !hasActiveSubscription && !hasPendingSubscription;

  const subscriptionLockReason = hasActiveSubscription && activeSubscription
    ? `You have an active subscription to ${activeSubscription.planName} (Contract #${activeSubscription.contractNumber}). Under platform rules, a user can subscribe only once to any plan only. You must wait until this contract reaches full maturity (${activeSubscription.daysRemaining} days remaining) before subscribing again.`
    : hasPendingSubscription && pendingSubscriptionApp
    ? `You have a pending subscription application (#${pendingSubscriptionApp.applicationNumber} · ${pendingSubscriptionApp.planName}) awaiting admin payment confirmation and activation. Under platform rules, a user can subscribe only once to any plan only.`
    : null;

  // --- CORE FEATURE 1: INVEST IN HABIBI OR DUBAJ PLAN ---
  const investInPlan = (plan: InvestmentPlan, units: number = 1, propertyId?: string) => {
    // Enforce Single Active Plan Rule
    if (hasActiveSubscription && activeSubscription) {
      showNotice(
        `A user can subscribe only once to any plan only. You have an active subscription to ${activeSubscription.planName} (Contract #${activeSubscription.contractNumber}) with ${activeSubscription.daysRemaining} days remaining until maturity.`,
        'error'
      );
      return { 
        success: false, 
        message: `Subscription restricted: A user can subscribe only once to any plan only. You must wait until maturity (${activeSubscription.daysRemaining} days remaining).` 
      };
    }

    if (hasPendingSubscription && pendingSubscriptionApp) {
      showNotice(
        `A user can subscribe only once to any plan only. You have a subscription application (#${pendingSubscriptionApp.applicationNumber}) awaiting admin confirmation.`,
        'error'
      );
      return { 
        success: false, 
        message: 'A subscription application is already pending admin activation.' 
      };
    }

    const config = PLAN_CONFIGS[plan];
    const totalCapital = config.capitalKsh * units;
    const dailyReturn = config.dailyReturnKsh * units;

    if (walletBalance < totalCapital) {
      showNotice(
        `Insufficient wallet balance (KSh ${walletBalance.toLocaleString()}). Required: KSh ${totalCapital.toLocaleString()}. Please top up your wallet via M-Pesa.`,
        'error'
      );
      return { 
        success: false, 
        message: `Insufficient balance. Required: KSh ${totalCapital.toLocaleString()}` 
      };
    }

    // Deduct capital from cash wallet
    setWalletBalance((prev) => prev - totalCapital);

    // Calculate dates
    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + config.periodDays);

    const contractNumber = `HDC-${getPlanCode(plan)}-${Math.floor(10000 + Math.random() * 90000)}`;

    const associatedProperty = propertyId 
      ? properties.find((p) => p.id === propertyId)
      : properties.find((p) => p.plan === plan) || properties[0];

    const newInvestment: UserPlanInvestment = {
      id: `inv-${Date.now()}`,
      contractNumber,
      plan,
      planName: config.name,
      propertyTitle: associatedProperty?.title || `${config.name} Portfolio Holdings`,
      propertyId: associatedProperty?.id || 'prop-default',
      capitalInvested: totalCapital,
      units,
      dailyReturn,
      periodDays: config.periodDays,
      startDate: startDate.toISOString().split('T')[0],
      maturityDate: maturityDate.toISOString().split('T')[0],
      daysElapsed: 0,
      daysRemaining: config.periodDays,
      totalAccumulatedReturn: 0,
      claimedReturns: 0,
      unclaimedReturns: 0,
      status: 'active',
      reinvestCycle: 1,
    };

    setPlanInvestments((prev) => [newInvestment, ...prev]);

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'investment',
      title: `Subscribed to ${config.name} (${config.periodDays} Days, ${dailyReturn.toLocaleString()} KSh/day)`,
      amount: totalCapital,
      plan,
      contractId: contractNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update holding summary
    setHoldings((prev) => [
      ...prev,
      {
        propertyId: associatedProperty?.id || 'prop-default',
        plan,
        shares: units,
        averageCostPerShare: config.capitalKsh,
        totalInvested: totalCapital,
        currentEstimatedValuation: totalCapital,
        purchaseDate: new Date().toISOString().split('T')[0],
        certificateId: contractNumber,
      }
    ]);

    showNotice(
      `Successfully subscribed to ${config.name}! Capital: KSh ${totalCapital.toLocaleString()}. Daily return of KSh ${dailyReturn.toLocaleString()} will accrue for ${config.periodDays} days.`,
      'success'
    );

    return { 
      success: true, 
      message: `Successfully activated contract ${contractNumber}`, 
      contractNumber 
    };
  };

  // --- SUBMIT SUBSCRIPTION APPLICATION FOR ADMIN APPROVAL ---
  const submitSubscriptionApplication = (
    plan: InvestmentPlan, 
    units: number = 1, 
    paymentMethod: 'MPESA_STK' | 'WALLET' | 'BANK_TRANSFER' = 'MPESA_STK',
    applicantDetails?: { name?: string; email?: string; phone?: string; notes?: string; propertyId?: string }
  ) => {
    // Platform Rule: A user can subscribe only once to any plan only. After subscribing, the investor will have to wait until maturity.
    if (hasActiveSubscription && activeSubscription) {
      showNotice(
        `A user can subscribe only once to any plan only. You have an active subscription to ${activeSubscription.planName} (Contract #${activeSubscription.contractNumber}) with ${activeSubscription.daysRemaining} days remaining until maturity.`,
        'error'
      );
      return { 
        success: false, 
        message: `Subscription restricted: A user can subscribe only once to any plan only. Must wait until maturity (${activeSubscription.daysRemaining} days remaining).`,
        applicationId: '' 
      };
    }

    if (hasPendingSubscription && pendingSubscriptionApp) {
      showNotice(
        `A user can subscribe only once to any plan only. You have a subscription application (#${pendingSubscriptionApp.applicationNumber}) awaiting admin confirmation.`,
        'error'
      );
      return { 
        success: false, 
        message: 'A subscription application is already pending admin activation.',
        applicationId: '' 
      };
    }

    const config = PLAN_CONFIGS[plan];
    const totalCapital = config.capitalKsh * units;
    const dailyReturn = config.dailyReturnKsh * units;
    const periodDays = config.periodDays;
    const expectedTotalReturn = config.totalReturnKsh * units;
    const expectedTotalPayout = config.totalPayoutKsh * units;

    if (paymentMethod === 'WALLET' && walletBalance < totalCapital) {
      showNotice(
        `Insufficient wallet balance (KSh ${walletBalance.toLocaleString()}). Required: KSh ${totalCapital.toLocaleString()}.`, 
        'error'
      );
      return { success: false, message: 'Insufficient wallet balance', applicationId: '' };
    }

    if (paymentMethod === 'WALLET') {
      setWalletBalance((prev) => prev - totalCapital);
    }

    const applicationNumber = `APP-${getPlanCode(plan)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const refCode = paymentMethod === 'WALLET' 
      ? `WLT-${Date.now().toString().slice(-6)}` 
      : `MPE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const targetProp = applicantDetails?.propertyId 
      ? properties.find(p => p.id === applicantDetails.propertyId)
      : properties.find(p => p.plan === plan) || properties[0];

    const newApp: PlanSubscriptionApplication = {
      id: `app-sub-${Date.now()}`,
      applicationNumber,
      requestType: 'NEW_SUBSCRIPTION',
      applicantId: 'user-001',
      applicantName: applicantDetails?.name || 'David Kivunja',
      applicantEmail: applicantDetails?.email || 'davidkivunja4@gmail.com',
      applicantPhone: applicantDetails?.phone || '+254 712 345 678',
      plan,
      planName: config.name,
      units,
      capitalKsh: totalCapital,
      dailyReturnKsh: dailyReturn,
      periodDays,
      expectedTotalReturnKsh: expectedTotalReturn,
      expectedTotalPayoutKsh: expectedTotalPayout,
      paymentMethod,
      paymentReference: refCode,
      paymentConfirmed: true,
      appliedAt: new Date().toISOString(),
      status: 'pending',
      propertyId: targetProp?.id,
      propertyTitle: targetProp?.title,
      adminNotes: applicantDetails?.notes || `Submitted via ${paymentMethod === 'WALLET' ? 'Direct Wallet Escrow' : 'M-Pesa Express'}. Awaiting Admin Operator Payment Confirmation & Plan Activation.`,
    };

    setSubscriptionApplications((prev) => [newApp, ...prev]);

    const newTx: Transaction = {
      id: `tx-app-${Date.now()}`,
      type: 'investment',
      title: `Submitted Application for ${config.name} (${units} Unit${units > 1 ? 's' : ''}) - Pending Admin Payment Confirmation`,
      amount: totalCapital,
      plan,
      contractId: applicationNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showNotice(
      `Subscription request ${applicationNumber} submitted successfully! Admin will confirm payment and activate your ${config.name} plan.`,
      'success'
    );

    return { success: true, message: `Application ${applicationNumber} submitted`, applicationId: newApp.id };
  };

  // --- SUBMIT RE-INVESTMENT REQUEST FOR ADMIN APPROVAL & ACTIVATION ---
  const submitReinvestmentRequest = (
    sourceContractId: string, 
    targetPlan: InvestmentPlan, 
    units: number = 1,
    paymentMethod: 'MPESA_STK' | 'WALLET' | 'MATURED_BALANCE' = 'MATURED_BALANCE',
    applicantDetails?: { phone?: string; notes?: string }
  ) => {
    const existing = planInvestments.find((inv) => inv.id === sourceContractId);
    if (!existing) {
      showNotice('Investment contract not found.', 'error');
      return { success: false, message: 'Contract not found' };
    }

    if (existing.status !== 'matured') {
      showNotice('Only matured investment contracts are eligible for re-investment.', 'error');
      return { success: false, message: 'Contract has not matured yet.' };
    }

    const targetConfig = PLAN_CONFIGS[targetPlan];
    const targetCapitalRequired = targetConfig.capitalKsh * units;

    // Available capital from the matured contract:
    const maturedCapitalAvailable = existing.capitalInvested + existing.unclaimedReturns;
    const capitalDifference = targetCapitalRequired - maturedCapitalAvailable;

    if (capitalDifference > 0) {
      // Need extra cash from wallet or M-Pesa
      if (paymentMethod === 'WALLET') {
        if (walletBalance < capitalDifference) {
          showNotice(
            `Additional KSh ${capitalDifference.toLocaleString()} needed from wallet to re-invest into ${targetConfig.name}. Current wallet balance: KSh ${walletBalance.toLocaleString()}.`,
            'error'
          );
          return { success: false, message: 'Insufficient wallet balance for upgrade difference.' };
        }
        setWalletBalance((prev) => prev - capitalDifference);
      }
    } else if (capitalDifference < 0) {
      // Surplus capital returned to wallet (e.g. from 20k Dubaj into 10k Habibi)
      const surplus = Math.abs(capitalDifference);
      setWalletBalance((prev) => prev + surplus);
    }

    // Mark previous contract as 'pending_reinvest' so it's not double-submitted
    setPlanInvestments((prev) =>
      prev.map((inv) =>
        inv.id === sourceContractId ? { ...inv, status: 'pending_reinvest' } : inv
      )
    );

    const applicationNumber = `REQ-REINV-${Math.floor(1000 + Math.random() * 9000)}`;
    const refCode = capitalDifference > 0 
      ? (paymentMethod === 'WALLET' ? `WLT-UPG-${Date.now().toString().slice(-4)}` : `MPE-UPG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`)
      : `MAT-${existing.contractNumber}`;

    const newApp: PlanSubscriptionApplication = {
      id: `app-reinv-${Date.now()}`,
      applicationNumber,
      requestType: 'REINVESTMENT',
      sourceContractId: existing.id,
      sourceContractNumber: existing.contractNumber,
      maturedCapitalDeployedKsh: Math.min(targetCapitalRequired, maturedCapitalAvailable),
      additionalCapitalPaidKsh: Math.max(0, capitalDifference),
      applicantId: 'user-001',
      applicantName: 'David Kivunja',
      applicantEmail: 'davidkivunja4@gmail.com',
      applicantPhone: applicantDetails?.phone || '+254 712 345 678',
      plan: targetPlan,
      planName: targetConfig.name,
      units,
      capitalKsh: targetCapitalRequired,
      dailyReturnKsh: targetConfig.dailyReturnKsh * units,
      periodDays: targetConfig.periodDays,
      expectedTotalReturnKsh: targetConfig.totalReturnKsh * units,
      expectedTotalPayoutKsh: targetConfig.totalPayoutKsh * units,
      paymentMethod: capitalDifference > 0 ? paymentMethod : 'MATURED_BALANCE',
      paymentReference: refCode,
      paymentConfirmed: true,
      appliedAt: new Date().toISOString(),
      status: 'pending',
      propertyTitle: targetPlan === 'HABIBI' ? 'The Habibi Oasis Estate' : 'The Dubaj Marina Skyline Tower',
      adminNotes: applicantDetails?.notes || `Re-investment rollover from matured contract #${existing.contractNumber} (${existing.planName}). Rolled over KSh ${Math.min(targetCapitalRequired, maturedCapitalAvailable).toLocaleString()}${capitalDifference > 0 ? ` + KSh ${capitalDifference.toLocaleString()} upgrade top-up confirmed` : ''}. Awaiting admin payment confirmation and plan activation.`,
    };

    setSubscriptionApplications((prev) => [newApp, ...prev]);

    const newTx: Transaction = {
      id: `tx-reinv-req-${Date.now()}`,
      type: 'reinvestment',
      title: `Submitted Re-investment Request into ${targetConfig.name} from Contract #${existing.contractNumber} - Pending Admin Activation`,
      amount: targetCapitalRequired,
      plan: targetPlan,
      contractId: applicationNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showNotice(
      `Re-investment request ${applicationNumber} submitted! Admin will confirm payment and activate your ${targetConfig.name} plan shortly.`,
      'success'
    );

    return { 
      success: true, 
      message: `Re-investment request ${applicationNumber} submitted`, 
      applicationId: newApp.id 
    };
  };

  // --- ACCEPT PLAN SUBSCRIPTION OR REINVESTMENT (ADMIN ACTION) ---
  const acceptSubscriptionApplication = (applicationId: string) => {
    const app = subscriptionApplications.find((a) => a.id === applicationId);
    if (!app) {
      showNotice('Application not found', 'error');
      return { success: false, message: 'Application not found' };
    }
    if (app.status === 'approved') {
      showNotice('Application has already been approved and activated', 'info');
      return { success: false, message: 'Application already approved' };
    }

    const contractNumber = `HDC-${getPlanCode(app.plan)}-${Math.floor(10000 + Math.random() * 90000)}`;
    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + app.periodDays);

    let nextCycle = 1;

    // If this is a re-investment, mark source contract as 'reinvested'
    if (app.requestType === 'REINVESTMENT' && app.sourceContractId) {
      const sourceContract = planInvestments.find((i) => i.id === app.sourceContractId);
      if (sourceContract) {
        nextCycle = (sourceContract.reinvestCycle || 1) + 1;
      }
      setPlanInvestments((prev) =>
        prev.map((inv) =>
          inv.id === app.sourceContractId
            ? {
                ...inv,
                status: 'reinvested',
                reinvestedIntoPlan: app.plan,
                reinvestedAt: new Date().toISOString(),
              }
            : inv
        )
      );
    }

    const newInvestment: UserPlanInvestment = {
      id: `inv-${Date.now()}`,
      contractNumber,
      plan: app.plan,
      planName: app.planName,
      propertyTitle: app.propertyTitle || `${app.planName} Portfolio Holdings`,
      propertyId: app.propertyId || 'prop-default',
      capitalInvested: app.capitalKsh,
      units: app.units,
      dailyReturn: app.dailyReturnKsh,
      periodDays: app.periodDays,
      startDate: startDate.toISOString().split('T')[0],
      maturityDate: maturityDate.toISOString().split('T')[0],
      daysElapsed: 0,
      daysRemaining: app.periodDays,
      totalAccumulatedReturn: 0,
      claimedReturns: 0,
      unclaimedReturns: 0,
      status: 'active',
      reinvestCycle: nextCycle,
    };

    setPlanInvestments((prev) => [newInvestment, ...prev]);

    setSubscriptionApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'approved',
              paymentConfirmed: true,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Master Admin Operator',
              contractNumber,
            }
          : a
      )
    );

    // Update transactions to completed
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.contractId === app.applicationNumber
          ? {
              ...tx,
              title: app.requestType === 'REINVESTMENT'
                ? `Re-invested into ${app.planName} (Contract ${contractNumber} Activated)`
                : `Subscribed to ${app.planName} (Contract ${contractNumber} Activated)`,
              status: 'completed',
            }
          : tx
      )
    );

    // --- 10% REFERRAL COMMISSION ALLOCATION ---
    // Rule: When an investor refers a new investor to this platform and subscribes to any plan,
    // they receive 10% of the invested capital by the new investor.
    const commissionKsh = Math.round(app.capitalKsh * 0.10);
    const refCodeUsed = app.referralCodeUsed || userReferralCode;

    // Credit referrer's cash wallet
    setWalletBalance((prev) => prev + commissionKsh);

    // Record Referral Bonus Transaction
    const refBonusTx: Transaction = {
      id: `tx-ref-${Date.now()}`,
      type: 'referral_bonus',
      title: `10% Referral Bonus: ${app.applicantName} subscribed to ${app.planName}`,
      amount: commissionKsh,
      plan: app.plan,
      contractId: contractNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setTransactions((prev) => [refBonusTx, ...prev]);

    // Update or Insert in Referrals Ledger
    setReferrals((prev) => {
      const matchIdx = prev.findIndex(
        (r) =>
          (r.referredUserEmail && r.referredUserEmail.toLowerCase() === app.applicantEmail.toLowerCase()) ||
          r.referredUserId === app.applicantId
      );
      if (matchIdx >= 0) {
        const next = [...prev];
        next[matchIdx] = {
          ...next[matchIdx],
          subscribedPlan: app.plan,
          planName: app.planName,
          investedCapitalKsh: app.capitalKsh,
          commissionKsh,
          status: 'credited',
          creditedAt: new Date().toISOString(),
          contractNumber,
        };
        return next;
      } else {
        const newRef: ReferralRecord = {
          id: `ref-${Date.now()}`,
          referrerId: app.referrerId || 'user-001',
          referrerName: app.referrerName || 'David Kivunja',
          referrerEmail: 'davidkivunja4@gmail.com',
          referralCodeUsed: refCodeUsed,
          referredUserId: app.applicantId,
          referredUserName: app.applicantName,
          referredUserEmail: app.applicantEmail,
          referredUserPhone: app.applicantPhone,
          subscribedPlan: app.plan,
          planName: app.planName,
          investedCapitalKsh: app.capitalKsh,
          commissionPct: 10,
          commissionKsh,
          status: 'credited',
          createdAt: app.appliedAt || new Date().toISOString(),
          creditedAt: new Date().toISOString(),
          contractNumber,
        };
        return [newRef, ...prev];
      }
    });

    showNotice(
      app.requestType === 'REINVESTMENT'
        ? `Payment confirmed & Re-investment activated! Contract ${contractNumber} is now active under ${app.planName} (Cycle #${nextCycle}). Referrer credited 10% commission (+KSh ${commissionKsh.toLocaleString()}).`
        : `Payment confirmed & Plan activated! Contract ${contractNumber} is now active under ${app.planName}. Referrer credited 10% commission (+KSh ${commissionKsh.toLocaleString()}).`,
      'success'
    );

    return { 
      success: true, 
      message: `Subscription ${app.applicationNumber} approved, activated, and 10% referral commission credited`, 
      contractNumber 
    };
  };

  const createReferralRecord = (
    referredName: string, 
    referredPhone: string, 
    referredEmail: string, 
    targetPlan: InvestmentPlan = 'HABIBI'
  ) => {
    const config = PLAN_CONFIGS[targetPlan];
    const expectedCommission = Math.round(config.capitalKsh * 0.10);

    const newRef: ReferralRecord = {
      id: `ref-inv-${Date.now()}`,
      referrerId: 'user-001',
      referrerName: 'David Kivunja',
      referrerEmail: 'davidkivunja4@gmail.com',
      referralCodeUsed: userReferralCode,
      referredUserId: `user-pending-${Date.now()}`,
      referredUserName: referredName,
      referredUserEmail: referredEmail || `${referredName.toLowerCase().replace(/\s+/g, '.')}@investor.ke`,
      referredUserPhone: referredPhone,
      subscribedPlan: targetPlan,
      planName: config.name,
      investedCapitalKsh: config.capitalKsh,
      commissionPct: 10,
      commissionKsh: expectedCommission,
      status: 'pending_subscription',
      createdAt: new Date().toISOString(),
    };

    setReferrals((prev) => [newRef, ...prev]);
    showNotice(`Referral invite created for ${referredName}! When they subscribe, you'll receive 10% (KSh ${expectedCommission.toLocaleString()}).`, 'info');
    return { success: true, message: 'Referral invite created', referralRecord: newRef };
  };

  const simulateReferralReward = (referredName: string, plan: InvestmentPlan) => {
    const config = PLAN_CONFIGS[plan];
    const capital = config.capitalKsh;
    const commission = Math.round(capital * 0.10);

    // Credit wallet immediately
    setWalletBalance((prev) => prev + commission);

    const contractNumber = `HDC-${getPlanCode(plan)}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRef: ReferralRecord = {
      id: `ref-${Date.now()}`,
      referrerId: 'user-001',
      referrerName: 'David Kivunja',
      referrerEmail: 'davidkivunja4@gmail.com',
      referralCodeUsed: userReferralCode,
      referredUserId: `user-sim-${Date.now()}`,
      referredUserName: referredName,
      referredUserEmail: `${referredName.toLowerCase().replace(/\s+/g, '.')}@investor.ke`,
      referredUserPhone: `+254 7${Math.floor(10000000 + Math.random() * 90000000)}`,
      subscribedPlan: plan,
      planName: config.name,
      investedCapitalKsh: capital,
      commissionPct: 10,
      commissionKsh: commission,
      status: 'credited',
      createdAt: new Date().toISOString(),
      creditedAt: new Date().toISOString(),
      contractNumber,
    };

    setReferrals((prev) => [newRef, ...prev]);

    const tx: Transaction = {
      id: `tx-ref-${Date.now()}`,
      type: 'referral_bonus',
      title: `10% Referral Commission: ${referredName} subscribed to ${config.name}`,
      amount: commission,
      plan,
      contractId: contractNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setTransactions((prev) => [tx, ...prev]);

    showNotice(`10% Referral Commission Credited! +KSh ${commission.toLocaleString()} added to your cash wallet (${referredName} invested in ${config.name}).`, 'success');

    return { success: true, message: `Successfully earned 10% commission of KSh ${commission.toLocaleString()}!`, commissionKsh: commission };
  };

  // --- REJECT PLAN SUBSCRIPTION OR REINVESTMENT (ADMIN ACTION) ---
  const rejectSubscriptionApplication = (applicationId: string, reason: string = 'Payment or compliance discrepancy') => {
    const app = subscriptionApplications.find((a) => a.id === applicationId);
    if (!app) return { success: false, message: 'Application not found' };

    // If this was a re-investment, restore the source contract status to 'matured'
    if (app.requestType === 'REINVESTMENT' && app.sourceContractId) {
      setPlanInvestments((prev) =>
        prev.map((inv) =>
          inv.id === app.sourceContractId && inv.status === 'pending_reinvest'
            ? { ...inv, status: 'matured' }
            : inv
        )
      );

      // If additional capital was deducted from wallet, refund it
      if (app.additionalCapitalPaidKsh && app.additionalCapitalPaidKsh > 0 && app.paymentMethod === 'WALLET') {
        setWalletBalance((prev) => prev + app.additionalCapitalPaidKsh!);
        showNotice(`Refunded top-up difference of KSh ${app.additionalCapitalPaidKsh.toLocaleString()} to cash wallet.`, 'info');
      }
    } else {
      // New subscription refund
      if (app.paymentMethod === 'WALLET' && app.status === 'pending') {
        setWalletBalance((prev) => prev + app.capitalKsh);
        showNotice(`Refunded KSh ${app.capitalKsh.toLocaleString()} to user wallet from rejected application.`, 'info');
      }
    }

    setSubscriptionApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Master Admin Operator',
              adminNotes: reason,
            }
          : a
      )
    );

    showNotice(`Request ${app.applicationNumber} declined: ${reason}`, 'info');
    return { success: true, message: 'Application rejected' };
  };

  // --- CORE FEATURE 2: RE-INVEST AFTER MATURITY INTO ANY PLAN ---
  const reinvestContract = (contractId: string, targetPlan: InvestmentPlan, units: number = 1) => {
    const existing = planInvestments.find((inv) => inv.id === contractId);
    if (!existing) {
      showNotice('Investment contract not found.', 'error');
      return { success: false, message: 'Contract not found' };
    }

    if (existing.status !== 'matured') {
      showNotice('Only matured investment contracts are eligible for re-investment.', 'error');
      return { success: false, message: 'Contract has not matured yet.' };
    }

    const targetConfig = PLAN_CONFIGS[targetPlan];
    const targetCapitalRequired = targetConfig.capitalKsh * units;

    // Available capital from the matured contract:
    // User can deploy the matured capital + any unclaimed returns
    const maturedCapitalAvailable = existing.capitalInvested + existing.unclaimedReturns;
    const capitalDifference = targetCapitalRequired - maturedCapitalAvailable;

    if (capitalDifference > 0) {
      // Need extra cash from wallet
      if (walletBalance < capitalDifference) {
        showNotice(
          `Additional KSh ${capitalDifference.toLocaleString()} needed from wallet to re-invest into ${targetConfig.name}. Current wallet balance: KSh ${walletBalance.toLocaleString()}.`,
          'error'
        );
        return { success: false, message: 'Insufficient wallet balance for upgrade difference.' };
      }
      setWalletBalance((prev) => prev - capitalDifference);
    } else if (capitalDifference < 0) {
      // Surplus capital returned to wallet (e.g. from 20k Dubaj into 10k Habibi)
      const surplus = Math.abs(capitalDifference);
      setWalletBalance((prev) => prev + surplus);
    }

    // Mark previous contract as 'reinvested'
    const nowIso = new Date().toISOString();
    setPlanInvestments((prev) =>
      prev.map((inv) =>
        inv.id === contractId
          ? {
              ...inv,
              status: 'reinvested',
              unclaimedReturns: 0,
              reinvestedIntoPlan: targetPlan,
              reinvestedAt: nowIso,
            }
          : inv
      )
    );

    // Create the new active re-invested contract
    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setDate(startDate.getDate() + targetConfig.periodDays);
    const newContractNumber = `HDC-${getPlanCode(targetPlan)}-REINV-${Math.floor(10000 + Math.random() * 90000)}`;

    const associatedProperty = properties.find((p) => p.plan === targetPlan) || properties[0];

    const newReinvestedContract: UserPlanInvestment = {
      id: `inv-${Date.now()}`,
      contractNumber: newContractNumber,
      plan: targetPlan,
      planName: targetConfig.name,
      propertyTitle: associatedProperty?.title || `${targetConfig.name} Portfolio Holdings`,
      propertyId: associatedProperty.id,
      capitalInvested: targetCapitalRequired,
      units,
      dailyReturn: targetConfig.dailyReturnKsh * units,
      periodDays: targetConfig.periodDays,
      startDate: startDate.toISOString().split('T')[0],
      maturityDate: maturityDate.toISOString().split('T')[0],
      daysElapsed: 0,
      daysRemaining: targetConfig.periodDays,
      totalAccumulatedReturn: 0,
      claimedReturns: 0,
      unclaimedReturns: 0,
      status: 'active',
      reinvestCycle: (existing.reinvestCycle || 1) + 1,
    };

    setPlanInvestments((prev) => [newReinvestedContract, ...prev]);

    // Record Reinvestment Transaction
    const newTx: Transaction = {
      id: `tx-reinv-${Date.now()}`,
      type: 'reinvestment',
      title: `Re-invested Matured Contract ${existing.contractNumber} into ${targetConfig.name}`,
      amount: targetCapitalRequired,
      plan: targetPlan,
      contractId: newContractNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    setIsReinvestModalOpen(false);
    setSelectedContractForReinvest(null);

    showNotice(
      `Re-investment completed! Contract ${newContractNumber} is active under ${targetConfig.name} for ${targetConfig.periodDays} days at KSh ${targetConfig.dailyReturnKsh * units}/day.`,
      'success'
    );

    return { success: true, message: 'Re-investment successful' };
  };

  // --- CORE FEATURE 3: CLAIM DAILY RETURNS ---
  const claimDailyReturns = (contractId?: string) => {
    let totalClaimed = 0;

    setPlanInvestments((prev) =>
      prev.map((inv) => {
        if (!contractId || inv.id === contractId) {
          const claimable = inv.unclaimedReturns;
          if (claimable > 0) {
            totalClaimed += claimable;
            return {
              ...inv,
              claimedReturns: inv.claimedReturns + claimable,
              unclaimedReturns: 0,
            };
          }
        }
        return inv;
      })
    );

    if (totalClaimed > 0) {
      setWalletBalance((prev) => prev + totalClaimed);
      const newTx: Transaction = {
        id: `tx-claim-${Date.now()}`,
        type: 'daily_return',
        title: `Claimed Daily Returns to Wallet (${totalClaimed.toLocaleString()} KSh)`,
        amount: totalClaimed,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
      };
      setTransactions((prev) => [newTx, ...prev]);
      showNotice(`Successfully claimed KSh ${totalClaimed.toLocaleString()} into your Cash Wallet!`, 'success');
      return { success: true, message: 'Claim successful', amountClaimed: totalClaimed };
    } else {
      showNotice('No unclaimed daily returns available at this time.', 'info');
      return { success: false, message: 'Zero unclaimed returns', amountClaimed: 0 };
    }
  };

  // --- SIMULATION ACCELERATOR: ADVANCE DAYS TO DEMO MATURITY & REINVESTMENT ---
  const advanceSimulationDays = (days: number) => {
    let maturedCount = 0;
    let newReturnsAccrued = 0;

    setPlanInvestments((prev) =>
      prev.map((inv) => {
        if (inv.status === 'active') {
          const newDaysElapsed = Math.min(inv.periodDays, inv.daysElapsed + days);
          const daysAdded = newDaysElapsed - inv.daysElapsed;
          const additionalEarnings = daysAdded * inv.dailyReturn;
          const isNowMatured = newDaysElapsed >= inv.periodDays;

          if (isNowMatured) {
            maturedCount++;
          }
          newReturnsAccrued += additionalEarnings;

          return {
            ...inv,
            daysElapsed: newDaysElapsed,
            daysRemaining: Math.max(0, inv.periodDays - newDaysElapsed),
            totalAccumulatedReturn: inv.totalAccumulatedReturn + additionalEarnings,
            unclaimedReturns: inv.unclaimedReturns + additionalEarnings,
            status: isNowMatured ? 'matured' : 'active',
            maturedAt: isNowMatured ? new Date().toISOString() : inv.maturedAt,
          };
        }
        return inv;
      })
    );

    if (maturedCount > 0) {
      showNotice(
        `Fast-forwarded ${days} day(s). ${maturedCount} plan contract(s) reached MATURITY and are now ready for RE-INVESTMENT! Accrued +KSh ${newReturnsAccrued.toLocaleString()}.`,
        'success'
      );
    } else {
      showNotice(
        `Fast-forwarded ${days} day(s). Accrued +KSh ${newReturnsAccrued.toLocaleString()} in daily returns across your active plans.`,
        'info'
      );
    }
  };

  // --- DAILY TASKS SYSTEM LOGIC ---
  // A user watches two short inspirational, financial, motivational videos every day.
  // After the user has completed the task, that's when the daily return will be accumulated to the account,
  // and will wait for 24 hours for a new task.
  // Admin doesn't have to see who has accomplished the task and who doesn't because if a user skips a task,
  // the money won't reflect on the balance and if the 24 hour time frame is over, then the user loses
  // the daily return of that day and has to wait for a new task.

  const updateVideoWatchProgress = (videoId: string, progressPct: number) => {
    setDailyTaskState((prev) => {
      const clampedPct = Math.min(100, Math.max(0, Math.round(progressPct)));
      const isNowWatched = clampedPct >= 100;
      const updatedVideos = prev.videos.map((v) =>
        v.id === videoId
          ? {
              ...v,
              watchProgressPct: clampedPct,
              watched: isNowWatched || v.watched,
            }
          : v
      );

      const allWatched = updatedVideos.every((v) => v.watched);
      const nextStatus = allWatched
        ? 'in_progress'
        : prev.status === 'completed'
        ? 'completed'
        : prev.status === 'forfeited'
        ? 'forfeited'
        : 'pending';

      return {
        ...prev,
        videos: updatedVideos,
        status: nextStatus,
      };
    });
  };

  const completeVideoTask = (videoId: string) => {
    updateVideoWatchProgress(videoId, 100);
  };

  const claimDailyTaskReturn = () => {
    if (dailyTaskState.status === 'completed') {
      showNotice('You have already claimed today’s return! Please wait for the 24-hour cycle to complete.', 'info');
      return { success: false, message: 'Already completed for today', amountCredited: 0 };
    }

    if (dailyTaskState.status === 'forfeited') {
      showNotice('This task cycle has expired and today’s daily return was forfeited.', 'error');
      return { success: false, message: 'Task window expired and forfeited', amountCredited: 0 };
    }

    const allWatched = dailyTaskState.videos.every((v) => v.watched);
    if (!allWatched) {
      showNotice('Please finish watching both motivational videos before claiming your daily return.', 'error');
      return { success: false, message: 'Videos not yet finished', amountCredited: 0 };
    }

    const returnAmount = currentDailyReturnAvailableKsh;

    // Accumulate to Cash Wallet
    setWalletBalance((prev) => prev + returnAmount);

    // Record Transaction
    const taskTx: Transaction = {
      id: `tx-task-${Date.now()}`,
      type: 'daily_return',
      title: `Daily Motivational Task Completed: 2 Videos Watched (+KSh ${returnAmount.toLocaleString()})`,
      amount: returnAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setTransactions((prev) => [taskTx, ...prev]);

    // Advance active investment contracts' progress and accumulated returns
    setPlanInvestments((prev) =>
      prev.map((inv) => {
        if (inv.status === 'active') {
          const newDaysElapsed = Math.min(inv.periodDays, inv.daysElapsed + 1);
          const isMatured = newDaysElapsed >= inv.periodDays;
          return {
            ...inv,
            daysElapsed: newDaysElapsed,
            daysRemaining: Math.max(0, inv.periodDays - newDaysElapsed),
            totalAccumulatedReturn: inv.totalAccumulatedReturn + inv.dailyReturn,
            claimedReturns: inv.claimedReturns + inv.dailyReturn,
            status: isMatured ? 'matured' : 'active',
            maturedAt: isMatured ? new Date().toISOString() : inv.maturedAt,
          };
        }
        return inv;
      })
    );

    // Update Daily Task State to completed
    const completedAtIso = new Date().toISOString();
    setDailyTaskState((prev) => ({
      ...prev,
      status: 'completed',
      completedAt: completedAtIso,
      creditedAmountKsh: returnAmount,
      streakCount: prev.streakCount + 1,
      completedHistoryCount: prev.completedHistoryCount + 1,
    }));

    showNotice(
      `Daily Task Completed! +KSh ${returnAmount.toLocaleString()} accumulated into your balance. Next task unlocks in 24 hours!`,
      'success'
    );

    return { success: true, message: 'Daily return successfully accumulated', amountCredited: returnAmount };
  };

  const simulateForfeitDailyTask = () => {
    // Fast-forwards clock past 24-hour expiration window
    setDailyTaskState((prev) => ({
      ...prev,
      status: 'forfeited',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      streakCount: 0,
      forfeitCount: prev.forfeitCount + 1,
    }));
    showNotice(
      `[SIMULATION] 24-Hour Window Expired! Task marked as forfeited. No money accumulated. User must wait for the next 24-hour cycle.`,
      'error'
    );
  };

  const simulateNextDayTask = () => {
    const nextDay = dailyTaskState.dayIndex + 1;
    const nextState = generateDailyTaskState(
      nextDay,
      currentDailyReturnAvailableKsh,
      dailyTaskState.streakCount,
      dailyTaskState.forfeitCount,
      dailyTaskState.completedHistoryCount
    );
    setDailyTaskState(nextState);
    showNotice(
      `[SIMULATION] Advanced to Day ${nextDay} Task Cycle! 2 new motivational videos released with a fresh 24-hour window.`,
      'success'
    );
  };

  const resetTodayTask = () => {
    const freshState = generateDailyTaskState(
      dailyTaskState.dayIndex,
      currentDailyReturnAvailableKsh,
      dailyTaskState.streakCount,
      dailyTaskState.forfeitCount,
      dailyTaskState.completedHistoryCount
    );
    setDailyTaskState(freshState);
    showNotice(`Reset today's task to pending state for testing.`, 'info');
  };

  const investInProperty = (propertyId: string, shares: number) => {
    const prop = properties.find((p) => p.id === propertyId);
    if (!prop) return { success: false, message: 'Property not found' };
    return investInPlan(prop.plan, shares, prop.id);
  };

  const buySecondaryListing = (listingId: string) => {
    const listing = secondaryListings.find((l) => l.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    const totalCost = listing.shares * listing.askPricePerShare;
    if (walletBalance < totalCost) {
      showNotice(`Insufficient cash balance (KSh ${walletBalance.toLocaleString()}). Required: KSh ${totalCost.toLocaleString()}.`, 'error');
      return { success: false, message: 'Insufficient cash balance.' };
    }

    setWalletBalance((prev) => prev - totalCost);
    setSecondaryListings((prev) => prev.filter((l) => l.id !== listingId));

    const newTx: Transaction = {
      id: `tx-sec-${Date.now()}`,
      type: 'secondary_buy',
      title: `Secondary Market: Acquired ${listing.shares} units in [Plan ${listing.plan}]`,
      amount: totalCost,
      shares: listing.shares,
      sharePrice: listing.askPricePerShare,
      propertyId: listing.propertyId,
      plan: listing.plan,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showNotice(`Trade executed: Purchased ${listing.shares} units on secondary market at KSh ${listing.askPricePerShare.toLocaleString()}/unit.`, 'success');
    return { success: true, message: 'Secondary trade settled.' };
  };

  const listSharesForSale = (propertyId: string, shares: number, askPricePerShare: number) => {
    const holding = holdings.find((h) => h.propertyId === propertyId);
    if (!holding || holding.shares < shares) {
      showNotice('Insufficient share units in your holdings to list.', 'error');
      return { success: false, message: 'Insufficient units.' };
    }

    const newListing: SecondaryMarketListing = {
      id: `sec-${Date.now()}`,
      propertyId,
      plan: holding.plan,
      sellerId: 'current-user-uid',
      sellerAlias: 'David Kivunja (You)',
      shares,
      askPricePerShare,
      originalPrice: holding.averageCostPerShare,
      dateListed: new Date().toISOString().split('T')[0],
      yieldAtAsk: holding.plan === 'HABIBI' ? 18.0 : 18.0,
    };

    setSecondaryListings((prev) => [newListing, ...prev]);
    showNotice(`Order placed: Listed ${shares} units for sale at KSh ${askPricePerShare.toLocaleString()} each on secondary exchange.`, 'success');
    return { success: true, message: 'Listing published.' };
  };

  const depositFunds = (amount: number, method: string = 'M-Pesa STK Push') => {
    setWalletBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      type: 'deposit',
      title: `${method} Instant Deposit`,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);
    showNotice(`Deposit credited: KSh ${amount.toLocaleString()} received via ${method}. Available for investment.`, 'success');
  };

  const withdrawFunds = (
    amount: number, 
    mpesaNumber?: string,
    investorDetails?: { id?: string; name?: string; email?: string }
  ) => {
    // 12-Hour Cooldown check
    if (lastWithdrawalTimestamp) {
      const elapsed = Date.now() - lastWithdrawalTimestamp;
      if (elapsed < WITHDRAWAL_COOLDOWN_MS) {
        const remainingMs = WITHDRAWAL_COOLDOWN_MS - elapsed;
        const hoursLeft = Math.floor(remainingMs / (3600 * 1000));
        const minsLeft = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
        const noticeMsg = "The user will be allowed to withdraw again after 12 hours";
        showNotice(noticeMsg, 'error');
        return { 
          success: false, 
          message: `${noticeMsg}. (Cooldown active: ${hoursLeft}h ${minsLeft}m remaining)` 
        };
      }
    }

    if (amount <= 0 || amount > walletBalance) {
      showNotice('Invalid withdrawal amount requested. Insufficient wallet balance.', 'error');
      return { success: false, message: 'Invalid or insufficient funds.' };
    }

    const now = new Date();
    const targetMpesa = mpesaNumber || '+254 712 345 678';
    const allocatedExpected = new Date(now.getTime() + WITHDRAWAL_COOLDOWN_MS);

    // Deduct from wallet balance
    setWalletBalance((prev) => prev - amount);

    // Create pending withdrawal request
    const newPendingRequest: PendingWithdrawalRequest = {
      id: `wd-${Date.now()}`,
      withdrawalNumber: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
      investorId: investorDetails?.id || 'HDC-9102-INV',
      investorName: investorDetails?.name || 'David Kivunja',
      investorEmail: investorDetails?.email || 'davidkivunja4@gmail.com',
      mpesaNumber: targetMpesa,
      amountKsh: amount,
      requestedAt: now.toISOString(),
      allocatedAtExpected: allocatedExpected.toISOString(),
      status: 'pending',
    };

    setPendingWithdrawals((prev) => [newPendingRequest, ...prev]);

    // Record 12-hour cooldown timestamp
    const nowTime = Date.now();
    setLastWithdrawalTimestamp(nowTime);

    // Record in ledger
    const newTx: Transaction = {
      id: `tx-wd-${Date.now()}`,
      type: 'withdrawal',
      title: `Disbursed to M-Pesa (${targetMpesa}) - Pending Admin Grant (12h Allocation)`,
      amount,
      date: now.toISOString().split('T')[0],
      status: 'processing',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Notice text as strictly requested by user:
    const noticeString = "Your withdrawal will be allocated after 12 hours, the admin on the other side will receive pending withdrawals and after payment allocation, he'll grant the pending withdrawal success. The user will be allowed to withdraw again after 12 hours";
    showNotice(noticeString, 'info');

    return { 
      success: true, 
      message: noticeString,
      pendingWithdrawal: newPendingRequest 
    };
  };

  const grantWithdrawalSuccess = (
    withdrawalId: string, 
    adminActor: string = 'Super Admin (David Kivunja)',
    adminNotes?: string
  ) => {
    let targetWd: PendingWithdrawalRequest | undefined;

    setPendingWithdrawals((prev) =>
      prev.map((item) => {
        if (item.id === withdrawalId) {
          targetWd = {
            ...item,
            status: 'granted',
            grantedAt: new Date().toISOString(),
            grantedBy: adminActor,
            adminNotes: adminNotes || item.adminNotes || 'Payment allocation verified & disbursed via M-Pesa B2C',
          };
          return targetWd;
        }
        return item;
      })
    );

    // Mark matching transaction in ledger as completed with detailed allocation note
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.type === 'withdrawal' && tx.status === 'processing') {
          return {
            ...tx,
            status: 'completed',
            title: `M-Pesa Withdrawal Allocation Successful: KSh ${tx.amount.toLocaleString()} disbursed to M-Pesa`,
          };
        }
        return tx;
      })
    );

    const withdrawalNum = targetWd ? targetWd.withdrawalNumber : withdrawalId;
    const msg = `Withdrawal #${withdrawalNum} allocation successful! Access granted within 12-hour window and payment disbursed to M-Pesa.`;
    showNotice(msg, 'success');
    return { success: true, message: msg };
  };

  const fastForwardWithdrawalCooldown = () => {
    const pastTime = Date.now() - (WITHDRAWAL_COOLDOWN_MS + 5000);
    setLastWithdrawalTimestamp(pastTime);
    showNotice('Withdrawal cooldown fast-forwarded by 12 hours for testing. You can now withdraw again.', 'info');
  };

  const resetWithdrawalCooldown = () => {
    setLastWithdrawalTimestamp(null);
    showNotice('Withdrawal cooldown reset. You can withdraw immediately.', 'info');
  };

  const toggleDrip = () => {
    setDripEnabled((prev) => {
      const next = !prev;
      showNotice(
        next 
          ? 'Automated Dividend Reinvestment (DRIP) activated.' 
          : 'DRIP paused. Daily returns will accrue in your cash wallet.', 
        'info'
      );
      return next;
    });
  };

  const triggerManualDividendPayout = () => {
    claimDailyReturns();
  };

  return (
    <InvestmentContext.Provider
      value={{
        properties,
        holdings,
        planInvestments,
        subscriptionApplications,
        walletBalance,
        transactions,
        secondaryListings,
        historicalPerformance,
        dripEnabled,
        activeTab,
        selectedPropertyForDetail,
        selectedPropertyForInvest,
        selectedContractForReinvest,
        isReinvestModalOpen,
        activeCertificateHolding,
        isWalletModalOpen,
        notification,
        pendingWithdrawals,
        lastWithdrawalTimestamp,
        withdrawalCooldownRemainingMs,
        grantWithdrawalSuccess,
        fastForwardWithdrawalCooldown,
        resetWithdrawalCooldown,
        setActiveTab,
        setSelectedPropertyForDetail,
        setSelectedPropertyForInvest,
        setSelectedContractForReinvest,
        setIsReinvestModalOpen,
        setActiveCertificateHolding,
        setIsWalletModalOpen,
        investInPlan,
        submitSubscriptionApplication,
        submitReinvestmentRequest,
        acceptSubscriptionApplication,
        rejectSubscriptionApplication,
        reinvestContract,
        claimDailyReturns,
        advanceSimulationDays,
        investInProperty,
        buySecondaryListing,
        listSharesForSale,
        depositFunds,
        withdrawFunds,
        toggleDrip,
        triggerManualDividendPayout,
        dismissNotification,
        showNotice,
        setPlanInvestments,
        setSubscriptionApplications,
        activeSubscription,
        hasActiveSubscription,
        pendingSubscriptionApp,
        hasPendingSubscription,
        canSubscribeNewPlan,
        subscriptionLockReason,
        referrals,
        userReferralCode,
        totalReferralCommissionEarned,
        pendingReferralCommission,
        isReferralModalOpen,
        setIsReferralModalOpen,
        createReferralRecord,
        simulateReferralReward,
        dailyTaskState,
        currentDailyReturnAvailableKsh,
        updateVideoWatchProgress,
        completeVideoTask,
        claimDailyTaskReturn,
        simulateForfeitDailyTask,
        simulateNextDayTask,
        resetTodayTask,
        isZariOpen,
        setIsZariOpen,
        zariInitialPrompt,
        openZariWithPrompt,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
};
