import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * 页面标题区 Props
 */
export interface PageHeaderProps {
  /** 页面主标题（如"角色管理"） */
  title: string;
  /** 副标题描述（如"创建、编辑和管理小说中的所有角色设定"） */
  subtitle?: string;
  /** 右侧操作按钮（如"创建角色"按钮） */
  action?: ReactNode;
  /** 标题左侧图标（可选） */
  icon?: ReactNode;
  /** 额外类名 */
  className?: string;
  /** 是否显示底部边框分隔线 */
  bordered?: boolean;
}

/**
 * 统一页面标题区组件
 *
 * 功能：统一页面顶部标题区域，包含标题、副标题、图标和右侧操作按钮。
 * 所有页面通过此组件确保标题区视觉一致性。
 *
 * 使用示例：
 * ```tsx
 * <PageHeader
 *   title="角色管理"
 *   subtitle="创建、编辑和管理小说中的所有角色设定"
 *   icon={<UserIcon size={20} />}
 *   action={<TButton theme="primary">创建角色</TButton>}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  action,
  icon,
  className,
  bordered = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        bordered && 'border-b border-border/40',
        'py-4 px-6',
        className
      )}
    >
      {/* 左侧：图标 + 标题 + 副标题 */}
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      {action && (
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * 简化版页面标题（无边框、无图标，仅标题和副标题）
 */
export function PageHeaderSimple({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('py-4 px-6', className)}>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
