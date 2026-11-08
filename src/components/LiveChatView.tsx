import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { chatDb } from '../lib/chatFirebase';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';
import { 
  Send, 
  Crown, 
  Sparkles, 
  Lock, 
  Clock, 
  MessageSquare, 
  User, 
  ShieldAlert, 
  Flame, 
  Coins, 
  Smile,
  AlertCircle
} from 'lucide-react';

export const LiveChatView: React.FC = () => {
  const { currentUser, isGameMaster, isActivated, setIsAuthModalOpen, setAuthMode } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to real live updates using onSnapshot on collection 'chase_chat', ordered by timestamp
  useEffect(() => {
    setIsLoading(true);
    const chatCollectionRef = collection(chatDb, 'chase_chat');
    const q = query(chatCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedMessages.push({
            id: doc.id,
            username: data.username || 'Anonymous Player',
            message: data.message || '',
            isAdmin: Boolean(data.isAdmin),
            timestamp: data.timestamp,
            avatar: data.avatar,
            isSystem: Boolean(data.isSystem),
          });
        });
        setMessages(fetchedMessages);
        setIsLoading(false);
      },
      (error) => {
        console.error('Live chat onSnapshot error:', error);
        // Fallback / recovery in case orderBy timestamp index is generating or offline
        // Still listen without order as fallback
        const fallbackUnsubscribe = onSnapshot(chatCollectionRef, (fallbackSnap) => {
          const fallbackMessages: ChatMessage[] = [];
          fallbackSnap.forEach((doc) => {
            const data = doc.data();
            fallbackMessages.push({
              id: doc.id,
              username: data.username || 'Anonymous Player',
              message: data.message || '',
              isAdmin: Boolean(data.isAdmin),
              timestamp: data.timestamp,
              avatar: data.avatar,
              isSystem: Boolean(data.isSystem),
            });
          });
          // Sort client-side by timestamp if available
          fallbackMessages.sort((a, b) => {
            const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp || 0).getTime());
            const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp || 0).getTime());
            return timeA - timeB;
          });
          setMessages(fallbackMessages);
          setIsLoading(false);
        });
        return () => fallbackUnsubscribe();
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto-scroll to newest message whenever messages array updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (!currentUser) {
      setSendError('Please log in or register to join the live chat.');
      return;
    }

    if (!isActivated) {
      setSendError('Waiting for Game Master to activate you.');
      return;
    }

    setIsSending(true);

    try {
      const isUserAdmin = isGameMaster;
      const usernameToSend = isUserAdmin ? 'gamechanger' : (currentUser.username || currentUser.name);

      await addDoc(collection(chatDb, 'chase_chat'), {
        username: usernameToSend,
        message: trimmed,
        isAdmin: isUserAdmin,
        timestamp: serverTimestamp(),
        avatar: currentUser.avatar || '🎲',
      });

      setInputText('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setSendError(err.message || 'Failed to send message to live chat.');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (ts: any) => {
    if (!ts) return 'Just now';
    try {
      let date: Date;
      if (ts.toDate && typeof ts.toDate === 'function') {
        date = ts.toDate();
      } else if (ts.seconds) {
        date = new Date(ts.seconds * 1000);
      } else {
        date = new Date(ts);
      }
      if (isNaN(date.getTime())) return 'Just now';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Live Chat Hero Banner */}
      <div className="bg-gradient-to-r from-red-700 via-amber-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Real-Time Live Chat • Firestore Collection: chase_chat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Monopoly High-Rollers Live Chat
            </h1>
            <p className="text-xs text-amber-100 max-w-xl font-medium leading-relaxed">
              Chat live with fellow Monopoly property tycoons and the Game Master (<strong>gamechanger</strong>). Only activated players can send messages.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-black/25 backdrop-blur-xs border border-white/20 text-xs font-mono font-bold flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-300" />
              <span>Play Money Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px]">
        {/* Chat Room Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 text-white flex items-center justify-center text-lg shadow-sm">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  #chase_chat Live Stream
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {messages.length} message(s) in database
              </div>
            </div>
          </div>

          {/* Current User Badge */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <span>{currentUser.avatar || '🎲'}</span>
              <span>{isGameMaster ? 'gamechanger (Game Master)' : currentUser.name}</span>
            </div>
          )}
        </div>

        {/* Messages Stream with Auto-Scroll */}
        <div 
          ref={chatContainerRef}
          className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-100/60 dark:bg-slate-950/40"
        >
          {isLoading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 text-xs">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to live Firestore chat stream...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 text-xs">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              <p className="font-bold text-slate-600 dark:text-slate-300">No messages yet in #chase_chat</p>
              <p className="text-[11px]">Be the first tycoon to post a message!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isAdminMsg = Boolean(
                msg.isAdmin || 
                (msg.username && (msg.username.toLowerCase() === 'gamechanger' || msg.username.toLowerCase() === 'davidkivunja'))
              );
              const isSystemMsg = Boolean(msg.isSystem);

              // SYSTEM ACTIVATION ANNOUNCEMENT BUBBLE
              if (isSystemMsg) {
                return (
                  <div key={msg.id || idx} className="flex justify-center my-3 animate-in fade-in">
                    <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/50 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center gap-2 shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{msg.message}</span>
                      <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-mono ml-2">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              }

              // ADMIN MESSAGE: GOLD CROWN, RED BOLD NAME, GAME MASTER BADGE, GOLD BACKGROUND
              if (isAdminMsg) {
                return (
                  <div key={msg.id || idx} className="flex items-start gap-3 max-w-2xl animate-in fade-in">
                    <span className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shrink-0 shadow-md border-2 border-amber-300">
                      👑
                    </span>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 text-sm">👑</span>
                        <strong className="font-black text-red-600 dark:text-red-400 text-xs">
                          {msg.username || 'gamechanger'}
                        </strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-xs border border-amber-300">
                          GAME MASTER
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                      {/* GOLD BACKGROUND BUBBLE */}
                      <div className="p-4 rounded-3xl rounded-tl-xs bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-100 dark:from-amber-950/80 dark:via-yellow-950/60 dark:to-amber-900/60 border-2 border-amber-400 dark:border-amber-600 text-slate-950 dark:text-amber-100 text-xs sm:text-sm font-semibold leading-relaxed shadow-sm">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              }

              // NORMAL PLAYER MESSAGE: NORMAL NAME, WHITE BUBBLE
              return (
                <div key={msg.id || idx} className="flex items-start gap-3 max-w-2xl animate-in fade-in">
                  <span className="w-9 h-9 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                    {msg.avatar || '🎲'}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {msg.username}
                      </strong>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                    {/* WHITE BUBBLE FOR PLAYERS */}
                    <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed shadow-xs">
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Section */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          {sendError && (
            <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          {!currentUser ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-xs space-y-2">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Log in or register an account to chat with Monopoly players!
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-xl text-xs"
                >
                  Register
                </button>
              </div>
            </div>
          ) : !isActivated ? (
            /* REQUIREMENT: Pending players can only read and see "Waiting for Game Master to activate you" */
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-600/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-bold">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Waiting for Game Master to activate you</span>
              </div>
              <span className="text-[11px] text-amber-800 dark:text-amber-300 italic hidden sm:inline">
                Read-only mode enabled
              </span>
            </div>
          ) : (
            /* Activated players form */
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isGameMaster 
                    ? "Post as Game Master (gamechanger)..." 
                    : `Post message as @${currentUser.username || currentUser.name}...`
                }
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="px-5 py-3 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 disabled:opacity-40 text-white font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
