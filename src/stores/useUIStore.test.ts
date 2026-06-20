import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useUIStore } from './useUIStore';

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}));

describe('useUIStore', () => {
  beforeEach(() => {
    // Arrange: 重置 UI store 到初始状态（merge 模式，保留 actions）
    useUIStore.setState({
      activePanel: null,
      panelWidth: 360,
      focusMode: false,
      commandPaletteOpen: false,
      settingsOpen: false,
      detailEventId: null,
    });
  });

  it('初始状态应包含预期的默认值', () => {
    // Act: 获取当前状态
    const state = useUIStore.getState();

    // Assert: 验证所有初始值
    expect(state.activePanel).toBeNull();
    expect(state.panelWidth).toBe(360);
    expect(state.focusMode).toBe(false);
    expect(state.commandPaletteOpen).toBe(false);
    expect(state.settingsOpen).toBe(false);
    expect(state.detailEventId).toBeNull();
  });

  it('setActivePanel 应设置当前活动面板', () => {
    // Act: 设置活动面板
    act(() => {
      useUIStore.getState().setActivePanel('event-editor');
    });

    // Assert: 验证面板已切换
    expect(useUIStore.getState().activePanel).toBe('event-editor');
  });

  it('togglePanel 应切换面板开关（相同面板关闭，不同面板切换）', () => {
    // Act: 切换打开 'properties' 面板
    act(() => {
      useUIStore.getState().togglePanel('properties');
    });
    // Assert: 面板已打开
    expect(useUIStore.getState().activePanel).toBe('properties');

    // Act: 再次切换相同面板
    act(() => {
      useUIStore.getState().togglePanel('properties');
    });
    // Assert: 面板已关闭
    expect(useUIStore.getState().activePanel).toBeNull();

    // Act: 切换不同面板
    act(() => {
      useUIStore.getState().togglePanel('ai');
    });
    // Assert: 新面板已打开
    expect(useUIStore.getState().activePanel).toBe('ai');
  });

  it('setPanelWidth 应将面板宽度限制在 [280, 480] 范围内', () => {
    // Act: 设置低于下限的宽度
    act(() => {
      useUIStore.getState().setPanelWidth(100);
    });
    // Assert: 被限制到下限
    expect(useUIStore.getState().panelWidth).toBe(280);

    // Act: 设置高于上限的宽度
    act(() => {
      useUIStore.getState().setPanelWidth(600);
    });
    // Assert: 被限制到上限
    expect(useUIStore.getState().panelWidth).toBe(480);

    // Act: 设置合法宽度
    act(() => {
      useUIStore.getState().setPanelWidth(400);
    });
    // Assert: 正常设置
    expect(useUIStore.getState().panelWidth).toBe(400);
  });

  it('toggleFocusMode 应切换专注模式状态', () => {
    // Arrange: 初始为 false
    expect(useUIStore.getState().focusMode).toBe(false);

    // Act: 切换专注模式
    act(() => {
      useUIStore.getState().toggleFocusMode();
    });

    // Assert: 变为 true
    expect(useUIStore.getState().focusMode).toBe(true);

    // Act: 再次切换
    act(() => {
      useUIStore.getState().toggleFocusMode();
    });

    // Assert: 恢复 false
    expect(useUIStore.getState().focusMode).toBe(false);
  });

  it('setCommandPaletteOpen 和 setSettingsOpen 应控制模态框状态', () => {
    // Act: 打开命令面板
    act(() => {
      useUIStore.getState().setCommandPaletteOpen(true);
    });
    // Assert: 命令面板已打开
    expect(useUIStore.getState().commandPaletteOpen).toBe(true);

    // Act: 关闭命令面板，打开设置
    act(() => {
      useUIStore.getState().setCommandPaletteOpen(false);
      useUIStore.getState().setSettingsOpen(true);
    });
    // Assert: 状态已切换
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
    expect(useUIStore.getState().settingsOpen).toBe(true);
  });

  it('setDetailEvent 应设置和清除详情事件 ID', () => {
    // Act: 设置详情事件
    act(() => {
      useUIStore.getState().setDetailEvent('evt-detail-1');
    });
    // Assert: 已设置
    expect(useUIStore.getState().detailEventId).toBe('evt-detail-1');

    // Act: 清除详情事件
    act(() => {
      useUIStore.getState().setDetailEvent(null);
    });
    // Assert: 已清除
    expect(useUIStore.getState().detailEventId).toBeNull();
  });
});
