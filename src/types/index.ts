export type InvestmentPlan = 'AL_FAKEER' | 'HABIBI' | 'DUBAJ' | 'HAMZA' | 'PURPLE_ESTATE';

export interface PlanConfig {
  plan: InvestmentPlan;
  levelNumber: number | string; // 1, 2, 3, 'VIP 1', 'VIP Palace'
  levelLabel: string;
  name: string;
  boardProperty: string;        // Monopoly board property name e.g. "Mediterranean Avenue", "St. Charles Place", "Park Place", "Boardwalk"
  tagline: string;
  costCoins: number;            // 5,000, 10,000, 20,000, 50,000, 80,000 Chase Coins
  dailyReturnCoins: number;     // 200, 300, 500, 1,000, 1,300 Chase Coins / day
  periodDays: number;           // 60, 60, 72, 70, 100 days
  totalReturnCoins: number;     // 12,000, 18,000, 36,000, 70,000, 130,000
  totalPayoutCoins: number;     // cost + return
  roiPercentage: number;
  backingDescription: string;
  badge: string;
  isUnderConstruction?: boolean;
  colorScheme: {
    primary: string;
    bg: string;
    border: string;
    text: string;
    monopolyHeader: string;
  };
}

export const PLAN_CONFIGS: Record<InvestmentPlan, PlanConfig> = {
  AL_FAKEER: {
    plan: 'AL_FAKEER',
    levelNumber: 1,
    levelLabel: 'Brown District',
    boardProperty: 'Baltic & Mediterranean Ave',
    name: 'Level 1: Baltic Estate (Brown District)',
    tagline: 'Entry Monopoly District · Daily Rent Distributions',
    costCoins: 5000,
    dailyReturnCoins: 200,
    periodDays: 60,
    totalReturnCoins: 12000,
    totalPayoutCoins: 17000,
    roiPercentage: 240,
    backingDescription: 'Starter Monopoly street block generating 200 Chase Coins daily rent payouts from simulated tenants.',
    badge: 'Brown District · 60 Days',
    colorScheme: {
      primary: '#92400e',
      bg: 'bg-amber-900/10 dark:bg-amber-950/40',
      border: 'border-amber-700',
      text: 'text-amber-800 dark:text-amber-300',
      monopolyHeader: 'bg-amber-800',
    },
  },
  HABIBI: {
    plan: 'HABIBI',
    levelNumber: 2,
    levelLabel: 'Orange District',
    boardProperty: 'St. James & Tennessee Ave',
    name: 'Level 2: Habibi Towers (Orange District)',
    tagline: 'High-Traffic Commercial Plaza · Accelerated Coin Yields',
    costCoins: 10000,
    dailyReturnCoins: 300,
    periodDays: 60,
    totalReturnCoins: 18000,
    totalPayoutCoins: 28000,
    roiPercentage: 180,
    backingDescription: 'Prime orange avenue high-traffic hotel block producing 300 Chase Coins every 24 hours in play dividend.',
    badge: 'Orange District · 60 Days',
    colorScheme: {
      primary: '#ea580c',
      bg: 'bg-orange-500/10 dark:bg-orange-950/40',
      border: 'border-orange-500',
      text: 'text-orange-700 dark:text-orange-300',
      monopolyHeader: 'bg-orange-600',
    },
  },
  DUBAJ: {
    plan: 'DUBAJ',
    levelNumber: 3,
    levelLabel: 'Green District',
    boardProperty: 'Pennsylvania & Pacific Ave',
    name: 'Level 3: Dubaj Financial Skyscraper (Green District)',
    tagline: 'Prestige Financial District · Institutional Rent Payouts',
    costCoins: 20000,
    dailyReturnCoins: 500,
    periodDays: 72,
    totalReturnCoins: 36000,
    totalPayoutCoins: 56000,
    roiPercentage: 180,
    backingDescription: 'Sky-high glass towers generating 500 Chase Coins per game day from executive tenant conglomerates.',
    badge: 'Green District · 72 Days',
    colorScheme: {
      primary: '#16a34a',
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      border: 'border-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      monopolyHeader: 'bg-emerald-600',
    },
  },
  HAMZA: {
    plan: 'HAMZA',
    levelNumber: 'VIP Boardwalk',
    levelLabel: 'Blue District',
    boardProperty: 'Boardwalk & Park Place',
    name: 'VIP 1: Hamza Boardwalk Empire (Blue District)',
    tagline: 'Ultimate Monopoly Crown Jewel · Maximum Game Cashflow',
    costCoins: 50000,
    dailyReturnCoins: 1000,
    periodDays: 70,
    totalReturnCoins: 70000,
    totalPayoutCoins: 120000,
    roiPercentage: 140,
    backingDescription: 'The pinnacle of Monopoly luxury: Boardwalk luxury casino & penthouses yielding 1,000 Chase Coins daily.',
    badge: 'Dark Blue · 70 Days',
    colorScheme: {
      primary: '#2563eb',
      bg: 'bg-blue-500/10 dark:bg-blue-950/40',
      border: 'border-blue-600',
      text: 'text-blue-700 dark:text-blue-300',
      monopolyHeader: 'bg-blue-600',
    },
  },
  PURPLE_ESTATE: {
    plan: 'PURPLE_ESTATE',
    levelNumber: 'Under Construction',
    levelLabel: 'Purple District',
    boardProperty: 'States & Virginia Royal Plaza',
    name: 'VIP 2: Grand Royal Purple District',
    tagline: 'Under Construction · Elite Mega-District (No Purchase Allowed)',
    costCoins: 80000,
    dailyReturnCoins: 1300,
    periodDays: 100,
    totalReturnCoins: 130000,
    totalPayoutCoins: 210000,
    roiPercentage: 162.5,
    isUnderConstruction: true,
    backingDescription: 'Ultra-exclusive purple mega-district currently under architectural construction by Monopoly engineers. Strictly locked: No investor can purchase.',
    badge: 'Purple District · Under Construction 🚧',
    colorScheme: {
      primary: '#7e22ce',
      bg: 'bg-purple-500/10 dark:bg-purple-950/40',
      border: 'border-purple-600',
      text: 'text-purple-700 dark:text-purple-300',
      monopolyHeader: 'bg-purple-700',
    },
  },
};

export interface UserPlanInvestment {
  id: string;
  contractNumber: string;
  plan: InvestmentPlan;
  planName: string;
  boardProperty: string;
  capitalInvested: number;        // Chase Coins
  units: number;
  dailyReturn: number;            // Chase Coins / day
  periodDays: number;
  startDate: string;
  maturityDate: string;
  daysElapsed: number;
  daysRemaining: number;
  totalAccumulatedReturn: number; // Chase Coins
  claimedReturns: number;
  unclaimedReturns: number;
  status: 'active' | 'matured' | 'reinvested';
}

export type PropertyCategory = 'single_family' | 'vacation_rental' | 'multi_family' | 'commercial_lofts';

export interface Property {
  id: string;
  title: string;
  headline: string;
  plan: InvestmentPlan;
  boardTile: string;
  address: string;
  city: string;
  state: string;
  category: PropertyCategory;
  categoryLabel: string;
  imageUrl: string;
  sharePrice: number; // In Chase Coins
  totalShares: number;
  sharesRemaining: number;
  totalValuation: number; // In Chase Coins
  projectedIRR: number;
  dailyReturnCoins: number;
  periodDays: number;
  status: 'funding' | 'nearly_funded' | 'funded';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  highlights: string[];
}

export interface UserHolding {
  propertyId: string;
  plan: InvestmentPlan;
  shares: number;
  averageCostPerShare: number;
  totalInvested: number; // Chase Coins
  currentEstimatedValuation: number;
  purchaseDate: string;
  certificateId: string;
}

export interface Transaction {
  id: string;
  type: 'plan_purchase' | 'task_reward' | 'admin_grant' | 'dividend' | 'dice_bonus';
  title: string;
  amount: number; // Chase Coins
  date: string;
  status: 'completed';
}

// --- USER & PLAYER TYPES ---
export type PlayerStatus = 'pending' | 'activated' | 'suspended';

export interface PlayerRecord {
  id: string;
  name: string;
  username: string; // phone or chosen username
  phone: string;
  email: string;
  password?: string;
  chaseCoins: number;            // balance in Chase Coins
  status: PlayerStatus;
  initialGrantCoins: number;     // initial coins set by Game Master Admin
  role: 'player' | 'admin';
  avatar: string;                // Monopoly piece emoji e.g. 🎩 🚗 🐕 🚢 👞 🐱
  level: number;
  rank: number;
  tasksCompleted: number;
  activePlan?: InvestmentPlan;
  activePlanName?: string;
  joinedAt: string;
  activatedAt?: string;
  activatedBy?: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  avatar: string;
  chaseCoins: number;
  netWorth: number; // coins + plan asset valuation
  activePlanName?: string;
  tasksCompleted: number;
  status: PlayerStatus;
}

// --- DAILY GAMEPLAY TASKS ---
export interface DailyGameTask {
  id: string;
  title: string;
  description: string;
  category: 'Monopoly Quiz' | 'Property Inspection' | 'Tenant Roll-Call' | 'Dice Roll Challenge';
  rewardCoins: number;
  timeEstimate: string;
  iconName: string;
  isCompleted: boolean;
  question?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface DailyTaskState {
  dayIndex: number;
  lastCompletedDate?: string;
  streakCount: number;
  tasks: DailyGameTask[];
  totalRewardClaimedToday: number;
}

// --- LIVE CHAT SYSTEM ---
export interface ChatMessage {
  id?: string;
  username: string;
  message: string;
  isAdmin: boolean;
  timestamp: any; // Firestore serverTimestamp or Date/number/string
  avatar?: string;
  isSystem?: boolean;
}

