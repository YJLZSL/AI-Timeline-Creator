/**
 * Storyloom 入场动画预设
 * 定义 5 个常用入场动画，每个返回 GSAP 配置对象
 * 供 AnimationEngine 与组件级入场动效调用
 */

import type { AnimationConfig } from '@/animation/AnimationEngine';

/** 预设标识 */
export type EntrancePresetId = 'fade-up' | 'fade-scale' | 'slide-left' | 'stagger' | 'elastic';

/**
 * 入场动画预设接口
 * 每个预设包含 from 状态（初始）和可选的 to 覆盖（结束）
 */
export interface EntrancePreset {
  id: EntrancePresetId;
  name: string;
  description: string;
  /** GSAP "from" 动画的 vars 对象 */
  fromVars: gsap.TweenVars;
  /** 是否覆盖默认透明度（false 表示不触发动画的元素需手动设置 opacity:1） */
  autoOpacity: boolean;
  /** 建议的默认持续时间（秒） */
  defaultDuration: number;
  /** 建议的默认缓动 */
  defaultEase: string;
  /** 是否支持 stagger（子元素依次入场） */
  supportsStagger: boolean;
  /** stagger 建议间隔（秒） */
  defaultStagger: number;
}

/* ===================== 预设 1：fade-up（淡入上升） ===================== */

export const fadeUp: EntrancePreset = {
  id: 'fade-up',
  name: '淡入上升',
  description: '元素从下方 24px 淡入上升，最通用的入场动效',
  fromVars: {
    opacity: 0,
    y: 24,
  },
  autoOpacity: true,
  defaultDuration: 0.6,
  defaultEase: 'power2.out',
  supportsStagger: true,
  defaultStagger: 0.08,
};

/**
 * 获取 fade-up 的 GSAP 配置
 * @param config 动画配置覆盖
 */
export function getFadeUpConfig(config?: AnimationConfig): gsap.TweenVars {
  return {
    opacity: 0,
    y: 24,
    duration: config?.duration ?? fadeUp.defaultDuration,
    ease: config?.ease ?? fadeUp.defaultEase,
    delay: config?.delay ?? 0,
    stagger: config?.stagger ?? 0,
  };
}

/* ===================== 预设 2：fade-scale（淡入缩放） ===================== */

export const fadeScale: EntrancePreset = {
  id: 'fade-scale',
  name: '淡入缩放',
  description: '元素从 0.95 缩小状态淡入并恢复至原尺寸，适合卡片、模态框',
  fromVars: {
    opacity: 0,
    scale: 0.95,
  },
  autoOpacity: true,
  defaultDuration: 0.5,
  defaultEase: 'power2.out',
  supportsStagger: true,
  defaultStagger: 0.06,
};

/**
 * 获取 fade-scale 的 GSAP 配置
 * @param config 动画配置覆盖
 */
export function getFadeScaleConfig(config?: AnimationConfig): gsap.TweenVars {
  return {
    opacity: 0,
    scale: 0.95,
    duration: config?.duration ?? fadeScale.defaultDuration,
    ease: config?.ease ?? fadeScale.defaultEase,
    delay: config?.delay ?? 0,
    stagger: config?.stagger ?? 0,
  };
}

/* ===================== 预设 3：slide-left（左侧滑入） ===================== */

export const slideLeft: EntrancePreset = {
  id: 'slide-left',
  name: '左侧滑入',
  description: '元素从左侧 -40px 滑入，适合侧边栏、列表项、高对比主题',
  fromVars: {
    opacity: 0,
    x: -40,
  },
  autoOpacity: true,
  defaultDuration: 0.5,
  defaultEase: 'power3.out',
  supportsStagger: true,
  defaultStagger: 0.1,
};

/**
 * 获取 slide-left 的 GSAP 配置
 * @param config 动画配置覆盖
 */
export function getSlideLeftConfig(config?: AnimationConfig): gsap.TweenVars {
  return {
    opacity: 0,
    x: -40,
    duration: config?.duration ?? slideLeft.defaultDuration,
    ease: config?.ease ?? slideLeft.defaultEase,
    delay: config?.delay ?? 0,
    stagger: config?.stagger ?? 0,
  };
}

/* ===================== 预设 4：stagger（阶梯错落） ===================== */

export const stagger: EntrancePreset = {
  id: 'stagger',
  name: '阶梯错落',
  description: '多个子元素依次从下方 24px、0.98 缩放状态入场，适合卡片列表、网格布局',
  fromVars: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  autoOpacity: true,
  defaultDuration: 0.5,
  defaultEase: 'power2.out',
  supportsStagger: true,
  defaultStagger: 0.08,
};

/**
 * 获取 stagger 的 GSAP 配置
 * @param config 动画配置覆盖
 */
export function getStaggerConfig(config?: AnimationConfig): gsap.TweenVars {
  return {
    opacity: 0,
    y: 24,
    scale: 0.98,
    duration: config?.duration ?? stagger.defaultDuration,
    ease: config?.ease ?? stagger.defaultEase,
    delay: config?.delay ?? 0,
    stagger: config?.stagger ?? stagger.defaultStagger,
  };
}

/* ===================== 预设 5：elastic（弹性弹出） ===================== */

export const elastic: EntrancePreset = {
  id: 'elastic',
  name: '弹性弹出',
  description: '元素以弹性缓动从 0.5 缩放弹出，适合桜、极光等浪漫/梦幻主题',
  fromVars: {
    opacity: 0,
    scale: 0.5,
  },
  autoOpacity: true,
  defaultDuration: 0.8,
  defaultEase: 'elastic.out(1, 0.5)',
  supportsStagger: true,
  defaultStagger: 0.12,
};

/**
 * 获取 elastic 的 GSAP 配置
 * @param config 动画配置覆盖
 */
export function getElasticConfig(config?: AnimationConfig): gsap.TweenVars {
  return {
    opacity: 0,
    scale: 0.5,
    duration: config?.duration ?? elastic.defaultDuration,
    ease: config?.ease ?? elastic.defaultEase,
    delay: config?.delay ?? 0,
    stagger: config?.stagger ?? 0,
  };
}

/* ===================== 预设注册表 ===================== */

/** 所有入场动画预设映射表 */
export const entrancePresets: Record<EntrancePresetId, EntrancePreset> = {
  'fade-up': fadeUp,
  'fade-scale': fadeScale,
  'slide-left': slideLeft,
  stagger,
  elastic,
};

/** 入场动画 ID 列表 */
export const entrancePresetIds: EntrancePresetId[] = Object.keys(entrancePresets) as EntrancePresetId[];

/**
 * 按 ID 获取入场动画预设
 * @param id 预设 ID
 * @returns 预设定义，不存在时返回 fade-up
 */
export function getEntrancePreset(id: string): EntrancePreset {
  return entrancePresets[id as EntrancePresetId] ?? fadeUp;
}

/**
 * 按 ID 获取入场动画 GSAP 配置对象
 * @param id 预设 ID
 * @param config 动画配置覆盖
 * @returns GSAP TweenVars 配置
 */
export function getEntranceConfig(id: string, config?: AnimationConfig): gsap.TweenVars {
  switch (id as EntrancePresetId) {
    case 'fade-up':
      return getFadeUpConfig(config);
    case 'fade-scale':
      return getFadeScaleConfig(config);
    case 'slide-left':
      return getSlideLeftConfig(config);
    case 'stagger':
      return getStaggerConfig(config);
    case 'elastic':
      return getElasticConfig(config);
    default:
      return getFadeUpConfig(config);
  }
}

/* ===================== React Hook 快捷入口 ===================== */

import { useMemo } from 'react';

/**
 * 根据当前主题推荐的入场动画 ID 获取配置
 * 与 themes/index.ts 中 ThemeDefinition.animation.entranceEffect 联动
 * @param presetId 入场动画预设 ID
 * @param config 动画配置覆盖
 */
export function useEntranceConfig(presetId: EntrancePresetId, config?: AnimationConfig): gsap.TweenVars {
  return useMemo(() => getEntranceConfig(presetId, config), [presetId, config]);
}

/** 别名导出：兼容 animation/index.ts 的统一命名 */
export { entrancePresets as ENTRANCE_PRESETS };
