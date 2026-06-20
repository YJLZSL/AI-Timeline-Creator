import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DailyGoalState {
  dailyGoal: number; // 目标字数
  todayWords: number; // 今日已写字数
  lastResetDate: string; // 上次重置日期
  streak: number; // 连续达标天数
  setDailyGoal: (goal: number) => void;
  addWords: (words: number) => void;
  resetIfNewDay: () => void;
  getProgress: () => number;
  getTodayKey: () => string;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export const useDailyGoalStore = create<DailyGoalState>()(
  persist(
    (set, get) => ({
      dailyGoal: 2000,
      todayWords: 0,
      lastResetDate: getTodayKey(),
      streak: 0,
      setDailyGoal: (goal) => set({ dailyGoal: Math.max(100, goal) }),
      addWords: (words) => {
        get().resetIfNewDay();
        set((state) => {
          const newWords = state.todayWords + Math.max(0, words);
          const wasCompleted = state.todayWords >= state.dailyGoal;
          const isCompleted = newWords >= state.dailyGoal;
          const newStreak = !wasCompleted && isCompleted ? state.streak + 1 : state.streak;
          return { todayWords: newWords, streak: newStreak };
        });
      },
      resetIfNewDay: () => {
        const today = getTodayKey();
        const state = get();
        if (state.lastResetDate !== today) {
          const wasCompleted = state.todayWords >= state.dailyGoal;
          set({
            todayWords: 0,
            lastResetDate: today,
            streak: wasCompleted ? state.streak : 0,
          });
        }
      },
      getProgress: () => {
        const state = get();
        if (state.dailyGoal <= 0) return 0;
        return Math.min(100, (state.todayWords / state.dailyGoal) * 100);
      },
      getTodayKey: () => getTodayKey(),
    }),
    {
      name: 'storyloom-daily-goal',
    },
  ),
);

/* ───────── UI 组件 ───────── */

export function DailyGoalWidget() {
  const { dailyGoal, todayWords, streak, setDailyGoal, getProgress } = useDailyGoalStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draftGoal, setDraftGoal] = useState(String(dailyGoal));
  const progress = getProgress();
  const isCompleted = todayWords >= dailyGoal;

  useEffect(() => {
    useDailyGoalStore.getState().resetIfNewDay();
  }, []);

  const handleSave = () => {
    const goal = parseInt(draftGoal, 10);
    if (!isNaN(goal) && goal > 0) {
      setDailyGoal(goal);
    }
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-background/60 p-3 backdrop-blur-sm card-hover-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            今日目标
          </span>
          {isCompleted && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-medium">
              ✓ 已完成
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setDraftGoal(String(dailyGoal));
            setIsEditing(!isEditing);
          }}
          className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors"
        >
          {isEditing ? '取消' : '设置'}
        </button>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={draftGoal}
            onChange={(e) => setDraftGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-1 h-7 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="h-7 px-2.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            保存
          </button>
        </div>
      ) : (
        <>
          {/* 进度条 */}
          <div className="relative h-2 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: isCompleted
                  ? 'rgb(var(--success))'
                  : progress > 50
                    ? 'rgb(var(--warning))'
                    : 'rgb(var(--primary))',
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold tabular-nums">
              <span className={isCompleted ? 'text-success' : 'text-foreground'}>
                {todayWords.toLocaleString()}
              </span>
              <span className="text-muted-foreground/50"> / {dailyGoal.toLocaleString()}</span>
            </span>
            {streak > 0 && (
              <span className="text-[10px] text-muted-foreground/60">
                🔥 {streak} 天连续
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
