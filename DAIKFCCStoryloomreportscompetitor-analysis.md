# Storyloom 竞品对比分析报告

> **报告日期**: 2026-06-20  
> **分析范围**: 开源叙事/时间轴/故事规划工具  
> **分析师**: Storyloom 竞品分析员

---

## 1. 执行摘要

Storyloom（絮织）是一款面向 **视觉小说 / 长篇小说 / 剧本创作者** 的桌面创作工作台，以多视图时间轴为核心，整合角色管理、世界观构建、伏笔追踪与 AI 写作助手，最终可一键导出到主流 Visual Novel 引擎。

本报告对 **7 个** 与 Storyloom 定位相似或功能重叠的开源项目进行了多维度横向对比，覆盖功能矩阵、技术栈、UI/UX 品质、社区活跃度与独特卖点。核心发现如下：

- **时间轴可视化**是 Storyloom 的显著差异化优势，目前竞品中仅有 Timeline-Builder 和 Timelines 提供类似能力，但二者缺乏完整的叙事创作工具链。
- **AI 集成**是新兴趋势，StoryCraftr 以纯 AI 驱动见长，但缺乏 GUI；Story Architect 也集成了 AI 助手，但采用云端模式。Storyloom 的本地化 AI 助手处于有利竞争位置。
- **技术栈现代化**方面，Storyloom（Electron + React 19 + TypeScript）与 Timeline-Builder（Electron + React + TS）和 Kindling（Tauri + Svelte）处于同一世代，但 Manuskript/novelWriter 仍停留在 Python/Qt 传统桌面框架。
- **导出到视觉小说引擎**是 Storyloom 独有的杀手级功能，目前没有竞品提供直接导出到 Ren'Py / Suika3 等 VN 引擎的能力。

---

## 2. 竞品概览

| 项目名称 | GitHub 仓库 | Stars | 定位 | 技术栈 | 许可 |
|---------|------------|-------|------|--------|------|
| **Manuskript** | [olivierkes/manuskript](https://github.com/olivierkes/manuskript) | ~2,300 | 开源小说写作工具 | Python + PyQt5 | GPLv3 |
| **novelWriter** | [vkbo/novelWriter](https://github.com/vkbo/novelWriter) | ~2,980 | 纯文本小说编辑器 | Python + Qt6/PyQt6 | GPLv3 |
| **Kindling** | [smith-and-web/kindling](https://github.com/smith-and-web/kindling) | ~32 | 新兴小说写作软件 | Rust + Tauri 2.x + Svelte 5 | MIT |
| **Story Architect (Starc)** | [story-apps/starc](https://github.com/story-apps/starc) | ~350 | 专业编剧/剧本工具 | C++ / Qt | 自定义开源 |
| **Timeline-Builder** | [FYIFriday/Timeline-Builder](https://github.com/FYIFriday/Timeline-Builder) | 未公开 | 无限画布时间轴规划 | Electron + React + TS | MIT |
| **Timelines** | [sreegjl/timelines](https://github.com/sreegjl/timelines) | 未公开 | 世界观/历史时间轴 | Electron + Node.js | 未明确 |
| **StoryCraftr** | [raestrada/storycraftr](https://github.com/raestrada/storycraftr) | 145 | AI 驱动写作 CLI | Python + LangChain | MIT |

> **注**：Stars 数据基于 2026-06-20 前后搜索快照，部分早期项目未在搜索结果中直接显示具体数字。

---

## 3. 功能矩阵对比

| 功能维度 | Storyloom | Manuskript | novelWriter | Kindling | Starc | Timeline-Builder | Timelines | StoryCraftr |
|---------|:---------:|:----------:|:-----------:|:--------:|:-----:|:----------------:|:---------:|:-----------:|
| **时间轴可视化** | ✅ 7 种视图 | ⚠️ 故事线视图 | ❌ | ❌ | ❌ | ✅ 无限画布 | ✅ 交互式 | ❌ |
| **大纲/结构规划** | ✅ | ✅ | ⚠️ 基础 | ✅ | ✅ | ⚠️ 单元格 | ❌ | ✅ AI 生成 |
| **角色管理** | ✅ | ✅ | ⚠️ 标签 | ✅ | ✅ | ❌ | ❌ | ✅ AI 生成 |
| **世界观/设定** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ⚠️ 地理 | ✅ AI 生成 |
| **伏笔追踪** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AI 写作助手** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ 核心 |
| **富文本编辑器** | ✅ | ⚠️ | ⚠️ Markdown | ✅ | ✅ | ❌ | ❌ | ❌ CLI |
| **关系图/网络** | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ 连接 | ❌ | ❌ |
| **导出到 VN 引擎** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **剧本/编剧格式** | ⚠️ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **多格式导入** | ⚠️ | ⚠️ | ✅ | ✅ Scrivener | ✅ Final Draft | ❌ | ❌ | ❌ |
| **多格式导出** | ✅ | ✅ | ✅ | ✅ DOCX/EPUB | ✅ PDF/FDX | PNG/JSON | ❌ | ❌ |
| **协作/云同步** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **跨平台** | ✅ Win/Mac/Linux | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **离线优先** | ✅ | ✅ | ✅ | ✅ | ⚠️ 云可选 | ✅ | ✅ | ✅ |
| **自动更新** | ✅ electron-updater | ❌ | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ |

**图例**: ✅ 完整支持 | ⚠️ 部分支持 | ❌ 不支持

---

## 4. 技术栈深度对比

| 项目 | 前端框架 | 后端/运行时 | 数据库 | 构建工具 | 桌面打包 | 特色技术 |
|------|---------|------------|--------|---------|---------|---------|
| **Storyloom** | React 19 + Tailwind 4 + TDesign | Fastify + Node.js | better-sqlite3 | Vite + electron-builder | Electron 42 | D3.js, Framer Motion, Drizzle ORM, i18next |
| **Manuskript** | PyQt5 Widgets | Python 3 | 纯文本/JSON | PyInstaller | PyInstaller | Qt 原生渲染 |
| **novelWriter** | Qt6/PyQt6 | Python 3 | 纯文本文件 | 原生 Python | 原生 Python | Markdown 自定义语法 |
| **Kindling** | Svelte 5 + Tailwind CSS | Rust + Tauri 2.x | SQLite (rusqlite) | Vite + Tauri CLI | Tauri | 原生 Rust 解析器 |
| **Starc** | Qt Widgets / QML | C++ | 自有格式 | qmake | 自定义 Qt | 原生 C++ 高性能 |
| **Timeline-Builder** | React + TypeScript | Electron Main | 本地 JSON | Vite + electron-builder | Electron | Zustand 状态管理 |
| **Timelines** | React (推断) | Electron Main | JSON + Markdown | electron-builder | Electron | Leaflet 地图 (推断) |
| **StoryCraftr** | 无 GUI | Python + LangChain | 本地 JSON | pipx/poetry | CLI | OpenAI/OpenRouter/Ollama 多后端 |

### 技术栈分析

1. **Storyloom** 采用 **Electron + React + Fastify 全栈** 架构，与 Timeline-Builder 技术路线高度一致，但 Storyloom 引入了独立的 Fastify 后端服务层，而 Timeline-Builder 仅使用 Electron 主进程。这使得 Storyloom 在数据层有更清晰的抽象，但也增加了架构复杂度。

2. **Kindling** 的 **Rust + Tauri** 组合是当前桌面应用的新趋势，相比 Electron 有更小的包体积和更好的性能，但 Rust 学习曲线陡峭。Storyloom 在 Tauri 生态成熟前选择 Electron 是务实的，但长期应考虑 Tauri 作为可选方案。

3. **Manuskript / novelWriter** 的 Python/Qt 栈虽然成熟，但 UI 现代化程度明显落后于 Web 技术栈，且难以实现复杂的动画和可视化效果。

4. **Starc** 的纯 C++/Qt 方案提供了最高的原生性能，但开发效率和维护成本都较高，且 UI 灵活性受限。

---

## 5. UI/UX 设计品质对比

| 项目 | 设计风格 | 主题系统 | 动画/动效 | 可访问性 | 响应式 | 整体评价 |
|------|---------|---------|----------|---------|--------|---------|
| **Storyloom** | 织机隐喻、温暖品牌、玻璃拟态 | 6 套主题 + 集中调色板 | Framer Motion 视图切换、骨架屏、Spotlight 命令面板 | 中等 | 桌面专用 | ⭐⭐⭐⭐⭐ 高度差异化 |
| **Manuskript** | 传统 Qt 原生风格 | 系统主题 | 无 | 低 | 桌面专用 | ⭐⭐ 功能导向 |
| **novelWriter** | 简洁 Qt 工具风格 | 亮/暗/系统 | 无 | 中等 | 桌面专用 | ⭐⭐⭐ 工具导向 |
| **Kindling** | 现代简洁、Scrivener 风格 | 亮/暗/系统 | 无 | 中等 | 桌面专用 | ⭐⭐⭐⭐ 现代感强 |
| **Starc** | Material Design / Qt 原生 | 多主题 | 有限 | 中等 | 桌面专用 | ⭐⭐⭐ 专业感 |
| **Timeline-Builder** | 无限画布、工具型 | 预设色彩 | 无 | 低 | 桌面专用 | ⭐⭐⭐ 功能性 |
| **Timelines** | 实用主义 | 未明确 | 无 | 低 | 桌面专用 | ⭐⭐ 早期阶段 |
| **StoryCraftr** | CLI / VSCode 扩展 | 无 | 无 | 高 (CLI) | 终端/编辑器 | ⭐⭐ 纯工具 |

### UI/UX 关键洞察

- **Storyloom 的织机隐喻品牌设计**是竞品中唯一采用深度品牌叙事的设计语言。"EmptyShell 三栏布局 + 织机 SVG 动画 + 织线卡片 + 毛玻璃背景" 构成了强烈的视觉识别度，这在同质化严重的写作工具市场中是巨大的差异化优势。
- **多视图时间轴**（Timeline / Outline / Narrative / Gantt / Tree / Stats / Relationship）的切换动效由 Framer Motion 驱动，提供了竞品中罕见的流畅体验。
- **Manuskript** 和 **novelWriter** 的 Qt 原生界面虽然功能完整，但视觉上已显陈旧，对年轻创作者吸引力有限。
- **Kindling** 的 Svelte + Tailwind 组合提供了现代简洁的界面，但缺乏品牌特色和视觉记忆点。

---

## 6. 社区活跃度对比

| 项目 | Stars | Forks | Issues | 最近提交 | 版本节奏 | 社区渠道 | 活跃度评级 |
|------|-------|-------|--------|---------|---------|---------|-----------|
| **Manuskript** | ~2,300 | ~310 | 566+ | 2025-06 | 慢 | GitHub Issues | ⭐⭐⭐⭐ 成熟但缓慢 |
| **novelWriter** | ~2,980 | — | 活跃 | 2025+ | 稳定 | GitHub + Crowdin 翻译 | ⭐⭐⭐⭐⭐ 非常活跃 |
| **Kindling** | ~32 | — | 35+ | 2026-06 | 快速迭代 | GitHub + Discord | ⭐⭐⭐ 早期增长 |
| **Starc** | ~350 | — | 活跃 | 2025-03 | 商业化 | 自有网站 + 博客 | ⭐⭐⭐⭐ 活跃但封闭 |
| **Timeline-Builder** | 未公开 | — | 未公开 | 2026-01 | 新项目 | GitHub | ⭐⭐ 极早期 |
| **Timelines** | 未公开 | — | 未公开 | 2025-11 | 测试版 | GitHub | ⭐⭐ 极早期 |
| **StoryCraftr** | 145 | 28 | 有限 | 2024-10 | alpha/beta | GitHub | ⭐⭐⭐ 早期 |
| **Storyloom** | 未公开 | — | — | 2026-06 | v1.0.0 | GitHub | ⭐⭐⭐ 新项目 |

### 社区洞察

- **novelWriter** 拥有最成熟的社区生态，包括官方文档网站、Crowdin 多语言翻译平台（支持 10+ 语言）和稳定的版本发布节奏。Storyloom 的国际化（i18next）处于技术就绪状态，但翻译社区建设需要跟进。
- **Manuskript** 虽然 Stars 较高，但 Issues 积压严重（566+），维护响应缓慢，部分核心问题长期未解决。
- **Starc** 采用准商业化模式，源代码开放但核心开发由团队主导，社区贡献通道相对有限。其 cloud sync 和 AI assistant 功能需要订阅高级版。
- **Storyloom** 目前处于 v1.0.0 发布阶段，社区建设刚刚起步。需要借鉴 novelWriter 和 Kindling 的经验，建立 Discord/Discussions 等社区渠道。

---

## 7. 独特卖点（USP）对比

| 项目 | 核心独特卖点 |
|------|-------------|
| **Storyloom** | 🔥 **唯一将多视图时间轴、角色/世界观/伏笔管理、AI 助手和 VN 引擎导出整合为一体的工具**；织机品牌视觉语言；离线优先 + 自动更新 |
| **Manuskript** | 从一句话 premises 逐步扩展到大纲的"雪花方法论"内置支持；成熟的开源小说写作工具 |
| **novelWriter** | 纯文本 + 自定义 Markdown 语法，天然适合 Git 版本控制；极简工具哲学 |
| **Kindling** | 大纲与草稿的无缝集成（Scaffolded writing view）；Scrivener/Plottr/yWriter 多格式双向导入；100% 测试覆盖率 |
| **Starc** | 专业编剧行业标准（Final Draft/Fountain）支持；云协作 + 实时同步；AI 翻译助手 |
| **Timeline-Builder** | 纯无限画布时间轴体验；灵活的单元格系统 |
| **Timelines** | 地理可视化 + 地图视图；与 MediaWiki 源链接 |
| **StoryCraftr** | 纯 AI 驱动叙事生成；多 LLM 后端支持（OpenAI/OpenRouter/Ollama）；VSCode 集成 |

---

## 8. Storyloom 优势与劣势

### 8.1 优势（Strengths）

| 优势 | 说明 | 竞品差距 |
|------|------|---------|
| **时间轴可视化能力最强** | 7 种视图模式（timeline/outline/narrative/gantt/tree/stats/relationship）覆盖叙事创作全场景 | 仅 Timeline-Builder 和 Timelines 有基础时间轴，但缺乏叙事工具链 |
| **VN 引擎导出唯一** | 一键导出到主流 Visual Novel 引擎 | 没有任何竞品提供此功能 |
| **AI 助手本地化** | 内置 AI 写作助手，离线优先架构下仍可用（可对接本地模型） | Starc 的 AI 需云端；StoryCraftr 是纯 AI 无 GUI |
| **品牌视觉差异化** | 织机隐喻 + 温暖配色 + 毛玻璃 + 动效，形成强烈视觉识别 | 竞品多为工具型或原生风格，缺乏品牌叙事 |
| **技术栈现代化** | React 19 +
