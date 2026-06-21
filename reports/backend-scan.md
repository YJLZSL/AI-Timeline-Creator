# Storyloom 后端代码质量扫描报告

> 扫描范围：`D:/AIKFCC/Storyloom/server` 目录下的所有 TypeScript 文件
> 扫描时间：2025 年 1 月
> 扫描规则：未使用导入/变量、死代码、复杂函数、类型不一致、console.log 残留、TODO/FIXME、错误处理缺失、重复 SQL/路由逻辑

---

## 一、按文件问题详情

### `server/index.ts`

- **[死代码] 第149-156行**: `if (!distPath)` 分支永远不会执行
  - 描述：`if (process.env.STATIC_DIR)` 已确保 `distPath` 有值，内部 `if (!distPath)` 恒为假
  - 建议：移除 `if (!distPath)` 分支，或改为 `else` 处理未设置环境变量的情况

- **[类型不一致] 第43行**: `loggerConfig` 类型使用 `fs.WriteStream` 不够精确
  - 描述：`fs.createWriteStream` 返回的是 `WriteStream` 实例，但类型声明与 pino 期望的格式可能不完全匹配
  - 建议：使用 `pino.destination()` 或显式类型断言

---

### `server/sidecar-entry.ts`

- **[类型不一致] 第40行、第46行**: `...args: any[]` 滥用
  - 描述：`process.stdout.write` 的重写使用 `any[]` 参数，丢失类型安全
  - 建议：使用 `NodeJS.WritableStream["write"]"` 的正确签名 `(chunk: string | Buffer, encoding?: BufferEncoding, cb?: (err?: Error) => void)` 或 `(chunk: string | Buffer, cb?: (err?: Error) => void)`

- **[错误处理缺失] 第84-105行**: `main()` 函数内异步操作缺少 try-catch
  - 描述：`startServer(port)` 调用未包裹 try-catch，虽然外部 `.catch` 处理了，但 `findAvailablePort()` 的异常未被捕获
  - 建议：在 `main()` 内部添加 try-catch

---

### `server/db/index.ts`

- **[过于复杂的函数] 第87-516行**: `runMigrations()` 函数过长（~430行）
  - 描述：包含 6 个步骤（标准迁移、手动 SQL、readMigrationFiles、硬编码 DDL、ensureSchemaCompatibility、最终验证），嵌套超过 3 层
  - 建议：拆分为 `runStandardMigration()`、`runManualMigration()`、`runHardcodedMigration()` 等子函数

- **[过于复杂的函数] 第527-685行**: `ensureSchemaCompatibility()` 函数过长（~158行）
  - 描述：包含大量 `ensureColumn` 调用，纵向重复代码
  - 建议：使用配置数组 + 循环重构，如 `const columns = [{table: 'workspaces', column: 'description', type: 'text', default: "''"}, ...]`

- **[死代码] 第700-703行**: `backupDatabase()` 函数未使用
  - 描述：函数导出但项目内无任何调用
  - 建议：若暂时不需要，移除或标记为 `@deprecated`

- **[重复的 SQL 逻辑] 第212-499行**: 与 `db/init.ts` 的 `getCreateTableStatements()` 大量重复
  - 描述：两个文件维护了几乎相同的 CREATE TABLE 和 CREATE INDEX 语句
  - 建议：提取公共的 SQL 模块，统一维护

- **[错误处理缺失] 第43-52行**: `mkdirSync` 失败时非 EACCES 错误仅记录日志继续执行
  - 描述：如果数据目录创建失败（非权限问题），后续数据库初始化仍会失败，但错误信息不明确
  - 建议：非 EACCES 错误也应抛出异常，或至少标记为警告级别

---

### `server/db/init.ts`

- **[死代码] 第22-64行**: `generateCreateTableSQL()` 函数从未被调用
  - 描述：函数定义完整但项目内无任何调用方
  - 建议：移除或投入使用

- **[死代码] 第60-64行**: `generateTableSQL()` 总是返回 `null`
  - 描述：函数体直接 `return null`，是纯粹的占位代码
  - 建议：实现功能或移除

- **[类型不一致/兼容性] 第128行**: ESM 中使用 `require('./index.js')`
  - 描述：在 ESM 模块中直接使用 `require` 会导致 `ReferenceError: require is not defined`（Node.js 原生 ESM 中 `require` 不是全局变量）
  - 建议：改为 `await import('./index.js')` 或使用 `module.createRequire(import.meta.url)`

- **[重复的 SQL 逻辑] 第145-459行**: `getCreateTableStatements()` 与 `db/index.ts` 的硬编码 DDL 大量重复
  - 描述：与 `runMigrations` 中的 Step 6 几乎完全一致
  - 建议：统一到一个 SQL 配置文件或模块中

- **[未使用的变量] 第3行**: `import pino from 'pino';` 在 `initDatabase` 中通过 `dbLog` 使用，但 `generateCreateTableSQL` 等函数使用 `dbLog` 但在死代码中
  - 建议：随死代码一并清理

---

### `server/db/migrate.ts`

- **[console.log 残留] 整文件**: 使用 `console.log` / `console.error` 输出日志
  - 描述：虽然是 CLI 脚本（有 `eslint-disable`），但生产环境中可能通过其他入口调用
  - 建议：统一使用 `pino` 或传入的 logger 实例，或仅在 `process.env.NODE_ENV === 'development'` 时允许

- **[重复的 SQL 逻辑] 第46-73行**: `createStartupBackup()` 与 `server/services/auto-save.ts` 的 `createDatabaseBackup()` 逻辑重复
  - 描述：备份目录、文件名格式、清理旧备份逻辑几乎一致
  - 建议：提取到公共工具函数

---

### `server/db/schema.ts`

- 无严重问题。类型定义清晰，结构合理。

---

### `server/lib/validation.ts`

- 无严重问题。JSON Schema 定义完整，复用性良好。

---

### `server/plugins/database.ts`

- 无严重问题。

---

### `server/plugins/error-handler.ts`

- **[错误处理] 第28-37行**: JSON 解析错误判断依赖 `code` 属性字符串匹配
  - 描述：使用硬编码字符串 `'FST_ERR_CTP_INVALID_JSON_BODY'` 判断 Fastify 错误，若 Fastify 版本升级可能变化
  - 建议：优先使用 `error instanceof SyntaxError` 或检查 `error.message.includes('JSON')`

---

### `server/plugins/validation.ts`

- 无严重问题。

---

### `server/services/ai-proxy.ts`

- **[错误处理缺失] 第86-106行**: `testConnection()` 的 `fetch` 调用缺少网络异常细分处理
  - 描述：`fetch` 失败统一返回 `连接失败: ${err.message}`，无法区分网络超时、DNS 失败、TLS 错误等
  - 建议：根据 `err.name` 或 `err.cause` 区分超时、网络错误等

- **[错误处理缺失] 第109-127行**: `listModels()` 同样缺少异常细分处理

- **[过于复杂的函数] 第129-151行**: `getSimulatedResponse()` 包含大量硬编码字符串
  - 描述：模拟响应内容硬编码在函数中，不利于维护
  - 建议：提取到外部 JSON 配置文件中

- **[过于复杂的函数] 第207-284行**: `chatCompletionStream()` 函数较长（~77行）
  - 描述：包含 SSE 解析逻辑、降级逻辑、流式 yield 等
  - 建议：将 SSE 解析提取为 `parseSSEStream()` 辅助函数

---

### `server/services/auto-save.ts`

- **[重复的 SQL 逻辑] 第78-113行**: `createDatabaseBackup()` 与 `db/migrate.ts` 的 `createStartupBackup()` 重复
  - 描述：备份路径计算、旧备份清理逻辑完全一致
  - 建议：提取到公共工具函数

- **[错误处理缺失] 第156-242行**: `recoverFromAutoSave()` 函数没有 try-catch 包裹事务
  - 描述：虽然外层有 `try { ... } catch { return false; }`，但 `sqlite.transaction()` 内部抛出错误时，事务会自动回滚，但错误信息会丢失
  - 建议：在 `catch` 中记录详细错误日志，而非静默返回 `false`

- **[未使用的导入] 第2行**: `workspaces` 在 `checkCrashRecovery` 中使用，但 `events, tracks, characters, eventCharacters, eventWorldSettings, connections, foreshadowings, worldSettings` 在 `recoverFromAutoSave` 中使用。`inArray` 在 `recoverFromAutoSave` 中使用。全部使用，无未使用导入。

---

### `server/routes/health.ts`

- **[错误处理缺失] 第21-30行**: 表检查循环中没有异常处理
  - 描述：如果 `sqlite.prepare()` 抛出异常（虽然不太可能），会返回 500 但没有格式化的错误响应
  - 建议：添加 try-catch 或确保 `results[table]` 在异常时设为 false

---

### `server/routes/ai.ts`

- **[未使用的导入] 第5行**: `import { getDb } from '../db/index.js';` — 实际上在 `/workspace-context` 中使用了 `getDb`，但路由使用的是 `app.db`（通过 `databasePlugin` 挂载）
  - 描述：`getDb` 导入但函数内使用 `app.db`（来自 Fastify 装饰器），没有直接调用 `getDb()`
  - 建议：移除 `getDb` 导入，统一使用 `app.db`

- **[未使用的导入] 第6行**: `import { workspaces, tracks, events, characters, connections, foreshadowings, worldSettings } from '../db/schema.js';` — 都使用了

- **[未使用的导入] 第7行**: `import { eq } from 'drizzle-orm';` — 在 `/workspace-context` 中使用了

- **[错误处理缺失] 第97-145行**: `/workspace-context` 端点没有 schema 验证
  - 描述：`app.post<{ Body: { workspaceId: string } }>` 没有 `schema: { body: ... }`，缺少请求体校验
  - 建议：添加 body schema 验证

- **[错误处理缺失] 第97-145行**: `/workspace-context` 端点的 `try-catch` 过于宽泛
  - 描述：第103-144行的 `try` 块包裹了所有逻辑，但 catch 仅返回 `500 INTERNAL_ERROR`，丢失原始错误信息
  - 建议：记录原始错误日志（已通过 `app.log` 处理，但 catch 块没有使用）

---

### `server/routes/ai-conversations.ts`

- **[类型不一致] 第27行、第55行、第96行、第141行、第177行**: 多处 `catch (err: any)`
  - 描述：使用 `any` 类型捕获错误，丢失类型安全，且 `err.message` 访问可能不安全
  - 建议：使用 `catch (err: unknown)` 并配合 `err instanceof Error ? err.message : String(err)`

- **[错误处理缺失] 第9-34行**: GET `/` 端点有 try-catch，但异常处理只返回 500 没有细分错误码
  - 描述：与 `ai.ts` 类似，但这里的问题程度较轻

- **[错误处理缺失] 第64-102行**: POST `/` 端点同样使用 `catch (err: any)`

- **[错误处理缺失] 第151-183行**: DELETE `/:id` 端点同样使用 `catch (err: any)`

---

### `server/routes/events.ts`

- **[未使用的导入] 第1行**: `import { FastifyRequest, FastifyReply } from 'fastify';` — 未使用
  - 建议：移除

- **[未使用的导入] 第6行**: `import type { BatchOperation } from '../../shared/types.js';` — 类型未在代码中直接使用（虽然 `BatchEventsRequest` 内部可能包含它，但代码中只用 `BatchEventsRequest`）
  - 建议：确认是否可移除

- **[过于复杂的函数] 第304-424行**: `POST /batch` 路由处理函数（~120行）
  - 描述：包含 `create`/`update`/`delete`/`reorder` 四种操作的 switch-case，每种操作内嵌套大量 Drizzle 调用
  - 建议：拆分为 `handleBatchCreate()`、`handleBatchUpdate()`、`handleBatchDelete()`、`handleBatchReorder()` 四个子函数

- **[错误处理缺失] 第15-113行**: GET `/` 端点没有 try-catch
  - 描述：数据库查询可能失败（如磁盘损坏、SQL 语法错误），会直接抛出 500 但没有格式化的错误响应
  - 建议：添加 try-catch 包裹

---

### `server/routes/tracks.ts`

- **[未使用的导入] 第1行**: `import { FastifyRequest, FastifyReply } from 'fastify';` — 未使用
  - 建议：移除

- **[类型不一致] 第82行**: `catch (err: any)`
  - 描述：`any` 类型滥用
  - 建议：使用 `unknown` 并配合类型守卫

- **[错误处理缺失] 第10-18行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第91-106行**: DELETE `/:trackId` 端点没有 try-catch

---

### `server/routes/characters.ts`

- **[未使用的导入] 第1行**: `import { FastifyRequest, FastifyReply } from 'fastify';` — 未使用
  - 建议：移除

- **[错误处理缺失] 第10-18行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第76-91行**: DELETE `/:charId` 端点没有 try-catch

---

### `server/routes/connections.ts`

- **[未使用的导入] 第1行**: `import { FastifyRequest, FastifyReply } from 'fastify';` — 未使用
  - 建议：移除

- **[未使用的导入] 第6行**: `import type { ConnectionType } from '../../shared/types.js';` — 未使用
  - 建议：移除

- **[错误处理缺失] 第10-18行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第72-87行**: DELETE `/:connId` 端点没有 try-catch

---

### `server/routes/foreshadowings.ts`

- **[未使用的导入] 第1行**: `import { FastifyRequest, FastifyReply } from 'fastify';` — 未使用
  - 建议：移除

- **[错误处理缺失] 第28-36行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第105-120行**: DELETE `/:foresId` 端点没有 try-catch

---

### `server/routes/world-settings.ts`

- **[未使用的导入] 第1行**: `import { FastifyRequest, FastifyReply } from 'fastify';` — 未使用
  - 建议：移除

- **[错误处理缺失] 第10-25行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第82-96行**: DELETE `/:settingId` 端点没有 try-catch

---

### `server/routes/scenes.ts`

- **[错误处理缺失] 第16-32行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第35-81行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第83-112行**: PATCH `/:sceneId` 端点没有 try-catch

- **[错误处理缺失] 第115-129行**: DELETE `/:sceneId` 端点没有 try-catch

- **[错误处理缺失] 第132-153行**: POST `/reorder` 端点没有 try-catch

- **[重复的路由逻辑] 第22-25行、第44-47行、第138-141行**: workspace 存在性检查重复
  - 描述：多次复制粘贴 `app.db.select().from(workspaces).where(...).get()` 模式
  - 建议：使用 `validateWorkspaceExists()` 工具函数（已在 `lib/validation.ts` 中定义）

---

### `server/routes/beats.ts`

- **[错误处理缺失] 第16-32行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第35-83行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第85-114行**: PATCH `/:beatId` 端点没有 try-catch

- **[错误处理缺失] 第117-131行**: DELETE `/:beatId` 端点没有 try-catch

- **[错误处理缺失] 第134-158行**: POST `/reorder` 端点没有 try-catch

- **[重复的路由逻辑] 第22-25行、第47-50行、第143-146行**: scene 存在性检查重复

---

### `server/routes/choices.ts`

- **[错误处理缺失] 第15-34行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第37-83行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第86-109行**: PATCH `/:choiceId` 端点没有 try-catch

- **[错误处理缺失] 第113-127行**: DELETE `/:choiceId` 端点没有 try-catch

- **[重复的路由逻辑] 第21-27行、第48-54行**: beat 存在性及 kind 检查重复

---

### `server/routes/flags.ts`

- **[错误处理缺失] 第15-30行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第33-69行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第73-105行**: PATCH `/:flagId` 端点没有 try-catch

- **[错误处理缺失] 第109-123行**: DELETE `/:flagId` 端点没有 try-catch

- **[重复的路由逻辑] 第20-23行、第41-44行**: workspace 存在性检查重复

---

### `server/routes/maps.ts`

- **[错误处理缺失] 第15-30行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第33-67行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第70-97行**: PATCH `/:mapId` 端点没有 try-catch

- **[错误处理缺失] 第100-114行**: DELETE `/:mapId` 端点没有 try-catch

- **[重复的路由逻辑] 第20-23行、第42-45行**: workspace 存在性检查重复

---

### `server/routes/bookmarks.ts`

- **[错误处理缺失] 第15-28行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第31-52行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第55-71行**: PATCH `/:bookmarkId` 端点没有 try-catch

- **[错误处理缺失] 第75-87行**: DELETE `/:bookmarkId` 端点没有 try-catch

- **[重复的路由逻辑] 第19-22行、第38-41行**: workspace 存在性检查重复

---

### `server/routes/assets.ts`

- **[未使用的导入] 第1行**: `import type { FastifyRequest, FastifyReply } from 'fastify';` — 未使用
  - 建议：移除

- **[过于复杂的函数] 第39-155行**: `POST /upload` 路由处理函数（~116行）
  - 描述：包含文件解析、buffer 读取、大小检查、SHA-256 计算、sharp 处理、文件写入、数据库插入等
  - 建议：拆分为 `parseUploadFile()`、`computeFileHash()`、`saveAssetFile()`、`insertAssetRecord()` 等子函数

- **[错误处理缺失] 第40-58行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第279-291行**: GET `/:assetId` 端点没有 try-catch

- **[错误处理缺失] 第294-333行**: DELETE `/:assetId` 端点没有 try-catch

- **[错误处理缺失] 第337-369行**: 角色资产绑定端点没有 try-catch

- **[错误处理缺失] 第372-399行**: 事件资产绑定端点没有 try-catch

- **[错误处理缺失] 第401-428行**: 场景资产绑定端点没有 try-catch

- **[错误处理缺失] 第431-439行**: 获取角色资产列表端点没有 try-catch

- **[错误处理缺失] 第442-451行**: 获取事件资产列表端点没有 try-catch

- **[错误处理缺失] 第453-462行**: 获取场景资产列表端点没有 try-catch

- **[类型不一致] 第108行**: `const kind = (request.query as Record<string, string>)['kind'] || 'scene';`
  - 描述：使用 `as` 类型断言绕过 Fastify 的类型系统
  - 建议：在路由泛型中声明 `Querystring` 类型

- **[类型不一致] 第84-88行**: `const chunks: Buffer[] = []; for await (const chunk of file.file) { chunks.push(chunk); }`
  - 描述：`file.file` 的类型是 `Readable` 或 `BusboyFileStream`，但 chunk 类型推断可能为 `any`
  - 建议：显式声明 `chunk: Buffer` 类型

---

### `server/routes/revisions.ts`

- **[错误处理缺失] 第34-68行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第71-98行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第101-115行**: GET `/:revisionId` 端点没有 try-catch

- **[错误处理缺失] 第118-144行**: POST `/:revisionId/restore` 端点没有 try-catch

- **[错误处理缺失] 第96-144行**: DELETE `/:revisionId` 端点没有 try-catch

- **[重复的路由逻辑] 第37-43行、第77-80行**: workspace 存在性检查重复

---

### `server/routes/search.ts`

- **[重复的路由逻辑] 第94-105行**: `validateWorkspace()` 函数与 `lib/validation.ts` 的 `validateWorkspaceExists()` 重复
  - 描述：功能完全一致，只是函数签名不同
  - 建议：统一使用 `validateWorkspaceExists()`

- **[过于复杂的函数] 第324-634行**: `POST /replace` 路由处理函数（~310行）
  - 描述：包含 7 个 entity 类型的搜索、替换逻辑，以及 dry-run 和实际写入的分支
  - 建议：拆分为 `searchEntity()`、`buildReplacement()`、`applyReplacements()` 等子函数，并为每种 entity 类型使用配置驱动

- **[错误处理缺失] 第108-322行**: `GET /search` 端点有 try-catch 但异常处理不完整
  - 描述：内部各 entity 查询没有独立的 try-catch，如果某个表查询失败，整个搜索失败
  - 建议：为每个 entity 查询添加独立的 try-catch，失败时跳过而非中断

- **[错误处理缺失] 第325-634行**: `POST /replace` 端点有 try-catch 但异常处理不完整
  - 描述：事务内部的更新操作没有逐条错误处理
  - 建议：在事务内为每个 `update().run()` 添加错误捕获

- **[类型不一致] 第341行**: `const replaceStr = (text: string): string => text.split(q).join(replacement);`
  - 描述：虽然类型正确，但 `String.prototype.replaceAll` 更语义化
  - 建议：使用 `text.replaceAll(q, replacement)`（需要 Node.js >= 15）

---

### `server/routes/outline-versions.ts`

- **[错误处理缺失] 第29-38行**: GET `/` 端点没有 try-catch

- **[错误处理缺失] 第41-52行**: GET `/:versionId` 端点没有 try-catch

- **[错误处理缺失] 第55-79行**: POST `/` 端点没有 try-catch

- **[错误处理缺失] 第82-93行**: POST `/:versionId/restore` 端点没有 try-catch

- **[错误处理缺失] 第96-108行**: DELETE `/:versionId` 端点没有 try-catch

---

### `server/routes/workspaces/crud.ts`

- **[过于复杂的函数] 第63-241行**: `crudRoutes` 函数（~178行）
  - 描述：包含 GET/GET:id/POST/PATCH/DELETE 五种路由，DELETE 逻辑尤其复杂（级联删除 22 张表）
  - 建议：将 DELETE 的级联清理逻辑提取为 `clearWorkspaceData()` 服务函数

- **[类型不一致] 多处**: `catch (err: any)`
  - 第70行、第89行、第134行、第174行、第213行、第226行、第234行
  - 建议：全部改为 `catch (err: unknown)`

- **[错误处理缺失] 第64-74行**: GET `/` 端点有 try-catch，但异常信息丢失

- **[错误处理缺失] 第179-240行**: DELETE `/:id` 端点的 `app.sqlite.transaction` 内部错误处理不完整
  - 描述：每个表的删除失败仅记录日志，不会中断事务？实际上 `app.sqlite.transaction` 中如果 `app.log.warn` 不抛出，事务不会回滚。但如果有任何 `app.db.delete().run()` 抛出，整个事务会回滚。这是正确的行为，但错误信息不够详细。

- **[重复的路由逻辑] 第64-74行、第79-93行、第100-138行、第140-177行**: 日志记录模式重复
  - 描述：每个路由都手动记录 `[GET /workspaces]`, `[GET /workspaces/:id]`, `[POST /workspaces]`, `[PATCH /workspaces/:id]` 等日志
  - 建议：使用 Fastify 的 `onRequest` 或 `onSend` hook 统一记录请求日志

- **[未使用的变量] 第192行**: `const tables = [...]` 中 `{ name: 'events', table: events }` 的 `name` 字段仅用于日志，但有更好的方式
  - 建议：使用 `Object.keys(schema)` 遍历或维护清理顺序列表

---

### `server/routes/workspaces/auto-saves.ts`

- **[错误处理缺失] 第9-41行**: POST `/:id/auto-saves` 端点没有 try-catch

- **[错误处理缺失] 第43-53行**: GET `/:id/auto-saves` 端点没有 try-catch

- **[错误处理缺失] 第55-68行**: GET `/:id/auto-saves/latest` 端点没有 try-catch

- **[错误处理缺失] 第70-76行**: POST `/:id/auto-saves/recover` 端点没有 try-catch

- **[重复的路由逻辑] 第15-18行、第45-47行**: workspace 存在性检查在 GET 端点中重复（POST 中已有）

---

### `server/routes/workspaces/import-export.ts`

- **[运行时错误] 第7行**: `import { ZipArchive } from 'archiver';` — `ZipArchive` 不是 `archiver` 的导出
  - 描述：`archiver` 包只导出默认的工厂函数 `archiver`，没有 `ZipArchive` 命名导出。`new ZipArchive()` 会在运行时抛出 `TypeError: ZipArchive is not a constructor`
  - 建议：改为 `import archiver from 'archiver';` 和 `const archive = archiver('zip', { zlib: { level: 9 } });`

- **[错误处理缺失] 第96-111行**: `POST /:id/import` 端点没有 try-catch
  - 描述：`importWorkspaceData()` 在事务中执行，如果失败会抛出但未被捕获
  - 建议：添加 try-catch 并返回 500 错误

- **[未使用的导入] 第8行**: `import path from 'path';` — 在 zip 导出中使用了
- **[未使用的导入] 第9行**: `import fs from 'fs';` — 在 zip 导出中使用了
- **[未使用的导入] 第10行**: `import { DATA_DIR } from '../../db/index.js';` — 在 zip 导出中使用了
- **[未使用的导入] 第13行**: `import { buildPreviewScript } from './helpers-preview.js';` — 在 `/preview/script` 中使用了

- **[错误处理缺失] 第113-124行**: `GET /:id/preview/script` 端点没有 try-catch

---

### `server/routes/workspaces/helpers-collect.ts`

- 无严重问题。导出数据收集逻辑清晰。

---

### `server/routes/workspaces/helpers-import.ts`

- **[错误处理缺失] 第41-187行**: `importWorkspaceData()` 函数没有 try-catch 包裹事务
  - 描述：虽然外层调用方可能有 try-catch，但函数本身应保证异常安全
  - 建议：在函数内部添加 try-catch，失败时回滚事务并抛出有意义的错误

- **[类型不一致] 多处**: `as typeof events.$inferInsert` 等类型断言
  - 描述：大量使用 `as` 类型断言绕过类型检查，虽然 Drizzle 的 `$inferInsert` 类型有限，但应尽量通过正确的类型构造避免 `as`
  - 建议：使用 `satisfies` 或构建正确的类型对象

---

### `server/routes/workspaces/helpers-preview.ts`

- 无严重问题。预览脚本构建逻辑清晰。

---

### `server/services/exporters/webgal.ts`

- **[过于复杂的函数] 第87-368行**: `exportWorkspaceToWebGAL()` 函数（~281行）
  - 描述：包含 IR 加载、资产收集、场景文件生成、资产打包、README 生成等 6 个步骤，嵌套深（4+层）
  - 建议：拆分为 `loadWorkspaceData()`、`generateSceneScripts()`、`collectAssets()`、`buildZipArchive()` 等子函数

- **[错误处理缺失] 第87-368行**: 整个函数没有 try-catch 包裹
  - 描述：如果任何步骤失败（如数据库查询、文件读取），会直接抛出未处理异常
  - 建议：在函数入口添加 try-catch，将异常转换为 `ExportError`

- **[类型不一致] 第239-240行**: `typeof meta.targetSceneId === 'string' ? (meta.targetSceneId as string) : ''`
  - 描述：类型断言冗余，前面已经通过 `typeof` 守卫确认类型
  - 建议：直接赋值 `meta.targetSceneId`，无需 `as`

- **[类型不一致] 第250行**: `typeof meta.assetId === 'string' ? (meta.assetId as string) : ''`
  - 描述：同上，冗余类型断言

- **[类型不一致] 第273行**: `typeof meta.animKey === 'string' && (meta.animKey as string).length > 0`
  - 描述：同上，冗余类型断言

- **[未使用的变量] 第111行**: `const beatIds = allBeats.map((b) => b.id);` — 在 `allChoices` 查询中使用了
- **[未使用的变量] 第116行**: `const allFlags = db.select().from(flags).where(eq(flags.workspaceId, workspaceId)).all();` — 在 README 中使用了 `allFlags.length`

---

### `server/migration/v3-to-v4.ts`

- **[console.log 残留] 整文件**: 使用 `console.log` / `console.error` 输出迁移日志
  - 描述：有 `eslint-disable` 注释，但生产环境中调用时可能污染输出
  - 建议：传入 logger 参数或使用 `pino`

- **[过于复杂的函数] 第116-276行**: `migrateV3ToV4()` 函数（~160行）
  - 描述：包含 7 个数据类型的迁移逻辑，在单一事务中执行
  - 建议：拆分为 `migrateWorkspace()`、`migrateTracks()`、`migrateEvents()` 等子函数

---

## 二、按优先级排序的修复清单

### P0 — 必须修复（可能导致运行时错误或类型安全问题）

| # | 文件 | 问题 | 修复建议 |
|---|------|------|----------|
| 1 | `server/routes/workspaces/import-export.ts` | `import { ZipArchive } from 'archiver'` 是错误导入，`archiver` 无此导出 | 改为 `import archiver from 'archiver';` 和 `archiver('zip', ...)` |
| 2 | `server/db/init.ts` | ESM 中直接使用 `require('./index.js')` 会抛出 `ReferenceError` | 改为 `const { ensureSchemaCompatibility } = await import('./index.js');` |
| 3 | `server/routes/ai-conversations.ts` | 多处 `catch (err: any)` 隐藏类型安全 | 全部改为 `catch (err: unknown)` 并配合 `err instanceof Error` 守卫 |
| 4 | `server/routes/workspaces/crud.ts` | 多处 `catch (err: any)` 隐藏类型安全 | 同上 |
| 5 | `server/routes/tracks.ts` | `catch (err: any)` 隐藏类型安全 | 同上 |
| 6 | `server/sidecar-entry.ts` | `process.stdout.write` 重写使用 `any[]` 参数 | 使用正确的 `WritableStream.write` 签名 |
| 7 | `server/db/index.ts` | `runMigrations()` 和 `ensureSchemaCompatibility()` 过长，难以维护和测试 | 拆分为独立子函数，并添加单元测试 |
| 8 | `server/routes/events.ts` | `POST /batch` 处理函数超过 120 行，4 层嵌套 | 按操作类型拆分为 `handleBatchCreate` 等子函数 |
| 9 | `server/routes/search.ts` | `POST /replace` 处理函数超过 310 行 | 拆分为配置驱动的替换引擎 |
| 10 | `server/services/exporters/webgal.ts` | `exportWorkspaceToWebGAL()` 超过 280 行，无顶层错误处理 | 拆分为子函数并添加 try-catch |

### P1 — 建议修复（代码质量、可维护性、一致性）

| # | 文件 | 问题 | 修复建议 |
|---|------|------|----------|
| 11 | `server/routes/events.ts` 等 6 个文件 | `FastifyRequest` / `FastifyReply` 导入未使用 | 移除未使用的导入 |
| 12 | `server/routes/connections.ts` | `ConnectionType` 类型导入未使用 | 移除 |
| 13 | `server/routes/events.ts` | `BatchOperation` 类型导入未使用 | 移除或确认使用 |
| 14 | `server/index.ts` | `if (!distPath)` 死代码分支 | 移除或重构为 else 分支 |
| 15 | `server/db/index.ts` | `backupDatabase()` 导出但从未使用 | 移除或标记 `@deprecated` |
| 16 | `server/db/init.ts` | `generateCreateTableSQL()` 和 `generateTableSQL()` 死代码 | 移除 |
| 17 | `server/db/index.ts` + `server/db/init.ts` | 大量重复的 CREATE TABLE / INDEX SQL | 提取到 `sql/tables.ts` 或 `sql/schema-ddl.ts` 统一维护 |
| 18 | `server/db/migrate.ts` + `server/services/auto-save.ts` | 备份逻辑重复 | 提取到 `lib/backup.ts` |
| 19 | `server/routes/search.ts` | `validateWorkspace()` 与 `lib/validation.ts` 的 `validateWorkspaceExists()` 重复 | 统一使用 `validateWorkspaceExists()` |
| 20 | 大量路由文件 | 20+ 个 GET/POST/PATCH/DELETE 端点缺少 try-catch | 统一添加错误处理，或添加 Fastify `onError` hook 兜底 |
| 21 | `server/routes/scenes.ts` 等 | workspace 存在性检查在多个路由中重复 | 统一使用 `validateWorkspaceExists()` |
| 22 | `server/routes/ai.ts` | `/workspace-context` 端点无请求体 schema 验证 | 添加 JSON Schema body 校验 |
| 23 | `server/routes/assets.ts` | 上传端点使用 `as Record<string, string>` 绕过类型检查 | 在路由泛型中声明 `Querystring` 类型 |
| 24 | `server/routes/workspaces/crud.ts` | 手动记录请求日志模式重复 | 使用 Fastify `onRequest` hook 统一记录 |
| 25 | `server/services/ai-proxy.ts` | `testConnection()` 和 `listModels()` 的异常处理不够细分 | 按异常类型返回不同错误码 |
| 26 | `server/services/ai-proxy.ts` | `getSimulatedResponse()` 硬编码大量字符串 | 提取到 `config/simulated-responses.json` |
| 27 | `server/services/exporters/webgal.ts` | 多处冗余类型断言 `(meta.xxx as string)` | 移除不必要的 `as` |
| 28 | `server/routes/import-export.ts` | `POST /:id/import` 端点无 try-catch | 添加 try-catch |
| 29 | `server/routes/workspaces/helpers-import.ts` | `importWorkspaceData()` 无顶层错误处理 | 添加 try-catch |
| 30 | `server/plugins/error-handler.ts` | JSON 错误判断依赖 Fastify 内部错误码字符串 | 使用 `error instanceof SyntaxError` 作为备选判断 |

### P2 — 可选修复（风格、日志、优化）

| # | 文件 | 问题 | 修复建议 |
|---|------|------|----------|
| 31 | `server/db/migrate.ts` | `console.log` 残留（有 eslint-disable） | 若作为 CLI 专用可保留，否则替换为 `pino` |
| 32 | `server/migration/v3-to-v4.ts` | `console.log` 残留（有 eslint-disable） | 同上 |
| 33 | `server/index.ts` | 第255行 `console.error`（有注释说明） | 保留，这是启动失败的唯一输出通道 |
| 34 | `server/routes/search.ts` | 使用 `text.split(q).join(replacement)` 代替 `replaceAll` | 若 Node.js >= 15，改用 `replaceAll` 更语义化 |
| 35 | `server/routes/health.ts` | 表检查循环无异常处理 | 添加 try-catch 使错误响应更友好 |
| 36 | `server/db/index.ts` | `mkdirSync` 非 EACCES 错误继续执行 | 改为 warn 级别并继续，或统一抛出 |
| 37 | `server/services/auto-save.ts` | `recoverFromAutoSave()` 失败时静默返回 `false` | 记录详细错误日志 |
| 38 | `server/routes/ai.ts` | `/workspace-context` 端点 catch 块未记录原始错误 | 添加 `app.log.error(err)` |
| 39 | `server/routes/workspaces/crud.ts` | DELETE 路由中 `app.sqlite.transaction` 与 `app.db.delete` 混合使用 | 统一使用 Drizzle 事务 API，或确保类型安全 |
| 40 | `server/routes/choices.ts` 等 | beat/scene 存在性检查重复 | 提取为 `validateBeatExists()` / `validateSceneExists()` 辅助函数 |

---

## 三、统计摘要

| 问题类型 | 数量 |
|----------|------|
| 未使用的导入 | 8 处 |
| 未使用的变量/函数 | 3 处 |
| 死代码 | 4 处 |
| 过于复杂的函数（>50行） | 8 处 |
| 类型不一致（any 滥用） | 15+ 处 |
| console.log 残留 | 3 文件 |
| TODO/FIXME 标记 | 0 处 |
| 错误处理缺失（无 try-catch） | 40+ 处 |
| 重复的 SQL / 路由逻辑 | 6 处 |

**总计影响文件**：28 个文件中的 26 个存在不同程度的问题

---

> 注：本扫描基于静态代码审查，未使用 TypeScript 编译器进行类型检查。建议配合 `tsc --noEmit` 和 ESLint (`@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any`) 进行自动化验证。
