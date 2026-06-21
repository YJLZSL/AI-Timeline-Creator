import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { WorkspaceInitializer } from '@/components/workspace/WorkspaceInitializer';
import { UpdateNotifier } from '@/components/system/UpdateNotifier';
import { ParticleCanvas } from '@/components/_shared/ParticleCanvas';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { isTauri, getServerPort, onServerPort } from '@/lib/tauri-api';
import { setApiBase } from '@/services/api';

function App() {
  const fontFamily = useSettingsStore((s) => s.fontFamily);
  const [booting, setBooting] = useState(isTauri());

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontFamily);
  }, [fontFamily]);

  // Tauri 环境下：监听 server-port 事件，获取后端端口
  useEffect(() => {
    if (!isTauri()) {
      setBooting(false);
      return;
    }

    // 尝试立即获取端口
    getServerPort()
      .then((port) => {
        setApiBase(port);
        setBooting(false);
      })
      .catch(() => {
        // 如果立即获取失败，监听事件
        const off = onServerPort((port) => {
          setApiBase(port);
          setBooting(false);
        });
        // 5 秒后超时，取消遮罩
        const timer = setTimeout(() => setBooting(false), 5000);
        return () => {
          off();
          clearTimeout(timer);
        };
      });
  }, []);

  return (
    <>
      {booting && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Storyloom 正在启动…</p>
          </div>
        </div>
      )}
      <ParticleCanvas />
      <WorkspaceInitializer />
      <AppShell />
      <UpdateNotifier />
    </>
  );
}

export default App;
