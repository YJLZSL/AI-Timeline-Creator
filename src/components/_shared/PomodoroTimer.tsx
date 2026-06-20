import { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, ResetIcon } from '@/lib/icons';

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work');
  const [cycles, setCycles] = useState(0);

  const totalTime = mode === 'work' ? 25 : mode === 'break' ? 5 : 15;

  useEffect(() => {
    setTimeLeft(totalTime * 60);
  }, [totalTime]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (mode === 'work') {
            setCycles((c) => {
              const nextC = c + 1;
              setMode(nextC % 4 === 0 ? 'longBreak' : 'break');
              return nextC;
            });
          } else {
            setMode('work');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, mode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(totalTime * 60);
  }, [totalTime]);

  const progress = ((totalTime * 60 - timeLeft) / (totalTime * 60)) * 100;

  const modeColor = mode === 'work' ? 'rgb(var(--warning))' : 'rgb(var(--success))';
  const modeLabel = mode === 'work' ? '专注' : mode === 'break' ? '休息' : '长休';

  return (
    <div
      className="flex items-center gap-2 transition-all"
      title={`已完成 ${cycles} 个番茄钟`}
    >
      {/* 环形进度指示 */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
          <circle
            cx="16" cy="16" r="13"
            fill="none"
            stroke="rgba(var(--muted-foreground), 0.15)"
            strokeWidth="2.5"
          />
          <circle
            cx="16" cy="16" r="13"
            fill="none"
            stroke={modeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute text-[10px] font-bold tabular-nums" style={{ color: modeColor }}>
          {minutes}
        </div>
      </div>

      {/* 时间显示 + 模式 */}
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className="text-sm font-mono font-semibold tabular-nums leading-none">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-muted-foreground/60 mt-0.5">
          {modeLabel} · {cycles} 个周期
        </span>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
          onClick={() => setIsRunning(!isRunning)}
          title={isRunning ? '暂停' : '开始'}
        >
          {isRunning ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        </button>
        <button
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
          onClick={reset}
          title="重置"
        >
          <ResetIcon size={14} />
        </button>
      </div>
    </div>
  );
}
