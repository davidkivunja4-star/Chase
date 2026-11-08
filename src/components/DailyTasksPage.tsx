import React, { useState, useEffect, useRef } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Flame, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  RotateCcw, 
  FastForward, 
  ArrowRight, 
  Pause, 
  Volume2, 
  VolumeX, 
  Quote, 
  Lightbulb, 
  Check, 
  HelpCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { DailyTaskVideo } from '../types';

export const DailyTasksPage: React.FC = () => {
  const { 
    dailyTaskState, 
    currentDailyReturnAvailableKsh, 
    updateVideoWatchProgress, 
    completeVideoTask, 
    claimDailyTaskReturn,
    simulateForfeitDailyTask,
    simulateNextDayTask,
    resetTodayTask,
    walletBalance,
    setIsWalletModalOpen,
    setActiveTab,
    planInvestments,
    openZariWithPrompt,
  } = useInvestment();

  const { userProfile } = useAuth();

  // Active playing video modal state - store ID only so dailyTaskState remains single source of truth
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [lastClaimedAmount, setLastClaimedAmount] = useState<number>(0);
  const [showTesterTools, setShowTesterTools] = useState<boolean>(true);

  // Time remaining calculator
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpiredLocally, setIsExpiredLocally] = useState<boolean>(false);

  // Active plan summary
  const activePlan = planInvestments.find((p) => p.status === 'active');

  // Derive currently active video from context state
  const activeVideo = dailyTaskState.videos.find((v) => v.id === activeVideoId) || null;

  // Ref to always access latest dailyTaskState inside interval without restarting timer
  const dailyTaskStateRef = useRef(dailyTaskState);
  dailyTaskStateRef.current = dailyTaskState;

  useEffect(() => {
    const calculateTime = () => {
      const targetTime = dailyTaskState.status === 'completed'
        ? new Date(dailyTaskState.expiresAt).getTime() // waiting 24h for next task
        : new Date(dailyTaskState.expiresAt).getTime(); // window left to complete today's task

      const diff = targetTime - Date.now();

      if (diff <= 0) {
        setTimeLeftStr('00:00:00');
        setIsExpiredLocally(true);
      } else {
        setIsExpiredLocally(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [dailyTaskState.expiresAt, dailyTaskState.status]);

  // Video playback progress simulation inside modal - cleanly updates context without setState-in-render
  useEffect(() => {
    if (!activeVideoId || !isPlaying) return;

    const interval = setInterval(() => {
      const currentVideo = dailyTaskStateRef.current.videos.find((v) => v.id === activeVideoId);
      if (!currentVideo || currentVideo.watched || currentVideo.watchProgressPct >= 100) return;

      const step = 2.5 * playbackSpeed;
      const nextPct = Math.min(100, currentVideo.watchProgressPct + step);
      updateVideoWatchProgress(activeVideoId, nextPct);
    }, 500);

    return () => clearInterval(interval);
  }, [activeVideoId, isPlaying, playbackSpeed, updateVideoWatchProgress]);

  const allVideosCompleted = dailyTaskState.videos.every((v) => v.watched);

  const handleClaim = () => {
    const res = claimDailyTaskReturn();
    if (res.success) {
      setLastClaimedAmount(res.amountCredited);
      setShowCelebrationModal(true);
    }
  };

  const handleQuickWatchAll = () => {
    dailyTaskState.videos.forEach((v) => {
      completeVideoTask(v.id);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Banner: Strict Self-Enforcing Rule Explanation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-black tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Daily Yield Course
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-xs font-mono font-semibold">
                Day {dailyTaskState.dayIndex} Task Cycle
              </span>
              {dailyTaskState.streakCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {dailyTaskState.streakCount}-Day Streak
                </span>
              )}
              <button
                type="button"
                onClick={() => openZariWithPrompt('How do the daily task 24-hour cycle and forfeiture rule work?')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold transition-colors"
                title="Ask Zari about daily tasks"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Ask Zari About Tasks</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Daily Motivational & Financial Tasks
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Watch <strong className="text-white">two curated inspirational & financial videos</strong> every day. 
              Upon completion, today’s daily return will automatically accumulate and reflect on your cash wallet balance.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white">Automated 24-Hour Gating Rule:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  If you complete the task, your daily return accumulates to your balance and you wait 24 hours for tomorrow’s task. 
                  If you skip or allow the 24-hour timeframe to elapse, <span className="text-rose-300 font-semibold">today’s return is forfeited</span> and will not reflect on your balance. No admin intervention is required.
                </p>
              </div>
            </div>
          </div>

          {/* Metric Box & Live Countdown */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700/90 flex flex-col gap-4 min-w-[280px] sm:min-w-[320px] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Today’s Return Rate</div>
              <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                {activePlan ? activePlan.planName : 'Trial Tier'}
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
                <span className="text-emerald-400">KSh</span>
                <span>{dailyTaskState.dailyReturnKsh.toLocaleString()}</span>
                <span className="text-xs font-normal text-slate-400 font-sans">/ day</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {dailyTaskState.status === 'completed'
                  ? 'Accumulated into your cash wallet'
                  : dailyTaskState.status === 'forfeited'
                  ? 'Forfeited (window expired without completion)'
                  : 'Unlocks upon watching both videos'}
              </p>
            </div>

            {/* Countdown timer container */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${
                  dailyTaskState.status === 'completed' 
                    ? 'text-sky-400' 
                    : dailyTaskState.status === 'forfeited' 
                    ? 'text-rose-400' 
                    : 'text-amber-400 animate-pulse'
                }`} />
                <span className="text-xs font-medium text-slate-300">
                  {dailyTaskState.status === 'completed' 
                    ? 'Next Task Unlocks In:' 
                    : dailyTaskState.status === 'forfeited' 
                    ? 'Next Cycle Resets In:' 
                    : 'Time Window Remaining:'}
                </span>
              </div>
              <span className={`font-mono font-bold text-sm tracking-wider ${
                dailyTaskState.status === 'completed'
                  ? 'text-sky-400'
                  : dailyTaskState.status === 'forfeited'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}>
                {timeLeftStr || '24:00:00'}
              </span>
            </div>

            {/* Status Indicator */}
            <div>
              {dailyTaskState.status === 'completed' && (
                <div className="w-full py-2 px-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Today’s Return Credited (+KSh {dailyTaskState.creditedAmountKsh || dailyTaskState.dailyReturnKsh})</span>
                </div>
              )}

              {dailyTaskState.status === 'forfeited' && (
                <div className="w-full py-2 px-3 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Window Expired • Return Forfeited</span>
                </div>
              )}

              {dailyTaskState.status === 'in_progress' && (
                <button
                  onClick={handleClaim}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 animate-bounce"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Claim KSh {dailyTaskState.dailyReturnKsh.toLocaleString()} to Wallet</span>
                </button>
              )}

              {dailyTaskState.status === 'pending' && (
                <div className="w-full py-2 px-3 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-center text-xs font-medium flex items-center justify-center gap-1.5">
                  <span>Watch 2 Videos to Unlock Balance Accumulation</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forfeited Warning Alert (if user missed today's 24h window) */}
      {dailyTaskState.status === 'forfeited' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3.5 text-rose-900 animate-in fade-in duration-200">
          <div className="p-2 bg-rose-100 rounded-xl shrink-0 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold">Today’s Daily Return Has Been Forfeited</h3>
            <p className="text-xs text-rose-700 leading-relaxed">
              The 24-hour time frame elapsed before completing both mandatory video tasks. Per platform policy, 
              <strong> KSh {dailyTaskState.dailyReturnKsh.toLocaleString()} was not accumulated to your balance</strong>. 
              The system operates automatically without admin review. Please wait for the next 24-hour cycle to resume your daily tasks.
            </p>
            <div className="pt-2">
              <button
                onClick={simulateNextDayTask}
                className="px-3.5 py-1.5 bg-rose-900 text-white rounded-lg text-xs font-bold hover:bg-rose-800 transition-colors"
              >
                Advance to Next Day’s Task (+24h)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Tasks Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Today’s 2 Video Tasks</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold border border-slate-200">
              {dailyTaskState.videos.filter((v) => v.watched).length} / {dailyTaskState.videos.length} Completed
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Watch both short videos to the end to trigger immediate return accumulation.
          </p>
        </div>

        {/* Global Action Button if all watched */}
        {allVideosCompleted && dailyTaskState.status !== 'completed' && dailyTaskState.status !== 'forfeited' && (
          <button
            onClick={handleClaim}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 animate-pulse"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accumulate KSh {dailyTaskState.dailyReturnKsh.toLocaleString()} to Account</span>
          </button>
        )}
      </div>

      {/* The 2 Daily Video Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dailyTaskState.videos.map((video, idx) => {
          const isCompleted = video.watched;

          return (
            <div
              key={video.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                isCompleted
                  ? 'border-emerald-300 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
              }`}
            >
              <div>
                {/* Video Preview / Thumbnail Area */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Category & Duration Tag */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-slate-700/80 rounded-lg text-[11px] font-bold">
                      {video.category}
                    </span>
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-slate-200 rounded-lg text-[11px] font-mono">
                      {Math.floor(video.durationSeconds / 60)}m {video.durationSeconds % 60}s
                    </span>
                  </div>

                  {/* Task sequence badge */}
                  <div className="absolute top-4 right-4">
                    <span className="w-7 h-7 rounded-full bg-slate-900/90 border border-slate-700 text-white text-xs font-bold flex items-center justify-center shadow">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => {
                        setActiveVideoId(video.id);
                        setIsPlaying(true);
                      }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                        isCompleted
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-white text-slate-900 hover:scale-110 hover:bg-emerald-500 hover:text-white'
                      }`}
                      title={isCompleted ? 'Replay Video' : 'Play Video Task'}
                    >
                      {isCompleted ? (
                        <Check className="w-7 h-7 stroke-[3]" />
                      ) : (
                        <Play className="w-7 h-7 fill-current ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Video Progress Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${video.watchProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Video Info Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{video.speaker}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {video.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {video.summary}
                  </p>

                  {/* Key Takeaway Card */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Core Investment Takeaway:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                      "{video.keyTakeaway}"
                    </p>
                  </div>

                  {/* Inspirational Quote Card */}
                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs flex items-start gap-2 text-emerald-900">
                    <Quote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed italic font-medium">
                      {video.quote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                    <span className="text-xs font-semibold text-slate-700">
                      {isCompleted ? 'Completed (100%)' : `Progress: ${video.watchProgressPct}%`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={() => completeVideoTask(video.id)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        title="Simulate watching this video to completion"
                      >
                        Fast Watch
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveVideoId(video.id);
                        setIsPlaying(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Replay' : 'Watch Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Reward Claim Zone */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
        dailyTaskState.status === 'completed'
          ? 'bg-emerald-900/90 text-white border-emerald-700 shadow-xl'
          : allVideosCompleted
          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-2xl animate-pulse'
          : 'bg-white border-slate-200 shadow-sm text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                dailyTaskState.status === 'completed'
                  ? 'bg-emerald-800 text-emerald-200'
                  : allVideosCompleted
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                Step 3 of 3: Return Accumulation
              </span>
              <span className="text-xs font-mono font-medium">
                Cycle #{dailyTaskState.dayIndex}
              </span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${
              dailyTaskState.status === 'completed' || allVideosCompleted ? 'text-white' : 'text-slate-900'
            }`}>
              {dailyTaskState.status === 'completed'
                ? `Today’s Return (+KSh ${dailyTaskState.creditedAmountKsh || dailyTaskState.dailyReturnKsh}) Has Accumulated!`
                : allVideosCompleted
                ? `Both Tasks Completed! Ready to Accumulate +KSh ${dailyTaskState.dailyReturnKsh.toLocaleString()}`
                : `Complete Both Videos to Unlock Today’s KSh ${dailyTaskState.dailyReturnKsh.toLocaleString()}`}
            </h3>

            <p className={`text-xs leading-relaxed ${
              dailyTaskState.status === 'completed' || allVideosCompleted ? 'text-emerald-100' : 'text-slate-500'
            }`}>
              {dailyTaskState.status === 'completed'
                ? `The daily return has been credited directly to your cash wallet balance. The next motivational task will be released automatically in ${timeLeftStr}.`
                : allVideosCompleted
                ? `You have satisfied today's financial discipline requirement. Click below to accumulate the return directly into your active cash balance.`
                : `You have completed ${dailyTaskState.videos.filter((v) => v.watched).length} of 2 required videos. Once both are finished, your return will be ready to claim.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {dailyTaskState.status === 'completed' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-5 py-3 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>View Balance (KSh {walletBalance.toLocaleString()})</span>
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>My Portfolio</span>
                </button>
              </div>
            ) : allVideosCompleted ? (
              <button
                onClick={handleClaim}
                className="px-8 py-4 bg-white hover:bg-slate-100 text-emerald-900 font-black rounded-2xl text-sm transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Accumulate +KSh {dailyTaskState.dailyReturnKsh.toLocaleString()} to Balance</span>
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-3.5 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed border border-slate-200 flex items-center justify-center gap-2"
              >
                <span>Awaiting Video Completion (1 Remaining)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Platform Architecture & Governance Rules Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daily Task Yield & Governance Rules
            </h3>
            <p className="text-xs text-slate-500">
              Strict rules governing task completion, returns accumulation, and forfeiture
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">1</span>
              <span>2 Videos Daily Requirement</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every day, investors must watch two short inspirational, financial, and motivational videos. Both must be completed before the daily return is released.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">2</span>
              <span>24-Hour Wait Window</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Once today’s return is credited to the balance, the user must wait exactly 24 hours for tomorrow’s task cycle to unlock.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold flex items-center justify-center">3</span>
              <span>Self-Enforcing Forfeiture</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Admin does not monitor task completion. If an investor skips the task or allows the 24-hour timeframe to elapse, the return is forfeited and does not reflect on the balance.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Testing Bar (Allows testing 24h waiting period and forfeiture) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
              Simulation & Testing Controls
            </span>
            <span className="text-xs text-slate-400">
              Fast-forward 24h cycles, test forfeiture, and simulate video completion
            </span>
          </div>

          <button
            onClick={() => setShowTesterTools(!showTesterTools)}
            className="text-xs text-slate-300 hover:text-white underline font-mono"
          >
            {showTesterTools ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>

        {showTesterTools && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={handleQuickWatchAll}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                <FastForward className="w-3.5 h-3.5" />
                <span>Fast Watch 100%</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Instantly mark both videos as watched
              </div>
            </button>

            <button
              onClick={simulateForfeitDailyTask}
              className="p-3 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate 24h Forfeit</span>
              </div>
              <div className="text-[10px] text-rose-300/70">
                Test 24h expiry & missed return penalty
              </div>
            </button>

            <button
              onClick={simulateNextDayTask}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>+24h: Next Day Task</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Advance 24h & unlock next video set
              </div>
            </button>

            <button
              onClick={resetTodayTask}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold mb-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Today’s Task</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Revert to 0% watched for re-testing
              </div>
            </button>
          </div>
        )}
      </div>

      {/* --- VIDEO PLAYER MODAL --- */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  {activeVideo.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeVideo.speaker}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoId(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close Player
              </button>
            </div>

            {/* Simulated Video Canvas / Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeVideo.thumbnailUrl}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-60"
              />

              {/* Animated Audio Waveform overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-end gap-1.5 h-20 opacity-40">
                  <span className={`w-2 bg-emerald-400 rounded-full ${isPlaying ? 'animate-pulse h-12' : 'h-4'}`} />
                  <span className={`w-2 bg-emerald-400 rounded-full ${isPlaying ? 'animate-bounce h-16' : 'h-6'}`} />
                  <span className={`w-2 bg-emerald-400 rounded-full ${isPlaying ? 'animate-pulse h-20' : 'h-8'}`} />
                  <span className={`w-2 bg-emerald-400 rounded-full ${isPlaying ? 'animate-bounce h-14' : 'h-5'}`} />
                  <span className={`w-2 bg-emerald-400 rounded-full ${isPlaying ? 'animate-pulse h-10' : 'h-3'}`} />
                </div>
              </div>

              {/* Central Play/Pause Watermark */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute w-16 h-16 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xl"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              {/* Completed Watermark if watched */}
              {activeVideo.watched && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Task Complete (100%)</span>
                </div>
              )}

              {/* Bottom Player Controls */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2">
                {/* Scrub Bar */}
                <div className="w-full h-2 bg-slate-700/80 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${activeVideo.watchProgressPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-white"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400">
                      {Math.floor((activeVideo.durationSeconds * (activeVideo.watchProgressPct / 100)) / 60)}:
                      {Math.floor((activeVideo.durationSeconds * (activeVideo.watchProgressPct / 100)) % 60)
                        .toString()
                        .padStart(2, '0')}{' '}
                      / {Math.floor(activeVideo.durationSeconds / 60)}:
                      {(activeVideo.durationSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <span>Speed:</span>
                      {[1, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-1.5 py-0.5 rounded ${
                            playbackSpeed === spd
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        completeVideoTask(activeVideo.id);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                    >
                      Finish Watch
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Insights & Reflection */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <h4 className="text-lg font-bold text-white">
                  {activeVideo.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeVideo.summary}
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Key Wealth Principle:</span>
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{activeVideo.keyTakeaway}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  Status:{' '}
                  <span className={`font-bold ${activeVideo.watched ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {activeVideo.watched ? 'Completed' : `${activeVideo.watchProgressPct}% Watched`}
                  </span>
                </div>

                <button
                  onClick={() => setActiveVideoId(null)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Done Watching
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CELEBRATION MODAL WHEN ACCUMULATING RETURN --- */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider">
                Daily Task Completed
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Return Accumulated!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You successfully watched both motivational financial videos for today. Your daily return has been accumulated to your balance.
              </p>
            </div>

            {/* Credited Amount Display */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950">
              <div className="text-xs font-semibold text-emerald-700">Credited to Cash Wallet</div>
              <div className="text-3xl font-black font-mono tracking-tight text-emerald-900 mt-1">
                +KSh {lastClaimedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                New Wallet Balance: KSh {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Next 24-Hour Cycle Initiated</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your account is now on a 24-hour waiting countdown. Tomorrow’s inspirational task will unlock automatically in <strong>{timeLeftStr}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  setIsWalletModalOpen(true);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                View Cash Wallet
              </button>
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  setActiveTab('portfolio');
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
              >
                Go to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
