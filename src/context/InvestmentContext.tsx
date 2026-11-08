import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  InvestmentPlan,
  PLAN_CONFIGS,
  UserPlanInvestment,
  Transaction,
  DailyTaskState,
  DailyGameTask,
  LeaderboardEntry
} from '../types';
import { useAuth } from './AuthContext';

const DEFAULT_GAME_TASKS: DailyGameTask[] = [
  {
    id: 'task-monopoly-1',
    title: 'Monopoly Property Inspection',
    description: 'Inspect your active properties on the board and collect utility rent from simulated commercial tenants.',
    category: 'Property Inspection',
    rewardCoins: 150,
    timeEstimate: '1 min',
    iconName: 'Building2',
    isCompleted: false,
    question: {
      prompt: 'In classic Monopoly rules, what happens when you own all properties of a single color district group?',
      options: [
        'You can build houses and collect double street rent',
        'You immediately win the whole game',
        'You must mortgage your properties to the bank',
        'Your rent is halved for other players'
      ],
      correctIndex: 0,
      explanation: 'Owning a complete color district grants a monopoly monopoly bonus, doubling unimproved rent and allowing house construction!'
    }
  },
  {
    id: 'task-monopoly-2',
    title: 'Community Chest Dice Roll',
    description: 'Roll the lucky Monopoly double dice to harvest play bonus Chase Coins for your wallet.',
    category: 'Dice Roll Challenge',
    rewardCoins: 200,
    timeEstimate: '30 sec',
    iconName: 'Dices',
    isCompleted: false,
  },
  {
    id: 'task-monopoly-3',
    title: 'Tycoon Capital Quiz',
    description: 'Test your Monopoly strategy: calculate compound return on Boardwalk vs Baltic Avenue investments.',
    category: 'Monopoly Quiz',
    rewardCoins: 250,
    timeEstimate: '2 min',
    iconName: 'Sparkles',
    isCompleted: false,
    question: {
      prompt: 'If you invest 5,000 Chase Coins into Brown District (Baltic Estate) generating 200 Coins/day rent for 60 days, what is your total return?',
      options: [
        '12,000 Chase Coins',
        '5,000 Chase Coins',
        '18,000 Chase Coins',
        '25,000 Chase Coins'
      ],
      correctIndex: 0,
      explanation: '200 Chase Coins/day × 60 days = 12,000 Chase Coins total play rent profit!'
    }
  },
  {
    id: 'task-monopoly-4',
    title: 'Tenant Roll-Call & Maintenance',
    description: 'Verify luxury suite elevators and audit play money rent collection ledgers.',
    category: 'Tenant Roll-Call',
    rewardCoins: 180,
    timeEstimate: '1 min',
    iconName: 'ShieldCheck',
    isCompleted: false,
  }
];

interface InvestmentContextType {
  activeTab: 'portfolio' | 'plans' | 'tasks' | 'leaderboard' | 'chat';
  setActiveTab: (tab: 'portfolio' | 'plans' | 'tasks' | 'leaderboard' | 'chat') => void;
  userInvestments: UserPlanInvestment[];
  activePlan: UserPlanInvestment | undefined;
  transactions: Transaction[];
  dailyTaskState: DailyTaskState;
  leaderboard: LeaderboardEntry[];
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  dismissNotification: () => void;
  showNotice: (message: string, type?: 'success' | 'info' | 'error') => void;
  // Plan Gameplay
  purchasePlanWithCoins: (planId: InvestmentPlan) => { success: boolean; message: string };
  completeMaturedDistrict: (investmentId?: string) => void;
  repurchasePreviousDistrict: () => { success: boolean; message: string };
  fastForwardToMaturity: (investmentId?: string) => void;
  maturedPlan: UserPlanInvestment | undefined;
  // Task Gameplay
  completeDailyGameTask: (taskId: string) => { success: boolean; message: string; coinsEarned: number };
  claimDailyPlanDividend: () => { success: boolean; message: string; coinsEarned: number };
  rollBonusDice: () => { success: boolean; message: string; diceTotal: number; bonusCoins: number };
  resetDailyTasksForTesting: () => void;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const InvestmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allPlayers, updateCurrentPlayerCoins, updateCurrentPlayerPlan, incrementCurrentPlayerTasks, isActivated } = useAuth();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'plans' | 'tasks' | 'leaderboard' | 'chat'>('portfolio');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Per-user investments storage key so each player has their own plan portfolio
  const userInvestKey = currentUser ? `hdchase_monopoly_investments_${currentUser.id}` : 'hdchase_monopoly_investments_guest';
  const userTransKey = currentUser ? `hdchase_monopoly_transactions_${currentUser.id}` : 'hdchase_monopoly_transactions_guest';
  const userTaskKey = currentUser ? `hdchase_monopoly_tasks_${currentUser.id}` : 'hdchase_monopoly_tasks_guest';

  const [userInvestments, setUserInvestments] = useState<UserPlanInvestment[]>(() => {
    try {
      const saved = localStorage.getItem(userInvestKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default plan if user already has an activePlan assigned in seed
    if (currentUser?.activePlan) {
      const cfg = PLAN_CONFIGS[currentUser.activePlan];
      return [{
        id: `plan-inv-${currentUser.id}-1`,
        contractNumber: `CHASE-${currentUser.activePlan.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
        plan: currentUser.activePlan,
        planName: cfg.name,
        boardProperty: cfg.boardProperty,
        capitalInvested: cfg.costCoins,
        units: 1,
        dailyReturn: cfg.dailyReturnCoins,
        periodDays: cfg.periodDays,
        startDate: '2026-11-01',
        maturityDate: '2026-12-15',
        daysElapsed: 7,
        daysRemaining: cfg.periodDays - 7,
        totalAccumulatedReturn: 7 * cfg.dailyReturnCoins,
        claimedReturns: 7 * cfg.dailyReturnCoins,
        unclaimedReturns: 0,
        status: 'active',
      }];
    }
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(userTransKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: `tx-init-1`,
        type: 'admin_grant',
        title: 'Game Master Starter Grant',
        amount: currentUser?.initialGrantCoins || 0,
        date: new Date().toLocaleDateString(),
        status: 'completed',
      }
    ];
  });

  const [dailyTaskState, setDailyTaskState] = useState<DailyTaskState>(() => {
    try {
      const saved = localStorage.getItem(userTaskKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      dayIndex: 1,
      streakCount: currentUser?.tasksCompleted ? Math.floor(currentUser.tasksCompleted / 2) : 1,
      tasks: DEFAULT_GAME_TASKS,
      totalRewardClaimedToday: 0,
    };
  });

  // Re-load per-user data when currentUser changes (switching account or logging in)
  useEffect(() => {
    if (!currentUser) {
      setUserInvestments([]);
      setTransactions([]);
      setDailyTaskState({
        dayIndex: 1,
        streakCount: 0,
        tasks: DEFAULT_GAME_TASKS,
        totalRewardClaimedToday: 0,
      });
      return;
    }

    try {
      const savedInvest = localStorage.getItem(`hdchase_monopoly_investments_${currentUser.id}`);
      if (savedInvest) {
        setUserInvestments(JSON.parse(savedInvest));
      } else if (currentUser.activePlan) {
        const cfg = PLAN_CONFIGS[currentUser.activePlan];
        setUserInvestments([{
          id: `plan-inv-${currentUser.id}-1`,
          contractNumber: `CHASE-${currentUser.activePlan.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
          plan: currentUser.activePlan,
          planName: cfg.name,
          boardProperty: cfg.boardProperty,
          capitalInvested: cfg.costCoins,
          units: 1,
          dailyReturn: cfg.dailyReturnCoins,
          periodDays: cfg.periodDays,
          startDate: '2026-11-01',
          maturityDate: '2026-12-15',
          daysElapsed: 7,
          daysRemaining: cfg.periodDays - 7,
          totalAccumulatedReturn: 7 * cfg.dailyReturnCoins,
          claimedReturns: 7 * cfg.dailyReturnCoins,
          unclaimedReturns: 0,
          status: 'active',
        }]);
      } else {
        setUserInvestments([]);
      }

      const savedTx = localStorage.getItem(`hdchase_monopoly_transactions_${currentUser.id}`);
      if (savedTx) {
        setTransactions(JSON.parse(savedTx));
      } else {
        setTransactions([
          {
            id: `tx-init-${currentUser.id}`,
            type: 'admin_grant',
            title: 'Game Master Play Money Grant',
            amount: currentUser.chaseCoins,
            date: new Date().toLocaleDateString(),
            status: 'completed',
          }
        ]);
      }

      const savedTasks = localStorage.getItem(`hdchase_monopoly_tasks_${currentUser.id}`);
      if (savedTasks) {
        setDailyTaskState(JSON.parse(savedTasks));
      } else {
        setDailyTaskState({
          dayIndex: 1,
          streakCount: Math.max(1, Math.floor((currentUser.tasksCompleted || 0) / 2)),
          tasks: DEFAULT_GAME_TASKS,
          totalRewardClaimedToday: 0,
        });
      }
    } catch {
      // fallback
    }
  }, [currentUser?.id]);

  // Persist user investments
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`hdchase_monopoly_investments_${currentUser.id}`, JSON.stringify(userInvestments));
    }
  }, [userInvestments, currentUser?.id]);

  // Persist user transactions
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`hdchase_monopoly_transactions_${currentUser.id}`, JSON.stringify(transactions));
    }
  }, [transactions, currentUser?.id]);

  // Persist daily tasks
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`hdchase_monopoly_tasks_${currentUser.id}`, JSON.stringify(dailyTaskState));
    }
  }, [dailyTaskState, currentUser?.id]);

  const showNotice = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
  };

  const dismissNotification = () => setNotification(null);

  const activePlan = userInvestments.find((i) => i.status === 'active' && i.daysRemaining > 0);
  const maturedPlan = userInvestments.find((i) => i.status === 'matured' || (i.status === 'active' && i.daysRemaining <= 0));

  // FEATURE: When days are over, complete contract and unlock slot for new purchase or re-purchase
  const completeMaturedDistrict = (investmentId?: string) => {
    const target = userInvestments.find((i) => i.id === (investmentId || (maturedPlan?.id ?? activePlan?.id)));
    if (!target) return;

    setUserInvestments((prev) =>
      prev.map((inv) =>
        inv.id === target.id
          ? { ...inv, status: 'matured', daysRemaining: 0, daysElapsed: inv.periodDays }
          : inv
      )
    );
    updateCurrentPlayerPlan(undefined, '');
    showNotice(`🎉 District contract completed! Your district slot is now open: you can request to purchase another district or re-purchase ${target.planName}!`, 'success');
  };

  // FEATURE: Re-purchase previous district when days are over
  const repurchasePreviousDistrict = () => {
    const previous = userInvestments[0];
    if (!previous) {
      showNotice('No previous district found to re-purchase.', 'info');
      return { success: false, message: 'No previous district' };
    }
    completeMaturedDistrict(previous.id);
    return purchasePlanWithCoins(previous.plan);
  };

  // FEATURE: Fast-forward to maturity so players and testers can simulate "when days are over"
  const fastForwardToMaturity = (investmentId?: string) => {
    const target = userInvestments.find((i) => i.id === (investmentId || activePlan?.id));
    if (!target) return;

    const remainingDays = Math.max(0, target.daysRemaining);
    const payout = remainingDays * target.dailyReturn;
    if (payout > 0) {
      updateCurrentPlayerCoins(payout);
    }

    setUserInvestments((prev) =>
      prev.map((inv) =>
        inv.id === target.id
          ? {
              ...inv,
              daysElapsed: inv.periodDays,
              daysRemaining: 0,
              totalAccumulatedReturn: inv.totalAccumulatedReturn + payout,
              claimedReturns: inv.claimedReturns + payout,
              status: 'matured',
            }
          : inv
      )
    );

    updateCurrentPlayerPlan(undefined, '');

    const newTx: Transaction = {
      id: `tx-mat-${Date.now()}`,
      type: 'dividend',
      title: `Contract Matured: ${target.planName} (${target.periodDays} Days Complete)`,
      amount: payout,
      date: new Date().toLocaleDateString(),
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showNotice(`🎉 All ${target.periodDays} days complete! +${payout.toLocaleString()} CC collected. You can now request to purchase another district or still purchase the one before!`, 'success');
  };

  // FEATURE 3 - GAMEPLAY: PURCHASE PLAN USING CHASE COINS ONLY
  const purchasePlanWithCoins = (planId: InvestmentPlan) => {
    if (!currentUser) {
      showNotice('Please log in or register an account to choose a Monopoly plan.', 'error');
      return { success: false, message: 'Not logged in' };
    }

    if (!isActivated) {
      showNotice('Your player account is pending activation by Game Master Admin. Please wait to be activated before choosing a plan.', 'error');
      return { success: false, message: 'Account pending activation' };
    }

    const config = PLAN_CONFIGS[planId];
    if (!config) {
      showNotice('Invalid property plan selected.', 'error');
      return { success: false, message: 'Invalid plan' };
    }

    // RULE: Purple district 80,000cc is under construction so no investor can purchase!
    if (config.isUnderConstruction) {
      showNotice('🚧 Purple District is currently under construction! No investor can purchase this district.', 'error');
      return { success: false, message: 'District under construction' };
    }

    // RULE: Each user is limited to one plan. When days are over, they can purchase another or re-purchase the same!
    const currentActive = userInvestments.find((i) => i.status === 'active' && i.daysRemaining > 0);
    if (currentActive) {
      showNotice(`Each user is limited to one plan! You already have an active district (${currentActive.planName}) with ${currentActive.daysRemaining} days remaining. Once the days are over, you can purchase another district or re-purchase the same one!`, 'error');
      return { success: false, message: 'Already have active plan' };
    }

    if (currentUser.chaseCoins < config.costCoins) {
      showNotice('Not enough Chase Coins', 'error');
      return { success: false, message: 'Not enough Chase Coins' };
    }

    // Archive previous matured plans
    setUserInvestments((prev) =>
      prev.map((inv) =>
        inv.status === 'active' && inv.daysRemaining <= 0
          ? { ...inv, status: 'matured' }
          : inv
      )
    );

    // Deduct Chase Coins
    updateCurrentPlayerCoins(-config.costCoins);

    const newInvestment: UserPlanInvestment = {
      id: `inv-${Date.now()}`,
      contractNumber: `CHASE-${planId.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      plan: planId,
      planName: config.name,
      boardProperty: config.boardProperty,
      capitalInvested: config.costCoins,
      units: 1,
      dailyReturn: config.dailyReturnCoins,
      periodDays: config.periodDays,
      startDate: new Date().toISOString().split('T')[0],
      maturityDate: new Date(Date.now() + config.periodDays * 86400000).toISOString().split('T')[0],
      daysElapsed: 0,
      daysRemaining: config.periodDays,
      totalAccumulatedReturn: 0,
      claimedReturns: 0,
      unclaimedReturns: 0,
      status: 'active',
    };

    setUserInvestments((prev) => [newInvestment, ...prev]);
    updateCurrentPlayerPlan(planId, config.name);

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'plan_purchase',
      title: `Monopoly Property Purchase: ${config.name}`,
      amount: config.costCoins,
      date: new Date().toLocaleDateString(),
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showNotice(`🎉 Congratulations! You acquired ${config.name} (${config.boardProperty}) for ${config.costCoins.toLocaleString()} Chase Coins! You will collect ${config.dailyReturnCoins} CC daily rent for ${config.periodDays} days!`, 'success');
    return { success: true, message: 'Plan purchased successfully' };
  };

  // FEATURE 3 - GAMEPLAY: DO TASKS TO EARN CHASE COINS
  const completeDailyGameTask = (taskId: string) => {
    if (!currentUser) {
      showNotice('Please log in to complete tasks and earn Chase Coins.', 'error');
      return { success: false, message: 'Not logged in', coinsEarned: 0 };
    }

    const target = dailyTaskState.tasks.find((t) => t.id === taskId);
    if (!target) return { success: false, message: 'Task not found', coinsEarned: 0 };
    if (target.isCompleted) {
      showNotice('You have already completed this Monopoly task today!', 'info');
      return { success: false, message: 'Task already completed', coinsEarned: 0 };
    }

    // Award Chase Coins
    updateCurrentPlayerCoins(target.rewardCoins);
    incrementCurrentPlayerTasks();

    // Mark task completed
    setDailyTaskState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t)),
      totalRewardClaimedToday: prev.totalRewardClaimedToday + target.rewardCoins,
    }));

    // Record transaction
    const newTx: Transaction = {
      id: `tx-task-${Date.now()}`,
      type: 'task_reward',
      title: `Task Reward: ${target.title}`,
      amount: target.rewardCoins,
      date: new Date().toLocaleDateString(),
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showNotice(`⭐ Task Complete! You collected +${target.rewardCoins} Chase Coins! Keep climbing the Monopoly Leaderboard!`, 'success');
    return { success: true, message: 'Task completed', coinsEarned: target.rewardCoins };
  };

  const claimDailyPlanDividend = () => {
    const currentActive = userInvestments.find((i) => i.status === 'active' && i.daysRemaining > 0);
    if (!currentActive) {
      showNotice('You have no active Monopoly district plan collecting rent.', 'error');
      return { success: false, message: 'No active plan', coinsEarned: 0 };
    }

    const dividendCoins = currentActive.dailyReturn;
    updateCurrentPlayerCoins(dividendCoins);

    const nextDaysRemaining = Math.max(0, currentActive.daysRemaining - 1);
    const nextDaysElapsed = currentActive.daysElapsed + 1;
    const isNowMatured = nextDaysRemaining === 0;

    setUserInvestments((prev) =>
      prev.map((inv) =>
        inv.id === currentActive.id
          ? {
              ...inv,
              daysElapsed: nextDaysElapsed,
              daysRemaining: nextDaysRemaining,
              totalAccumulatedReturn: inv.totalAccumulatedReturn + dividendCoins,
              claimedReturns: inv.claimedReturns + dividendCoins,
              status: isNowMatured ? 'matured' : 'active',
            }
          : inv
      )
    );

    if (isNowMatured) {
      updateCurrentPlayerPlan(undefined, '');
    }

    const newTx: Transaction = {
      id: `tx-div-${Date.now()}`,
      type: 'dividend',
      title: `Daily Property Rent: ${currentActive.planName}${isNowMatured ? ' (Contract Matured)' : ''}`,
      amount: dividendCoins,
      date: new Date().toLocaleDateString(),
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (isNowMatured) {
      showNotice(`🎉 Rent Collected! +${dividendCoins} CC. All ${currentActive.periodDays} days are completed! You can now make a request to purchase another district or still purchase the one before!`, 'success');
    } else {
      showNotice(`💰 Rent Collected! +${dividendCoins} Chase Coins credited from your ${currentActive.boardProperty} tenants! (${nextDaysRemaining} days remaining)`, 'success');
    }
    return { success: true, message: 'Rent claimed', coinsEarned: dividendCoins };
  };

  const rollBonusDice = () => {
    if (!currentUser) return { success: false, message: 'Log in first', diceTotal: 0, bonusCoins: 0 };
    const die1 = Math.floor(1 + Math.random() * 6);
    const die2 = Math.floor(1 + Math.random() * 6);
    const total = die1 + die2;
    const isDouble = die1 === die2;
    const multiplier = isDouble ? 25 : 15;
    const bonus = total * multiplier;

    updateCurrentPlayerCoins(bonus);

    const newTx: Transaction = {
      id: `tx-dice-${Date.now()}`,
      type: 'dice_bonus',
      title: `Lucky Dice Roll (${die1} + ${die2} = ${total})${isDouble ? ' [DOUBLES BONUS!]' : ''}`,
      amount: bonus,
      date: new Date().toLocaleDateString(),
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showNotice(`🎲 You rolled a ${die1} & ${die2} (Total: ${total})${isDouble ? ' — DOUBLES!' : ''}! Won +${bonus} Chase Coins!`, 'success');
    return { success: true, message: 'Dice rolled', diceTotal: total, bonusCoins: bonus };
  };

  const resetDailyTasksForTesting = () => {
    setDailyTaskState({
      dayIndex: dailyTaskState.dayIndex + 1,
      streakCount: dailyTaskState.streakCount + 1,
      tasks: DEFAULT_GAME_TASKS.map((t) => ({ ...t, isCompleted: false })),
      totalRewardClaimedToday: 0,
    });
    showNotice('🔄 Monopoly Daily Tasks reset for another round of play testing!', 'info');
  };

  // FEATURE 3 - LEADERBOARD: RANK ALL PLAYERS BY CHASE COINS & NET WORTH
  const leaderboard: LeaderboardEntry[] = allPlayers
    .map((player) => {
      // Calculate net worth = coins + any active plan cost
      const planConfig = player.activePlan ? PLAN_CONFIGS[player.activePlan] : null;
      const assetValue = planConfig ? planConfig.costCoins : 0;
      const netWorth = player.chaseCoins + assetValue;

      return {
        rank: 0,
        playerId: player.id,
        name: player.name,
        avatar: player.avatar || '🎲',
        chaseCoins: player.chaseCoins,
        netWorth: netWorth,
        activePlanName: player.activePlanName || (planConfig ? planConfig.name : undefined),
        tasksCompleted: player.tasksCompleted || 0,
        status: player.status,
      };
    })
    .sort((a, b) => b.chaseCoins - a.chaseCoins)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return (
    <InvestmentContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userInvestments,
        activePlan,
        transactions,
        dailyTaskState,
        leaderboard,
        notification,
        dismissNotification,
        showNotice,
        purchasePlanWithCoins,
        completeMaturedDistrict,
        repurchasePreviousDistrict,
        fastForwardToMaturity,
        maturedPlan,
        completeDailyGameTask,
        claimDailyPlanDividend,
        rollBonusDice,
        resetDailyTasksForTesting,
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
