import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { notes, noteFolders, noteTags, workspaces } from '../db/schema.js';
import {
  workspaceIdParam,
  noteIdParam,
  noteFolderIdParam,
  noteTagIdParam,
  createNoteBody,
  updateNoteBody,
  createNoteFolderBody,
  createNoteTagBody,
  validateWorkspaceExists,
} from '../lib/validation.js';
import type {
  CreateNoteRequest,
  UpdateNoteRequest,
  CreateNoteFolderRequest,
  CreateNoteTagRequest,
} from '../../shared/types.js';

export async function notesRoutes(app: FastifyInstance) {
  // ============================================
  // 笔记端点
  // ============================================

  // GET /notes — 获取笔记列表（支持按 folder_id 筛选）
  app.get<{ Params: { workspaceId: string }; Querystring: { folderId?: string } }>('/notes', {
    schema: { params: workspaceIdParam },
  }, async (request, reply) => {
    const { workspaceId } = request.params;
    const { folderId } = request.query;

    if (!await validateWorkspaceExists(app, workspaceId, reply)) return;

    let query = app.db.select().from(notes).where(eq(notes.workspaceId, workspaceId));

    // 如果提供了 folderId，则按文件夹筛选
    if (folderId) {
      if (folderId === 'null') {
        // 查询未分类笔记（folderId 为 null）
        query = app.db.select().from(notes).where(
          and(eq(notes.workspaceId, workspaceId), eq(notes.folderId, ''))
        ) as unknown as typeof query;
      } else {
        query = app.db.select().from(notes).where(
          and(eq(notes.workspaceId, workspaceId), eq(notes.folderId, folderId))
        ) as unknown as typeof query;
      }
    }

    const result = query.orderBy(notes.updatedAt).all();
    return { success: true, data: { items: result, total: result.length } };
  });

  // POST /notes — 创建笔记
  app.post<{ Params: { workspaceId: string }; Body: CreateNoteRequest }>('/notes', {
    schema: { params: workspaceIdParam, body: createNoteBody },
  }, async (request, reply) => {
    const { workspaceId } = request.params;
    const { id: bodyId, folderId, title, content, tagsJson } = request.body;

    if (!await validateWorkspaceExists(app, workspaceId, reply)) return;

    const id = bodyId || uuidv4();
    const now = new Date();

    const result = app.db.insert(notes).values({
      id,
      workspaceId,
      folderId: folderId || null,
      title,
      content: content || '',
      tagsJson: tagsJson || '[]',
      createdAt: now,
      updatedAt: now,
    }).returning().get();

    return reply.status(201).send({ success: true, data: result });
  });

  // GET /notes/:noteId — 获取单个笔记
  app.get<{ Params: { workspaceId: string; noteId: string } }>('/notes/:noteId', {
    schema: { params: noteIdParam },
  }, async (request, reply) => {
    const { workspaceId, noteId } = request.params;

    const result = app.db.select().from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.workspaceId, workspaceId)))
      .get();
    if (!result) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: '笔记不存在' } });
    }
    return { success: true, data: result };
  });

  // PATCH /notes/:noteId — 更新笔记
  app.patch<{ Params: { workspaceId: string; noteId: string }; Body: UpdateNoteRequest }>('/notes/:noteId', {
    schema: { params: noteIdParam, body: updateNoteBody },
  }, async (request, reply) => {
    const { workspaceId, noteId } = request.params;
    const updates = request.body;

    const existing = app.db.select().from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.workspaceId, workspaceId)))
      .get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: '笔记不存在' } });
    }

    const allowedFields: Record<string, unknown> = {};
    if (updates.folderId !== undefined) allowedFields.folderId = updates.folderId;
    if (updates.title !== undefined) allowedFields.title = updates.title;
    if (updates.content !== undefined) allowedFields.content = updates.content;
    if (updates.tagsJson !== undefined) allowedFields.tagsJson = updates.tagsJson;
    allowedFields.updatedAt = new Date();

    const result = app.db.update(notes).set(allowedFields)
      .where(eq(notes.id, noteId))
      .returning().get();

    return { success: true, data: result };
  });

  // DELETE /notes/:noteId — 删除笔记
  app.delete<{ Params: { workspaceId: string; noteId: string } }>('/notes/:noteId', {
    schema: { params: noteIdParam },
  }, async (request, reply) => {
    const { workspaceId, noteId } = request.params;

    const existing = app.db.select().from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.workspaceId, workspaceId)))
      .get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: '笔记不存在' } });
    }

    app.db.delete(notes).where(eq(notes.id, noteId)).run();
    return { success: true, data: { id: noteId } };
  });

  // ============================================
  // 文件夹端点
  // ============================================

  // GET /note-folders — 获取文件夹列表
  app.get<{ Params: { workspaceId: string } }>('/note-folders', {
    schema: { params: workspaceIdParam },
  }, async (request, reply) => {
    const { workspaceId } = request.params;

    if (!await validateWorkspaceExists(app, workspaceId, reply)) return;

    const result = app.db.select().from(noteFolders)
      .where(eq(noteFolders.workspaceId, workspaceId))
      .orderBy(noteFolders.name)
      .all();
    return { success: true, data: { items: result, total: result.length } };
  });

  // POST /note-folders — 创建文件夹
  app.post<{ Params: { workspaceId: string }; Body: CreateNoteFolderRequest }>('/note-folders', {
    schema: { params: workspaceIdParam, body: createNoteFolderBody },
  }, async (request, reply) => {
    const { workspaceId } = request.params;
    const { id: bodyId, parentId, name } = request.body;

    if (!await validateWorkspaceExists(app, workspaceId, reply)) return;

    const id = bodyId || uuidv4();
    const now = new Date();

    const result = app.db.insert(noteFolders).values({
      id,
      workspaceId,
      parentId: parentId || null,
      name,
      createdAt: now,
    }).returning().get();

    return reply.status(201).send({ success: true, data: result });
  });

  // DELETE /note-folders/:folderId — 删除文件夹
  app.delete<{ Params: { workspaceId: string; folderId: string } }>('/note-folders/:folderId', {
    schema: { params: noteFolderIdParam },
  }, async (request, reply) => {
    const { workspaceId, folderId } = request.params;

    const existing = app.db.select().from(noteFolders)
      .where(and(eq(noteFolders.id, folderId), eq(noteFolders.workspaceId, workspaceId)))
      .get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: '文件夹不存在' } });
    }

    // 删除文件夹前，将其下的笔记的 folderId 设为 null
    app.db.update(notes).set({ folderId: null })
      .where(and(eq(notes.folderId, folderId), eq(notes.workspaceId, workspaceId)))
      .run();

    app.db.delete(noteFolders).where(eq(noteFolders.id, folderId)).run();
    return { success: true, data: { id: folderId } };
  });

  // ============================================
  // 标签端点
  // ============================================

  // GET /note-tags — 获取标签列表
  app.get<{ Params: { workspaceId: string } }>('/note-tags', {
    schema: { params: workspaceIdParam },
  }, async (request, reply) => {
    const { workspaceId } = request.params;

    if (!await validateWorkspaceExists(app, workspaceId, reply)) return;

    const result = app.db.select().from(noteTags)
      .where(eq(noteTags.workspaceId, workspaceId))
      .orderBy(noteTags.name)
      .all();
    return { success: true, data: { items: result, total: result.length } };
  });

  // POST /note-tags — 创建标签
  app.post<{ Params: { workspaceId: string }; Body: CreateNoteTagRequest }>('/note-tags', {
    schema: { params: workspaceIdParam, body: createNoteTagBody },
  }, async (request, reply) => {
    const { workspaceId } = request.params;
    const { id: bodyId, name, color } = request.body;

    if (!await validateWorkspaceExists(app, workspaceId, reply)) return;

    const id = bodyId || uuidv4();

    // 检查同名标签是否已存在
    const existing = app.db.select().from(noteTags)
      .where(and(eq(noteTags.workspaceId, workspaceId), eq(noteTags.name, name)))
      .get();
    if (existing) {
      return reply.status(409).send({ success: false, error: { code: 'CONFLICT', message: '标签名称已存在' } });
    }

    const result = app.db.insert(noteTags).values({
      id,
      workspaceId,
      name,
      color: color || '#3b82f6',
    }).returning().get();

    return reply.status(201).send({ success: true, data: result });
  });

  // DELETE /note-tags/:tagId — 删除标签
  app.delete<{ Params: { workspaceId: string; tagId: string } }>('/note-tags/:tagId', {
    schema: { params: noteTagIdParam },
  }, async (request, reply) => {
    const { workspaceId, tagId } = request.params;

    const existing = app.db.select().from(noteTags)
      .where(and(eq(noteTags.id, tagId), eq(noteTags.workspaceId, workspaceId)))
      .get();
    if (!existing) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: '标签不存在' } });
    }

    app.db.delete(noteTags).where(eq(noteTags.id, tagId)).run();
    return { success: true, data: { id: tagId } };
  });
}
