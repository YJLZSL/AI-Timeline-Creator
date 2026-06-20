import { AppShell } from '@/components/layout/AppShell';
import { WorkspaceInitializer } from '@/components/workspace/WorkspaceInitializer';
import { UpdateNotifier } from '@/components/system/UpdateNotifier';
import { ParticleCanvas } from '@/components/_shared/ParticleCanvas';

function App() {
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
