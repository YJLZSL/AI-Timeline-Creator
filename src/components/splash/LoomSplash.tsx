/**
 * LoomSplash.tsx
 * Storyloom 织机启动动画组件
 *
 * 使用 GSAP Timeline 实现织机启动动画序列，模拟织布机从绘制框架到
 * 经纬线交织、最终呈现品牌文案的完整过程。动画结束后触发 onComplete 回调。
 */

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useThemeStore } from '@/stores/useThemeStore';

interface LoomSplashProps {
  /** 控制遮罩是否显示；为 false 时快速淡出 */
  visible?: boolean;
  /** 动画全部结束后触发的回调（自然完成或被提前关闭时都会触发） */
  onComplete?: () => void;
}

/** 主题 ID 到主色调的映射，用于动画背景渐变 */
const themeColorMap: Record<string, string> = {
  luosheng: '#b8860b',
  midnight: '#38bdf8',
  forest: '#4a9455',
  'ink-wash': '#333333',
  contrast: '#ffffff',
  sakura: '#ffb7c5',
  ocean: '#78c8dc',
  aurora: '#64c8b4',
  system: '#b8860b',
};

/**
 * 织机启动动画组件
 *
 * 动画序列（总时长约 3000ms）：
 * 1. 0ms   - 背景从黑色渐变到当前主题色（800ms）
 * 2. 200ms - 织机 SVG 框架线条从中心向两侧绘制（1200ms，模拟 DrawSVG）
 * 3. 800ms - 经线（竖线）从上方落下，带弹性回弹（600ms）
 * 4. 1200ms- 纬线（横线）从左侧滑入，与经线交织（600ms）
 * 5. 1800ms- 交织点（小圆点）逐个亮起（400ms，stagger 0.05）
 * 6. 2000ms- 品牌文案"把时间织成故事"逐字出现（600ms）
 * 7. 2500ms- 整个画面淡出，触发 onComplete（500ms）
 */
export function LoomSplash({ visible = true, onComplete }: LoomSplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<SVGSVGElement>(null);
  const warpRef = useRef<SVGGElement>(null); // 经线组
  const weftRef = useRef<SVGGElement>(null); // 纬线组
  const knotsRef = useRef<SVGGElement>(null); // 交织点组
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const theme = useThemeStore((s) => s.theme);
  const themeColor = themeColorMap[theme] ?? themeColorMap.luosheng;

  useGSAP(
    () => {
      if (!visible || !containerRef.current) return;

      const tl = gsap.timeline({
        onComplete: () => {
          // 动画结束后触发回调，并将容器隐藏
          gsap.set(containerRef.current, { visibility: 'hidden' });
          onComplete?.();
        },
      });

      // 1. 背景从黑色渐变到主题色（0ms 开始，持续 800ms）
      tl.fromTo(
        overlayRef.current,
        { backgroundColor: '#000000' },
        { backgroundColor: themeColor, duration: 0.8, ease: 'power2.inOut' },
        0
      );

      // 2. 织机 SVG 框架线条绘制（200ms 开始，持续 1200ms）
      // 使用 stroke-dasharray / stroke-dashoffset 模拟 DrawSVG 效果
      const framePaths = frameRef.current?.querySelectorAll('path, line, polyline, rect');
      if (framePaths && framePaths.length > 0) {
        framePaths.forEach((path) => {
          const length = (path as SVGGeometryElement).getTotalLength?.() || 200;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            stroke: '#ffffff',
            strokeWidth: 2,
            fill: 'none',
          });
        });

        tl.to(
          framePaths,
          {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut',
            stagger: { from: 'center', amount: 0.3 },
          },
          0.2
        );
      }

      // 3. 经线（竖线）从上方落下，带弹性回弹（800ms 开始，持续 600ms）
      const warpLines = warpRef.current?.querySelectorAll('line');
      if (warpLines && warpLines.length > 0) {
        gsap.set(warpLines, {
          attr: { y1: -100, y2: -100 },
          opacity: 0.8,
          stroke: '#ffffff',
          strokeWidth: 1.5,
        });

        tl.to(
          warpLines,
          {
            attr: { y1: 20, y2: 180 },
            opacity: 1,
            duration: 0.6,
            ease: 'elastic.out(1, 0.6)',
            stagger: 0.04,
          },
          0.8
        );
      }

      // 4. 纬线（横线）从左侧滑入，与经线交织（1200ms 开始，持续 600ms）
      const weftLines = weftRef.current?.querySelectorAll('line');
      if (weftLines && weftLines.length > 0) {
        gsap.set(weftLines, {
          attr: { x1: -100, x2: -100 },
          opacity: 0.8,
          stroke: '#ffffff',
          strokeWidth: 1.5,
        });

        tl.to(
          weftLines,
          {
            attr: { x1: 20, x2: 180 },
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.05,
          },
          1.2
        );
      }

      // 5. 交织点（小圆点）逐个亮起（1800ms 开始，持续 400ms，stagger 0.05）
      const knots = knotsRef.current?.querySelectorAll('circle');
      if (knots && knots.length > 0) {
        gsap.set(knots, {
          scale: 0,
          opacity: 0,
          fill: '#ffffff',
          transformOrigin: 'center',
        });

        tl.to(
          knots,
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'back.out(2)',
            stagger: 0.05,
          },
          1.8
        );
      }

      // 6. 品牌文案"把时间织成故事"逐字出现（2000ms 开始，持续 600ms）
      // 使用 SplitText 模拟：将每个字包裹为 span 后逐字动画
      if (textRef.current) {
        const text = textRef.current.textContent || '把时间织成故事';
        textRef.current.innerHTML = '';
        const chars = text.split('').map((char) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          span.style.transform = 'translateY(20px)';
          return span;
        });
        chars.forEach((span) => textRef.current!.appendChild(span));

        tl.to(
          chars,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.06,
          },
          2.0
        );
      }

      // 7. 整个画面淡出，触发 onComplete（2500ms 开始，持续 500ms）
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        },
        2.5
      );
    },
    { scope: containerRef, dependencies: [visible, themeColor, onComplete] }
  );

  // 当外部要求关闭（visible=false）且动画尚未自然结束时，快速淡出容器
  useEffect(() => {
    if (!visible && containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(containerRef.current, { visibility: 'hidden' });
          onComplete?.();
        },
      });
    }
  }, [visible, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ visibility: 'visible' }}
    >
      {/* 背景层：从黑色渐变到主题色 */}
      <div ref={overlayRef} className="absolute inset-0 bg-black" />

      {/* 织机 SVG 动画层 */}
      <svg
        ref={frameRef}
        viewBox="0 0 200 200"
        className="relative z-10 w-48 h-48 md:w-64 md:h-64"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 织机框架 - 外框 */}
        <rect
          x="15"
          y="15"
          width="170"
          height="170"
          rx="4"
          strokeLinecap="round"
        />
        {/* 织机框架 - 内部横梁 */}
        <line x1="15" y1="50" x2="185" y2="50" strokeLinecap="round" />
        <line x1="15" y1="150" x2="185" y2="150" strokeLinecap="round" />
        {/* 织机框架 - 两侧支架 */}
        <line x1="50" y1="15" x2="50" y2="185" strokeLinecap="round" />
        <line x1="150" y1="15" x2="150" y2="185" strokeLinecap="round" />

        {/* 经线（竖线）- 从上方落下 */}
        <g ref={warpRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`warp-${i}`}
              x1={40 + i * 16}
              y1="20"
              x2={40 + i * 16}
              y2="180"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* 纬线（横线）- 从左侧滑入 */}
        <g ref={weftRef}>
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`weft-${i}`}
              x1="20"
              y1={45 + i * 22}
              x2="180"
              y2={45 + i * 22}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* 交织点（小圆点）- 经纬交汇处的装饰点 */}
        <g ref={knotsRef}>
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 5 }).map((_, col) => (
              <circle
                key={`knot-${row}-${col}`}
                cx={48 + col * 24}
                cy={56 + row * 22}
                r="3"
              />
            ))
          )}
        </g>
      </svg>

      {/* 品牌文案 */}
      <div
        ref={textRef}
        className="relative z-10 mt-8 text-2xl md:text-4xl font-light tracking-widest text-white"
        style={{ fontFamily: 'inherit' }}
      >
        把时间织成故事
      </div>
    </div>
  );
}
