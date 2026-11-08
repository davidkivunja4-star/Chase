import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useInvestment } from './InvestmentContext';
import { PlayerRecord } from '../types';

export const ACTIVATION_STARTER_OPTIONS = [5000, 10000, 20000, 50000] as const;
export type ActivationStarterAmount = typeof ACTIVATION_STARTER_OPTIONS[number];

interface AdminContextType {
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  pendingPlayers: PlayerRecord[];
  allPlayers: PlayerRecord[];
  selectedOptionMap: Record<string, ActivationStarterAmount | null>;
  setSelectedStarterOption: (playerId: string, val: ActivationStarterAmount) => void;
  activatePlayer: (playerId: string) => Promise<void>;
  grantCoinsToPlayer: (playerId: string, coins: number) => void;
  suspendPlayerById: (playerId: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isGameMaster, allPlayers, activatePlayerWithCoins, updatePlayerCoins, suspendPlayer } = useAuth();
  const { showNotice } = useInvestment();

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  // Track selected fixed starter amount per player: strictly 5000 | 10000 | 20000 | 50000
  const [selectedOptionMap, setSelectedOptionMap] = useState<Record<string, ActivationStarterAmount | null>>({
    'player-lucy-05': 5000,
    'player-hassan-06': 10000,
  });

  const setSelectedStarterOption = (playerId: string, val: ActivationStarterAmount) => {
    setSelectedOptionMap((prev) => ({ ...prev, [playerId]: val }));
  };

  const pendingPlayers = allPlayers.filter((p) => p.status === 'pending');

  const activatePlayer = async (playerId: string) => {
    const selected = selectedOptionMap[playerId];
    if (!selected) {
      showNotice('Please select one of the 4 starting amounts (5,000 CC, 10,000 CC, 20,000 CC, or 50,000 CC) before activating.', 'error');
      return;
    }

    const coinsToGrant = selected;
    const targetPlayer = allPlayers.find((p) => p.id === playerId);
    const playerUsername = targetPlayer ? (targetPlayer.username || targetPlayer.name) : 'player';

    const res = activatePlayerWithCoins(playerId, coinsToGrant);
    if (res.success) {
      showNotice(res.message, 'success');

      // REQUIREMENT: When activated, player balance starts at exactly that amount. Show in chat automatically: "gamechanger activated [username] with [X] CC"
      try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { chatDb } = await import('../lib/chatFirebase');
        await addDoc(collection(chatDb, 'chase_chat'), {
          username: 'gamechanger',
          message: `gamechanger activated ${playerUsername} with ${coinsToGrant.toLocaleString()} CC`,
          isAdmin: true,
          isSystem: true,
          timestamp: serverTimestamp(),
          avatar: '👑',
        });
      } catch (chatErr) {
        console.error('Failed to post activation message to chat:', chatErr);
      }
    } else {
      showNotice(res.message, 'error');
    }
  };

  const grantCoinsToPlayer = (playerId: string, coins: number) => {
    const player = allPlayers.find((p) => p.id === playerId);
    if (!player) return;
    const newBal = player.chaseCoins + coins;
    const res = updatePlayerCoins(playerId, newBal);
    if (res.success) {
      showNotice(`Granted +${coins.toLocaleString()} CC to ${player.name}! New balance: ${newBal.toLocaleString()} CC.`, 'success');
    }
  };

  const suspendPlayerById = (playerId: string) => {
    const res = suspendPlayer(playerId);
    if (res.success) {
      showNotice(res.message, 'info');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminMode,
        setIsAdminMode,
        pendingPlayers,
        allPlayers,
        selectedOptionMap,
        setSelectedStarterOption,
        activatePlayer,
        grantCoinsToPlayer,
        suspendPlayerById,
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
