import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  SaveIcon,
  DeleteIcon,
  XIcon,
  TagIcon,
  FolderOpenIcon,
  PlusIcon,
} from '@/lib/icons';
import { TButton, TInput, TTextarea, TTag } from '@/components/ui-tdesign';
import { Dialog } from '@/components/ui-tdesign';
import { confirmDialog } from '@/components/_shared/ConfirmDialog';
import type { Note, NoteFolder, NoteTag } from '../../../shared/types';

/**
 * 笔记编辑器组件 Props
 */
interface NoteEditorProps {
  /** 当前编辑的笔记（null 表示新建） */
  note: Note | null;
  /** 文件夹列表（供选择） */
  folders: NoteFolder[];
  /** 标签列表（供选择） */
  tags: NoteTag[];
  /** 默认文件夹 ID */
  defaultFolderId?: string | null;
  /** 保存回调 */
  onSave: (data: {
    title: string;
    content: string;
    folderId: string | null;
    tagsJson: string;
  }) => void;
  /** 删除回调 */
  onDelete?: () => void | Promise<void>;
  /** 关闭回调 */
  onClose: () => void;
  /** 是否显示（弹窗模式） */
  open?: boolean;
  /** 加载状态 */
  isSaving?: boolean;
}

/**
 * 笔记编辑器组件
 *
 * 功能：提供笔记的标题编辑、内容编辑、标签选择、文件夹选择和保存/删除操作。
 * 支持弹窗模式和内联模式。内容区使用 textarea，富文本可后续迭代。
 */
export function NoteEditor({
  note,
  folders,
  tags,
  defaultFolderId,
  onSave,
  onDelete,
  onClose,
  open = true,
  isSaving = false,
}: NoteEditorProps) {
  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // 当笔记变化时初始化表单
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content ?? '');
      setSelectedFolderId(note.folderId ?? null);
      try {
        const parsed = JSON.parse(note.tagsJson ?? '[]') as string[];
        setSelectedTagNames(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSelectedTagNames([]);
      }
    } else {
      setTitle('');
      setContent('');
      setSelectedFolderId(defaultFolderId ?? null);
      setSelectedTagNames([]);
    }
  }, [note, defaultFolderId]);

  // 是否已修改（用于保存按钮启用判断）—— 当前未使用，保留逻辑供后续启用
  // const isModified = note
  //   ? title !== note.title || content !== (note.content ?? '') || selectedFolderId !== (note.folderId ?? null)
  //   : title.trim() !== '' || content.trim() !== '';

  // 切换标签选择
  const toggleTag = (tagName: string) => {
    setSelectedTagNames((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  // 添加新标签
  const handleAddNewTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (!selectedTagNames.includes(trimmed)) {
      setSelectedTagNames((prev) => [...prev, trimmed]);
    }
    setNewTagName('');
    setShowTagInput(false);
  };

  // 保存笔记
  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      folderId: selectedFolderId,
      tagsJson: JSON.stringify(selectedTagNames),
    });
  };

  // 删除确认
  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: '确认删除',
      description: '确定删除这篇笔记吗？此操作不可撤销。',
      variant: 'destructive',
    });
    if (!confirmed) return;
    onDelete?.();
  };

  // 编辑器内容区（复用于弹窗和内联）
  const editorContent = (
    <div className="flex flex-col gap-4">
      {/* 标题输入 */}
      <div>
        <TInput
          value={title}
          onChange={(v) => setTitle(v as string)}
          placeholder="笔记标题..."
          className={cn(
            'text-lg font-semibold',
            'border-transparent focus:border-primary/30',
            'bg-transparent px-0'
          )}
        />
      </div>

      {/* 元信息行：文件夹 + 标签 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 文件夹选择 */}
        <div className="flex items-center gap-1.5">
          <FolderOpenIcon size={13} className="text-muted-foreground" />
          <select
            value={selectedFolderId ?? ''}
            onChange={(e) => setSelectedFolderId(e.target.value || null)}
            className={cn(
              'text-xs bg-transparent border border-border/50 rounded-md px-2 py-1',
              'text-foreground focus:border-primary/50 outline-none',
              'cursor-pointer'
            )}
          >
            <option value="">根目录</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* 标签选择 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <TagIcon size={13} className="text-muted-foreground" />
          {selectedTagNames.map((tagName) => (
            <TTag
              key={tagName}
              theme="primary"
              variant="light"
              size="small"
              closable
              onClose={() => toggleTag(tagName)}
            >
              {tagName}
            </TTag>
          ))}
          {showTagInput ? (
            <div className="flex items-center gap-1">
              <TInput
                value={newTagName}
                onChange={(v) => setNewTagName(v as string)}
                placeholder="标签名"
                size="small"
                className="w-24"
                onEnter={handleAddNewTag}
              />
              <TButton theme="primary" size="small" onClick={handleAddNewTag}>
                <PlusIcon size={12} />
              </TButton>
            </div>
          ) : (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setShowTagInput(true)}
            >
              <PlusIcon size={10} />
              标签
            </button>
          )}
          {/* 已有标签快速选择 */}
          {tags
            .filter((t) => !selectedTagNames.includes(t.name))
            .slice(0, 5)
            .map((tag) => (
              <button
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </button>
            ))}
        </div>
      </div>

      {/* 内容编辑区 */}
      <div className="flex-1 min-h-[200px]">
        <TTextarea
          value={content}
          onChange={(v) => setContent(v as string)}
          placeholder="开始记录你的想法..."
          className={cn(
            'w-full h-full min-h-[200px] resize-none',
            'text-sm leading-relaxed',
            'border border-border/50 rounded-lg',
            'bg-muted/30 focus:bg-background',
            'p-3'
          )}
        />
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <div className="text-xs text-muted-foreground">
          {note ? (
            <span>上次更新：{new Date(note.updatedAt).toLocaleString('zh-CN')}</span>
          ) : (
            <span>新笔记</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDelete && note && (
            <TButton
              theme="danger"
              variant="outline"
              size="small"
              onClick={handleDelete}
              disabled={isSaving}
            >
              <DeleteIcon size={13} />
              删除
            </TButton>
          )}
          <TButton variant="outline" size="small" onClick={onClose} disabled={isSaving}>
            <XIcon size={13} />
            取消
          </TButton>
          <TButton
            theme="primary"
            size="small"
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
          >
            <SaveIcon size={13} />
            {isSaving ? '保存中...' : '保存'}
          </TButton>
        </div>
      </div>
    </div>
  );

  // 弹窗模式
  if (open !== undefined) {
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => !v && onClose()}
        header={note ? '编辑笔记' : '新建笔记'}
      >
        {editorContent}
      </Dialog>
    );
  }

  // 内联模式
  return <div className="flex flex-col h-full p-4">{editorContent}</div>;
}
