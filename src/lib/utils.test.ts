import { describe, it, expect } from 'vitest';
import { cn, safeJsonArray } from './utils';

describe('cn', () => {
  it('应合并多个 className 并去重', () => {
    // Arrange: 多个 className
    const class1 = 'text-sm';
    const class2 = 'font-bold';

    // Act: 合并
    const result = cn(class1, class2);

    // Assert: 包含两个 class
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
  });

  it('应处理条件 className（falsy 值被忽略）', () => {
    // Arrange: 包含条件值
    const isActive = false;

    // Act: 合并（falsy 值应被忽略）
    const result = cn('base', isActive && 'active', null, undefined, '');

    // Assert: 只包含 base
    expect(result).toBe('base');
  });

  it('应使用 tailwind-merge 解决冲突类', () => {
    // Arrange: 冲突的 Tailwind 类
    const base = 'px-2 py-1';
    const override = 'px-4';

    // Act: 合并（tailwind-merge 应保留 override）
    const result = cn(base, override);

    // Assert: px-4 覆盖 px-2
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
    expect(result).toContain('py-1');
  });

  it('应处理数组形式的 className', () => {
    // Arrange: 数组形式
    const classes = ['text-red-500', 'bg-blue-100'];

    // Act: 合并
    const result = cn(classes);

    // Assert: 包含所有类
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-100');
  });
});

describe('safeJsonArray', () => {
  it('应解析有效的 JSON 数组字符串', () => {
    // Arrange: 有效的 JSON 数组
    const json = '[1, 2, 3]';

    // Act: 解析
    const result = safeJsonArray<number>(json);

    // Assert: 返回数组
    expect(result).toEqual([1, 2, 3]);
  });

  it('非字符串输入应返回 fallback', () => {
    // Act & Assert: 各种非字符串输入
    expect(safeJsonArray(null)).toEqual([]);
    expect(safeJsonArray(undefined)).toEqual([]);
    expect(safeJsonArray(123)).toEqual([]);
    expect(safeJsonArray({})).toEqual([]);
  });

  it('无效 JSON 应返回 fallback', () => {
    // Arrange: 无效 JSON
    const invalid = '{ not json }';

    // Act: 解析
    const result = safeJsonArray(invalid);

    // Assert: 返回 fallback
    expect(result).toEqual([]);
  });

  it('JSON 对象（非数组）应返回 fallback', () => {
    // Arrange: JSON 对象
    const obj = '{"a": 1}';

    // Act: 解析
    const result = safeJsonArray(obj);

    // Assert: 返回 fallback
    expect(result).toEqual([]);
  });

  it('应支持自定义 fallback', () => {
    // Arrange: 自定义 fallback
    const fallback = ['default'];

    // Act: 对无效输入使用自定义 fallback
    const result = safeJsonArray(null, fallback);

    // Assert: 返回自定义 fallback
    expect(result).toEqual(['default']);
  });

  it('空数组字符串应返回空数组', () => {
    // Arrange: 空数组 JSON
    const json = '[]';

    // Act: 解析
    const result = safeJsonArray(json);

    // Assert: 返回空数组
    expect(result).toEqual([]);
  });
});
