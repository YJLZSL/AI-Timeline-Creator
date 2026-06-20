import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'dashed' | 'minimal';
  /** 是否显示织机风格插画背景 */
  showIllustration?: boolean;
  /** 副标题下方的提示文字 */
  hint?: string;
}

/**
 * 统一空状态组件
 * 替代全站 4+ 种空状态风格（渐变卡片 / border-dashed 虚线框 / 纯文字）。
 * 参考 Kindling 风格：温暖插画 + 清晰引导 + 行动号召。
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default',
  showIllustration = true,
  hint,
}: EmptyStateProps) {
  const variantStyles = {
    default: 'flex flex-col items-center justify-center text-center p-8 rounded-xl border border-border/60 bg-card/50',
    dashed: 'flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-border/60 bg-card/30',
    minimal: 'flex flex-col items-center justify-center text-center p-4',
  };

  return (
    <div className={cn(variantStyles[variant], 'relative overflow-hidden', className)}>
      {/* 背景插画光晕 */}
      {showIllustration && (
        <div className="empty-illustration mb-4 flex items-center justify-center">
          {icon ? (
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/70 transition-colors duration-300 hover:bg-muted/80 hover:text-primary/70">
              {icon}
            </div>
          ) : (
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                className="h-8 w-8 text-muted-foreground/40"
                aria-hidden="true"
              >
                <rect x="8" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                <rect x="26" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                <rect x="8" y="26" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                <rect x="26" y="26" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                <path d="M22 15h4M15 22v4M34 22v4M22 33h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
          )}
        </div>
      )}

      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground max-w-[240px] leading-relaxed">{description}</p>
      )}
      {hint && (
        <p className="mt-2 text-[11px] text-muted-foreground/60 max-w-[240px] leading-relaxed italic">{hint}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * 面板空状态 - 用于 ContextPanel 等右侧面板
 */
interface PanelEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PanelEmptyState({ icon, title, description, action }: PanelEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6 py-12">
      <div className="empty-illustration mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/60">
          {icon ?? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            </svg>
          )}
        </div>
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground/80 max-w-[220px] leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/**
 * 列表空状态 - 用于表格/列表
 */
interface ListEmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ListEmptyState({ title, description, action }: ListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-muted-foreground/50" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <path d="M7 9h4M7 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/70 max-w-[200px]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
