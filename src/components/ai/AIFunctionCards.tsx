import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChartHistogramIcon,
  IdeaIcon,
  EditIcon,
  TreeIcon,
} from '@/lib/icons';
import { TButton, TSelect } from '@/components/ui-tdesign';

/**
 * AI 功能场景类型
 */
export type AIFunctionScene = 'analysis' | 'inspiration' | 'revision' | 'structure';

/**
 * AI 功能卡片数据项
 */
interface AIFunctionCardData {
  id: AIFunctionScene;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  scenes: { label: string; value: string }[];
}

/**
 * 预设功能卡片数据
 */
const FUNCTION_CARDS: AIFunctionCardData[] = [
  {
    id: 'analysis',
    title: '内容分析',
    description: '分析故事结构、角色发展和情节节奏',
    icon: <ChartHistogramIcon size={32} theme="outline" strokeWidth={2} />,
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-500 dark:text-blue-400',
    scenes: [
      { label: '故事结构分析', value: 'story_structure' },
      { label: '角色弧光分析', value: 'character_arc' },
      { label: '情节节奏诊断', value: 'pacing_diagnosis' },
      { label: '冲突张力评估', value: 'conflict_assessment' },
    ],
  },
  {
    id: 'inspiration',
    title: '灵感启发',
    description: '基于设定生成创意灵感和情节建议',
    icon: <IdeaIcon size={32} theme="outline" strokeWidth={2} />,
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-500 dark:text-amber-400',
    scenes: [
      { label: '情节转折灵感', value: 'plot_twist' },
      { label: '角色互动创意', value: 'character_interaction' },
      { label: '世界观设定扩展', value: 'worldbuilding' },
      { label: '对话润色建议', value: 'dialogue_polish' },
    ],
  },
  {
    id: 'revision',
    title: '修改建议',
    description: '对文本进行润色、扩写、改写和优化',
    icon: <EditIcon size={32} theme="outline" strokeWidth={2} />,
    iconBg: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-500 dark:text-green-400',
    scenes: [
      { label: '文本润色', value: 'polish' },
      { label: '扩写补充', value: 'expand' },
      { label: '精简改写', value: 'condense' },
      { label: '风格调整', value: 'style_adjust' },
    ],
  },
  {
    id: 'structure',
    title: '结构化拆分',
    description: '将大纲拆分为章节、场景和叙事单元',
    icon: <TreeIcon size={32} theme="outline" strokeWidth={2} />,
    iconBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-500 dark:text-purple-400',
    scenes: [
      { label: '拆分为章节', value: 'split_chapters' },
      { label: '拆分为场景', value: 'split_scenes' },
      { label: '叙事节拍划分', value: 'beat_breakdown' },
      { label: '视角切换规划', value: 'pov_planning' },
    ],
  },
];

/**
 * AIFunctionCards Props
 */
export interface AIFunctionCardsProps {
  /** 选择场景后的回调 */
  onSelectScene?: (cardId: AIFunctionScene, sceneValue: string) => void;
  /** 点击卡片操作按钮的回调 */
  onActionClick?: (cardId: AIFunctionScene) => void;
  /** 额外类名 */
  className?: string;
}

/**
 * AI 场景化功能卡片组件
 *
 * 功能：展示 4 张 AI 功能卡片，每张卡片包含图标、标题、描述、
 * 一键操作按钮和场景选择下拉菜单。用于 AI 助手页面顶部功能区。
 */
export function AIFunctionCards({
  onSelectScene,
  onActionClick,
  className,
}: AIFunctionCardsProps) {
  // 记录每个卡片当前选中的场景值
  const [selectedScenes, setSelectedScenes] = useState<Record<string, string>>({
    analysis: 'story_structure',
    inspiration: 'plot_twist',
    revision: 'polish',
    structure: 'split_chapters',
  });

  /** 处理场景选择变化 */
  const handleSceneChange = (cardId: AIFunctionScene, value: string) => {
    setSelectedScenes((prev) => ({ ...prev, [cardId]: value }));
    onSelectScene?.(cardId, value);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* 顶部横幅 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          AI 创作助手
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          智能分析 · 创意生成 · 写作辅助
        </p>
      </div>

      {/* 功能卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FUNCTION_CARDS.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              'group relative flex flex-col',
              'bg-card rounded-xl border border-border/50',
              'shadow-sm hover:shadow-md',
              'transition-all duration-300',
              'hover:-translate-y-1',
              'p-5'
            )}
          >
            {/* 图标 */}
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                card.iconBg,
                card.iconColor,
                'mb-3'
              )}
            >
              {card.icon}
            </div>

            {/* 标题 */}
            <h3 className="text-base font-semibold text-foreground mb-1">
              {card.title}
            </h3>

            {/* 描述 */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
              {card.description}
            </p>

            {/* 操作区 */}
            <div className="flex flex-col gap-2">
              {/* 场景选择下拉 */}
              <TSelect
                value={selectedScenes[card.id]}
                onChange={(val) => handleSceneChange(card.id, String(val))}
                options={card.scenes}
                size="small"
                className="w-full"
              />

              {/* 选择场景按钮 */}
              <TButton
                variant="outline"
                size="small"
                className="w-full"
                onClick={() => onActionClick?.(card.id)}
              >
                选择场景
              </TButton>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AIFunctionCards;
