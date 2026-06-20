import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'circle' | 'text';
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
    <div className="rounded-xl border border-border/40 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <Skeleton variant="text" className="h-5 w-3/4" />
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
