import { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, ResetIcon, FireIcon } from '@/lib/icons';

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break' | 'longBreak'>('work');
  const [cycles, setCycles] = useState(0);
  const [mcTheme, setMcTheme] = useState(true); // MC 主题开关

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

  const modeColor = mode === 'work' ? '#e53935' : mode === 'break' ? '#43a047' : '#1e88e5';
  const modeLabel = mode === 'work' ? '挖掘中' : mode === 'break' ? '吃面包' : '长休';
  const mcBlockColor = mode === 'work' ? '#7cb342' : mode === 'break' ? '#f9a825' : '#29b6f6';

  if (mcTheme) {
    return (
      <div className="rounded-lg border-2 border-[#5d4037] p-3 bg-[#f5f5dc] relative overflow-hidden mc-pixel">
        {/* 草地顶部 */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#7cb342]" />
        
        <div className="flex items-center gap-3 relative z-10">
          {/* MC 风格方块进度 */}
          <div className="relative shrink-0">
            <div 
              className="w-10 h-10 border-2 border-[#3e2723] flex items-center justify-center"
              style={{ 
                background: mcBlockColor,
                boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3)',
              }}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-sm">
                {String(minutes).padStart(2, '0')}
              </span>
            </div>
            {/* 方块堆叠效果 */}
            <div className="absolute -bottom-1 left-1 right-1 h-1 bg-[#5d4037] opacity-30" />
          </div>

          {/* 时间 + 模式 */}
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-xs font-bold tabular-nums leading-none" style={{ color: '#3e2723' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] mt-0.5" style={{ color: '#5d4037' }}>
              {modeLabel} · {cycles} 个周期
            </span>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="flex size-7 items-center justify-center border-2 border-[#5d4037] bg-[#e8e0d5] hover:bg-[#d7ccc8] active:bg-[#bcaaa4] transition-colors"
              onClick={() => setIsRunning(!isRunning)}
              title={isRunning ? '暂停' : '开始'}
              style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.2)' }}
            >
              {isRunning ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
            </button>
            <button
              className="flex size-7 items-center justify-center border-2 border-[#5d4037] bg-[#e8e0d5] hover:bg-[#d7ccc8] active:bg-[#bcaaa4] transition-colors"
              onClick={reset}
              title="重置"
              style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.2)' }}
            >
              <ResetIcon size={12} />
            </button>
            <button
              className="flex size-7 items-center justify-center border-2 border-[#5d4037] bg-[#e8e0d5] hover:bg-[#d7ccc8] active:bg-[#bcaaa4] transition-colors"
              onClick={() => setMcTheme(false)}
              title="切换为简约风格"
              style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.5), inset -1px -1px 0 rgba(0,0,0,0.2)' }}
            >
              <FireIcon size={12} />
            </button>
          </div>
        </div>

        {/* MC 进度条 — 像素方块 */}
        <div className="mt-2 flex gap-0.5 h-3">
          {Array.from({ length: 10 }).map((_, i) => {
            const blockProgress = (i + 1) * 10;
            const isFilled = progress >= blockProgress - 5;
            return (
              <div
                key={i}
                className="flex-1 border border-[#3e2723] transition-colors duration-300"
                style={{
                  background: isFilled ? mcBlockColor : '#bcaaa4',
                  boxShadow: isFilled 
                    ? 'inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.2)' 
                    : 'inset 1px 1px 0 rgba(0,0,0,0.1)',
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // 简约风格（原有设计）
  return (
    <div className="flex items-center gap-2 transition-all" title={`已完成 ${cycles} 个番茄钟`}>
      <div className="relative flex items-center justify-center shrink-0">
        <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(var(--muted-foreground), 0.15)" strokeWidth="2.5" />
          <circle
            cx="16" cy="16" r="13" fill="none" stroke={modeColor} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute text-[10px] font-bold tabular-nums" style={{ color: modeColor }}>{minutes}</div>
      </div>
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className="text-sm font-mono font-semibold tabular-nums leading-none">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-muted-foreground/60 mt-0.5">{modeLabel} · {cycles} 个周期</span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90" onClick={() => setIsRunning(!isRunning)} title={isRunning ? '暂停' : '开始'}>
          {isRunning ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        </button>
        <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90" onClick={reset} title="重置">
          <ResetIcon size={14} />
        </button>
        <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90" onClick={() => setMcTheme(true)} title="切换为MC主题">
          <FireIcon size={14} />
        </button>
      </div>
    </div>
  );
}
