import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useTrackStore } from './useTrackStore';

describe('useTrackStore', () => {
  beforeEach(() => {
    // Arrange: 重置 store 到初始状态（merge 模式，保留 actions）
    useTrackStore.setState({ selectedTrackId: null, editingTrackId: null });
  });

  it('初始状态应 selectedTrackId 和 editingTrackId 均为 null', () => {
    // Act: 获取当前状态
    const state = useTrackStore.getState();

    // Assert: 验证初始值
    expect(state.selectedTrackId).toBeNull();
    expect(state.editingTrackId).toBeNull();
  });

  it('setSelectedTrack 应正确设置选中 track', () => {
    // Arrange: 定义 track ID
    const trackId = 'track-123';

    // Act: 调用 action 设置 track
    act(() => {
      useTrackStore.getState().setSelectedTrack(trackId);
    });

    // Assert: 验证状态已更新
    expect(useTrackStore.getState().selectedTrackId).toBe(trackId);
  });

  it('setSelectedTrack(null) 应取消选中 track', () => {
    // Arrange: 先设置一个 track
    act(() => {
      useTrackStore.getState().setSelectedTrack('track-123');
    });
    expect(useTrackStore.getState().selectedTrackId).toBe('track-123');

    // Act: 取消选中
    act(() => {
      useTrackStore.getState().setSelectedTrack(null);
    });

    // Assert: 验证状态恢复为 null
    expect(useTrackStore.getState().selectedTrackId).toBeNull();
  });

  it('setEditingTrack 应正确设置编辑中 track', () => {
    // Arrange: 定义编辑 track ID
    const editingId = 'track-edit-456';

    // Act: 调用 action 设置编辑 track
    act(() => {
      useTrackStore.getState().setEditingTrack(editingId);
    });

    // Assert: 验证状态已更新
    expect(useTrackStore.getState().editingTrackId).toBe(editingId);
  });

  it('setEditingTrack(null) 应取消编辑 track', () => {
    // Arrange: 先设置一个编辑 track
    act(() => {
      useTrackStore.getState().setEditingTrack('track-edit-456');
    });

    // Act: 取消编辑
    act(() => {
      useTrackStore.getState().setEditingTrack(null);
    });

    // Assert: 验证状态恢复为 null
    expect(useTrackStore.getState().editingTrackId).toBeNull();
  });

  it('selectedTrackId 和 editingTrackId 应独立变化', () => {
    // Arrange: 设置两个不同的 track ID
    const selectedId = 'track-a';
    const editingId = 'track-b';

    // Act: 分别设置两个值
    act(() => {
      useTrackStore.getState().setSelectedTrack(selectedId);
      useTrackStore.getState().setEditingTrack(editingId);
    });

    // Assert: 验证两个状态独立保持各自的值
    const state = useTrackStore.getState();
    expect(state.selectedTrackId).toBe(selectedId);
    expect(state.editingTrackId).toBe(editingId);
  });
});
