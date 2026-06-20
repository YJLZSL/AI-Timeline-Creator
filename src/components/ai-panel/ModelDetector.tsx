import { useState } from 'react';
import { TButton } from '@/components/ui-tdesign';
import { SearchIcon } from '@/lib/icons';
import { getAIConfig } from '@/lib/ai-config.js';
import { toast } from 'sonner';

interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
}

export function ModelDetector({ onModelsDetected }: { onModelsDetected: (models: ModelInfo[]) => void }) {
  const [isDetecting, setIsDetecting] = useState(false);

  const detectModels = async () => {
    const config = getAIConfig();
    if (!config?.apiKey) {
      toast.error('请先配置 API Key');
      return;
    }

    setIsDetecting(true);
    try {
      const response = await fetch('/api/ai/models', {
        headers: { 'x-api-key': config.apiKey },
      });
      if (response.ok) {
        const models = await response.json() as ModelInfo[];
        onModelsDetected(models);
        toast.success(`检测到 ${models.length} 个可用模型`);
      } else {
        toast.error('模型检测失败');
      }
    } catch {
      toast.error('网络错误，请检查 API 配置');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <TButton
      variant="outline"
      size="small"
      onClick={detectModels}
      loading={isDetecting}
    >
      <SearchIcon size={14} className="mr-1" />
      检测可用模型
    </TButton>
  );
}
