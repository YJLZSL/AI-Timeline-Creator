import type { FastifyPluginAsync } from 'fastify';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { aiConversations } from '../../db/schema.js';
import { idParam } from '../../lib/validation.js';

export const aiConversationsRoutes: FastifyPluginAsync = async (app) => {
  // GET / — 列出工作区的所有对话（通过 query: workspaceId）
  app.get('/', async (request, reply) => {
    const { workspaceId } = request.query as { workspaceId?: string };
    if (!workspaceId) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: '缺少 workspaceId 参数' },
      });
    }

    try {
      const result = app.db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.workspaceId, workspaceId))
        .orderBy(desc(aiConversations.updatedAt))
        .all();
      app.log.info({ count: result.length, workspaceId }, '[GET /ai/conversations] 查询成功');
      return { success: true, data: result };
    } catch (err: any) {
      app.log.error({ err: err.message, workspaceId }, '[GET /ai/conversations] 查询失败');
      return reply.status(500).send({
        success: false,
        error: { code: 'QUERY_FAILED', message: '查询对话失败' },
      });
    }
  });

  // GET /:id — 获取单条对话
  app.get<{ Params: { id: string } }>('/:id', {
    schema: { params: idParam },
  }, async (request, reply) => {
    const { id } = request.params;
    try {
      const result = app.db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, id))
        .get();
      if (!result) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '对话不存在' },
        });
      }
      return { success: true, data: result };
    } catch (err: any) {
      app.log.error({ err: err.message, id }, '[GET /ai/conversations/:id] 查询失败');
      return reply.status(500).send({
        success: false,
        error: { code: 'QUERY_FAILED', message: '查询对话失败' },
      });
    }
  });

  // POST / — 创建对话
  app.post('/', async (request, reply) => {
    const body = request.body as {
      workspaceId: string;
      title?: string;
      messagesJson?: string;
      summary?: string;
    };

    if (!body.workspaceId) {
      return reply.status(400).send({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'workspaceId 不能为空' },
      });
    }

    const now = new Date();
    const id = uuidv4();
    const newConversation = {
      id,
      workspaceId: body.workspaceId,
      title: body.title?.trim() || '新对话',
      messagesJson: body.messagesJson || '[]',
      summary: body.summary || '',
      createdAt: now,
      updatedAt: now,
    };

    try {
      app.db.insert(aiConversations).values(newConversation).run();
      app.log.info({ id, workspaceId: body.workspaceId }, '[POST /ai/conversations] 创建成功');
      return { success: true, data: newConversation };
    } catch (err: any) {
      app.log.error({ err: err.message, workspaceId: body.workspaceId }, '[POST /ai/conversations] 创建失败');
      return reply.status(500).send({
        success: false,
        error: { code: 'CREATE_FAILED', message: '创建对话失败' },
      });
    }
  });

  // PATCH /:id — 更新对话
  app.patch<{ Params: { id: string } }>('/:id', {
    schema: { params: idParam },
  }, async (request, reply) => {
    const { id } = request.params;
    const body = request.body as {
      title?: string;
      messagesJson?: string;
      summary?: string;
    };

    try {
      const existing = app.db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, id))
        .get();
      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '对话不存在' },
        });
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.title !== undefined) updates.title = body.title.trim();
      if (body.messagesJson !== undefined) updates.messagesJson = body.messagesJson;
      if (body.summary !== undefined) updates.summary = body.summary;

      app.db
        .update(aiConversations)
        .set(updates)
        .where(eq(aiConversations.id, id))
        .run();

      app.log.info({ id }, '[PATCH /ai/conversations/:id] 更新成功');
      return { success: true, data: { id, ...updates } };
    } catch (err: any) {
      app.log.error({ err: err.message, id }, '[PATCH /ai/conversations/:id] 更新失败');
      return reply.status(500).send({
        success: false,
        error: { code: 'UPDATE_FAILED', message: '更新对话失败' },
      });
    }
  });

  // DELETE /:id — 删除对话
  app.delete<{ Params: { id: string } }>('/:id', {
    schema: { params: idParam },
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      const existing = app.db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, id))
        .get();
      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '对话不存在' },
        });
      }

      app.db
        .delete(aiConversations)
        .where(eq(aiConversations.id, id))
        .run();

      app.log.info({ id }, '[DELETE /ai/conversations/:id] 删除成功');
      return { success: true, data: { id } };
    } catch (err: any) {
      app.log.error({ err: err.message, id }, '[DELETE /ai/conversations/:id] 删除失败');
      return reply.status(500).send({
        success: false,
        error: { code: 'DELETE_FAILED', message: '删除对话失败' },
      });
    }
  });
};
