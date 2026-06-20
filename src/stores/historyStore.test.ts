import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useHistoryStore, type HistoryRecord } from './historyStore';

describe('useHistoryStore', () => {
  beforeEach(() => {
    // Arrange: 每次测试前清空历史记录（merge 模式，保留 actions）
    useHistoryStore.getState().clear();
  });

  it('初始状态 past 和 future 为空，canUndo 和 canRedo 为 false', () => {
    // Act: 获取当前状态
    const state = useHistoryStore.getState();

    // Assert: 验证初始状态
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
    expect(state.canUndo).toBe(false);
    expect(state.canRedo).toBe(false);
  });

  it('push 一条记录后 canUndo 变为 true，future 被清空', () => {
    // Arrange: 创建一条测试记录
    const record = {
      id: 'rec-1',
      workspaceId: 'ws-1',
      entityType: 'event' as const,
      action: 'create' as const,
      entityId: 'evt-1',
      data: { title: '测试事件' },
    };

    // Act: 推送记录
    act(() => {
      useHistoryStore.getState().push(record);
    });

    // Assert: 验证状态变化
    const state = useHistoryStore.getState();
    expect(state.past).toHaveLength(1);
    expect(state.past[0]).toEqual(record);
    expect(state.future).toEqual([]);
    expect(state.canUndo).toBe(true);
    expect(state.canRedo).toBe(false);
  });

  it('undo 应返回最后一条记录并将其移到 future', () => {
    // Arrange: 推送两条记录
    const record1 = {
      id: 'rec-1',
      workspaceId: 'ws-1',
      entityType: 'event' as const,
      action: 'create' as const,
      entityId: 'evt-1',
      data: { title: '事件1' },
    };
    const record2 = {
      id: 'rec-2',
      workspaceId: 'ws-1',
      entityType: 'event' as const,
      action: 'update' as const,
      entityId: 'evt-1',
      data: { title: '事件1-更新' },
    };
    act(() => {
      useHistoryStore.getState().push(record1);
      useHistoryStore.getState().push(record2);
    });

    // Act: 执行 undo
    let result: HistoryRecord | null;
    act(() => {
      result = useHistoryStore.getState().undo();
    });

    // Assert: 验证返回的记录和状态变化
    const state = useHistoryStore.getState();
    expect(result!).toEqual(record2);
    expect(state.past).toHaveLength(1);
    expect(state.past[0]).toEqual(record1);
    expect(state.future).toHaveLength(1);
    expect(state.future[0]).toEqual(record2);
    expect(state.canUndo).toBe(true);
    expect(state.canRedo).toBe(true);
  });

  it('undo 在空 past 时应返回 null', () => {
    // Act: 对空历史执行 undo
    let result: HistoryRecord | null;
    act(() => {
      result = useHistoryStore.getState().undo();
    });

    // Assert: 验证返回 null
    expect(result!).toBeNull();
  });

  it('redo 应将 future 的记录恢复到 past', () => {
    // Arrange: 推送一条记录，再 undo
    const record = {
      id: 'rec-1',
      workspaceId: 'ws-1',
      entityType: 'track' as const,
      action: 'create' as const,
      entityId: 'trk-1',
      data: { name: '主线' },
    };
    act(() => {
      useHistoryStore.getState().push(record);
    });
    act(() => {
      useHistoryStore.getState().undo();
    });

    // Act: 执行 redo
    let result: HistoryRecord | null;
    act(() => {
      result = useHistoryStore.getState().redo();
    });

    // Assert: 验证状态恢复
    const state = useHistoryStore.getState();
    expect(result!).toEqual(record);
    expect(state.past).toHaveLength(1);
    expect(state.future).toHaveLength(0);
    expect(state.canRedo).toBe(false);
    expect(state.canUndo).toBe(true);
  });

  it('redo 在空 future 时应返回 null', () => {
    // Act: 对空 future 执行 redo
    let result: HistoryRecord | null;
    act(() => {
      result = useHistoryStore.getState().redo();
    });

    // Assert: 验证返回 null
    expect(result!).toBeNull();
  });

  it('push 新记录后应清空 future', () => {
    // Arrange: 推送两条记录，undo 一次
    const record1 = { id: 'r1', workspaceId: 'ws', entityType: 'event' as const, action: 'create' as const, entityId: 'e1', data: {} };
    const record2 = { id: 'r2', workspaceId: 'ws', entityType: 'event' as const, action: 'create' as const, entityId: 'e2', data: {} };
    const record3 = { id: 'r3', workspaceId: 'ws', entityType: 'event' as const, action: 'create' as const, entityId: 'e3', data: {} };
    act(() => {
      useHistoryStore.getState().push(record1);
      useHistoryStore.getState().push(record2);
    });
    act(() => {
      useHistoryStore.getState().undo();
    });
    expect(useHistoryStore.getState().future).toHaveLength(1);

    // Act: 推送新记录，future 应被清空
    act(() => {
      useHistoryStore.getState().push(record3);
    });

    // Assert: 验证 future 被清空
    const state = useHistoryStore.getState();
    expect(state.future).toEqual([]);
    expect(state.past).toHaveLength(2);
    expect(state.canRedo).toBe(false);
  });

  it('clear 应重置所有状态为初始值', () => {
    // Arrange: 推送多条记录
    const record = { id: 'r1', workspaceId: 'ws', entityType: 'event' as const, action: 'create' as const, entityId: 'e1', data: {} };
    act(() => {
      useHistoryStore.getState().push(record);
    });
    expect(useHistoryStore.getState().past).toHaveLength(1);

    // Act: 执行 clear
    act(() => {
      useHistoryStore.getState().clear();
    });

    // Assert: 验证状态完全重置
    const state = useHistoryStore.getState();
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
    expect(state.canUndo).toBe(false);
    expect(state.canRedo).toBe(false);
  });
});
