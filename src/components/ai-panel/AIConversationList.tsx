import { useState } from 'react';
import { PlusIcon, DeleteIcon, MessageIcon, PencilIcon } from '@/lib/icons';
import { TButton } from '@/components/ui-tdesign';
import type { AIConversation } from './useAIConversations';

interface AIConversationListProps {
  conversations: AIConversation[];
  currentConversationId: string | null;
  onCreate: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
}

export function AIConversationList({
  conversations,
  currentConversationId,
  onCreate,
  onSwitch,
  onDelete,
  onRename,
}: AIConversationListProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = search.trim()
    ? conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const startRename = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const submitRename = (id: string) => {
    const trimmed = editTitle.trim();
    if (trimmed && onRename) {
      onRename(id, trimmed);
    }
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <span className="text-[11px] font-medium text-muted-foreground">对话列表</span>
        <TButton
          variant="text"
          shape="square"
          size="small"
          onClick={onCreate}
          title="新建对话"
          icon={<PlusIcon size={14} />}
        />
      </div>

      {/* 搜索框 */}
      <div className="px-2 py-1.5 border-b border-border">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索对话..."
          className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex-1 overflow-auto py-1">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
            {search.trim() ? '未找到匹配对话' : '暂无对话，点击 + 新建'}
          </div>
        ) : (
          <ul className="space-y-0.5 px-1">
            {filtered.map((conv) => {
              const isActive = conv.id === currentConversationId;
              const isEditing = editingId === conv.id;
              return (
                <li key={conv.id}>
                  <div
                    className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => onSwitch(conv.id)}
                  >
                    <MessageIcon size={14} className="shrink-0 text-muted-foreground" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            submitRename(conv.id);
                          } else if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditTitle('');
                          }
                        }}
                        onBlur={() => submitRename(conv.id)}
                        autoFocus
                        className="flex-1 min-w-0 rounded border border-primary/30 bg-background px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 truncate text-xs">{conv.title || '新对话'}</span>
                    )}
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onRename && !isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(conv.id, conv.title);
                          }}
                          className="p-0.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                          title="重命名"
                        >
                          <PencilIcon size={10} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-all text-muted-foreground"
                        title="删除对话"
                      >
                        <DeleteIcon size={10} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
