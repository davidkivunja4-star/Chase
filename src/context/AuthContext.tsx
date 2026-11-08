import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerRecord, PlayerStatus } from '../types';

export const ADMIN_USERNAME = 'gamechanger';
export const ALT_ADMIN_USERNAME = 'davidkivunja';
export const ADMIN_EMAIL = 'davidkivunja4@gmail.com';

const PLAYERS_STORAGE_KEY = 'hdchase_monopoly_players_v1';
const CURRENT_PLAYER_KEY = 'hdchase_monopoly_current_player_v1';

// Seed demo players for vibrant multiplayer leaderboard & pending queue
const DEFAULT_INITIAL_PLAYERS: PlayerRecord[] = [
  {
    id: 'admin-david-01',
    name: 'Game Master (David)',
    username: 'gamechanger',
    phone: '0712345678',
    email: 'davidkivunja4@gmail.com',
    password: 'admin',
    chaseCoins: 25000,
    status: 'activated',
    initialGrantCoins: 25000,
    role: 'admin',
    avatar: '👑',
    level: 10,
    rank: 1,
    tasksCompleted: 42,
    activePlan: 'HAMZA',
    activePlanName: 'VIP 1: Hamza Boardwalk Empire',
    joinedAt: '2026-10-01T08:00:00Z',
    activatedAt: '2026-10-01T08:00:00Z',
    activatedBy: 'System',
  },
  {
    id: 'player-brian-02',
    name: 'Brian Ochieng',
    username: 'brian_tycoon',
    phone: '0722334455',
    email: 'brian@monopoly.game',
    password: 'password123',
    chaseCoins: 12400,
    status: 'activated',
    initialGrantCoins: 1000,
    role: 'player',
    avatar: '🚗',
    level: 6,
    rank: 2,
    tasksCompleted: 28,
    activePlan: 'DUBAJ',
    activePlanName: 'Level 3: Dubaj Financial Skyscraper',
    joinedAt: '2026-10-15T12:00:00Z',
    activatedAt: '2026-10-15T12:30:00Z',
    activatedBy: 'davidkivunja',
  },
  {
    id: 'player-sarah-03',
    name: 'Sarah Kamau',
    username: 'sarah_boardwalk',
    phone: '0733445566',
    email: 'sarah@monopoly.game',
    password: 'password123',
    chaseCoins: 7800,
    status: 'activated',
    initialGrantCoins: 500,
    role: 'player',
    avatar: '🐕',
    level: 4,
    rank: 3,
    tasksCompleted: 19,
    activePlan: 'HABIBI',
    activePlanName: 'Level 2: Habibi Towers',
    joinedAt: '2026-10-22T09:15:00Z',
    activatedAt: '2026-10-22T09:45:00Z',
    activatedBy: 'davidkivunja',
  },
  {
    id: 'player-kevin-04',
    name: 'Kevin Mutua',
    username: 'kevin_dice',
    phone: '0744556677',
    email: 'kevin@monopoly.game',
    password: 'password123',
    chaseCoins: 3100,
    status: 'activated',
    initialGrantCoins: 200,
    role: 'player',
    avatar: '🚢',
    level: 3,
    rank: 4,
    tasksCompleted: 11,
    activePlan: 'AL_FAKEER',
    activePlanName: 'Level 1: Baltic Estate',
    joinedAt: '2026-11-01T14:20:00Z',
    activatedAt: '2026-11-01T15:00:00Z',
    activatedBy: 'davidkivunja',
  },
  // Pending player awaiting Game Master Admin review & coin assignment
  {
    id: 'player-lucy-05',
    name: 'Lucy Mwangi',
    username: 'lucy_tycoon',
    phone: '0799887766',
    email: 'lucy@monopoly.game',
    password: 'password123',
    chaseCoins: 0,
    status: 'pending',
    initialGrantCoins: 0,
    role: 'player',
    avatar: '👞',
    level: 1,
    rank: 5,
    tasksCompleted: 0,
    joinedAt: '2026-11-07T18:40:00Z',
  },
  {
    id: 'player-hassan-06',
    name: 'Hassan Ali',
    username: 'hassan_board',
    phone: '0711223344',
    email: 'hassan@monopoly.game',
    password: 'password123',
    chaseCoins: 0,
    status: 'pending',
    initialGrantCoins: 0,
    role: 'player',
    avatar: '🐱',
    level: 1,
    rank: 6,
    tasksCompleted: 0,
    joinedAt: '2026-11-08T01:10:00Z',
  },
];

interface AuthContextType {
  currentUser: PlayerRecord | null;
  allPlayers: PlayerRecord[];
  isGameMaster: boolean;
  isActivated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  registerPlayer: (
    name: string,
    phone: string,
    password: string,
    avatar?: string
  ) => { success: boolean; error?: string; player?: PlayerRecord };
  loginPlayer: (
    identifier: string, // phone or username or name
    password: string
  ) => { success: boolean; error?: string; player?: PlayerRecord };
  logoutPlayer: () => void;
  switchPlayerForDemo: (playerId: string) => void;
  // Game Master Admin actions
  activatePlayerWithCoins: (
    playerId: string,
    coinsToGrant: number
  ) => { success: boolean; message: string };
  updatePlayerCoins: (
    playerId: string,
    newBalance: number,
    reason?: string
  ) => { success: boolean; message: string };
  suspendPlayer: (playerId: string) => { success: boolean; message: string };
  updateCurrentPlayerCoins: (delta: number) => void;
  updateCurrentPlayerPlan: (planId: any, planName: string) => void;
  incrementCurrentPlayerTasks: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allPlayers, setAllPlayers] = useState<PlayerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PLAYERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_INITIAL_PLAYERS;
  });

  const [currentUser, setCurrentUser] = useState<PlayerRecord | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_PLAYER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // By default, start with a regular demo player (Brian) or null if logged out.
    // We start as Brian so the user immediately sees a personal player dashboard (NOT David),
    // or they can click Register/Login or switch to Game Master David!
    return DEFAULT_INITIAL_PLAYERS[1]; // Brian Ochieng (Regular player)
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Sync all players to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(allPlayers));
    } catch {
      // ignore
    }
  }, [allPlayers]);

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_PLAYER_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Keep currentUser in sync if allPlayers gets updated (e.g. by Game Master activation)
  useEffect(() => {
    if (currentUser) {
      const updated = allPlayers.find((p) => p.id === currentUser.id);
      if (updated && (
        updated.chaseCoins !== currentUser.chaseCoins ||
        updated.status !== currentUser.status ||
        updated.activePlan !== currentUser.activePlan ||
        updated.tasksCompleted !== currentUser.tasksCompleted
      )) {
        setCurrentUser(updated);
      }
    }
  }, [allPlayers]);

  const isGameMaster = Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      currentUser.username.toLowerCase() === ADMIN_USERNAME.toLowerCase() ||
      currentUser.username.toLowerCase() === ALT_ADMIN_USERNAME.toLowerCase() ||
      currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    )
  );

  const isActivated = Boolean(currentUser && currentUser.status === 'activated');

  // FEATURE 1: REAL REGISTRATION
  const registerPlayer = (
    name: string,
    phone: string,
    password: string,
    avatar: string = '🎩'
  ) => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanName) return { success: false, error: 'Please enter your full name or player alias.' };
    if (!cleanPhone || cleanPhone.length < 5) return { success: false, error: 'Please enter a valid phone number.' };
    if (!cleanPass || cleanPass.length < 3) return { success: false, error: 'Password must be at least 3 characters.' };

    // Check if phone or username already registered
    const exists = allPlayers.some(
      (p) => p.phone === cleanPhone || p.username.toLowerCase() === cleanPhone.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'An account with this phone number is already registered. Please log in.' };
    }

    const newId = `player-${Date.now()}`;
    const cleanUsername = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + cleanPhone.slice(-4);

    const newPlayer: PlayerRecord = {
      id: newId,
      name: cleanName,
      username: cleanUsername,
      phone: cleanPhone,
      email: `${cleanUsername}@chasecoins.game`,
      password: cleanPass,
      chaseCoins: 0,
      status: 'pending', // Starts as pending!
      initialGrantCoins: 0,
      role: 'player',
      avatar: avatar || '🎲',
      level: 1,
      rank: allPlayers.length + 1,
      tasksCompleted: 0,
      joinedAt: new Date().toISOString(),
    };

    setAllPlayers((prev) => [newPlayer, ...prev]);
    setCurrentUser(newPlayer); // Set as current user; they will see pending status until Game Master activates them!

    return { success: true, player: newPlayer };
  };

  const loginPlayer = (identifier: string, password: string) => {
    const cleanIdent = identifier.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPass = password.trim();

    const found = allPlayers.find((p) => {
      const matchUsername = p.username.toLowerCase() === cleanIdent;
      const matchPhone = p.phone.replace(/\s+/g, '') === cleanIdent;
      const matchEmail = p.email.toLowerCase() === cleanIdent;
      const matchName = p.name.toLowerCase() === cleanIdent;
      return matchUsername || matchPhone || matchEmail || matchName;
    });

    if (!found) {
      return { success: false, error: 'Player account not found. Please register or check your phone/username.' };
    }

    if (found.password && found.password !== cleanPass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(found);
    return { success: true, player: found };
  };

  const logoutPlayer = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_PLAYER_KEY);
  };

  const switchPlayerForDemo = (playerId: string) => {
    const found = allPlayers.find((p) => p.id === playerId);
    if (found) {
      setCurrentUser(found);
    }
  };

  // FEATURE 2: GAME MASTER ADMIN ACTIONS
  const activatePlayerWithCoins = (playerId: string, coinsToGrant: number) => {
    if (!isGameMaster) {
      return { success: false, message: 'Unauthorized. Only Game Master (davidkivunja) can activate players.' };
    }

    const grant = Math.max(0, Number(coinsToGrant) || 0);

    setAllPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            status: 'activated',
            chaseCoins: grant,
            initialGrantCoins: grant,
            activatedAt: new Date().toISOString(),
            activatedBy: currentUser?.username || 'davidkivunja',
          };
        }
        return p;
      })
    );

    return {
      success: true,
      message: `Player activated successfully with ${grant.toLocaleString()} Chase Coins play money!`,
    };
  };

  const updatePlayerCoins = (playerId: string, newBalance: number, reason?: string) => {
    if (!isGameMaster) {
      return { success: false, message: 'Only Game Master can edit player coins directly.' };
    }

    const safeBal = Math.max(0, Number(newBalance) || 0);

    setAllPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, chaseCoins: safeBal } : p))
    );

    return {
      success: true,
      message: `Updated player balance to ${safeBal.toLocaleString()} Chase Coins.`,
    };
  };

  const suspendPlayer = (playerId: string) => {
    if (!isGameMaster) return { success: false, message: 'Unauthorized.' };
    setAllPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, status: 'suspended' } : p))
    );
    return { success: true, message: 'Player suspended from game.' };
  };

  const updateCurrentPlayerCoins = (delta: number) => {
    if (!currentUser) return;
    const newBal = Math.max(0, currentUser.chaseCoins + delta);
    setAllPlayers((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, chaseCoins: newBal } : p))
    );
    setCurrentUser((prev) => (prev ? { ...prev, chaseCoins: newBal } : null));
  };

  const updateCurrentPlayerPlan = (planId: any, planName: string) => {
    if (!currentUser) return;
    setAllPlayers((prev) =>
      prev.map((p) =>
        p.id === currentUser.id
          ? { ...p, activePlan: planId, activePlanName: planName }
          : p
      )
    );
    setCurrentUser((prev) =>
      prev ? { ...prev, activePlan: planId, activePlanName: planName } : null
    );
  };

  const incrementCurrentPlayerTasks = () => {
    if (!currentUser) return;
    const nextCount = (currentUser.tasksCompleted || 0) + 1;
    setAllPlayers((prev) =>
      prev.map((p) =>
        p.id === currentUser.id ? { ...p, tasksCompleted: nextCount } : p
      )
    );
    setCurrentUser((prev) =>
      prev ? { ...prev, tasksCompleted: nextCount } : null
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allPlayers,
        isGameMaster,
        isActivated,
        isAuthModalOpen,
        authMode,
        setIsAuthModalOpen,
        setAuthMode,
        registerPlayer,
        loginPlayer,
        logoutPlayer,
        switchPlayerForDemo,
        activatePlayerWithCoins,
        updatePlayerCoins,
        suspendPlayer,
        updateCurrentPlayerCoins,
        updateCurrentPlayerPlan,
        incrementCurrentPlayerTasks,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
