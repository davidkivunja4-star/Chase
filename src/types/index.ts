export type InvestmentPlan = 'AL_FAKEER' | 'HABIBI' | 'DUBAJ' | 'HAMZA';

export interface PlanConfig {
  plan: InvestmentPlan;
  levelNumber: number | string; // 1, 2, 3, 'VIP 1'
  levelLabel: string;
  name: string;
  tagline: string;
  capitalKsh: number;         // 5,000 | 10,000 | 20,000 | 50,000
  dailyReturnKsh: number;     // 200 | 300 | 500 | 1,000
  periodDays: number;         // 60 | 60 | 72 | 70
  totalReturnKsh: number;     // 12,000 | 18,000 | 36,000 | 70,000
  totalPayoutKsh: number;     // capital + daily returns = 17,000 | 28,000 | 56,000 | 120,000
  roiPercentage: number;
  backingDescription: string;
  badge: string;
}

export const PLAN_CONFIGS: Record<InvestmentPlan, PlanConfig> = {
  AL_FAKEER: {
    plan: 'AL_FAKEER',
    levelNumber: 1,
    levelLabel: 'Level 1',
    name: 'Level 1 (Al-fakeer)',
    tagline: 'Accessible Entry Wealth Building · Consistent Daily Payouts',
    capitalKsh: 5000,
    dailyReturnKsh: 200,
    periodDays: 60,
    totalReturnKsh: 12000,
    totalPayoutKsh: 17000,
    roiPercentage: 140,
    backingDescription: 'Accessible entry-level wealth subscription generating steady 200 KSh daily returns for 60 consecutive days.',
    badge: 'Level 1 · 60-Day Cycle',
  },
  HABIBI: {
    plan: 'HABIBI',
    levelNumber: 2,
    levelLabel: 'Level 2',
    name: 'Level 2 (Habibi)',
    tagline: 'High-Yield Daily Cash Flow · Accelerated Capital Compounding',
    capitalKsh: 10000,
    dailyReturnKsh: 300,
    periodDays: 60,
    totalReturnKsh: 18000,
    totalPayoutKsh: 28000,
    roiPercentage: 180,
    backingDescription: 'High-velocity daily cash distribution generating 300 KSh daily returns for 60 consecutive days.',
    badge: 'Level 2 · 60-Day Cycle',
  },
  DUBAJ: {
    plan: 'DUBAJ',
    levelNumber: 3,
    levelLabel: 'Level 3',
    name: 'Level 3 (Dubaj)',
    tagline: 'Institutional Wealth Building · Extended High Yield Tenure',
    capitalKsh: 20000,
    dailyReturnKsh: 500,
    periodDays: 72,
    totalReturnKsh: 36000,
    totalPayoutKsh: 56000,
    roiPercentage: 180,
    backingDescription: 'Institutional capital growth tier generating 500 KSh daily returns for 72 consecutive days.',
    badge: 'Level 3 · 72-Day Cycle',
  },
  HAMZA: {
    plan: 'HAMZA',
    levelNumber: 'VIP 1',
    levelLabel: 'VIP 1',
    name: 'VIP 1 (Hamza)',
    tagline: 'Premier VIP Investment Tier · Maximum Daily Yield',
    capitalKsh: 50000,
    dailyReturnKsh: 1000,
    periodDays: 70,
    totalReturnKsh: 70000,
    totalPayoutKsh: 120000,
    roiPercentage: 140,
    backingDescription: 'Executive VIP tier for high-capital investors generating 1,000 KSh daily returns for 70 consecutive days.',
    badge: 'VIP Tier · 70-Day Cycle',
  },
};

export interface UserPlanInvestment {
  id: string;
  contractNumber: string;
  plan: InvestmentPlan;
  planName: string;
  propertyTitle?: string;
  propertyId?: string;
  capitalInvested: number;      // e.g. 10,000 KSh or 20,000 KSh
  units: number;                // number of packages (1, 2, 3...)
  dailyReturn: number;          // e.g. 300 KSh or 500 KSh
  periodDays: number;           // 60 or 72 days
  startDate: string;            // ISO date string
  maturityDate: string;         // ISO date string
  daysElapsed: number;          // e.g. 24
  daysRemaining: number;        // e.g. 36
  totalAccumulatedReturn: number; // e.g. 24 * 300 = 7,200 KSh
  claimedReturns: number;       // total withdrawn/credited to wallet
  unclaimedReturns: number;     // available to claim or reinvest
  status: 'active' | 'matured' | 'reinvested' | 'pending_reinvest';
  maturedAt?: string;
  reinvestedIntoPlan?: InvestmentPlan;
  reinvestedAt?: string;
  reinvestCycle: number;        // 1 for initial, 2 for second cycle, etc.
}

export type PropertyCategory = 'single_family' | 'vacation_rental' | 'multi_family' | 'commercial_lofts';

export interface PropertyFinancials {
  purchasePrice: number;
  renovations: number;
  reserveFund: number;
  closingFees: number;
  totalOffering: number;
  monthlyGrossRent: number;
  propertyManagementFeePct: number;
  maintenanceReservePct: number;
  insuranceAndTaxesMonthly: number;
  monthlyNetOperatingIncome: number;
  projectedAnnualCashDistribution: number;
}

export interface PropertyDocument {
  name: string;
  type: 'Offering Circular' | 'Appraisal Report' | 'Inspection & Title' | 'Operating Agreement';
  date: string;
  fileSize: string;
}

export interface Property {
  id: string;
  title: string;
  headline: string;
  plan: InvestmentPlan; // Strict Plan 1: HABIBI or Plan 2: DUBAJ
  address: string;
  city: string;
  state: string;
  category: PropertyCategory;
  categoryLabel: string;
  imageUrl: string;
  sharePrice: number; // In KSh (e.g. 10,000 or fractional units)
  totalShares: number;
  sharesRemaining: number;
  totalValuation: number; // In KSh
  projectedIRR: number;
  netRentalYield: number;
  projectedAppreciation: number;
  occupancyRate: number;
  status: 'funding' | 'nearly_funded' | 'funded';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  monthlyDividendPerShare: number;
  dailyReturnKsh: number;
  periodDays: number;
  leaseType: string;
  propertyManager: {
    name: string;
    experienceYears: number;
    unitsManaged: number;
    rating: number;
  };
  highlights: string[];
  financials: PropertyFinancials;
  documents: PropertyDocument[];
}

export interface UserHolding {
  propertyId: string;
  plan: InvestmentPlan;
  shares: number;
  averageCostPerShare: number;
  totalInvested: number;
  currentEstimatedValuation: number;
  purchaseDate: string;
  certificateId: string;
}

export interface Transaction {
  id: string;
  type: 'investment' | 'dividend' | 'deposit' | 'withdrawal' | 'secondary_sale' | 'secondary_buy' | 'reinvestment' | 'daily_return' | 'referral_bonus';
  title: string;
  amount: number; // In KSh
  shares?: number;
  sharePrice?: number;
  propertyId?: string;
  plan?: InvestmentPlan;
  contractId?: string;
  date: string;
  status: 'completed' | 'processing';
}

export interface SecondaryMarketListing {
  id: string;
  propertyId: string;
  plan: InvestmentPlan;
  sellerId: string;
  sellerAlias: string;
  shares: number;
  askPricePerShare: number; // In KSh
  originalPrice: number;
  dateListed: string;
  yieldAtAsk: number;
}

export interface HistoricalPerformancePoint {
  date: string;
  monthLabel: string;
  portfolioValue: number; // In KSh
  investedCapital: number;
  monthlyDividend: number;
  cumulativeDividends: number;
  netGain: number;
  returnPct: number;
}

// --- ADMIN SIDE INTERFACES ---
export interface AdminInvestorRecord {
  id: string;
  displayName: string;
  email: string;
  mobileNumber: string;
  memberId: string;
  accountTier: string;
  status: 'verified' | 'pending_kyc' | 'accredited';
  planPreference: InvestmentPlan | 'ALL' | 'BOTH';
  totalInvested: number; // In KSh
  walletBalance: number; // In KSh
  registeredDate: string;
  propertiesCount: number;
  activeContractsCount: number;
  maturedContractsCount: number;
}

export type SubscriptionRequestType = 'NEW_SUBSCRIPTION' | 'REINVESTMENT';

export interface PlanSubscriptionApplication {
  id: string;
  applicationNumber: string;
  requestType: SubscriptionRequestType;
  sourceContractId?: string;
  sourceContractNumber?: string;
  maturedCapitalDeployedKsh?: number;
  additionalCapitalPaidKsh?: number;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  plan: InvestmentPlan;
  planName: string;
  units: number;
  capitalKsh: number;
  dailyReturnKsh: number;
  periodDays: number;
  expectedTotalReturnKsh: number;
  expectedTotalPayoutKsh: number;
  paymentMethod: 'MPESA_STK' | 'WALLET' | 'MATURED_BALANCE' | 'BANK_TRANSFER';
  paymentReference: string;
  paymentConfirmed: boolean;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  propertyId?: string;
  propertyTitle?: string;
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  contractNumber?: string;
  referralCodeUsed?: string;
  referrerId?: string;
  referrerName?: string;
  referralCommissionKsh?: number;
  referralCommissionCredited?: boolean;
}

export interface NewApplicantRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  registeredAt: string;
  idNumberOrPass: string;
  country: string;
  preferredPlan: InvestmentPlan | 'ALL' | 'BOTH';
  kycStatus: 'pending_review' | 'verified' | 'accredited' | 'rejected';
  intendedCapitalKsh: number;
  source: 'Web Portal' | 'Mobile App' | 'Partner Referral' | 'Member Referral';
  notes?: string;
  joinedViaReferral?: boolean;
  referralCodeUsed?: string;
  referrerName?: string;
  referrerId?: string;
}

export interface InvestorPeriodReturnTracker {
  id: string;
  investorId: string;
  investorName: string;
  email: string;
  phoneNumber: string;
  contractNumber: string;
  plan: InvestmentPlan;
  planName: string;
  capitalInvestedKsh: number;
  dailyReturnKsh: number;
  periodDays: number; // 60, 72, or 70
  daysElapsed: number;
  daysRemaining: number;
  progressPercentage: number;
  startDate: string;
  maturityDate: string;
  totalAccruedReturnsKsh: number;
  claimedReturnsKsh: number;
  unclaimedReturnsKsh: number;
  projectedTotalReturnKsh: number;
  expectedTotalPayoutKsh: number;
  status: 'active' | 'matured' | 'reinvested';
  reinvestCycle: number;
}

export interface DividendBatchExecution {
  id: string;
  batchId: string;
  targetPlan: 'ALL' | InvestmentPlan;
  executedAt: string;
  executedBy: string;
  totalDisbursed: number; // In KSh
  propertiesIncluded: number;
  investorsBenefited: number;
  status: 'completed' | 'scheduled';
}

export interface AdminAuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'info' | 'success' | 'warning';
}

// --- USER ROLES & ACCESS CONTROL ---
export type UserRole = 'super_admin' | 'admin' | 'investor';
export type AdminApprovalStatus = 'not_applicable' | 'pending_approval' | 'approved' | 'declined';

export interface AdminAccessRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  departmentRole: string;
  justification: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'declined';
  reviewedAt?: string;
  reviewedBy?: string;
  declinedReason?: string;
}

export type InvestorActivationStatus = 'pending_plan_selection' | 'pending_payment_activation' | 'activated';

export interface RegisteredInvestorRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  registeredAt: string;
  memberId: string;
  selectedPlan?: InvestmentPlan;
  paymentPhone: string; // '0108689276'
  activationStatus: InvestorActivationStatus;
  activatedAt?: string;
  activatedBy?: string;
  planContractNumber?: string;
  referralCode?: string;
  referredByCode?: string;
}

export interface PendingWithdrawalRequest {
  id: string;
  withdrawalNumber: string;
  investorId: string;
  investorName: string;
  investorEmail: string;
  mpesaNumber: string;
  amountKsh: number;
  requestedAt: string; // ISO string
  allocatedAtExpected: string; // ISO string (+12 hours)
  status: 'pending' | 'granted' | 'declined';
  grantedAt?: string;
  grantedBy?: string;
  adminNotes?: string;
}

// --- 10% REFERRAL SYSTEM ---
export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referralCodeUsed: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  referredUserPhone: string;
  subscribedPlan?: InvestmentPlan;
  planName?: string;
  investedCapitalKsh: number;
  commissionPct: number; // 10%
  commissionKsh: number; // 10% of invested capital
  status: 'pending_subscription' | 'credited' | 'cancelled';
  createdAt: string;
  creditedAt?: string;
  contractNumber?: string;
  paymentReference?: string;
}

// --- DAILY TASKS SYSTEM ---
export interface DailyTaskVideo {
  id: string;
  title: string;
  speaker: string;
  category: 'Financial Discipline' | 'Wealth Mindset' | 'Motivation' | 'Capital Compounding';
  durationSeconds: number;
  summary: string;
  keyTakeaway: string;
  quote: string;
  thumbnailUrl: string;
  videoUrl?: string;
  watched: boolean;
  watchProgressPct: number; // 0 to 100
}

export type DailyTaskStatus = 'pending' | 'in_progress' | 'completed' | 'forfeited';

export interface DailyTaskState {
  cycleId: string;
  dayIndex: number;
  startedAt: string; // ISO string
  expiresAt: string; // ISO string (+24 hours from startedAt)
  completedAt?: string;
  status: DailyTaskStatus;
  videos: DailyTaskVideo[];
  dailyReturnKsh: number;
  creditedAmountKsh?: number;
  streakCount: number;
  forfeitCount: number;
  completedHistoryCount: number;
}
