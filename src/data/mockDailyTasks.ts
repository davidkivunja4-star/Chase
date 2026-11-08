import { DailyTaskState, DailyTaskVideo } from '../types';

export const VIDEO_CATALOG: Omit<DailyTaskVideo, 'watched' | 'watchProgressPct'>[] = [
  {
    id: 'vid-001',
    title: 'The Psychology of Money: Building Disciplined Daily Wealth',
    speaker: 'Morgan Housel & Alex Hormozi',
    category: 'Financial Discipline',
    durationSeconds: 195, // 3 mins 15 secs
    summary: 'True wealth is not flashy cars or luxury watches—it is the cash flow and assets you do not see. Discover how daily financial discipline and patience turn small capital contributions into enduring financial freedom.',
    keyTakeaway: 'Live below your means, deploy daily capital into yielding assets, and let compounding do the heavy lifting.',
    quote: '"Doing well with money has a little to do with how smart you are and a lot to do with how you behave."',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'vid-002',
    title: 'Cash Flow Freedom: Owning Assets That Pay You Daily',
    speaker: 'Robert Kiyosaki & Ray Dalio',
    category: 'Capital Compounding',
    durationSeconds: 220, // 3 mins 40 secs
    summary: 'The difference between the wealthy and the middle class lies in cash flow velocity. Learn how high-yield contracts and fractional real estate contracts generate automated daily returns that cover lifestyle expenses.',
    keyTakeaway: 'Every shilling you invest is a tireless employee working 24/7 to return passive cash flow.',
    quote: '"Wealth is the ability to fully experience life. You acquire wealth by acquiring cash-flowing assets."',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'vid-003',
    title: 'The Dubai Blueprint: From Desert Sands to Global Capital Hub',
    speaker: 'Emaar Leadership & Urban Architects',
    category: 'Wealth Mindset',
    durationSeconds: 210, // 3 mins 30 secs
    summary: 'Explore how visionary leadership turned Dubai into an international beacon of luxury and real estate wealth. Understand how institutional-grade assets like Dubaj and Habibi tiers operate with strict yield governance.',
    keyTakeaway: 'Ambitious visions must be paired with structured execution and unyielding commitment to excellence.',
    quote: '"The race for excellence has no finish line. The future belongs to those who can imagine it and execute it."',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'vid-004',
    title: 'The 1% Daily Compounding Rule: Relentless Consistency',
    speaker: 'James Clear & Naval Ravikant',
    category: 'Motivation',
    durationSeconds: 180, // 3 mins 00 secs
    summary: 'A 1% improvement every day makes you 37 times better by year-end. In investment, consistent daily return collection and periodic re-investment creates exponential wealth acceleration that sporadic bets can never match.',
    keyTakeaway: 'Consistency triumphs over erratic intensity. Watch your daily videos, claim your returns, and re-invest upon maturity.',
    quote: '"You do not rise to the level of your goals. You fall to the level of your daily systems."',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
  {
    id: 'vid-005',
    title: 'Fractional Real Estate & Institutional Yield Sovereignty',
    speaker: 'Sam Zell & Platform Portfolio Managers',
    category: 'Capital Compounding',
    durationSeconds: 230, // 3 mins 50 secs
    summary: 'Why commercial and prime residential fractionalization Democratizes institutional returns for everyday retail investors. Learn how tenant leases guarantee regular payouts for Al-fakeer, Habibi, Dubaj, and Hamza holders.',
    keyTakeaway: 'Fractionalization eliminates landlord headaches while retaining 100% of the cash dividend benefits.',
    quote: '"Liquidity and consistent cash distributions are the crown jewels of modern property investment."',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
  {
    id: 'vid-006',
    title: 'Financial Resilience: Overcoming Scarcity with Wealth Systems',
    speaker: 'David Goggins & Brian Tracy',
    category: 'Motivation',
    durationSeconds: 190, // 3 mins 10 secs
    summary: 'Master your financial psychology. Break free from the cycle of living paycheck to paycheck by adhering strictly to a daily routine of financial education and structured savings.',
    keyTakeaway: 'Discipline equals financial freedom. Build the habit of daily engagement with your wealth accounts.',
    quote: '"Self-discipline is the master key to riches and personal sovereignty."',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
  }
];

export const generateDailyTaskState = (
  dayIndex: number = 1,
  dailyReturnKsh: number = 300,
  streakCount: number = 0,
  forfeitCount: number = 0,
  completedHistoryCount: number = 0
): DailyTaskState => {
  const videoIndex1 = ((dayIndex - 1) * 2) % VIDEO_CATALOG.length;
  const videoIndex2 = ((dayIndex - 1) * 2 + 1) % VIDEO_CATALOG.length;

  const v1 = VIDEO_CATALOG[videoIndex1];
  const v2 = VIDEO_CATALOG[videoIndex2];

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 24 hours

  return {
    cycleId: `task-cycle-day-${dayIndex}-${now.toISOString().split('T')[0]}`,
    dayIndex,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
    dailyReturnKsh,
    streakCount,
    forfeitCount,
    completedHistoryCount,
    videos: [
      {
        ...v1,
        id: `${v1.id}-d${dayIndex}`,
        watched: false,
        watchProgressPct: 0,
      },
      {
        ...v2,
        id: `${v2.id}-d${dayIndex}`,
        watched: false,
        watchProgressPct: 0,
      },
    ],
  };
};
