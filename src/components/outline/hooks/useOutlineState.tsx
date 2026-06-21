import { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckIcon,
  ClockIcon,
  RoundIcon,
  DeleteIcon,
} from '@/lib/icons';
import { TTag } from '@/components/ui-tdesign';
import {
  useEvents,
  useTracks,
  useDeleteEvent,
  useUpdateEvent,
  useCharacters,
  useOutlineVersions,
  useCreateOutlineVersion,
  useDeleteOutlineVersion,
} from '@/services/api-hooks';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useUIStore } from '@/stores/useUIStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useCommandContext } from '@/components/command-palette/commands';
import { scrollSelectedIntoView } from '@/utils/revealInBestView';
import { safeJsonArray } from '@/lib/utils';
import type { TimelineEvent } from '../../../../shared/types';

export type OutlineStatus = 'completed' | 'in-progress' | 'pending' | 'abandoned';
export type OutlineStage = 'all' | '起' | '承' | '转' | '合';

export interface DragSortState {
  eventId: string;
  trackId: string;
  startY: number;
  currentY: number;
  hasMoved: boolean;
}

export const STAGES: OutlineStage[] = ['all', '起', '承', '转', '合'];
export const STAGE_LABELS: Record<OutlineStage, string> = {
  all: '全部',
  起: '起',
  承: '承',
  转: '转',
  合: '合',
};

export const STATUS_LABELS: Record<OutlineStatus, string> = {
  completed: '已完成',
  'in-progress': '进行中',
  pending: '待处理',
  abandoned: '废弃',
};

export const STATUS_THEME: Record<OutlineStatus, 'success' | 'primary' | 'warning' | 'default'> = {
  completed: 'success',
  'in-progress': 'primary',
  pending: 'warning',
  abandoned: 'default',
};

export const STATUS_ICONS: Record<OutlineStatus, React.ReactNode> = {
  completed: <CheckIcon size={12} />,
  'in-progress': <ClockIcon size={12} />,
  pending: <RoundIcon size={12} />,
  abandoned: <DeleteIcon size={12} />,
};

export function getEventTags(event: TimelineEvent): string[] {
  return safeJsonArray<string>(event.tagsJson, []);
}

export function getEventStatus(event: TimelineEvent): OutlineStatus {
  const tags = getEventTags(event).map((t) => t.toLowerCase());
  const text = `${event.title} ${event.summary || ''}`.toLowerCase();
  if (tags.includes('废弃') || tags.includes('abandoned') || text.includes('废弃')) return 'abandoned';
  if (tags.includes('已完成') || tags.includes('completed') || tags.includes('done') || text.includes('已完成')) return 'completed';
  if (tags.includes('进行中') || tags.includes('in-progress') || tags.includes('wip') || text.includes('进行中')) return 'in-progress';
  return 'pending';
}

export function getEventStage(event: TimelineEvent): OutlineStage | null {
  const tags = getEventTags(event).map((t) => t.toLowerCase());
  const text = `${event.title} ${event.summary || ''}`.toLowerCase();
  const order: Exclude<OutlineStage, 'all'>[] = ['起', '承', '转', '合'];
  for (const s of order) {
    if (tags.includes(s) || text.includes(s)) return s;
  }
  return null;
}

export function getOutlineLevel(title: string): number {
  const t = title.trim();
  const numericPrefix = t.match(/^(\d+\.)+\d+/);
  if (numericPrefix) {
    return Math.min((numericPrefix[0].match(/\./g) || []).length, 2);
  }
  if (/^[（(]\d+[）)]/.test(t)) return 1;
  if (/^[一二三四五六七八九十]+、/.test(t)) return 0;
  return 0;
}

export function StatusBadge({ status }: { status: OutlineStatus }) {
  return (
    <TTag theme={STATUS_THEME[status]} variant="light" size="small" className="inline-flex items-center gap-1">
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status]}
    </TTag>
  );
}

export function useOutlineState() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const selectEvent = useSelectionStore((s) => s.selectEvent);
  const setViewMode = useTimelineStore((s) => s.setViewMode);
  const scrollToEvent = useTimelineStore((s) => s.scrollToEvent);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const selectedEventId = useSelectionStore((s) => s.selectedEventId);
  const outlineFilterTrackId = useTimelineStore((s) => s.outlineFilterTrackId);
  const setOutlineFilterTrackId = useTimelineStore((s) => s.setOutlineFilterTrackId);
  const outlineFontSize = useSettingsStore((s) => s.outlineFontSize);
  const { data: eventsData } = useEvents(workspaceId);
  const { data: tracks } = useTracks(workspaceId);
  const { data: characters } = useCharacters(workspaceId);
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();
  const queryClient = useQueryClient();
  const ctx = useCommandContext();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<OutlineStage>('all');
  const [collapsedTracks, setCollapsedTracks] = useState<Set<string>>(new Set());
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSummary, setEditingSummary] = useState('');
  const [dragSortState, setDragSortState] = useState<DragSortState | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<{ trackId: string; index: number } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [pendingDeleteVersionId, setPendingDeleteVersionId] = useState<string | null>(null);
  const lastSnapshotMsRef = useRef<number>(0);

  const { data: outlineVersions } = useOutlineVersions(historyOpen ? workspaceId : null);
  const createOutlineVersion = useCreateOutlineVersion();
  const deleteOutlineVersion = useDeleteOutlineVersion();
  const containerRef = useRef<HTMLDivElement>(null);
  const eventsListRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const events = eventsData?.items || [];

  const openEventEditor = useCallback((eventId: string) => {
    selectEvent(eventId);
    setActivePanel('event-editor');
  }, [selectEvent, setActivePanel]);

  const jumpToEventOnTimeline = useCallback((eventId: string) => {
    selectEvent(eventId);
    setViewMode('timeline');
    scrollToEvent(eventId);
  }, [selectEvent, setViewMode, scrollToEvent]);

  const toggleTrack = (trackId: string) => {
    setCollapsedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const filteredEvents = events.filter((e) => {
    let match = true;
    if (search) {
      const q = search.toLowerCase();
      match =
        e.title.toLowerCase().includes(q) ||
        Boolean(e.summary && e.summary.toLowerCase().includes(q)) ||
        Boolean(e.description && e.description.toLowerCase().includes(q));
    }
    if (match && stageFilter !== 'all') {
      match = getEventStage(e) === stageFilter;
    }
    return match;
  });

  const eventsByTrack = (() => {
    const map = new Map<string, typeof events>();
    if (tracks) {
      for (const track of tracks) {
        map.set(track.id, []);
      }
    }
    for (const event of filteredEvents) {
      const trackId = event.trackId || 'default';
      if (!map.has(trackId)) map.set(trackId, []);
      map.get(trackId)!.push(event);
    }
    return map;
  })();

  const handleStartEdit = useCallback((event: TimelineEvent) => {
    setEditingEventId(event.id);
    setEditingTitle(event.title);
    setEditingSummary(event.summary || '');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!workspaceId || !editingEventId || !editingTitle.trim()) {
      setEditingEventId(null);
      return;
    }
    const currentEvent = events.find((e) => e.id === editingEventId);
    const trimmedTitle = editingTitle.trim();
    const trimmedSummary = editingSummary.trim();
    const data: { title: string; summary?: string } = { title: trimmedTitle };
    if (trimmedSummary !== (currentEvent?.summary || '')) {
      data.summary = trimmedSummary;
    }

    queryClient.setQueryData(['events', workspaceId], (old: { items: TimelineEvent[]; total: number } | undefined) => {
      if (!old || !old.items) return old;
      return {
        ...old,
        items: old.items.map((e: TimelineEvent) =>
          e.id === editingEventId ? { ...e, ...data } : e
        ),
      };
    });

    try {
      await updateEvent.mutateAsync({ workspaceId, eventId: editingEventId, data });
      setEditingEventId(null);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['events', workspaceId] });
      setEditingEventId(editingEventId);
    }
  }, [workspaceId, editingEventId, editingTitle, editingSummary, events, updateEvent, queryClient]);

  const handleCancelEdit = useCallback(() => {
    setEditingEventId(null);
  }, []);

  useEffect(() => {
    if (!selectedEventId || !containerRef.current) return;
    const timer = requestAnimationFrame(() => {
      scrollSelectedIntoView('event', selectedEventId, containerRef.current);
    });
    return () => cancelAnimationFrame(timer);
  }, [selectedEventId]);

  const handleDragSortStart = useCallback((eventId: string, trackId: string, clientY: number) => {
    setDragSortState({ eventId, trackId, startY: clientY, currentY: clientY, hasMoved: false });
  }, []);

  const handleDragSortMove = useCallback(
    (e: PointerEvent) => {
      if (!dragSortState) return;
      const dy = e.clientY - dragSortState.startY;
      const hasMoved = dragSortState.hasMoved || Math.abs(dy) > 3;
      setDragSortState((prev) => (prev ? { ...prev, currentY: e.clientY, hasMoved } : null));

      if (hasMoved) {
        const trackEvents = eventsByTrack.get(dragSortState.trackId);
        if (!trackEvents) return;
        const listEl = eventsListRefs.current.get(dragSortState.trackId);
        if (!listEl) return;

        const items = listEl.querySelectorAll('[data-outline-event-id]');
        let targetIndex = trackEvents.length;
        for (let i = 0; i < items.length; i++) {
          const rect = items[i].getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            targetIndex = i;
            break;
          }
        }
        setDropIndicatorIndex({ trackId: dragSortState.trackId, index: targetIndex });
      }
    },
    [dragSortState, eventsByTrack]
  );

  const handleDragSortEnd = useCallback(() => {
    if (!dragSortState || !workspaceId || !dragSortState.hasMoved) {
      setDragSortState(null);
      setDropIndicatorIndex(null);
      return;
    }

    const trackEvents = eventsByTrack.get(dragSortState.trackId);
    if (trackEvents && dropIndicatorIndex) {
      const draggedIndex = trackEvents.findIndex((e) => e.id === dragSortState.eventId);
      if (draggedIndex !== -1) {
        const sortedEvents = [...trackEvents].sort((a, b) => {
          const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
          const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
          return aTime - bTime;
        });

        let newStartTime: number | null = null;
        const targetIdx = dropIndicatorIndex.index;

        if (sortedEvents.length === 0) {
          newStartTime = Date.now();
        } else if (targetIdx === 0) {
          const firstTime = sortedEvents[0].startTime ? new Date(sortedEvents[0].startTime).getTime() : Date.now();
          newStartTime = firstTime - 3600000;
        } else if (targetIdx >= sortedEvents.length) {
          const lastTime = sortedEvents[sortedEvents.length - 1].startTime
            ? new Date(sortedEvents[sortedEvents.length - 1].startTime!).getTime()
            : Date.now();
          newStartTime = lastTime + 3600000;
        } else {
          const beforeEvent = sortedEvents[targetIdx - 1];
          const afterEvent = sortedEvents[targetIdx];
          const beforeTime = beforeEvent.startTime ? new Date(beforeEvent.startTime).getTime() : Date.now() - 3600000;
          const afterTime = afterEvent.startTime ? new Date(afterEvent.startTime).getTime() : Date.now() + 3600000;
          newStartTime = Math.round((beforeTime + afterTime) / 2);
        }

        updateEvent.mutate({
          workspaceId,
          eventId: dragSortState.eventId,
          data: { startTime: newStartTime },
        });
      }
    }

    setDragSortState(null);
    setDropIndicatorIndex(null);
  }, [dragSortState, workspaceId, eventsByTrack, dropIndicatorIndex, updateEvent]);

  useEffect(() => {
    if (!dragSortState) return;
    window.addEventListener('pointermove', handleDragSortMove);
    window.addEventListener('pointerup', handleDragSortEnd);
    return () => {
      window.removeEventListener('pointermove', handleDragSortMove);
      window.removeEventListener('pointerup', handleDragSortEnd);
    };
  }, [dragSortState, handleDragSortMove, handleDragSortEnd]);

  const buildOutlineSnapshot = useCallback((): string => {
    const sortedTracks = [...(tracks ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const snapshot = {
      version: 1,
      createdAt: Date.now(),
      tracks: sortedTracks.map((t) => ({
        trackId: t.id,
        trackName: t.name,
        events: events
          .filter((e) => (e.trackId || 'default') === t.id)
          .sort((a, b) => {
            const at = a.startTime ? new Date(a.startTime).getTime() : 0;
            const bt = b.startTime ? new Date(b.startTime).getTime() : 0;
            return at - bt;
          })
          .map((e) => ({
            eventId: e.id,
            title: e.title,
            summary: e.summary ?? '',
            startTime: e.startTime ? new Date(e.startTime).getTime() : null,
          })),
      })),
    };
    return JSON.stringify(snapshot, null, 2);
  }, [tracks, events]);

  const saveOutlineSnapshot = useCallback(
    (description?: string) => {
      if (!workspaceId) return;
      const now = Date.now();
      if (!description && now - lastSnapshotMsRef.current < 5 * 60 * 1000) return;
      lastSnapshotMsRef.current = now;
      createOutlineVersion.mutate({
        workspaceId,
        data: {
          content: buildOutlineSnapshot(),
          description: description || '自动保存',
        },
      });
    },
    [workspaceId, buildOutlineSnapshot, createOutlineVersion]
  );

  const handleRestoreVersion = useCallback(
    (versionId: string) => {
      if (!workspaceId || !outlineVersions) return;
      const version = outlineVersions.find((v) => v.id === versionId);
      if (!version) return;
      let parsed: { tracks?: Array<{ events?: Array<{ eventId: string; title: string; summary: string }> }> };
      try {
        parsed = JSON.parse(version.content);
      } catch {
        return;
      }
      if (!parsed.tracks) return;
      for (const track of parsed.tracks) {
        for (const item of track.events ?? []) {
          const exists = events.find((e) => e.id === item.eventId);
          if (!exists) continue;
          if (exists.title !== item.title || (exists.summary ?? '') !== (item.summary ?? '')) {
            updateEvent.mutate({
              workspaceId,
              eventId: item.eventId,
              data: { title: item.title, summary: item.summary },
            });
          }
        }
      }
      setPendingRestoreId(null);
      setHistoryOpen(false);
    },
    [workspaceId, outlineVersions, events, updateEvent]
  );

  const renderDiffPreview = useCallback((versionContent: string) => {
    let parsed: { tracks?: Array<{ trackName: string; events?: Array<{ title: string; summary: string }> }> };
    try {
      parsed = JSON.parse(versionContent);
    } catch {
      return <pre className="text-[11px] font-mono whitespace-pre-wrap text-muted-foreground">{versionContent}</pre>;
    }
    const currentSnapshot = (() => {
      try {
        return JSON.parse(buildOutlineSnapshot()) as typeof parsed;
      } catch {
        return null;
      }
    })();
    return (
      <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
        <div>
          <div className="font-medium text-muted-foreground mb-1">当前</div>
          <div className="space-y-2">
            {(currentSnapshot?.tracks ?? []).map((t, ti) => (
              <div key={ti} className="border border-border rounded p-2">
                <div className="font-medium mb-1">{t.trackName}</div>
                <ul className="space-y-0.5">
                  {(t.events ?? []).map((e, ei) => (
                    <li key={ei} className="truncate text-muted-foreground">· {e.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-medium text-muted-foreground mb-1">历史</div>
          <div className="space-y-2">
            {(parsed.tracks ?? []).map((t, ti) => (
              <div key={ti} className="border border-border rounded p-2">
                <div className="font-medium mb-1">{t.trackName}</div>
                <ul className="space-y-0.5">
                  {(t.events ?? []).map((e, ei) => (
                    <li key={ei} className="truncate text-muted-foreground">· {e.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [buildOutlineSnapshot]);

  const visibleTracks = tracks?.filter((track) => !outlineFilterTrackId || track.id === outlineFilterTrackId) || [];
  const totalEvents = visibleTracks.reduce((sum, t) => sum + (eventsByTrack.get(t.id)?.length || 0), 0);

  const bindEventsListRef = useCallback((trackId: string, el: HTMLDivElement | null) => {
    if (el) eventsListRefs.current.set(trackId, el);
    else eventsListRefs.current.delete(trackId);
  }, []);

  return {
    containerRef,
    workspaceId,
    events,
    tracks,
    characters,
    outlineVersions,
    deleteEvent,
    updateEvent,
    createOutlineVersion,
    deleteOutlineVersion,
    queryClient,
    ctx,
    selectedEventId,
    outlineFilterTrackId,
    setOutlineFilterTrackId,
    outlineFontSize,
    search,
    stageFilter,
    collapsedTracks,
    deletingEventId,
    editingEventId,
    editingTitle,
    editingSummary,
    dragSortState,
    dropIndicatorIndex,
    historyOpen,
    expandedVersionId,
    pendingRestoreId,
    pendingDeleteVersionId,
    filteredEvents,
    eventsByTrack,
    visibleTracks,
    totalEvents,
    setSearch,
    setStageFilter,
    toggleTrack,
    setDeletingEventId,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    setEditingTitle,
    setEditingSummary,
    handleDragSortStart,
    setDragSortState,
    setDropIndicatorIndex,
    setHistoryOpen,
    setExpandedVersionId,
    setPendingRestoreId,
    setPendingDeleteVersionId,
    openEventEditor,
    jumpToEventOnTimeline,
    buildOutlineSnapshot,
    saveOutlineSnapshot,
    handleRestoreVersion,
    renderDiffPreview,
    bindEventsListRef,
  };
}
