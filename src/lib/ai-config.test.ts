import { describe, it, expect, beforeEach } from 'vitest';
import { getAIConfig, setAIConfig, hasAIConfig } from './ai-config';

describe('AI Config', () => {
  beforeEach(() => {
    // Arrange: 每次测试前清空 localStorage
    localStorage.clear();
  });

  it('getAIConfig 在无数据时应返回 null', () => {
    // Act: 获取配置
    const result = getAIConfig();

    // Assert: 返回 null
    expect(result).toBeNull();
  });

  it('setAIConfig 应保存配置到 localStorage', () => {
    // Arrange: 配置对象
    const config = {
      provider: 'siliconflow' as const,
      apiKey: 'sk-test-key',
      baseUrl: 'https://api.example.com',
      model: 'test-model',
    };

    // Act: 保存配置
    setAIConfig(config);

    // Assert: 从 localStorage 读取验证
    const raw = localStorage.getItem('ai-config');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual(config);
  });

  it('getAIConfig 应读取已保存的配置', () => {
    // Arrange: 保存配置
    const config = {
      provider: 'openai' as const,
      apiKey: 'sk-key',
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4',
    };
    localStorage.setItem('ai-config', JSON.stringify(config));

    // Act: 读取配置
    const result = getAIConfig();

    // Assert: 返回正确配置
    expect(result).toEqual(config);
  });

  it('getAIConfig 对无效 JSON 应返回 null', () => {
    // Arrange: 写入无效 JSON
    localStorage.setItem('ai-config', 'not-json');

    // Act: 读取配置
    const result = getAIConfig();

    // Assert: 返回 null
    expect(result).toBeNull();
  });

  it('hasAIConfig 在无 apiKey 时应返回 false', () => {
    // Arrange: 保存无 apiKey 的配置
    const config = {
      provider: 'openai' as const,
      apiKey: '',
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4',
    };
    setAIConfig(config);

    // Act: 检查是否有配置
    const result = hasAIConfig();

    // Assert: 返回 false
    expect(result).toBe(false);
  });

  it('hasAIConfig 在有 apiKey 时应返回 true', () => {
    // Arrange: 保存有 apiKey 的配置
    const config = {
      provider: 'openai' as const,
      apiKey: 'sk-valid-key',
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4',
    };
    setAIConfig(config);

    // Act: 检查是否有配置
    const result = hasAIConfig();

    // Assert: 返回 true
    expect(result).toBe(true);
  });
});
