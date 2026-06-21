/**
 * PageTransition.tsx
 * Storyloom 页面过渡包装组件
 *
 * 使用 GSAP 实现视图切换时的平滑过渡动画。当 viewId 变化时，
 * 旧内容先淡出缩小上移，新内容再淡入放大下移，形成连贯的视觉流。
 * 支持三种预设过渡效果：loom-weave、fade-slide、zoom-blur。
 */

import { useRef, useEffect, ReactNode, useState } from 'react';
import gsap from 'gsap';

export type TransitionPreset = 'loom-weave' | 'fade-slide' | 'zoom-blur';

interface PageTransitionProps {
  /** 子内容 */
  children: ReactNode;
  /** 当前视图 ID，变化时触发过渡 */
  viewId: string;
  /** 过渡预设，默认 'loom-weave' */
  preset?: TransitionPreset;
  /** 过渡完成后的回调 */
  onTransitionEnd?: () => void;
}

/**
 * 预设过渡动画配置
 * 每种预设定义了旧内容退出和新内容进入的动画参数
 */
const PRESET_CONFIGS: Record<
  TransitionPreset,
  {
    old: gsap.TweenVars;
    newFrom: gsap.TweenVars;
    newTo: gsap.TweenVars;
    oldDuration: number;
    newDuration: number;
  }
> = {
  'loom-weave': {
    // 旧内容：轻微缩小并上移淡出，模拟织物抽离感
    old: { opacity: 0, scale: 0.98, y: -10, filter: 'blur(4px)' },
    // 新内容：从放大下移状态进入，带有模糊到清晰的过渡
    newFrom: { opacity: 0, scale: 1.02, y: 10, filter: 'blur(4px)' },
    newTo: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    oldDuration: 0.3,
    newDuration: 0.4,
  },
  'fade-slide': {
    // 旧内容：向左滑出并淡出
    old: { opacity: 0, x: -30, ease: 'power2.in' },
    // 新内容：从右侧滑入并淡入
    newFrom: { opacity: 0, x: 30 },
    newTo: { opacity: 1, x: 0, ease: 'power2.out' },
    oldDuration: 0.3,
    newDuration: 0.4,
  },
  'zoom-blur': {
    // 旧内容：缩小并增加模糊度
    old: { opacity: 0, scale: 0.92, filter: 'blur(8px)', ease: 'power2.in' },
    // 新内容：从放大模糊状态恢复到清晰
    newFrom: { opacity: 0, scale: 1.06, filter: 'blur(8px)' },
    newTo: { opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'power2.out' },
    oldDuration: 0.3,
    newDuration: 0.4,
  },
};

export function PageTransition({
  children,
  viewId,
  preset = 'loom-weave',
  onTransitionEnd,
}: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevViewIdRef = useRef<string>(viewId);
  const currentTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 当 viewId 变化时，触发过渡动画
  useEffect(() => {
    if (viewId === prevViewIdRef.current) return;

    const config = PRESET_CONFIGS[preset];

    // 如果有正在进行的动画，先杀死它（确保可中断）
    if (currentTimelineRef.current) {
      currentTimelineRef.current.kill();
    }

    // 获取容器内需要动画的元素
    const container = containerRef.current;
    if (!container) {
      prevViewIdRef.current = viewId;
      setDisplayedChildren(children);
      return;
    }

    setIsTransitioning(true);

    // 创建新的时间线
    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        onTransitionEnd?.();
      },
    });
    currentTimelineRef.current = tl;

    // 使用 fromTo 确保动画可中断且始终有确定的初始状态
    tl.fromTo(
      container,
      { opacity: 1, scale: 1, y: 0, x: 0, filter: 'blur(0px)' },
      { ...config.old, duration: config.oldDuration }
    );

    // 在旧内容淡出后，切换内容并执行新内容进入动画
    tl.call(() => {
      setDisplayedChildren(children);
      prevViewIdRef.current = viewId;
    });

    tl.fromTo(
      container,
      config.newFrom,
      { ...config.newTo, duration: config.newDuration }
    );

    return () => {
      tl.kill();
    };
  }, [viewId, preset, children, onTransitionEnd]);

  // 如果是首次渲染，直接显示内容不播放过渡
  useEffect(() => {
    if (prevViewIdRef.current === viewId && !isTransitioning) {
      setDisplayedChildren(children);
    }
  }, [children, viewId, isTransitioning]);

  return (
    <div
      ref={containerRef}
      className="page-transition-wrapper w-full h-full"
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {displayedChildren}
    </div>
  );
}
