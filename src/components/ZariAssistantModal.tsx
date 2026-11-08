import React, { useState, useEffect, useRef } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Play, 
  AlertCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Calendar,
  Users,
  Zap,
  Award
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: { label: string; action: () => void }[];
}

export const ZariAssistantModal: React.FC = () => {
  const { 
    isZariOpen, 
    setIsZariOpen, 
    zariInitialPrompt, 
    walletBalance, 
    activeSubscription, 
    dailyTaskState, 
    pendingWithdrawals, 
    userReferralCode,
    totalReferralCommissionEarned,
    setIsWalletModalOpen, 
    setActiveTab, 
    setIsReferralModalOpen 
  } = useInvestment();

  const { userProfile } = useAuth();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState<boolean>(true);
  const [activeReplyTab, setActiveReplyTab] = useState<'quick' | 'faqs'>('quick');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message from Zari
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Habari! I'm **Zari**, your personal AI investor guide on HavenShare. 

I'm here to answer your FAQs, explain platform rules, and give you step-by-step guidance whenever you're stuck.

How can I assist you with your investments today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  // Frequently Asked Questions shortcuts
  const faqShortcuts = [
    {
      label: 'How do I claim my daily return?',
      prompt: 'How do I watch videos and claim my daily return in the Daily Tasks page?',
    },
    {
      label: 'Why is my M-Pesa withdrawal pending?',
      prompt: 'Explain the 12-hour M-Pesa withdrawal allocation window and when admin can grant access.',
    },
    {
      label: 'Explain the 4 Investment Plans',
      prompt: 'What are the 4 investment plans (Al-fakeer, Habibi, Dubaj, Hamza) and their daily returns?',
    },
    {
      label: 'Why only one active plan?',
      prompt: 'Why does the platform only allow one active plan at a time until maturity?',
    },
    {
      label: 'How does the 10% referral bonus work?',
      prompt: 'How do I earn the 10% referral commission and where do I find my code?',
    },
    {
      label: 'I am stuck, give me a tour',
      prompt: 'I am stuck on the platform. Please give me step-by-step guidance on how to get started.',
    },
  ];

  // Quick Replies: Instant 1-tap shortcuts for common investor actions
  const quickReplies = [
    {
      id: 'withdrawal-status',
      label: 'Check Withdrawal Status',
      prompt: 'Check Withdrawal Status',
      description: 'Track M-Pesa 12-hour allocation queue & disbursements',
      icon: Clock,
      badge: pendingWithdrawals.some((w) => w.status === 'pending')
        ? `${pendingWithdrawals.filter((w) => w.status === 'pending').length} In 12h Queue`
        : pendingWithdrawals.some((w) => w.status === 'granted')
        ? 'Disbursed ✓'
        : `KSh ${walletBalance.toLocaleString()} Ready`,
      badgeStyle: pendingWithdrawals.some((w) => w.status === 'pending')
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : pendingWithdrawals.some((w) => w.status === 'granted')
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
        : 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'plan-maturity',
      label: 'Plan Maturity Date',
      prompt: 'Plan Maturity Date',
      description: 'View active contract timeline & maturity countdown',
      icon: Calendar,
      badge: activeSubscription
        ? `${activeSubscription.daysRemaining}d left (${activeSubscription.planName})`
        : 'No Active Plan',
      badgeStyle: activeSubscription
        ? 'bg-blue-100 text-blue-800 border-blue-300'
        : 'bg-slate-100 text-slate-600 border-slate-200',
    },
    {
      id: 'how-to-referral',
      label: 'How to Referral',
      prompt: 'How to Referral',
      description: 'Earn 10% instant cash commission with your code',
      icon: Users,
      badge: `10% Bonus · ${userReferralCode || 'HDC-DAVID-8942'}`,
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'daily-task-status',
      label: 'Daily Task Status',
      prompt: 'How do I watch videos and claim my daily return in the Daily Tasks page?',
      description: 'Watch 2 videos to claim today’s return',
      icon: Play,
      badge: dailyTaskState.status === 'completed'
        ? 'Claimed Today ✓'
        : dailyTaskState.status === 'forfeited'
        ? 'Forfeited'
        : 'Task Ready',
      badgeStyle: dailyTaskState.status === 'completed'
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
        : dailyTaskState.status === 'forfeited'
        ? 'bg-rose-100 text-rose-800 border-rose-300'
        : 'bg-amber-100 text-amber-800 border-amber-300',
    },
  ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isZariOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isZariOpen, isMinimized]);

  // Handle opening with pre-filled prompt
  useEffect(() => {
    if (zariInitialPrompt && isZariOpen) {
      sendMessage(zariInitialPrompt);
    }
  }, [zariInitialPrompt, isZariOpen]);

  // Hide floating teaser after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcomeTooltip(false), 12000);
    return () => clearInterval(timer);
  }, []);

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content || isLoading) return;

    setInputMessage('');
    setHasInteracted(true);
    setShowWelcomeTooltip(false);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Prepare investor context to send to server
    const currentContext = {
      investorName: userProfile?.displayName || 'David Kivunja',
      memberId: userProfile?.memberId || 'HDC-8942-INV',
      walletBalanceKsh: walletBalance,
      hasActiveSubscription: Boolean(activeSubscription),
      activePlanName: activeSubscription ? activeSubscription.planName : 'None',
      activeContractNumber: activeSubscription?.contractNumber,
      activeContractStartDate: activeSubscription?.startDate,
      activeContractMaturityDate: activeSubscription?.maturityDate,
      activeContractDaysElapsed: activeSubscription?.daysElapsed || 0,
      activeContractDaysRemaining: activeSubscription ? activeSubscription.daysRemaining : 0,
      activeContractDailyReturnKsh: activeSubscription?.dailyReturn || 0,
      activeContractAccumulatedKsh: activeSubscription?.totalAccumulatedReturn || 0,
      userReferralCode: userReferralCode || 'HDC-DAVID-8942',
      totalReferralCommissionEarned: totalReferralCommissionEarned || 0,
      dailyTaskStatus: dailyTaskState.status,
      dailyTaskStreak: dailyTaskState.streakCount,
      pendingWithdrawalsCount: pendingWithdrawals.filter((w) => w.status === 'pending').length,
      grantedWithdrawalsCount: pendingWithdrawals.filter((w) => w.status === 'granted').length,
    };

    try {
      const response = await fetch('/api/zari/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: currentContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.response || "I apologize, I couldn't process that response. Please ask me about our investment plans, daily tasks, or M-Pesa withdrawals.";

      // Determine contextual shortcut actions
      const suggestedActions: { label: string; action: () => void }[] = [];
      const lower = content.toLowerCase();

      if (lower.includes('task') || lower.includes('video') || lower.includes('return') || lower.includes('forfeit')) {
        suggestedActions.push({
          label: 'Go to Daily Tasks',
          action: () => {
            setActiveTab('tasks');
            setIsZariOpen(false);
          },
        });
      }

      if (lower.includes('withdraw') || lower.includes('wallet') || lower.includes('balance') || lower.includes('mpesa')) {
        suggestedActions.push({
          label: 'Open Cash Wallet',
          action: () => {
            setIsWalletModalOpen(true);
            setIsZariOpen(false);
          },
        });
      }

      if (lower.includes('maturity') || lower.includes('contract') || lower.includes('portfolio') || lower.includes('rollover')) {
        suggestedActions.push({
          label: 'View Portfolio Contracts',
          action: () => {
            setActiveTab('portfolio');
            setIsZariOpen(false);
          },
        });
      }

      if (lower.includes('plan') || lower.includes('invest') || lower.includes('dubaj') || lower.includes('habibi') || lower.includes('fakeer') || lower.includes('hamza')) {
        suggestedActions.push({
          label: 'View Investment Marketplace',
          action: () => {
            setActiveTab('marketplace');
            setIsZariOpen(false);
          },
        });
      }

      if (lower.includes('referral') || lower.includes('bonus') || lower.includes('code') || lower.includes('invite') || lower.includes('how to referral')) {
        suggestedActions.push({
          label: 'Open Referral Program',
          action: () => {
            setIsReferralModalOpen(true);
            setIsZariOpen(false);
          },
        });
      }

      const assistantMsg: ChatMessage = {
        id: `zari-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error contacting Zari endpoint:', err);
      // Fallback response so user is never left without assistance
      const fallbackMsg: ChatMessage = {
        id: `zari-${Date.now()}`,
        role: 'assistant',
        content: `I'm currently operating in offline concierge mode. Here are quick answers to key topics:
- **Daily Tasks:** Watch 2 short videos every day in the Daily Tasks tab to claim your return to your wallet. You must wait 24 hours for tomorrow's task.
- **12h Withdrawal Allocation:** The admin can grant access at *any time* within the 12-hour window. Once granted, payment disburses directly to your M-Pesa.
- **Single Plan Policy:** An investor can only subscribe to one plan at a time until full contract maturity.
- **10% Referral Program:** Earn 10% cash commission on every deposit made by your referred investors.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Chat cleared! How can I help you navigate HavenShare today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* --- FLOATING ZARI LAUNCHER TRIGGER (BOTTOM-RIGHT) --- */}
      {/* ========================================================================= */}
      {!isZariOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
          {/* Welcome Tooltip / Prompt bubble */}
          {showWelcomeTooltip && !hasInteracted && (
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 max-w-xs text-xs animate-in slide-in-from-bottom-2 duration-300 relative">
              <button 
                onClick={() => setShowWelcomeTooltip(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Zari · AI Investor Guide
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                Stuck or have questions about daily tasks, M-Pesa withdrawals, or investment tiers? Click here to chat with me!
              </p>
            </div>
          )}

          {/* Floating Action Button */}
          <button
            onClick={() => {
              setIsZariOpen(true);
              setIsMinimized(false);
              setShowWelcomeTooltip(false);
            }}
            className="group relative flex items-center gap-3 px-4 py-3 bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20"
            aria-label="Open Zari AI Assistant"
          >
            {/* Pulsing Aura */}
            <span className="absolute -inset-1 rounded-full bg-linear-to-r from-emerald-500 to-indigo-600 opacity-40 blur-xs group-hover:opacity-75 transition-opacity animate-pulse" />
            
            <div className="relative w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin-slow" />
            </div>

            <div className="relative text-left pr-1 hidden sm:block">
              <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                <span>Ask Zari</span>
                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 px-1.5 py-0.2 rounded font-mono font-semibold">
                  AI Guide
                </span>
              </div>
              <div className="text-[10px] text-emerald-100 font-medium">
                FAQs & Live Guidance
              </div>
            </div>

            {/* Online Indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- ZARI AI ASSISTANT CHAT DIALOG / DRAWER --- */}
      {/* ========================================================================= */}
      {isZariOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized
            ? 'bottom-6 right-6 w-80'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[460px] max-h-[85vh] h-[640px]'
        }`}>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Zari</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                      AI Concierge
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>HavenShare FAQs & Live Guidance</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsZariOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Close Zari"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Minimized View Bar */}
            {isMinimized ? (
              <div 
                className="p-3 bg-slate-50 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100"
                onClick={() => setIsMinimized(false)}
              >
                <span className="text-slate-600 font-medium">Click to resume conversation with Zari</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ) : (
              <>
                {/* Investor Context Summary Pill */}
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-sans font-bold text-slate-900">{userProfile?.displayName?.split(' ')[0] || 'Investor'}</span>
                    <span className="text-slate-400">·</span>
                    <span>Wallet: <strong className="text-emerald-700">KSh {walletBalance.toLocaleString()}</strong></span>
                  </div>
                  <div className="shrink-0 text-slate-500 font-sans">
                    Plan: <span className="font-semibold text-slate-800">{activeSubscription ? activeSubscription.planName : 'None'}</span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/40">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-xl bg-linear-to-br from-emerald-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                          </div>
                        )}

                        <div className={`p-3.5 rounded-2xl shadow-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-slate-900 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}>
                          {/* Markdown rendering simulation */}
                          <div className="space-y-2 whitespace-pre-wrap">
                            {msg.content.split('\n').map((line, idx) => {
                              // Header markdown
                              if (line.startsWith('### ')) {
                                return (
                                  <div key={idx} className="font-bold text-slate-950 text-xs uppercase tracking-wider pt-1 border-b border-slate-100 pb-1">
                                    {line.replace('### ', '')}
                                  </div>
                                );
                              }
                              // List bullet
                              if (line.startsWith('- ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                                return (
                                  <div key={idx} className="pl-2 border-l-2 border-emerald-400/60 my-0.5">
                                    {line}
                                  </div>
                                );
                              }
                              return <div key={idx}>{line}</div>;
                            })}
                          </div>

                          {/* Contextual Action Buttons */}
                          {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                              {msg.suggestedActions.map((act, aIdx) => (
                                <button
                                  key={aIdx}
                                  onClick={act.action}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <span>{act.label}</span>
                                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  ))}

                  {/* Quick Replies Welcome Cards (shown on start) */}
                  {messages.length === 1 && !isLoading && (
                    <div className="bg-linear-to-br from-slate-900 to-indigo-950 p-4 rounded-2xl text-white border border-slate-800 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                            Quick Replies · Common Actions
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">1-Tap Answers</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {quickReplies.slice(0, 3).map((qr) => {
                          const IconComp = qr.icon;
                          return (
                            <button
                              key={qr.id}
                              onClick={() => sendMessage(qr.prompt)}
                              className="group text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 transition-all flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-emerald-600/30 border border-slate-700 group-hover:border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 transition-colors">
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                                    <span>{qr.label}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {qr.description}
                                  </div>
                                </div>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${qr.badgeStyle}`}>
                                {qr.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 animate-in fade-in">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[11px] text-slate-400 ml-1 font-medium">Zari is thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies & FAQ Bar */}
                <div className="p-3 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveReplyTab('quick')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeReplyTab === 'quick'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Quick Replies</span>
                      </button>
                      <button
                        onClick={() => setActiveReplyTab('faqs')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeReplyTab === 'faqs'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Investor FAQs</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      Instant Answers
                    </span>
                  </div>

                  {activeReplyTab === 'quick' ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {quickReplies.map((qr) => {
                        const IconComp = qr.icon;
                        return (
                          <button
                            key={qr.id}
                            onClick={() => sendMessage(qr.prompt)}
                            disabled={isLoading}
                            className="group flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-800 hover:text-emerald-950 shadow-2xs transition-all shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                              <IconComp className="w-3 h-3" />
                            </span>
                            <span>{qr.label}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md border font-normal ${qr.badgeStyle}`}>
                              {qr.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {faqShortcuts.map((faq, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => sendMessage(faq.prompt)}
                          disabled={isLoading}
                          className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 border border-slate-200 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {faq.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Zari a question or request guidance..."
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className={`p-2.5 rounded-xl font-bold transition-all shadow-xs shrink-0 flex items-center justify-center ${
                      inputMessage.trim() && !isLoading
                        ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};
