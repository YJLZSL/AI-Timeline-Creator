import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  FolderOpenIcon,
  PlusIcon,
  DeleteIcon,
  RightIcon,
  DownIcon,
  FileTextIcon,
} from '@/lib/icons';
import { TButton, TInput } from '@/components/ui-tdesign';
import { Dialog } from '@/components/ui-tdesign';
import type { NoteFolder } from '../../../shared/types';

/**
 * 文件夹树组件 Props
 */
interface FolderTreeProps {
  /** 文件夹列表 */
  folders: NoteFolder[];
  /** 当前选中的文件夹 ID */
  selectedFolderId: string | null;
  /** 文件夹选择回调 */
  onSelectFolder: (folderId: string | null) => void;
  /** 创建文件夹回调 */
  onCreateFolder: (name: string, parentId?: string | null) => void;
  /** 删除文件夹回调 */
  onDeleteFolder: (folderId: string) => void;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 文件夹树组件
 *
 * 功能：展示可展开/折叠的文件夹目录树，支持点击筛选笔记、右键菜单（新建/删除）。
 * 根目录为「全部笔记」，点击后取消文件夹筛选。
 */
export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  collapsible = true,
  className,
}: FolderTreeProps) {
  // 展开的文件夹 ID 集合
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // 新建文件夹对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  // 右键菜单状态（简化：使用点击按钮触发）
  const [_contextMenuFolderId, setContextMenuFolderId] = useState<string | null>(null);

  // 切换展开状态
  const toggleExpand = useCallback((folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // 构建文件夹树结构（按 parentId 分组）
  const rootFolders = folders.filter((f) => f.parentId === null);
  const childFoldersMap = new Map<string, NoteFolder[]>();
  folders.forEach((f) => {
    if (f.parentId) {
      const siblings = childFoldersMap.get(f.parentId) ?? [];
      siblings.push(f);
      childFoldersMap.set(f.parentId, siblings);
    }
  });

  // 打开新建文件夹对话框
  const openCreateDialog = (parentId?: string | null) => {
    setParentFolderId(parentId ?? null);
    setNewFolderName('');
    setCreateDialogOpen(true);
  };

  // 确认创建文件夹
  const handleCreateConfirm = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), parentFolderId);
    setCreateDialogOpen(false);
    setNewFolderName('');
  };

  // 确认删除文件夹
  const handleDelete = (folderId: string) => {
    if (confirm('确定删除此文件夹吗？文件夹内的笔记将移至根目录。')) {
      onDeleteFolder(folderId);
    }
    setContextMenuFolderId(null);
  };

  // 递归渲染文件夹节点
  const renderFolderNode = (folder: NoteFolder, depth = 0) => {
    const isExpanded = expandedIds.has(folder.id);
    const children = childFoldersMap.get(folder.id) ?? [];
    const hasChildren = children.length > 0;
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'group flex items-center gap-1 rounded-lg px-2 py-1.5 cursor-pointer transition-colors',
            isSelected
              ? 'bg-primary/10 text-primary'
              : 'text-foreground hover:bg-accent/40'
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          {/* 展开/折叠按钮 */}
          {hasChildren && collapsible ? (
            <button
              className="shrink-0 flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
            >
              {isExpanded ? <DownIcon size={12} /> : <RightIcon size={12} />}
            </button>
          ) : (
            <span className="shrink-0 w-4" />
          )}

          {/* 文件夹图标 */}
          <FolderOpenIcon
            size={14}
            className={cn('shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')}
          />

          {/* 文件夹名称 */}
          <span className="flex-1 truncate text-sm">{folder.name}</span>

          {/* 操作按钮（hover 显示） */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                openCreateDialog(folder.id);
              }}
              title="新建子文件夹"
            >
              <PlusIcon size={12} />
            </button>
            <button
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(folder.id);
              }}
              title="删除文件夹"
            >
              <DeleteIcon size={12} />
            </button>
          </div>
        </div>

        {/* 子文件夹列表 */}
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">文件夹</span>
        <button
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-accent/40 transition-colors"
          onClick={() => openCreateDialog(null)}
          title="新建文件夹"
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {/* 文件夹列表 */}
      <div className="flex-1 overflow-auto px-2 pb-2">
        {/* 根目录：全部笔记 */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors',
            selectedFolderId === null
              ? 'bg-primary/10 text-primary'
              : 'text-foreground hover:bg-accent/40'
          )}
          onClick={() => onSelectFolder(null)}
        >
          <FileTextIcon
            size={14}
            className={cn('shrink-0', selectedFolderId === null ? 'text-primary' : 'text-muted-foreground')}
          />
          <span className="flex-1 text-sm">全部笔记</span>
        </div>

        {/* 文件夹树 */}
        <div className="mt-1 space-y-0.5">
          {rootFolders.map((folder) => renderFolderNode(folder))}
        </div>

        {/* 空状态 */}
        {folders.length === 0 && (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground/60">
            暂无文件夹
          </div>
        )}
      </div>

      {/* 新建文件夹对话框 */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        header="新建文件夹"
        width={360}
      >
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">文件夹名称</label>
            <TInput
              value={newFolderName}
              onChange={(v) => setNewFolderName(v as string)}
              placeholder="输入文件夹名称..."
              clearable
              autofocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <TButton variant="outline" size="small" onClick={() => setCreateDialogOpen(false)}>
              取消
            </TButton>
            <TButton theme="primary" size="small" onClick={handleCreateConfirm} disabled={!newFolderName.trim()}>
              创建
            </TButton>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
