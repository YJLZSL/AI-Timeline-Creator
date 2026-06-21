import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useSettingsStore, serializeSettings, deserializeSettings } from './useSettingsStore';

vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}));

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Arrange: 重置 settings store 到默认状态（merge 模式，保留 actions）
    useSettingsStore.setState({
      openLastWorkspace: false,
      autoSave: false,
      autoCheckUpdates: true,
      outlineFontSize: 14,
    });
  });

  it('初始状态应包含所有默认设置值', () => {
    // Act: 获取当前状态
    const state = useSettingsStore.getState();

    // Assert: 验证默认值
    expect(state.openLastWorkspace).toBe(false);
    expect(state.autoSave).toBe(false);
    expect(state.autoCheckUpdates).toBe(true);
    expect(state.outlineFontSize).toBe(14);
  });

  it('setOpenLastWorkspace 应切换布尔值', () => {
    // Act: 切换为 true
    act(() => {
      useSettingsStore.getState().setOpenLastWorkspace(true);
    });
    // Assert: 已切换
    expect(useSettingsStore.getState().openLastWorkspace).toBe(true);
  });

  it('setAutoSave 应切换自动保存开关', () => {
    // Act: 切换自动保存
    act(() => {
      useSettingsStore.getState().setAutoSave(true);
    });
    // Assert: 已切换
    expect(useSettingsStore.getState().autoSave).toBe(true);
  });

  it('setOutlineFontSize 应将字号限制在 [12, 24] 范围内', () => {
    // Act: 设置低于下限的字号
    act(() => {
      useSettingsStore.getState().setOutlineFontSize(5);
    });
    // Assert: 被限制到下限
    expect(useSettingsStore.getState().outlineFontSize).toBe(12);

    // Act: 设置高于上限的字号
    act(() => {
      useSettingsStore.getState().setOutlineFontSize(30);
    });
    // Assert: 被限制到上限
    expect(useSettingsStore.getState().outlineFontSize).toBe(24);

    // Act: 设置合法字号
    act(() => {
      useSettingsStore.getState().setOutlineFontSize(18);
    });
    // Assert: 正常设置
    expect(useSettingsStore.getState().outlineFontSize).toBe(18);
  });

  it('mergeSettings 应合并部分设置并忽略无效值', () => {
    // Act: 合并部分设置
    act(() => {
      useSettingsStore.getState().mergeSettings({
        openLastWorkspace: true,
        outlineFontSize: 20,
      });
    });
    // Assert: 已合并的设置生效
    expect(useSettingsStore.getState().openLastWorkspace).toBe(true);
    expect(useSettingsStore.getState().outlineFontSize).toBe(20);
    // Assert: 未修改的设置保持原值
    expect(useSettingsStore.getState().autoSave).toBe(false);
  });

  it('mergeSettings 应忽略非布尔值和非数字的无效值', () => {
    // Act: 尝试合并包含无效类型的值
    act(() => {
      useSettingsStore.getState().mergeSettings({
        openLastWorkspace: 'yes' as unknown as boolean,
        outlineFontSize: 'large' as unknown as number,
      });
    });
    // Assert: 无效值被忽略，保持默认值
    expect(useSettingsStore.getState().openLastWorkspace).toBe(false);
    expect(useSettingsStore.getState().outlineFontSize).toBe(14);
  });

  it('mergeSettings 应忽略非有限数字', () => {
    // Act: 合并 NaN 和 Infinity
    act(() => {
      useSettingsStore.getState().mergeSettings({
        outlineFontSize: NaN,
      });
    });
    // Assert: 保持默认值
    expect(useSettingsStore.getState().outlineFontSize).toBe(14);

    act(() => {
      useSettingsStore.getState().mergeSettings({
        outlineFontSize: Infinity,
      });
    });
    // Assert: 保持默认值
    expect(useSettingsStore.getState().outlineFontSize).toBe(14);
  });
});

describe('serializeSettings', () => {
  it('应将设置对象序列化为 JSON 字符串', () => {
    // Arrange: 构建设置对象
    const settings = {
      openLastWorkspace: true,
      autoSave: false,
      autoCheckUpdates: true,
      outlineFontSize: 16,
      fontFamily: 'noto' as const,
    };

    // Act: 序列化
    const json = serializeSettings(settings);

    // Assert: 验证 JSON 字符串
    expect(JSON.parse(json)).toEqual(settings);
  });
});

describe('deserializeSettings', () => {
  it('应正确解析有效的 JSON 字符串', () => {
    // Arrange: 构建 JSON 字符串
    const json = JSON.stringify({ openLastWorkspace: true, outlineFontSize: 18 });

    // Act: 反序列化
    const result = deserializeSettings(json);

    // Assert: 验证结果
    expect(result).toEqual({ openLastWorkspace: true, outlineFontSize: 18 });
  });

  it('对 null 应返回空对象', () => {
    // Act: 反序列化 null
    const result = deserializeSettings(null);

    // Assert: 返回空对象
    expect(result).toEqual({});
  });

  it('对无效 JSON 应返回空对象', () => {
    // Act: 反序列化无效 JSON
    const result = deserializeSettings('not-json{{}');

    // Assert: 返回空对象
    expect(result).toEqual({});
  });

  it('应过滤掉无效的字段类型', () => {
    // Arrange: 构建包含无效类型的 JSON
    const json = JSON.stringify({ openLastWorkspace: 'yes', outlineFontSize: 16 });

    // Act: 反序列化
    const result = deserializeSettings(json);

    // Assert: 仅保留有效字段
    expect(result).toEqual({ outlineFontSize: 16 });
  });
});
