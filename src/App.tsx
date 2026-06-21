import { AppShell } from '@/components/layout/AppShell';
import { WorkspaceInitializer } from '@/components/workspace/WorkspaceInitializer';
import { UpdateNotifier } from '@/components/system/UpdateNotifier';
import { ParticleCanvas } from '@/components/_shared/ParticleCanvas';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useEffect } from 'react';

function App() {
  const fontFamily = useSettingsStore((s) => s.fontFamily);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontFamily);
  }, [fontFamily]);

  return (
    <>
      <ParticleCanvas />
      <WorkspaceInitializer />
      <AppShell />
      <UpdateNotifier />
    </>
  );
}

export default App;
