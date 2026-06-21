import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BookOpenIcon,
  PlusIcon,
  FolderOpenIcon,
  FileTextIcon,
  EditIcon,
  DeleteIcon,
  UploadIcon,
} from '@/lib/icons';
import { PageHeader } from '@/components/_shared/PageHeader';
import { SearchBar } from '@/components/_shared/SearchBar';
import { StatsBar, createDefaultViewOptions } from '@/components/_shared/StatsBar';
import { EmptyState } from '@/components/_shared/EmptyState';
import { TButton, TTextarea } from '@/components/ui-tdesign';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useNoteFolders,
  useCreateNoteFolder,
  useDeleteNoteFolder,
  useNoteTags,
} from '@/services/api-hooks';
import { FolderTree } from './FolderTree';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../../../shared/types';
import { toast } from 'sonner';

/** 视图模式：网格 / 列表 */
type ViewMode = 'grid' | 'list';

/** 左栏折叠宽度 */
const SIDEBAR_WIDTH = 240;

/**
 * 资料库主页面组件
 *
 * 布局：
 * - 左栏（可折叠）：快速记录、标签筛选、文件夹树、统计信息
 * - 中间内容区：PageHeader + SearchBar + StatsBar + 笔记列表
 *
 * 功能：笔记的查看、搜索、筛选、创建、编辑和删除。
 */
export function NotebookView() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);

  // ─── 查询 Hooks ───
  const { data: notesData, isLoading: notesLoading } = useNotes(workspaceId);
  const { data: folders } = useNoteFolders(workspaceId);
  const { data: tags } = useNoteTags(workspaceId);

  // ─── 变更 Hooks ───
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createFolder = useCreateNoteFolder();
  const deleteFolder = useDeleteNoteFolder();

  // ─── 本地状态 ───
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  // 笔记列表（带筛选）
  const filteredNotes = useMemo(() => {
    const items = notesData?.items ?? [];
    return items.filter((note) => {
      // 文件夹筛选
      if (selectedFolderId !== null && note.folderId !== selectedFolderId) {
        return false;
      }
      // 标签筛选
      if (selectedTagFilter) {
        try {
          const noteTags = JSON.parse(note.tagsJson ?? '[]') as string[];
          if (!noteTags.includes(selectedTagFilter)) return false;
        } catch {
          return false;
        }
      }
      // 搜索筛选
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = (note.content ?? '').toLowerCase().includes(q);
        if (!titleMatch && !contentMatch) return false;
      }
      return true;
    });
  }, [notesData, selectedFolderId, selectedTagFilter, searchQuery]);

  // 统计信息
  const totalNotes = notesData?.items?.length ?? 0;
  const totalFolders = folders?.length ?? 0;
  const totalTags = tags?.length ?? 0;
  const todayNew = useMemo(() => {
    const today = new Date().toDateString();
    return (notesData?.items ?? []).filter((n) => new Date(n.createdAt).toDateString() === today).length;
  }, [notesData]);

  // ─── 事件处理 ───

  /** 快速记录（Ctrl+Enter） */
  const handleQuickSave = useCallback(() => {
    if (!workspaceId || !quickNoteContent.trim()) return;
    createNote.mutate(
      {
        workspaceId,
        data: {
          title: quickNoteContent.trim().slice(0, 30) + (quickNoteContent.length > 30 ? '...' : ''),
          content: quickNoteContent.trim(),
          folderId: selectedFolderId,
          tagsJson: selectedTagFilter ? JSON.stringify([selectedTagFilter]) : '[]',
        },
      },
      {
        onSuccess: () => {
          toast.success('快速记录已保存');
          setQuickNoteContent('');
        },
        onError: (err) => toast.error(`保存失败: ${err.message}`),
      }
    );
  }, [workspaceId, quickNoteContent, selectedFolderId, selectedTagFilter, createNote]);

  /** 新建笔记 */
  const handleCreateNote = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  /** 编辑笔记 */
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  /** 保存笔记（新建/更新） */
  const handleSaveNote = (data: {
    title: string;
    content: string;
    folderId: string | null;
    tagsJson: string;
  }) => {
    if (!workspaceId) return;

    if (editingNote) {
      updateNote.mutate(
        { workspaceId, noteId: editingNote.id, data },
        {
          onSuccess: () => {
            toast.success('笔记已更新');
            setEditorOpen(false);
          },
          onError: (err) => toast.error(`更新失败: ${err.message}`),
        }
      );
    } else {
      createNote.mutate(
        { workspaceId, data },
        {
          onSuccess: () => {
            toast.success('笔记已创建');
            setEditorOpen(false);
          },
          onError: (err) => toast.error(`创建失败: ${err.message}`),
        }
      );
    }
  };

  /** 删除笔记 */
  const handleDeleteNote = (note: Note) => {
    if (!workspaceId) return;
    if (!confirm(`确定删除笔记「${note.title}」吗？`)) return;
    deleteNote.mutate(
      { workspaceId, noteId: note.id },
      {
        onSuccess: () => toast.success('笔记已删除'),
        onError: (err) => toast.error(`删除失败: ${err.message}`),
      }
    );
  };

  /** 创建文件夹 */
  const handleCreateFolder = (name: string, parentId?: string | null) => {
    if (!workspaceId) return;
    createFolder.mutate(
      { workspaceId, data: { name, parentId: parentId ?? null } },
      {
        onSuccess: () => toast.success('文件夹已创建'),
        onError: (err) => toast.error(`创建失败: ${err.message}`),
      }
    );
  };

  /** 删除文件夹 */
  const handleDeleteFolder = (folderId: string) => {
    if (!workspaceId) return;
    deleteFolder.mutate(
      { workspaceId, folderId },
      {
        onSuccess: () => {
          toast.success('文件夹已删除');
          if (selectedFolderId === folderId) setSelectedFolderId(null);
        },
        onError: (err) => toast.error(`删除失败: ${err.message}`),
      }
    );
  };

  /** 解析笔记标签 */
  const parseTags = (tagsJson: string | null): string[] => {
    try {
      const parsed = JSON.parse(tagsJson ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  /** 内容预览（截取前 80 字） */
  const getPreview = (content: string | null) => {
    if (!content) return '暂无内容';
    return content.length > 80 ? content.slice(0, 80) + '...' : content;
  };

  /** 格式化时间 */
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ═══════ 左栏 ═══════ */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: SIDEBAR_WIDTH, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 border-r border-border/40 bg-card/30 flex flex-col overflow-hidden"
          >
            {/* 快速记录区域 */}
            <div className="p-3 border-b border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">快速记录</span>
              </div>
              <TTextarea
                value={quickNoteContent}
                onChange={(v) => setQuickNoteContent(v as string)}
                placeholder="记录灵感...（Ctrl+Enter 保存）"
                className={cn(
                  'text-xs min-h-[60px] resize-none',
                  'border border-border/50 rounded-lg bg-muted/30',
                  'p-2 focus:border-primary/50'
                )}
                onKeydown={(_value: string, context: { e: React.KeyboardEvent<HTMLTextAreaElement> }) => {
                  if (context.e.ctrlKey && context.e.key === 'Enter') {
                    context.e.preventDefault();
                    handleQuickSave();
                  }
                }}
              />
              <div className="flex justify-end mt-1.5">
                <TButton
                  theme="primary"
                  size="small"
                  className="text-xs"
                  disabled={!quickNoteContent.trim() || createNote.isPending}
                  onClick={handleQuickSave}
                >
                  <PlusIcon size={12} />
                  保存
                </TButton>
              </div>
            </div>

            {/* 标签筛选 */}
            {tags && tags.length > 0 && (
              <div className="p-3 border-b border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">标签</span>
                  <span className="text-[10px] text-muted-foreground/60">{totalTags}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() =>
                        setSelectedTagFilter((prev) => (prev === tag.name ? null : tag.name))
                      }
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[11px] transition-all',
                        selectedTagFilter === tag.name
                          ? 'bg-primary/15 text-primary border border-primary/30 font-medium'
                          : 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-accent/40'
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 文件夹树 */}
            <div className="flex-1 overflow-hidden min-h-0">
              <FolderTree
                folders={folders ?? []}
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            </div>

            {/* 统计信息 */}
            <div className="p-3 border-t border-border/30">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="text-sm font-semibold text-foreground">{totalNotes}</div>
                  <div className="text-[10px] text-muted-foreground">笔记</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">{todayNew}</div>
                  <div className="text-[10px] text-muted-foreground">今日</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="text-sm font-semibold text-foreground">{totalFolders}</div>
                  <div className="text-[10px] text-muted-foreground">文件夹</div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══════ 中间内容区 ═══════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 页面标题 */}
        <PageHeader
          title="资料库"
          subtitle="管理笔记、文件夹和灵感记录"
          icon={<BookOpenIcon size={20} />}
          action={
            <div className="flex items-center gap-2">
              <TButton
                theme="primary"
                size="small"
                onClick={handleCreateNote}
                disabled={!workspaceId}
              >
                <PlusIcon size={14} />
                新建笔记
              </TButton>
              <TButton
                variant="outline"
                size="small"
                onClick={() => {
                  /* 导入功能占位 */
                  toast.info('导入功能开发中');
                }}
              >
                <UploadIcon size={14} />
                导入
              </TButton>
              {/* 左栏折叠按钮 */}
              <TButton
                variant="outline"
                size="small"
                className="px-2"
                onClick={() => setSidebarCollapsed((c) => !c)}
                title={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
              >
                {sidebarCollapsed ? '→' : '←'}
              </TButton>
            </div>
          }
        />

        {/* 搜索栏 */}
        <SearchBar
          placeholder="搜索笔记标题或内容..."
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={setSearchQuery}
        />

        {/* 统计栏 */}
        <StatsBar
          stats={[
            { label: '笔记', value: totalNotes, color: 'blue' },
            { label: '文件夹', value: totalFolders, color: 'amber' },
            { label: '标签', value: totalTags, color: 'purple' },
          ]}
          viewToggle={{
            options: createDefaultViewOptions(),
            active: viewMode,
            onChange: (v) => setViewMode(v as ViewMode),
          }}
          tools={[
            {
              label: '新建文件夹',
              icon: <FolderOpenIcon size={14} />,
              onClick: () => {
                /* 触发表单树的新建 */
                toast.info('请使用左侧文件夹树的「+」按钮');
              },
              variant: 'secondary',
            },
          ]}
        />

        {/* 笔记列表区域 */}
        <div className="flex-1 overflow-auto p-4">
          {notesLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-sm text-muted-foreground">加载笔记...</div>
            </div>
          )}

          {!notesLoading && filteredNotes.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={<FileTextIcon size={32} />}
                title={searchQuery ? '没有找到匹配的笔记' : '暂无笔记'}
                description={
                  searchQuery
                    ? '尝试使用其他关键词或清除筛选条件'
                    : '创建第一篇笔记来开始记录你的灵感吧'
                }
                action={
                  <TButton theme="primary" size="small" onClick={handleCreateNote}>
                    <PlusIcon size={14} />
                    新建笔记
                  </TButton>
                }
                size="md"
              />
            </div>
          )}

          {!notesLoading && filteredNotes.length > 0 && (
            <>
              {/* 网格视图 */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'group flex flex-col gap-2 p-4 rounded-xl border border-border/50',
                        'bg-card/60 hover:bg-card hover:border-primary/20',
                        'cursor-pointer transition-all shadow-sm hover:shadow-md'
                      )}
                      onClick={() => handleEditNote(note)}
                    >
                      {/* 标题 */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground leading-tight truncate">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note);
                            }}
                          >
                            <EditIcon size={12} />
                          </button>
                          <button
                            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note);
                            }}
                          >
                            <DeleteIcon size={12} />
                          </button>
                        </div>
                      </div>

                      {/* 内容预览 */}
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {getPreview(note.content)}
                      </p>

                      {/* 标签 + 时间 */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {parseTags(note.tagsJson).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 shrink-0">
                          {formatTime(note.updatedAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 列表视图 */}
              {viewMode === 'list' && (
                <div className="flex flex-col gap-1">
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-lg',
                        'border border-border/30 hover:border-primary/20',
                        'bg-card/40 hover:bg-card/80 cursor-pointer transition-all'
                      )}
                      onClick={() => handleEditNote(note)}
                    >
                      <FileTextIcon size={16} className="text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{note.title}</span>
                          <div className="flex flex-wrap gap-1">
                            {parseTags(note.tagsJson).slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {getPreview(note.content)}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground/60 shrink-0">
                        {formatTime(note.updatedAt)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(note);
                          }}
                        >
                          <EditIcon size={12} />
                        </button>
                        <button
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note);
                          }}
                        >
                          <DeleteIcon size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════ 笔记编辑器弹窗 ═══════ */}
      <NoteEditor
        note={editingNote}
        folders={folders ?? []}
        tags={tags ?? []}
        defaultFolderId={selectedFolderId}
        open={editorOpen}
        onSave={handleSaveNote}
        onDelete={
          editingNote
            ? () => {
                handleDeleteNote(editingNote);
                setEditorOpen(false);
              }
            : undefined
        }
        onClose={() => setEditorOpen(false)}
        isSaving={createNote.isPending || updateNote.isPending}
      />
    </div>
  );
}
