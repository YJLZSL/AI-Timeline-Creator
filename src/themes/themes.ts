import type { ThemeDefinition } from '@/animation/types';

// ============================================================
// Storyloom 主题定义
// 每个主题包含颜色、字体、动画、渲染层和材质配置
// ============================================================

export const THEMES: ThemeDefinition[] = [
  {
    id: 'luosheng',
    name: '洛生',
    nameEn: 'Luosheng',
    colors: {
      primary: '#b8860b',
      secondary: '#d4a84b',
      background: '#faf8f3',
      surface: '#ffffff',
      text: '#2a2a2a',
      textMuted: '#6b6b6b',
      accent: '#c9a84c',
      border: '#e8e4dc',
      shadow: 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: 'Noto Serif SC, serif',
      fontSizeScale: 1,
      lineHeight: 1.75,
    },
    animation: {
      themeId: 'luosheng',
      pageTransition: 'fade',
      hoverEffect: 'gentle',
      entranceEffect: 'fade-up',
      scrollEffect: 'parallax',
      svgEffect: 'draw',
    },
    renderLayer: {
      backgroundEffect: 'particles',
      particlePreset: 'luosheng',
    },
    material: {
      glassOpacity: 0.85,
      glassBlur: 12,
      cardRadius: 12,
      cardShadow: '0 4px 24px rgba(0,0,0,0.06)',
      borderWidth: 1,
    },
  },
  {
    id: 'midnight',
    name: '子夜',
    nameEn: 'Midnight',
    colors: {
      primary: '#38bdf8',
      secondary: '#7dd3fc',
      background: '#0a0a0f',
      surface: '#12121a',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      accent: '#38bdf8',
      border: '#1e293b',
      shadow: 'rgba(0,0,0,0.3)',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSizeScale: 1,
      lineHeight: 1.6,
    },
    animation: {
      themeId: 'midnight',
      pageTransition: 'fade',
      hoverEffect: 'glow',
      entranceEffect: 'stagger-cards',
      scrollEffect: 'parallax',
      svgEffect: 'draw',
    },
    renderLayer: {
      backgroundEffect: 'particles',
      particlePreset: 'midnight',
    },
    material: {
      glassOpacity: 0.75,
      glassBlur: 16,
      cardRadius: 10,
      cardShadow: '0 4px 32px rgba(0,0,0,0.2)',
      borderWidth: 1,
    },
  },
  {
    id: 'forest',
    name: '森语',
    nameEn: 'Forest',
    colors: {
      primary: '#4a9455',
      secondary: '#6db57a',
      background: '#f4f7f2',
      surface: '#ffffff',
      text: '#1e3a20',
      textMuted: '#5a7c5c',
      accent: '#6db57a',
      border: '#d4e5d4',
      shadow: 'rgba(0,0,0,0.06)',
    },
    typography: {
      fontFamily: 'Noto Sans SC, sans-serif',
      fontSizeScale: 1,
      lineHeight: 1.7,
    },
    animation: {
      themeId: 'forest',
      pageTransition: 'slide-horizontal',
      hoverEffect: 'gentle',
      entranceEffect: 'fade-up',
      scrollEffect: 'parallax',
      svgEffect: 'draw',
    },
    renderLayer: {
      backgroundEffect: 'particles',
      particlePreset: 'forest',
    },
    material: {
      glassOpacity: 0.8,
      glassBlur: 14,
      cardRadius: 14,
      cardShadow: '0 4px 20px rgba(0,0,0,0.05)',
      borderWidth: 1,
    },
  },
  {
    id: 'ink-wash',
    name: '水墨',
    nameEn: 'Ink Wash',
    colors: {
      primary: '#333333',
      secondary: '#666666',
      background: '#f5f5f0',
      surface: '#ffffff',
      text: '#1a1a1a',
      textMuted: '#7a7a7a',
      accent: '#8c8c8c',
      border: '#d9d9d9',
      shadow: 'rgba(0,0,0,0.05)',
    },
    typography: {
      fontFamily: 'Noto Serif SC, serif',
      fontSizeScale: 1.02,
      lineHeight: 1.85,
    },
    animation: {
      themeId: 'ink-wash',
      pageTransition: 'fade',
      hoverEffect: 'gentle',
      entranceEffect: 'fade-scale',
      scrollEffect: 'parallax',
      svgEffect: 'draw',
    },
    renderLayer: {
      backgroundEffect: 'particles',
      particlePreset: 'ink-wash',
    },
    material: {
      glassOpacity: 0.9,
      glassBlur: 8,
      cardRadius: 4,
      cardShadow: '0 2px 12px rgba(0,0,0,0.04)',
      borderWidth: 1,
    },
  },
  {
    id: 'contrast',
    name: '高对比',
    nameEn: 'High Contrast',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      textMuted: '#444444',
      accent: '#000000',
      border: '#000000',
      shadow: 'rgba(0,0,0,0.1)',
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSizeScale: 1.05,
      lineHeight: 1.6,
    },
    animation: {
      themeId: 'contrast',
      pageTransition: 'fade',
      hoverEffect: 'none',
      entranceEffect: 'fade-up',
      scrollEffect: 'none',
      svgEffect: 'none',
    },
    renderLayer: {
      backgroundEffect: 'none',
    },
    material: {
      glassOpacity: 1,
      glassBlur: 0,
      cardRadius: 0,
      cardShadow: 'none',
      borderWidth: 2,
    },
  },
  {
    id: 'sakura',
    name: '樱华',
    nameEn: 'Sakura',
    colors: {
      primary: '#ffb7c5',
      secondary: '#ffc9d3',
      background: '#fff5f7',
      surface: '#ffffff',
      text: '#4a2a30',
      textMuted: '#8a6a70',
      accent: '#ffb7c5',
      border: '#ffe0e6',
      shadow: 'rgba(255,183,197,0.1)',
    },
    typography: {
      fontFamily: 'Noto Sans SC, sans-serif',
      fontSizeScale: 1,
      lineHeight: 1.7,
    },
    animation: {
      themeId: 'sakura',
      pageTransition: 'scale-fade',
      hoverEffect: 'gentle',
      entranceEffect: 'spring-pop',
      scrollEffect: 'parallax',
      svgEffect: 'draw',
    },
    renderLayer: {
      backgroundEffect: 'particles',
      particlePreset: 'sakura',
    },
    material: {
      glassOpacity: 0.82,
      glassBlur: 14,
      cardRadius: 16,
      cardShadow: '0 4px 24px rgba(255,183,197,0.08)',
      borderWidth: 1,
    },
  },
  {
    id: 'ocean',
    name: '海韵',
    nameEn: 'Ocean',
    colors: {
      primary: '#78c8dc',
      secondary: '#96d8e8',
      background: '#f0f7fa',
      surface: '#ffffff',
      text: '#1a3a45',
      textMuted: '#5a7a85',
      accent: '#78c8dc',
      border: '#cfe8f0',
      shadow: 'rgba(0,0,0,0.06)',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSizeScale: 1,
      lineHeight: 1.65,
    },
    animation: {
      themeId: 'ocean',
      pageTransition: 'slide-vertical',
      hoverEffect: 'glow',
      entranceEffect: 'fade-up',
      scrollEffect: 'parallax',
      svgEffect: 'draw',
    },
    renderLayer: {
      backgroundEffect: 'particles',
      particlePreset: 'ocean',
    },
    material: {
      glassOpacity: 0.78,
      glassBlur: 16,
      cardRadius: 12,
      cardShadow: '0 4px 28px rgba(0,0,0,0.06)',
      borderWidth: 1,
    },
  },
  {
    id: 'aurora',
    name: '极光',
    nameEn: 'Aurora',
    colors: {
      primary: '#64c8b4',
      secondary: '#8ad8c8',
      background: '#0a0f0e',
      surface: '#121a18',
      text: '#e0f0ec',
      textMuted: '#7aa89c',
      accent: '#64c8b4',
      border: '#1a2e28',
      shadow: 'rgba(0,0,0,0.3)',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSizeScale: 1,
      lineHeight: 1.6,
    },
    animation: {
      themeId: 'aurora',
      pageTransition: 'fade',
      hoverEffect: 'glow',
      entranceEffect: 'stagger-cards',
      scrollEffect: 'parallax',
      svgEffect: 'draw',
    },
    renderLayer: {
      backgroundEffect: 'particles',
      particlePreset: 'aurora',
    },
    material: {
      glassOpacity: 0.72,
      glassBlur: 18,
      cardRadius: 10,
      cardShadow: '0 4px 36px rgba(0,0,0,0.2)',
      borderWidth: 1,
    },
  },
];

/** 默认主题 */
export const DEFAULT_THEME = THEMES[0];

export type { ThemeDefinition } from '@/animation/types';

// ============================================================
// 粒子预设配置
// ============================================================

import type { ParticlePresetConfig } from '@/animation/types';

export const PARTICLE_PRESETS: ParticlePresetConfig[] = [
  {
    id: 'luosheng-dust',
    name: '洛生飞絮',
    count: 80,
    color: '#b8860b',
    size: { min: 1, max: 3.5 },
    speed: { min: 0.1, max: 0.4 },
    opacity: { min: 0.1, max: 0.5 },
    blendMode: 'add',
    shape: 'circle',
    movement: 'float',
  },
  {
    id: 'midnight-star',
    name: '子夜星光',
    count: 100,
    color: ['#ffffff', '#38bdf8', '#818cf8'],
    size: { min: 0.5, max: 2 },
    speed: { min: 0.05, max: 0.2 },
    opacity: { min: 0.2, max: 0.8 },
    blendMode: 'add',
    shape: 'circle',
    movement: 'pulse',
  },
  {
    id: 'forest-firefly',
    name: '森林萤火',
    count: 60,
    color: ['#b4e664', '#4a9455', '#6db57a'],
    size: { min: 1.5, max: 4 },
    speed: { min: 0.1, max: 0.5 },
    opacity: { min: 0.2, max: 0.9 },
    blendMode: 'add',
    shape: 'circle',
    movement: 'float',
  },
  {
    id: 'ink-wash-drop',
    name: '水墨墨滴',
    count: 40,
    color: '#1a1a1a',
    size: { min: 2, max: 6 },
    speed: { min: 0.05, max: 0.25 },
    opacity: { min: 0.03, max: 0.08 },
    blendMode: 'normal',
    shape: 'circle',
    movement: 'float',
  },
  {
    id: 'sakura-petal',
    name: '樱花花瓣',
    count: 70,
    color: ['#ffb7c5', '#ffc9d3', '#ff9eb5'],
    size: { min: 2, max: 5 },
    speed: { min: 0.2, max: 0.8 },
    opacity: { min: 0.4, max: 0.9 },
    blendMode: 'normal',
    shape: 'circle',
    movement: 'fall',
  },
  {
    id: 'ocean-bubble',
    name: '深海气泡',
    count: 90,
    color: ['#78c8dc', '#96d8e8', '#b0e8f0'],
    size: { min: 1, max: 4 },
    speed: { min: 0.3, max: 1.0 },
    opacity: { min: 0.1, max: 0.4 },
    blendMode: 'add',
    shape: 'circle',
    movement: 'rise',
  },
  {
    id: 'aurora-ribbon',
    name: '极光光带',
    count: 50,
    color: ['#64c8b4', '#8ad8c8', '#a8e8d8'],
    size: { min: 40, max: 120 },
    speed: { min: 0.05, max: 0.3 },
    opacity: { min: 0.05, max: 0.15 },
    blendMode: 'add',
    shape: 'circle',
    movement: 'swirl',
  },
];

// ============================================================
// 工具函数
// ============================================================

/** 获取当前激活的主题（从 DOM 的 data-theme 属性读取） */
export function getActiveTheme(): ThemeDefinition {
  const themeId = typeof document !== 'undefined'
    ? document.documentElement.dataset.theme || 'luosheng'
    : 'luosheng';
  return THEMES.find((t) => t.id === themeId) || DEFAULT_THEME;
}

/** 根据预设 ID 获取粒子配置 */
export function getParticlePreset(presetId?: string): ParticlePresetConfig {
  if (!presetId) return PARTICLE_PRESETS[0];
  return PARTICLE_PRESETS.find((p) => p.id === presetId) || PARTICLE_PRESETS[0];
}
