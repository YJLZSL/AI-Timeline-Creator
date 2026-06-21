import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BookOpenIcon,
  SearchIcon,
  UndoIcon,
  RedoIcon,
  SettingIcon,
  SaveIcon,
  MoreIcon,
  FullScreenIcon,
  XIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
  RobotIcon,
  HistoryIcon,
  LinkIcon,
  UserIcon,
  GlobeIcon,
  FileTextIcon,
  PlusIcon,
  RightIcon,
  DownIcon,
  MagicIcon,
  SendIcon,
} from '@/lib/icons';
import { TButton, TInput, TTextarea } from '@/components/ui-tdesign';

/**
 * 章节数据项（使用 events 作为占位结构）
 */
interface ChapterItem {
  id: string;
  title: string;
  wordCount: number;
  children?: ChapterItem[];
  expanded?: boolean;
}

/**
 * 版本历史记录
 */
interface VersionRecord {
  id: string;
  timestamp: Date;
  wordCount: number;
  changeSummary: string;
}

/**
 * 关联数据项
 */
interface RelatedItem {
  id: string;
  type: 'event' | 'character' | 'world';
  title: string;
  summary?: string;
}

/**
 * 写作三栏布局页面组件
 *
 * 功能：完整的写作工作台，包含左侧章节目录、中间编辑器、
 * 右侧关联/版本/AI 面板，以及底部状态栏。
 */
export function WritingView() {
  // ─── 面板折叠状态 ───
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // ─── 章节数据（占位） ───
  const [chapters, setChapters] = useState<ChapterItem[]>([
    {
      id: 'vol1',
      title: '第一卷：启程',
      wordCount: 0,
      expanded: true,
      children: [
        { id: 'ch1', title: '第一章 初见', wordCount: 3240 },
        { id: 'ch2', title: '第二章 迷雾', wordCount: 2850 },
        { id: 'ch3', title: '第三章 抉择', wordCount: 4100 },
      ],
    },
    {
      id: 'vol2',
      title: '第二卷：暗流',
      wordCount: 0,
      expanded: false,
      children: [
        { id: 'ch4', title: '第四章 密谋', wordCount: 0 },
        { id: 'ch5', title: '第五章 交锋', wordCount: 0 },
      ],
    },
  ]);
  const [activeChapterId, setActiveChapterId] = useState('ch1');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── 编辑器状态 ───
  const [title, setTitle] = useState('第一章 初见');
  const [content, setContent] = useState(
    '这是一个占位文本内容。\n\n在实际使用时，这里将显示选中章节的正文内容。编辑器支持基本的文本输入，后续可迭代为富文本编辑器。\n\n三栏布局设计：\n- 左侧：章节目录与导航\n- 中间：编辑器主区域\n- 右侧：关联信息与辅助工具'
  );
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // ─── 右栏 Tab 状态 ───
  const [rightTab, setRightTab] = useState<'related' | 'history' | 'ai'>('related');

  // ─── 版本历史（占位） ───
  const [versions] = useState<VersionRecord[]>([
    { id: 'v1', timestamp: new Date(Date.now() - 86400000), wordCount: 3200, changeSummary: '初稿' },
    { id: 'v2', timestamp: new Date(Date.now() - 3600000), wordCount: 3240, changeSummary: '润色结尾段落' },
  ]);

  // ─── 关联数据（占位） ───
  const [relatedItems] = useState<RelatedItem[]>([
    { id: 'e1', type: 'event', title: '初次相遇', summary: '主角在酒馆遇到神秘陌生人' },
    { id: 'c1', type: 'character', title: '林默', summary: '本书主角，性格内敛的剑士' },
    { id: 'w1', type: 'world', title: '青石镇', summary: '故事起始地，位于帝国边境' },
  ]);

  // ─── AI 面板状态 ───
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // ─── 统计 ───
  const totalWords = chapters.reduce((sum, vol) => {
    const volWords = vol.children?.reduce((s, ch) => s + ch.wordCount, 0) ?? 0;
    return sum + volWords;
  }, 0);
  const currentWordCount = content.length; // 简化字符统计
  const targetWordCount = 5000;

  // ─── 保存防抖 ───
  useEffect(() => {
    if (saveStatus === 'saved') return;
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, saveStatus]);

  const handleContentChange = (val: string) => {
    setContent(val);
    setSaveStatus('unsaved');
  };

  // ─── 切换分卷展开 ───
  const toggleVolume = (volId: string) => {
    setChapters((prev) =>
      prev.map((vol) => (vol.id === volId ? { ...vol, expanded: !vol.expanded } : vol))
    );
  };

  // ─── 筛选章节 ───
  const filteredChapters = chapters
    .map((vol) => ({
      ...vol,
      children: vol.children?.filter((ch) => ch.title.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((vol) => vol.title.toLowerCase().includes(searchQuery.toLowerCase()) || (vol.children && vol.children.length > 0));

  // ─── 快捷 AI 发送 ───
  const handleAiSend = () => {
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user' as const, content: aiInput.trim() };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    // 模拟 AI 响应
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '已收到你的写作问题。作为 AI 助手，我可以帮你润色文本、扩展情节或分析角色。' },
      ]);
    }, 800);
  };

  // ─── 渲染关联图标 ───
  const getRelatedIcon = (type: RelatedItem['type']) => {
    switch (type) {
      case 'event':
        return <FileTextIcon size={14} />;
      case 'character':
        return <UserIcon size={14} />;
      case 'world':
        return <GlobeIcon size={14} />;
    }
  };

  const getRelatedColor = (type: RelatedItem['type']) => {
    switch (type) {
      case 'event':
        return 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400';
      case 'character':
        return 'bg-green-50 text-green-500 dark:bg-green-950/30 dark:text-green-400';
      case 'world':
        return 'bg-purple-50 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400';
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* ═══════════ 左栏：章节目录 ═══════════ */}
      <AnimatePresence initial={false}>
        {!leftCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-full flex-col border-r border-border/60 bg-card/50 overflow-hidden shrink-0"
          >
            {/* 左栏标题 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <BookOpenIcon size={18} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">章节目录</span>
              </div>
              <div className="flex items-center gap-1">
                <TButton variant="text" size="small" className="h-7 w-7 p-0" icon={<PlusIcon size={14} />} />
                <TButton
                  variant="text"
                  size="small"
                  className="h-7 w-7 p-0"
                  onClick={() => setLeftCollapsed(true)}
                  icon={<MenuFoldIcon size={14} />}
                />
              </div>
            </div>

            {/* 搜索框 */}
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <SearchIcon size={14} />
                </div>
                <TInput
                  value={searchQuery}
                  onChange={(val) => setSearchQuery(val ?? '')}
                  placeholder="搜索章节..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg bg-muted/40 border-transparent focus:border-primary/50"
                  clearable
                  onClear={() => setSearchQuery('')}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1 px-3 pb-2">
              <TButton variant="text" size="small" className="text-[11px] h-6">
                导入
              </TButton>
              <TButton variant="text" size="small" className="text-[11px] h-6">
                管理
              </TButton>
              <TButton variant="text" size="small" className="text-[11px] h-6">
                分卷
              </TButton>
            </div>

            {/* 字数统计 */}
            <div className="px-4 py-2 border-y border-border/30 bg-muted/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">全书字数</span>
                <span className="font-semibold tabular-nums text-foreground">{totalWords.toLocaleString()}</span>
              </div>
            </div>

            {/* 章节列表 */}
            <div className="flex-1 overflow-auto py-1">
              {filteredChapters.map((vol) => (
                <div key={vol.id}>
                  {/* 分卷标题 */}
                  <button
                    onClick={() => toggleVolume(vol.id)}
                    className="flex items-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    {vol.expanded ? <DownIcon size={12} /> : <RightIcon size={12} />}
                    <span className="truncate">{vol.title}</span>
                  </button>

                  {/* 章节项 */}
                  <AnimatePresence>
                    {vol.expanded && vol.children && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {vol.children.map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() => {
                              setActiveChapterId(ch.id);
                              setTitle(ch.title);
                              setSaveStatus('saved');
                            }}
                            className={cn(
                              'flex items-center justify-between w-full px-5 py-1.5 text-xs transition-colors',
                              activeChapterId === ch.id
                                ? 'bg-primary/8 text-primary font-medium'
                                : 'text-foreground hover:bg-muted/40'
                            )}
                          >
                            <span className="truncate">{ch.title}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-2">
                              {ch.wordCount > 0 ? ch.wordCount.toLocaleString() : ''}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 左栏折叠按钮（当左栏收起时显示） */}
      {leftCollapsed && (
        <button
          onClick={() => setLeftCollapsed(false)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-8 w-6 bg-card border border-border/60 rounded-r-md shadow-sm hover:bg-muted/80 transition-colors"
        >
          <MenuUnfoldIcon size={14} className="text-muted-foreground" />
        </button>
      )}

      {/* ═══════════ 中栏：编辑器 ═══════════ */}
      <main className="flex flex-1 flex-col min-w-0 bg-background">
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-card/30">
          <div className="flex items-center gap-1">
            <TButton variant="text" size="small" className="h-8 w-8 p-0" icon={<UndoIcon size={16} />} />
            <TButton variant="text" size="small" className="h-8 w-8 p-0" icon={<RedoIcon size={16} />} />
            <div className="w-px h-4 bg-border/60 mx-1" />
            <TButton variant="text" size="small" className="text-xs h-7 gap-1" icon={<SettingIcon size={14} />}>
              排版
            </TButton>
            <TButton variant="text" size="small" className="text-xs h-7 gap-1" icon={<SaveIcon size={14} />}>
              保存
            </TButton>
          </div>
          <div className="flex items-center gap-1">
            <TButton variant="text" size="small" className="h-8 w-8 p-0" icon={<MoreIcon size={16} />} />
            <TButton variant="text" size="small" className="h-8 w-8 p-0" icon={<FullScreenIcon size={16} />} />
          </div>
        </div>

        {/* 编辑器内容区 */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {/* 标题输入 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="章节标题..."
            className="w-full text-2xl font-bold bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50 mb-4 pb-2 border-b border-border/30 focus:border-primary/40 transition-colors"
          />

          {/* 富文本编辑器（使用 textarea 占位） */}
          <TTextarea
            ref={editorRef as any}
            value={content}
            onChange={(val) => handleContentChange(val)}
            placeholder="开始写作..."
            className="w-full min-h-[400px] text-base leading-relaxed bg-transparent border-0 shadow-none resize-none focus:ring-0 p-0"
            autosize={{ minRows: 15, maxRows: 40 }}
          />
        </div>

        {/* 底部字数统计 */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/40 bg-card/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>字数: <strong className="text-foreground tabular-nums">{currentWordCount}</strong></span>
            <span>字符: <strong className="text-foreground tabular-nums">{content.replace(/\s/g, '').length}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span>目标: <strong className="text-foreground tabular-nums">{targetWordCount.toLocaleString()}</strong></span>
            <span className="flex items-center gap-1">
              {saveStatus === 'saved' && (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                  已保存
                </>
              )}
              {saveStatus === 'saving' && '保存中...'}
              {saveStatus === 'unsaved' && '未保存'}
            </span>
          </div>
        </div>
      </main>

      {/* ═══════════ 右栏：关联/版本/AI ═══════════ */}
      <AnimatePresence initial={false}>
        {!rightCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-full flex-col border-l border-border/60 bg-card/50 overflow-hidden shrink-0"
          >
            {/* 右栏 Tab */}
            <div className="flex items-center justify-between px-2 py-2 border-b border-border/40">
              <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
                {[
                  { label: '关联', value: 'related', icon: <LinkIcon size={13} /> },
                  { label: '历史', value: 'history', icon: <HistoryIcon size={13} /> },
                  { label: 'AI', value: 'ai', icon: <RobotIcon size={13} /> },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setRightTab(tab.value as typeof rightTab)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all',
                      rightTab === tab.value
                        ? 'bg-card text-foreground shadow-sm font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <TButton
                variant="text"
                size="small"
                className="h-7 w-7 p-0"
                onClick={() => setRightCollapsed(true)}
                icon={<XIcon size={14} />}
              />
            </div>

            {/* 右栏内容 */}
            <div className="flex-1 overflow-auto p-3">
              <AnimatePresence mode="wait">
                {/* ─── 关联面板 ─── */}
                {rightTab === 'related' && (
                  <motion.div
                    key="related"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-2"
                  >
                    <p className="text-xs text-muted-foreground mb-1">当前章节关联内容</p>
                    {relatedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-card/80 p-2.5 hover:border-primary/30 transition-colors cursor-pointer"
                      >
                        <div
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                            getRelatedColor(item.type)
                          )}
                        >
                          {getRelatedIcon(item.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                          {item.summary && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <TButton
                      variant="text"
                      size="small"
                      className="text-xs gap-1 mt-1"
                      icon={<PlusIcon size={12} />}
                    >
                      添加关联
                    </TButton>
                  </motion.div>
                )}

                {/* ─── 版本历史面板 ─── */}
                {rightTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-2"
                  >
                    <p className="text-xs text-muted-foreground mb-1">保存历史版本</p>
                    {versions.map((ver, index) => (
                      <div
                        key={ver.id}
                        className="flex flex-col rounded-lg border border-border/40 bg-card/80 p-2.5 hover:border-primary/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">版本 {versions.length - index}</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {ver.wordCount.toLocaleString()} 字
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {ver.changeSummary}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 mt-1">
                          {ver.timestamp.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* ─── AI 助手面板 ─── */}
                {rightTab === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col h-full"
                  >
                    <p className="text-xs text-muted-foreground mb-2">快捷 AI 对话</p>

                    {/* 消息列表 */}
                    <div className="flex-1 flex flex-col gap-2 mb-2 min-h-[100px]">
                      {aiMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/30 mb-2">
                            <MagicIcon size={18} />
                          </div>
                          <p className="text-xs text-muted-foreground">AI 助手就绪</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[200px]">
                            输入问题，AI 将基于当前章节内容提供建议
                          </p>
                        </div>
                      )}
                      {aiMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            'rounded-lg px-2.5 py-1.5 text-xs leading-relaxed',
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-4'
                              : 'bg-muted/60 text-foreground border border-border/30 mr-4'
                          )}
                        >
                          {msg.content}
                        </div>
                      ))}
                    </div>

                    {/* 快捷操作 */}
                    {aiMessages.length === 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {['润色', '扩写', '总结', '续写'].map((quick) => (
                          <button
                            key={quick}
                            onClick={() => {
                              setAiInput(quick);
                            }}
                            className="px-2 py-1 rounded-md bg-muted/60 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/30"
                          >
                            {quick}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 输入区 */}
                    <div className="flex items-end gap-1.5 border border-border/60 rounded-lg bg-card p-1.5">
                      <TTextarea
                        value={aiInput}
                        onChange={(val) => setAiInput(val)}
                        placeholder="问 AI..."
                        className="flex-1 min-h-[32px] border-0 bg-transparent text-xs resize-none focus:ring-0 shadow-none p-1"
                        autosize={{ minRows: 1, maxRows: 3 }}
                        onKeydown={(_val, ctx) => {
                          if (ctx.e.key === 'Enter' && !ctx.e.shiftKey) {
                            ctx.e.preventDefault();
                            handleAiSend();
                          }
                        }}
                      />
                      <TButton
                        variant="base"
                        theme="primary"
                        size="small"
                        shape="circle"
                        className="shrink-0 h-6 w-6 p-0"
                        onClick={handleAiSend}
                        disabled={!aiInput.trim()}
                        icon={<SendIcon size={12} />}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 右栏展开按钮（当右栏收起时显示） */}
      {rightCollapsed && (
        <button
          onClick={() => setRightCollapsed(false)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-8 w-6 bg-card border border-border/60 rounded-l-md shadow-sm hover:bg-muted/80 transition-colors"
        >
          <MenuUnfoldIcon size={14} className="text-muted-foreground rotate-180" />
        </button>
      )}

      {/* ═══════════ 底部状态栏 ═══════════ */}
      <div className="absolute bottom-0 left-0 right-0 h-7 bg-background border-t border-border/40 flex items-center justify-between px-3 text-[11px] text-muted-foreground z-20">
        <div className="flex items-center gap-3">
          <span className="tabular-nums">字数: {currentWordCount}</span>
          <span className="tabular-nums">字符: {content.replace(/\s/g, '').length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>目标: {targetWordCount.toLocaleString()}</span>
          <span className="flex items-center gap-1.5">
            {saveStatus === 'saved' && (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                已保存
              </>
            )}
            {saveStatus === 'saving' && '保存中...'}
            {saveStatus === 'unsaved' && '未保存'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WritingView;
