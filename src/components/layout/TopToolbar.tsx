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
  FolderOpenIcon,
  DownIcon,
  DeleteIcon,
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
  type IconParkIconProps,
} from '@/lib/icons';
import { TButton, TSlider, TTooltip, TPopup } from '@/components/ui-tdesign';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useUIStore } from '@/stores/useUIStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useViewStore, type ViewId } from '@/stores/useViewStore';
import {
  useWorkspaces,
  useWorkspace,
  useCreateWorkspace,
  useDeleteWorkspace,
} from '@/services/api-hooks';
import { useCommandContext } from '@/components/command-palette/commands';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { toast } from 'sonner';

const ACTION_NEW = '__new__';
const ACTION_DELETE_PREFIX = '__delete__:';

type IconComponent = (props: IconParkIconProps) => React.ReactElement;

interface ViewTab {
  id: ViewId;
  label: string;
  icon: IconComponent;
}

const VIEW_TABS: ViewTab[] = [
  { id: 'timeline', label: 'Timeline', icon: TimeIcon },
  { id: 'outline', label: 'Outline', icon: ListIcon },
  { id: 'narrative', label: 'Narrative', icon: BookOpenIcon },
  { id: 'gantt', label: 'Gantt', icon: ChartHistogramIcon },
  { id: 'tree', label: 'Tree', icon: TreeIcon },
  { id: 'stats', label: 'Stats', icon: PieIcon },
  { id: 'relationship', label: 'Graph', icon: RelationalGraphIcon },
];

export function TopToolbar() {
  const { t } = useTranslation();
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const zoomIn = useTimelineStore((s) => s.zoomIn);
  const zoomOut = useTimelineStore((s) => s.zoomOut);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const activeView = useViewStore((s) => s.activeView);
  const setActiveView = useViewStore((s) => s.setActiveView);

  const { data: workspaces } = useWorkspaces();
  const { data: currentWorkspace } = useWorkspace(currentWorkspaceId);
  const createWorkspaceMutation = useCreateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();
  const ctx = useCommandContext();

  const workspaceOptions: DropdownOption[] = [
    ...(workspaces || []).map((ws) => ({
      content: ws.name,
      value: ws.id,
      active: ws.id === currentWorkspaceId,
      children: [
        {
          content: t('workspace.switchTo'),
          value: ws.id,
          prefixIcon: <FolderOpenIcon />,
        },
        {
          content: t('workspace.deleteWorkspace'),
          value: `${ACTION_DELETE_PREFIX}${ws.id}`,
          theme: 'error' as const,
          prefixIcon: <DeleteIcon />,
        },
      ],
    })),
    {
      content: t('workspace.createNewWorkspace'),
      value: ACTION_NEW,
      divider: true,
      prefixIcon: <PlusIcon />,
    },
  ];

  const handleDropdownClick = (option: DropdownOption) => {
    const value = option.value;
    if (typeof value !== 'string') return;
    if (value === ACTION_NEW) {
      createWorkspaceMutation.mutate(
        { name: t('workspace.defaultName', { date: new Date().toLocaleDateString() }) },
        {
          onSuccess: (workspace) => {
            setCurrentWorkspace(workspace.id);
            toast.success(t('workspace.created'));
          },
          onError: () => toast.error(t('workspace.createFailed')),
        },
      );
      return;
    }
    if (value.startsWith(ACTION_DELETE_PREFIX)) {
      const id = value.slice(ACTION_DELETE_PREFIX.length);
      if (!confirm(t('workspace.deleteConfirmShort'))) return;
      deleteWorkspaceMutation.mutate(id, {
        onSuccess: () => {
          if (id === currentWorkspaceId) setCurrentWorkspace(null);
          toast.success(t('workspace.deleted'));
        },
        onError: () => toast.error(t('workspace.deleteFailed')),
      });
      return;
    }
    setCurrentWorkspace(value);
  };

  return (
    <header
      className="relative flex h-11 items-center gap-2 border-b border-border/60 bg-background/90 px-3 backdrop-blur"
      style={{ zIndex: 'var(--z-toolbar)' }}
    >
      {/* 左侧：品牌 + 工作区 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 pr-2 group loom-warp">
          <LayersIcon className="size-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="hidden select-none font-serif text-sm font-semibold tracking-tight sm:inline">
            Storyloom
          </span>
        </div>

        <div className="h-5 w-px bg-border/60" />

        <Dropdown
          options={workspaceOptions}
          trigger="click"
          placement="bottom-left"
          minColumnWidth={180}
          onClick={handleDropdownClick}
        >
          <TButton variant="text" size="small" className="gap-1.5 font-medium rounded-md hover:bg-muted/80">
            <FolderOpenIcon className="size-4 text-muted-foreground" />
            <span className="max-w-[120px] truncate text-xs">
              {currentWorkspace?.name || t('workspace.selectPlaceholder')}
            </span>
            <DownIcon className="size-3 opacity-60 transition-transform duration-200" />
          </TButton>
        </Dropdown>
      </div>

      {/* 中间：视图 Tab */}
      <nav className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-0.5 rounded-xl bg-muted/40 p-1">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-200',
                  isActive
                    ? 'bg-background font-medium text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                )}
              >
                <Icon className={cn('size-3.5 transition-colors', isActive ? 'text-primary' : '')} />
                <span className="hidden sm:inline">{t(`views.${tab.id}` as const)}</span>
                {isActive && (
                  <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-1">
        <TTooltip content={t('topbar.zoomOut')} placement="bottom">
          <TButton
            variant="text"
            size="small"
            shape="square"
            className="size-7 btn-lift hover:bg-muted/80"
            onClick={() => zoomOut(0.1)}
          >
            <ZoomOutIcon className="size-4 text-muted-foreground" />
          </TButton>
        </TTooltip>

        <div className="flex w-28 flex-col gap-0 px-1">
          <span className="text-center text-[9px] font-mono tabular-nums text-muted-foreground/60">
            {Math.round(zoom * 100)}%
          </span>
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
          <TButton
            variant="text"
            size="small"
            shape="square"
            className="size-7 btn-lift hover:bg-muted/80"
            onClick={() => zoomIn(0.1)}
          >
            <ZoomInIcon className="size-4 text-muted-foreground" />
          </TButton>
        </TTooltip>

        <div className="mx-1 h-5 w-px bg-border/60" />

        <TTooltip content={t('topbar.zenMode')} placement="bottom">
          <TButton
            variant="text"
            size="small"
            shape="square"
            className="size-7 btn-lift hover:bg-muted/80"
            onClick={() => useUIStore.getState().toggleZenMode()}
          >
            <FullScreenIcon className="size-4 text-muted-foreground" />
          </TButton>
        </TTooltip>

        <TTooltip content={t('topbar.newEvent')} placement="bottom">
          <TButton
            variant="text"
            size="small"
            theme="success"
            className="gap-1 text-xs btn-lift hover:bg-green-50/50 dark:hover:bg-green-900/20"
            onClick={ctx.createEvent}
          >
            <PlusIcon className="size-4" />
            {t('topbar.new')}
          </TButton>
        </TTooltip>

        <TTooltip content={t('topbar.saveShortcut')} placement="bottom">
          <TButton
            variant="text"
            size="small"
            className="gap-1 text-xs btn-lift hover:bg-muted/80"
            onClick={ctx.save}
          >
            <SaveIcon className="size-4 text-muted-foreground" />
            {t('common.save')}
          </TButton>
        </TTooltip>

        <div className="mx-1 h-5 w-px bg-border/60" />

        <TTooltip content={t('topbar.commandPaletteShortcut')} placement="bottom">
          <TButton
            variant="outline"
            size="small"
            className="gap-1 text-xs border-border/60 btn-lift hover:bg-muted/50"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <CommandIcon className="size-3.5" />
            <span className="hidden text-[10px] text-muted-foreground sm:inline">Ctrl+K</span>
          </TButton>
        </TTooltip>

        <LanguageSelector />

        <TTooltip content={t('topbar.settings')} placement="bottom">
          <TButton
            variant="text"
            size="small"
            shape="square"
            className="size-7 btn-lift hover:bg-muted/80"
            aria-label={t('topbar.settings')}
            onClick={() => setSettingsOpen(true)}
          >
            <SettingIcon className="size-4 text-muted-foreground" />
          </TButton>
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
          <TButton
            variant="text"
            size="small"
            shape="square"
            className="size-7 btn-lift hover:bg-muted/80"
            aria-label={t('topbar.selectTheme')}
          >
            <PaletteIcon className="size-4 text-muted-foreground" />
          </TButton>
        </TPopup>
      </div>
    </header>
  );
}
