# Storyloom 主题配置系统与渲染层架构实现报告

## 1. 任务概览

本次实现围绕 **Storyloom** 项目的视觉设计系统，完成了以下 4 项核心文件的创建：

| 文件 | 职责 |
|------|------|
| `src/themes/index.ts` | 8 套主题的核心配置（颜色、字体、动画、材质、渲染层） |
| `src/animation/presets/entrance-effects.ts` | 5 个 GSAP 入场动画预设 |
| `src/animation/presets/page-transitions.ts` | 3 个 GSAP 页面过渡预设 |
| `src/components/render-layer/PixiBackground.tsx` | PixiJS v8 背景粒子渲染层（渐进增强） |

---

## 2. 主题配置系统 (`src/themes/index.ts`)

### 2.1 设计思路

从项目现有的 `src/index.css` 中提取 8 套 CSS 主题变量的核心值，将其结构化为 TypeScript 的 `ThemeDefinition` 对象。实现**"CSS 负责静态渲染，TS 配置负责逻辑读取"**的双层架构：

- **CSS 层**：通过 `[data-theme="*"]` 选择器定义 CSS 变量（`--background`、`--primary` 等），由浏览器完成高效渲染。
- **TS 层**：通过 `getActiveTheme()` 在运行时读取当前主题配置，供动画引擎、渲染层、组件逻辑动态使用。

### 2.2 8 套主题配置总览

| 主题 ID | 名称 | 背景色 | 主色 | 字体风格 | 粒子效果 |
|---------|------|--------|------|----------|----------|
| `luosheng` | 洛笙 | `#FAF6ED` | `#B8860B` | 宋体/衬线 | 织絮微尘 |
| `midnight` | 子夜 | `#0F172A` | `#38BDF8` | 等宽风格 | 深空星点 |
| `forest` | 森林 | `#E8F0E2` | `#2F7A41` | 宋体/衬线 | 林间萤火 |
| `ink-wash` | 水墨 | `#F5F5F0` | `#1A1A1A` | 宋体（大行高） | 墨滴晕染 |
| `contrast` | 高对比 | `#000000` | `#FFFF00` | 无衬线（加粗） | 无（纯净） |
| `sakura` | 桜 | `#FFF0F5` | `#E88B9A` | 宋体/衬线 | 樱花飘落 |
| `ocean` | 深海 | `#0A1628` | `#5ECCD6` | 无衬线 | 深海气泡 |
| `aurora` | 极光 | `#0D1B1E` | `#8B5CF6` | 无衬线 | 极光流动 |

### 2.3 数据结构

每套主题完整实现了 `ThemeDefinition` 接口：

- **`colors`**：9 个语义化颜色字段（primary / secondary / background / surface / text / textMuted / accent / border / shadow）
- **`typography`**：字体族、字号缩放、行高（水墨主题行高加大至 1.8）
- **`animation`**：与动画预设系统联动的 5 个动画 ID（pageTransition / hoverEffect / entranceEffect / scrollEffect / svgEffect）
- **`renderLayer`**：背景效果类型（`particles` | `none`）和粒子预设 ID
- **`material`**：玻璃透明度、模糊半径、卡片圆角、阴影、边框宽度（高对比主题边框 2px、无阴影）

### 2.4 粒子预设系统

定义了 8 套与主题一一对应的粒子预设（`ParticlePresetConfig`）：

- 运动模式：`float`（漂浮）、`rise`（上升）、`fall`（下落）、`swirl`（旋转）、`pulse`（脉冲）
- 混合模式：支持 `normal` 和 `add`（ additive 混合适合发光效果）
- 参数范围：数量、大小、速度、透明度均支持 min/max 随机区间

### 2.5 导出 API

```typescript
export const themes: Record<string, ThemeDefinition>           // 主题映射表
export const themeList: ThemeDefinition[]                        // 主题数组（用于 UI 选择器）
export function getThemeById(id: string): ThemeDefinition        // 按 ID 获取（默认回退洛笙）
export function getActiveTheme(): ThemeDefinition                // 获取当前 DOM 激活主题
export function getParticlePreset(themeId: string): ParticlePresetConfig  // 获取主题粒子配置
```

---

## 3. 入场动画预设 (`src/animation/presets/entrance-effects.ts`)

### 3.1 预设清单

| 预设 ID | 名称 | 效果描述 | 适用场景 |
|---------|------|----------|----------|
| `fade-up` | 淡入上升 | 从下方 24px 淡入 | 通用 |
| `fade-scale` | 淡入缩放 | 从 0.95 缩放入场 | 卡片、弹窗 |
| `slide-left` | 左侧滑入 | 从左侧 -40px 滑入 | 侧边栏、列表 |
| `stagger` | 阶梯错落 | 依次从下方 + 0.98 缩放 | 卡片网格、列表 |
| `elastic` | 弹性弹出 | 弹性缓动从 0.5 放大 | 桜、极光等梦幻主题 |

### 3.2 设计特点

- 每个预设返回标准的 `gsap.TweenVars` 对象，与项目已有的 `AnimationEngine` 完全兼容
- 支持 `stagger` 批量入场，提供默认间隔参数
- 提供 `getEntranceConfig(id, config)` 统一入口，按 ID 获取配置并支持参数覆盖
- 提供 `useEntranceConfig()` React Hook，方便组件内使用

---

## 4. 页面过渡预设 (`src/animation/presets/page-transitions.ts`)

### 4.1 预设清单

| 预设 ID | 名称 | 效果描述 | 适用主题 |
|---------|------|----------|----------|
| `loom-weave` | 织布展开 | 新页面从中心横向向两侧展开（clip-path） | 洛笙、桜 |
| `fade-slide` | 淡入滑动 | 标准旧页淡出 + 新页从下方滑入 | 通用、水墨、森林 |
| `zoom-blur` | 缩放模糊 | 旧页缩小模糊 + 新页从放大恢复清晰 | 子夜、深海、极光 |

### 4.2 设计特点

- 每个预设包含 **leave**（离开）和 **enter**（进入）两阶段，以及完整的 `createTimeline` 组合动画
- `loom-weave` 使用 `clip-path: inset()` 模拟织布机经线向两侧拉开的视觉效果
- `zoom-blur` 使用 CSS `filter: blur()` 实现模糊过渡，不支持滤镜的浏览器自动降级为纯缩放
- 提供 `createPageTransition(id, fromElement, toElement, config)` 统一时间线创建函数

---

## 5. PixiJS 渲染层 (`src/components/render-layer/PixiBackground.tsx`)

### 5.1 设计目标

- **渐进增强**：PixiJS 粒子效果作为 CSS 背景纹理的补充，不是替代
- **Tauri 感知**：桌面端（Tauri 环境）默认不渲染，避免 GPU 资源占用；Web 端自动启用
- **主题感知**：自动读取 `getActiveTheme()` 配置，渲染对应主题的粒子效果
- **安全降级**：初始化失败时静默回退，不阻断应用运行

### 5.2 实现要点

- 使用 **PixiJS v8** 原生 API：`new Application()` + `await app.init()` + `appendChild(app.canvas)`
- 无 `@pixi/react` 依赖，使用 `useRef` + `useEffect` 手动管理生命周期
- 响应式：监听 `resize` 事件，防抖 300ms 后重新初始化
- 主题热切换：通过 `MutationObserver` 监听 `data-theme` 属性变化，自动切换粒子风格
- 限制高 DPI 分辨率至 `devicePixelRatio` 上限 2，避免 Retina 屏性能问题

### 5.3 粒子运动系统

支持 5 种运动模式（与 `themes/index.ts` 中的预设对齐）：

| 模式 | 实现逻辑 |
|------|----------|
| `float` | 匀速漂浮 + 边界环绕 |
| `rise` | 向上运动 + 正弦横摆 + 底部重生 |
| `fall` | 向下运动 + 正弦横摆 + 顶部重生 |
| `swirl` | 绕屏幕中心旋转 + 径向漂移 |
| `pulse` | 正弦缩放脉冲 + 微速漂浮 |

---

## 6. 与现有系统集成

### 6.1 与 `useThemeStore` 的联动

`useThemeStore` 负责持久化用户主题偏好并写入 `data-theme` 属性。新建的主题配置系统通过 `getActiveThemeId()` 读取 `document.documentElement.dataset.theme`，实现单向同步：

```
useThemeStore.setTheme('midnight') → DOM data-theme="midnight" → getActiveTheme() → 返回 midnight 配置
```

### 6.2 与 `AnimationEngine` 的联动

入场动画和页面过渡预设返回的 `gsap.TweenVars` 可直接传入 `AnimationEngine.createTimeline()` 或 `gsap.from()` / `gsap.to()`，实现无缝集成。

### 6.3 与 `RenderLayer` 的联动

`PixiBackground` 组件作为 `render-layer` 目录下的独立组件，可被 `RenderLayer.tsx` 或页面根组件按需引入。通过 `pointerEvents: 'none'` 和 `zIndex: 0` 确保不拦截内容层交互。

---

## 7. 类型安全与代码质量

- 所有文件使用 **TypeScript**，严格模式（`strict: true`）下通过类型检查
- 使用项目路径别名 `@/` 导入，与现有代码风格一致
- 所有导出接口与 `src/animation/types.ts` 中已定义的 `ThemeDefinition`、`AnimationConfig` 等类型兼容
- 中文注释说明设计意图，英文标识符保持与 GSAP/PixiJS 官方命名一致

---

## 8. 后续建议

1. **Shader 背景扩展**：当前仅实现了 `particles` 效果，可在 `RenderLayerConfig` 中扩展 `shader` 类型，为子夜/深海主题添加 WebGL 着色器背景（如星空、深海光线）
2. **性能监控**：在 `PixiBackground` 中增加 FPS 检测，当帧率低于阈值时自动降级到 CSS 背景
3. **动画编排器**：将 `pageTransition` 和 `entranceEffect` 集成到路由切换逻辑中，实现全自动的主题感知动画流水线
4. **材质动态切换**：将 `ThemeMaterial` 中的值（如 `glassBlur`）通过 CSS 自定义属性注入到 DOM，实现主题切换时的材质渐变过渡
