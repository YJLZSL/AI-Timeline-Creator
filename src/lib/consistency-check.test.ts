import { describe, it, expect } from 'vitest';
import { runAllChecks, ISSUE_TYPE_LABELS, SEVERITY_LABELS } from './consistency-check';
import type { TimelineEvent, Character, WorldSetting } from '../../shared/types';

describe('ISSUE_TYPE_LABELS', () => {
  it('应包含所有 issue 类型的中文标签', () => {
    // Assert: 所有类型都有标签
    expect(ISSUE_TYPE_LABELS['event-time-invalid']).toBe('时间错误');
    expect(ISSUE_TYPE_LABELS['event-missing-title']).toBe('无标题');
    expect(ISSUE_TYPE_LABELS['event-missing-time']).toBe('无时间');
    expect(ISSUE_TYPE_LABELS['event-duplicate-title']).toBe('标题重复');
    expect(ISSUE_TYPE_LABELS['character-missing-name']).toBe('角色无名');
    expect(ISSUE_TYPE_LABELS['worldsetting-missing-key']).toBe('设定无名');
    expect(ISSUE_TYPE_LABELS['worldsetting-duplicate-key']).toBe('设定重复');
  });
});

describe('SEVERITY_LABELS', () => {
  it('应包含错误和警告的中文标签', () => {
    // Assert: 验证标签
    expect(SEVERITY_LABELS.error).toBe('错误');
    expect(SEVERITY_LABELS.warning).toBe('警告');
  });
});

describe('runAllChecks', () => {
  it('空数据应返回空问题列表', () => {
    // Arrange: 空数据
    const input = { events: [], characters: [], worldSettings: [] };

    // Act: 运行检查
    const issues = runAllChecks(input);

    // Assert: 无问题
    expect(issues).toHaveLength(0);
  });

  it('应检测到无标题事件', () => {
    // Arrange: 无标题事件
    const event: TimelineEvent = { id: 'e1', title: '', startTime: null, endTime: null } as TimelineEvent;

    // Act: 运行检查
    const issues = runAllChecks({ events: [event], characters: [], worldSettings: [] });

    // Assert: 检测到无标题错误
    expect(issues.some((i) => i.type === 'event-missing-title')).toBe(true);
    expect(issues.find((i) => i.type === 'event-missing-title')!.severity).toBe('error');
  });

  it('应检测到结束时间早于开始时间', () => {
    // Arrange: 时间颠倒的事件
    const event = {
      id: 'e1',
      title: '测试事件',
      startTime: '2024-01-02T00:00:00Z',
      endTime: '2024-01-01T00:00:00Z',
    } as unknown as TimelineEvent;

    // Act: 运行检查
    const issues = runAllChecks({ events: [event], characters: [], worldSettings: [] });

    // Assert: 检测到时间错误
    expect(issues.some((i) => i.type === 'event-time-invalid')).toBe(true);
    expect(issues.find((i) => i.type === 'event-time-invalid')!.severity).toBe('error');
  });

  it('应检测到缺少开始时间的事件', () => {
    // Arrange: 无开始时间的事件
    const event: TimelineEvent = { id: 'e1', title: '测试事件', startTime: null, endTime: null } as TimelineEvent;

    // Act: 运行检查
    const issues = runAllChecks({ events: [event], characters: [], worldSettings: [] });

    // Assert: 检测到无时间警告
    expect(issues.some((i) => i.type === 'event-missing-time')).toBe(true);
    expect(issues.find((i) => i.type === 'event-missing-time')!.severity).toBe('warning');
  });

  it('应检测到标题重复的事件', () => {
    // Arrange: 两个相同标题的事件
    const events: TimelineEvent[] = [
      { id: 'e1', title: '相同标题', startTime: null, endTime: null } as TimelineEvent,
      { id: 'e2', title: '相同标题', startTime: null, endTime: null } as TimelineEvent,
    ];

    // Act: 运行检查
    const issues = runAllChecks({ events, characters: [], worldSettings: [] });

    // Assert: 检测到标题重复
    const duplicateIssue = issues.find((i) => i.type === 'event-duplicate-title');
    expect(duplicateIssue).toBeDefined();
    expect(duplicateIssue!.severity).toBe('warning');
    expect(duplicateIssue!.eventIds).toContain('e1');
    expect(duplicateIssue!.eventIds).toContain('e2');
  });

  it('应检测到无名称的角色', () => {
    // Arrange: 无名称角色
    const character: Character = { id: 'c1', name: '' } as Character;

    // Act: 运行检查
    const issues = runAllChecks({ events: [], characters: [character], worldSettings: [] });

    // Assert: 检测到角色无名错误
    expect(issues.some((i) => i.type === 'character-missing-name')).toBe(true);
    expect(issues.find((i) => i.type === 'character-missing-name')!.severity).toBe('error');
  });

  it('应检测到无 key 的世界观设定', () => {
    // Arrange: 无 key 的设定
    const setting: WorldSetting = { id: 'w1', key: '', value: '' } as WorldSetting;

    // Act: 运行检查
    const issues = runAllChecks({ events: [], characters: [], worldSettings: [setting] });

    // Assert: 检测到设定无名错误
    expect(issues.some((i) => i.type === 'worldsetting-missing-key')).toBe(true);
    expect(issues.find((i) => i.type === 'worldsetting-missing-key')!.severity).toBe('error');
  });

  it('应检测到重复的设定 key', () => {
    // Arrange: 两个相同 key 的设定
    const settings: WorldSetting[] = [
      { id: 'w1', key: '世界观', value: 'A' } as WorldSetting,
      { id: 'w2', key: '世界观', value: 'B' } as WorldSetting,
    ];

    // Act: 运行检查
    const issues = runAllChecks({ events: [], characters: [], worldSettings: settings });

    // Assert: 检测到设定重复
    const dupIssue = issues.find((i) => i.type === 'worldsetting-duplicate-key');
    expect(dupIssue).toBeDefined();
    expect(dupIssue!.severity).toBe('warning');
  });

  it('正常数据不应返回任何问题', () => {
    // Arrange: 完全正确的数据
    const event = {
      id: 'e1',
      title: '正常事件',
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-01-02T00:00:00Z',
    } as unknown as TimelineEvent;
    const character: Character = { id: 'c1', name: '张三' } as Character;
    const setting: WorldSetting = { id: 'w1', key: '时代', value: '现代' } as WorldSetting;

    // Act: 运行检查
    const issues = runAllChecks({ events: [event], characters: [character], worldSettings: [setting] });

    // Assert: 无问题
    expect(issues).toHaveLength(0);
  });
});
