/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InvestmentProvider, useInvestment } from './context/InvestmentContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { MarketplaceView } from './components/MarketplaceView';
import { PersonalizedPortfolioDashboard } from './components/PersonalizedPortfolioDashboard';
import { SimulatorView } from './components/SimulatorView';
import { DailyTasksPage } from './components/DailyTasksPage';
import { AdminPortal } from './components/AdminPortal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { InvestModal } from './components/InvestModal';
import { ReinvestModal } from './components/ReinvestModal';
import { CertificateModal } from './components/CertificateModal';
import { WalletModal } from './components/WalletModal';
import { AuthModal } from './components/AuthModal';
import { ReferralModal } from './components/ReferralModal';
import { ZariAssistantModal } from './components/ZariAssistantModal';
import { Footer } from './components/Footer';
import { CheckCircle2, Info, AlertTriangle, X, ShieldAlert, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedPropertyForDetail,
    setSelectedPropertyForDetail,
    selectedPropertyForInvest,
    setSelectedPropertyForInvest,
    activeCertificateHolding,
    setActiveCertificateHolding,
    notification,
    dismissNotification,
  } = useInvestment();

  const { isAdminMode, setIsAdminMode } = useAdmin();
  const { userProfile, canAccessAdminPortal, isInvestor, setIsAuthModalOpen, setAuthMode } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs leading-relaxed text-slate-200">{notification.message}</div>
          <button
            onClick={dismissNotification}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Strict Top Bar Contract Header */}
      <Header />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdminMode ? (
          canAccessAdminPortal ? (
            <AdminPortal />
          ) : (
            <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  Access Restricted • Authorized Personnel Only
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Admin Portal Access Prohibited
                </h2>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {userProfile?.role === 'investor' ? (
                    <>
                      You are currently signed in as a <strong>Verified Private Investor</strong> ({userProfile.displayName || userProfile.email}). In accordance with platform securities compliance and governance regulations, <strong>investors cannot view or access the Admin Portal</strong>. Please utilize your Investor Dashboard to manage your high-yield contracts and returns.
                    </>
                  ) : userProfile?.adminStatus === 'pending_approval' ? (
                    <>
                      Your administrative registration for <strong>{userProfile.departmentRole || 'Platform Staff'}</strong> has been submitted and is currently <strong>awaiting acceptance by Super Admin David Kivunja</strong>. Admin privileges remain locked until your application is approved.
                    </>
                  ) : userProfile?.adminStatus === 'declined' ? (
                    <>
                      Your administrative access request was <strong>declined by Super Admin David Kivunja</strong>. Access to the Admin Portal is prohibited.
                    </>
                  ) : (
                    <>
                      The Admin Portal is restricted exclusively to authorized platform administrators and staff.
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Platform Security & Access Protocols:</span>
                </div>
                <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                  <li><strong>Investors:</strong> Dedicated to personalized portfolio management, property offerings, and daily payouts. Investors have zero access to administrative controls.</li>
                  <li><strong>Prospective Administrators:</strong> Can apply through the Admin Portal registration option, subject to Super Admin acceptance.</li>
                  <li><strong>Super Admin (David Kivunja):</strong> Authorizes staff requests, confirms payments, and activates investor plans.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setActiveTab('portfolio');
                  }}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Return to Investor Portfolio Dashboard
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
                >
                  Switch Account
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            {activeTab === 'portfolio' && <PersonalizedPortfolioDashboard />}
            {activeTab === 'marketplace' && <MarketplaceView />}
            {activeTab === 'tasks' && <DailyTasksPage />}
            {activeTab === 'simulator' && <SimulatorView />}
          </>
        )}
      </main>

      {/* Modals & Dialogs */}
      {selectedPropertyForDetail && (
        <PropertyDetailModal
          property={selectedPropertyForDetail}
          onClose={() => setSelectedPropertyForDetail(null)}
        />
      )}

      {selectedPropertyForInvest && (
        <InvestModal
          property={selectedPropertyForInvest}
          onClose={() => setSelectedPropertyForInvest(null)}
        />
      )}

      {activeCertificateHolding && (
        <CertificateModal
          data={activeCertificateHolding}
          onClose={() => setActiveCertificateHolding(null)}
        />
      )}

      <WalletModal />
      <AuthModal />
      <ReinvestModal />
      <ReferralModal />
      <ZariAssistantModal />

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
