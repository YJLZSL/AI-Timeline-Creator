import { ChevronDownIcon, IdeaIcon } from '@/lib/icons';
import { EmptyState } from '@/components/_shared/EmptyState';
import { OutlineEventCard } from './OutlineEventCard';
import { type DragSortState } from './hooks/useOutlineState';
import type { TimelineEvent, Track } from '../../../shared/types';

interface OutlineTrackSectionProps {
  track: Track;
  events: TimelineEvent[];
  collapsed: boolean;
  onToggle: () => void;
  selectedEventId: string | null;
  dragSortState: DragSortState | null;
  dropIndicatorIndex: { trackId: string; index: number } | null;
  onDragSortStart: (eventId: string, trackId: string, clientY: number) => void;
  onEventJump: (eventId: string) => void;
  onEventEdit: (event: TimelineEvent) => void;
  onEventDelete: (eventId: string | null) => void;
  deletingEventId: string | null;
  onEventSave: () => void;
  onEventCancel: () => void;
  editingEventId: string | null;
  editingTitle: string;
  editingSummary: string;
  onEditingTitleChange: (title: string) => void;
  onEditingSummaryChange: (summary: string) => void;
  workspaceId: string | null;
  tracks: Track[] | undefined;
  characters: Array<{ id: string; name: string }> | undefined;
  deleteEvent: { mutate: (args: { workspaceId: string; eventId: string }) => void };
  updateEvent: { mutate: (args: { workspaceId: string; eventId: string; data: Record<string, unknown> }) => void };
  openEventEditor: (eventId: string) => void;
  bindEventsListRef: (trackId: string, el: HTMLDivElement | null) => void;
}

export function OutlineTrackSection({
  track,
  events,
  collapsed,
  onToggle,
  selectedEventId,
  dragSortState,
  dropIndicatorIndex,
  onDragSortStart,
  onEventJump,
  onEventEdit,
  onEventDelete,
  deletingEventId,
  onEventSave,
  onEventCancel,
  editingEventId,
  editingTitle,
  editingSummary,
  onEditingTitleChange,
  onEditingSummaryChange,
  workspaceId,
  tracks,
  characters,
  deleteEvent,
  updateEvent,
  openEventEditor,
  bindEventsListRef,
}: OutlineTrackSectionProps) {
  return (
    <div className="outline-track rounded-xl border border-border bg-card/60 shadow-sm overflow-hidden"
      style={{ backgroundImage: 'linear-gradient(to bottom, rgb(var(--card)) 0%, rgb(var(--background)) 100%)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left group"
      >
        <span
          className="transition-transform duration-200"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          <ChevronDownIcon size={16} />
        </span>
        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: track.color || 'rgb(var(--primary))' }} />
        <span className="font-medium font-sans">{track.name}</span>
        <span className="text-xs text-muted-foreground font-mono">({events.length})</span>
      </button>
      <div
        ref={(el) => bindEventsListRef(track.id, el)}
        style={{ height: collapsed ? 0 : undefined, overflow: 'hidden', opacity: collapsed ? 0 : 1 }}
      >
        <div className="p-3 grid grid-cols-1 gap-3 relative">
          {events.length === 0 ? (
            <EmptyState
              variant="dashed"
              icon={<IdeaIcon size={20} className="text-primary/50" />}
              title="该轨道下暂无事件"
              description="点击时间轴添加新事件"
              className="py-6 px-4"
            />
          ) : (
            events.map((event, index) => {
              const isEditing = editingEventId === event.id;
              const isSelected = selectedEventId === event.id;
              const isDeleting = deletingEventId === event.id;
              return (
                <OutlineEventCard
                  key={event.id}
                  event={event}
                  index={index}
                  trackId={track.id}
                  isEditing={isEditing}
                  isSelected={isSelected}
                  isDeleting={isDeleting}
                  editingTitle={isEditing ? editingTitle : event.title}
                  editingSummary={isEditing ? editingSummary : (event.summary || '')}
                  onTitleChange={onEditingTitleChange}
                  onSummaryChange={onEditingSummaryChange}
                  onSave={onEventSave}
                  onCancel={onEventCancel}
                  onEdit={onEventEdit}
                  onDelete={onEventDelete}
                  onJump={onEventJump}
                  onDragStart={onDragSortStart}
                  dragSortState={dragSortState}
                  dropIndicatorIndex={dropIndicatorIndex}
                  workspaceId={workspaceId}
                  tracks={tracks}
                  characters={characters}
                  deleteEvent={deleteEvent}
                  updateEvent={updateEvent}
                  openEventEditor={openEventEditor}
                />
              );
            })
          )}
          {dropIndicatorIndex &&
            dropIndicatorIndex.trackId === track.id &&
            dropIndicatorIndex.index === events.length &&
            events.length > 0 && <div className="h-0.5 bg-primary rounded-full" />}
        </div>
      </div>
    </div>
  );
}
