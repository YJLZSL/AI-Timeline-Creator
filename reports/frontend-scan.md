# Storyloom 前端代码质量扫描报告

> 扫描范围：`src/` 目录下所有 `.ts` / `.tsx` 文件  
> 扫描时间：2025-06-21  
> 扫描工具：人工代码审查 + TypeScript 编译器 (`tsc -b --noEmit`) + Grep 模式匹配  
> 备注：ESLint 未配置，所有 lint 类问题均通过人工审查发现。

---

## 执行摘要

| 问题类型 | 数量 | 优先级分布 |
|---|---|---|
| console.log 残留 | 7 | P0 |
| any 类型滥用 | 15+ | P0 / P1 |
| 过于复杂的函数/组件 | 5 | P1 |
| 重复代码片段 | 2 处 | P1 |
| TODO 遗留标记 | 1 | P1 |
| 死代码（未使用组件） | 1 | P1 |
| 未使用导入/变量 | 3 | P2 |
| 类型断言缺失 | 2 | P2 |

**TypeScript 编译结果**：`tsc -b --noEmit` 通过，无类型错误。  
**结论**：代码整体结构良好，但存在多处生产环境不应保留的调试日志和类型安全问题，建议优先清理。

---

## 问题详情

### 文件：`src/components/system/UpdateNotifier.tsx`

- **[console.log 残留] 第37行**: `console.error('[updater] auto check failed:', err);`
  - 建议：使用结构化日志或移除，生产环境不应直接输出到控制台
- **[console.log 残留] 第62行**: `console.warn('[updater] error event:', evt.message);`
  - 建议：同上，或降级为静默处理

---

### 文件：`src/components/layout/AppShell.tsx`

- **[console.log 残留] 第111行**: `console.warn('[AppShell] Failed to get server port');`
  - 建议：移除或替换为 toast 提示用户

---

### 文件：`src/stores/useWorkspaceStore.ts`

- **[console.log 残留] 第59行**: `console.error('[fetchWorkspaces] 失败:', err);`
- **[console.log 残留] 第78行**: `console.error('[createWorkspace] 失败:', err);`
- **[console.log 残留] 第98行**: `console.error('[updateWorkspace] 失败:', err);`
- **[console.log 残留] 第117行**: `console.error('[deleteWorkspace] 失败:', err);`
  - 建议：统一使用 toast 或外部日志系统，不要在生产代码中保留 `console.error`
- **[类型不一致] 第58、77、97、116行**: `catch (err: any)`
  - 建议：使用 `catch (err: unknown)` 并通过类型守卫处理，避免隐式 `any`

---

### 文件：`src/lib/tauri-api.ts`

- **[console.log 残留] 第164行**: `console.log('[updater] download event:', event);`
  - 建议：移除或仅在开发环境输出
- **[类型不一致] 第108、114行**: `options as any`
  - 建议：为 `showOpenDialog` / `showSaveDialog` 的 `options` 参数定义具体类型，避免 `as any` 断言

---

### 文件：`src/services/api-hooks-factory.ts`

- **[类型不一致] 第125行**: `listResponseTransformer?: (response: any) => ListT;`
- **[类型不一致] 第174行**: `const response = await api.get<any>(url);`
- **[类型不一致] 第233行**: `const previousList = qc.getQueryData<any>(listKey);`
- **[类型不一致] 第236行**: `const patch: any = { updatedAt: new Date() };`
- **[类型不一致] 第249、258行**: `(item: any) => ...`
- **[类型不一致] 第276、287、296行**: `_err: any`, `_: any`, `__: any`, `_ : any`
  - 建议：使用 `unknown` 替代 `any`；对 `patch` 使用 `Partial<T>` 或 `Record<string, unknown>`；对 `previousList` 使用 `ListT | undefined`

---

### 文件：`src/components/ai-panel/useAIConversations.ts`

- **[类型不一致] 第82、97、137、166、188、202行**: `catch (err: any)`
  - 建议：统一改为 `catch (err: unknown)`，配合 `err instanceof Error` 获取消息
- **[过于复杂的函数] 第34行 `useAIConversations`**: 整个 hook 函数超过220行，包含6个 `useCallback` 和1个 `useEffect`，逻辑密集
  - 建议：将消息操作逻辑（add/update/remove）提取为独立 reducer 或子 hook

---

### 文件：`src/components/workspace/WorkspaceSelector.tsx`

- **[类型不一致] 第59、73行**: `onError: (err: any) => { ... }`
  - 建议：使用 `Error` 类型或 `unknown`

---

### 文件：`src/components/outline/OutlineView.tsx`

- **[类型不一致] 第252行**: `queryClient.setQueryData(['events', workspaceId], (old: any) => {`
  - 建议：使用 `old: { items: TimelineEvent[]; total: number } | undefined`
- **[过于复杂的函数] 第140行 `OutlineView`**: 整个组件940行，包含大纲编辑、拖拽排序、版本快照、历史恢复、diff预览等大量逻辑
  - 建议：拆分为以下子组件/子 hook：
    - `useOutlineDragSort` — 拖拽排序逻辑
    - `useOutlineSnapshot` — 快照保存与恢复
    - `OutlineHistoryPanel` — 历史版本面板
    - `OutlineTrackSection` — 单个轨道渲染
- **[重复代码] `handleSaveEdit` 与 `buildOutlineSnapshot` 中**: 多处 `new Date(a.startTime).getTime()` 重复转换
  - 建议：提取 `toTimestamp(date: Date | string | null): number | null` 工具函数

---

### 文件：`src/components/ai-panel/AIPanel.tsx`

- **[过于复杂的函数] 第122行 `AIPanel`**: 整个组件525行，混合了消息发送、流式处理、功能卡片、对话管理等多种职责
  - 建议：将 `sendMessage` / `handleSend` 提取为 `useAISendMessage` hook；将功能卡片提取为 `AIFeatureCards` 子组件
- **[重复代码] 第33-34行**: `const envApiBase = ...` 和 `API_BASE` 定义
  - 与 `src/services/ai-stream.ts` 和 `src/services/ai-conversations-api.ts` 中的逻辑完全一致，建议提取到 `src/services/api-base.ts` 统一维护

---

### 文件：`src/components/timeline/TimelineCanvas.tsx`

- **[过于复杂的函数] 第28行 `TimelineCanvas`**: 整个组件476行，包含缩放、滚动、事件定位、轨道渲染、空状态等逻辑
  - 建议：将 `handleScroll`、`useEffect(scrollToEventId)` 提取为独立 hook；`TimelineEmptyState` 已是独立组件，可继续拆分 `TimelineCanvasHeader`

---

### 文件：`src/components/timeline/TimelineEventCard.tsx`

- **[过于复杂的函数] 第50行 `TimelineEventCard`**: 整个组件434行，同时处理拖拽、缩放、快速操作、悬停效果、提示等
  - 建议：将 resize/drag 逻辑提取为 `useEventDrag` 和 `useEventResize` hook；将 quick actions 提取为子组件
- **[未使用的变量] 第62行**: `cardRef` 被声明但从未使用（`useRef<HTMLDivElement>(null)`）
  - 建议：移除 `cardRef`

---

### 文件：`src/components/layout/AppShell.tsx`

- **[过于复杂的函数] 第89行 `AppShell`**: 整个组件410行，包含3种渲染模式（focus/zen/normal）和大量内联 JSX
  - 建议：将 `focusMode` 和 `zenMode` 渲染提取为独立子组件；将快捷键监听提取为 `useGlobalShortcuts` hook
- **[未使用的导入] 第30行**: `import { useWorkspace } from '@/services/api-hooks';` 实际上被使用了（第118行），所以不是未使用的
- **[重复代码] 第185-203行、252-270行**: 两次重复渲染相同的 `<ContextMenu>` 内容
  - 建议：提取为 `MainCanvas` 包装组件或 `CanvasContextMenu` 子组件

---

### 文件：`src/components/relationship-graph/RelationshipGraph.tsx` 与 `src/components/foreshadowing/ForeshadowingGraph.tsx`

- **[重复代码] 两文件高度相似**：D3 力导向图的初始化、zoom、drag、tick 更新、节点半径计算、文本截断等逻辑重复度超过60%
  - 建议：提取 `useD3ForceGraph` 或 `D3GraphBase` 公共组件/hook，将差异通过配置参数传入

---

### 文件：`src/utils/revealInBestView.ts`

- **[TODO/FIXME 遗留] 第75行**: `// TODO: 后续应切换到专门的 script-editor / scenes 面板`
  - 建议：将 TODO 转为 Issue 跟踪，或移除已完成/已决定的 TODO

---

### 文件：`src/components/ai-panel/ModelDetector.tsx`

- **[死代码] 整个组件从未被使用**：组件 `ModelDetector` 存在但没有任何父组件导入和使用它
  - 建议：如果短期内不计划使用，应删除；如果需要保留，应在 `AIPanel` 中集成或添加注释说明

---

### 文件：`src/components/timeline/TrackManagerDialog.tsx`

- **[未使用的导入/合并建议]**: 第2行 `import { Dialog, TButton } from '@/components/ui-tdesign';` 和第3行 `import { TSwitch } from '@/components/ui-tdesign';` 可以合并为一行
  - 建议：合并为 `import { Dialog, TButton, TSwitch } from '@/components/ui-tdesign';`
- **[未使用的参数]**: `visibleDateRange` 参数仅用于判断是否渲染重置按钮，未使用其实际时间值；这属于轻微设计问题，不算严格死代码

---

### 文件：`src/services/ai-stream.ts` 与 `src/services/ai-conversations-api.ts`

- **[重复代码] 第5-6行（两文件）**: `API_BASE` 的获取逻辑完全一致
  - 建议：统一从 `src/services/api.ts` 导出 `API_BASE`，避免多处硬编码相同逻辑

---

### 文件：`src/components/timeline/TimelineTrack.tsx`

- **[未使用的变量] 第43行**: `allTracks: _allTracks` 参数以下划线命名，表示故意未使用，但仍在 Props 接口中定义
  - 建议：如果确实不需要，从 `TimelineTrackProps` 中移除 `allTracks`（注意检查所有调用方）

---

## 按优先级排序的修复清单

### P0 — 必须修复（影响生产环境质量）

| # | 文件 | 问题 | 建议 |
|---|---|---|---|
| 1 | `src/stores/useWorkspaceStore.ts` | 4处 `console.error` 残留 | 替换为 `toast.error` 或统一日志系统 |
| 2 | `src/components/system/UpdateNotifier.tsx` | 2处 `console.error`/`console.warn` | 移除或改用静默处理 |
| 3 | `src/components/layout/AppShell.tsx` | 1处 `console.warn` | 移除或改用 toast 提示 |
| 4 | `src/lib/tauri-api.ts` | 1处 `console.log` | 移除 |
| 5 | `src/services/api-hooks-factory.ts` | 8处 `any` 类型 | 替换为 `unknown` 或具体泛型 |
| 6 | `src/components/ai-panel/useAIConversations.ts` | 6处 `catch (err: any)` | 统一改为 `catch (err: unknown)` |
| 7 | `src/stores/useWorkspaceStore.ts` | 4处 `catch (err: any)` | 同上 |
| 8 | `src/components/workspace/WorkspaceSelector.tsx` | 2处 `onError: (err: any)` | 使用 `Error` 类型 |
| 9 | `src/lib/tauri-api.ts` | 2处 `options as any` | 定义具体类型接口 |
| 10 | `src/components/outline/OutlineView.tsx` | 1处 `old: any` | 使用具体类型 |

### P1 — 建议修复（提升可维护性）

| # | 文件 | 问题 | 建议 |
|---|---|---|---|
| 11 | `src/components/outline/OutlineView.tsx` | 组件940行，过于复杂 | 拆分为子组件/hook |
| 12 | `src/components/ai-panel/AIPanel.tsx` | 组件525行，过于复杂 | 提取 hook 和子组件 |
| 13 | `src/components/timeline/TimelineCanvas.tsx` | 组件476行，过于复杂 | 提取 canvas 相关 hook |
| 14 | `src/components/timeline/TimelineEventCard.tsx` | 组件434行，过于复杂 | 提取 drag/resize hook |
| 15 | `src/components/layout/AppShell.tsx` | 组件410行，过于复杂 | 提取模式子组件和快捷键 hook |
| 16 | `src/components/relationship-graph/RelationshipGraph.tsx` + `src/components/foreshadowing/ForeshadowingGraph.tsx` | D3 图形逻辑高度重复 | 提取公共 D3 graph hook/组件 |
| 17 | `src/services/ai-stream.ts` + `src/services/ai-conversations-api.ts` + `src/components/ai-panel/AIPanel.tsx` | `API_BASE` 获取逻辑重复 | 提取到 `api.ts` 统一导出 |
| 18 | `src/utils/revealInBestView.ts` | TODO 遗留 | 转为 Issue 或移除 |
| 19 | `src/components/ai-panel/ModelDetector.tsx` | 组件从未使用 | 删除或集成到 AIPanel |
| 20 | `src/components/layout/AppShell.tsx` | ContextMenu 内容重复渲染 | 提取为独立子组件 |

### P2 — 可选修复（代码风格优化）

| # | 文件 | 问题 | 建议 |
|---|---|---|---|
| 21 | `src/components/timeline/TrackManagerDialog.tsx` | 同一模块导入分两次 | 合并为一行 |
| 22 | `src/components/timeline/TimelineEventCard.tsx` | `cardRef` 声明未使用 | 移除 |
| 23 | `src/components/timeline/TimelineTrack.tsx` | `_allTracks` 参数未使用 | 从 Props 中移除（检查调用方） |
| 24 | `src/components/outline/OutlineView.tsx` | 多处 `new Date(startTime).getTime()` 重复 | 提取 `toTimestamp` 工具函数 |
| 25 | 全局 | 无 ESLint 配置 | 建议添加 ESLint + @typescript-eslint 以自动检测未使用变量、any 类型等 |

---

## 补充建议

1. **配置 ESLint**：当前项目未配置 ESLint，建议添加 `@typescript-eslint/recommended` 规则，可自动捕获：
   - `@typescript-eslint/no-explicit-any` — 禁止显式 `any`
   - `@typescript-eslint/no-unused-vars` — 未使用变量/导入
   - `no-console` — 禁止 `console.log` 等

2. **TypeScript 严格模式**：检查 `tsconfig.app.json` 中是否启用 `strict: true`，建议开启以提升类型安全。

3. **代码拆分策略**：`OutlineView.tsx`、`AIPanel.tsx`、`TimelineCanvas.tsx` 三个文件均超过400行，建议作为重构重点。
