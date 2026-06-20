import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUIStore } from '@/stores/useUIStore';
import { SettingsTabs } from './SettingsTabs';

export function SettingsDialog() {
  const open = useUIStore((s) => s.settingsOpen);
  const setOpen = useUIStore((s) => s.setSettingsOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 dialog-enter">
        <DialogTitle className="sr-only">设置</DialogTitle>
        <SettingsTabs />
      </DialogContent>
    </Dialog>
  );
}
