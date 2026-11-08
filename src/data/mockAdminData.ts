import { 
  AdminInvestorRecord, 
  DividendBatchExecution, 
  AdminAuditLogItem,
  PlanSubscriptionApplication,
  NewApplicantRecord,
  InvestorPeriodReturnTracker,
  AdminAccessRequest
} from '../types';

export const INITIAL_ADMIN_INVESTORS: AdminInvestorRecord[] = [
  {
    id: 'user-001',
    displayName: 'David Kivunja',
    email: 'davidkivunja4@gmail.com',
    mobileNumber: '+254 712 345 678',
    memberId: 'HDC-8942-ELITE',
    accountTier: 'H&D CHASE Private Client',
    status: 'accredited',
    planPreference: 'BOTH',
    totalInvested: 0,
    walletBalance: 0,
    registeredDate: '2026-05-10',
    propertiesCount: 0,
    activeContractsCount: 0,
    maturedContractsCount: 0,
  }
];

export const INITIAL_PLAN_APPLICATIONS: PlanSubscriptionApplication[] = [];

export const INITIAL_NEW_APPLICANTS: NewApplicantRecord[] = [];

export const INITIAL_INVESTOR_TRACKERS: InvestorPeriodReturnTracker[] = [];

export const INITIAL_DIVIDEND_BATCHES: DividendBatchExecution[] = [];

export const INITIAL_AUDIT_LOGS: AdminAuditLogItem[] = [];

export const INITIAL_ADMIN_ACCESS_REQUESTS: AdminAccessRequest[] = [];
