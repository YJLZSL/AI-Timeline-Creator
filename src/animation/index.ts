/**
 * Storyloom 动画层统一入口
 * 集中导出所有公共 API，供组件 / hooks / 预设使用
 */

export { gsap, ScrollTrigger, useGSAP } from './AnimationEngine';
export { createTimeline, pauseAll, resumeAll, EASINGS } from './AnimationEngine';
export { animateStaggerEntrance, animateSVGDraw, animateTextByChars } from './AnimationEngine';
export type { AnimationConfig, TimelineConfig, EasingName } from './AnimationEngine';
export { useAnimationCleanup, useThemeTransition } from './AnimationEngine';
export type { AnimationPreset, ThemeAnimationConfig, RenderLayerConfig } from './types';

// 预设
export { ENTRANCE_PRESETS } from './presets/entrance-effects';
export { PAGE_TRANSITION_PRESETS } from './presets/page-transitions';
