import type { FastifyInstance } from 'fastify';
import { chatCompletion, chatCompletionStream, testConnection, hasApiKey, listModels, type AIProvider } from '../services/ai-proxy.js';
import { aiChatBody, aiTestBody } from '../lib/validation.js';
import type { AIChatRequest } from '../../shared/types.js';
import { workspaces, tracks, events, characters, connections, foreshadowings, worldSettings } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function aiRoutes(app: FastifyInstance) {

  // POST /chat — AI 对话
  app.post<{ Body: AIChatRequest }>('/chat', {
    schema: { body: aiChatBody },
  }, async (request, reply) => {
    const chatRequest = request.body;

    // 流式响应
    if (chatRequest.stream) {
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      let aborted = false;
      request.raw.on('close', () => {
        aborted = true;
      });

      try {
        for await (const chunk of chatCompletionStream(chatRequest)) {
          if (aborted) break;
          // 降级元数据直接转发，不包装为 content
          if (chunk.startsWith('{"degraded":')) {
            reply.raw.write(`data: ${chunk}\n\n`);
          } else {
            reply.raw.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          }
        }
        if (!aborted) {
          reply.raw.write('data: [DONE]\n\n');
        }
      } catch (err) {
        if (!aborted) {
          reply.raw.write(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : '未知错误' })}\n\n`);
        }
      }

      reply.raw.end();
      return;
    }

    // 非流式响应
    const result = await chatCompletion(chatRequest);
    return { success: true, data: result };
  });

  // POST /test — 测试 AI 连接
  app.post<{ Body: { provider?: AIProvider; apiKey?: string; model?: string } }>('/test', {
    schema: { body: aiTestBody },
  }, async (request) => {
    const { provider = 'siliconflow', apiKey, model } = request.body;

    const hasKey = hasApiKey(provider, apiKey);
    if (!hasKey) {
      return {
        success: true,
        data: {
          connected: false,
          message: '未配置 API Key，当前使用模拟模式',
          mode: 'simulated',
        },
      };
    }

    const result = await testConnection(provider, apiKey, undefined, model);
    return {
      success: true,
      data: {
        connected: result.success,
        message: result.message,
        mode: result.success ? 'api' : 'simulated',
      },
    };
  });

  // GET /models — 获取可用模型列表
  app.post<{ Body: { provider?: AIProvider; apiKey?: string; baseUrl?: string } }>('/models', {
    schema: { body: aiTestBody },
  }, async (request) => {
    const { provider = 'siliconflow', apiKey, baseUrl } = request.body;
    const models = await listModels(provider, apiKey, baseUrl);
    return { success: true, data: models };
  });

  // POST /workspace-context — 获取工作区数据供 AI 分析
  app.post<{ Body: { workspaceId: string } }>('/workspace-context', async (request, reply) => {
    const { workspaceId } = request.body;
    if (!workspaceId) {
      return reply.status(400).send({ success: false, error: { code: 'BAD_REQUEST', message: 'workspaceId 不能为空' } });
    }

    try {
      const ws = app.db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).get();
      if (!ws) {
        return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: '工作区不存在' } });
      }

      const wsTracks = app.db.select().from(tracks).where(eq(tracks.workspaceId, workspaceId)).all();
      const wsEvents = app.db.select().from(events).where(eq(events.workspaceId, workspaceId)).all();
      const wsCharacters = app.db.select().from(characters).where(eq(characters.workspaceId, workspaceId)).all();
      const wsConnections = app.db.select().from(connections).where(eq(connections.workspaceId, workspaceId)).all();
      const wsForeshadowings = app.db.select().from(foreshadowings).where(eq(foreshadowings.workspaceId, workspaceId)).all();
      const wsWorldSettings = app.db.select().from(worldSettings).where(eq(worldSettings.workspaceId, workspaceId)).all();

      const context = {
        workspace: {
          name: ws.name,
          description: ws.description,
          eventCount: wsEvents.length,
          characterCount: wsCharacters.length,
        },
        tracks: wsTracks.map((t) => ({ id: t.id, name: t.name, color: t.color, isVisible: t.isVisible })),
        events: wsEvents.map((e) => ({
          id: e.id,
          title: e.title,
          summary: e.summary,
          description: e.description?.slice(0, 200),
          startTime: e.startTime ? new Date(e.startTime).toISOString() : null,
          endTime: e.endTime ? new Date(e.endTime).toISOString() : null,
          trackId: e.trackId,
        })),
        characters: wsCharacters.map((c) => ({ id: c.id, name: c.name, role: c.role, description: c.description?.slice(0, 200) })),
        connections: wsConnections.map((c) => ({ sourceEventId: c.sourceEventId, targetEventId: c.targetEventId, type: c.type, description: c.description })),
        foreshadowings: wsForeshadowings.map((f) => ({ title: f.title, description: f.description, status: f.status })),
        worldSettings: wsWorldSettings.map((w) => ({ category: w.category, key: w.key, value: w.value?.slice(0, 200) })),
      };

      return { success: true, data: context };
    } catch (err) {
      return reply.status(500).send({ success: false, error: { code: 'INTERNAL_ERROR', message: '获取工作区数据失败' } });
    }
  });
}
