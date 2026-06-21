import { useThemeStore, type ThemeId } from '@/stores/useThemeStore';
import { ParticleCanvas } from './ParticleCanvas';
import type { RenderLayerConfig } from '@/animation/types';

// ============================================================
// 渲染层统一入口组件
// 根据当前主题配置选择渲染方式，默认使用 Canvas 2D 粒子系统
// ============================================================

/**
 * 各主题默认渲染层配置
 * 所有主题默认使用 particles，contrast 高对比主题使用 none 以提高可读性
 */
const DEFAULT_RENDER_LAYER: Record<Exclude<ThemeId, 'system'>, RenderLayerConfig> = {
  luosheng: { backgroundEffect: 'particles' },
  midnight: { backgroundEffect: 'particles' },
  forest: { backgroundEffect: 'particles' },
  'ink-wash': { backgroundEffect: 'particles' },
  contrast: { backgroundEffect: 'none' },
  sakura: { backgroundEffect: 'particles' },
  ocean: { backgroundEffect: 'particles' },
  aurora: { backgroundEffect: 'particles' },
};

interface RenderLayerProps {
  /** 可覆盖默认配置的渲染层配置 */
  renderLayer?: RenderLayerConfig;
}

/**
 * 渲染层组件
 *
 * 职责：
 * 1. 读取当前主题，决定背景效果类型
 * 2. 默认使用 ParticleCanvas（Canvas 2D 粒子）
 * 3. 如果配置为 'none'，则不渲染任何背景
 * 4. 预留 shader / texture 渲染层扩展位，供未来 WebGL 渲染层使用
 */
export function RenderLayer({ renderLayer: overrideConfig }: RenderLayerProps = {}) {
  const theme = useThemeStore((s) => s.theme);

  // 解析实际使用的渲染层配置（外部传入优先，否则取主题默认值）
  const resolvedTheme: Exclude<ThemeId, 'system'> =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'midnight'
        : 'luosheng'
      : theme;

  const config = overrideConfig ?? DEFAULT_RENDER_LAYER[resolvedTheme] ?? { backgroundEffect: 'particles' };

  switch (config.backgroundEffect) {
    case 'none':
      // 不渲染任何背景，返回空占位
      return null;

    case 'particles':
    default:
      // 默认使用现有 Canvas 2D 粒子系统
      return <ParticleCanvas />;

  case 'shader':
  case 'texture':
    // 未来扩展：PixiBackground / WebGL 渲染层尚未集成，fallback 到 ParticleCanvas
    return <ParticleCanvas />;
  }
}
