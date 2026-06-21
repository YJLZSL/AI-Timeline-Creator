import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" data-dialog-open="true">
      {/* 半透明遮罩 */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* 内容容器 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface DialogContentProps {
  children?: ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl p-6',
        'animate-in fade-in zoom-in-95 duration-200 ease-out',
        className
      )}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children?: ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('space-y-2 mb-5', className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children?: ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-foreground leading-tight', className)}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  children?: ReactNode;
  className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground leading-relaxed', className)}>
      {children}
    </p>
  );
}

interface DialogFooterProps {
  children?: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn('flex justify-end gap-2 mt-6 pt-4 border-t border-border/30', className)}>
      {children}
    </div>
  );
}
