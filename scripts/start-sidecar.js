#!/usr/bin/env node
/**
 * Storyloom Sidecar Development Starter
 *
 * 开发模式下启动后端 sidecar（Node.js 进程），模拟 Tauri 的启动行为。
 * 前端通过 Vite dev server 运行，本脚本负责启动后端并打印端口。
 *
 * Usage: node scripts/start-sidecar.js
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const dataDir = path.join(rootDir, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const env = {
  ...process.env,
  NODE_ENV: 'development',
  DATA_DIR: dataDir,
  MIGRATIONS_DIR: path.join(rootDir, 'drizzle'),
  STORYLOOM_SIDECAR: '1',
};

const sidecarEntry = path.join(rootDir, 'server', 'sidecar-entry.ts');

// 使用 tsx 直接运行 TypeScript（开发模式）
const proc = spawn('npx', ['tsx', 'watch', sidecarEntry], {
  cwd: rootDir,
  env,
  stdio: ['inherit', 'pipe', 'inherit'],
});

proc.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const msg = JSON.parse(trimmed);
      if (msg.type === 'ready') {
        console.log(`\x1b[32m[dev-sidecar] Backend ready on port ${msg.port}\x1b[0m`);
        continue;
      }
    } catch {
      // 不是 JSON，视为普通输出
    }

    console.log(`[sidecar] ${trimmed}`);
  }
});

proc.on('error', (err) => {
  console.error('[dev-sidecar] Failed to start sidecar:', err.message);
  process.exit(1);
});

proc.on('exit', (code) => {
  process.exit(code ?? 0);
});
