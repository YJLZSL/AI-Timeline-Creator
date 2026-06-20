# Storyloom Phase 1 设计规范

> 风格：洛笙温暖感 + Linear 清爽感，微创新（织机隐喻）
> 字体：系统字体（保持轻量）

---

## 一、全局令牌更新（index.css）

### 新增令牌（在 @theme 块内）

```css
/* 新增阴影 */
--shadow-card-hover: 0 8px 24px -4px rgb(0 0 0 / 0.12);
--shadow-card-active: 0 2px 8px rgb(0 0 0 / 0.08);
--shadow-glow: 0 0 0 2px rgb(var(--primary) / 0.15);

/* 新增毛玻璃 */
--glass-bg: rgba(var(--card), 0.7);
--glass-border: rgba(var(--border), 0.3);

/* 新增动画 */
--animation-enter: 150ms cubic-bezier(0.16, 1, 0.3, 1);
--animation-exit: 100ms ease-in;

/* 新增纹理（用于时间轴背景） */
--timeline-grid-color: rgba(var(--border), 0.08);
--timeline-grid-size: 40px 40px;
```

### 各主题纹理优化

**洛笙主题（luosheng）**：
- 增加纸张纹理：使用 `repeating-linear-gradient` 模拟横线笔记本效果
- 纹理 opacity 保持 0.02-0.04 之间，不干扰内容

```css
--theme-texture: 
  /* 纸张横线 */
  repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 23px,
    rgb(184 134 11 / 0.02) 23px,
    rgb(184 134 11 / 0.02) 24px
  ),
  /* 晕染光斑 */
  radial-gradient(circle at 20% 20%, rgb(184 134 11 / 0.03) 0%, transparent 50%),
  radial-gradient(circle at 80% 80%, rgb(160 82 45 / 0.02) 0%, transparent 40%);
--theme-texture-size: 100% 24px, 100% 100%, 100% 100%;
```

**午夜主题（midnight）**：
- 增加星空粒子效果（更多、更小的光点）

```css
--theme-texture: 
  radial-gradient(circle at 10% 20%, rgb(56 189 248 / 0.15) 0%, transparent 2%),
  radial-gradient(circle at 30% 60%, rgb(255 255 255 / 0.1) 0%, transparent 1.5%),
  radial-gradient(circle at 70% 40%, rgb(56 189 248 / 0.12) 0%, transparent 2%),
  radial-gradient(circle at 85% 80%, rgb(255 255 255 / 0.08) 0%, transparent 1.5%),
  radial-gradient(circle at 50% 10%, rgb(56 189 248 / 0.06) 0%, transparent 3%),
  radial-gradient(circle at 50% 50%, rgb(56 189 248 / 0.05) 0%, transparent 60%);
--theme-texture-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%;
```

---

## 二、EmptyShell 重设计

### 布局结构（三栏）

```
+------------------+--------------------------+------------------+
|   品牌区 (25%)   |      工作区 (50%)         |  快速操作 (25%)  |
|                  |                          |                  |
|  织机 SVG        |  工作区卡片网格            |  新建工作区      |
|  品牌标题        |  + 导入/导出              |  导入项目        |
|  版本信息        |  + 教程入口               |  设置            |
|  格言/描述       |                          |  关于            |
+------------------+--------------------------+------------------+
```

### 品牌区设计

- **织机 SVG**：抽象几何图形，由 5-7 条垂直线（经线）和 3-4 条水平线（纬线）交织构成。线条使用主题 primary 色，opacity 0.3-0.6。线宽 1-2px。
- **微动效**：SVG 线条有 subtle 的波动动画（CSS animation，translateY ±2px，4s 周期，alternate），模拟织布机运作。注意：使用 `prefers-reduced-motion` 媒体查询禁用。
- **品牌标题**："Storyloom · 絮织"，font-serif，2xl，font-bold，tracking-wide
- **副标题**："把时间织成故事"，text-muted-foreground，sm
- **版本信息**：右下角，text-[11px]，text-muted-foreground/60

### 工作区卡片升级

- **卡片尺寸**：保持现有，但增加细节
- **左侧色条**：新增！卡片左侧 3px 宽色条，使用工作区的主色调（如果有的话，否则用 primary 色）
- **Hover 效果**：
  - 上浮：translateY -6px（现有是 -4px，增加）
  - 阴影：hover 时使用 --shadow-card-hover
  - 色条发光：hover 时色条有 box-shadow 光晕效果
  - Shimmer 扫过：一个从左到右的极淡光带（opacity 0.03）在 hover 时扫过卡片
- **统计信息**：事件数、更新时间保持，但增加"轨道数"（如果有数据）
- **空状态**：如果不为空，显示 "ChapterRail" 组件（已有）

### 快速操作面板

- 垂直排列的按钮组
- 每个按钮：左侧图标 + 文字
- 按钮风格：TButton outline，小尺寸，但宽度填满面板
- 按钮 Hover：背景色变为 primary/5，文字变 primary
- 分隔线：使用 border-border/50 细线分隔不同组

### 顶部栏保持

- 现有顶部栏已经不错，保持
- 但可以增加底部 border 的渐变效果（从左到右 primary/30 → transparent → primary/30）

---

## 三、TimelineEventCard 重设计

### 卡片整体

- **圆角**：保持 rounded-xl（12px）
- **背景**：使用毛玻璃效果 — `bg-card/80 backdrop-blur-sm`
- **边框**：
  - 默认：1px solid border/40（更淡的边框）
  - Hover：border/60 + 微妙的 box-shadow
  - 选中：border-primary/50 + glow shadow
- **织线边框效果（微创新）**：
  - 卡片 pseudo-element `::before` 在左侧边缘
  - 一条 1px 的虚线边框，opacity 0.15，模拟布边
  - 只有左侧有这条虚线

### 左侧色条升级

- **宽度**：从 3px/4px 统一为 4px
- **圆角**：顶部圆角与卡片一致
- **光效（Hover）**：使用 box-shadow 从色条向右扩散
  ```css
  box-shadow: 3px 0 8px -1px ${eventColor}40;
  ```
- **渐变**：色条本身有微妙渐变（从顶部稍亮到底部稍暗）

### 内容层

- **标题**：保持 font-serif，但增加 letter-spacing（0.01em）
- **摘要**：保持 line-clamp-1，但颜色从 muted-foreground 变为 muted-foreground/90（更浓一点）
- **时间/地点**：保持等宽字体，但增加一个小圆点分隔符
- **标签**：保持 TTag，但增加轨道色关联（如果有轨道色，标签用轨道色的 light variant）

### Hover 快速操作（新增）

- 在卡片右上角（hover 时显示）
- 3 个圆形按钮：编辑（EditIcon）、关联（LinkIcon）、大纲（FileTextIcon）
- 按钮：24px 圆形，bg-background/80，border border-border/50
- 按钮 Hover：bg-primary/10，text-primary
- 出现动画：fade-in + scale（0.9 → 1），150ms

### 选中态升级

- 现有：ring-2 ring-primary ring-offset-1
- 升级：
  - 外发光：box-shadow: 0 0 0 2px rgb(var(--primary) / 0.2), 0 0 12px rgb(var(--primary) / 0.1)
  - 轻微放大：scale(1.01)
  - 边框：border-primary/40

### 拖拽态升级

- 半透明：opacity 0.88（现有 0.92，更透明一点）
- 阴影：更大、更模糊
- 旋转：微妙 rotate(1deg)（可选，增加"拖拽感"）

---

## 四、TimelineCanvas 背景优化

### 网格背景升级

- **现有**：40px 的实线网格，border/15
- **升级**：
  - 主网格：40px，虚线（repeating-linear-gradient 模拟虚线），border/8（更淡）
  - 子网格：20px，更细更淡（border/4）
  - 这样形成"大格套小格"的层次感，像织布的密度变化

```css
background-image: 
  /* 小网格（20px） */
  linear-gradient(to right, rgb(var(--border) / 0.04) 1px, transparent 1px),
  linear-gradient(to bottom, rgb(var(--border) / 0.04) 1px, transparent 1px),
  /* 大网格（40px） */
  linear-gradient(to right, rgb(var(--border) / 0.08) 1px, transparent 1px),
  linear-gradient(to bottom, rgb(var(--border) / 0.08) 1px, transparent 1px);
background-size: 20px 20px, 20px 20px, 40px 40px, 40px 40px;
```

### 轨道头升级

- **背景**：`bg-card/60 backdrop-blur-md`（更强的毛玻璃）
- **阴影**：底部增加 `shadow-sm`（模拟轨道头浮在时间轴上方）
- **圆角**：保持 rounded-xl，但增加微妙边框
- **Hover**：bg-card/80，阴影加深

### 空状态升级

- 现有 SVG 不错，但可以增加：
  - 动画：SVG 线条有 subtle 的 stroke-dashoffset 动画（模拟编织过程）
  - 文字：更温暖的文案，如"故事从这里开始编织"
  - 按钮：更大的按钮，绿色主题（success）

### 时间标尺优化

- 刻度线：更细（1px），颜色更淡
- 重要日期：加粗字体 + 更长刻度线
- 当前日期：如果有，增加高亮标记

---

## 五、技术约束

1. **不要破坏现有功能**：拖拽、resize、scrollToEvent、ContextMenu 等保持
2. **不要引入新依赖**：使用现有 framer-motion、TDesign、Tailwind
3. **保持响应式**：所有改动在缩放时正常
4. **保持暗色主题兼容**：所有颜色使用主题令牌
5. **prefers-reduced-motion**：动画应遵守此媒体查询
6. **每次修改后**：必须 `npm run typecheck` 和 `npm run test` 通过

---

## 六、文件修改清单

| 文件 | 修改内容 | 代理 |
|------|---------|------|
| `src/index.css` | 添加新令牌、优化纹理 | 代理A |
| `src/components/layout/EmptyShell.tsx` | 三栏布局、品牌SVG、快速操作 | 代理A |
| `src/components/workspace/WorkspaceSelector.tsx` | 布局适配、升级卡片网格 | 代理A |
| `src/components/workspace/WorkspaceCard.tsx` | 左侧色条、hover shimmer、升级阴影 | 代理A |
| `src/components/timeline/TimelineEventCard.tsx` | 毛玻璃、hover操作、织线边框、选中态升级 | 代理B |
| `src/components/timeline/TimelineTrack.tsx` | 轨道头毛玻璃、背景优化 | 代理C |
| `src/components/timeline/TimelineCanvas.tsx` | 网格背景升级、空状态升级、纹理叠加 | 代理C |

---

## 七、关键 CSS 参考代码

### 织线边框效果（伪元素）

```css
.timeline-card {
  position: relative;
}
.timeline-card::before {
  content: '';
  position: absolute;
  left: 4px; /* 色条右侧 */
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: repeating-linear-gradient(
    to bottom,
    rgb(var(--border) / 0.2) 0px,
    rgb(var(--border) / 0.2) 4px,
    transparent 4px,
    transparent 8px
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}
.timeline-card:hover::before {
  opacity: 1;
}
```

### 卡片 Shimmer 效果

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.workspace-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgb(var(--primary) / 0.03) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  pointer-events: none;
}
.workspace-card:hover::after {
  animation: shimmer 0.8s ease-out;
}
```

### 织机 SVG（简化版）

```svg
<svg viewBox="0 0 200 200" width="200" height="200">
  <!-- 经线（垂直） -->
  <line x1="40" y1="20" x2="40" y2="180" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
    <animate attributeName="y1" values="20;18;20" dur="4s" repeatCount="indefinite" />
    <animate attributeName="y2" values="180;182;180" dur="4s" repeatCount="indefinite" />
  </line>
  <!-- 更多经线... -->
  <!-- 纬线（水平） -->
  <line x1="20" y1="60" x2="180" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.25" />
  <!-- 交织点 -->
  <circle cx="40" cy="60" r="2" fill="currentColor" opacity="0.3" />
</svg>
```
