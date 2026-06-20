import { useEffect, useRef, useCallback } from 'react';

/* ============================================================
   Storyloom v2 Canvas Particle System
   高性能粒子背景，每个主题一套独立渲染逻辑
   GPU 加速：仅使用 transform / opacity，无布局抖动
   ============================================================ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;      // 0-1
  maxLife: number;   // 帧数
  rotation?: number;  // 花瓣/树叶旋转
  rotationSpeed?: number;
  type?: string;     // 粒子子类型
}

interface ParticleConfig {
  count: number;
  spawnRate: number; // 每帧生成概率 0-1
  mouseRadius: number;
  mouseForce: number;
  connectDistance?: number; // 连线距离阈值
}

/* ---------- 主题配置 ---------- */

const THEME_CONFIGS: Record<string, ParticleConfig> = {
  luosheng: { count: 80, spawnRate: 0.02, mouseRadius: 120, mouseForce: 0.5 },
  midnight: { count: 100, spawnRate: 0.01, mouseRadius: 100, mouseForce: 0.3, connectDistance: 100 },
  forest: { count: 60, spawnRate: 0.015, mouseRadius: 80, mouseForce: 0.4 },
  'ink-wash': { count: 40, spawnRate: 0.01, mouseRadius: 150, mouseForce: 0.2 },
  sakura: { count: 70, spawnRate: 0.02, mouseRadius: 90, mouseForce: 0.4 },
  ocean: { count: 90, spawnRate: 0.025, mouseRadius: 100, mouseForce: 0.5 },
  aurora: { count: 50, spawnRate: 0.01, mouseRadius: 0, mouseForce: 0 },
};

/* ---------- 粒子初始化 ---------- */

function initParticle(theme: string, w: number, h: number): Particle {
  const base: Particle = {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0,
    vy: 0,
    size: 1,
    opacity: 0.5 + Math.random() * 0.5,
    life: 1,
    maxLife: Infinity,
  };

  switch (theme) {
    case 'luosheng':
      return {
        ...base,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      };

    case 'midnight':
      return {
        ...base,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        type: Math.random() > 0.95 ? 'meteor' : 'star',
      };

    case 'forest':
      return {
        ...base,
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.3 + 0.1,
        size: Math.random() * 3 + 1,
        opacity: 0,
        maxLife: 300 + Math.random() * 400,
        type: Math.random() > 0.6 ? 'firefly' : 'leaf',
      };

    case 'ink-wash':
      return {
        ...base,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 4 + 2,
        opacity: 0.03 + Math.random() * 0.04,
        maxLife: 600 + Math.random() * 600,
      };

    case 'sakura':
      return {
        ...base,
        x: Math.random() * w,
        y: -10,
        vx: (Math.random() - 0.5) * 0.8 + 0.2,
        vy: Math.random() * 0.6 + 0.3,
        size: Math.random() * 4 + 2,
        opacity: 0.5 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
      };

    case 'ocean':
      return {
        ...base,
        x: Math.random() * w,
        y: h + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.6 + 0.3),
        size: Math.random() * 3 + 1,
        opacity: 0.1 + Math.random() * 0.3,
        maxLife: 400 + Math.random() * 300,
        type: Math.random() > 0.7 ? 'bubble' : 'light',
      };

    case 'aurora':
      return {
        ...base,
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        vx: Math.random() * 0.3 + 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 80 + 40,
        opacity: 0.05 + Math.random() * 0.08,
        maxLife: Infinity,
      };

    default:
      return base;
  }
}

/* ---------- 更新逻辑 ---------- */

function updateParticle(p: Particle, theme: string, w: number, h: number, mouse: { x: number; y: number } | null): void {
  switch (theme) {
    case 'luosheng': {
      p.x += p.vx;
      p.y += p.vy;
      // 边界环绕
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      // 鼠标排斥
      if (mouse) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
      // 阻力
      p.vx *= 0.99;
      p.vy *= 0.99;
      break;
    }

    case 'midnight': {
      if (p.type === 'meteor') {
        p.x += p.vx * 8;
        p.y += p.vy * 8;
        p.opacity -= 0.02;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        // 闪烁
        p.opacity = 0.2 + Math.abs(Math.sin(Date.now() * 0.001 + p.x)) * 0.6;
        if (mouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 0) {
            p.vx += (dx / dist) * 0.3;
            p.vy += (dy / dist) * 0.3;
          }
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
      }
      // 边界环绕
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      break;
    }

    case 'forest': {
      if (p.type === 'firefly') {
        p.x += Math.sin(Date.now() * 0.001 + p.size) * 0.5;
        p.y += p.vy * 0.5;
        p.opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.003 + p.x * 0.1)) * 0.7;
      } else {
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.3;
        p.y += p.vy;
        p.rotation = (p.rotation || 0) + 0.02;
      }
      p.life -= 1 / p.maxLife;
      if (p.life <= 0) {
        p.y = -10;
        p.x = Math.random() * w;
        p.life = 1;
      }
      break;
    }

    case 'ink-wash': {
      p.x += p.vx;
      p.y += p.vy;
      // 墨滴扩散：鼠标附近产生波纹
      if (mouse) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const wave = Math.sin(dist * 0.05 - Date.now() * 0.003) * 0.3;
          p.vx += (dx / dist) * wave * 0.1;
          p.vy += (dy / dist) * wave * 0.1;
        }
      }
      p.vx *= 0.995;
      p.vy *= 0.995;
      // 边界环绕
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      break;
    }

    case 'sakura': {
      p.x += p.vx + Math.sin(p.y * 0.02 + Date.now() * 0.001) * 0.5;
      p.y += p.vy;
      p.rotation = (p.rotation || 0) + (p.rotationSpeed || 0);
      // 飘落到底部重置
      if (p.y > h + 10) {
        p.y = -10;
        p.x = Math.random() * w;
        p.vx = (Math.random() - 0.5) * 0.8 + 0.2;
      }
      if (p.x > w + 10) p.x = -10;
      if (p.x < -10) p.x = w + 10;
      break;
    }

    case 'ocean': {
      p.x += p.vx + Math.sin(p.y * 0.02) * 0.2;
      p.y += p.vy;
      p.life -= 1 / p.maxLife;
      if (p.life <= 0 || p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
        p.life = 1;
        p.vy = -(Math.random() * 0.6 + 0.3);
      }
      // 鼠标附近产生涡流
      if (mouse) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const angle = Math.atan2(dy, dx) + Math.PI / 4;
          p.vx += Math.cos(angle) * 0.05;
          p.vy += Math.sin(angle) * 0.05;
        }
      }
      break;
    }

    case 'aurora': {
      p.x += p.vx;
      p.y += Math.sin(p.x * 0.005 + Date.now() * 0.0005) * 0.3;
      // 光带缓慢流动
      p.opacity = 0.05 + Math.abs(Math.sin(p.x * 0.01 + Date.now() * 0.0003)) * 0.06;
      if (p.x > w + p.size) {
        p.x = -p.size;
      }
      break;
    }
  }
}

/* ---------- 渲染逻辑 ---------- */

function renderParticle(ctx: CanvasRenderingContext2D, p: Particle, theme: string): void {
  ctx.save();
  ctx.globalAlpha = p.opacity;

  switch (theme) {
    case 'luosheng': {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(184, 134, 11)`;
      ctx.fill();
      // 光晕
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      g.addColorStop(0, 'rgba(184, 134, 11, 0.1)');
      g.addColorStop(1, 'rgba(184, 134, 11, 0)');
      ctx.fillStyle = g;
      ctx.fill();
      break;
    }

    case 'midnight': {
      if (p.type === 'meteor') {
        // 流星尾迹
        const tailLen = 30;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * tailLen, p.y - p.vy * tailLen);
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
        ctx.lineWidth = p.size;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
        // 星光
        if (p.opacity > 0.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity * 0.2})`;
          ctx.fill();
        }
      }
      break;
    }

    case 'forest': {
      if (p.type === 'firefly') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 100, ${p.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 100, ${p.opacity * 0.1})`;
        ctx.fill();
      } else {
        // 树叶形状
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 148, 85, ${p.opacity * 0.6})`;
        ctx.fill();
      }
      break;
    }

    case 'ink-wash': {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
      ctx.fill();
      break;
    }

    case 'sakura': {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      // 花瓣形状
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.6, p.size * 0.6, p.size * 0.6, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.6, -p.size * 0.6, -p.size * 0.6, 0, -p.size);
      ctx.fillStyle = `rgba(255, 183, 197, ${p.opacity * 0.8})`;
      ctx.fill();
      // 花脉
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.3);
      ctx.lineTo(0, p.size * 0.3);
      ctx.strokeStyle = `rgba(255, 150, 170, ${p.opacity * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;
    }

    case 'ocean': {
      if (p.type === 'bubble') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(120, 200, 220, ${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // 高光
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
        ctx.fill();
      } else {
        // 光线折射
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.sin(p.y * 0.05) * 30, p.y - 80);
        ctx.strokeStyle = `rgba(150, 220, 230, ${p.opacity * 0.3})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();
      }
      break;
    }

    case 'aurora': {
      // 光带效果
      const gradient = ctx.createLinearGradient(p.x - p.size, p.y, p.x + p.size, p.y);
      gradient.addColorStop(0, `rgba(100, 200, 150, 0)`);
      gradient.addColorStop(0.3, `rgba(100, 200, 180, ${p.opacity})`);
      gradient.addColorStop(0.5, `rgba(180, 120, 220, ${p.opacity * 1.2})`);
      gradient.addColorStop(0.7, `rgba(100, 200, 180, ${p.opacity})`);
      gradient.addColorStop(1, `rgba(100, 200, 150, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(p.x - p.size, p.y - p.size * 0.3, p.size * 2, p.size * 0.6);
      break;
    }
  }

  ctx.restore();
}

/* ---------- 连线逻辑（midnight 星座） ---------- */

function drawConnections(ctx: CanvasRenderingContext2D, particles: Particle[], maxDist: number): void {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 * (1 - dist / maxDist)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

/* ============================================================
   React Component
   ============================================================ */

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const themeRef = useRef<string>('luosheng');

  /* 监听主题变化 */
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          const newTheme = document.documentElement.dataset.theme || 'luosheng';
          if (newTheme !== themeRef.current) {
            themeRef.current = newTheme;
            // 重置粒子
            particlesRef.current = [];
          }
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  /* 鼠标追踪 */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  /* Canvas 渲染循环 */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const loop = () => {
      const theme = themeRef.current;
      const cfg = THEME_CONFIGS[theme] || THEME_CONFIGS.luosheng;
      const width = w();
      const height = h();

      ctx.clearRect(0, 0, width, height);

      let particles = particlesRef.current;

      // 补充粒子到目标数量
      while (particles.length < cfg.count) {
        particles.push(initParticle(theme, width, height));
      }

      // 更新
      for (const p of particles) {
        updateParticle(p, theme, width, height, mouseRef.current);
      }

      // 移除死亡粒子（非无限生命且 life <= 0）
      particles = particles.filter((p) => {
        if (p.maxLife === Infinity) return true;
        if (p.life <= 0) {
          // 复活概率
          if (Math.random() < cfg.spawnRate) {
            Object.assign(p, initParticle(theme, width, height));
            return true;
          }
          return false;
        }
        return true;
      });
      particlesRef.current = particles;

      // 绘制连线（midnight）
      if (theme === 'midnight' && cfg.connectDistance) {
        drawConnections(ctx, particles, cfg.connectDistance);
      }

      // 绘制粒子
      for (const p of particles) {
        renderParticle(ctx, p, theme);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.7,
      }}
      aria-hidden="true"
    />
  );
}
