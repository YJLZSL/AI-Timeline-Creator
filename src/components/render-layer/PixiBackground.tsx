/**
 * Storyloom PixiJS 背景渲染层
 * PixiJS v8 背景渲染层（可选，渐进增强）
 * 使用原生 PixiJS API（无 @pixi/react，手动挂载 canvas）
 * 仅在非 Tauri 环境或显式启用时渲染，桌面端优先使用 CSS 背景以节省资源
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Application, Container, Graphics, Ticker } from 'pixi.js';
import { getActiveTheme, getParticlePreset } from '@/themes';
import type { ParticlePresetConfig } from '@/animation/types';

/** 背景渲染层属性 */
interface PixiBackgroundProps {
  /** 是否强制启用（覆盖 Tauri 检测） */
  forceEnabled?: boolean;
  /** 自定义粒子预设 ID（覆盖主题默认） */
  particlePresetId?: string;
  /** 画布额外 CSS 类名 */
  className?: string;
  /** 背景层透明度 */
  opacity?: number;
}

/**
 * 检测是否在 Tauri 环境中运行
 * 桌面端优先使用 CSS 主题纹理，避免 GPU 资源占用
 */
function isTauriEnv(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ !== 'undefined';
}

/**
 * 创建粒子图形
 * @param app Pixi Application 实例
 * @param preset 粒子预设配置
 * @returns 粒子容器和更新函数
 */
function createParticles(
  app: Application,
  preset: ParticlePresetConfig,
): { container: Container; cleanup: () => void } {
  const container = new Container();
  const particles: {
    graphics: Graphics;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: number;
    phase: number;
  }[] = [];

  const width = app.screen.width;
  const height = app.screen.height;
  const colors = Array.isArray(preset.color) ? preset.color : [preset.color];

  // 将十六进制颜色字符串转为数字
  const parseColor = (hex: string): number => {
    const clean = hex.replace('#', '');
    return parseInt(clean, 16);
  };

  // 初始化粒子
  for (let i = 0; i < preset.count; i++) {
    const size = Math.random() * (preset.size.max - preset.size.min) + preset.size.min;
    const opacity = Math.random() * (preset.opacity.max - preset.opacity.min) + preset.opacity.min;
    const speed = Math.random() * (preset.speed.max - preset.speed.min) + preset.speed.min;
    const angle = Math.random() * Math.PI * 2;

    const graphics = new Graphics();
    const color = parseColor(colors[Math.floor(Math.random() * colors.length)]);
    graphics.circle(0, 0, size);
    graphics.fill({ color, alpha: opacity });

    const particle = {
      graphics,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      opacity,
      color,
      phase: Math.random() * Math.PI * 2,
    };

    particles.push(particle);
    container.addChild(graphics);
  }

  // 根据运动模式更新粒子位置
  const tickerCallback = (ticker: Ticker): void => {
    const delta = ticker.deltaTime;
    const w = app.screen.width;
    const h = app.screen.height;
    const time = ticker.lastTime / 1000;

    particles.forEach((p) => {
      switch (preset.movement) {
        case 'float': {
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          // 边界环绕
          if (p.x < -p.size) p.x = w + p.size;
          if (p.x > w + p.size) p.x = -p.size;
          if (p.y < -p.size) p.y = h + p.size;
          if (p.y > h + p.size) p.y = -p.size;
          break;
        }
        case 'rise': {
          p.y -= p.vy * delta;
          p.x += Math.sin(time + p.phase) * 0.3 * delta;
          if (p.y < -p.size) {
            p.y = h + p.size;
            p.x = Math.random() * w;
          }
          break;
        }
        case 'fall': {
          p.y += p.vy * delta;
          p.x += Math.sin(time + p.phase) * 0.3 * delta;
          if (p.y > h + p.size) {
            p.y = -p.size;
            p.x = Math.random() * w;
          }
          break;
        }
        case 'swirl': {
          const cx = w / 2;
          const cy = h / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
          const angle = Math.atan2(dy, dx) + (p.vx * delta) / dist;
          const radialSpeed = p.vy * delta * 0.1;
          p.x = cx + Math.cos(angle) * (dist + radialSpeed);
          p.y = cy + Math.sin(angle) * (dist + radialSpeed);
          break;
        }
        case 'pulse': {
          const scale = 1 + Math.sin(time * 2 + p.phase) * 0.2;
          p.graphics.scale.set(scale);
          p.x += p.vx * delta * 0.3;
          p.y += p.vy * delta * 0.3;
          if (p.x < -p.size) p.x = w + p.size;
          if (p.x > w + p.size) p.x = -p.size;
          if (p.y < -p.size) p.y = h + p.size;
          if (p.y > h + p.size) p.y = -p.size;
          break;
        }
        default:
          break;
      }

      p.graphics.position.set(p.x, p.y);
    });
  };

  app.ticker.add(tickerCallback);

  const cleanup = (): void => {
    app.ticker.remove(tickerCallback);
    particles.forEach((p) => {
      p.graphics.destroy();
    });
    particles.length = 0;
    container.destroy({ children: true });
  };

  return { container, cleanup };
}

/**
 * PixiJS 背景渲染层组件
 * 特性：
 * - 渐进增强：Tauri 桌面环境下默认不渲染，降低 GPU 占用
 * - 主题感知：自动读取当前主题配置渲染对应粒子效果
 * - 响应式：窗口 resize 时自动重新初始化
 * - 安全降级：PixiJS 初始化失败时静默回退到 CSS 背景
 */
export const PixiBackground: React.FC<PixiBackgroundProps> = ({
  forceEnabled = false,
  particlePresetId,
  className = '',
  opacity = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [hasError, setHasError] = useState(false);

  /**
   * 初始化 Pixi Application 和粒子系统
   */
  const initPixi = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    // 如果已存在，先销毁
    if (appRef.current) {
      cleanupRef.current?.();
      appRef.current.destroy(true, { children: true, texture: true });
      appRef.current = null;
      cleanupRef.current = null;
    }

    try {
      const app = new Application();
      await app.init({
        resizeTo: container,
        backgroundAlpha: 0, // 完全透明，让 CSS 背景透出
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2), // 限制分辨率，避免高 DPI 性能问题
        autoDensity: true,
      });

      appRef.current = app;
      container.appendChild(app.canvas);

      // 读取当前主题配置
      const theme = getActiveTheme();
      const preset = getParticlePreset(particlePresetId ?? theme.renderLayer.particlePreset ?? 'luosheng-dust');

      // 如果粒子数量为 0（如高对比主题），不创建粒子系统
      if (preset.count > 0) {
        const { container: particleContainer, cleanup } = createParticles(app, preset);
        app.stage.addChild(particleContainer);
        cleanupRef.current = cleanup;
      }

      setHasError(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[PixiBackground] PixiJS 初始化失败，已降级到 CSS 背景:', err);
      setHasError(true);
    }
  }, [particlePresetId]);

  /**
   * 监听窗口 resize 和主题变化，重新初始化
   */
  useEffect(() => {
    // Tauri 环境下默认不启用，除非强制开启
    if (!forceEnabled && isTauriEnv()) {
      return;
    }

    initPixi();

    // 监听主题变化（通过 MutationObserver 检测 data-theme 属性变化）
    const observer = new MutationObserver(() => {
      initPixi();
    });

    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }

    // 监听窗口 resize（Pixi 的 resizeTo 会自动处理 canvas 尺寸，但粒子系统需要重新初始化以适应新边界）
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = (): void => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initPixi();
      }, 300);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cleanupRef.current?.();
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, [initPixi, forceEnabled]);

  // Tauri 环境下默认不渲染
  if (!forceEnabled && isTauriEnv()) {
    return null;
  }

  // 发生错误时静默回退（不渲染 canvas，让 CSS 背景生效）
  if (hasError) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`pixi-background-layer ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // 确保不拦截鼠标事件
        zIndex: 0, // 位于内容层之下
        opacity,
        transition: 'opacity 0.5s ease',
      }}
      aria-hidden="true"
    />
  );
};

export default PixiBackground;
