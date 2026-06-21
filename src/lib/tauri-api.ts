import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-shell';
import { open as openDialog, save as saveDialog, type OpenDialogOptions, type SaveDialogOptions } from '@tauri-apps/plugin-dialog';
import { check as checkUpdater } from '@tauri-apps/plugin-updater';

// ─── 环境检测 ───

/** 是否在 Tauri 桌面端运行 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** 是否在打包的生产环境 */
export function isPackaged(): boolean {
  return isTauri() && import.meta.env.PROD;
}

// ─── 核心 API ───

export async function getServerPort(): Promise<number> {
  return await invoke<number>('get_server_port');
}

export async function openExternal(url: string): Promise<void> {
  if (isTauri()) {
    await open(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

export async function openLogFolder(): Promise<void> {
  const path = await getUserDataPath();
  await open(path);
}

export async function getUserDataPath(): Promise<string> {
  return await invoke<string>('get_user_data_path');
}

export async function getAppPath(): Promise<string> {
  return await invoke<string>('get_app_path');
}

// ─── 事件监听 ───

export function onServerPort(callback: (port: number) => void): () => void {
  let unlisten: (() => void) | undefined;
  const setup = async () => {
    unlisten = await listen<number>('server-port', (event) => {
      callback(event.payload);
    });
  };
  void setup();
  return () => {
    unlisten?.();
  };
}

export function onDisplayScaleChanged(callback: () => void): () => void {
  let unlisten: (() => void) | undefined;
  const setup = async () => {
    unlisten = await listen('display-scale-changed', () => {
      callback();
    });
  };
  void setup();
  return () => {
    unlisten?.();
  };
}

// ─── 文件操作 ───

export async function readFile(path: string): Promise<string> {
  return await invoke<string>('read_file', { path });
}

export async function writeFile(path: string, contents: string): Promise<void> {
  await invoke('write_file', { path, contents });
}

export async function deleteFile(path: string): Promise<void> {
  await invoke('delete_file', { path });
}

export async function listDir(path: string): Promise<string[]> {
  return await invoke<string[]>('list_dir', { path });
}

export async function findAvailablePort(start?: number, end?: number): Promise<number> {
  return await invoke<number>('find_available_port', { start, end });
}

export async function isPortAvailable(port: number, host?: string): Promise<boolean> {
  return await invoke<boolean>('is_port_available', { port, host });
}

export async function writeLog(message: string, level?: string): Promise<void> {
  await invoke('write_log', { message, level });
}

// ─── 对话框 ───

export async function showOpenDialog(options?: OpenDialogOptions): Promise<string[] | null> {
  if (!isTauri()) return null;
  const result = await openDialog(options);
  return result ? (Array.isArray(result) ? result : [result]) : null;
}

export async function showSaveDialog(options?: SaveDialogOptions): Promise<string | null> {
  if (!isTauri()) return null;
  return await saveDialog(options);
}

// ─── 更新器 ───

export interface UpdateEventPayload {
  kind: 'checking' | 'available' | 'not-available' | 'error' | 'progress' | 'downloaded';
  version?: string;
  releaseNotes?: string | null;
  releaseName?: string | null;
  message?: string;
  percent?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
}

export function onUpdaterEvent(callback: (payload: UpdateEventPayload) => void): () => void {
  let unlisten: (() => void) | undefined;
  const setup = async () => {
    unlisten = await listen<UpdateEventPayload>('update:event', (event) => {
      callback(event.payload);
    });
  };
  void setup();
  return () => {
    unlisten?.();
  };
}

export async function checkUpdate(): Promise<{ ok: boolean; version?: string | null; error?: string }> {
  if (!isTauri()) return { ok: false, error: 'Not in Tauri' };
  try {
    const update = await checkUpdater();
    if (update) {
      return { ok: true, version: update.version };
    }
    return { ok: true, version: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function downloadUpdate(): Promise<{ ok: boolean; error?: string }> {
  if (!isTauri()) return { ok: false, error: 'Not in Tauri' };
  try {
    const update = await checkUpdater();
    if (update) {
      await update.downloadAndInstall(() => {
        // 下载事件通过 listen('update:event') 触发
      });
      return { ok: true };
    }
    return { ok: false, error: 'No update available' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function installUpdate(): Promise<{ ok: boolean }> {
  if (!isTauri()) return { ok: false };
  try {
    const update = await checkUpdater();
    if (update) {
      await update.downloadAndInstall();
      return { ok: true };
    }
    return { ok: false };
  } catch (e) {
    return { ok: false };
  }
}
