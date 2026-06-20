import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'circle' | 'text' | 'title' | 'button' | 'avatar';
}

/**
 * 骨架屏加载组件
 * 使用 CSS shimmer 动画，无需 JS 动画
 */
export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const variantClass = {
    default: 'h-4 w-full',
    card: 'h-32 w-full rounded-xl',
    circle: 'h-10 w-10 rounded-full',
    text: 'h-3 w-3/4 rounded',
    title: 'h-5 w-1/2 rounded',
    button: 'h-9 w-24 rounded-lg',
    avatar: 'h-8 w-8 rounded-full',
  };

  return (
    <div className={cn('skeleton-pulse', variantClass[variant], className)} />
  );
}

interface SkeletonGroupProps {
  children?: React.ReactNode;
  className?: string;
}

export function SkeletonGroup({ children, className }: SkeletonGroupProps) {
  return (
    <div className={cn('flex flex-col gap-3 animate-pulse', className)}>
      {children}
    </div>
  );
}

/**
 * 时间轴骨架屏
 */
export function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex gap-2 mb-2">
        <Skeleton variant="text" className="w-32 h-6" />
        <Skeleton variant="text" className="w-20 h-6" />
        <div className="ml-auto flex gap-2">
          <Skeleton variant="circle" className="h-8 w-8" />
          <Skeleton variant="circle" className="h-8 w-8" />
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="text" className="w-32 h-10" />
          <div className="flex-1 flex gap-2">
            <Skeleton variant="card" className="h-14 flex-1" />
            <Skeleton variant="card" className="h-14 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 工作区卡片骨架屏
 */
export function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 p-5 space-y-3 skeleton-card">
      <div className="flex items-start justify-between gap-3">
        <Skeleton variant="title" className="h-5 w-3/4" />
        <Skeleton variant="circle" className="h-6 w-6" />
      </div>
      <Skeleton variant="text" className="h-3 w-full" />
      <Skeleton variant="text" className="h-3 w-2/3" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-4 w-16" />
        <Skeleton variant="text" className="h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * 面板列表骨架屏（用于角色、世界观、伏笔等面板）
 */
export function PanelListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border/30 p-3 skeleton-card"
        >
          <Skeleton variant="avatar" className="shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton variant="title" className="h-3.5 w-1/2" />
            <Skeleton variant="text" className="h-2.5 w-3/4" />
          </div>
          <Skeleton variant="button" className="h-7 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * 事件详情骨架屏
 */
export function EventDetailSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Skeleton variant="title" className="h-6 w-2/3" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-3 w-20" />
          <Skeleton variant="text" className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="h-3 w-full" />
        <Skeleton variant="text" className="h-3 w-5/6" />
        <Skeleton variant="text" className="h-3 w-4/6" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
      </div>
    </div>
  );
}

/**
 * 统计视图骨架屏
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-card space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" className="h-8 w-8" />
            <Skeleton variant="text" className="h-3 w-16" />
          </div>
          <Skeleton variant="title" className="h-8 w-12" />
          <Skeleton variant="text" className="h-2 w-20" />
        </div>
      ))}
      <div className="col-span-2 h-32 rounded-xl border border-border/30 p-3 skeleton-card space-y-2">
        <Skeleton variant="title" className="h-4 w-32" />
        <div className="flex gap-2 mt-2">
          <Skeleton variant="text" className="h-2 w-full" />
          <Skeleton variant="text" className="h-2 w-3/4" />
        </div>
      </div>
    </div>
  );
}
