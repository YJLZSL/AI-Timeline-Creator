# Storyloom v2.0 设计系统重构方案

## 问题诊断

### 1. 图标系统兼容性 Bug
TDesign React 的 `Button` 组件的 `icon` 属性期望 TDesign 的 `TIcon` 类型，但项目传递的是 IconPark 的 React 组件。虽然 TypeScript 类型不报错，但运行时 TDesign 无法正确渲染 IconPark 图标，导致部分图标缺失。

**影响范围**：所有通过 `TButton icon={...}` 传递 IconPark 组件的位置
- `TopToolbar.tsx`：6 处（缩放、新建、保存、命令面板、设置、主题）
- `WorldBuildingPanel.tsx`：6 处（添加、编辑、删除、保存、取消等）
- `OutlineView.tsx`：4 处（新建、历史、编辑、删除）
- `CharacterPanel.tsx`：6 处（添加、编辑、删除、保存、取消等）
- `ContextPanel.tsx`：2 处（缩小字号、放大字号）
- 其他面板：多处

**修复方案**：统一使用 `TButton` 的 children 方式渲染图标，或使用 `prefixIcon` 属性（TDesign 原生支持）。

### 2. UI/UX 设计升级方向

当前 UI 的痛点：
- 组件层次不够分明，卡片之间区分度不够
- 交互反馈不够细腻（缺少 hover/active 状态设计）
- 空状态设计参差不齐
- 缺少统一的间距/字号系统
- 动画过渡较少，操作感生硬
- 时间轴视图缺少视觉层次

### 3. 设计系统核心改进

#### 2.1 色彩系统升级
- 增加语义化颜色变量：`--status-success`, `--status-warning`, `--status-danger`, `--status-info`
- 洛笙主题增加暖色强调：增加 `--accent-gold`（暗金）和 `--accent-sienna`（赭石）
- 增加微妙渐变背景（低饱和度、暖色调）

#### 2.2 间距与排版系统
- 采用 4px 网格系统（1 unit = 4px）
- 字体层级：xs(10px) → sm(12px) → base(13px) → lg(15px) → xl(18px) → 2xl(22px) → 3xl(26px)
- 标题使用 `font-serif`（Noto Serif SC），正文使用 `font-sans`（Noto Sans SC）

#### 2.3 阴影与层次系统
- 增加 4 层阴影：card → elevated → floating → overlay
- 增加内发光效果（`inset-shadow`）用于卡片选中状态
- 增加毛玻璃效果（`backdrop-blur`）用于浮层

#### 2.4 动画与动效系统
- 全局过渡：150ms ease-out 为默认
- 卡片进入：opacity + translateY(4px) → translateY(0)
- 卡片悬浮：translateY(-2px) + 阴影升级
- 按钮点击：scale(0.97) + 涟漪效果
- 面板切换：framer-motion layoutId 动画
- 选中高亮：柔和的发光脉冲（不使用突兀的 box-shadow）

#### 2.5 微交互设计
- 按钮 ripple 效果（CSS 或 Framer Motion）
- 输入框聚焦时标签上浮（floating label）
- 标签切换平滑过渡（layout animation）
- 拖拽时的 ghost 效果
- 搜索时的实时高亮

### 4. 组件级重构要点

#### TopToolbar
- 统一使用 children 方式传递图标
- 按钮分组明确：工具组（缩放）→ 操作组（新建/保存）→ 辅助组（命令面板/设置/主题）
- 增加 hover 时的 subtle background 变化
- 品牌 Logo 增加微妙的 loom 编织动画

#### LeftPanel
- 工具列表增加悬浮时的左侧色条指示器
- 统计卡片使用更精致的配色（dot + 数字 + 标签）
- 搜索框增加聚焦时的展开动画
- 折叠/展开动画使用 framer-motion

#### ContextPanel / EventContextPanel
- 卡片增加微妙的 hover 阴影
- 使用更明显的色彩区分不同类型的数据
- 空状态设计更精致（插图 + 引导文字）
- 增加骨架屏 loading 状态

#### 时间轴视图（TimelineView）
- 事件卡片增加悬浮时的发光边框
- 选中事件时的 ripple 效果
- 拖拽事件时的 ghost 效果
- 缩放时的平滑过渡（不使用 CSS zoom，用 transform scale）

### 5. 代码清理清单

- 删除 `__mocks__` 目录（不用的 mock 文件）
- 删除 `docs/tutorials/` 中内容过时的教程
- 清理 `src/components/` 中未使用的组件
- 统一 IconPark 图标导入方式（全部通过 `@/lib/icons`）
- 删除 `TButton` 的 `icon` 属性使用，统一改为 children 方式
- 清理 CSS 中重复或废弃的样式
- 删除 `node_modules` 中的开发依赖（不需要 electron-builder 在 dev 模式）

### 6. 执行阶段

**Phase 1**：图标修复 + 基础设计系统
- 修复所有 TButton icon 属性为 children 方式
- 升级 CSS 设计令牌

**Phase 2**：组件级重构
- TopToolbar、LeftPanel、ContextPanel、EventContextPanel
- 时间轴视图卡片
- 空状态设计

**Phase 3**：动效系统
- 全局过渡动画
- 卡片悬浮/点击动画
- 面板切换动画
- 拖拽动画

**Phase 4**：清理与测试
- 清理过期代码和文档
- 类型检查 + 测试
- 构建 + 截图验证
- 发布
