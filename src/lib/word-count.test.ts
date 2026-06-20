import { describe, it, expect } from 'vitest';
import { countCharacters, countWorkspaceWords } from './word-count';

describe('countCharacters', () => {
  it('空字符串应返回 0', () => {
    // Arrange: 空输入
    const text = '';

    // Act: 计数
    const result = countCharacters(text);

    // Assert: 返回 0
    expect(result).toBe(0);
  });

  it('null 和 undefined 应返回 0', () => {
    // Act & Assert: 对 null 和 undefined 返回 0
    expect(countCharacters(null)).toBe(0);
    expect(countCharacters(undefined)).toBe(0);
  });

  it('纯空白字符串应返回 0', () => {
    // Arrange: 纯空白输入
    const text = '   \t\n  ';

    // Act: 计数
    const result = countCharacters(text);

    // Assert: 返回 0（空白被排除）
    expect(result).toBe(0);
  });

  it('应正确统计中文字符数（不含空白）', () => {
    // Arrange: 中文文本
    const text = '这是一个测试';

    // Act: 计数
    const result = countCharacters(text);

    // Assert: 6 个中文字符
    expect(result).toBe(6);
  });

  it('应排除空白但保留英文和标点', () => {
    // Arrange: 混合文本
    const text = 'Hello 世界!  ';

    // Act: 计数
    const result = countCharacters(text);

    // Assert: 排除空白后：Hello世界! = 8 个字符
    expect(result).toBe(8);
  });
});

describe('countWorkspaceWords', () => {
  it('空数据应返回 0', () => {
    // Arrange: 空数据集
    const data = { events: [], characters: [], worldSettings: [] };

    // Act: 计数
    const result = countWorkspaceWords(data);

    // Assert: 返回 0
    expect(result).toBe(0);
  });

  it('应正确累加 events 的标题、摘要和描述字数', () => {
    // Arrange: 包含事件的数据
    const data = {
      events: [
        { title: '第一章', summary: '故事开始', description: '详细描述' },
      ],
      characters: [],
      worldSettings: [],
    };

    // Act: 计数
    const result = countWorkspaceWords(data);

    // Assert: 3 + 4 + 4 = 11
    expect(result).toBe(11);
  });

  it('应跳过 null 或 undefined 的字段', () => {
    // Arrange: 包含空字段的数据
    const data = {
      events: [
        { title: '事件', summary: null, description: undefined },
      ],
      characters: [],
      worldSettings: [],
    };

    // Act: 计数
    const result = countWorkspaceWords(data);

    // Assert: 只计算标题的 2 个字符
    expect(result).toBe(2);
  });

  it('应正确累加所有实体类型的字数', () => {
    // Arrange: 包含 events、characters、worldSettings 的数据
    const data = {
      events: [{ title: '标题', summary: '摘要', description: '描述' }],
      characters: [{ name: '角色名', description: '角色描述' }],
      worldSettings: [{ key: '设定键', value: '设定值', description: '设定描述' }],
    };

    // Act: 计数
    const result = countWorkspaceWords(data);

    // Assert: 2+2+2 + 3+4 + 3+3+4 = 23
    expect(result).toBe(23);
  });
});
