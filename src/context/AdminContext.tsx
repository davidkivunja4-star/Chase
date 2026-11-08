import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AdminInvestorRecord, 
  DividendBatchExecution, 
  AdminAuditLogItem, 
  Property, 
  InvestmentPlan,
  PlanSubscriptionApplication,
  NewApplicantRecord,
  InvestorPeriodReturnTracker,
  AdminAccessRequest,
  PLAN_CONFIGS,
  PendingWithdrawalRequest
} from '../types';
import { 
  INITIAL_ADMIN_INVESTORS, 
  INITIAL_DIVIDEND_BATCHES, 
  INITIAL_AUDIT_LOGS,
  INITIAL_NEW_APPLICANTS,
  INITIAL_INVESTOR_TRACKERS,
  INITIAL_ADMIN_ACCESS_REQUESTS
} from '../data/mockAdminData';
import { useInvestment } from './InvestmentContext';

export type AdminTabType = 
  | 'overview' 
  | 'subscriptions' 
  | 'withdrawals'
  | 'applicants' 
  | 'tracking' 
  | 'staff_access'
  | 'properties' 
  | 'dividends' 
  | 'investors' 
  | 'audit';

interface AdminContextType {
  isAdminMode: boolean;
  adminTab: AdminTabType;
  investors: AdminInvestorRecord[];
  dividendBatches: DividendBatchExecution[];
  auditLogs: AdminAuditLogItem[];
  selectedPropertyForEdit: Property | null;
  isAddPropertyModalOpen: boolean;

  // Pending M-Pesa Withdrawals Queue
  pendingWithdrawals: PendingWithdrawalRequest[];
  grantPendingWithdrawal: (withdrawalId: string, adminNotes?: string) => { success: boolean; message: string };

  // New applicant and subscription tracking
  subscriptionApplications: PlanSubscriptionApplication[];
  newApplicants: NewApplicantRecord[];
  investorTrackers: InvestorPeriodReturnTracker[];
  adminAccessRequests: AdminAccessRequest[];

  // Actions
  setIsAdminMode: (mode: boolean) => void;
  setAdminTab: (tab: AdminTabType) => void;
  setSelectedPropertyForEdit: (property: Property | null) => void;
  setIsAddPropertyModalOpen: (open: boolean) => void;

  // Plan Subscription Acceptance & Management
  acceptPlanSubscription: (applicationId: string) => { success: boolean; message: string; contractNumber?: string };
  rejectPlanSubscription: (applicationId: string, reason?: string) => { success: boolean; message: string };
  
  // Super Admin Staff Management & Access Controls
  approveAdminRequest: (requestId: string) => { success: boolean; message: string };
  declineAdminRequest: (requestId: string, reason?: string) => { success: boolean; message: string };
  submitAdminAccessRequest: (data: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    departmentRole: string;
    justification: string;
  }) => { success: boolean; message: string };

  // Applicant KYC & Verification
  verifyApplicantKYC: (applicantId: string, status?: 'verified' | 'accredited' | 'rejected') => void;
  
  // Investor Period & Returns Tracking Controls
  advanceAllInvestorPeriods: (days: number) => { contractsUpdated: number; daysAdvanced: number; message: string };
  disburseDailyReturnsBatch: (targetPlan?: 'ALL' | InvestmentPlan) => { totalDisbursed: number; recipientCount: number; message: string };

  // Offering & Market Controls
  addPropertyOffering: (newProp: Omit<Property, 'id'>) => { success: boolean; message: string };
  updatePropertyOffering: (propertyId: string, updates: Partial<Property>) => { success: boolean; message: string };
  deletePropertyOffering: (propertyId: string) => { success: boolean; message: string };
  executeBatchDividendDisbursement: (targetPlan: 'ALL' | InvestmentPlan) => { success: boolean; message: string; amountDisbursed: number };
  verifyInvestorKYC: (investorId: string) => void;
  adjustInvestorBalance: (investorId: string, deltaAmount: number) => void;
  delistSecondaryOrder: (listingId: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_STORAGE_KEYS = {
  INVESTORS: 'hdchase_admin_investors_v4_zero',
  BATCHES: 'hdchase_admin_batches_v4_zero',
  AUDIT: 'hdchase_admin_audit_v4_zero',
  APPLICANTS: 'hdchase_admin_applicants_v4_zero',
  TRACKERS: 'hdchase_admin_trackers_v4_zero',
  ADMIN_REQUESTS: 'hdchase_admin_requests_v4_zero',
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    properties, 
    secondaryListings, 
    depositFunds,
    subscriptionApplications,
    acceptSubscriptionApplication,
    rejectSubscriptionApplication,
    advanceSimulationDays,
    pendingWithdrawals,
    grantWithdrawalSuccess,
  } = useInvestment();

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTabType>('overview');
  const [selectedPropertyForEdit, setSelectedPropertyForEdit] = useState<Property | null>(null);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState<boolean>(false);

  const [investors, setInvestors] = useState<AdminInvestorRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEYS.INVESTORS);
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_INVESTORS;
    } catch {
      return INITIAL_ADMIN_INVESTORS;
    }
  });

  const [newApplicants, setNewApplicants] = useState<NewApplicantRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEYS.APPLICANTS);
      return saved ? JSON.parse(saved) : INITIAL_NEW_APPLICANTS;
    } catch {
      return INITIAL_NEW_APPLICANTS;
    }
  });

  const [investorTrackers, setInvestorTrackers] = useState<InvestorPeriodReturnTracker[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEYS.TRACKERS);
      return saved ? JSON.parse(saved) : INITIAL_INVESTOR_TRACKERS;
    } catch {
      return INITIAL_INVESTOR_TRACKERS;
    }
  });

  const [dividendBatches, setDividendBatches] = useState<DividendBatchExecution[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEYS.BATCHES);
      return saved ? JSON.parse(saved) : INITIAL_DIVIDEND_BATCHES;
    } catch {
      return INITIAL_DIVIDEND_BATCHES;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEYS.AUDIT);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [adminAccessRequests, setAdminAccessRequests] = useState<AdminAccessRequest[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_ACCESS_REQUESTS;
    } catch {
      return INITIAL_ADMIN_ACCESS_REQUESTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.INVESTORS, JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.APPLICANTS, JSON.stringify(newApplicants));
  }, [newApplicants]);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.TRACKERS, JSON.stringify(investorTrackers));
  }, [investorTrackers]);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.BATCHES, JSON.stringify(dividendBatches));
  }, [dividendBatches]);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_REQUESTS, JSON.stringify(adminAccessRequests));
  }, [adminAccessRequests]);

  const addAuditLog = (action: string, details: string, severity: 'info' | 'success' | 'warning' = 'info') => {
    const newLog: AdminAuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      actor: 'Master Admin Operator (David Kivunja)',
      details,
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // --- SUPER ADMIN: APPROVE ADMIN ACCESS REQUEST ---
  const approveAdminRequest = (requestId: string) => {
    const req = adminAccessRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Admin request not found' };

    const updatedList = adminAccessRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Super Admin (David Kivunja)',
          }
        : r
    );

    setAdminAccessRequests(updatedList);
    localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_REQUESTS, JSON.stringify(updatedList));

    // Update active user profile in localStorage if matches this email
    try {
      const savedProfile = localStorage.getItem('hdchase_user_profile_v3');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.email?.toLowerCase() === req.email.toLowerCase()) {
          parsed.role = 'admin';
          parsed.adminStatus = 'approved';
          parsed.accountTier = `Approved Admin (${req.departmentRole})`;
          localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('Profile sync warning:', e);
    }

    addAuditLog(
      'ADMIN_PRIVILEGES_GRANTED',
      `Super Admin approved operator access for ${req.fullName} (${req.email}) as ${req.departmentRole}. Authorized to access administrative console.`,
      'success'
    );

    window.dispatchEvent(new CustomEvent('hdchase_admin_requests_updated'));
    window.dispatchEvent(new Event('storage'));

    return {
      success: true,
      message: `Admin access granted to ${req.fullName} (${req.departmentRole}). They are now authorized to view and operate the Admin Portal.`,
    };
  };

  // --- SUPER ADMIN: DECLINE ADMIN ACCESS REQUEST ---
  const declineAdminRequest = (requestId: string, reason: string = 'Administrative review declination') => {
    const req = adminAccessRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Admin request not found' };

    const updatedList = adminAccessRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'declined' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Super Admin (David Kivunja)',
            declinedReason: reason,
          }
        : r
    );

    setAdminAccessRequests(updatedList);
    localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_REQUESTS, JSON.stringify(updatedList));

    // Update active user profile in localStorage if matches this email
    try {
      const savedProfile = localStorage.getItem('hdchase_user_profile_v3');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.email?.toLowerCase() === req.email.toLowerCase()) {
          parsed.role = 'admin';
          parsed.adminStatus = 'declined';
          parsed.accountTier = `Declined Admin (${req.departmentRole})`;
          localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('Profile sync warning:', e);
    }

    addAuditLog(
      'ADMIN_PRIVILEGES_DECLINED',
      `Super Admin declined operator access for ${req.fullName} (${req.email}). Reason: ${reason}`,
      'warning'
    );

    window.dispatchEvent(new CustomEvent('hdchase_admin_requests_updated'));
    window.dispatchEvent(new Event('storage'));

    return {
      success: true,
      message: `Admin access request for ${req.fullName} declined. Access to Admin Portal prohibited.`,
    };
  };

  // --- SUBMIT NEW ADMIN ACCESS REQUEST ---
  const submitAdminAccessRequest = (data: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    departmentRole: string;
    justification: string;
  }) => {
    const newReq: AdminAccessRequest = {
      id: `req-adm-${Date.now()}`,
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      departmentRole: data.departmentRole,
      justification: data.justification,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    setAdminAccessRequests((prev) => [newReq, ...prev]);

    addAuditLog(
      'NEW_ADMIN_REQUEST_SUBMITTED',
      `New administrative access application submitted by ${data.fullName} (${data.email}) for role: ${data.departmentRole}. Awaiting Super Admin review.`,
      'info'
    );

    return {
      success: true,
      message: 'Admin access request transmitted to Super Admin David Kivunja for review.',
    };
  };

  // --- FEATURE 1: ACCEPT PLAN SUBSCRIPTION FROM USER ---
  const acceptPlanSubscription = (applicationId: string) => {
    const app = subscriptionApplications.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: 'Subscription application not found' };
    }

    const res = acceptSubscriptionApplication(applicationId);
    if (res.success && res.contractNumber) {
      const contractNumber = res.contractNumber;
      const startDate = new Date().toISOString().split('T')[0];
      const maturityDate = new Date();
      maturityDate.setDate(new Date().getDate() + app.periodDays);

      let cycleNum = 1;

      // If re-investment, mark source tracker as reinvested
      if (app.requestType === 'REINVESTMENT' && app.sourceContractNumber) {
        setInvestorTrackers((prev) =>
          prev.map((t) =>
            t.contractNumber === app.sourceContractNumber
              ? { ...t, status: 'reinvested' }
              : t
          )
        );
        const sourceTracker = investorTrackers.find((t) => t.contractNumber === app.sourceContractNumber);
        if (sourceTracker) {
          cycleNum = (sourceTracker.reinvestCycle || 1) + 1;
        }
      }

      // Create new tracker item in admin monitoring
      const newTracker: InvestorPeriodReturnTracker = {
        id: `track-${Date.now()}`,
        investorId: app.applicantId,
        investorName: app.applicantName,
        email: app.applicantEmail,
        phoneNumber: app.applicantPhone,
        contractNumber,
        plan: app.plan,
        planName: app.planName,
        capitalInvestedKsh: app.capitalKsh,
        dailyReturnKsh: app.dailyReturnKsh,
        periodDays: app.periodDays,
        daysElapsed: 0,
        daysRemaining: app.periodDays,
        progressPercentage: 0,
        startDate,
        maturityDate: maturityDate.toISOString().split('T')[0],
        totalAccruedReturnsKsh: 0,
        claimedReturnsKsh: 0,
        unclaimedReturnsKsh: 0,
        projectedTotalReturnKsh: app.expectedTotalReturnKsh,
        expectedTotalPayoutKsh: app.expectedTotalPayoutKsh,
        status: 'active',
        reinvestCycle: cycleNum,
      };

      setInvestorTrackers((prev) => [newTracker, ...prev]);

      // Update or ensure investor is represented in investor directory
      setInvestors((prev) => {
        const existing = prev.find((inv) => inv.email.toLowerCase() === app.applicantEmail.toLowerCase());
        if (existing) {
          return prev.map((inv) =>
            inv.id === existing.id
              ? {
                  ...inv,
                  totalInvested: inv.totalInvested + app.capitalKsh,
                  activeContractsCount: inv.activeContractsCount + 1,
                }
              : inv
          );
        } else {
          const newInvestor: AdminInvestorRecord = {
            id: app.applicantId,
            displayName: app.applicantName,
            email: app.applicantEmail,
            mobileNumber: app.applicantPhone,
            memberId: `HDC-${Math.floor(1000 + Math.random() * 9000)}-INVESTOR`,
            accountTier: 'Verified Private Investor',
            status: 'verified',
            planPreference: app.plan,
            totalInvested: app.capitalKsh,
            walletBalance: 0,
            registeredDate: new Date().toISOString().split('T')[0],
            propertiesCount: 1,
            activeContractsCount: 1,
            maturedContractsCount: 0,
          };
          return [newInvestor, ...prev];
        }
      });

      // Also activate matching record in registered investors and sync user profile
      try {
        const curReg = localStorage.getItem('hdchase_registered_investors_v1');
        if (curReg) {
          const regList = JSON.parse(curReg);
          const updatedReg = regList.map((r: any) =>
            r.email?.toLowerCase() === app.applicantEmail.toLowerCase() || r.id === app.applicantId
              ? { ...r, activationStatus: 'activated', activatedAt: new Date().toISOString(), selectedPlan: app.plan, activatedBy: 'David Kivunja' }
              : r
          );
          localStorage.setItem('hdchase_registered_investors_v1', JSON.stringify(updatedReg));
        }

        const curProf = localStorage.getItem('hdchase_user_profile_v3');
        if (curProf) {
          const prof = JSON.parse(curProf);
          if (prof.email?.toLowerCase() === app.applicantEmail.toLowerCase() || prof.uid === app.applicantId) {
            prof.accountTier = 'Verified Private Investor';
            prof.investorActivationStatus = 'activated';
            prof.isActivated = true;
            prof.selectedPlan = app.plan;
            localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(prof));
          }
        }
      } catch (e) {
        // ignore
      }

      window.dispatchEvent(new CustomEvent('hdchase_investor_activated'));
      window.dispatchEvent(new Event('storage'));

      addAuditLog(
        app.requestType === 'REINVESTMENT' ? 'REINVESTMENT_ACTIVATED' : 'SUBSCRIPTION_ACTIVATED',
        app.requestType === 'REINVESTMENT'
          ? `Confirmed payment & Activated Re-investment #${app.applicationNumber} for ${app.applicantName} from Contract #${app.sourceContractNumber}. Issued Contract ${contractNumber} under ${app.planName} (Cycle #${cycleNum}, KSh ${app.capitalKsh.toLocaleString()}, Daily: KSh ${app.dailyReturnKsh.toLocaleString()}).`
          : `Confirmed payment & Activated Subscription #${app.applicationNumber} for ${app.applicantName}. Issued Contract ${contractNumber} under ${app.planName} (KSh ${app.capitalKsh.toLocaleString()}, Daily: KSh ${app.dailyReturnKsh.toLocaleString()}, Period: ${app.periodDays} Days).`,
        'success'
      );

      return {
        success: true,
        message: app.requestType === 'REINVESTMENT'
          ? `Payment confirmed! Re-investment activated. Contract ${contractNumber} is live under ${app.planName}.`
          : `Payment confirmed! Plan subscription activated. Contract ${contractNumber} is live for ${app.applicantName}.`,
        contractNumber,
      };
    }

    return res;
  };

  const rejectPlanSubscription = (applicationId: string, reason: string = 'Regulatory or payment discrepancy declination') => {
    const app = subscriptionApplications.find((a) => a.id === applicationId);
    const res = rejectSubscriptionApplication(applicationId, reason);
    if (app) {
      addAuditLog(
        'SUBSCRIPTION_REJECTED',
        `Declined Plan Subscription #${app.applicationNumber} for ${app.applicantName}. Reason: ${reason}`,
        'warning'
      );
    }
    return res;
  };

  // --- FEATURE 2: VIEW & APPROVE NEW APPLICANTS ---
  const verifyApplicantKYC = (applicantId: string, status: 'verified' | 'accredited' | 'rejected' = 'verified') => {
    const applicant = newApplicants.find((a) => a.id === applicantId);
    if (!applicant) return;

    setNewApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId
          ? { ...app, kycStatus: status }
          : app
      )
    );

    if (status === 'verified' || status === 'accredited') {
      // Also ensure added to Investors Directory
      setInvestors((prev) => {
        const existing = prev.find((i) => i.email.toLowerCase() === applicant.email.toLowerCase());
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id
              ? { ...i, status: status === 'accredited' ? 'accredited' : 'verified' }
              : i
          );
        } else {
          const newInv: AdminInvestorRecord = {
            id: `inv-${Date.now()}`,
            displayName: applicant.fullName,
            email: applicant.email,
            mobileNumber: applicant.phoneNumber,
            memberId: `HDC-${Math.floor(1000 + Math.random() * 9000)}-MEMBER`,
            accountTier: status === 'accredited' ? 'H&D CHASE Private Client' : 'Verified Private Investor',
            status: status === 'accredited' ? 'accredited' : 'verified',
            planPreference: applicant.preferredPlan,
            totalInvested: 0,
            walletBalance: 0,
            registeredDate: applicant.registeredAt.split('T')[0],
            propertiesCount: 0,
            activeContractsCount: 0,
            maturedContractsCount: 0,
          };
          return [newInv, ...prev];
        }
      });
    }

    addAuditLog(
      'APPLICANT_KYC_UPDATED',
      `Updated KYC status for applicant ${applicant.fullName} (${applicant.phoneNumber}) to "${status.toUpperCase()}".`,
      status === 'rejected' ? 'warning' : 'success'
    );
  };

  // --- FEATURE 3: TRACK INVESTOR RETURNS AND PERIODS ---
  const advanceAllInvestorPeriods = (days: number) => {
    let maturedCount = 0;
    let totalYieldGenerated = 0;

    setInvestorTrackers((prev) =>
      prev.map((t) => {
        if (t.status === 'active') {
          const newElapsed = Math.min(t.periodDays, t.daysElapsed + days);
          const daysIncrement = newElapsed - t.daysElapsed;
          const additionalEarnings = daysIncrement * t.dailyReturnKsh;
          const isMatured = newElapsed >= t.periodDays;

          if (isMatured) {
            maturedCount++;
          }
          totalYieldGenerated += additionalEarnings;

          return {
            ...t,
            daysElapsed: newElapsed,
            daysRemaining: Math.max(0, t.periodDays - newElapsed),
            progressPercentage: Math.round((newElapsed / t.periodDays) * 100 * 10) / 10,
            totalAccruedReturnsKsh: t.totalAccruedReturnsKsh + additionalEarnings,
            unclaimedReturnsKsh: t.unclaimedReturnsKsh + additionalEarnings,
            status: isMatured ? 'matured' : 'active',
          };
        }
        return t;
      })
    );

    // Also sync the client's current active investments
    advanceSimulationDays(days);

    const message = `Advanced tracking timeline by ${days} day(s). Accrued KSh ${totalYieldGenerated.toLocaleString()} across active contracts. ${maturedCount > 0 ? `${maturedCount} contract(s) reached MATURITY and are ready for re-investment!` : ''}`;

    addAuditLog(
      'PERIODS_ADVANCED',
      `Advanced all investor contract timelines by ${days} day(s). Generated KSh ${totalYieldGenerated.toLocaleString()} in daily return accruals. ${maturedCount} matured.`,
      'success'
    );

    return {
      contractsUpdated: investorTrackers.filter((t) => t.status === 'active').length,
      daysAdvanced: days,
      message,
    };
  };

  const disburseDailyReturnsBatch = (targetPlan: 'ALL' | InvestmentPlan = 'ALL') => {
    let totalDisbursed = 0;
    let recipients = 0;

    setInvestorTrackers((prev) =>
      prev.map((t) => {
        if ((targetPlan === 'ALL' || t.plan === targetPlan) && t.unclaimedReturnsKsh > 0) {
          totalDisbursed += t.unclaimedReturnsKsh;
          recipients++;
          return {
            ...t,
            claimedReturnsKsh: t.claimedReturnsKsh + t.unclaimedReturnsKsh,
            unclaimedReturnsKsh: 0,
          };
        }
        return t;
      })
    );

    // Also credit investor wallet in context
    const planLabel = targetPlan === 'ALL' ? 'All Levels' : PLAN_CONFIGS[targetPlan]?.name || targetPlan;
    depositFunds(totalDisbursed > 0 ? totalDisbursed : 800, `Automated Daily Returns (${planLabel})`);

    const msg = `Disbursed KSh ${totalDisbursed.toLocaleString()} in accrued daily returns to ${recipients} active investor contracts under ${planLabel}.`;

    addAuditLog(
      'DAILY_RETURNS_DISBURSED',
      msg,
      'success'
    );

    return {
      totalDisbursed,
      recipientCount: recipients,
      message: msg,
    };
  };

  // Property & Market management
  const addPropertyOffering = (newPropData: Omit<Property, 'id'>) => {
    const newId = `prop-${newPropData.plan.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const fullProperty: Property = {
      ...newPropData,
      id: newId,
    };

    try {
      const currentProps = JSON.parse(localStorage.getItem('hdchase_properties_v3_ksh') || '[]');
      const updatedProps = [fullProperty, ...currentProps];
      localStorage.setItem('hdchase_properties_v3_ksh', JSON.stringify(updatedProps));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Error updating properties storage:', e);
    }

    addAuditLog('PROPERTY_OFFERING_CREATED', `Added new asset "${fullProperty.title}" under ${PLAN_CONFIGS[fullProperty.plan]?.name || fullProperty.plan} with valuation KSh ${fullProperty.totalValuation.toLocaleString()}`, 'success');
    setIsAddPropertyModalOpen(false);
    return { success: true, message: `Successfully listed ${fullProperty.title} under ${PLAN_CONFIGS[fullProperty.plan]?.name || fullProperty.plan}.` };
  };

  const updatePropertyOffering = (propertyId: string, updates: Partial<Property>) => {
    try {
      const currentProps: Property[] = JSON.parse(localStorage.getItem('hdchase_properties_v3_ksh') || '[]');
      const updatedProps = currentProps.map((p) => p.id === propertyId ? { ...p, ...updates } : p);
      localStorage.setItem('hdchase_properties_v3_ksh', JSON.stringify(updatedProps));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Error updating property:', e);
    }

    addAuditLog('PROPERTY_OFFERING_UPDATED', `Updated property ${propertyId} parameters`, 'info');
    setSelectedPropertyForEdit(null);
    return { success: true, message: 'Property offering updated successfully.' };
  };

  const deletePropertyOffering = (propertyId: string) => {
    try {
      const currentProps: Property[] = JSON.parse(localStorage.getItem('hdchase_properties_v3_ksh') || '[]');
      const filtered = currentProps.filter((p) => p.id !== propertyId);
      localStorage.setItem('hdchase_properties_v3_ksh', JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Error deleting property:', e);
    }

    addAuditLog('PROPERTY_OFFERING_ARCHIVED', `Archived property ${propertyId} from public offering catalog`, 'warning');
    return { success: true, message: 'Property archived from public catalog.' };
  };

  const executeBatchDividendDisbursement = (targetPlan: 'ALL' | InvestmentPlan) => {
    const targetProperties = properties.filter((p) => targetPlan === 'ALL' || p.plan === targetPlan);
    const totalDisbursed = targetProperties.reduce((sum, p) => sum + (p.financials.monthlyGrossRent * 0.65), 0);
    const roundedDisbursed = Math.round(totalDisbursed);

    const planDailyYield = targetPlan === 'ALL' 
      ? 1000 
      : (PLAN_CONFIGS[targetPlan]?.dailyReturnKsh || 300);
    const planLabel = targetPlan === 'ALL' ? 'All Levels' : PLAN_CONFIGS[targetPlan]?.name || targetPlan;
    depositFunds(planDailyYield, `Daily Payout Run (${planLabel})`);

    const newBatch: DividendBatchExecution = {
      id: `div-batch-${Date.now()}`,
      batchId: `BATCH-${new Date().toISOString().slice(0, 7).toUpperCase()}-${targetPlan}`,
      targetPlan,
      executedAt: new Date().toISOString(),
      executedBy: 'Master Admin Operator (David Kivunja)',
      totalDisbursed: roundedDisbursed,
      propertiesIncluded: targetProperties.length,
      investorsBenefited: investors.length + 142,
      status: 'completed',
    };

    setDividendBatches((prev) => [newBatch, ...prev]);

    setInvestors((prev) =>
      prev.map((inv) => {
        const bonus = (inv.planPreference && inv.planPreference !== 'ALL' && inv.planPreference !== 'BOTH' && PLAN_CONFIGS[inv.planPreference])
          ? PLAN_CONFIGS[inv.planPreference].dailyReturnKsh
          : 500;
        return {
          ...inv,
          walletBalance: inv.walletBalance + bonus,
        };
      })
    );

    addAuditLog(
      'DIVIDEND_BATCH_EXECUTED',
      `Disbursed KSh ${roundedDisbursed.toLocaleString()} across ${planLabel} to ${newBatch.investorsBenefited} shareholders.`,
      'success'
    );

    return { 
      success: true, 
      message: `Batch distribution completed: KSh ${roundedDisbursed.toLocaleString()} disbursed across Plan ${targetPlan}.`, 
      amountDisbursed: roundedDisbursed 
    };
  };

  const verifyInvestorKYC = (investorId: string) => {
    setInvestors((prev) =>
      prev.map((inv) =>
        inv.id === investorId
          ? { ...inv, status: 'accredited', accountTier: 'H&D CHASE Private Client' }
          : inv
      )
    );
    addAuditLog('KYC_STATUS_VERIFIED', `Investor ${investorId} accreditation approved`, 'success');
  };

  const adjustInvestorBalance = (investorId: string, deltaAmount: number) => {
    setInvestors((prev) =>
      prev.map((inv) =>
        inv.id === investorId
          ? { ...inv, walletBalance: Math.max(0, inv.walletBalance + deltaAmount) }
          : inv
      )
    );
    addAuditLog('INVESTOR_BALANCE_ADJUSTED', `Adjusted investor ${investorId} wallet by KSh ${deltaAmount.toLocaleString()}`, 'info');
  };

  const delistSecondaryOrder = (listingId: string) => {
    try {
      const currentListings = JSON.parse(localStorage.getItem('hdchase_secondary_v2') || '[]');
      const filtered = currentListings.filter((l: any) => l.id !== listingId);
      localStorage.setItem('hdchase_secondary_v2', JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Error delisting order:', e);
    }
    addAuditLog('SECONDARY_ORDER_DELISTED', `Delisted secondary order ${listingId}`, 'warning');
  };

  const grantPendingWithdrawal = (withdrawalId: string, adminNotes?: string) => {
    const wd = pendingWithdrawals.find((w) => w.id === withdrawalId);
    const res = grantWithdrawalSuccess(withdrawalId, 'Master Admin Operator (David Kivunja)', adminNotes);
    if (res.success) {
      addAuditLog(
        'PENDING_WITHDRAWAL_GRANTED',
        `Admin verified M-Pesa payment allocation and granted pending withdrawal #${wd?.withdrawalNumber || withdrawalId} (KSh ${wd?.amountKsh.toLocaleString() || '0'}) to M-Pesa recipient ${wd?.mpesaNumber || ''}. Withdrawal marked success.${adminNotes ? ` Note: ${adminNotes}` : ''}`,
        'success'
      );
    }
    return res;
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminMode,
        adminTab,
        investors,
        dividendBatches,
        auditLogs,
        selectedPropertyForEdit,
        isAddPropertyModalOpen,
        pendingWithdrawals,
        grantPendingWithdrawal,
        subscriptionApplications,
        newApplicants,
        investorTrackers,
        adminAccessRequests,
        setIsAdminMode,
        setAdminTab,
        setSelectedPropertyForEdit,
        setIsAddPropertyModalOpen,
        acceptPlanSubscription,
        rejectPlanSubscription,
        approveAdminRequest,
        declineAdminRequest,
        submitAdminAccessRequest,
        verifyApplicantKYC,
        advanceAllInvestorPeriods,
        disburseDailyReturnsBatch,
        addPropertyOffering,
        updatePropertyOffering,
        deletePropertyOffering,
        executeBatchDividendDisbursement,
        verifyInvestorKYC,
        adjustInvestorBalance,
        delistSecondaryOrder,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
