# Storyloom Sidecar Adapter Plan

## 阶段 1: 服务器 TypeScript 文件修改
- [ ] `server/index.ts` — 添加 sidecar 检测、文件日志、isDev 排除 sidecar
- [ ] `server/db/index.ts` — 添加 isSidecar 检查、确保生产路径
- [ ] `server/sidecar-entry.ts` — 创建新的 sidecar 入口文件
- [ ] `scripts/start-sidecar.js` — 创建开发启动脚本

## 阶段 2: 构建配置修改
- [ ] `tsconfig.server.json` — 确认包含 sidecar-entry.ts
- [ ] `package.json` — 添加 dev:sidecar、build:sidecar 脚本，添加 pkg 依赖

## 阶段 3: Tauri 配置修改
- [ ] `src-tauri/tauri.conf.json` — 添加 externalBin、更新 identifier/version
- [ ] `src-tauri/capabilities/default.json` — 添加 shell:allow-spawn

## 输出
- 修改的所有文件列表
- 新增的文件列表
- Sidecar 启动流程说明
- 环境变量传递映射表
- 开发模式 vs 生产模式的差异说明
