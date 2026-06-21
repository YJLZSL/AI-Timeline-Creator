import { useMemo } from 'react';
import { useIsMutating, useIsFetching } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useEvents, useCharacters, useWorldSettings, useTracks } from '@/services/api-hooks';
import { countWorkspaceWords } from '@/lib/word-count';
import { cn } from '@/lib/utils';

const VIEW_LABELS: Record<string, string> = {
  timeline: '时间轴',
  outline: '大纲',
  narrative: '叙事',
  gantt: '甘特图',
  statistics: '统计',
  relationship: '关系图',
};

export function StatusBar() {
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const viewMode = useTimelineStore((s) => s.viewMode);
  const zoom = useTimelineStore((s) => s.zoom);

  const { data: eventsData } = useEvents(currentWorkspaceId);
  const { data: characters } = useCharacters(currentWorkspaceId);
  const { data: worldSettings } = useWorldSettings(currentWorkspaceId);
  const { data: tracks } = useTracks(currentWorkspaceId);

  const isMutating = useIsMutating();
  const isFetching = useIsFetching();

  const eventCount = eventsData?.items?.length ?? 0;
  const trackCount = tracks?.length ?? 0;
  const characterCount = characters?.length ?? 0;

  const totalWords = useMemo(
    () =>
      countWorkspaceWords({
        events: (eventsData?.items || []).map((e) => ({
          title: e.title,
          summary: e.summary,
          description: e.description,
        })),
        characters: (characters || []).map((c) => ({
          name: c.name,
          description: c.description,
        })),
        worldSettings: (worldSettings || []).map((w) => ({
          key: w.key,
          value: w.value ?? '',
          description: w.description,
        })),
      }),
    [eventsData, characters, worldSettings],
  );

  const isWorking = isMutating > 0 || isFetching > 0;
  const saveStatus = isMutating > 0 ? '保存中…' : isFetching > 0 ? '同步中…' : '就绪';

  return (
    <footer className="flex h-8 items-center gap-4 border-t border-border/60 bg-card/80 px-4 text-xs backdrop-blur-sm">
      {/* 左侧统计信息 */}
      <div className="flex items-center gap-2.5">
        <StatusDot active={isWorking} />
        <span className="text-muted-foreground">{saveStatus}</span>
      </div>

      <span className="h-3.5 w-px bg-border/60" />

      <div className="flex items-center gap-4 min-w-0">
        <StatItem label="轨道" value={trackCount} />
        <StatItem label="事件" value={eventCount} />
        <StatItem label="角色" value={characterCount} className="hidden sm:flex" />
        <StatItem label="字数" value={totalWords.toLocaleString()} className="hidden sm:flex" />
      </div>

      <div className="flex-1" />

      {/* 右侧视图与缩放信息 */}
      <div className="flex items-center gap-2.5">
        <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {VIEW_LABELS[viewMode] || viewMode}
        </span>
        <span className="h-3.5 w-px bg-border/60" />
        <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </footer>
  );
}

/* ───────── 子组件 ───────── */

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
          active ? 'bg-amber-400' : 'bg-emerald-400',
        )}
        style={{ animationDuration: active ? '1.5s' : '3s' }}
      />
      <span
        className={cn(
          'relative inline-flex h-2 w-2 rounded-full',
          active ? 'bg-amber-500' : 'bg-emerald-500',
        )}
      />
    </span>
  );
}

function StatItem({ label, value, className }: { label: string; value: number | string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1 shrink-0 min-w-0', className)}>
      <span className="text-[10px] text-muted-foreground/70">{label}</span>
      <span className="text-[11px] font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}
