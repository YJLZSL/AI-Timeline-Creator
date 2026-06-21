import { useRef, useEffect } from 'react';
import {
  EditIcon,
  DeleteIcon,
  DragIcon,
  ClockIcon,
  LocalTwoIcon,
  RightIcon,
  UserIcon,
  LinkIcon,
} from '@/lib/icons';
import { TButton } from '@/components/ui-tdesign';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/ContextMenu';
import { StatusBadge, getEventStatus, getOutlineLevel, type DragSortState } from './hooks/useOutlineState';
import type { TimelineEvent, Track } from '../../../shared/types';

interface OutlineEventCardProps {
  event: TimelineEvent;
  index: number;
  trackId: string;
  isEditing: boolean;
  isSelected: boolean;
  isDeleting: boolean;
  editingTitle: string;
  editingSummary: string;
  onTitleChange: (title: string) => void;
  onSummaryChange: (summary: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: string | null) => void;
  onJump: (eventId: string) => void;
  onDragStart: (eventId: string, trackId: string, clientY: number) => void;
  dragSortState: DragSortState | null;
  dropIndicatorIndex: { trackId: string; index: number } | null;
  workspaceId: string | null;
  tracks: Track[] | undefined;
  characters: Array<{ id: string; name: string }> | undefined;
  deleteEvent: { mutate: (args: { workspaceId: string; eventId: string }) => void };
  updateEvent: { mutate: (args: { workspaceId: string; eventId: string; data: Record<string, unknown> }) => void };
  openEventEditor: (eventId: string) => void;
}

export function OutlineEventCard({
  event,
  index,
  trackId,
  isEditing,
  isSelected,
  isDeleting,
  editingTitle,
  editingSummary,
  onTitleChange,
  onSummaryChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onJump,
  onDragStart,
  dragSortState,
  dropIndicatorIndex,
  workspaceId,
  tracks,
  characters,
  deleteEvent,
  updateEvent,
  openEventEditor,
}: OutlineEventCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const status = getEventStatus(event);
  const level = getOutlineLevel(event.title);
  const levelIndent = level >= 2 ? 'ml-8' : level === 1 ? 'ml-4' : '';
  const levelBorder = level > 0 ? 'border-l-[3px] border-primary/15' : '';
  const levelPadding = level > 0 ? 'pl-4' : '';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <ContextMenu key={event.id}>
      <ContextMenuTrigger asChild>
        <div
          data-outline-event-id={event.id}
          className={`
            relative rounded-xl border bg-card p-4 shadow-sm
            hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group/card
            ${isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-border'}
            ${dragSortState?.eventId === event.id && dragSortState.hasMoved ? 'opacity-40' : ''}
            ${levelIndent} ${levelBorder} ${levelPadding}
          `}
          onClick={() => {
            if (!isEditing) onJump(event.id);
          }}
        >
          {dropIndicatorIndex?.trackId === trackId && dropIndicatorIndex.index === index && (
            <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-primary z-10 rounded-full" />
          )}
          <div className="flex items-start gap-3">
            <span
              className="text-muted-foreground/30 cursor-grab shrink-0 mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity"
              onPointerDown={(e) => {
                e.preventDefault();
                onDragStart(event.id, trackId, e.clientY);
              }}
            >
              <DragIcon size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <StatusBadge status={status} />
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      className="font-medium text-sm font-sans leading-snug flex-1 bg-transparent border-b border-primary outline-none min-w-0 py-0.5"
                      value={editingTitle}
                      onChange={(e) => onTitleChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSave();
                        if (e.key === 'Escape') onCancel();
                        e.stopPropagation();
                      }}
                      onBlur={onSave}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h4
                      className="font-medium text-sm font-sans leading-snug text-foreground hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(event);
                      }}
                      title="点击编辑标题"
                    >
                      {event.title}
                    </h4>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <TButton
                    variant="text"
                    shape="square"
                    size="small"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      openEventEditor(event.id);
                    }}
                    title="编辑"
                  >
                    <EditIcon size={16} />
                  </TButton>
                  <TButton
                    variant="text"
                    shape="square"
                    size="small"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDelete(event.id);
                    }}
                    title="删除"
                  >
                    <DeleteIcon size={16} />
                  </TButton>
                </div>
              </div>
              {isEditing ? (
                <textarea
                  className="w-full text-xs text-muted-foreground font-sans leading-relaxed bg-transparent border border-input rounded-md p-2 outline-none focus:ring-1 focus:ring-ring resize-none"
                  rows={2}
                  value={editingSummary}
                  onChange={(e) => onSummaryChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') onCancel();
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSave();
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="摘要（可选）"
                />
              ) : event.summary ? (
                <p
                  className="text-xs text-muted-foreground font-sans leading-relaxed line-clamp-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                  title="点击编辑摘要"
                >
                  {event.summary}
                </p>
              ) : (
                <p
                  className="text-xs text-muted-foreground/50 font-sans italic"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                >
                  暂无摘要，点击添加...
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {event.startTime && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono tracking-wide">
                    <ClockIcon size={12} />
                    {new Date(event.startTime).toLocaleDateString('zh-CN')}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80 truncate max-w-[120px]">
                    <LocalTwoIcon size={12} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isDeleting && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-destructive font-sans">确认删除此事件？</span>
              <TButton
                theme="danger"
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (workspaceId) deleteEvent.mutate({ workspaceId, eventId: event.id });
                  onDelete(null);
                }}
              >
                删除
              </TButton>
              <TButton variant="outline" size="small" onClick={() => onDelete(null)}>
                取消
              </TButton>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem icon={<EditIcon size={16} />} onClick={() => openEventEditor(event.id)}>
          编辑
        </ContextMenuItem>
        <ContextMenuItem
          icon={<DeleteIcon size={16} />}
          destructive
          onClick={() => onDelete(event.id)}
        >
          删除
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<RightIcon size={16} />}>移动到轨道</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {tracks?.map((t) => (
              <ContextMenuItem
                key={t.id}
                onClick={() => {
                  if (workspaceId) updateEvent.mutate({ workspaceId, eventId: event.id, data: { trackId: t.id } });
                }}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: t.color || 'rgb(var(--muted-foreground))' }} />
                {t.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<UserIcon size={16} />}>关联到角色</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {characters?.map((c) => (
              <ContextMenuItem key={c.id} onClick={() => openEventEditor(event.id)}>
                {c.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem icon={<LinkIcon size={16} />} onClick={() => openEventEditor(event.id)}>
          创建关联
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
