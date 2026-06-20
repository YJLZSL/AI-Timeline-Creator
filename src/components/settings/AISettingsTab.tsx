import { useState, useEffect } from 'react';
import { TRadio, TRadioGroup, TInput } from '@/components/ui-tdesign';
import { getAIConfig, setAIConfig, type AIConfig } from '@/lib/ai-config';
import { cn } from '@/lib/utils';
import {
  DeepSeekIcon,
  KimiIcon,
  GLMIcon,
  MiniMaxIcon,
  SiliconFlowIcon,
  OpenAIIcon,
  CustomIcon,
} from '@/lib/ai-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const PROVIDER_OPTIONS: { value: AIConfig['provider']; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', icon: DeepSeekIcon, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'kimi', label: 'Kimi (Moonshot)', icon: KimiIcon, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'glm', label: '智谱 GLM', icon: GLMIcon, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { value: 'minimax', label: 'MiniMax', icon: MiniMaxIcon, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  { value: 'siliconflow', label: 'SiliconFlow', icon: SiliconFlowIcon, color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { value: 'openai', label: 'OpenAI', icon: OpenAIIcon, color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-900/20' },
  { value: 'custom', label: '自定义', icon: CustomIcon, color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PROVIDER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = config.provider === opt.value;
              return (
                <div
                  key={opt.value}
                  className={cn(
                    'cursor-pointer rounded-lg border transition-all duration-200 overflow-hidden',
                    isSelected
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/20 hover:bg-muted/30'
                  )}
                  onClick={() => handleProviderChange(opt.value)}
                >
                  <div className="p-3 flex items-center gap-3">
                    <TRadio value={opt.value} />
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                        opt.bgColor
                      )}
                    >
                      <Icon className={cn('size-4', opt.color)} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{opt.label}</span>
                    </div>
                  </div>
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
                <Tooltip key={m}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'min-w-[200px] cursor-pointer rounded-lg border transition-all duration-200',
                        config.model === m
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border hover:border-primary/20 hover:bg-muted/30'
                      )}
                      onClick={() => setConfig((prev) => ({ ...prev, model: m }))}
                    >
                      <div className="p-3 flex items-center gap-3">
                        <TRadio value={m} />
                        <span className="min-w-0 text-sm truncate">{m}</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{m}</p>
                  </TooltipContent>
                </Tooltip>
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
