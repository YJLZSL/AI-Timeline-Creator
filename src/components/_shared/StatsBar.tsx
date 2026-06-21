import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TButton } from '@/components/ui-tdesign';
import { ListIcon, GridTwoIcon } from '@/lib/icons';

/**
 * 统计项颜色类型
 */
export type StatColor = 'blue' | 'green' | 'amber' | 'purple' | 'red';

/**
 * 统计项配置
 */
export interface StatItem {
  /** 标签（如"共"、"活跃"） */
  label: string;
  /** 数值 */
  value: number | string;
  /** 颜色主题 */
  color?: StatColor;
}

/**
 * 工具按钮配置
 */
export interface ToolAction {
  /** 按钮文字 */
  label: string;
  /** 按钮图标 */
  icon?: ReactNode;
  /** 点击回调 */
  onClick: () => void;
  /** 按钮样式变体 */
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * 视图切换选项
 */
export interface ViewToggleOption {
  /** 显示文字 */
  label: string;
  /** 标识值 */
  value: string;
  /** 图标 */
  icon?: ReactNode;
}

/**
 * 统一统计工具栏 Props
 */
export interface StatsBarProps {
  /** 统计项列表 */
  stats?: StatItem[];
  /** 视图切换配置 */
  viewToggle?: {
    options: ViewToggleOption[];
    active: string;
    onChange: (value: string) => void;
  };
  /** 工具按钮列表 */
  tools?: ToolAction[];
  /** 是否显示自动保存提示 */
  autoSave?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 将颜色标识映射为对应的 CSS 类名
 */
function getStatColorClasses(color: StatColor): {
  text: string;
  bg: string;
} {
  switch (color) {
    case 'green':
      return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' };
    case 'amber':
      return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
    case 'red':
      return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' };
    case 'purple':
      return { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' };
    case 'blue':
    default:
      return { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' };
  }
}

/**
 * 统一统计工具栏组件
 *
 * 功能：提供统计信息展示、视图切换（网格/列表）、工具按钮和自动保存提示。
 * 位于页面标题和搜索栏下方，内容区域上方。
 *
 * 使用示例：
 * ```tsx
 * <StatsBar
 *   stats={[
 *     { label: "共", value: 42, color: "blue" },
 *     { label: "活跃", value: 38, color: "green" },
 *     { label: "归档", value: 4, color: "amber" },
 *   ]}
 *   viewToggle={{
 *     options: [
 *       { label: "网格", value: "grid", icon: <GridTwoIcon size={14} /> },
 *       { label: "列表", value: "list", icon: <ListIcon size={14} /> },
 *     ],
 *     active: viewMode,
 *     onChange: setViewMode,
 *   }}
 *   tools={[
 *     { label: "导出", icon: <DownloadIcon size={14} />, onClick: handleExport },
 *   ]}
 *   autoSave
 * />
 * ```
 */
export function StatsBar({
  stats,
  viewToggle,
  tools,
  autoSave = false,
  className,
}: StatsBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'py-2 px-6 border-b border-border/40',
        className
      )}
    >
      {/* 左侧：统计项 + 自动保存提示 */}
      <div className="flex items-center gap-3">
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-2">
            {stats.map((stat, index) => {
              const colorClasses = stat.color
                ? getStatColorClasses(stat.color)
                : { text: 'text-foreground', bg: 'bg-muted/50' };

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-1.5',
                    'px-3 py-1.5 rounded-lg',
                    'bg-muted/50',
                    colorClasses.bg
                  )}
                >
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className={cn('text-sm font-semibold tabular-nums', colorClasses.text)}>
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 自动保存提示 */}
        {autoSave && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-muted-foreground">已自动保存</span>
          </div>
        )}
      </div>

      {/* 右侧：视图切换 + 工具按钮 */}
      <div className="flex items-center gap-2">
        {/* 视图切换 */}
        {viewToggle && viewToggle.options.length > 0 && (
          <div className="flex items-center rounded-lg bg-muted/50 p-0.5">
            {viewToggle.options.map((option) => {
              const isActive = option.value === viewToggle.active;
              return (
                <button
                  key={option.value}
                  onClick={() => viewToggle.onChange(option.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all duration-200',
                    isActive
                      ? 'bg-card text-foreground shadow-sm font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                >
                  {option.icon && <span className="flex items-center">{option.icon}</span>}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 工具按钮 */}
        {tools && tools.length > 0 && (
          <div className="flex items-center gap-1">
            {tools.map((tool, index) => (
              <TButton
                key={index}
                variant={
                  tool.variant === 'primary'
                    ? 'base'
                    : tool.variant === 'danger'
                      ? 'base'
                      : 'outline'
                }
                theme={
                  tool.variant === 'danger'
                    ? 'danger'
                    : tool.variant === 'primary'
                      ? 'primary'
                      : 'default'
                }
                size="small"
                onClick={tool.onClick}
                className="gap-1"
              >
                {tool.icon && <span className="flex items-center">{tool.icon}</span>}
                <span>{tool.label}</span>
              </TButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 默认视图切换选项工厂函数
 * 快速生成网格/列表切换选项
 */
export function createDefaultViewOptions(
  gridLabel = '网格',
  listLabel = '列表'
): ViewToggleOption[] {
  return [
    { label: gridLabel, value: 'grid', icon: <GridTwoIcon size={14} /> },
    { label: listLabel, value: 'list', icon: <ListIcon size={14} /> },
  ];
}
