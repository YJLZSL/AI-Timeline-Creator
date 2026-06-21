# Storyloom v1.3.0 开发计划

## 现状

- **数据库**: `ai_conversations` 和 `ai_cache` 表已在 schema.ts 中定义，init.ts 已包含校验
- **后端**: `/api/ai/*` 仅有 `/chat`, `/test`, `/models`, `/workspace-context`，无对话持久化路由
- **前端**: `useAIConversations.ts` 用 localStorage 存对话，需要迁移到后端 API
- **v1.3 目标**: AI 深度集成 + 数据持久化（路线图已定义）

## Stage 1 — 后端：AI 对话持久化 CRUD（最高优先级）

### 1.1 新建 `server/routes/ai-conversations.ts`

实现以下端点（按 `workspaces/crud.ts` 风格）：

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/ai/conversations?workspaceId=` | 列出工作区所有对话 |
| GET | `/api/ai/conversations/:id` | 获取单条对话详情 |
| POST | `/api/ai/conversations` | 创建新对话 |
| PATCH | `/api/ai/conversations/:id` | 更新对话（标题、消息） |
| DELETE | `/api/ai/conversations/:id` | 删除对话 |

数据模型映射：
```
aiConversations 表 → { id, workspaceId, title, messagesJson, summary, createdAt, updatedAt }
```

### 1.2 在 `server/index.ts` 注册路由

```typescript
import { aiConversationsRoutes } from './routes/ai-conversations.js';
// ...
await app.register(aiConversationsRoutes, { prefix: '/api/ai/conversations' });
```

### 1.3 在 `server/lib/validation.ts` 添加 schema

新增 `aiConversationBody`, `aiConversationUpdateBody` 等校验规则。

---

## Stage 2 — 前端：对接持久化 API

### 2.1 新建 `src/services/ai-conversations-api.ts`

封装 AI 对话 API 调用（类似 `api.ts` 风格）：

```typescript
export async function fetchAIConversations(workspaceId: string): Promise<AIConversation[]>;
export async function createAIConversation(workspaceId: string, title?: string): Promise<AIConversation>;
export async function updateAIConversation(id: string, updates: Partial<...>): Promise<AIConversation>;
export async function deleteAIConversation(id: string): Promise<void>;
```

### 2.2 重写 `src/components/ai-panel/useAIConversations.ts`

从 localStorage 迁移到后端 API：
- `loadConversations` → `fetchAIConversations`
- `saveConversations` → 删除（不再需要）
- `createConversation` → `createAIConversation`
- `deleteConversation` → `deleteAIConversation`
- `addMessage` → `updateAIConversation` (更新 messagesJson)
- 保留 React state 结构，但数据源改为 API

### 2.3 在 `AIConversationList.tsx` 添加搜索/重命名

- 搜索框过滤对话列表
- 对话标题可编辑（双击/右键）

---

## Stage 3 — AI 工作区上下文注入

### 3.1 修改 `ai-stream.ts`

在发送消息前自动调用 `/api/ai/workspace-context` 获取工作区数据，注入到 system message 中。

### 3.2 修改 `AIPanel.tsx`

- 新增「上下文设置」按钮：选择哪些数据参与对话（角色/事件/伏笔/世界观）
- 设置保存到 `localStorage`（ai-context-config）
- 首次打开 AI 面板时，自动获取工作区上下文作为 system prompt

### 3.3 新增 `src/lib/ai-context.ts`

生成三段式消息结构（参考 `AI集成指南.md`）：
```
messages = [
  { role: 'system', content: STORYLOOM_SYSTEM_PROMPT },       // 固定
  { role: 'system', content: workspaceContext },               // 工作区数据
  ...conversationHistory,                                     // 对话历史
  { role: 'user', content: currentMessage }                   // 当前消息
]
```

---

## Stage 4 — AI 辅助创作增强

### 4.1 新增功能入口（AIPanel 的 FEATURES 数组）

在现有 4 个功能（分析/启发/建议/拆分）基础上新增：

| 功能 | 描述 | 触发 prompt |
|------|------|-------------|
| 续写事件 | 基于事件上下文扩展描述 | "请根据以下事件背景续写..." |
| 角色对话 | 生成两个角色之间的对话 | "请生成角色A和角色B的对话..." |
| 伏笔回收 | 检测未回收伏笔并建议 | "请检查以下未回收伏笔..." |
| 一致性检查 | 检测时间/行为矛盾 | "请检查以下故事中的逻辑矛盾..." |

### 4.2 后端：新建 `server/routes/ai-assisted.ts`

实现 `/api/ai/assist` 端点，接收 `type: 'continue' | 'dialogue' | 'foreshadow' | 'consistency'` + 工作区数据，返回 AI 建议。

### 4.3 前端：在 `AIPanel.tsx` 中新增功能按钮

点击后自动收集工作区数据，构造 prompt，调用 AI 接口。

---

## Stage 5 — 测试验证 + 发布

### 5.1 测试检查清单
- [ ] 后端 AI 对话 CRUD 通过 curl 测试
- [ ] 前端对话列表正常加载/创建/删除/重命名
- [ ] 对话消息正确持久化到数据库
- [ ] 工作区上下文正确注入到 AI 对话
- [ ] AI 辅助功能正常调用并返回结果
- [ ] 老版本升级后 `ai_conversations` 表自动创建（DDL 兜底）
- [ ] `latest.yml` 已上传（自动更新）

### 5.2 发布流程
- 更新 `package.json` version → 1.3.0
- 更新 `更新日志.md`
- 创建 `release-notes-v1.3.0.md`
- Git commit + tag v1.3.0
- GitHub Release 创建
- 确认 `latest.yml` 在 Release assets 中

---

## 并行执行策略

| 阶段 | 子代理 | 类型 | 依赖 |
|------|--------|------|------|
| Stage 1 | 后端_CRUD_开发者 | coder | 无 |
| Stage 2 | 前端_API_对接者 | coder | Stage 1 |
| Stage 3 | 前端_上下文_注入者 | coder | Stage 2 |
| Stage 4 | 全栈_辅助功能_开发者 | coder | Stage 3 |
| Stage 5 | 发布_管理员 | 主代理 | Stage 4 |

**Stage 1 和 Stage 2 可以部分重叠**：Stage 2 的 API 封装文件可以在 Stage 1 后端定义好接口后立即开始。

## 文件变更预期

### 新增
- `server/routes/ai-conversations.ts`
- `server/routes/ai-assisted.ts`
- `src/services/ai-conversations-api.ts`
- `src/lib/ai-context.ts`
- `src/components/ai-panel/AIAssistPanel.tsx`
- `release-notes-v1.3.0.md`

### 修改
- `server/index.ts`（注册路由）
- `server/lib/validation.ts`（新增 schema）
- `src/components/ai-panel/useAIConversations.ts`（重写为 API 驱动）
- `src/components/ai-panel/AIConversationList.tsx`（搜索/重命名）
- `src/components/ai-panel/AIPanel.tsx`（上下文注入 + 辅助功能）
- `src/services/ai-stream.ts`（注入上下文）
- `src/lib/i18n/locales/zh-CN.json` + `en-US.json`（新翻译键）
- `package.json`（版本号）
- `更新日志.md`
- `docs/README.md`（更新阅读路径）
