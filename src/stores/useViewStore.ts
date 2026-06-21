import { create } from 'zustand';
import { useTimelineStore } from '@/stores/useTimelineStore';

export type ViewId =
  | 'timeline'
  | 'outline'
  | 'narrative'
  | 'gantt'
  | 'tree'
  | 'stats'
  | 'relationship'
  | 'notebook'
  | 'writing';

type ViewMode = 'timeline' | 'outline' | 'narrative' | 'gantt' | 'statistics' | 'relationship' | 'tree';

const TIMELINE_TO_VIEW: Record<ViewMode, ViewId> = {
  timeline: 'timeline',
  outline: 'outline',
  narrative: 'narrative',
  gantt: 'gantt',
  tree: 'tree',
  statistics: 'stats',
  relationship: 'relationship',
};

// 仅时间轴相关视图映射；notebook 和 writing 为独立页面，不映射到 timeline 模式
const VIEW_TO_TIMELINE: Partial<Record<ViewId, ViewMode>> = {
  timeline: 'timeline',
  outline: 'outline',
  narrative: 'narrative',
  gantt: 'gantt',
  tree: 'tree',
  stats: 'statistics',
  relationship: 'relationship',
};

interface ViewState {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
}

function getActiveViewFromTimeline(): ViewId {
  const mode = useTimelineStore.getState().viewMode;
  return TIMELINE_TO_VIEW[mode] ?? 'timeline';
}

export const useViewStore = create<ViewState>((set) => ({
  activeView: getActiveViewFromTimeline(),
  setActiveView: (view) => {
    set({ activeView: view });
    // 仅当目标视图是时间轴相关视图时才切换 timeline 模式
    const timelineMode = VIEW_TO_TIMELINE[view];
    if (timelineMode) {
      useTimelineStore.getState().setViewMode(timelineMode);
    }
  },
}));

useTimelineStore.subscribe((state) => {
  const next = TIMELINE_TO_VIEW[state.viewMode] ?? 'timeline';
  useViewStore.setState((s) => (s.activeView === next ? s : { activeView: next }));
});
