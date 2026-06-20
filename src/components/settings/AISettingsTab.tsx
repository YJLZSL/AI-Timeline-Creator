import { useState, useEffect } from 'react';
import { TCard, TRadio, TRadioGroup, TInput } from '@/components/ui-tdesign';
import { getAIConfig, setAIConfig, type AIConfig } from '@/lib/ai-config';
import { cn } from '@/lib/utils';
import {
  SearchIcon,
  MoonIcon,
  BrainIcon,
  RobotIcon,
  SettingConfigIcon,
  MagicIcon,
  AnalysisIcon,
} from '@/lib/icons';

const PROVIDER_OPTIONS: { value: AIConfig['provider']; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', icon: SearchIcon, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
  { value: 'kimi', label: 'Kimi (Moonshot)', icon: MoonIcon, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' },
  { value: 'glm', label: '智谱 GLM', icon: BrainIcon, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
  { value: 'minimax', label: 'MiniMax', icon: MagicIcon, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' },
  { value: 'siliconflow', label: 'SiliconFlow', icon: AnalysisIcon, color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300' },
  { value: 'openai', label: 'OpenAI', icon: RobotIcon, color: 'bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300' },
  { value: 'custom', label: '自定义', icon: SettingConfigIcon, color: 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300' },
];

const PROVIDER_MODELS: Record<string, string[]> = {
  deepseek: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  kimi: ['kimi-k2.6', 'moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k'],
  glm: ['glm-4-flash', 'glm-4-plus', 'glm-4-long', 'glm-4-air'],
  minimax: ['MiniMax-M3', 'MiniMax-Text-01'],
  siliconflow: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct', 'THUDM/glm-4-9b-chat'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  custom: [],
};

const DEFAULT_BASE_URLS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com',
  kimi: 'https://api.moonshot.cn/v1',
  glm: 'https://open.bigmodel.cn/api/paas/v4/',
  minimax: 'https://api.minimax.io/v1',
  siliconflow: 'https://api.siliconflow.cn/v1',
  openai: 'https://api.openai.com/v1',
  custom: '',
};

function getInitialConfig(): AIConfig {
  const saved = getAIConfig();
  if (saved) return saved;
  return {
    provider: 'deepseek',
    apiKey: '',
    baseUrl: DEFAULT_BASE_URLS.deepseek,
    model: PROVIDER_MODELS.deepseek[0],
  };
}

export function AISettingsTab() {
  const [config, setConfig] = useState<AIConfig>(getInitialConfig);

  useEffect(() => {
    setAIConfig(config);
  }, [config]);

  const handleProviderChange = (provider: AIConfig['provider']) => {
    setConfig((prev) => {
      if (provider === 'custom') {
        return { ...prev, provider, baseUrl: '', model: '' };
      }
      return {
        ...prev,
        provider,
        baseUrl: DEFAULT_BASE_URLS[provider],
        model: PROVIDER_MODELS[provider][0] ?? '',
      };
    });
  };

  const models = config.provider === 'custom' ? [] : PROVIDER_MODELS[config.provider] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">默认 AI 提供商</label>
          <span className="text-xs text-muted-foreground">切换后会自动保存到本地配置</span>
        </div>
        <TRadioGroup
          value={config.provider}
          onChange={(v) => handleProviderChange(v as AIConfig['provider'])}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PROVIDER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <div key={opt.value} className="cursor-pointer" onClick={() => handleProviderChange(opt.value)}>
                  <TCard hoverShadow>
                    <div className="p-3 flex items-start gap-2">
                      <TRadio value={opt.value} />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', opt.color)}>
                            <Icon className="size-3.5" />
                          </span>
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                      </div>
                    </div>
                  </TCard>
                </div>
              );
            })}
          </div>
        </TRadioGroup>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium">默认模型</label>
        {config.provider === 'custom' ? (
          <TInput
            value={config.model}
            onChange={(v) => setConfig((prev) => ({ ...prev, model: v as string }))}
            placeholder="输入模型名称"
            className="max-w-md"
          />
        ) : (
          <TRadioGroup
            value={config.model}
            onChange={(v) => setConfig((prev) => ({ ...prev, model: v as string }))}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {models.map((m) => (
                <div key={m} className="cursor-pointer" onClick={() => setConfig((prev) => ({ ...prev, model: m }))}>
                  <TCard hoverShadow>
                    <div className="p-3 flex items-center gap-2">
                      <TRadio value={m} />
                      <span className="text-sm">{m}</span>
                    </div>
                  </TCard>
                </div>
              ))}
            </div>
          </TRadioGroup>
        )}
      </div>

      <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        API Key 与 Base URL 请在 AI 面板中的「AI 配置」里设置；此处仅保存默认提供商与模型偏好。
      </div>
    </div>
  );
}
