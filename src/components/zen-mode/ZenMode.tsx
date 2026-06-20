import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TButton } from '@/components/ui-tdesign';
import {
  FullScreenIcon,
  XIcon,
  MoonIcon,
  SunIcon,
  FileTextIcon,
  ZoomInIcon,
  ZoomOutIcon,
  SaveIcon,
} from '@/lib/icons';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useEvent, useUpdateEvent } from '@/services/api-hooks';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { toast } from 'sonner';

interface ZenModeProps {
  onExit: () => void;
}

export function ZenMode({ onExit }: ZenModeProps) {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const selectedEventId = useSelectionStore((s) => s.selectedEventId);
  const { data: event } = useEvent(workspaceId, selectedEventId);
  const updateEvent = useUpdateEvent();

  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [darkPaper, setDarkPaper] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize from event data
  useEffect(() => {
    if (event) {
      setTitle(event.title ?? '');
      setContent(event.description ?? event.summary ?? '');
    }
  }, [event?.id]);

  // Auto-save and word count
  useEffect(() => {
    const text = content;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (event && workspaceId) {
        updateEvent.mutate(
          {
            workspaceId,
            eventId: event.id,
            data: { title, description: content },
          },
          {
            onSuccess: () => {
              toast.success('已自动保存', { duration: 1500 });
            },
          }
        );
      }
    }, 3000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [content, title, event?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to exit
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      // Mod+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (event && workspaceId) {
          updateEvent.mutate({
            workspaceId,
            eventId: event.id,
            data: { title, description: content },
          });
        }
      }
      // Mod+= to zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setFontSize((s) => Math.min(s + 1, 24));
      }
      // Mod+- to zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setFontSize((s) => Math.max(s - 1, 12));
      }
      // Mod+0 to reset font
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setFontSize(16);
      }
      // Mod+D to toggle dark paper
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setDarkPaper((v) => !v);
      }
      // F11 or Mod+Enter for fullscreen
      if (e.key === 'F11' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, event, workspaceId, title, content]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // ignore
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
  };

  const paperBg = darkPaper
    ? 'bg-[#1a1a1a] text-[#e8e8e8]'
    : 'bg-[#faf8f5] text-[#2a2a2a]';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`zen-mode-canvas fixed inset-0 z-[100] flex flex-col ${paperBg} transition-colors duration-300`}
    >
      {/* Floating toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="zen-mode-toolbar flex items-center justify-center gap-1 px-4 py-2"
          >
            <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md px-3 py-1.5 shadow-lg">
              <TButton
                variant="text"
                size="small"
                shape="square"
                className="size-8"
                onClick={() => setFontSize((s) => Math.max(s - 1, 12))}
                title="缩小字号 (Ctrl+-)"
              >
                <ZoomOutIcon size={14} />
              </TButton>
              <span className="w-8 text-center text-xs font-mono tabular-nums opacity-60">
                {fontSize}
              </span>
              <TButton
                variant="text"
                size="small"
                shape="square"
                className="size-8"
                onClick={() => setFontSize((s) => Math.min(s + 1, 24))}
                title="放大字号 (Ctrl+=)"
              >
                <ZoomInIcon size={14} />
              </TButton>

              <div className="mx-1 h-4 w-px bg-border/50" />

              <TButton
                variant="text"
                size="small"
                shape="square"
                className="size-8"
                onClick={() => setLineHeight((h) => (h === 1.8 ? 2.0 : h === 2.0 ? 1.5 : 1.8))}
                title="切换行高"
              >
                <FileTextIcon size={14} />
              </TButton>

              <TButton
                variant="text"
                size="small"
                shape="square"
                className="size-8"
                onClick={() => setDarkPaper((v) => !v)}
                title="切换暗色纸张 (Ctrl+D)"
              >
                {darkPaper ? <SunIcon size={14} /> : <MoonIcon size={14} />}
              </TButton>

              <div className="mx-1 h-4 w-px bg-border/50" />

              <TButton
                variant="text"
                size="small"
                shape="square"
                className="size-8"
                onClick={() => {
                  if (event && workspaceId) {
                    updateEvent.mutate({
                      workspaceId,
                      eventId: event.id,
                      data: { title, description: content },
                    });
                    toast.success('已保存');
                  }
                }}
                title="保存 (Ctrl+S)"
              >
                <SaveIcon size={14} />
              </TButton>

              <TButton
                variant="text"
                size="small"
                shape="square"
                className="size-8"
                onClick={toggleFullscreen}
                title="全屏 (F11)"
              >
                {document.fullscreenElement ? (
                  <XIcon size={14} />
                ) : (
                  <FullScreenIcon size={14} />
                )}
              </TButton>

              <div className="mx-1 h-4 w-px bg-border/50" />

              <TButton
                variant="text"
                size="small"
                shape="square"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={onExit}
                title="退出专注模式 (Esc)"
              >
                <XIcon size={14} />
              </TButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover area for toolbar */}
      <div
        className="fixed top-0 left-0 right-0 h-12 z-[101]"
        onMouseEnter={() => setShowToolbar(true)}
      />

      {/* Main editor area */}
      <div className="flex-1 flex flex-col items-center overflow-hidden">
        <div
          className="w-full max-w-3xl flex-1 flex flex-col px-8 py-8 md:px-16 md:py-12"
          style={{ maxWidth: '720px' }}
        >
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题…"
            className="w-full bg-transparent border-0 border-b border-border/20 pb-3 mb-6 font-serif text-2xl font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
            style={{ color: 'inherit' }}
          />

          {/* Content textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始写作…"
            className="flex-1 w-full bg-transparent border-0 resize-none focus:outline-none placeholder:text-muted-foreground/20 leading-relaxed"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight,
              color: 'inherit',
              fontFamily: 'var(--font-serif)',
            }}
          />

          {/* Bottom stats bar */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between mt-4 pt-3 border-t border-border/20 text-xs opacity-40"
            >
              <div className="flex gap-3">
                <span>{wordCount} 词</span>
                <span>{charCount} 字</span>
              </div>
              <div className="flex gap-3">
                <span>字号 {fontSize}px</span>
                <span>行高 {lineHeight}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hover area for bottom stats */}
      <div
        className="fixed bottom-0 left-0 right-0 h-10 z-[101]"
        onMouseEnter={() => setShowStats(true)}
      />
    </motion.div>
  );
}
