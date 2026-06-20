import { describe, it, expect } from 'vitest';
import { getTimelineTicks, getEventPosition, getTimeAtPosition } from './timeline';

describe('getTimelineTicks', () => {
  it('当 endDate <= startDate 时应返回空数组', () => {
    // Arrange: 相同时间
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-01');

    // Act: 获取 ticks
    const ticks = getTimelineTicks(start, end, 1);

    // Assert: 返回空数组
    expect(ticks).toEqual([]);
  });

  it('当 endDate < startDate 时应返回空数组', () => {
    // Arrange: 结束早于开始
    const start = new Date('2024-01-02');
    const end = new Date('2024-01-01');

    // Act: 获取 ticks
    const ticks = getTimelineTicks(start, end, 1);

    // Assert: 返回空数组
    expect(ticks).toEqual([]);
  });

  it('48 小时以内应显示小时刻度', () => {
    // Arrange: 24 小时跨度
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-02T00:00:00Z');

    // Act: 获取 ticks
    const ticks = getTimelineTicks(start, end, 1);

    // Assert: 有小时刻度，label 包含 ":00"
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0].label).toMatch(/:\d{2}$/);
  });

  it('7 天以内应显示日刻度，不含年份', () => {
    // Arrange: 5 天跨度
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-06T00:00:00Z');

    // Act: 获取 ticks
    const ticks = getTimelineTicks(start, end, 1);

    // Assert: 日刻度，格式为 MM/DD
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0].label).toMatch(/^\d{2}\/\d{2}$/);
  });

  it('30 天以内应显示日刻度，major 每 7 天一次', () => {
    // Arrange: 15 天跨度
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-16T00:00:00Z');

    // Act: 获取 ticks
    const ticks = getTimelineTicks(start, end, 1);

    // Assert: 有日刻度，且位置在 0-100 之间
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0].position).toBeGreaterThanOrEqual(0);
    expect(ticks[0].position).toBeLessThanOrEqual(100);
  });

  it('tick 的 position 应在 [0, 100] 范围内', () => {
    // Arrange: 1 年跨度
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2025-01-01T00:00:00Z');

    // Act: 获取 ticks
    const ticks = getTimelineTicks(start, end, 1);

    // Assert: 所有 tick 位置在合法范围内
    for (const tick of ticks) {
      expect(tick.position).toBeGreaterThanOrEqual(0);
      expect(tick.position).toBeLessThanOrEqual(100);
    }
  });
});

describe('getEventPosition', () => {
  it('eventTime 为 null 时应返回 0', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-02');

    // Act: 计算位置
    const result = getEventPosition(start, end, null);

    // Assert: 返回 0
    expect(result).toBe(0);
  });

  it('eventTime 在开始时间应返回 0', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-02T00:00:00Z');

    // Act: 计算位置（事件在开始时间）
    const result = getEventPosition(start, end, new Date('2024-01-01T00:00:00Z'));

    // Assert: 返回 0
    expect(result).toBe(0);
  });

  it('eventTime 在结束时间应返回 100', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-02T00:00:00Z');

    // Act: 计算位置（事件在结束时间）
    const result = getEventPosition(start, end, new Date('2024-01-02T00:00:00Z'));

    // Assert: 返回 100
    expect(result).toBe(100);
  });

  it('eventTime 在中间应返回 50', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-03T00:00:00Z');

    // Act: 计算位置（事件在中间）
    const result = getEventPosition(start, end, new Date('2024-01-02T00:00:00Z'));

    // Assert: 返回 50（约）
    expect(result).toBeCloseTo(50, 1);
  });

  it('eventTime 超出范围应被限制在 [0, 100]', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-02T00:00:00Z');

    // Act: 早于开始
    const beforeStart = getEventPosition(start, end, new Date('2023-12-01T00:00:00Z'));
    // Act: 晚于结束
    const afterEnd = getEventPosition(start, end, new Date('2024-02-01T00:00:00Z'));

    // Assert: 被限制在边界
    expect(beforeStart).toBe(0);
    expect(afterEnd).toBe(100);
  });
});

describe('getTimeAtPosition', () => {
  it('ratio 为 0 时应返回 startDate', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-02T00:00:00Z');

    // Act: 计算时间
    const result = getTimeAtPosition(start, end, 0);

    // Assert: 返回 startDate
    expect(result.getTime()).toBe(start.getTime());
  });

  it('ratio 为 1 时应返回 endDate', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-02T00:00:00Z');

    // Act: 计算时间
    const result = getTimeAtPosition(start, end, 1);

    // Assert: 返回 endDate
    expect(result.getTime()).toBe(end.getTime());
  });

  it('ratio 为 0.5 时应返回中间时间', () => {
    // Arrange: 时间范围
    const start = new Date('2024-01-01T00:00:00Z');
    const end = new Date('2024-01-03T00:00:00Z');

    // Act: 计算时间（ratio 0.5）
    const result = getTimeAtPosition(start, end, 0.5);

    // Assert: 返回中间时间
    expect(result.getTime()).toBe(new Date('2024-01-02T00:00:00Z').getTime());
  });
});
