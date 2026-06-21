import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'tdesign-react';
import type { DropdownOption } from 'tdesign-react';
import { cn } from '@/lib/utils';
import {
  ZoomInIcon,
  ZoomOutIcon,
  PlusIcon,
  SaveIcon,
  CommandIcon,
  TimeIcon,
  ListIcon,
  BookOpenIcon,
  ChartHistogramIcon,
  TreeIcon,
  PieIcon,
  RelationalGraphIcon,
  SettingIcon,
  PaletteIcon,
  LayersIcon,
  FullScreenIcon,
  UserIcon,
  GlobeIcon,
  RobotIcon,
  EditIcon,
  BookmarkIcon,
  FolderOpenIcon,
  DownIcon,
  SettingConfigIcon,
  type IconParkIconProps,
} from '@/lib/icons';
import { TButton, TSlider, TTooltip, TPopup } from '@/components/ui-tdesign';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useUIStore } from '@/stores/useUIStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useViewStore, type ViewId } from '@/stores/useViewStore';
import type { PageId } from '@/stores/useUIStore';
import { useWorkspaces, useWorkspace } from '@/services/api-hooks';
import { useCommandContext } from '@/components/command-palette/commands';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { toast } from 'sonner';

type IconComponent = (props: IconParkIconProps) => React.ReactElement;

interface NavTab {
  id: PageId;
  viewId?: ViewId; // 若对应 ViewId，点击时同时切换 activeView
  label: string;
  icon: IconComponent;
}

// 全局导航 Tab 定义：借鉴洛笙创作的顶部水平导航
const NAV_TABS: NavTab[] = [
  { id: 'timeline', viewId: 'timeline', label: '时间轴', icon: TimeIcon },
  { id: 'characters', label: '角色', icon: UserIcon },
  { id: 'outline', viewId: 'outline', label: '大纲', icon: ListIcon },
  { id: 'narrative', viewId: 'narrative', label: '细纲', icon: BookOpenIcon },
  { id: 'gantt', viewId: 'gantt', label: '甘特', icon: ChartHistogramIcon },
  { id: 'tree', viewId: 'tree', label: '树状', icon: TreeIcon },
  { id: 'stats', viewId: 'stats', label: '统计', icon: PieIcon },
  { id: 'relationship', viewId: 'relationship', label: '关系', icon: RelationalGraphIcon },
  { id: 'world', label: '世界', icon: GlobeIcon },
  { id: 'writing', viewId: 'writing', label: '写作', icon: EditIcon },
  { id: 'notebook', viewId: 'notebook', label: '资料库', icon: BookmarkIcon },
  { id: 'ai', label: 'AI助手', icon: RobotIcon },
];

export function TopToolbar() {
  const { t } = useTranslation();
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const zoomIn = useTimelineStore((s) => s.zoomIn);
  const zoomOut = useTimelineStore((s) => s.zoomOut);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const setCurrentPage = useUIStore((s) => s.setCurrentPage);
  const currentPage = useUIStore((s) => s.currentPage);
  const setActiveView = useViewStore((s) => s.setActiveView);

  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const { data: workspaces } = useWorkspaces();
  const { data: currentWorkspace } = useWorkspace(currentWorkspaceId);
  const ctx = useCommandContext();

  // 工作区菜单选项（从左侧品牌区移至右侧操作区）
  const workspaceMenuOptions: DropdownOption[] = [
    ...(workspaces || []).map((ws) => ({
      content: ws.name,
      value: ws.id,
      active: ws.id === currentWorkspaceId,
      prefixIcon: <FolderOpenIcon className={ws.id === currentWorkspaceId ? 'text-primary' : ''} />,
    })),
    { content: '-', value: 'divider', disabled: true },
    {
      content: t('workspace.createNewWorkspace') || '新建工作区',
      value: 'action:new',
      prefixIcon: <PlusIcon />,
    },
    {
      content: t('workspace.manageWorkspace') || '管理工作区',
      value: 'action:manage',
      prefixIcon: <SettingConfigIcon />,
    },
  ];

  const handleWorkspaceMenuClick = (option: DropdownOption) => {
    const value = option.value as string;
    if (value === 'divider') return;
    if (value.startsWith('action:')) {
      const action = value.replace('action:', '');
      if (action === 'new') {
        setCreateWorkspaceOpen(true);
      } else if (action === 'manage') {
        useWorkspaceStore.getState().setCurrentWorkspace(null);
      }
      return;
    }
    setCurrentWorkspace(value);
  };

  const handleNavClick = (tab: NavTab) => {
    // 同时设置当前页面和 activeView（若存在映射）
    setCurrentPage(tab.id);
    if (tab.viewId) {
      setActiveView(tab.viewId);
    }
  };

  return (
    <header
      className="relative flex h-(--toolbar-height) items-center gap-2 border-b border-border/40 glass-v2 px-3"
      style={{ zIndex: 'var(--z-toolbar)' }}
    >
      {/* 左侧：品牌 Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 pr-2 group loom-warp">
          <LayersIcon className="size-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="hidden select-none font-serif text-sm font-semibold tracking-tight sm:inline">
            Storyloom
          </span>
        </div>
      </div>

      {/* 中间：水平导航 Tab 组 */}
      <nav className="flex-1 flex items-center justify-center min-w-0">
        <div className="flex items-center gap-0.5 rounded-xl bg-muted/40 p-1 overflow-x-auto no-scrollbar">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab)}
                className={cn(
                  'ripple-btn relative flex h-(--toolbar-tab-height) items-center gap-1.5 rounded-lg px-2.5 text-xs transition-all duration-200 whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-background font-medium text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                )}
                title={tab.label}
              >
                <Icon className={cn('size-3.5 shrink-0 transition-colors', isActive ? 'text-primary' : '')} />
                <span className="hidden md:inline whitespace-nowrap">{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 右侧：操作按钮区（紧凑布局） */}
      <div className="flex items-center gap-1 shrink-0">
        {/* 工作区选择器（从左侧品牌区移至右侧操作区） */}
        <Dropdown
          options={workspaceMenuOptions}
          trigger="click"
          placement="bottom-left"
          minColumnWidth={200}
          onClick={handleWorkspaceMenuClick}
        >
          <TButton variant="text" size="small" className="gap-1.5 font-medium rounded-md hover:bg-muted/80">
            <FolderOpenIcon className="size-4 text-muted-foreground" />
            <span className="max-w-[60px] sm:max-w-[80px] truncate text-xs">
              {currentWorkspace?.name || t('workspace.selectPlaceholder')}
            </span>
            <DownIcon className="size-3 opacity-60 transition-transform duration-200" />
          </TButton>
        </Dropdown>

        <div className="h-5 w-px bg-border/50" />

        {/* 缩放控制组 */}
        <div className="hidden sm:flex items-center gap-0.5 rounded-xl bg-muted/50 px-1.5 py-1">
          <TTooltip content={t('topbar.zoomOut')} placement="bottom">
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              onClick={() => zoomOut(0.1)}
            >
              <ZoomOutIcon size={18} />
            </button>
          </TTooltip>
          <div className="flex w-20 flex-col gap-0 px-0.5">
            <TSlider
              value={Math.round(zoom * 100)}
              min={50}
              max={300}
              step={1}
              onChange={(v) => setZoom((v as number) / 100)}
              label={false}
              inputNumberProps={false}
              className="w-full"
            />
          </div>
          <TTooltip content={t('topbar.zoomIn')} placement="bottom">
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              onClick={() => zoomIn(0.1)}
            >
              <ZoomInIcon size={18} />
            </button>
          </TTooltip>
        </div>

        {/* 分隔线 */}
        <div className="h-5 w-px bg-border/50" />

        {/* 操作组：禅模式 + 新建 + 保存 */}
        <div className="flex items-center gap-0.5 rounded-xl bg-muted/50 px-1.5 py-1">
          <TTooltip content={t('topbar.zenMode')} placement="bottom">
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              onClick={() => useUIStore.getState().toggleZenMode()}
            >
              <FullScreenIcon size={18} />
            </button>
          </TTooltip>

          <TTooltip content={t('topbar.newEvent')} placement="bottom">
            <TButton
              variant="base"
              size="small"
              theme="success"
              className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
              onClick={ctx.createEvent}
            >
              <PlusIcon size={16} />
              <span className="hidden sm:inline">{t('topbar.new')}</span>
            </TButton>
          </TTooltip>

          <TTooltip content={t('topbar.saveShortcut')} placement="bottom">
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              onClick={ctx.save}
            >
              <SaveIcon size={18} />
            </button>
          </TTooltip>
        </div>

        {/* 分隔线 */}
        <div className="h-5 w-px bg-border/50" />

        {/* 辅助工具组：命令面板 + 设置 + 主题 */}
        <div className="flex items-center gap-0.5 rounded-xl bg-muted/50 px-1.5 py-1">
          <TTooltip content={`${t('topbar.commandPaletteShortcut')} (Ctrl+K)`} placement="bottom">
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <CommandIcon size={18} />
            </button>
          </TTooltip>

          <LanguageSelector />

          <TTooltip content={t('topbar.settings')} placement="bottom">
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              aria-label={t('topbar.settings')}
              onClick={() => setSettingsOpen(true)}
            >
              <SettingIcon size={18} />
            </button>
          </TTooltip>

          <TPopup
            trigger="click"
            placement="bottom-right"
            content={
              <div
                className="w-80 space-y-3 p-3"
                style={{
                  backgroundColor: 'rgb(var(--popover))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="text-sm font-medium">{t('topbar.selectTheme')}</div>
                <ThemeSelector />
              </div>
            }
          >
            <button
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-90"
              aria-label={t('topbar.selectTheme')}
            >
              <PaletteIcon size={18} />
            </button>
          </TPopup>
        </div>
      </div>

      {/* 新建工作区对话框 */}
      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
        onCreated={(id: string) => {
          setCurrentWorkspace(id);
          toast.success(t('workspace.created'));
        }}
      />
    </header>
  );
}
