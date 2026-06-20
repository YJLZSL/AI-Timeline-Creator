import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useTimelineStore } from './useTimelineStore';

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}));

describe('useTimelineStore', () => {
  beforeEach(() => {
    // Arrange: 重置 store 到初始状态（merge 模式，保留 actions）
    useTimelineStore.setState({
      viewMode: 'timeline',
      zoom: 1.0,
      scrollToEventId: null,
      showConnectionLines: true,
      outlineFilterTrackId: null,
      visibleDateRange: null,
    });
  });

  it('初始状态应包含默认 viewMode、zoom 和空选中项', () => {
    // Act: 获取当前状态
    const state = useTimelineStore.getState();

    // Assert: 验证所有初始值
    expect(state.viewMode).toBe('timeline');
    expect(state.zoom).toBe(1.0);
    expect(state.showConnectionLines).toBe(true);
  });

  it('setViewMode 应切换时间轴视图模式', () => {
    // Arrange: 目标视图模式
    const targetMode = 'outline';

    // Act: 切换视图
    act(() => {
      useTimelineStore.getState().setViewMode(targetMode);
    });

    // Assert: 验证模式已切换
    expect(useTimelineStore.getState().viewMode).toBe(targetMode);
  });

  it('setZoom 应限制 zoom 在 [0.5, 3.0] 范围内', () => {
    // Act: 设置 zoom 为边界值
    act(() => {
      useTimelineStore.getState().setZoom(0.3);
    });
    // Assert: 被限制到最小值
    expect(useTimelineStore.getState().zoom).toBe(0.5);

    // Act: 设置 zoom 为最大值之上
    act(() => {
      useTimelineStore.getState().setZoom(4.0);
    });
    // Assert: 被限制到最大值
    expect(useTimelineStore.getState().zoom).toBe(3.0);

    // Act: 设置合法 zoom 值
    act(() => {
      useTimelineStore.getState().setZoom(1.5);
    });
    // Assert: 正常设置
    expect(useTimelineStore.getState().zoom).toBe(1.5);
  });

  it('zoomIn 应增加 zoom 值，不超过上限', () => {
    // Arrange: 先重置到接近最大值
    act(() => {
      useTimelineStore.getState().setZoom(2.95);
    });

    // Act: 增加 zoom
    act(() => {
      useTimelineStore.getState().zoomIn(0.1);
    });

    // Assert: 被限制到上限
    expect(useTimelineStore.getState().zoom).toBe(3.0);
  });

  it('zoomOut 应减少 zoom 值，不低于下限', () => {
    // Arrange: 先重置到接近最小值
    act(() => {
      useTimelineStore.getState().setZoom(0.55);
    });

    // Act: 减少 zoom
    act(() => {
      useTimelineStore.getState().zoomOut(0.1);
    });

    // Assert: 被限制到下限
    expect(useTimelineStore.getState().zoom).toBe(0.5);
  });

  it('resetZoom 应恢复 zoom 到默认值 1.0', () => {
    // Arrange: 先改变 zoom
    act(() => {
      useTimelineStore.getState().setZoom(2.0);
    });

    // Act: 重置 zoom
    act(() => {
      useTimelineStore.getState().resetZoom();
    });

    // Assert: 恢复到默认值
    expect(useTimelineStore.getState().zoom).toBe(1.0);
  });

  it('toggleConnectionLines 应切换连线显示状态', () => {
    // Arrange: 确认初始状态为 true
    expect(useTimelineStore.getState().showConnectionLines).toBe(true);

    // Act: 切换状态
    act(() => {
      useTimelineStore.getState().toggleConnectionLines();
    });

    // Assert: 验证状态已翻转
    expect(useTimelineStore.getState().showConnectionLines).toBe(false);

    // Act: 再次切换
    act(() => {
      useTimelineStore.getState().toggleConnectionLines();
    });

    // Assert: 验证状态恢复
    expect(useTimelineStore.getState().showConnectionLines).toBe(true);
  });

  it('setVisibleDateRange 应正确设置可见日期范围', () => {
    // Arrange: 定义日期范围
    const range = { startMs: 1000, endMs: 5000 };

    // Act: 设置范围
    act(() => {
      useTimelineStore.getState().setVisibleDateRange(range);
    });

    // Assert: 验证范围已设置
    expect(useTimelineStore.getState().visibleDateRange).toEqual(range);

    // Act: 清空范围
    act(() => {
      useTimelineStore.getState().setVisibleDateRange(null);
    });

    // Assert: 验证已清空
    expect(useTimelineStore.getState().visibleDateRange).toBeNull();
  });
});
