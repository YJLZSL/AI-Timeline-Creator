import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { TButton } from '@/components/ui-tdesign';
import { CautionIcon } from '@/lib/icons';

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

let showConfirmDialogFn: ((options: ConfirmDialogOptions) => Promise<boolean>) | null = null;

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [state, setState] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    resolve: null,
  });

  const showConfirmDialog = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  showConfirmDialogFn = showConfirmDialog;

  const handleClose = useCallback((result: boolean) => {
    setState((prev) => {
      prev.resolve?.(result);
      return { ...prev, open: false };
    });
  }, []);

  return (
    <>
      {children}
      <Dialog open={state.open} onOpenChange={(open: boolean) => !open && handleClose(false)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              {state.variant === 'destructive' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <CautionIcon size={16} className="text-destructive" />
                </div>
              )}
              <div className="min-w-0">
                <DialogTitle>{state.title}</DialogTitle>
                {state.description && (
                  <DialogDescription>{state.description}</DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <TButton
              variant="outline"
              size="small"
              onClick={() => handleClose(false)}
            >
              {state.cancelText || t('common.cancel', '取消')}
            </TButton>
            <TButton
              theme={state.variant === 'destructive' ? 'danger' : 'primary'}
              size="small"
              onClick={() => handleClose(true)}
            >
              {state.confirmText || t('common.confirm', '确认')}
            </TButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  if (!showConfirmDialogFn) {
    console.warn('ConfirmDialogProvider not mounted');
    return Promise.resolve(false);
  }
  return showConfirmDialogFn(options);
}
