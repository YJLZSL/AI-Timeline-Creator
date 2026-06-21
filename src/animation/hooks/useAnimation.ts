/**
 * useAnimation.ts
 * Storyloom 动画 Hook 封装
 *
 * 提供三个常用的 GSAP 动画 Hook：
 * 1. useStaggerEntrance — 对容器内子元素应用 stagger 入场动画
 * 2. useScrollReveal — 使用 ScrollTrigger 实现滚动 reveal 效果
 * 3. useTextAnimation — 文字逐字/逐词动画
 */

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/** Stagger 入场动画选项 */
export interface StaggerEntranceOptions {
  /** 单元素动画持续时间（秒），默认 0.5 */
  duration?: number;
  /** 元素间错开时间（秒），默认 0.08 */
  stagger?: number;
  /** 初始 Y 轴偏移（像素），默认 24 */
  y?: number;
  /** 初始 X 轴偏移（像素），默认 0 */
  x?: number;
  /** 初始缩放，默认 0.98 */
  scale?: number;
  /** 缓动函数，默认 'power2.out' */
  ease?: string;
  /** 延迟启动时间（秒），默认 0 */
  delay?: number;
  /** 子元素选择器，默认直接选择子元素 */
  childSelector?: string;
  /** 动画触发条件：是否只播放一次，默认 true */
  once?: boolean;
}

/** 滚动 reveal 选项 */
export interface ScrollRevealOptions {
  /** 触发元素相对于视口的开始位置，默认 'top 85%' */
  start?: string;
  /** 动画持续时间（秒），默认 0.6 */
  duration?: number;
  /** 初始 Y 轴偏移（像素），默认 30 */
  y?: number;
  /** 初始 X 轴偏移（像素），默认 0 */
  x?: number;
  /** 初始缩放，默认 1 */
  scale?: number;
  /** 缓动函数，默认 'power2.out' */
  ease?: string;
  /** 是否只触发一次，默认 true */
  once?: boolean;
  /** 自定义 scrub 值，默认 false */
  scrub?: boolean | number;
  /** 额外 ScrollTrigger 配置 */
  scrollTriggerOptions?: ScrollTrigger.Vars;
}

/** 文字动画选项 */
export interface TextAnimationOptions {
  /** 动画类型：'chars' 逐字 / 'words' 逐词 / 'lines' 逐行，默认 'chars' */
  type?: 'chars' | 'words' | 'lines';
  /** 单元素动画持续时间（秒），默认 0.05 */
  duration?: number;
  /** 元素间错开时间（秒），默认 0.03 */
  stagger?: number;
  /** 初始 Y 轴偏移（像素），默认 20 */
  y?: number;
  /** 初始 X 轴偏移（像素），默认 0 */
  x?: number;
  /** 初始透明度，默认 0 */
  opacity?: number;
  /** 缓动函数，默认 'power2.out' */
  ease?: string;
  /** 延迟启动时间（秒），默认 0 */
  delay?: number;
  /** 是否自动播放，默认 true */
  autoPlay?: boolean;
}

/**
 * 对容器内子元素应用 stagger 入场动画
 *
 * @param ref 目标容器 ref
 * @param options 动画选项
 *
 * 示例：
 * const containerRef = useRef<HTMLDivElement>(null);
 * useStaggerEntrance(containerRef, { duration: 0.6, stagger: 0.1 });
 */
export function useStaggerEntrance(
  ref: React.RefObject<HTMLElement | null>,
  options: StaggerEntranceOptions = {}
): void {
  const {
    duration = 0.5,
    stagger = 0.08,
    y = 24,
    x = 0,
    scale = 0.98,
    ease = 'power2.out',
    delay = 0,
    childSelector = '> *',
    once = true,
  } = options;

  useGSAP(
    () => {
      if (!ref.current) return;

      const targets = ref.current.querySelectorAll(childSelector);
      if (targets.length === 0) return;

      gsap.from(targets, {
        opacity: 0,
        y,
        x,
        scale,
        duration,
        stagger,
        ease,
        delay,
        scrollTrigger: once
          ? {
              trigger: ref.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          : undefined,
      });
    },
    { scope: ref, dependencies: [options] }
  );
}

/**
 * 使用 ScrollTrigger 实现滚动 reveal 效果
 *
 * @param ref 目标元素 ref
 * @param options 动画选项
 *
 * 示例：
 * const sectionRef = useRef<HTMLElement>(null);
 * useScrollReveal(sectionRef, { start: 'top 80%', duration: 0.8 });
 */
export function useScrollReveal(
  ref: React.RefObject<HTMLElement | null>,
  options: ScrollRevealOptions = {}
): void {
  const {
    start = 'top 85%',
    duration = 0.6,
    y = 30,
    x = 0,
    scale = 1,
    ease = 'power2.out',
    once = true,
    scrub = false,
    scrollTriggerOptions = {},
  } = options;

  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    // 设置初始状态
    gsap.set(el, { opacity: 0, y, x, scale });

    // 创建动画
    const animation = gsap.to(el, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      ease,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        scrub,
        ...scrollTriggerOptions,
      },
    });

    triggerRef.current = animation.scrollTrigger as ScrollTrigger;

    return () => {
      animation.kill();
      if (triggerRef.current) {
        triggerRef.current.kill();
      }
    };
  }, [ref, duration, y, x, scale, ease, start, once, scrub, scrollTriggerOptions]);
}

/**
 * 文字逐字/逐词/逐行动画
 *
 * @param ref 目标文本容器 ref（必须为 HTMLElement）
 * @param options 动画选项
 * @returns 控制对象 { play, reverse, kill }，当 autoPlay 为 false 时手动调用 play
 *
 * 示例：
 * const textRef = useRef<HTMLDivElement>(null);
 * useTextAnimation(textRef, { type: 'chars', duration: 0.05, stagger: 0.03 });
 */
export function useTextAnimation(
  ref: React.RefObject<HTMLElement | null>,
  options: TextAnimationOptions = {}
): {
  play: () => void;
  reverse: () => void;
  kill: () => void;
} {
  const {
    type = 'chars',
    duration = 0.05,
    stagger = 0.03,
    y = 20,
    x = 0,
    opacity = 0,
    ease = 'power2.out',
    delay = 0,
    autoPlay = true,
  } = options;

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const createTimeline = useCallback(() => {
    if (!ref.current) return null;

    const el = ref.current;
    const text = el.textContent || '';

    // 清空并重建文本结构
    el.innerHTML = '';

    let unitElements: HTMLSpanElement[] = [];

    if (type === 'chars') {
      // 逐字拆分
      unitElements = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.whiteSpace = 'pre';
        return span;
      });
    } else if (type === 'words') {
      // 逐词拆分
      unitElements = text.split(/\s+/).map((word) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.marginRight = '0.3em';
        return span;
      });
    } else if (type === 'lines') {
      // 逐行拆分（按现有换行符分割）
      const lines = text.split('\n');
      unitElements = lines.map((line) => {
        const span = document.createElement('span');
        span.textContent = line;
        span.style.display = 'block';
        return span;
      });
    }

    unitElements.forEach((span) => el.appendChild(span));

    // 创建 GSAP 时间线
    const tl = gsap.timeline({ paused: !autoPlay });

    tl.from(unitElements, {
      opacity,
      y,
      x,
      duration,
      stagger,
      ease,
      delay,
    });

    return tl;
  }, [ref, type, duration, stagger, y, x, opacity, ease, delay, autoPlay]);

  useEffect(() => {
    const tl = createTimeline();
    if (tl) {
      timelineRef.current = tl;
    }

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, [createTimeline]);

  const play = useCallback(() => {
    timelineRef.current?.play();
  }, []);

  const reverse = useCallback(() => {
    timelineRef.current?.reverse();
  }, []);

  const kill = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);

  return { play, reverse, kill };
}
