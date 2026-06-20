import { describe, it, expect } from 'vitest';
import { STORY_TEMPLATES, getStoryTemplate } from './story-templates';

describe('STORY_TEMPLATES', () => {
  it('应包含至少 5 个故事模板', () => {
    // Assert: 模板数组长度 >= 5
    expect(STORY_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it('每个模板应有 id、name、description、icon、tracks 和 events', () => {
    // Act & Assert: 验证每个模板结构完整
    for (const template of STORY_TEMPLATES) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.icon).toBeTruthy();
      expect(Array.isArray(template.tracks)).toBe(true);
      expect(template.tracks.length).toBeGreaterThan(0);
      expect(Array.isArray(template.events)).toBe(true);
      expect(template.events.length).toBeGreaterThan(0);
    }
  });

  it('每个 track 应有 name 和 color', () => {
    // Act & Assert: 验证所有 track 结构
    for (const template of STORY_TEMPLATES) {
      for (const track of template.tracks) {
        expect(track.name).toBeTruthy();
        expect(track.color).toMatch(/^#/);
      }
    }
  });

  it('每个 event 的 trackIndex 应在有效范围内', () => {
    // Act & Assert: 验证所有 event 的 trackIndex
    for (const template of STORY_TEMPLATES) {
      const maxIndex = template.tracks.length - 1;
      for (const event of template.events) {
        expect(event.trackIndex).toBeGreaterThanOrEqual(0);
        expect(event.trackIndex).toBeLessThanOrEqual(maxIndex);
        expect(event.title).toBeTruthy();
      }
    }
  });
});

describe('getStoryTemplate', () => {
  it('通过有效 id 应返回对应模板', () => {
    // Arrange: 获取第一个模板的 id
    const firstId = STORY_TEMPLATES[0].id;

    // Act: 查询模板
    const result = getStoryTemplate(firstId);

    // Assert: 返回正确的模板
    expect(result).toBeDefined();
    expect(result!.id).toBe(firstId);
  });

  it('通过无效 id 应返回 undefined', () => {
    // Act: 查询不存在的模板
    const result = getStoryTemplate('non-existent-template');

    // Assert: 返回 undefined
    expect(result).toBeUndefined();
  });

  it('hero-journey 模板应存在且包含 12 个事件', () => {
    // Act: 获取英雄之旅模板
    const result = getStoryTemplate('heros-journey');

    // Assert: 验证模板存在且包含 12 个事件
    expect(result).toBeDefined();
    expect(result!.events).toHaveLength(12);
  });
});
