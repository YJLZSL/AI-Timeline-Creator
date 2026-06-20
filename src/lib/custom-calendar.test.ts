import { describe, it, expect } from 'vitest';
import {
  EARTH,
  XIANXIU,
  FANTASY,
  CALENDAR_PRESETS,
  DEFAULT_CALENDAR,
  parseCalendarConfig,
  serializeCalendarConfig,
  toCustomCalendar,
  formatCustomDate,
} from './custom-calendar';

describe('Calendar presets', () => {
  it('EARTH 预设应为默认配置', () => {
    // Assert: 地球历法配置
    expect(EARTH.yearLength).toBe(365);
    expect(EARTH.monthCount).toBe(12);
    expect(EARTH.dayLength).toBe(24);
    expect(EARTH.epochName).toBe('公元');
  });

  it('XIANXIU 预设应为 360 天/年，12 月，30 天/月', () => {
    // Assert: 修仙界历法配置
    expect(XIANXIU.yearLength).toBe(360);
    expect(XIANXIU.monthCount).toBe(12);
    expect(XIANXIU.dayLength).toBe(24);
    expect(XIANXIU.epochName).toBe('灵元');
    expect(XIANXIU.monthNames).toHaveLength(12);
  });

  it('FANTASY 预设应为 19 时/日', () => {
    // Assert: 奇幻历法配置
    expect(FANTASY.dayLength).toBe(19);
    expect(FANTASY.epochName).toBe('星纪');
  });

  it('DEFAULT_CALENDAR 应等于 EARTH', () => {
    // Assert: 默认配置指向地球历
    expect(DEFAULT_CALENDAR).toBe(EARTH);
  });

  it('CALENDAR_PRESETS 应包含所有预设', () => {
    // Assert: 预设映射包含所有配置
    expect(CALENDAR_PRESETS.earth.config).toBe(EARTH);
    expect(CALENDAR_PRESETS.xianxiu.config).toBe(XIANXIU);
    expect(CALENDAR_PRESETS.fantasy.config).toBe(FANTASY);
  });
});

describe('parseCalendarConfig', () => {
  it('null 应返回 null', () => {
    // Act: 解析 null
    const result = parseCalendarConfig(null);

    // Assert: 返回 null
    expect(result).toBeNull();
  });

  it('undefined 应返回 null', () => {
    // Act: 解析 undefined
    const result = parseCalendarConfig(undefined);

    // Assert: 返回 null
    expect(result).toBeNull();
  });

  it('有效 JSON 应返回 CalendarConfig', () => {
    // Arrange: 有效 JSON
    const json = JSON.stringify({ yearLength: 300, monthCount: 10, dayLength: 20, epochName: '测试纪元' });

    // Act: 解析
    const result = parseCalendarConfig(json);

    // Assert: 返回正确配置
    expect(result).not.toBeNull();
    expect(result!.yearLength).toBe(300);
    expect(result!.monthCount).toBe(10);
    expect(result!.dayLength).toBe(20);
    expect(result!.epochName).toBe('测试纪元');
  });

  it('无效 JSON 应返回 null', () => {
    // Act: 解析无效 JSON
    const result = parseCalendarConfig('not-json');

    // Assert: 返回 null
    expect(result).toBeNull();
  });

  it('缺失字段应使用默认值填充', () => {
    // Arrange: 缺少字段的 JSON
    const json = JSON.stringify({});

    // Act: 解析
    const result = parseCalendarConfig(json);

    // Assert: 使用默认值
    expect(result!.yearLength).toBe(365);
    expect(result!.monthCount).toBe(12);
    expect(result!.dayLength).toBe(24);
    expect(result!.epochName).toBe('公元');
  });

  it('非对象 JSON 应使用默认值返回配置', () => {
    // Act: 解析数组 JSON
    const result = parseCalendarConfig('[1, 2, 3]');

    // Assert: 数组 typeof 为 object，返回默认配置
    expect(result).not.toBeNull();
    expect(result!.yearLength).toBe(365);
  });
});

describe('serializeCalendarConfig', () => {
  it('应正确序列化配置为 JSON', () => {
    // Arrange: 配置对象
    const config = { yearLength: 360, monthCount: 12, dayLength: 24, epochName: '灵元' };

    // Act: 序列化
    const json = serializeCalendarConfig(config);

    // Assert: 正确序列化
    expect(JSON.parse(json)).toEqual(config);
  });
});

describe('toCustomCalendar', () => {
  it('应正确计算地球历下的日期', () => {
    // Arrange: 1970-01-01 UTC
    const date = new Date('1970-01-01T00:00:00Z');

    // Act: 转换
    const result = toCustomCalendar(date, EARTH);

    // Assert: 1970 年 1 月 1 日 0 时
    expect(result.year).toBe(1970);
    expect(result.month).toBe(1);
    expect(result.day).toBe(1);
    expect(result.hour).toBe(0);
  });

  it('应正确计算一天后的日期', () => {
    // Arrange: 1970-01-02 UTC
    const date = new Date('1970-01-02T00:00:00Z');

    // Act: 转换
    const result = toCustomCalendar(date, EARTH);

    // Assert: 1970 年 1 月 2 日
    expect(result.year).toBe(1970);
    expect(result.month).toBe(1);
    expect(result.day).toBe(2);
  });

  it('修仙界历的 totalDays 应基于 360 天/年计算', () => {
    // Arrange: 1971-01-01（约 360 天后）
    const date = new Date('1971-01-01T00:00:00Z');

    // Act: 转换
    const result = toCustomCalendar(date, XIANXIU);

    // Assert: year 增加，totalDays 约 360
    expect(result.year).toBeGreaterThan(1970);
    expect(result.totalDays).toBeGreaterThanOrEqual(360);
  });
});

describe('formatCustomDate', () => {
  it('应格式化地球历日期为预期字符串', () => {
    // Arrange: 1970-01-01
    const date = new Date('1970-01-01T00:00:00Z');

    // Act: 格式化
    const result = formatCustomDate(date, EARTH);

    // Assert: 包含"公元"和"年"
    expect(result).toContain('公元');
    expect(result).toContain('年');
  });

  it('应包含月份名称和日期', () => {
    // Arrange: 特定日期
    const date = new Date('1970-06-15T12:00:00Z');

    // Act: 格式化
    const result = formatCustomDate(date, EARTH);

    // Assert: 包含 "月" 和 "日"
    expect(result).toContain('月');
    expect(result).toContain('日');
  });
});
