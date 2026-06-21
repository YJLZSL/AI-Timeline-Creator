import {
  SearchIcon,
  XIcon,
  HistoryIcon,
  PlusIcon,
} from '@/lib/icons';
import { TButton, TInput, TCheckTag } from '@/components/ui-tdesign';
import { STAGES, STAGE_LABELS, type OutlineStage } from './hooks/useOutlineState';

interface OutlineHeaderProps {
  search: string;
  stageFilter: OutlineStage;
  onSearchChange: (value: string) => void;
  onStageFilterChange: (stage: OutlineStage) => void;
  outlineFilterTrackId: string | null;
  onClearFilter: () => void;
  workspaceId: string | null;
  onCreateEvent: () => void;
  onOpenHistory: () => void;
}

export function OutlineHeader({
  search,
  stageFilter,
  onSearchChange,
  onStageFilterChange,
  outlineFilterTrackId,
  onClearFilter,
  workspaceId,
  onCreateEvent,
  onOpenHistory,
}: OutlineHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight whitespace-nowrap">大纲视图</h2>
        <div className="flex-1" />
        <TButton
          theme="success"
          size="small"
          disabled={!workspaceId}
          onClick={onCreateEvent}
        >
          <PlusIcon size={16} />
          新建章节
        </TButton>
        <TButton
          size="small"
          disabled={!workspaceId}
          onClick={onOpenHistory}
        >
          <HistoryIcon size={16} />
          演进历史
        </TButton>
        {outlineFilterTrackId && (
          <TButton variant="text" size="small" onClick={onClearFilter}>
            <XIcon size={14} />
            清除轨道过滤
          </TButton>
        )}
        <TInput
          prefixIcon={<SearchIcon size={16} />}
          value={search}
          onChange={(v) => onSearchChange(v as string)}
          placeholder="搜索事件..."
          className="w-64"
        />
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-muted-foreground">阶段过滤：</span>
        {STAGES.map((s) => (
          <TCheckTag
            key={s}
            checked={stageFilter === s}
            onChange={() => onStageFilterChange(s)}
            size="small"
          >
            {STAGE_LABELS[s]}
          </TCheckTag>
        ))}
      </div>
    </>
  );
}
