import pino from 'pino';
import type { AIChatRequest, AIChatResponse } from '../../shared/types.js';

const aiLog = pino({ name: 'ai-proxy' });

export type AIProvider = 'siliconflow' | 'openai' | 'deepseek' | 'kimi' | 'minimax' | 'glm' | 'custom';

interface AIProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const PROVIDER_DEFAULTS: Record<AIProvider, { baseUrl: string; model: string; envKey: string; envUrl: string }> = {
  siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V3',
    envKey: 'SILICONFLOW_API_KEY',
    envUrl: 'SILICONFLOW_BASE_URL',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    envKey: 'OPENAI_API_KEY',
    envUrl: 'OPENAI_BASE_URL',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    envKey: 'DEEPSEEK_API_KEY',
    envUrl: 'DEEPSEEK_BASE_URL',
  },
  kimi: {
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    envKey: 'KIMI_API_KEY',
    envUrl: 'KIMI_BASE_URL',
  },
  minimax: {
    baseUrl: 'https://api.minimax.chat/v1',
    model: 'abab6.5-chat',
    envKey: 'MINIMAX_API_KEY',
    envUrl: 'MINIMAX_BASE_URL',
  },
  glm: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4',
    envKey: 'GLM_API_KEY',
    envUrl: 'GLM_BASE_URL',
  },
  custom: {
    baseUrl: '',
    model: '',
    envKey: 'CUSTOM_API_KEY',
    envUrl: 'CUSTOM_BASE_URL',
  },
};

/** 获取 AI 提供商配置 */
function getProviderConfig(provider: AIProvider, apiKey?: string, baseUrl?: string, model?: string): AIProviderConfig {
  const defaults = PROVIDER_DEFAULTS[provider];
  const key = apiKey || process.env[defaults.envKey] || '';
  const url = baseUrl || process.env[defaults.envUrl] || defaults.baseUrl;
  const mdl = model || defaults.model;
  return { apiKey: key, baseUrl: url, model: mdl };
}

/** 检查是否有可用的 API Key */
export function hasApiKey(provider: AIProvider, apiKey?: string): boolean {
  const config = getProviderConfig(provider, apiKey);
  return config.apiKey.length > 0;
}

/** 测试 AI 连接 */
export async function testConnection(provider: AIProvider, apiKey?: string, baseUrl?: string, model?: string): Promise<{ success: boolean; message: string }> {
  const config = getProviderConfig(provider, apiKey, baseUrl, model);

  if (!config.apiKey) {
    return { success: false, message: '未配置 API Key' };
  }

  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return { success: true, message: `连接成功 (${config.model})` };
    }
    return { success: false, message: `连接失败: ${response.status} ${response.statusText}` };
  } catch (err) {
    return { success: false, message: `连接失败: ${err instanceof Error ? err.message : '未知错误'}` };
  }
}

/** 获取可用模型列表 */
export async function listModels(provider: AIProvider, apiKey?: string, baseUrl?: string): Promise<{ id: string; name: string }[]> {
  const config = getProviderConfig(provider, apiKey, baseUrl);
  if (!config.apiKey) return [];

  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = await response.json() as { data?: Array<{ id: string }> };
    return (data.data || []).map((m) => ({ id: m.id, name: m.id }));
  } catch (err) {
    aiLog.error({ err, provider }, 'listModels failed');
    return [];
  }
}

/** 模拟 AI 响应（无 API Key 时使用） */
function getSimulatedResponse(messages: Array<{ role: string; content: string }>): string {
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content || '';

  const responses: Record<string, string> = {
    '续写': '夜色渐浓，远处的灯火在雾气中若隐若现。他站在窗前，手指无意识地敲击着窗框，思绪却早已飘向了那个被他刻意遗忘的下午。那天的雨，比今天更大……',
    '润色': '经过润色后的文字更加流畅优美，节奏感更强，意象更加丰满。建议在关键转折处增加更多感官描写，让读者能够身临其境地感受场景的变化。',
    '翻译': 'The night grew darker, and distant lights flickered faintly through the mist. He stood by the window, his fingers unconsciously tapping the frame, while his thoughts had already drifted to that afternoon he had deliberately forgotten.',
    '总结': '这段内容主要围绕三个核心要素展开：1) 时间线的推进与事件之间的因果关系；2) 角色动机与行为的一致性；3) 场景氛围与叙事节奏的协调。建议重点关注伏笔的埋设与回收。',
    '创意': '可以考虑以下创意方向：\n1. **时间倒流**：从结局开始叙述，逐步揭示事件真相\n2. **双线叙事**：两条时间线并行推进，最终交汇\n3. **视角切换**：同一事件从不同角色视角呈现\n4. **象征暗示**：通过环境描写暗示人物命运',
    '代码': '```javascript\n// 时间轴事件排序算法\nfunction sortEventsByTime(events) {\n  return events.sort((a, b) => a.startTime - b.startTime);\n}\n```',
  };

  // 根据内容匹配响应类型
  for (const [key, value] of Object.entries(responses)) {
    if (content.includes(key)) {
      return value;
    }
  }

  return '这是一个模拟响应。配置 API Key 后可获得真实的 AI 回复。\n\n当前您可以使用以下功能：续写、润色、翻译、总结、创意、代码。请在消息中包含对应关键词即可获得模拟回复。';
}

/** 发送 AI 聊天请求（非流式） */
export async function chatCompletion(request: AIChatRequest): Promise<AIChatResponse> {
  const provider = (request.provider || 'siliconflow') as AIProvider;
  const config = getProviderConfig(provider, request.apiKey, undefined, request.model);

  // 无 API Key 时返回模拟响应
  if (!config.apiKey) {
    return {
      content: getSimulatedResponse(request.messages),
      model: 'simulated',
      provider: 'simulated',
    };
  }

  const model = request.model || config.model;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; model?: string };
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || model,
      provider,
    };
  } catch (err) {
    // API 调用失败时降级到模拟模式
    aiLog.error({ err }, 'API call failed, falling back to simulation');
    return {
      content: getSimulatedResponse(request.messages),
      model: 'simulated (API error)',
      provider: 'simulated',
    };
  }
}

/** 发送 AI 聊天请求（流式 SSE） */
export async function* chatCompletionStream(request: AIChatRequest): AsyncGenerator<string> {
  const provider = (request.provider || 'siliconflow') as AIProvider;
  const config = getProviderConfig(provider, request.apiKey, undefined, request.model);

  // 无 API Key 时模拟流式响应
  if (!config.apiKey) {
    const fullResponse = getSimulatedResponse(request.messages);
    const chunks = fullResponse.split('');
    for (let i = 0; i < chunks.length; i++) {
      yield chunks[i];
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    return;
  }

  const model = request.model || config.model;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: true,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(trimmed.slice(6));
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  } catch (err) {
    // 流式 API 失败时降级到模拟流式响应
    aiLog.error({ err }, 'Stream API failed, falling back to simulation');
    yield JSON.stringify({ degraded: true, error: err instanceof Error ? err.message : String(err) });
    const fullResponse = getSimulatedResponse(request.messages);
    const chunks = fullResponse.split('');
    for (let i = 0; i < chunks.length; i++) {
      yield chunks[i];
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
}
