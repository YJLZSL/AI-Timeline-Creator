import { describe, it, expect } from 'vitest';
import {
  TRACK_COLORS,
  TRACK_COLOR_SET,
  DEFAULT_TRACK_COLOR,
  getTimelineConnectionStyle,
  getTreeConnectionColor,
  getNodeColor,
  getForeshadowingStatusColor,
  getForeshadowingStatusVar,
  getThemePreviewGradient,
  THEME_PREVIEW_TOKENS,
} from './colors';

describe('TRACK_COLORS', () => {
  it('应包含 10 个轨道颜色', () => {
    // Assert: 颜色数组长度为 10
    expect(TRACK_COLORS).toHaveLength(10);
  });

  it('TRACK_COLOR_SET 应包含所有 TRACK_COLORS', () => {
    // Assert: 每个 TRACK_COLORS 都在 SET 中
    for (const color of TRACK_COLORS) {
      expect(TRACK_COLOR_SET.has(color)).toBe(true);
    }
  });

  it('DEFAULT_TRACK_COLOR 应为第一个颜色', () => {
    // Assert: 默认颜色等于第一个
    expect(DEFAULT_TRACK_COLOR).toBe(TRACK_COLORS[0]);
  });
});

describe('getTimelineConnectionStyle', () => {
  it('已知类型应返回正确的颜色和 dashArray', () => {
    // Act: 获取 "因果" 样式
    const result = getTimelineConnectionStyle('因果');

    // Assert: 验证颜色和 dashArray
    expect(result.color).toBe('#3b82f6');
    expect(result.dashArray).toBe('none');
  });

  it('英文类型应返回正确样式', () => {
    // Act: 获取英文 "flashback" 样式
    const result = getTimelineConnectionStyle('flashback');

    // Assert: 验证样式
    expect(result.color).toBe('#8b5cf6');
    expect(result.dashArray).toBe('8 4');
  });

  it('未知类型应返回默认灰色样式', () => {
    // Act: 获取未知类型
    const result = getTimelineConnectionStyle('unknown-type');

    // Assert: 返回默认样式
    expect(result.color).toBe('#6b7280');
    expect(result.dashArray).toBe('none');
  });
});

describe('getTreeConnectionColor', () => {
  it('已知类型应返回对应颜色', () => {
    // Act & Assert: 验证已知类型
    expect(getTreeConnectionColor('因果')).toBe('#3B5BDB');
    expect(getTreeConnectionColor('闪回')).toBe('#7c3aed');
  });

  it('未知类型应返回默认灰色', () => {
    // Act: 获取未知类型
    const result = getTreeConnectionColor('unknown');

    // Assert: 返回默认灰色
    expect(result).toBe('#6b7280');
  });
});

describe('getNodeColor', () => {
  it('character 节点应返回蓝色', () => {
    // Act: 获取角色节点颜色
    const result = getNodeColor('character');

    // Assert: 验证颜色
    expect(result).toBe('#3B5BDB');
  });

  it('event 节点应返回绿色', () => {
    // Act: 获取事件节点颜色
    const result = getNodeColor('event');

    // Assert: 验证颜色
    expect(result).toBe('#16A34A');
  });

  it('world-setting 节点应返回橙色', () => {
    // Act: 获取世界观节点颜色
    const result = getNodeColor('world-setting');

    // Assert: 验证颜色
    expect(result).toBe('#EA580C');
  });

  it('未知类型应返回默认灰色', () => {
    // Act: 获取未知类型（通过类型断言）
    const result = getNodeColor('unknown' as 'character');

    // Assert: 返回默认灰色
    expect(result).toBe('#6b7280');
  });
});

describe('getForeshadowingStatusColor', () => {
  it('各状态应返回对应颜色', () => {
    // Act & Assert: 验证各状态颜色
    expect(getForeshadowingStatusColor('planted')).toBe('#eab308');
    expect(getForeshadowingStatusColor('developed')).toBe('#3b82f6');
    expect(getForeshadowingStatusColor('resolved')).toBe('#22c55e');
    expect(getForeshadowingStatusColor('abandoned')).toBe('#9ca3af');
  });

  it('未知状态应返回默认灰色', () => {
    // Act: 获取未知状态颜色
    const result = getForeshadowingStatusColor('unknown');

    // Assert: 返回默认灰色
    expect(result).toBe('#9ca3af');
  });
});

describe('getForeshadowingStatusVar', () => {
  it('各状态应返回对应 CSS 变量', () => {
    // Act & Assert: 验证各状态变量
    expect(getForeshadowingStatusVar('planted')).toBe('--warning');
    expect(getForeshadowingStatusVar('developed')).toBe('--info');
    expect(getForeshadowingStatusVar('resolved')).toBe('--success');
  });

  it('未知状态应返回默认变量', () => {
    // Act: 获取未知状态变量
    const result = getForeshadowingStatusVar('unknown');

    // Assert: 返回默认变量
    expect(result).toBe('--muted-foreground');
  });
});

describe('getThemePreviewGradient', () => {
  it('已知主题应返回包含主题色的渐变字符串', () => {
    // Act: 获取 "luosheng" 主题渐变
    const result = getThemePreviewGradient('luosheng');

    // Assert: 包含背景色和主色
    const tokens = THEME_PREVIEW_TOKENS.luosheng;
    expect(result).toContain(tokens.bg);
    expect(result).toContain(tokens.primary);
    expect(result).toContain('linear-gradient');
  });

  it('未知主题应返回默认 luosheng 主题渐变', () => {
    // Act: 获取未知主题渐变
    const result = getThemePreviewGradient('non-existent');

    // Assert: 返回默认主题渐变
    const tokens = THEME_PREVIEW_TOKENS.luosheng;
    expect(result).toContain(tokens.bg);
    expect(result).toContain(tokens.primary);
  });
});
