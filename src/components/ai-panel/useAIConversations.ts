import { useCallback, useEffect, useState } from 'react';
import {
  fetchAIConversations,
  createAIConversation as apiCreateConversation,
  updateAIConversation as apiUpdateConversation,
  deleteAIConversation as apiDeleteConversation,
  messagesToJson,
} from '@/services/ai-conversations-api.js';
import { toast } from 'sonner';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  degraded?: boolean;
  error?: string;
}

export interface AIConversation {
  id: string;
  title: string;
  workspaceId: string;
  messages: AIChatMessage[];
  createdAt: number;
  updatedAt: number;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 对话管理 hook：后端 API 持久化，按工作区过滤 */
export function useAIConversations(workspaceId: string | null) {
  const [allConversations, setAllConversations] = useState<AIConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载工作区对话
  useEffect(() => {
    if (!workspaceId) {
      setAllConversations([]);
      setCurrentConversationId(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchAIConversations(workspaceId)
      .then((data) => {
        if (cancelled) return;
        setAllConversations(data);
        // 自动选中最新对话
        if (data.length > 0) {
          setCurrentConversationId(data[0].id);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(`加载对话失败: ${err.message}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [workspaceId]);

  // 当前工作区的对话
  const conversations = workspaceId
    ? allConversations.filter((c) => c.workspaceId === workspaceId)
    : [];

  const currentConversation =
    allConversations.find((c) => c.id === currentConversationId) || null;

  const createConversation = useCallback(async (): Promise<string | null> => {
    if (!workspaceId) return null;
    try {
      const conv = await apiCreateConversation(workspaceId, '新对话');
      setAllConversations((prev) => [...prev, conv]);
      setCurrentConversationId(conv.id);
      return conv.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`创建对话失败: ${message}`);
      return null;
    }
  }, [workspaceId]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await apiDeleteConversation(id);
      setAllConversations((prev) => prev.filter((c) => c.id !== id));
      setCurrentConversationId((curr) => {
        if (curr !== id) return curr;
        return null;
      });
      toast.success('对话已删除');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`删除对话失败: ${message}`);
    }
  }, []);

  const switchConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const addMessage = useCallback(async (conversationId: string, message: Omit<AIChatMessage, 'id' | 'createdAt'>): Promise<string> => {
    const msgId = genId();
    const now = Date.now();
    const newMessage: AIChatMessage = { ...message, id: msgId, createdAt: now };

    setAllConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const messages = [...c.messages, newMessage];
        // 第一条用户消息自动用前 20 字作为标题
        let title = c.title;
        if (c.title === '新对话' && message.role === 'user') {
          title = message.content.slice(0, 20) || '新对话';
        }
        return { ...c, messages, title, updatedAt: now };
      }),
    );

    // 异步保存到后端
    try {
      const conv = allConversations.find((c) => c.id === conversationId);
      if (conv) {
        const updatedMessages = [...conv.messages, newMessage];
        const title = conv.title === '新对话' && message.role === 'user'
          ? message.content.slice(0, 20) || '新对话'
          : conv.title;
        await apiUpdateConversation(conversationId, {
          messagesJson: messagesToJson(updatedMessages),
          title,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`保存消息失败: ${message}`);
    }

    return msgId;
  }, [allConversations]);

  const updateMessage = useCallback(async (conversationId: string, messageId: string, patch: Partial<AIChatMessage>) => {
    setAllConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const updatedMessages = c.messages.map((m) =>
          m.id === messageId ? { ...m, ...patch } : m,
        );
        return { ...c, messages: updatedMessages, updatedAt: Date.now() };
      }),
    );

    // 异步保存到后端
    try {
      const conv = allConversations.find((c) => c.id === conversationId);
      if (conv) {
        const updatedMessages = conv.messages.map((m) =>
          m.id === messageId ? { ...m, ...patch } : m,
        );
        await apiUpdateConversation(conversationId, {
          messagesJson: messagesToJson(updatedMessages),
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`更新消息失败: ${message}`);
    }
  }, [allConversations]);

  const removeLastMessage = useCallback(async (conversationId: string) => {
    setAllConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return { ...c, messages: c.messages.slice(0, -1), updatedAt: Date.now() };
      }),
    );

    // 异步保存到后端
    try {
      const conv = allConversations.find((c) => c.id === conversationId);
      if (conv) {
        const updatedMessages = conv.messages.slice(0, -1);
        await apiUpdateConversation(conversationId, {
          messagesJson: messagesToJson(updatedMessages),
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`删除消息失败: ${message}`);
    }
  }, [allConversations]);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      await apiUpdateConversation(id, { title: newTitle.trim() });
      setAllConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: newTitle.trim(), updatedAt: Date.now() } : c,
        ),
      );
      toast.success('对话已重命名');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`重命名失败: ${message}`);
    }
  }, []);

  return {
    conversations,
    currentConversation,
    currentConversationId,
    createConversation,
    deleteConversation,
    switchConversation,
    addMessage,
    updateMessage,
    removeLastMessage,
    renameConversation,
    setCurrentConversationId,
    loading,
  };
}
