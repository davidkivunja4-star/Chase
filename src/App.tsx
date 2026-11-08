import React from 'react';
import { InvestmentProvider, useInvestment } from './context/InvestmentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { MarketplaceView } from './components/MarketplaceView';
import { PersonalizedPortfolioDashboard } from './components/PersonalizedPortfolioDashboard';
import { DailyTasksPage } from './components/DailyTasksPage';
import { LeaderboardView } from './components/LeaderboardView';
import { LiveChatView } from './components/LiveChatView';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { CheckCircle2, Info, AlertTriangle, X, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, notification, dismissNotification } = useInvestment();
  const { isAdminMode, setIsAdminMode } = useAdmin();
  const { isGameMaster, currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs leading-relaxed text-slate-200 font-medium">{notification.message}</div>
          <button
            onClick={dismissNotification}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Monopoly play money branding & Chase Coins */}
      <Header />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdminMode ? (
          isGameMaster ? (
            <AdminPortal />
          ) : (
            <div className="max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-red-300 dark:border-red-800 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                🚫
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Game Master Access Restricted
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Only user <strong>davidkivunja</strong> or platform administrators can view and manage the Game Master Admin Panel. Regular players can view their personal dashboard and climb the leaderboard!
              </p>
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setActiveTab('portfolio');
                }}
                className="px-6 py-2.5 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl transition-colors"
              >
                Return to Player Dashboard
              </button>
            </div>
          )
        ) : (
          <>
            {activeTab === 'portfolio' && <PersonalizedPortfolioDashboard />}
            {activeTab === 'plans' && <MarketplaceView />}
            {activeTab === 'tasks' && <DailyTasksPage />}
            {activeTab === 'leaderboard' && <LeaderboardView />}
            {activeTab === 'chat' && <LiveChatView />}
          </>
        )}
      </main>

      {/* Registration & Login Modal */}
      <AuthModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InvestmentProvider>
          <AdminProvider>
            <AppContent />
          </AdminProvider>
        </InvestmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
