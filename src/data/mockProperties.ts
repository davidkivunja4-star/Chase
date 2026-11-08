import { 
  Property, 
  UserHolding, 
  Transaction, 
  SecondaryMarketListing, 
  HistoricalPerformancePoint,
  UserPlanInvestment 
} from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  // --- PLAN 1: HABIBI (Capital: 10,000 KSh · Daily Return: 300 KSh · Period: 60 Days) ---
  {
    id: 'prop-habibi-oasis',
    title: 'The Habibi Oasis Estate',
    headline: 'Ultra-Luxury Modern Desert Villa with Reflection Pool',
    plan: 'HABIBI',
    address: '8400 Arabian Dunes Boulevard',
    city: 'Scottsdale & Palm Corridor',
    state: 'AZ',
    category: 'vacation_rental',
    categoryLabel: 'Plan 1 · HABIBI Luxury Estate',
    imageUrl: '/src/assets/images/property_habibi_oasis_1792321199399.jpg',
    sharePrice: 10000, // 10,000 KSh per package
    totalShares: 1200,
    sharesRemaining: 245,
    totalValuation: 12000000, // 12M KSh
    projectedIRR: 18.0,
    netRentalYield: 18.0,
    projectedAppreciation: 5.5,
    occupancyRate: 94,
    status: 'funding',
    bedrooms: 6,
    bathrooms: 6.5,
    sqft: 5200,
    yearBuilt: 2023,
    monthlyDividendPerShare: 9000, // 300 KSh/day * 30 days
    dailyReturnKsh: 300,
    periodDays: 60,
    leaseType: 'Exclusive Luxury Vacation Managed by Habibi Hospitality',
    propertyManager: {
      name: 'Habibi Prime Asset Management',
      experienceYears: 15,
      unitsManaged: 520,
      rating: 4.98,
    },
    highlights: [
      'Capital: 10,000 KSh | Daily Return: 300 KSh | Period: 60 Days',
      'Total accumulated returns over 60 days: 18,000 KSh (180% return)',
      '100% full re-investment flexibility upon maturity into Habibi or Dubaj',
      'Private infinity pool, grand limestone colonnade, verified high seasonal ADRs'
    ],
    financials: {
      purchasePrice: 10500000,
      renovations: 450000,
      reserveFund: 650000,
      closingFees: 400000,
      totalOffering: 12000000,
      monthlyGrossRent: 1100000,
      propertyManagementFeePct: 12,
      maintenanceReservePct: 5,
      insuranceAndTaxesMonthly: 120000,
      monthlyNetOperatingIncome: 820000,
      projectedAnnualCashDistribution: 9840000,
    },
    documents: [
      { name: 'SEC / CMA Form 1-A Circular (Plan HABIBI)', type: 'Offering Circular', date: '2026-08-10', fileSize: '3.1 MB' },
      { name: 'Certified Short-Term Rental Pro-Forma Report', type: 'Appraisal Report', date: '2026-08-18', fileSize: '4.2 MB' },
      { name: 'Title Deed & Fractional Holding Guarantee', type: 'Inspection & Title', date: '2026-08-01', fileSize: '1.9 MB' },
      { name: 'Habibi Master Series LLC Operating Agreement', type: 'Operating Agreement', date: '2026-07-28', fileSize: '1.4 MB' },
    ]
  },
  {
    id: 'prop-miami-coastal',
    title: 'Biscayne Bay Luxury Retreat',
    headline: 'High-Yield Waterfront Vacation Villa with Deep-Water Pool',
    plan: 'HABIBI',
    address: '884 Venetian Way',
    city: 'Miami & Coastal Palms',
    state: 'FL',
    category: 'vacation_rental',
    categoryLabel: 'Plan 1 · HABIBI Luxury Estate',
    imageUrl: '/src/assets/images/property_miami_villa_1792320591155.jpg',
    sharePrice: 10000,
    totalShares: 980,
    sharesRemaining: 180,
    totalValuation: 9800000,
    projectedIRR: 18.0,
    netRentalYield: 18.0,
    projectedAppreciation: 6.2,
    occupancyRate: 91,
    status: 'funding',
    bedrooms: 5,
    bathrooms: 4.5,
    sqft: 3950,
    yearBuilt: 2022,
    monthlyDividendPerShare: 9000,
    dailyReturnKsh: 300,
    periodDays: 60,
    leaseType: 'Superhost Managed Short-Term / Luxury Hospitality',
    propertyManager: {
      name: 'AvantStay Hospitality Partners',
      experienceYears: 11,
      unitsManaged: 1450,
      rating: 4.95,
    },
    highlights: [
      'Capital: 10,000 KSh | Daily Return: 300 KSh | Period: 60 Days',
      'Total returns: 18,000 KSh across the 60-day investment tenure',
      'Direct canal access with private boat dock and infinity-edge pool',
      'Instant daily returns claimable to M-Pesa or Cash Wallet'
    ],
    financials: {
      purchasePrice: 8600000,
      renovations: 350000,
      reserveFund: 500000,
      closingFees: 350000,
      totalOffering: 9800000,
      monthlyGrossRent: 950000,
      propertyManagementFeePct: 12,
      maintenanceReservePct: 5,
      insuranceAndTaxesMonthly: 90000,
      monthlyNetOperatingIncome: 710000,
      projectedAnnualCashDistribution: 8520000,
    },
    documents: [
      { name: 'Venetian Bay Offering Memorandum (Plan HABIBI)', type: 'Offering Circular', date: '2026-07-15', fileSize: '2.8 MB' },
      { name: 'Comprehensive Property Due Diligence & Valuation', type: 'Appraisal Report', date: '2026-07-20', fileSize: '3.6 MB' },
      { name: 'Marine Dock & Structural Engineering Certificate', type: 'Inspection & Title', date: '2026-07-12', fileSize: '1.7 MB' },
    ]
  },

  // --- PLAN 2: DUBAJ (Capital: 20,000 KSh · Daily Return: 500 KSh · Period: 72 Days) ---
  {
    id: 'prop-dubaj-tower',
    title: 'The Dubaj Marina Skyline Tower',
    headline: 'High-Rise Architectural Landmark with Panoramic Marina Views',
    plan: 'DUBAJ',
    address: 'Marina Walk & Sheikh Zayed Heights',
    city: 'Dubai Marina & Skyline Hub',
    state: 'DXB',
    category: 'commercial_lofts',
    categoryLabel: 'Plan 2 · DUBAJ Signature Asset',
    imageUrl: '/src/assets/images/property_dubaj_tower_1792321199611.jpg',
    sharePrice: 20000, // 20,000 KSh per package
    totalShares: 1500,
    sharesRemaining: 210,
    totalValuation: 30000000, // 30M KSh
    projectedIRR: 18.0,
    netRentalYield: 18.0,
    projectedAppreciation: 7.2,
    occupancyRate: 97,
    status: 'funding',
    bedrooms: 4,
    bathrooms: 4.5,
    sqft: 4800,
    yearBuilt: 2024,
    monthlyDividendPerShare: 15000, // 500 KSh/day * 30 days
    dailyReturnKsh: 500,
    periodDays: 72,
    leaseType: 'Corporate Relocation & Multi-National Executive Long-Term Lease',
    propertyManager: {
      name: 'H&D Chase Global Asset Management',
      experienceYears: 18,
      unitsManaged: 2100,
      rating: 4.97,
    },
    highlights: [
      'Capital: 20,000 KSh | Daily Return: 500 KSh | Period: 72 Days',
      'Total accumulated returns over 72 days: 36,000 KSh (180% return)',
      'Unrestricted re-investment upon maturity into either Plan 1 (Habibi) or Plan 2 (Dubaj)',
      'Floor-to-ceiling glass, infinity sky pool, executive lounge, smart concierge'
    ],
    financials: {
      purchasePrice: 26500000,
      renovations: 800000,
      reserveFund: 1700000,
      closingFees: 1000000,
      totalOffering: 30000000,
      monthlyGrossRent: 2600000,
      propertyManagementFeePct: 10,
      maintenanceReservePct: 5,
      insuranceAndTaxesMonthly: 250000,
      monthlyNetOperatingIncome: 1950000,
      projectedAnnualCashDistribution: 23400000,
    },
    documents: [
      { name: 'SEC Form 1-A Qualified Offering Circular (Plan DUBAJ)', type: 'Offering Circular', date: '2026-09-01', fileSize: '4.8 MB' },
      { name: 'Independent Commercial Appraisal (Jones Lang LaSalle)', type: 'Appraisal Report', date: '2026-08-25', fileSize: '5.2 MB' },
      { name: 'Dubai Land Department Title Deed & Series LLC Filing', type: 'Inspection & Title', date: '2026-08-20', fileSize: '2.4 MB' },
      { name: 'Corporate Master Tenancy & Guarantee Agreement', type: 'Operating Agreement', date: '2026-08-15', fileSize: '2.1 MB' },
    ]
  },
  {
    id: 'prop-nashville-loft',
    title: 'The Foundry Historic Lofts',
    headline: 'Restored Industrial Residential Lofts in High-Growth Gulch Core',
    plan: 'DUBAJ',
    address: '904 12th Avenue South',
    city: 'Nashville & Urban Arts Quarter',
    state: 'TN',
    category: 'commercial_lofts',
    categoryLabel: 'Plan 2 · DUBAJ Signature Asset',
    imageUrl: '/src/assets/images/property_nashville_loft_1792320593026.jpg',
    sharePrice: 20000,
    totalShares: 900,
    sharesRemaining: 95,
    totalValuation: 18000000,
    projectedIRR: 18.0,
    netRentalYield: 18.0,
    projectedAppreciation: 6.0,
    occupancyRate: 98,
    status: 'nearly_funded',
    bedrooms: 8,
    bathrooms: 8,
    sqft: 6100,
    yearBuilt: 2021,
    monthlyDividendPerShare: 15000,
    dailyReturnKsh: 500,
    periodDays: 72,
    leaseType: 'Urban Creative Professional Long-Term Leases',
    propertyManager: {
      name: 'Urban Core Residential LLC',
      experienceYears: 14,
      unitsManaged: 820,
      rating: 4.88,
    },
    highlights: [
      'Capital: 20,000 KSh | Daily Return: 500 KSh | Period: 72 Days',
      'Total returns: 36,000 KSh earned over the 72-day term',
      'Re-invest upon completion into Plan 1 or Plan 2 with compound velocity',
      'High ceilings, exposed masonry, premium street-level boutique retail'
    ],
    financials: {
      purchasePrice: 15800000,
      renovations: 600000,
      reserveFund: 900000,
      closingFees: 700000,
      totalOffering: 18000000,
      monthlyGrossRent: 1550000,
      propertyManagementFeePct: 10,
      maintenanceReservePct: 5,
      insuranceAndTaxesMonthly: 160000,
      monthlyNetOperatingIncome: 1180000,
      projectedAnnualCashDistribution: 14160000,
    },
    documents: [
      { name: 'Foundry Lofts Circular (Plan DUBAJ)', type: 'Offering Circular', date: '2026-08-05', fileSize: '2.5 MB' },
      { name: 'Certified Commercial Property Appraisal', type: 'Appraisal Report', date: '2026-08-12', fileSize: '3.1 MB' },
      { name: 'Historic Renovation & Structural Inspection', type: 'Inspection & Title', date: '2026-08-02', fileSize: '1.8 MB' },
    ]
  }
];

export const INITIAL_PLAN_INVESTMENTS: UserPlanInvestment[] = [];

export const INITIAL_HOLDINGS: UserHolding[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SECONDARY_LISTINGS: SecondaryMarketListing[] = [];

export const INITIAL_HISTORICAL_PERFORMANCE: HistoricalPerformancePoint[] = [];

