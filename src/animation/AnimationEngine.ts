import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { TextPlugin } from 'gsap/TextPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { EasePack } from 'gsap/EasePack';
import { useEffect } from 'react';
import { useGSAP } from '@gsap/react';

/**
 * Storyloom 动画引擎 — 统一封装 GSAP 动画系统
 *
 * 设计理念：
 * 1. 双引擎策略：Framer Motion 负责 DOM 组件级动画，GSAP 负责复杂时间线、滚动、SVG
 * 2. 主题感知：所有动画自动读取当前主题，调整颜色/速度/强度
 * 3. 性能优先：自动管理 ScrollTrigger 清理、动画暂停/恢复
 */

// 注册 GSAP 插件（Tree Shaking 友好，按需加载）
gsap.registerPlugin(
  ScrollTrigger,
  DrawSVGPlugin,
  SplitText,
  TextPlugin,
  Physics2DPlugin,
  EasePack,
  useGSAP,
);

// 导出核心对象，供外部直接使用
export { gsap, ScrollTrigger, useGSAP };

export type EasingName =
  | 'power1.out'
  | 'power2.out'
  | 'power2.inOut'
  | 'power3.out'
  | 'power4.out'
  | 'back.out'
  | 'elastic.out'
  | 'bounce.out'
  | 'circ.out'
  | 'expo.out'
  | 'sine.out'
  | 'none';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  ease?: EasingName;
  stagger?: number;
  [key: string]: unknown;
}

export interface TimelineConfig {
  paused?: boolean;
  repeat?: number;
  yoyo?: boolean;
  defaults?: AnimationConfig;
  scrollTrigger?: ScrollTrigger.Vars;
}

/** 创建受管理的 GSAP 时间线 */
export function createTimeline(config?: TimelineConfig): gsap.core.Timeline {
  return gsap.timeline({
    paused: config?.paused ?? false,
    repeat: config?.repeat ?? 0,
    yoyo: config?.yoyo ?? false,
    defaults: {
      duration: 0.6,
      ease: 'power2.out',
      ...config?.defaults,
    },
    scrollTrigger: config?.scrollTrigger,
  });
}

/** 暂停/恢复所有动画（用于节能模式） */
export function pauseAll(): void {
  gsap.globalTimeline.pause();
}

export function resumeAll(): void {
  gsap.globalTimeline.resume();
}

/** 清理所有 ScrollTrigger 实例 */
export function killAllScrollTriggers(): void {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}

/** 创建逐字文本动画 */
export function animateTextByChars(
  element: HTMLElement | string,
  text: string,
  config?: AnimationConfig,
): gsap.core.Timeline {
  const tl = createTimeline();
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return tl;

  const split = new SplitText(el, { type: 'chars' });
  tl.set(el, { text })
    .from(split.chars, {
      opacity: 0,
      y: 20,
      duration: config?.duration ?? 0.05,
      stagger: config?.stagger ?? 0.03,
      ease: config?.ease ?? 'power2.out',
    });

  return tl;
}

/** 创建 SVG 描边动画 */
export function animateSVGDraw(
  element: SVGElement | string,
  config?: AnimationConfig,
): gsap.core.Tween {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return gsap.set({}, {});

  return gsap.fromTo(
    el,
    { drawSVG: '0%' },
    {
      drawSVG: '100%',
      duration: config?.duration ?? 1.2,
      ease: config?.ease ?? 'power2.inOut',
      delay: config?.delay ?? 0,
    },
  );
}

/** 创建滚动视差效果 */
export function createParallax(
  element: HTMLElement | string,
  speed: number = 0.5,
): ScrollTrigger {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) throw new Error('Parallax target not found');

  return ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      gsap.set(el, { y: self.progress * 100 * speed });
    },
  });
}

/** 批量入场动画 — 卡片/列表项 */
export function animateStaggerEntrance(
  elements: string | Element[] | NodeListOf<Element>,
  config?: AnimationConfig,
): gsap.core.Timeline {
  const targets = typeof elements === 'string' ? document.querySelectorAll(elements) : elements;
  const tl = createTimeline();

  tl.from(targets, {
    opacity: 0,
    y: 24,
    scale: 0.98,
    duration: config?.duration ?? 0.5,
    stagger: config?.stagger ?? 0.08,
    ease: config?.ease ?? 'power2.out',
    delay: config?.delay ?? 0,
  });

  return tl;
}

/** React Hook：在组件卸载时自动清理所有 GSAP 动画 */
export function useAnimationCleanup(): void {
  useEffect(() => {
    return () => {
      // 组件卸载时清理该组件内的所有 ScrollTrigger
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);
}

/** React Hook：主题切换时的动画过渡 */
export function useThemeTransition(
  onTransitionStart?: () => void,
  onTransitionEnd?: () => void,
): (callback: () => void) => void {
  return (callback) => {
    onTransitionStart?.();

    const tl = createTimeline({
      defaults: { duration: 0.3, ease: 'power2.inOut' },
    });

    // 淡出旧主题
    tl.to(document.body, { opacity: 0.95, duration: 0.15 })
      .call(() => {
        callback();
      })
      // 淡入新主题
      .to(document.body, { opacity: 1, duration: 0.2 })
      .call(() => {
        onTransitionEnd?.();
      });
  };
}

/** 预定义缓动曲线 */
export const EASINGS = {
  smooth: 'power2.out' as EasingName,
  bounce: 'back.out(1.7)' as EasingName,
  elastic: 'elastic.out(1, 0.5)' as EasingName,
  dramatic: 'power4.inOut' as EasingName,
  gentle: 'sine.out' as EasingName,
  quick: 'power1.out' as EasingName,
};
