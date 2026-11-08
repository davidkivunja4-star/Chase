import React, { useState } from 'react';
import { useInvestment } from '../context/InvestmentContext';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  Dices, 
  ArrowRight, 
  Flame, 
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export const DailyTasksPage: React.FC = () => {
  const { dailyTaskState, completeDailyGameTask, rollBonusDice, resetDailyTasksForTesting } = useInvestment();
  const { currentUser, isActivated } = useAuth();

  const [activeQuizTaskId, setActiveQuizTaskId] = useState<string | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizAnswerSubmitted, setQuizAnswerSubmitted] = useState<boolean>(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean>(false);

  const activeQuizTask = dailyTaskState.tasks.find((t) => t.id === activeQuizTaskId);

  const handleOpenQuiz = (taskId: string) => {
    setActiveQuizTaskId(taskId);
    setSelectedQuizOption(null);
    setQuizAnswerSubmitted(false);
  };

  const handleAnswerQuiz = () => {
    if (!activeQuizTask || !activeQuizTask.question || selectedQuizOption === null) return;
    const correct = selectedQuizOption === activeQuizTask.question.correctIndex;
    setIsQuizCorrect(correct);
    setQuizAnswerSubmitted(true);

    if (correct) {
      completeDailyGameTask(activeQuizTask.id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Tasks Hero Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-indigo-700">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-300">
            <Sparkles className="w-4 h-4" />
            <span>Monopoly Tycoon Daily Quests · Play Rewards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Complete Daily Tasks, Earn Chase Coins
          </h1>

          <p className="text-sm text-sky-100 leading-relaxed font-medium">
            Test your property knowledge, inspect your districts, and roll the Monopoly double dice to earn free <strong>Chase Coins</strong> every 24 hours. Coins earned can be invested directly into high-yield property plans!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl flex items-center gap-2 border border-white/20">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Current Streak: <strong>{dailyTaskState.streakCount} Days</strong></span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl flex items-center gap-2 border border-white/20 font-mono">
              <Coins className="w-4 h-4 text-amber-300" />
              <span>Today Claimed: <strong>+{dailyTaskState.totalRewardClaimedToday} Coins</strong></span>
            </div>
          </div>
        </div>

        {/* Dice illustration */}
        <div className="absolute right-6 -bottom-4 opacity-15 pointer-events-none text-9xl">
          🎲
        </div>
      </div>

      {/* Lucky Dice Roll Section */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-300">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-slate-950 flex items-center justify-center text-3xl shrink-0 shadow-sm">
            🎲
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-2.5 py-0.5 rounded-full">
              Bonus Mini-Game
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1">
              Roll the Monopoly Lucky Double Dice
            </h2>
            <p className="text-xs text-slate-900 font-medium mt-0.5 max-w-lg">
              Roll 2 standard dice to collect instant Chase Coins. Roll doubles (e.g. 5 & 5) for a 25x multiplier bonus!
            </p>
          </div>
        </div>

        <button
          onClick={rollBonusDice}
          className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Dices className="w-4 h-4 text-amber-400" />
          <span>ROLL LUCKY DICE!</span>
        </button>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Today's Daily Tasks ({dailyTaskState.tasks.filter((t) => t.isCompleted).length} of {dailyTaskState.tasks.length} Completed)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each task yields free Chase Coins into your play wallet immediately upon completion.
            </p>
          </div>

          <button
            onClick={resetDailyTasksForTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Reset daily tasks to test completion again"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tasks (Demo)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyTaskState.tasks.map((task) => (
            <div
              key={task.id}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                task.isCompleted
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {task.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>+{task.rewardCoins} Coins</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {task.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">
                  Est. {task.timeEstimate}
                </span>

                {task.isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Reward Collected</span>
                  </span>
                ) : task.question ? (
                  <button
                    onClick={() => handleOpenQuiz(task.id)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Answer Quiz (+{task.rewardCoins} CC)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => completeDailyGameTask(task.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Complete & Collect</span>
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUIZ MODAL */}
      {activeQuizTask && activeQuizTask.question && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  ❓
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {activeQuizTask.title}
                  </h3>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    Reward: +{activeQuizTask.rewardCoins} Chase Coins
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveQuizTaskId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              {activeQuizTask.question.prompt}
            </p>

            <div className="space-y-2">
              {activeQuizTask.question.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={quizAnswerSubmitted}
                  onClick={() => setSelectedQuizOption(idx)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    selectedQuizOption === idx
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono font-bold mr-2 text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>

            {quizAnswerSubmitted && (
              <div className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                isQuizCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300'
              }`}>
                <div className="font-black flex items-center gap-1.5">
                  {isQuizCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : '❌'}
                  <span>{isQuizCorrect ? 'Correct! Chase Coins Added!' : 'Incorrect Answer'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {activeQuizTask.question.explanation}
                </p>
              </div>
            )}

            <div className="pt-2">
              {!quizAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={selectedQuizOption === null}
                  onClick={handleAnswerQuiz}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-98"
                >
                  Submit Answer & Collect Coins
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveQuizTaskId(null)}
                  className="w-full py-3 bg-slate-900 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Close Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
