# Storyloom 文档一致性审查报告

> 审查范围：`D:/AIKFCC/Storyloom/docs/` 目录下所有 `.md` 文件 + 根目录 `README.md` + 根目录 `更新日志.md` + `package.json`
> 审查日期：基于当前本地文件系统状态
> 版本锚点：`package.json#version` = `1.3.0`

---

## 问题总览

| 问题分类 | 数量 | 严重程度 |
|---------|------|----------|
| 冲突 | 7 组 | 高 |
| 过时 | 12 项 | 高 |
| 缺失 | 6 项 | 中 |
| 格式/链接 | 8 项 | 中 |

---

## 一、冲突问题（高优先级）

### 1.1 技术栈描述冲突：Electron vs Tauri

#### 涉及文档：`docs/项目交接.md` vs `docs/交接-v1.2.0.md` vs `docs/更新日志-v1.2.2.md` vs `docs/文档索引.md` vs `README.md`/`docs/架构设计.md`
- **冲突点**: 项目已在 v1.3.0 完成从 Electron 到 Tauri 2.x 的迁移，但多份文档仍描述为 Electron 技术栈：
  - `docs/项目交接.md` 第11行：技术栈写为 `Electron 42 + React 19 + ...`
  - `docs/交接-v1.2.0.md` 第44行：技术栈写为 `Electron v42`
  - `docs/更新日志-v1.2.2.md` 第27-29行：技术栈确认写为 `Electron 42.4.0`
  - `docs/更新日志-v1.1.6.md` 第52行：构建产物为 `Storyloom-Setup-1.1.6.exe`（131 MB，Electron 产物体积）
  - `docs/文档索引.md` 第82-90行：自动更新机制描述为 `Electron 自动更新机制（electron-updater）`，`latest.yml` 是 Electron 的
  - 但 `README.md`、`docs/架构设计.md`、`docs/环境配置指南.md`、`docs/开发指南.md`、`docs/发版指南.md` 均明确为 **Tauri 2.x**，且 `src-tauri/` 目录存在、`electron/` 目录不存在、`package.json` 包含 `@tauri-apps/cli` 和 `@tauri-apps/plugin-updater`
- **建议**: 统一将所有仍在描述 Electron 的文档更新为 Tauri 2.x。Electron 相关内容仅作为历史版本记录保留。

### 1.2 版本号不一致

#### 涉及文档：多份文档的"当前版本"声明不一致
- **冲突点**: `package.json#version` = `1.3.0`，但各文档版本声明混乱：
  | 文档 | 声明版本 | 与 package.json 差距 |
  |------|---------|---------------------|
  | `docs/agents.md` | v1.2.3 基线 | -1 个补丁版本 |
  | `docs/AI集成指南.md` | v1.2.1 基线 | -2 个补丁版本 |
  | `docs/工作区与时间轴重构蓝图.md` | v1.2.1 基线 | -2 个补丁版本 |
  | `docs/项目交接.md` | v1.2.1（已发布） | -2 个补丁版本 |
  | `docs/交接-v1.2.0.md` | v1.2.0 | -1 个次要版本 |
  | `docs/文档索引.md` | v1.2.2 | -1 个补丁版本 |
  | `docs/更新日志-v1.2.2.md` | v1.2.2 | -1 个补丁版本 |
  | `docs/路线图-v1.3+.md` | 当前版本 v1.2.1 | -2 个补丁版本 |
  | `docs/更新日志-v1.2.1.md` | v1.2.1 | -2 个补丁版本 |
- **建议**: 以 `package.json` 为准，将所有文档的版本声明更新为 **v1.3.0**。对于历史版本日志文件，在标题中保留原版本号，但在文档开头增加"本文档记录 vX.Y.Z 历史版本"的说明。

### 1.3 appId / identifier 冲突

#### 涉及文档：`docs/交接-v1.2.0.md` vs `docs/架构设计.md`
- **冲突点**:
  - `docs/交接-v1.2.0.md` 第220行：`appId` 不可变更，写为 `com.ai.timeline-creator`
  - `docs/架构设计.md` 第429行：`identifier` 不可变更，写为 `com.storyloom.app`
  - `docs/发版指南.md` 第18行：也确认 `identifier` 为 `com.storyloom.app`
- **建议**: 以 `src-tauri/tauri.conf.json` 实际值为准。`docs/交接-v1.2.0.md` 是 Electron 时代的遗留文档，其中的 `com.ai.timeline-creator` 是旧应用 ID，应标注为历史信息。当前 Tauri 配置为 `com.storyloom.app`。

### 1.4 构建产物命名冲突

#### 涉及文档：`docs/发版指南.md` vs `docs/更新日志-v1.2.2.md` vs `release/` 目录实际文件
- **冲突点**:
  - `docs/发版指南.md` 第87行：Tauri 产物应为 `Storyloom_X.Y.Z_x64-setup.exe`
  - `docs/更新日志-v1.2.2.md` 第42行：产物为 `Storyloom-Setup-1.2.2.exe`
  - `release/` 目录实际：既有 `Storyloom-Setup-1.2.2.exe`（Electron 时代命名），也有 `Storyloom Setup 1.3.0.exe`（空格命名，Tauri 默认命名）
- **建议**: 统一产物命名规范。如果 Tauri 构建系统实际输出的是 `Storyloom Setup X.Y.Z.exe`，则更新 `发版指南.md` 中的描述；如果需要统一为连字符命名，应更新 Tauri 构建配置。

### 1.5 构建产物体积冲突

#### 涉及文档：`docs/更新日志-v1.2.2.md` vs `docs/架构设计.md` vs `docs/发版指南.md`
- **冲突点**:
  - `docs/更新日志-v1.2.2.md` 第42行：产物体积约 **125 MB**（这是 Electron 时代的体积）
  - `docs/架构设计.md` 第386行：Tauri 产物约 **50 MB**（正确）
  - `docs/发版指南.md` 第90行：产物约 **50 MB**（正确）
- **建议**: `docs/更新日志-v1.2.2.md` 的产物体积描述是 Electron 时代的遗留数据，应更新为 Tauri 产物的实际体积。

### 1.6 仓库 owner 拼写错误

#### 涉及文档：`docs/文档索引.md`
- **冲突点**:
  - 第3行：`https://github.com/YJLZSL/Storyloom`（正确）
  - 第73行：`package.json#build.publish.owner` 必须是 `"YJSL"`（**错误**，少了字母 `Z`，应为 `YJLZSL`）
  - 第75行：`REPO_RELEASES_URL` 指向 `https://github.com/YJSL/Storyloom/releases`（**错误**，少了 `Z`）
  - 第76行：`docs/发版指南.md` 所有 URL 必须指向 `YJSL/Storyloom`（**错误**，少了 `Z`）
- **建议**: 将 `YJSL` 统一修正为 `YJLZSL`。当前仓库 URL 是 `https://github.com/YJLZSL/Storyloom`。

### 1.7 仓库 owner 历史记录矛盾

#### 涉及文档：`docs/更新日志.md` (根目录) v1.1.4 节 vs `docs/更新日志-v1.1.5.md` vs `docs/文档索引.md`
- **冲突点**:
  - 根目录 `更新日志.md` v1.1.4 节：写为"修复 `build.publish.owner` 指向错误仓库 (`YJLZSL`) 的问题，改为正确的 `liteli1987gmail`"
  - `docs/更新日志-v1.1.5.md` 第6-8行：写为"`package.json` 中 `build.publish` 的 `owner` 字段必须指向实际仓库 `YJLZSL`。v1.1.5 曾短暂错误地改为 `liteli1987gmail`（已修正回 `YJLZSL`）"
  - 两处描述完全矛盾：v1.1.4 说改成 `liteli1987gmail` 是"正确"的，v1.1.5 说改成 `liteli1987gmail` 是"错误"的
- **建议**: 以实际仓库 `YJLZSL/Storyloom` 为准。v1.1.4 的日志记录有误，应修正为"修复 `build.publish.owner` 错误指向 `liteli1987gmail` 的问题，改为正确的 `YJLZSL`"（但这又与 v1.1.5 的修复重复）。建议统一历史记录，明确说明 v1.1.4 或 v1.1.5 中的哪一次修复是真正有效的。

---

## 二、过时信息（高优先级）

### 2.1 过时的项目结构描述

#### 涉及文档：`docs/项目交接.md`
- **过时点**:
  - 第28行：项目结构仍列 `electron/` 目录（**实际不存在**，应为 `src-tauri/`）
  - 第27行：仍列 `tsconfig.electron.json`（**实际不存在**）
  - 第23行：`package.json` 描述为"依赖 + electron-builder 配置"（实际已无 electron-builder 配置，是 Tauri 配置）
  - 第62行：`release/` 目录描述为"构建产物（NSIS 安装包）"—— 实际上 release 目录中既有旧 Electron 产物也有新 Tauri 产物，描述不精确
- **建议**: 重写项目结构部分，移除 `electron/` 和 `tsconfig.electron.json`，添加 `src-tauri/` 目录结构说明。

### 2.2 过时的构建命令

#### 涉及文档：`docs/项目交接.md` / `docs/交接-v1.2.0.md` / `docs/开发指南.md`
- **过时点**:
  - `docs/项目交接.md` 第166行：`npm run build:electron`（**不存在**，应为 `npm run tauri:build`）
  - `docs/项目交接.md` 第134行：`npm run electron:rebuild`（**不存在**，Tauri 时代不需要）
  - `docs/项目交接.md` 第169行：`node scripts/build-nsis.cjs`（脚本存在，但 `docs/发版指南.md` 和 `README.md` 已改用 `npm run tauri:build`）
  - `docs/项目交接.md` 第172行：完整构建含 `npm run build:electron && npm run build:nsis`（已过时）
  - `docs/交接-v1.2.0.md` 第215行：`ATC_DIST_DIR="release" npx electron-builder --win --publish never`（Electron 命令，已过时）
  - `docs/开发指南.md` 第55行：仍列 `npm run dev:server`（旧版后端模式，Sidecar 模式下应优先使用 `npm run dev:sidecar`）
- **建议**: 统一以 `docs/发版指南.md` 和 `README.md` 中的 Tauri 构建命令为准。

### 2.3 过时的自动更新机制描述

#### 涉及文档：`docs/文档索引.md` / `docs/更新日志-v1.1.5.md` / `docs/更新日志-v1.1.6.md`
- **过时点**:
  - `docs/文档索引.md` 第84-90行：将 `latest.yml` 描述为 Electron 的 `electron-updater` 元数据
  - 实际：Tauri 使用 `tauri-plugin-updater`，需要 `.sig` 文件，而非 `latest.yml`（虽然 release 目录中仍有 `latest.yml`，但这是旧产物）
  - `docs/更新日志-v1.1.5.md` 第132行：验证结果包含 `latest.yml`（Electron 时代）
  - `docs/更新日志-v1.1.6.md` 第53行：构建产物包含 `latest.yml`（Electron 时代）
- **建议**: 更新 `docs/文档索引.md` 的自动更新说明，明确区分 Tauri 时代的 `tauri-plugin-updater` 和旧的 `electron-updater`。`latest.yml` 如果仍有保留，应说明为历史产物。

### 2.4 过时的路线图

#### 涉及文档：`docs/更新日志-v1.1.7.md` / `docs/更新日志-v1.1.6.md`
- **过时点**:
  - `docs/更新日志-v1.1.7.md` 第36-122行：规划了 v1.2.0（核心功能完善）、v1.3.0（AI 与 WebGAL 导出）、v1.4.0（视觉体验）、v1.5.0（导出与发布）
  - 实际：v1.3.0 已经实现 AI 深度集成（根目录更新日志 v1.3.0 节），但 WebGAL 导出尚未实现；路线图中的时间规划和功能分配已与现实脱节
  - `docs/更新日志-v1.1.6.md` 第58-129行：同样规划了 v1.2.0-v1.6.0 的路线图，已完全过时
- **建议**: 历史更新日志中的"未来计划"部分应标注为"历史规划，仅供参考，实际进展以最新路线图为准"，或直接删除并引用 `docs/路线图-v1.3+.md`。

### 2.5 过时的技术栈描述（更新日志）

#### 涉及文档：`docs/更新日志-v1.2.2.md`
- **过时点**: 第27-36行"技术栈确认"仍列 `Electron 42.4.0`，而 `package.json` 和 `src-tauri/` 已证实是 Tauri
- **建议**: 更新为 Tauri 2.11.x + React 19.2.7 + Fastify 5.x + better-sqlite3 12.11.x + Tailwind CSS 4.3.x 等实际版本。

### 2.6 过时的文档状态声明

#### 涉及文档：`docs/AI集成指南.md` / `docs/工作区与时间轴重构蓝图.md`
- **过时点**:
  - `docs/AI集成指南.md` 第5行：状态写为"待实施"；但根目录 `更新日志.md` v1.3.0 节已记录"AI 对话历史持久化"、"AI 工作区上下文注入"等功能已完成
  - `docs/工作区与时间轴重构蓝图.md` 第8行：状态写为"已实施"，但版本基线仍是 v1.2.1，与当前 v1.3.0 不匹配
- **建议**: `docs/AI集成指南.md` 应更新状态为"部分已实施"，并标注哪些功能已完成、哪些仍待实现（如美术丰富指南部分）。

### 2.7 过时的 Node.js 版本描述

#### 涉及文档：`docs/项目交接.md`
- **过时点**: 第15行：Node 版本写为 v24.15.1（通过 `C:\Users\23501\.astrbot_launcher\components\nodejs\`），但 `docs/环境配置指南.md` 和 `docs/开发指南.md` 均要求 Node.js 20.x LTS
- **建议**: 统一为 Node.js 20.x LTS（或更新为实际使用的版本，但需与其他文档一致）。

---

## 三、缺失信息（中优先级）

### 3.1 缺少 v1.3.0 专用更新日志文件

#### 涉及文档：`docs/更新日志-v1.2.2.md` 之后的版本
- **缺失点**: `docs/` 目录下没有 `docs/更新日志-v1.3.0.md`，但 `package.json` 已经是 1.3.0，且根目录 `更新日志.md` 有详细的 v1.3.0 变更记录
- **建议**: 创建 `docs/更新日志-v1.3.0.md`，并将根目录更新日志中的 v1.3.0 内容同步过来。

### 3.2 缺少 v1.2.3 更新日志文件和文档索引条目

#### 涉及文档：`docs/文档索引.md` / `docs/更新日志-v1.2.2.md`
- **缺失点**:
  - 根目录 `更新日志.md` 中有 `[1.2.3]` 节的详细记录（工作区重命名、启动行为设置、选择器冲突修复等）
  - 但 `docs/` 目录下没有 `docs/更新日志-v1.2.3.md`
  - `docs/文档索引.md` 的版本记录列表中也没有 v1.2.3
- **建议**: 创建 `docs/更新日志-v1.2.3.md`，并在 `docs/文档索引.md` 中添加条目。

### 3.3 文档索引未更新到 v1.3.0

#### 涉及文档：`docs/文档索引.md`
- **缺失点**:
  - 文档版本仍为 v1.2.2（第5行）
  - 没有 `docs/更新日志-v1.3.0.md` 的链接
  - 没有反映 Tauri 迁移后的文档变化
- **建议**: 全面更新文档索引，添加 v1.3.0 相关文档链接，更新版本号。

### 3.4 项目交接文档未更新 Tauri 相关信息

#### 涉及文档：`docs/项目交接.md`
- **缺失点**:
  - 未提及 `src-tauri/` 目录结构
  - 未提及 Tauri 特有的构建命令（`tauri:dev`、`tauri:build`、`build:sidecar`）
  - 未提及 Tauri 的 `identifier`（`com.storyloom.app`）
  - 未提及 Tauri 的自动更新机制（`tauri-plugin-updater` + `.sig` 文件）
  - 未提及 `src-tauri/sidecars/` 中的 sidecar 可执行文件
- **建议**: 重写 `docs/项目交接.md` 的技术栈和项目结构部分，全面替换为 Tauri 时代的描述。

### 3.5 根目录 README.md 链接指向不存在的文件

#### 涉及文档：`README.md` (根目录)
- **缺失点**: 第45行链接到 `.trae/documents/handoff-frontend-aesthetics.md`，但 `.trae/` 目录不存在
- **建议**: 移除该链接，或创建对应的文档文件。

### 3.6 教程文件位置矛盾

#### 涉及文档：`docs/更新日志.md` (根目录) v1.0.0 节 vs `docs/文档索引.md`
- **缺失点**:
  - 根目录 `更新日志.md` v1.0.0 节（第242-255行）说新增教程在 `docs/tutorials/`
  - `docs/文档索引.md` 第64行说 `docs/tutorials/` 已删除，唯一权威源是 `public/tutorials/`
  - 实际：`docs/tutorials/` 确实不存在，`public/tutorials/` 存在
  - 但根目录更新日志的历史记录错误地标记了教程路径，且 `docs/文档索引.md` 的"已清理的过期文件"列表中缺少对 `docs/tutorials/` 的清理说明（只在正文提到，没有列在清理清单中）
- **建议**: 在根目录 `更新日志.md` v1.0.0 节中标注教程路径的历史修正，或保持现状但确保 `docs/文档索引.md` 的清理清单完整。

---

## 四、格式和链接问题（中优先级）

### 4.1 断链：项目交接文档链接到不存在的文件

#### 涉及文档：`docs/项目交接.md`
- **问题**:
  - 第115行：链接到 `docs/ROADMAP-v1.3+.md`（**文件不存在**，实际文件名为 `docs/路线图-v1.3+.md`）
  - 第185行：链接到 `docs/快速参考`（**文件不存在**，实际文件名为 `docs/快速开始.md`）
- **建议**: 修正链接路径为实际存在的文件名。

### 4.2 断链：根目录 README.md 链接到不存在的文件

#### 涉及文档：`README.md` (根目录)
- **问题**:
  - 第39行：链接到 `./更新日志.md`（**存在**）
  - 第45行：链接到 `.trae/documents/handoff-frontend-aesthetics.md`（**不存在**）
- **建议**: 移除 `.trae/documents/handoff-frontend-aesthetics.md` 链接。

### 4.3 文档索引中的路径不一致

#### 涉及文档：`docs/文档索引.md`
- **问题**:
  - 第47行：`docs/更新日志-v1.2.2.md` 链接写为 `./更新日志-v1.2.2.md`（正确）
  - 但第18行 `更新日志.md` 的链接写为 `../更新日志.md`（正确，因为是返回上级目录）
  - 第43行：`docs/工作区与时间轴重构蓝图.md` 链接为 `./工作区与时间轴重构蓝图.md`（正确）
  - 整体链接格式一致，没有明显断链
- **建议**: 保持现状，但建议增加一个自动化脚本来检查所有相对链接的有效性。

### 4.4 历史更新日志中的构建产物命名不一致

#### 涉及文档：`docs/更新日志-v1.2.2.md` / `docs/更新日志-v1.1.6.md` / `docs/更新日志-v1.1.5.md`
- **问题**:
  - v1.2.2: `Storyloom-Setup-1.2.2.exe`
  - v1.1.6: `Storyloom-Setup-1.1.6.exe`
  - v1.1.5: `release/Storyloom Setup 1.1.5.exe`（含空格）和 `release/Storyloom-Setup-1.1.5.exe`
  - 实际 `release/` 目录中同时存在空格版和连字符版
- **建议**: 统一命名规范，并在文档中明确说明。Tauri 默认产物名通常含空格（`Storyloom Setup X.Y.Z.exe`），发版指南中的连字符命名可能是手动重命名或配置修改的结果。

### 4.5 文档标题与文件名的版本号不匹配

#### 涉及文档：`docs/更新日志-v1.2.2.md` / `docs/更新日志-v1.2.1.md` / `docs/更新日志-v1.2.0.md` 等
- **问题**: 这些文件标题中的版本号与文件命名一致，但与当前 package.json 版本（1.3.0）脱节。这不是错误，但缺少 v1.3.0 的对应文件。
- **建议**: 创建 `docs/更新日志-v1.3.0.md` 和 `docs/更新日志-v1.2.3.md`。

### 4.6 agents.md 版本声明与当前版本脱节

#### 涉及文档：`docs/agents.md`
- **问题**: 第5行写为"版本：v1.2.3 基线"，但当前项目已是 v1.3.0
- **建议**: 更新为 v1.3.0 基线，或标注"最后更新于 v1.3.0"。

### 4.7 发版指南中 Step 8 的 Release notes 路径

#### 涉及文档：`docs/发版指南.md`
- **问题**: 第109行：`--notes-file docs/CHANGELOG-vX.Y.Z.md`，但 `docs/` 目录下没有 `CHANGELOG-vX.Y.Z.md` 文件，而是使用中文命名的 `更新日志-vX.Y.Z.md`
- **建议**: 将 `CHANGELOG-vX.Y.Z.md` 改为 `更新日志-vX.Y.Z.md`，以匹配实际文件名。

### 4.8 架构设计文档中主题数量不一致的潜在问题

#### 涉及文档：`docs/架构设计.md`
- **问题**: 第242-253行列出了 8 个主题（洛生、子夜、森林、水墨、高对比、桜、深海、极光），但第6节标题写为"8 个主题"，而第246行实际上列出了 8 个。不过 `docs/更新日志-v1.1.7.md` 中提到的路线图有"主题系统 3.0"（完全自定义主题），但当前架构设计文档说已有 8 套主题。这不是直接冲突，但注意：v1.0.0 节说"6 套主题 + 集中调色板"，而架构设计说有 8 个。这实际上是因为 v1.1.x 后续增加了 2 个主题，所以不算错误。
- **建议**: 保持现状，但如需精确描述，可在历史更新日志中标注主题数量的演进。

---

## 五、按优先级排序的修复清单

### P0 — 立即修复（影响开发/发版正确性）

1. **统一技术栈描述为 Tauri**（`docs/项目交接.md`、`docs/交接-v1.2.0.md`、`docs/更新日志-v1.2.2.md`、`docs/文档索引.md`）
2. **统一版本号声明为 v1.3.0**（`docs/agents.md`、`docs/AI集成指南.md`、`docs/工作区与时间轴重构蓝图.md`、`docs/项目交接.md`、`docs/文档索引.md`、`docs/路线图-v1.3+.md`）
3. **修正断链**（`docs/项目交接.md` 中的 `ROADMAP-v1.3+.md` → `路线图-v1.3+.md`，`快速参考` → `快速开始.md`）
4. **修正仓库 owner 拼写错误**（`docs/文档索引.md` 中 3 处 `YJSL` → `YJLZSL`）
5. **修正 appId/identifier 冲突**（`docs/交接-v1.2.0.md` 中的 `com.ai.timeline-creator` 应标注为历史信息，当前为 `com.storyloom.app`）
6. **移除 README.md 中指向不存在的 `.trae/documents/handoff-frontend-aesthetics.md` 链接**
7. **修正 `docs/发版指南.md` 中 `CHANGELOG-vX.Y.Z.md` 为 `更新日志-vX.Y.Z.md`**
8. **修正 `docs/更新日志-v1.2.2.md` 中的 Electron 技术栈和产物体积**

### P1 — 尽快修复（避免误导新成员/AI）

9. **重写 `docs/项目交接.md` 的项目结构**（移除 `electron/`、`tsconfig.electron.json`，添加 `src-tauri/`）
10. **更新 `docs/项目交接.md` 的构建命令**（替换为 `npm run tauri:build`、`npm run build:sidecar`）
11. **更新 `docs/文档索引.md` 的自动更新说明**（`electron-updater` → `tauri-plugin-updater`，`latest.yml` → `.sig` + `latest.json`）
12. **更新 `docs/AI集成指南.md` 的状态**（"待实施" → "部分已实施"，标注已完成项）
13. **创建 `docs/更新日志-v1.2.3.md` 和 `docs/更新日志-v1.3.0.md`**
14. **更新 `docs/文档索引.md` 到 v1.3.0**（版本号、新增文档链接、清理过时条目）
15. **统一 `docs/更新日志-v1.1.4` 和 `v1.1.5` 中关于仓库 owner 的历史记录**
16. **在历史更新日志的"未来计划"部分添加"已过时"标注**

### P2 — 建议修复（提升文档质量）

17. **为所有文档添加"最后更新版本"脚注**（如 `*本文档基于 v1.3.0，最后更新：2026-XX-XX`*）
18. **建立文档版本与 `package.json#version` 的同步检查机制**（如 CI 脚本或预提交钩子）
19. **统一 `release/` 目录产物命名规范**（决定采用 Tauri 默认空格命名还是连字符命名，并更新所有文档）
20. **增加文档链接有效性检查**（推荐写一个脚本来遍历所有 `.md` 文件中的相对链接并验证）
21. **清理 `docs/交接-v1.2.0.md` 中大量 Electron 时代的过时信息**（或将其归档到 `_archive/`）
22. **将过时的历史更新日志中的"技术栈确认"和"构建产物"标注为历史快照**

---

*本报告基于 2026-06-21 前后时间点的文档快照生成。实际修复时请以当前代码和文件系统为准。*
