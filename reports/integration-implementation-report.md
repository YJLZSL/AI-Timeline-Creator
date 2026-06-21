# Storyloom 动画与渲染层集成报告

## 1. 概述

本次集成任务将 Storyloom 的动画系统和渲染层架构统一接入主应用入口，实现了：

- 启动遮罩从简单 spinner 升级为 **主题感知** 的 `LoomSplash`（GSAP 织机动画）
- 背景渲染层统一为 `RenderLayer` 组件，支持按主题配置自动切换
- `AppShell` 增加 `PageTransition` 包装，提供视图切换过渡动画
- 引入 `useAnimationCleanup` Hook，确保组件卸载时自动清理 GSAP 资源

---

## 2. 修改的文件

| 文件 | 变更说明 |
|------|---------|
| `src/App.tsx` | 替换 spinner 为 `LoomSplash`；替换 `ParticleCanvas` 为 `RenderLayer`；添加 `PageTransition` 包装 `AppShell`；引入 `useAnimationCleanup` |
| `src/components/splash/LoomSplash.tsx` | 新增 `visible` 可控 prop；支持外部提前关闭时的快速淡出动画 |
| `src/components/transition/PageTransition.tsx` | 优化为命名导出 `export function PageTransition`，移除默认导出 |

---

## 3. 新建的文件

| 文件 | 职责 |
|------|------|
| `src/components/_shared/RenderLayer.tsx` | 渲染层统一入口：读取 `useThemeStore`，按主题配置决定渲染 `ParticleCanvas` 或不渲染背景 |
| `src/animation/index.ts` | 动画层统一出口：集中导出 GSAP API、工具函数、类型定义、预设配置 |
| `src/animation/presets/entrance-effects.ts` | 5 套入场动画预设（fade-up / fade-scale / slide-left / stagger / elastic） |
| `src/animation/presets/page-transitions.ts` | 3 套页面过渡预设（loom-weave / fade-slide / zoom-blur） |
| `src/themes/themes.ts` | 8 套主题定义（包含颜色、字体、动画、渲染层、材质配置） |
| `src/themes/index.ts` | 主题系统入口：导出 `THEMES`、`DEFAULT_THEME`、`ThemeDefinition` |

---

## 4. 架构变更详情

### 4.1 App.tsx 结构变化

```
修改前：
  App.tsx
    ├── spinner (简单 CSS 动画)
    ├── ParticleCanvas
    ├── WorkspaceInitializer
    ├── AppShell
    └── UpdateNotifier

修改后：
  App.tsx
    ├── LoomSplash (visible={booting})      ← 主题感知启动遮罩
    ├── RenderLayer                         ← 按主题选择渲染方式
    ├── WorkspaceInitializer
    ├── PageTransition (viewId="app-shell") ← 视图过渡包装
    │     └── AppShell
    └── UpdateNotifier
    + useAnimationCleanup()                 ← 卸载时自动清理 GSAP
```

### 4.2 RenderLayer 决策逻辑

`RenderLayer` 读取 `useThemeStore` 当前主题，映射到 `DEFAULT_RENDER_LAYER` 配置：

| 主题 | backgroundEffect |
|------|-----------------|
| luosheng / midnight / forest / ink-wash / sakura / ocean / aurora | `particles` → 渲染 `ParticleCanvas` |
| contrast | `none` → 不渲染任何背景（高可读性） |
| shader / texture | fallback → `ParticleCanvas`（预留 WebGL 扩展位） |

### 4.3 动画预设体系

- **入场预设** (`ENTRANCE_PRESETS`)：提供卡片/列表/弹窗的通用入场动画参数
- **页面过渡预设** (`PAGE_TRANSITION_PRESETS`)：提供旧内容退出 + 新内容进入的完整时间线配置

所有预设均与 `themes.ts` 中 `ThemeDefinition.animation` 字段联动，可通过主题 ID 获取推荐动画配置。

---

## 5. 兼容性说明

- **Tauri 启动逻辑**：完全保留，未做任何修改。`booting` 状态仍由 `getServerPort` / `onServerPort` 控制，5 秒超时机制不变。
- **导入路径**：全部使用 `@/` 别名，符合项目现有规范。
- **TypeScript**：所有新增/修改文件均为 `.ts` / `.tsx`，包含完整类型定义。
- **依赖**：未引入任何新 npm 包，仅使用现有 `gsap`、`framer-motion`、`react`、`zustand`。

---

## 6. 已知限制与后续扩展

| 限制 | 说明 | 后续扩展方案 |
|------|------|-------------|
| `shader` / `texture` 背景 | 当前 fallback 到 `ParticleCanvas`，未实现 WebGL 渲染 | 集成 `PixiJS` 或 `Three.js` 后，替换 `RenderLayer` 中对应分支 |
| `LoomSplash` 动画时长固定 | 约 3 秒，若 Tauri 启动时间 > 3 秒，动画会提前结束 | 可增加 `minimumDuration` prop，或让动画循环播放直到 `visible=false` |
| `PageTransition` 首次渲染无动画 | 设计如此，避免页面加载时的不必要动画 | 如需初始进入动画，可传 `animateOnMount` prop |

---

## 7. 验证清单

- [x] `App.tsx` 编译通过（TypeScript 类型检查）
- [x] `LoomSplash` 支持 `visible` prop 控制显示/隐藏
- [x] `PageTransition` 支持 `viewId` + `preset` API
- [x] `RenderLayer` 按主题正确渲染/不渲染背景
- [x] `animation/index.ts` 统一导出所有公共 API
- [x] `themes/index.ts` 正确导出 `THEMES`、`DEFAULT_THEME`
- [x] 所有导入使用 `@/` 别名
- [x] 代码注释为中文

---

*报告生成时间：2025-01-12*
