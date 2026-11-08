import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  UserRole, 
  AdminApprovalStatus, 
  AdminAccessRequest, 
  InvestmentPlan, 
  InvestorActivationStatus, 
  RegisteredInvestorRecord,
  PLAN_CONFIGS
} from '../types';

export const PAYMENT_RECIPIENT_PHONE = '0108689276';
export const INSTRUCTION_NOTICE = 'Send Money to 0108689276. After admin has confirmed payment, admin will activate the account and the investor will log in and have access to the account.';

export interface UserProfile {
  uid: string;
  email: string;
  mobileNumber: string;
  displayName: string;
  accountTier: string;
  memberId: string;
  createdAt: string;
  role: UserRole;
  adminStatus: AdminApprovalStatus;
  departmentRole?: string;
  justification?: string;
  investorActivationStatus?: InvestorActivationStatus;
  selectedPlan?: InvestmentPlan;
  paymentPhone?: string; // '0108689276'
  isActivated?: boolean;
  referralCode?: string;
  referredByCode?: string;
  totalReferralEarningsKsh?: number;
  referralCount?: number;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  registerUser: (
    email: string, 
    password: string, 
    mobileNumber: string, 
    displayName?: string,
    requestedRole?: 'investor' | 'admin',
    adminDetails?: { departmentRole: string; justification: string },
    referredByCode?: string
  ) => Promise<{ 
    success: boolean; 
    error?: string; 
    isPendingAdminApproval?: boolean;
    isInvestorPendingPlan?: boolean;
    investorRecord?: RegisteredInvestorRecord;
  }>;
  loginUser: (email: string, password: string, mobileNumber?: string) => Promise<{ 
    success: boolean; 
    error?: string;
    isPendingPaymentActivation?: boolean;
    isPendingPlanSelection?: boolean;
    investorRecord?: RegisteredInvestorRecord;
  }>;
  logoutUser: () => Promise<void>;
  updateMobileNumber: (newMobile: string) => Promise<{ success: boolean; error?: string }>;
  canAccessAdminPortal: boolean;
  isSuperAdmin: boolean;
  isInvestor: boolean;
  switchUserRoleForDemo: (rolePreset: 'super_admin' | 'investor' | 'pending_admin' | 'approved_admin') => void;

  // Plan Selection & Account Activation Flow (0108689276)
  pendingInvestorForPlan: RegisteredInvestorRecord | null;
  setPendingInvestorForPlan: (record: RegisteredInvestorRecord | null) => void;
  chooseInvestorPlan: (plan: InvestmentPlan) => {
    success: boolean;
    instructions: string;
    paymentPhone: string;
    applicationId: string;
  };
  confirmPaymentSent: () => void;
  activateInvestorAccountByAdmin: (emailOrMemberId: string) => { success: boolean; message: string };
  isInstructionModalOpen: boolean;
  setIsInstructionModalOpen: (open: boolean) => void;
  selectedPlanForInstructions: InvestmentPlan | null;
  setSelectedPlanForInstructions: (plan: InvestmentPlan | null) => void;
  registeredInvestors: RegisteredInvestorRecord[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = 'davidkivunja4@gmail.com';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Initialize with Super Admin profile by default so platform operators can manage immediately
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('hdchase_user_profile_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      uid: 'hdc-superadmin-001',
      email: SUPER_ADMIN_EMAIL,
      mobileNumber: '+254 712 345 678',
      displayName: 'David Kivunja',
      accountTier: 'Platform Super Administrator',
      memberId: 'HDC-SUPER-ADMIN',
      createdAt: '2026-05-10',
      role: 'super_admin',
      adminStatus: 'approved',
      departmentRole: 'Super Administrator',
    };
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Plan Selection & Account Activation States (0108689276)
  const [registeredInvestors, setRegisteredInvestors] = useState<RegisteredInvestorRecord[]>(() => {
    try {
      const saved = localStorage.getItem('hdchase_registered_investors_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'inv-faith-01',
        fullName: 'Faith Chepngetich',
        email: 'faith.chepngetich@investor.ke',
        phoneNumber: '+254 722 889 900',
        registeredAt: '2026-06-12',
        memberId: 'HDC-9102-INVESTOR',
        selectedPlan: 'HABIBI',
        paymentPhone: '0108689276',
        activationStatus: 'activated',
        activatedAt: '2026-06-12',
        activatedBy: 'Super Admin (David Kivunja)',
      }
    ];
  });

  const [pendingInvestorForPlan, setPendingInvestorForPlan] = useState<RegisteredInvestorRecord | null>(() => {
    try {
      const saved = localStorage.getItem('hdchase_pending_investor_record_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState<boolean>(false);
  const [selectedPlanForInstructions, setSelectedPlanForInstructions] = useState<InvestmentPlan | null>(null);

  useEffect(() => {
    localStorage.setItem('hdchase_registered_investors_v1', JSON.stringify(registeredInvestors));
  }, [registeredInvestors]);

  useEffect(() => {
    if (pendingInvestorForPlan) {
      localStorage.setItem('hdchase_pending_investor_record_v1', JSON.stringify(pendingInvestorForPlan));
    } else {
      localStorage.removeItem('hdchase_pending_investor_record_v1');
    }
  }, [pendingInvestorForPlan]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('hdchase_user_profile_v3');
    }
  }, [userProfile]);

  // Sync profile when admin requests or investor activations occur
  useEffect(() => {
    const handleSyncFromStorage = () => {
      try {
        const saved = localStorage.getItem('hdchase_user_profile_v3');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserProfile((prev) => {
            if (!prev) return parsed;
            if (
              prev.role !== parsed.role || 
              prev.adminStatus !== parsed.adminStatus || 
              prev.accountTier !== parsed.accountTier ||
              prev.investorActivationStatus !== parsed.investorActivationStatus ||
              prev.isActivated !== parsed.isActivated
            ) {
              return { ...prev, ...parsed };
            }
            return prev;
          });
        }

        const savedReg = localStorage.getItem('hdchase_registered_investors_v1');
        if (savedReg) {
          setRegisteredInvestors(JSON.parse(savedReg));
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('storage', handleSyncFromStorage);
    window.addEventListener('hdchase_admin_requests_updated', handleSyncFromStorage);
    window.addEventListener('hdchase_investor_activated', handleSyncFromStorage);
    return () => {
      window.removeEventListener('storage', handleSyncFromStorage);
      window.removeEventListener('hdchase_admin_requests_updated', handleSyncFromStorage);
      window.removeEventListener('hdchase_investor_activated', handleSyncFromStorage);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const isSuper = firebaseUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || data.email || '',
              mobileNumber: data.mobileNumber || '',
              displayName: firebaseUser.displayName || data.displayName || (isSuper ? 'David Kivunja' : 'H&D Chase Member'),
              accountTier: isSuper ? 'Platform Super Administrator' : (data.accountTier || 'Verified Private Investor'),
              memberId: data.memberId || (isSuper ? 'HDC-SUPER-ADMIN' : `HDC-${firebaseUser.uid.slice(0, 6).toUpperCase()}`),
              createdAt: data.createdAt || new Date().toISOString(),
              role: isSuper ? 'super_admin' : (data.role || 'investor'),
              adminStatus: isSuper ? 'approved' : (data.adminStatus || 'not_applicable'),
              departmentRole: data.departmentRole || (isSuper ? 'Super Administrator' : undefined),
              justification: data.justification,
            });
          } else {
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              mobileNumber: '',
              displayName: firebaseUser.displayName || (isSuper ? 'David Kivunja' : 'H&D Chase Member'),
              accountTier: isSuper ? 'Platform Super Administrator' : 'Verified Private Investor',
              memberId: isSuper ? 'HDC-SUPER-ADMIN' : `HDC-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
              createdAt: new Date().toISOString(),
              role: isSuper ? 'super_admin' : 'investor',
              adminStatus: isSuper ? 'approved' : 'not_applicable',
              departmentRole: isSuper ? 'Super Administrator' : undefined,
            });
          }
        } catch (err) {
          console.warn('Error fetching Firestore user profile:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- PERMISSION CHECKS ---
  const isSuperAdmin = userProfile?.role === 'super_admin' || userProfile?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const canAccessAdminPortal = isSuperAdmin || (userProfile?.role === 'admin' && userProfile?.adminStatus === 'approved');
  const isInvestor = userProfile?.role === 'investor';

  // --- REGISTER USER ---
  const registerUser = async (
    email: string, 
    password: string, 
    mobileNumber: string, 
    displayName?: string,
    requestedRole: 'investor' | 'admin' = 'investor',
    adminDetails?: { departmentRole: string; justification: string },
    referredByCode?: string
  ) => {
    try {
      const isSuper = email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      let user: FirebaseUser | null = null;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } catch (authErr: any) {
        console.warn('Firebase auth notice, fallbacking gracefully:', authErr?.message);
      }

      const uid = user ? user.uid : `user-${Date.now()}`;
      const resolvedName = displayName?.trim() || email.split('@')[0];

      if (user) {
        try {
          await updateProfile(user, { displayName: resolvedName });
        } catch (e) {
          // ignore
        }
      }

      const newRole: UserRole = isSuper ? 'super_admin' : requestedRole;
      const newAdminStatus: AdminApprovalStatus = isSuper 
        ? 'approved' 
        : requestedRole === 'admin' 
        ? 'pending_approval' 
        : 'not_applicable';

      const generatedMemberId = isSuper 
        ? 'HDC-SUPER-ADMIN' 
        : `HDC-${Math.floor(1000 + Math.random() * 9000)}-${requestedRole === 'admin' ? 'STAFF' : 'INV'}`;

      const cleanName = resolvedName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'INV';
      const myReferralCode = isSuper ? 'HDC-DAVID-8942' : `HDC-${cleanName}-${generatedMemberId.slice(-4)}`;

      const newProfile: UserProfile = {
        uid,
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        displayName: resolvedName,
        accountTier: isSuper 
          ? 'Platform Super Administrator' 
          : requestedRole === 'admin' 
          ? `Pending Admin Operator (${adminDetails?.departmentRole || 'Staff'})` 
          : 'Pending Plan & Payment Activation',
        memberId: generatedMemberId,
        createdAt: new Date().toISOString(),
        role: newRole,
        adminStatus: newAdminStatus,
        departmentRole: adminDetails?.departmentRole,
        justification: adminDetails?.justification,
        investorActivationStatus: requestedRole === 'investor' && !isSuper ? 'pending_plan_selection' : 'activated',
        paymentPhone: PAYMENT_RECIPIENT_PHONE,
        isActivated: isSuper || requestedRole === 'admin',
        referralCode: myReferralCode,
        referredByCode: referredByCode?.trim().toUpperCase(),
        totalReferralEarningsKsh: isSuper ? 15000 : 0,
        referralCount: isSuper ? 4 : 0,
      };

      // Persist to Firestore if available
      try {
        await setDoc(doc(db, 'users', uid), {
          email: newProfile.email,
          mobileNumber: newProfile.mobileNumber,
          displayName: newProfile.displayName,
          accountTier: newProfile.accountTier,
          memberId: newProfile.memberId,
          createdAt: newProfile.createdAt,
          role: newProfile.role,
          adminStatus: newProfile.adminStatus,
          departmentRole: newProfile.departmentRole || '',
          justification: newProfile.justification || '',
        });
      } catch (firestoreErr) {
        console.warn('Firestore setDoc notice:', firestoreErr);
      }

      // If registered as admin, add to admin registration requests list
      if (requestedRole === 'admin' && !isSuper) {
        const newReq: AdminAccessRequest = {
          id: `req-adm-${Date.now()}`,
          userId: uid,
          fullName: resolvedName,
          email: email.trim(),
          phoneNumber: mobileNumber.trim(),
          departmentRole: adminDetails?.departmentRole || 'Platform Staff Operator',
          justification: adminDetails?.justification || 'Registration request from sign-up portal',
          requestedAt: new Date().toISOString(),
          status: 'pending',
        };

        try {
          const current = localStorage.getItem('hdchase_admin_requests_v1');
          const list = current ? JSON.parse(current) : [];
          localStorage.setItem('hdchase_admin_requests_v1', JSON.stringify([newReq, ...list]));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.warn('Error saving admin access request:', e);
        }

        setUserProfile(newProfile);
        return { 
          success: true, 
          isPendingAdminApproval: true 
        };
      }

      // If registered as investor:
      if (requestedRole === 'investor' && !isSuper) {
        const newRecord: RegisteredInvestorRecord = {
          id: uid,
          fullName: resolvedName,
          email: email.trim(),
          phoneNumber: mobileNumber.trim(),
          password,
          registeredAt: new Date().toISOString(),
          memberId: generatedMemberId,
          paymentPhone: PAYMENT_RECIPIENT_PHONE,
          activationStatus: 'pending_plan_selection',
          referralCode: myReferralCode,
          referredByCode: referredByCode?.trim().toUpperCase(),
        };

        const updatedInvestors = [newRecord, ...registeredInvestors.filter((r) => r.email.toLowerCase() !== email.trim().toLowerCase())];
        setRegisteredInvestors(updatedInvestors);
        localStorage.setItem('hdchase_registered_investors_v1', JSON.stringify(updatedInvestors));

        setPendingInvestorForPlan(newRecord);
        localStorage.setItem('hdchase_pending_investor_record_v1', JSON.stringify(newRecord));

        // If referred, log pending referral
        if (referredByCode) {
          try {
            const curRef = localStorage.getItem('hdchase_referrals_v1');
            const refList = curRef ? JSON.parse(curRef) : [];
            const newRefPending = {
              id: `ref-${Date.now()}`,
              referrerId: 'user-001',
              referrerName: 'David Kivunja',
              referrerEmail: 'davidkivunja4@gmail.com',
              referralCodeUsed: referredByCode.trim().toUpperCase(),
              referredUserId: uid,
              referredUserName: resolvedName,
              referredUserEmail: email.trim(),
              referredUserPhone: mobileNumber.trim(),
              investedCapitalKsh: 0,
              commissionPct: 10,
              commissionKsh: 0,
              status: 'pending_subscription',
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem('hdchase_referrals_v1', JSON.stringify([newRefPending, ...refList]));
          } catch (e) {
            // ignore
          }
        }

        // Also record applicant in admin ledger so admin sees referral status under new applicants
        try {
          const curAppl = localStorage.getItem('hdchase_admin_applicants_v1');
          const applList = curAppl ? JSON.parse(curAppl) : [];
          const hasRef = !!referredByCode;
          const regAppl = {
            id: `appl-${Date.now()}`,
            fullName: resolvedName,
            email: email.trim(),
            phoneNumber: mobileNumber.trim(),
            registeredAt: new Date().toISOString().split('T')[0],
            idNumberOrPass: `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
            country: 'Kenya',
            preferredPlan: 'BOTH',
            kycStatus: 'pending_review',
            intendedCapitalKsh: 10000,
            source: hasRef ? 'Member Referral' : 'Web Portal',
            joinedViaReferral: hasRef,
            referralCodeUsed: referredByCode ? referredByCode.trim().toUpperCase() : undefined,
            referrerName: hasRef ? 'David Kivunja' : undefined,
            referrerId: hasRef ? 'user-001' : undefined,
            notes: hasRef 
              ? `Joined via referral code ${referredByCode.trim().toUpperCase()} from David Kivunja.`
              : 'Direct investor registration.',
          };
          localStorage.setItem('hdchase_admin_applicants_v1', JSON.stringify([regAppl, ...applList.filter((a: any) => a.email !== email.trim())]));
        } catch (e) {
          // ignore
        }

        // Automatically close auth modal so the user is directly on the Plan page
        setIsAuthModalOpen(false);

        return {
          success: true,
          isInvestorPendingPlan: true,
          investorRecord: newRecord,
        };
      }

      setUserProfile(newProfile);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = 'Registration failed. Please check your credentials.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please log in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  // --- INVESTOR CHOOSES PLAN (Habibi or Dubaj) & INSTRUCTIONS DISPLAY ---
  const chooseInvestorPlan = (plan: InvestmentPlan) => {
    // Check if user already has an active contract
    try {
      const curPlans = localStorage.getItem('hdchase_plan_investments_v3_ksh');
      if (curPlans) {
        const parsed = JSON.parse(curPlans);
        const active = parsed.find((p: any) => p.status === 'active' && p.daysRemaining > 0);
        if (active) {
          return {
            success: false,
            instructions: `A user can subscribe only once to any plan only. You have an active contract for ${active.planName} (#${active.contractNumber}) with ${active.daysRemaining} days remaining until maturity. Please wait until maturity.`,
            paymentPhone: PAYMENT_RECIPIENT_PHONE,
            applicationId: '',
          };
        }
      }
    } catch (e) {
      // ignore
    }

    const investor = pendingInvestorForPlan || (userProfile ? {
      id: userProfile.uid,
      fullName: userProfile.displayName,
      email: userProfile.email,
      phoneNumber: userProfile.mobileNumber || '+254 712 345 678',
      registeredAt: userProfile.createdAt,
      memberId: userProfile.memberId,
      paymentPhone: PAYMENT_RECIPIENT_PHONE,
      activationStatus: 'pending_payment_activation' as const,
    } : null);

    const investorName = investor?.fullName || 'Investor Member';
    const investorEmail = investor?.email || 'investor@hdchase.co.ke';
    const investorPhone = investor?.phoneNumber || '+254 712 345 678';
    const memberId = investor?.memberId || `HDC-${Math.floor(1000 + Math.random() * 9000)}-INV`;
    const uid = investor?.id || `inv-${Date.now()}`;

    const updatedRecord: RegisteredInvestorRecord = {
      id: uid,
      fullName: investorName,
      email: investorEmail,
      phoneNumber: investorPhone,
      registeredAt: investor?.registeredAt || new Date().toISOString(),
      memberId,
      selectedPlan: plan,
      paymentPhone: PAYMENT_RECIPIENT_PHONE,
      activationStatus: 'pending_payment_activation',
    };

    setPendingInvestorForPlan(updatedRecord);
    localStorage.setItem('hdchase_pending_investor_record_v1', JSON.stringify(updatedRecord));

    setRegisteredInvestors((prev) => {
      const filtered = prev.filter((r) => r.email.toLowerCase() !== investorEmail.toLowerCase());
      const next = [updatedRecord, ...filtered];
      localStorage.setItem('hdchase_registered_investors_v1', JSON.stringify(next));
      return next;
    });

    // Also submit an application record to Admin so Super Admin sees it in Plan Subscriptions
    const config = PLAN_CONFIGS[plan];
    const capitalKsh = config?.capitalKsh || 10000;
    const dailyReturnKsh = config?.dailyReturnKsh || 300;
    const periodDays = config?.periodDays || 60;
    const expectedTotalReturnKsh = config?.totalReturnKsh || (dailyReturnKsh * periodDays);
    const expectedTotalPayoutKsh = config?.totalPayoutKsh || (capitalKsh + expectedTotalReturnKsh);
    const planName = config?.name || plan;
    const planAbbr = plan === 'AL_FAKEER' ? 'FKR' : plan === 'HABIBI' ? 'HBB' : plan === 'DUBAJ' ? 'DBJ' : 'HMZ';
    const appId = `app-reg-${Date.now()}`;
    const appNum = `APP-${planAbbr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppRecord = {
      id: appId,
      applicationNumber: appNum,
      requestType: 'NEW_SUBSCRIPTION',
      applicantId: uid,
      applicantName: investorName,
      applicantEmail: investorEmail,
      applicantPhone: investorPhone,
      plan,
      planName,
      units: 1,
      capitalKsh,
      dailyReturnKsh,
      periodDays,
      expectedTotalReturnKsh,
      expectedTotalPayoutKsh,
      paymentMethod: 'MPESA_STK',
      paymentReference: `Sent to ${PAYMENT_RECIPIENT_PHONE}`,
      paymentConfirmed: false,
      appliedAt: new Date().toISOString(),
      status: 'pending',
      referralCodeUsed: investor?.referredByCode || userProfile?.referredByCode || 'HDC-DAVID-8942',
      referrerId: 'user-001',
      referrerName: 'David Kivunja',
      referralCommissionKsh: Math.round(capitalKsh * 0.10),
      adminNotes: `New investor registration level choice (${planName}). Instructions displayed: Send Money to ${PAYMENT_RECIPIENT_PHONE}. Awaiting payment confirmation & account activation. 10% referral commission (KSh ${Math.round(capitalKsh * 0.10).toLocaleString()}) queued.`,
    };

    try {
      const curApps = localStorage.getItem('hdchase_applications_v3_ksh');
      const appList = curApps ? JSON.parse(curApps) : [];
      localStorage.setItem('hdchase_applications_v3_ksh', JSON.stringify([newAppRecord, ...appList]));

      // Also add to new applicants
      const curAppl = localStorage.getItem('hdchase_admin_applicants_v1');
      const applList = curAppl ? JSON.parse(curAppl) : [];
      const hasReferral = !!(investor?.referredByCode || userProfile?.referredByCode);
      const refCode = investor?.referredByCode || userProfile?.referredByCode;
      const newAppl = {
        id: `appl-${Date.now()}`,
        fullName: investorName,
        email: investorEmail,
        phoneNumber: investorPhone,
        registeredAt: new Date().toISOString().split('T')[0],
        idNumberOrPass: `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
        country: 'Kenya',
        preferredPlan: plan,
        kycStatus: 'pending_review',
        intendedCapitalKsh: capitalKsh,
        source: hasReferral ? 'Member Referral' : 'Web Portal',
        joinedViaReferral: hasReferral,
        referralCodeUsed: refCode ? refCode.toUpperCase() : undefined,
        referrerName: hasReferral ? 'David Kivunja' : undefined,
        referrerId: hasReferral ? 'user-001' : undefined,
        notes: hasReferral 
          ? `Joined via referral from David Kivunja (${refCode}). Selected ${plan === 'HABIBI' ? 'Plan 1: HABIBI (10k)' : 'Plan 2: DUBAJ (20k)'}. Sent payment to ${PAYMENT_RECIPIENT_PHONE}. Awaiting admin payment confirmation and plan activation.`
          : `Selected ${plan === 'HABIBI' ? 'Plan 1: HABIBI (10k)' : 'Plan 2: DUBAJ (20k)'}. Sent payment to ${PAYMENT_RECIPIENT_PHONE}. Awaiting admin payment confirmation and account activation.`,
      };
      localStorage.setItem('hdchase_admin_applicants_v1', JSON.stringify([newAppl, ...applList.filter((a: any) => a.email !== investorEmail)]));
    } catch (e) {
      console.warn('Error saving plan application:', e);
    }

    setSelectedPlanForInstructions(plan);
    setIsInstructionModalOpen(true);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('hdchase_admin_requests_updated'));

    return {
      success: true,
      instructions: INSTRUCTION_NOTICE,
      paymentPhone: PAYMENT_RECIPIENT_PHONE,
      applicationId: appId,
    };
  };

  const confirmPaymentSent = () => {
    setIsInstructionModalOpen(false);
  };

  // --- ADMIN CONFIRMS PAYMENT & ACTIVATES ACCOUNT ---
  const activateInvestorAccountByAdmin = (emailOrMemberId: string) => {
    const target = emailOrMemberId.trim().toLowerCase();
    const foundIndex = registeredInvestors.findIndex(
      (inv) => inv.email.toLowerCase() === target || inv.memberId.toLowerCase() === target || inv.id === emailOrMemberId
    );

    if (foundIndex === -1) {
      return { success: false, message: 'Investor record not found' };
    }

    const existing = registeredInvestors[foundIndex];
    const plan = existing.selectedPlan || 'HABIBI';
    const isHabibi = plan === 'HABIBI';
    const capital = isHabibi ? 10000 : 20000;
    const daily = isHabibi ? 300 : 500;
    const period = isHabibi ? 60 : 72;
    const contractNumber = `HDC-${isHabibi ? 'HBB' : 'DBJ'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const activatedRec: RegisteredInvestorRecord = {
      ...existing,
      activationStatus: 'activated',
      activatedAt: new Date().toISOString(),
      activatedBy: 'Super Admin (David Kivunja)',
    };

    const updated = [...registeredInvestors];
    updated[foundIndex] = activatedRec;
    setRegisteredInvestors(updated);
    localStorage.setItem('hdchase_registered_investors_v1', JSON.stringify(updated));

    // Create active investment contract in localStorage
    try {
      const curPlans = localStorage.getItem('hdchase_plan_investments_v3_ksh');
      const planList = curPlans ? JSON.parse(curPlans) : [];
      const newContract = {
        id: `plan-inv-${Date.now()}`,
        contractNumber,
        plan,
        planName: isHabibi ? 'Plan 1: HABIBI' : 'Plan 2: DUBAJ',
        propertyTitle: isHabibi ? 'Habibi Luxury Waterfront Villa' : 'Dubaj Glass High-Rise Tower',
        capitalInvested: capital,
        units: 1,
        dailyReturn: daily,
        periodDays: period,
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + period * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysElapsed: 0,
        daysRemaining: period,
        totalAccumulatedReturn: 0,
        unclaimedReturns: 0,
        status: 'active',
        reinvestCycle: 1,
      };
      localStorage.setItem('hdchase_plan_investments_v3_ksh', JSON.stringify([newContract, ...planList]));

      // Update matching application to approved
      const curApps = localStorage.getItem('hdchase_applications_v3_ksh');
      if (curApps) {
        const appList = JSON.parse(curApps);
        const updatedApps = appList.map((a: any) =>
          a.applicantEmail?.toLowerCase() === target
            ? { ...a, status: 'approved', paymentConfirmed: true, reviewedBy: 'David Kivunja' }
            : a
        );
        localStorage.setItem('hdchase_applications_v3_ksh', JSON.stringify(updatedApps));
      }
    } catch (e) {
      console.warn('Error saving activated plan contract:', e);
    }

    // If active userProfile matches this investor, update their profile
    if (userProfile && (userProfile.email.toLowerCase() === target || userProfile.memberId.toLowerCase() === target)) {
      setUserProfile((prev) => prev ? {
        ...prev,
        accountTier: 'Verified Private Investor',
        investorActivationStatus: 'activated',
        isActivated: true,
        selectedPlan: plan,
      } : null);
    }

    window.dispatchEvent(new CustomEvent('hdchase_investor_activated'));
    window.dispatchEvent(new Event('storage'));

    return {
      success: true,
      message: `Payment confirmed! Account activated for ${activatedRec.fullName}. Contract ${contractNumber} is live. Investor can now log in and access their account.`,
    };
  };

  // --- LOGIN USER WITH INVESTOR ACTIVATION CHECK ---
  const loginUser = async (email: string, password: string, mobileNumber?: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isSuper = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

      // Check registered investors list for activation status
      const matchedInvestor = registeredInvestors.find((inv) => inv.email.toLowerCase() === cleanEmail);

      if (matchedInvestor && !isSuper) {
        if (matchedInvestor.activationStatus === 'pending_plan_selection') {
          setPendingInvestorForPlan(matchedInvestor);
          return {
            success: false,
            isPendingPlanSelection: true,
            error: 'Incomplete Registration: Please choose a subscription plan (Habibi or Dubaj).',
            investorRecord: matchedInvestor,
          };
        }

        if (matchedInvestor.activationStatus === 'pending_payment_activation') {
          return {
            success: false,
            isPendingPaymentActivation: true,
            error: 'Account Pending Activation: Send Money to 0108689276. After admin has confirmed payment, admin will activate the account and you will log in and have access to your account.',
            investorRecord: matchedInvestor,
          };
        }

        // Matched and activated!
        const activatedProfile: UserProfile = {
          uid: matchedInvestor.id,
          email: matchedInvestor.email,
          mobileNumber: matchedInvestor.phoneNumber,
          displayName: matchedInvestor.fullName,
          accountTier: 'Verified Private Investor',
          memberId: matchedInvestor.memberId,
          createdAt: matchedInvestor.registeredAt,
          role: 'investor',
          adminStatus: 'not_applicable',
          investorActivationStatus: 'activated',
          selectedPlan: matchedInvestor.selectedPlan,
          paymentPhone: PAYMENT_RECIPIENT_PHONE,
          isActivated: true,
        };

        setUserProfile(activatedProfile);
        localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(activatedProfile));
        setIsAuthModalOpen(false);
        return { success: true };
      }

      // Attempt Firebase Auth sign in
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr: any) {
        console.warn('Firebase login notice, evaluating local state:', authErr?.message);
      }

      if (isSuper) {
        const superProfile: UserProfile = {
          uid: 'hdc-superadmin-001',
          email: SUPER_ADMIN_EMAIL,
          mobileNumber: mobileNumber || '+254 712 345 678',
          displayName: 'David Kivunja',
          accountTier: 'Platform Super Administrator',
          memberId: 'HDC-SUPER-ADMIN',
          createdAt: '2026-05-10',
          role: 'super_admin',
          adminStatus: 'approved',
          departmentRole: 'Super Administrator',
          investorActivationStatus: 'activated',
          isActivated: true,
        };
        setUserProfile(superProfile);
        localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(superProfile));
        setIsAuthModalOpen(false);
        return { success: true };
      }

      // Check admin requests
      try {
        const curReqs = localStorage.getItem('hdchase_admin_requests_v1');
        if (curReqs) {
          const reqList: AdminAccessRequest[] = JSON.parse(curReqs);
          const userReq = reqList.find((r) => r.email.toLowerCase() === cleanEmail);
          if (userReq) {
            if (userReq.status === 'approved') {
              const staffProfile: UserProfile = {
                uid: userReq.userId,
                email: userReq.email,
                mobileNumber: userReq.phoneNumber,
                displayName: userReq.fullName,
                accountTier: `Authorized Operator (${userReq.departmentRole})`,
                memberId: `HDC-STAFF-${userReq.userId.slice(-4)}`,
                createdAt: userReq.requestedAt,
                role: 'admin',
                adminStatus: 'approved',
                departmentRole: userReq.departmentRole,
                isActivated: true,
              };
              setUserProfile(staffProfile);
              localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(staffProfile));
              setIsAuthModalOpen(false);
              return { success: true };
            } else if (userReq.status === 'declined') {
              return { success: false, error: 'Your admin operator request was declined by the Super Admin.' };
            } else {
              return { success: false, error: 'Your admin access is still pending approval by Super Administrator David Kivunja.' };
            }
          }
        }
      } catch (e) {
        // ignore
      }

      // Default investor profile if user signs in without pending restrictions
      const defaultInvestor: UserProfile = {
        uid: `user-${Date.now()}`,
        email: cleanEmail,
        mobileNumber: mobileNumber || '+254 722 000 000',
        displayName: cleanEmail.split('@')[0],
        accountTier: 'Verified Private Investor',
        memberId: `HDC-${Math.floor(1000 + Math.random() * 9000)}-INV`,
        createdAt: new Date().toISOString(),
        role: 'investor',
        adminStatus: 'not_applicable',
        investorActivationStatus: 'activated',
        isActivated: true,
      };

      setUserProfile(defaultInvestor);
      localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(defaultInvestor));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setUserProfile(null);
    localStorage.removeItem('hdchase_user_profile_v3');
  };

  const updateMobileNumber = async (newMobile: string) => {
    if (!userProfile) return { success: false, error: 'No user logged in' };
    const updated = { ...userProfile, mobileNumber: newMobile.trim() };
    setUserProfile(updated);
    localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(updated));
    return { success: true };
  };

  const switchUserRoleForDemo = (rolePreset: 'super_admin' | 'investor' | 'pending_admin' | 'approved_admin') => {
    if (rolePreset === 'super_admin') {
      const superP: UserProfile = {
        uid: 'hdc-superadmin-001',
        email: SUPER_ADMIN_EMAIL,
        mobileNumber: '+254 712 345 678',
        displayName: 'David Kivunja',
        accountTier: 'Platform Super Administrator',
        memberId: 'HDC-SUPER-ADMIN',
        createdAt: '2026-05-10',
        role: 'super_admin',
        adminStatus: 'approved',
        departmentRole: 'Super Administrator',
        investorActivationStatus: 'activated',
        isActivated: true,
      };
      setUserProfile(superP);
      localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(superP));
    } else if (rolePreset === 'investor') {
      const invP: UserProfile = {
        uid: 'inv-faith-01',
        email: 'faith.chepngetich@investor.ke',
        mobileNumber: '+254 722 889 900',
        displayName: 'Faith Chepngetich',
        accountTier: 'Verified Private Investor',
        memberId: 'HDC-9102-INVESTOR',
        createdAt: '2026-06-12',
        role: 'investor',
        adminStatus: 'not_applicable',
        investorActivationStatus: 'activated',
        selectedPlan: 'HABIBI',
        isActivated: true,
      };
      setUserProfile(invP);
      localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(invP));
    } else if (rolePreset === 'pending_admin') {
      const pendP: UserProfile = {
        uid: 'staff-pending-01',
        email: 'brian.omondi@hdchase.co.ke',
        mobileNumber: '+254 733 445 566',
        displayName: 'Brian Omondi',
        accountTier: 'Pending Admin Operator (Compliance Officer)',
        memberId: 'HDC-STAFF-9021',
        createdAt: new Date().toISOString(),
        role: 'admin',
        adminStatus: 'pending_approval',
        departmentRole: 'Compliance Officer',
        justification: 'Auditing KYC documentation & transaction proofs',
        isActivated: false,
      };
      setUserProfile(pendP);
      localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(pendP));
    } else if (rolePreset === 'approved_admin') {
      const appP: UserProfile = {
        uid: 'staff-approved-01',
        email: 'sarah.mwangi@hdchase.co.ke',
        mobileNumber: '+254 711 223 344',
        displayName: 'Sarah Mwangi',
        accountTier: 'Authorized Operator (Finance & Treasury)',
        memberId: 'HDC-STAFF-3344',
        createdAt: '2026-06-15',
        role: 'admin',
        adminStatus: 'approved',
        departmentRole: 'Finance & Treasury Admin',
        isActivated: true,
      };
      setUserProfile(appP);
      localStorage.setItem('hdchase_user_profile_v3', JSON.stringify(appP));
    }
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAuthModalOpen,
        authMode,
        setIsAuthModalOpen,
        setAuthMode,
        registerUser,
        loginUser,
        logoutUser,
        updateMobileNumber,
        canAccessAdminPortal,
        isSuperAdmin,
        isInvestor,
        switchUserRoleForDemo,
        pendingInvestorForPlan,
        setPendingInvestorForPlan,
        chooseInvestorPlan,
        confirmPaymentSent,
        activateInvestorAccountByAdmin,
        isInstructionModalOpen,
        setIsInstructionModalOpen,
        selectedPlanForInstructions,
        setSelectedPlanForInstructions,
        registeredInvestors,
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
