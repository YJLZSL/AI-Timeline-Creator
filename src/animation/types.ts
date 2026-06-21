/**
 * Storyloom 动画类型定义
 * 定义所有动画预设、配置和渲染层参数的类型
 */

export type AnimationCategory =
  | 'page-transition'
  | 'scroll'
  | 'hover'
  | 'entrance'
  | 'svg'
  | 'special';

export type AnimationEngine = 'framer-motion' | 'gsap';

export interface AnimationPreset {
  id: string;
  name: string;
  category: AnimationCategory;
  engine: AnimationEngine;
  config: Record<string, unknown>;
  duration: number;
  easing: string;
}

export interface ThemeAnimationConfig {
  themeId: string;
  pageTransition: string;      // AnimationPreset ID
  hoverEffect: string;
  entranceEffect: string;
  scrollEffect: string;
  svgEffect: string;
}

export type BackgroundEffectType = 'none' | 'particles' | 'shader' | 'texture';

export interface RenderLayerConfig {
  backgroundEffect: BackgroundEffectType;
  particlePreset?: string;
  shaderPreset?: string;
  texturePreset?: string;
}

export interface ThemeMaterial {
  glassOpacity: number;
  glassBlur: number;
  cardRadius: number;
  cardShadow: string;
  borderWidth: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSizeScale: number;
  lineHeight: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  shadow: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  nameEn: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  animation: ThemeAnimationConfig;
  renderLayer: RenderLayerConfig;
  material: ThemeMaterial;
}

/** 粒子预设配置 */
export interface ParticlePresetConfig {
  id: string;
  name: string;
  count: number;
  color: string | string[];
  size: { min: number; max: number };
  speed: { min: number; max: number };
  opacity: { min: number; max: number };
  blendMode: 'normal' | 'add' | 'multiply';
  shape: 'circle' | 'square' | 'star';
  movement: 'float' | 'rise' | 'fall' | 'swirl' | 'pulse';
}

/** Shader 预设配置 */
export interface ShaderPresetConfig {
  id: string;
  name: string;
  fragmentShader: string;
  uniforms: Record<string, { type: string; value: unknown }>;
}

/** 纹理预设配置 */
export interface TexturePresetConfig {
  id: string;
  name: string;
  source: 'gradient' | 'noise' | 'pattern' | 'image';
  config: Record<string, unknown>;
  animation: {
    type: 'scroll' | 'rotate' | 'pulse' | 'none';
    speed: number;
  };
}
