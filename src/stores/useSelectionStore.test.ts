import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useSelectionStore } from './useSelectionStore';

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}));

describe('useSelectionStore', () => {
  beforeEach(() => {
    // Arrange: 重置 store 到初始状态（merge 模式，保留 actions）
    useSelectionStore.setState({
      selectedEventId: null,
      selectedCharacterId: null,
      selectedForeshadowingId: null,
      selectedWorldSettingId: null,
      selectedSceneId: null,
      selectedBeatId: null,
      selectedChoiceId: null,
    });
  });

  it('初始状态所有选中项应为 null', () => {
    // Act: 获取当前状态
    const state = useSelectionStore.getState();

    // Assert: 验证所有选中项为 null
    expect(state.selectedEventId).toBeNull();
    expect(state.selectedCharacterId).toBeNull();
    expect(state.selectedForeshadowingId).toBeNull();
    expect(state.selectedWorldSettingId).toBeNull();
    expect(state.selectedSceneId).toBeNull();
    expect(state.selectedBeatId).toBeNull();
    expect(state.selectedChoiceId).toBeNull();
  });

  it('selectEvent 应设置选中事件并清除其他选中项', () => {
    // Act: 选择事件
    act(() => {
      useSelectionStore.getState().selectEvent('evt-1');
    });

    // Assert: selectionStore 中已选中
    expect(useSelectionStore.getState().selectedEventId).toBe('evt-1');
  });

  it('selectEvent 应清除其他选中项', () => {
    // Arrange: 先设置其他选中项
    act(() => {
      useSelectionStore.getState().selectCharacter('char-1');
    });
    expect(useSelectionStore.getState().selectedCharacterId).toBe('char-1');

    // Act: 选择事件
    act(() => {
      useSelectionStore.getState().selectEvent('evt-1');
    });

    // Assert: 事件已选中，其他被清除
    expect(useSelectionStore.getState().selectedEventId).toBe('evt-1');
    expect(useSelectionStore.getState().selectedCharacterId).toBeNull();
  });

  it('selectCharacter 应设置选中角色', () => {
    // Act: 选择角色
    act(() => {
      useSelectionStore.getState().selectCharacter('char-1');
    });

    // Assert: selectionStore 中已选中
    expect(useSelectionStore.getState().selectedCharacterId).toBe('char-1');
  });

  it('selectForeshadowing 应设置选中伏笔并清除其他选中项', () => {
    // Arrange: 先设置事件选中
    act(() => {
      useSelectionStore.getState().selectEvent('evt-1');
    });

    // Act: 选择伏笔
    act(() => {
      useSelectionStore.getState().selectForeshadowing('fore-1');
    });

    // Assert: 伏笔已选中，事件被清除
    expect(useSelectionStore.getState().selectedForeshadowingId).toBe('fore-1');
    expect(useSelectionStore.getState().selectedEventId).toBeNull();
  });

  it('selectScene、selectBeat、selectChoice 应独立工作', () => {
    // Act: 分别设置 scene、beat、choice
    act(() => {
      useSelectionStore.getState().selectScene('scene-1');
    });
    expect(useSelectionStore.getState().selectedSceneId).toBe('scene-1');

    act(() => {
      useSelectionStore.getState().selectBeat('beat-1');
    });
    expect(useSelectionStore.getState().selectedBeatId).toBe('beat-1');

    act(() => {
      useSelectionStore.getState().selectChoice('choice-1');
    });
    expect(useSelectionStore.getState().selectedChoiceId).toBe('choice-1');
  });

  it('clear 应清除所有选中项', () => {
    // Arrange: 设置多个选中项
    act(() => {
      useSelectionStore.getState().selectEvent('evt-1');
      useSelectionStore.getState().selectCharacter('char-1');
    });

    // Act: 清除所有选中
    act(() => {
      useSelectionStore.getState().clear();
    });

    // Assert: 所有选中项已清除
    const state = useSelectionStore.getState();
    expect(state.selectedEventId).toBeNull();
    expect(state.selectedCharacterId).toBeNull();
    expect(state.selectedForeshadowingId).toBeNull();
    expect(state.selectedWorldSettingId).toBeNull();
    expect(state.selectedSceneId).toBeNull();
    expect(state.selectedBeatId).toBeNull();
    expect(state.selectedChoiceId).toBeNull();
  });
});
