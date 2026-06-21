import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/_shared/PageHeader';
import { AIFunctionCards, type AIFunctionScene } from './AIFunctionCards';
import {
  RobotIcon,
  SendIcon,
  SettingIcon,
  HistoryIcon,
  DeleteIcon,
  DownloadIcon,
  UploadIcon,
  XIcon,
  CheckIcon,
  CautionIcon,
  UserIcon,
  ChevronDownIcon,
} from '@/lib/icons';
import { TButton, TTextarea } from '@/components/ui-tdesign';

/**
 * 对话消息类型
 */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * 模拟对话上下文信息
 */
interface ChatContext {
  workspaceName: string;
  selectedEvent?: string;
  selectedCharacter?: string;
}

/**
 * AI 助手主页面组件
 *
 * 功能：重构后的 AI 助手页面，包含功能卡片区、智能对话区、
 * 上下文显示、Tab 切换和工具栏。支持对话和创作两种模式。
 */
export function AIAssistantView() {
  // ─── 状态 ───
  const [activeTab, setActiveTab] = useState<'chat' | 'create'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的 AI 创作助手。\n\n我可以帮你：\n• 分析故事结构和角色发展\n• 生成创意灵感和情节建议\n• 润色和优化文本内容\n• 将大纲拆分为章节和场景\n\n请在下方输入你的问题，或从上方选择功能场景。',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context] = useState<ChatContext>({
    workspaceName: '当前工作区',
  });
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── 自动滚动到底部 ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── 发送消息 ───
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // 模拟 AI 响应（后续替换为真实 API 调用）
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '收到你的消息："' + text + '"\n\n这是一个模拟响应。在实际集成中，这里将调用后端 AI API（/api/ai）返回智能分析结果。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1200);
  }, [inputValue, isLoading]);

  // ─── 键盘事件：Enter 发送，Shift+Enter 换行 ───
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── 选择功能场景 ───
  const handleSelectScene = (_cardId: AIFunctionScene, sceneValue: string) => {
    const sceneMap: Record<string, string> = {
      story_structure: '请分析我的故事结构',
      character_arc: '请分析角色弧光',
      pacing_diagnosis: '请诊断情节节奏',
      conflict_assessment: '请评估冲突张力',
      plot_twist: '请给我一个情节转折灵感',
      character_interaction: '请生成角色互动创意',
      worldbuilding: '请扩展世界观设定',
      dialogue_polish: '请润色这段对话',
      polish: '请帮我润色这段文本',
      expand: '请帮我扩写这段内容',
      condense: '请帮我精简这段内容',
      style_adjust: '请调整这段文本的风格',
      split_chapters: '请将大纲拆分为章节',
      split_scenes: '请将大纲拆分为场景',
      beat_breakdown: '请进行叙事节拍划分',
      pov_planning: '请规划视角切换',
    };
    const prompt = sceneMap[sceneValue] || '请帮我处理以下内容';
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  // ─── 批量删除 ───
  const handleBatchDelete = () => {
    if (selectedMessages.size === 0) return;
    setMessages((prev) => prev.filter((m) => !selectedMessages.has(m.id)));
    setSelectedMessages(new Set());
    setIsBatchMode(false);
  };

  // ─── 导出对话 ───
  const handleExport = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── 导入对话 ───
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as ChatMessage[];
          if (Array.isArray(data)) {
            setMessages(data);
          }
        } catch {
          // 忽略解析错误
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ─── 切换消息选中 ───
  const toggleMessageSelect = (id: string) => {
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* 页面标题 */}
      <PageHeader
        title="AI 助手"
        subtitle="智能创作辅助与对话分析"
        icon={<RobotIcon size={20} />}
      />

      {/* 可滚动内容区 */}
      <div className="flex-1 overflow-auto">
        {/* 功能卡片区 */}
        <div className="px-6 pt-4 pb-2">
          <AIFunctionCards
            onSelectScene={handleSelectScene}
            onActionClick={(cardId) => {
              // 点击按钮时默认选择第一个场景
              const cardMap: Record<AIFunctionScene, string> = {
                analysis: 'story_structure',
                inspiration: 'plot_twist',
                revision: 'polish',
                structure: 'split_chapters',
              };
              handleSelectScene(cardId, cardMap[cardId]);
            }}
          />
        </div>

        {/* 对话区 */}
        <div className="px-6 pb-6">
          {/* 上下文栏 */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckIcon size={12} className="text-green-500" />
                {context.workspaceName}
              </span>
              {context.selectedEvent && (
                <span className="flex items-center gap-1">
                  · <span>事件: {context.selectedEvent}</span>
                </span>
              )}
            </div>
            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDownIcon
                size={12}
                className={cn('transition-transform', showContextPanel && 'rotate-180')}
              />
              上下文
            </button>
          </div>

          {/* 上下文展开面板 */}
          <AnimatePresence>
            {showContextPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-3"
              >
                <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">上下文设置</span>
                  </div>
                  <p>当前工作区、选中事件和角色信息将随对话发送给 AI。</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab 切换 */}
          <div className="mb-3">
            <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5 w-fit">
              {[
                { label: '对话', value: 'chat' },
                { label: '创作', value: 'create' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as 'chat' | 'create')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    activeTab === tab.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 工具栏 */}
          <div className="flex items-center justify-between mb-2 py-1.5 px-2 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-1">
              <TButton
                variant="text"
                size="small"
                className="text-xs gap-1"
                icon={<SettingIcon size={14} />}
              >
                API配置
              </TButton>
              <TButton
                variant="text"
                size="small"
                className="text-xs gap-1"
                icon={<HistoryIcon size={14} />}
              >
                最新
              </TButton>
            </div>
            <div className="flex items-center gap-1">
              {isBatchMode ? (
                <>
                  <span className="text-xs text-muted-foreground mr-1">
                    已选 {selectedMessages.size} 条
                  </span>
                  <TButton
                    variant="text"
                    size="small"
                    theme="danger"
                    className="text-xs gap-1"
                    onClick={handleBatchDelete}
                    icon={<DeleteIcon size={14} />}
                  >
                    删除
                  </TButton>
                  <TButton
                    variant="text"
                    size="small"
                    className="text-xs gap-1"
                    onClick={() => {
                      setIsBatchMode(false);
                      setSelectedMessages(new Set());
                    }}
                    icon={<XIcon size={14} />}
                  >
                    取消
                  </TButton>
                </>
              ) : (
                <>
                  <TButton
                    variant="text"
                    size="small"
                    className="text-xs gap-1"
                    onClick={() => setIsBatchMode(true)}
                    icon={<DeleteIcon size={14} />}
                  >
                    批量删除
                  </TButton>
                  <TButton
                    variant="text"
                    size="small"
                    className="text-xs gap-1"
                    onClick={handleExport}
                    icon={<DownloadIcon size={14} />}
                  >
                    导出
                  </TButton>
                  <TButton
                    variant="text"
                    size="small"
                    className="text-xs gap-1"
                    onClick={handleImport}
                    icon={<UploadIcon size={14} />}
                  >
                    导入
                  </TButton>
                </>
              )}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex flex-col gap-3 mb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* 头像 */}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      msg.role === 'user'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <UserIcon size={16} />
                    ) : (
                      <RobotIcon size={16} />
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div
                      className={cn(
                        'relative rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/80 text-foreground border border-border/50'
                      )}
                    >
                      {/* 批量选择复选框 */}
                      {isBatchMode && msg.role !== 'system' && (
                        <button
                          onClick={() => toggleMessageSelect(msg.id)}
                          className={cn(
                            'absolute -left-6 top-2 h-4 w-4 rounded border transition-colors',
                            selectedMessages.has(msg.id)
                              ? 'bg-primary border-primary'
                              : 'border-border bg-card'
                          )}
                        >
                          {selectedMessages.has(msg.id) && (
                            <CheckIcon size={12} className="text-primary-foreground" />
                          )}
                        </button>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {msg.timestamp.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 加载状态 */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400">
                  <RobotIcon size={16} />
                </div>
                <div className="bg-muted/80 border border-border/50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 创作模式提示 */}
          <AnimatePresence>
            {activeTab === 'create' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CautionIcon size={14} />
                    <span className="font-medium">创作模式</span>
                  </div>
                  <p>创作模式支持长文本生成，AI 将根据你的提示创作完整段落或章节内容。</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 输入框 */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm pt-2 pb-4">
            <div className="flex items-end gap-2 border border-border/60 rounded-xl bg-card p-2 shadow-sm focus-within:border-primary/50 transition-colors">
              <TTextarea
                ref={inputRef as any}
                value={inputValue}
                onChange={(val) => setInputValue(val)}
                onKeydown={handleKeyDown as any}
                placeholder={activeTab === 'chat' ? '输入消息...（Enter 发送，Shift+Enter 换行）' : '描述你想要创作的内容...'}
                className="flex-1 min-h-[48px] max-h-[160px] border-0 bg-transparent text-sm resize-none focus:ring-0 shadow-none px-2 py-1.5"
                autosize={{ minRows: 1, maxRows: 5 }}
              />
              <TButton
                variant="base"
                theme="primary"
                size="small"
                shape="circle"
                className="shrink-0 mb-0.5"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                icon={<SendIcon size={16} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistantView;
