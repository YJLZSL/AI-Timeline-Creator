/**
 * Storyloom 页面过渡动画预设
 * 定义 3 个页面切换过渡效果，每个返回 GSAP 时间线配置
 * 供路由切换、主题切换、页面导航时调用
 */

import { gsap } from 'gsap';
import type { AnimationConfig } from '@/animation/AnimationEngine';

/** 预设标识 */
export type PageTransitionPresetId = 'loom-weave' | 'fade-slide' | 'zoom-blur';

/**
 * 页面过渡预设接口
 * 每个预设包含进入（enter）和离开（leave）两个阶段的动画配置
 */
export interface PageTransitionPreset {
  id: PageTransitionPresetId;
  name: string;
  description: string;
  /** 默认总持续时间（秒） */
  defaultDuration: number;
  /** 默认缓动 */
  defaultEase: string;
  /**
   * 创建离开动画的 GSAP 配置
   * @param fromElement 当前页面根元素
   * @param config 动画配置覆盖
   */
  leaveVars: (fromElement: HTMLElement, config?: AnimationConfig) => gsap.TweenVars;
  /**
   * 创建进入动画的 GSAP 配置
   * @param toElement 目标页面根元素
   * @param config 动画配置覆盖
   */
  enterVars: (toElement: HTMLElement, config?: AnimationConfig) => gsap.TweenVars;
  /**
   * 创建完整时间线（可选，用于更复杂的组合动画）
   * @param fromElement 当前页面根元素
   * @param toElement 目标页面根元素
   * @param config 动画配置覆盖
   */
  createTimeline?: (
    fromElement: HTMLElement,
    toElement: HTMLElement,
    config?: AnimationConfig,
  ) => gsap.core.Timeline;
}

/* ===================== 预设 1：loom-weave（织布展开） ===================== */

export const loomWeave: PageTransitionPreset = {
  id: 'loom-weave',
  name: '织布展开',
  description: '模拟织机效果，新页面从中心横向向两侧展开，适合洛笙、桜等织物/自然主题',
  defaultDuration: 0.8,
  defaultEase: 'power3.inOut',
  leaveVars: (_fromElement, config) => ({
    opacity: 0,
    scaleX: 0.95,
    transformOrigin: 'center center',
    duration: (config?.duration ?? loomWeave.defaultDuration) * 0.4,
    ease: config?.ease ?? loomWeave.defaultEase,
  }),
  enterVars: (toElement, config) => {
    // 初始化目标元素的裁剪路径，为展开动画做准备
    gsap.set(toElement, {
      clipPath: 'inset(0 50% 0 50%)',
      opacity: 1,
    });
    return {
      clipPath: 'inset(0 0% 0 0%)',
      duration: (config?.duration ?? loomWeave.defaultDuration) * 0.6,
      ease: config?.ease ?? loomWeave.defaultEase,
      delay: (config?.duration ?? loomWeave.defaultDuration) * 0.35,
    };
  },
  createTimeline: (fromElement, toElement, config) => {
    const duration = config?.duration ?? loomWeave.defaultDuration;
    const ease = config?.ease ?? loomWeave.defaultEase;
    const tl = gsap.timeline({ defaults: { ease } });

    // 阶段 1：旧页面淡出并向内收缩
    tl.to(fromElement, {
      opacity: 0,
      scaleX: 0.95,
      scaleY: 0.98,
      transformOrigin: 'center center',
      duration: duration * 0.4,
    });

    // 阶段 2：新页面从中心横向展开（模拟织布机经线向两侧拉开）
    tl.set(
      toElement,
      {
        clipPath: 'inset(0 50% 0 50%)',
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
      },
      duration * 0.35,
    );

    tl.to(
      toElement,
      {
        clipPath: 'inset(0 0% 0 0%)',
        duration: duration * 0.6,
      },
      duration * 0.35,
    );

    return tl;
  },
};

/**
 * 获取 loom-weave 的离开动画配置
 * @param fromElement 当前页面根元素
 * @param config 动画配置覆盖
 */
export function getLoomWeaveLeaveConfig(fromElement: HTMLElement, config?: AnimationConfig): gsap.TweenVars {
  return loomWeave.leaveVars(fromElement, config);
}

/**
 * 获取 loom-weave 的进入动画配置
 * @param toElement 目标页面根元素
 * @param config 动画配置覆盖
 */
export function getLoomWeaveEnterConfig(toElement: HTMLElement, config?: AnimationConfig): gsap.TweenVars {
  return loomWeave.enterVars(toElement, config);
}

/* ===================== 预设 2：fade-slide（淡入滑动） ===================== */

export const fadeSlide: PageTransitionPreset = {
  id: 'fade-slide',
  name: '淡入滑动',
  description: '标准页面过渡：旧页面淡出，新页面从下方 30px 淡入滑动，最通用的过渡效果',
  defaultDuration: 0.5,
  defaultEase: 'power2.inOut',
  leaveVars: (_fromElement, config) => ({
    opacity: 0,
    y: -16,
    duration: (config?.duration ?? fadeSlide.defaultDuration) * 0.45,
    ease: config?.ease ?? fadeSlide.defaultEase,
  }),
  enterVars: (toElement, config) => {
    gsap.set(toElement, { opacity: 0, y: 30 });
    return {
      opacity: 1,
      y: 0,
      duration: (config?.duration ?? fadeSlide.defaultDuration) * 0.55,
      ease: config?.ease ?? fadeSlide.defaultEase,
      delay: (config?.duration ?? fadeSlide.defaultDuration) * 0.25,
    };
  },
  createTimeline: (fromElement, toElement, config) => {
    const duration = config?.duration ?? fadeSlide.defaultDuration;
    const ease = config?.ease ?? fadeSlide.defaultEase;
    const tl = gsap.timeline({ defaults: { ease } });

    // 阶段 1：旧页面向上淡出
    tl.to(fromElement, {
      opacity: 0,
      y: -16,
      duration: duration * 0.45,
    });

    // 阶段 2：新页面从下方滑入
    tl.set(toElement, { opacity: 0, y: 30 }, duration * 0.2);
    tl.to(
      toElement,
      {
        opacity: 1,
        y: 0,
        duration: duration * 0.55,
      },
      duration * 0.25,
    );

    return tl;
  },
};

/**
 * 获取 fade-slide 的离开动画配置
 * @param fromElement 当前页面根元素
 * @param config 动画配置覆盖
 */
export function getFadeSlideLeaveConfig(fromElement: HTMLElement, config?: AnimationConfig): gsap.TweenVars {
  return fadeSlide.leaveVars(fromElement, config);
}

/**
 * 获取 fade-slide 的进入动画配置
 * @param toElement 目标页面根元素
 * @param config 动画配置覆盖
 */
export function getFadeSlideEnterConfig(toElement: HTMLElement, config?: AnimationConfig): gsap.TweenVars {
  return fadeSlide.enterVars(toElement, config);
}

/* ===================== 预设 3：zoom-blur（缩放模糊） ===================== */

export const zoomBlur: PageTransitionPreset = {
  id: 'zoom-blur',
  name: '缩放模糊',
  description: '旧页面缩小并模糊，新页面从放大状态恢复，适合子夜、深海、极光等科技/梦幻主题',
  defaultDuration: 0.7,
  defaultEase: 'power2.inOut',
  leaveVars: (fromElement, config) => {
    // 设置模糊滤镜（渐进增强，不支持滤镜的浏览器仅缩放）
    gsap.set(fromElement, { filter: 'blur(0px)' });
    return {
      opacity: 0,
      scale: 0.92,
      filter: 'blur(4px)',
      transformOrigin: 'center center',
      duration: (config?.duration ?? zoomBlur.defaultDuration) * 0.45,
      ease: config?.ease ?? zoomBlur.defaultEase,
    };
  },
  enterVars: (toElement, config) => {
    gsap.set(toElement, {
      opacity: 0,
      scale: 1.05,
      filter: 'blur(2px)',
      transformOrigin: 'center center',
    });
    return {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: (config?.duration ?? zoomBlur.defaultDuration) * 0.55,
      ease: config?.ease ?? zoomBlur.defaultEase,
      delay: (config?.duration ?? zoomBlur.defaultDuration) * 0.3,
    };
  },
  createTimeline: (fromElement, toElement, config) => {
    const duration = config?.duration ?? zoomBlur.defaultDuration;
    const ease = config?.ease ?? zoomBlur.defaultEase;
    const tl = gsap.timeline({ defaults: { ease } });

    // 阶段 1：旧页面缩小并模糊
    tl.to(fromElement, {
      opacity: 0,
      scale: 0.92,
      filter: 'blur(4px)',
      transformOrigin: 'center center',
      duration: duration * 0.45,
    });

    // 阶段 2：新页面从放大+模糊状态恢复清晰
    tl.set(
      toElement,
      {
        opacity: 0,
        scale: 1.05,
        filter: 'blur(2px)',
        transformOrigin: 'center center',
      },
      duration * 0.25,
    );

    tl.to(
      toElement,
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: duration * 0.55,
      },
      duration * 0.3,
    );

    return tl;
  },
};

/**
 * 获取 zoom-blur 的离开动画配置
 * @param fromElement 当前页面根元素
 * @param config 动画配置覆盖
 */
export function getZoomBlurLeaveConfig(fromElement: HTMLElement, config?: AnimationConfig): gsap.TweenVars {
  return zoomBlur.leaveVars(fromElement, config);
}

/**
 * 获取 zoom-blur 的进入动画配置
 * @param toElement 目标页面根元素
 * @param config 动画配置覆盖
 */
export function getZoomBlurEnterConfig(toElement: HTMLElement, config?: AnimationConfig): gsap.TweenVars {
  return zoomBlur.enterVars(toElement, config);
}

/* ===================== 预设注册表 ===================== */

/** 所有页面过渡预设映射表 */
export const pageTransitionPresets: Record<PageTransitionPresetId, PageTransitionPreset> = {
  'loom-weave': loomWeave,
  'fade-slide': fadeSlide,
  'zoom-blur': zoomBlur,
};

/** 页面过渡预设 ID 列表 */
export const pageTransitionPresetIds: PageTransitionPresetId[] = Object.keys(
  pageTransitionPresets,
) as PageTransitionPresetId[];

/**
 * 按 ID 获取页面过渡预设
 * @param id 预设 ID
 * @returns 预设定义，不存在时返回 fade-slide
 */
export function getPageTransitionPreset(id: string): PageTransitionPreset {
  return pageTransitionPresets[id as PageTransitionPresetId] ?? fadeSlide;
}

/**
 * 创建页面过渡的完整 GSAP 时间线
 * @param id 预设 ID
 * @param fromElement 当前页面根元素
 * @param toElement 目标页面根元素
 * @param config 动画配置覆盖
 * @returns GSAP Timeline 实例
 */
export function createPageTransition(
  id: string,
  fromElement: HTMLElement,
  toElement: HTMLElement,
  config?: AnimationConfig,
): gsap.core.Timeline {
  const preset = getPageTransitionPreset(id);
  if (preset.createTimeline) {
    return preset.createTimeline(fromElement, toElement, config);
  }
  // 回退：简单组合 leave + enter
  const tl = gsap.timeline();
  tl.to(fromElement, preset.leaveVars(fromElement, config));
  tl.fromTo(toElement, preset.leaveVars(toElement, config), preset.enterVars(toElement, config), '>');
  return tl;
}

/* ===================== React Hook 快捷入口 ===================== */

import { useMemo } from 'react';

/**
 * 根据当前主题推荐的页面过渡 ID 获取预设
 * 与 themes/index.ts 中 ThemeDefinition.animation.pageTransition 联动
 * @param presetId 页面过渡预设 ID
 */
export function usePageTransitionPreset(presetId: PageTransitionPresetId): PageTransitionPreset {
  return useMemo(() => getPageTransitionPreset(presetId), [presetId]);
}

/** 别名导出：兼容 animation/index.ts 的统一命名 */
export { pageTransitionPresets as PAGE_TRANSITION_PRESETS };
