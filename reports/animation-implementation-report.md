# Storyloom 动画组件实现报告

## 任务概览

为 Storyloom 项目创建三个动画相关文件：
1. 织机启动动画组件（`LoomSplash.tsx`）
2. 页面过渡包装组件（`PageTransition.tsx`）
3. 动画 Hook 封装（`useAnimation.ts`）

---

## 任务 1：LoomSplash.tsx

**文件路径**：`src/components/splash/LoomSplash.tsx`

### 实现要点

- **动画引擎**：使用 GSAP `timeline()` 编排 7 步动画序列
- **SVG 织机**：自定义 SVG 绘制织机外框、经线（8 条竖线）、纬线（6 条横线）、交织点（5×5 圆点矩阵）
- **DrawSVG 模拟**：对 SVG `path/line/rect` 使用 `stroke-dasharray` + `stroke-dashoffset` 实现线条绘制效果，从中心向两侧 stagger 展开
- **SplitText 模拟**：将品牌文案"把时间织成故事"拆分为单个 `<span>`，逐字设置 `opacity` 和 `y` 偏移动画
- **主题感知**：从 `useThemeStore` 读取当前主题 ID，通过预定义 `themeColorMap` 获取对应主色调，背景渐变采用该主题色
- **回调机制**：`onComplete` 在 GSAP timeline 的 `onComplete` 中触发，并在回调前隐藏容器（`visibility: hidden`）

### 动画时间线

| 时间点 | 动画内容 | 持续时长 | 缓动 |
|---|---|---|---|
| 0ms | 背景黑 → 主题色 | 800ms | power2.inOut |
| 200ms | 框架线条绘制 | 1200ms | power2.inOut |
| 800ms | 经线落下（弹性） | 600ms | elastic.out(1, 0.6) |
| 1200ms | 纬线滑入 | 600ms | power3.out |
| 1800ms | 交织点亮起 | 400ms | back.out(2) |
| 2000ms | 文案逐字出现 | 600ms | power3.out |
| 2500ms | 整体淡出 | 500ms | power2.inOut |

---

## 任务 2：PageTransition.tsx

**文件路径**：`src/components/transition/PageTransition.tsx`

### 实现要点

- **状态管理**：使用 `useRef` 保存 `prevViewId`，使用 `useState` 管理 `displayedChildren` 和 `isTransitioning`
- **动画中断**：所有过渡使用 `gsap.fromTo()` 确保动画可中断；当新 viewId 变化时，先 `kill()` 正在进行的 timeline
- **三种预设**：
  - `loom-weave`：旧内容缩小上移 + 模糊淡出，新内容放大下移 + 模糊淡入（默认）
  - `fade-slide`：旧内容左滑淡出，新内容右滑淡入
  - `zoom-blur`：旧内容缩小 + 强模糊淡出，新内容放大 + 强模糊淡入
- **时间参数**：旧内容退出 300ms，新内容进入 400ms，衔接紧凑

---

## 任务 3：useAnimation.ts

**文件路径**：`src/animation/hooks/useAnimation.ts`

### 实现要点

| Hook | 功能 | 关键实现 |
|---|---|---|
| `useStaggerEntrance` | 对容器子元素 stagger 入场 | `gsap.from` + `ScrollTrigger`（可选），支持 `childSelector` 自定义选择器 |
| `useScrollReveal` | 滚动触发 reveal | `gsap.to` + `ScrollTrigger`，支持 `scrub`、自定义 `start`、一次性/双向触发 |
| `useTextAnimation` | 文字逐字/逐词/逐行动画 | 手动拆分文本为 `<span>`，创建 `gsap.timeline`，返回 `{ play, reverse, kill }` 控制接口 |

- **类型安全**：三个 Hook 均配有完整的 `Options` TypeScript 接口
- **清理机制**：`useScrollReveal` 和 `useTextAnimation` 在 `useEffect` 返回的 cleanup 中 `kill()` 动画，防止内存泄漏

---

## 技术栈与依赖

- **TypeScript + React**：所有组件使用 `.tsx`， Props 全类型化
- **GSAP 插件**：`gsap`、`useGSAP`（`@gsap/react`）、`ScrollTrigger`
- **路径别名**：全部使用 `@/` 别名指向 `src/`
- **零新增依赖**：未引入项目中不存在的包

---

## 注意事项

1. `LoomSplash` 覆盖了原项目中基于 framer-motion 的启动遮罩组件，接口从 `{ visible, message }` 变为 `{ onComplete }`，引用处需同步更新
2. `PageTransition` 同样覆盖了原项目中基于 framer-motion 的过渡组件，接口从 `{ pageKey, mode }` 变为 `{ viewId, preset, onTransitionEnd }`，引用处需同步更新
3. `useAnimation.ts` 为新增文件，无冲突
4. 建议在使用 `PageTransition` 的父组件中通过 `key={viewId}` 或 `viewId` prop 确保 React 正确识别视图变化

---

## 完成状态

| 任务 | 状态 |
|---|---|
| `src/components/splash/LoomSplash.tsx` | ✅ 已完成 |
| `src/components/transition/PageTransition.tsx` | ✅ 已完成 |
| `src/animation/hooks/useAnimation.ts` | ✅ 已完成 |
| 实现报告 | ✅ 已完成 |
