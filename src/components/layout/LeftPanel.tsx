import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  UserIcon,
  GlobeIcon,
  RemindIcon,
  RobotIcon,
  LinkIcon,
  SettingIcon,
  EditIcon,
  SearchIcon,
  MenuUnfoldIcon,
  MenuFoldIcon,
  type IconParkIconProps,
} from '@/lib/icons';
import { TButton, TInput } from '@/components/ui-tdesign';
import { useUIStore } from '@/stores/useUIStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useCharacters, useEvents, useForeshadowings, useWorldSettings } from '@/services/api-hooks';

/* ───────── 类型 ───────── */

type IconComponent = (props: IconParkIconProps) => React.ReactElement;

interface ToolItem {
  id: string;
  label: string;
  icon: IconComponent;
  panelId: 'characters' | 'worldview' | 'foreshadowing' | 'ai' | 'connections' | 'consistency' | 'event-editor';
}

/* ───────── 常量 ───────── */

const CREATION_TOOLS: ToolItem[] = [
  { id: 'characters', label: '角色', icon: UserIcon, panelId: 'characters' },
  { id: 'worldview', label: '世界观', icon: GlobeIcon, panelId: 'worldview' },
  { id: 'foreshadowing', label: '伏笔', icon: RemindIcon, panelId: 'foreshadowing' },
  { id: 'ai', label: 'AI 助手', icon: RobotIcon, panelId: 'ai' },
];

const UTILITY_TOOLS: ToolItem[] = [
  { id: 'connections', label: '关联', icon: LinkIcon, panelId: 'connections' },
  { id: 'consistency', label: '一致性', icon: SettingIcon, panelId: 'consistency' },
  { id: 'event-editor', label: '事件编辑器', icon: EditIcon, panelId: 'event-editor' },
];

export function LeftPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const activePanel = useUIStore((s) => s.activePanel);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const selectedEventId = useSelectionStore((s) => s.selectedEventId);
  const selectedCharacterId = useSelectionStore((s) => s.selectedCharacterId);
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const isDark = useThemeStore((s) => {
    const t = s.theme;
    if (t === 'system') {
      return typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    }
    return t === 'midnight' || t === 'contrast';
  });

  const { data: characters } = useCharacters(workspaceId);
  const { data: eventsData } = useEvents(workspaceId);
  const { data: foreshadowings } = useForeshadowings(workspaceId);
  const { data: worldSettings } = useWorldSettings(workspaceId);

  const events = eventsData?.items ?? [];
  const bgClass = isDark ? 'bg-card/90' : 'bg-card/80';

  const handleToolClick = (panelId: ToolItem['panelId']) => {
    setActivePanel(activePanel === panelId ? null : panelId);
  };

  const ToggleIcon = collapsed ? MenuUnfoldIcon : MenuFoldIcon;

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border backdrop-blur-sm transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-12' : 'w-60',
        bgClass,
      )}
      style={{ zIndex: 'var(--z-sidenav)' }}
    >
      {/* 折叠按钮 */}
      <div
        className={cn(
          'flex h-10 shrink-0 items-center border-b border-border/50 px-2',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <span className="select-none text-xs font-semibold tracking-wide text-muted-foreground">
            资源目录
          </span>
        )}
        <TButton
          variant="text"
          shape="circle"
          size="small"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
          className="size-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          icon={<ToggleIcon size={16} />}
        />
      </div>

      {!collapsed && (
        <div className="flex flex-1 flex-col gap-3 overflow-auto p-3">
          {/* 搜索 */}
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <TInput
              size="small"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(v) => setSearchQuery(v as string)}
              className="h-8 pl-8 text-xs"
              clearable
            />
          </div>

          {/* 创作工具 */}
          <div className="space-y-1">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              创作
            </div>
            <div className="flex flex-col gap-0.5">
              {CREATION_TOOLS.map((item) => {
                const Icon = item.icon;
                const isActive = activePanel === item.panelId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToolClick(item.panelId)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 工具 */}
          <div className="space-y-1">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              工具
            </div>
            <div className="flex flex-col gap-0.5">
              {UTILITY_TOOLS.map((item) => {
                const Icon = item.icon;
                const isActive = activePanel === item.panelId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToolClick(item.panelId)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 快速统计 */}
          <div className="mt-auto space-y-2 rounded-lg border border-border/50 bg-background/50 p-2.5">
            <div className="px-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              工作区概览
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatBadge label="事件" value={events.length} color="blue" />
              <StatBadge label="角色" value={characters?.length ?? 0} color="green" />
              <StatBadge label="伏笔" value={foreshadowings?.length ?? 0} color="amber" />
              <StatBadge label="设定" value={worldSettings?.length ?? 0} color="purple" />
            </div>
            {selectedEventId && (
              <div className="border-t border-border/50 pt-2">
                <div className="text-[10px] text-muted-foreground">已选事件</div>
                <div className="mt-1 truncate text-xs font-medium text-primary">
                  {events.find((e) => e.id === selectedEventId)?.title ?? selectedEventId.slice(0, 8)}
                </div>
              </div>
            )}
            {selectedCharacterId && (
              <div className="border-t border-border/50 pt-2">
                <div className="text-[10px] text-muted-foreground">已选角色</div>
                <div className="mt-1 truncate text-xs font-medium text-primary">
                  {characters?.find((c) => c.id === selectedCharacterId)?.name ?? selectedCharacterId.slice(0, 8)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 折叠状态只显示图标 */}
      {collapsed && (
        <div className="flex flex-1 flex-col items-center gap-2 py-2">
          {[...CREATION_TOOLS, ...UTILITY_TOOLS].map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.panelId;
            return (
              <TButton
                key={item.id}
                variant="text"
                shape="square"
                size="small"
                className={cn(
                  'size-8',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                onClick={() => handleToolClick(item.panelId)}
                icon={<Icon size={18} />}
                title={item.label}
              />
            );
          })}
        </div>
      )}
    </aside>
  );
}

/* ───────── 子组件：统计徽章 ───────── */

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'amber' | 'purple';
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  };
  return (
    <div className={cn('flex items-center justify-between rounded-md px-2 py-1', colorMap[color])}>
      <span className="text-[10px] opacity-70">{label}</span>
      <span className="text-xs font-semibold tabular-nums">{value}</span>
    </div>
  );
}
