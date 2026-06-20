import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isMac, getModKeyName, isModKeyPressed, formatKeysForDisplay } from './platform';

describe('isMac', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('navigator 为 undefined 时应返回 false（非浏览器环境）', () => {
    // Arrange: 移除 navigator
    vi.stubGlobal('navigator', undefined);

    // Act: 检测平台
    const result = isMac();

    // Assert: 返回 false
    expect(result).toBe(false);
  });

  it('Mac 平台应返回 true', () => {
    // Arrange: 模拟 Mac 平台
    vi.stubGlobal('navigator', {
      platform: 'MacIntel',
      userAgent: 'Mozilla/5.0 (Macintosh)',
    });

    // Act: 检测平台
    const result = isMac();

    // Assert: 返回 true
    expect(result).toBe(true);
  });

  it('iOS 设备应返回 true', () => {
    // Arrange: 模拟 iPhone
    vi.stubGlobal('navigator', {
      platform: 'iPhone',
      userAgent: 'Mozilla/5.0 (iPhone)',
    });

    // Act: 检测平台
    const result = isMac();

    // Assert: 返回 true
    expect(result).toBe(true);
  });

  it('Windows 平台应返回 false', () => {
    // Arrange: 模拟 Windows 平台
    vi.stubGlobal('navigator', {
      platform: 'Win32',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    });

    // Act: 检测平台
    const result = isMac();

    // Assert: 返回 false
    expect(result).toBe(false);
  });

  it('userAgent 包含 Macintosh 时应返回 true', () => {
    // Arrange: userAgent 包含 Macintosh
    vi.stubGlobal('navigator', {
      platform: '',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    });

    // Act: 检测平台
    const result = isMac();

    // Assert: 返回 true
    expect(result).toBe(true);
  });
});

describe('getModKeyName', () => {
  it('Mac 平台应返回 ⌘', () => {
    // Arrange: 模拟 Mac
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' });

    // Act: 获取 Mod 键名称
    const result = getModKeyName();

    // Assert: 返回 ⌘
    expect(result).toBe('⌘');
  });

  it('非 Mac 平台应返回 Ctrl', () => {
    // Arrange: 模拟 Windows
    vi.stubGlobal('navigator', { platform: 'Win32', userAgent: '' });

    // Act: 获取 Mod 键名称
    const result = getModKeyName();

    // Assert: 返回 Ctrl
    expect(result).toBe('Ctrl');
  });
});

describe('isModKeyPressed', () => {
  it('Mac 平台应检查 metaKey', () => {
    // Arrange: 模拟 Mac 和键盘事件
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' });
    const event = new KeyboardEvent('keydown', { metaKey: true, ctrlKey: false });

    // Act: 检查 Mod 键
    const result = isModKeyPressed(event);

    // Assert: metaKey 被按下，返回 true
    expect(result).toBe(true);
  });

  it('Mac 平台 ctrlKey 不应触发 Mod', () => {
    // Arrange: 模拟 Mac 和仅 ctrlKey 的键盘事件
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' });
    const event = new KeyboardEvent('keydown', { metaKey: false, ctrlKey: true });

    // Act: 检查 Mod 键
    const result = isModKeyPressed(event);

    // Assert: 返回 false
    expect(result).toBe(false);
  });

  it('Windows 平台应检查 ctrlKey', () => {
    // Arrange: 模拟 Windows 和键盘事件
    vi.stubGlobal('navigator', { platform: 'Win32', userAgent: '' });
    const event = new KeyboardEvent('keydown', { metaKey: false, ctrlKey: true });

    // Act: 检查 Mod 键
    const result = isModKeyPressed(event);

    // Assert: ctrlKey 被按下，返回 true
    expect(result).toBe(true);
  });
});

describe('formatKeysForDisplay', () => {
  it('Mac 平台应替换 Mod 为 ⌘ 且不加 + 分隔符', () => {
    // Arrange: 模拟 Mac
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' });

    // Act: 格式化按键组合
    const result = formatKeysForDisplay(['Mod', 'K']);

    // Assert: Mac 格式为 "⌘K"（无 +）
    expect(result).toBe('⌘K');
  });

  it('非 Mac 平台应替换 Mod 为 Ctrl 并加 + 分隔符', () => {
    // Arrange: 模拟 Windows
    vi.stubGlobal('navigator', { platform: 'Win32', userAgent: '' });

    // Act: 格式化按键组合
    const result = formatKeysForDisplay(['Mod', 'K']);

    // Assert: Windows 格式为 "Ctrl+K"
    expect(result).toBe('Ctrl+K');
  });

  it('不包含 Mod 的按键组合应原样拼接', () => {
    // Arrange: 模拟 Windows
    vi.stubGlobal('navigator', { platform: 'Win32', userAgent: '' });

    // Act: 格式化无 Mod 的按键
    const result = formatKeysForDisplay(['Shift', 'A']);

    // Assert: 原样拼接
    expect(result).toBe('Shift+A');
  });
});
