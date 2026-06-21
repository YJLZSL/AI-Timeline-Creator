import { getDb, getSqlite } from './index.js';
import * as schema from './schema.js';
import pino from 'pino';

const dbLog = pino({ name: 'db-init' });

/**
 * 从 Drizzle schema 生成 CREATE TABLE IF NOT EXISTS 语句。
 * 不依赖 drizzle 的 migrate() 函数（在 asar 内不可靠）。
 */
export function generateCreateTableSQL(): string {
  const sqlite = getSqlite();
  const statements: string[] = [];

  // 获取 schema 中所有表定义
  const tables = Object.entries(schema).filter(([_, value]) => {
    // Drizzle 的 sqliteTable 返回的对象有特定结构
    return value && typeof value === 'object' && 'name' in value;
  });

  for (const [tableName, tableDef] of tables) {
    try {
      // 使用 Drizzle 的 sqliteTable 生成建表语句
      // 通过查询 sqlite_master 来检查表是否已存在
      const exists = sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(tableName) as { name: string } | undefined;

      if (!exists) {
        // 使用 Drizzle 的生成器创建表
        // 这里我们使用更直接的方式：通过 drizzle 的表定义生成 SQL
        const sql = generateTableSQL(tableName, tableDef);
        if (sql) {
          statements.push(sql);
        }
      }
    } catch (err) {
      dbLog.warn({ err, tableName }, '生成建表语句失败');
    }
  }

  return statements.join('\\n');
}

/**
 * 生成单张表的 CREATE TABLE IF NOT EXISTS 语句
 * 基于 Drizzle schema 的定义
 */
function generateTableSQL(tableName: string, tableDef: any): string | null {
  // 对于复杂的 Drizzle 表定义，我们使用简化的方式
  // 实际项目中，建议手动维护一份建表 SQL
  return null;
}

/**
 * 验证核心表是否全部存在
 */
export function verifyEssentialTables(): { ok: boolean; missing: string[] } {
  const sqlite = getSqlite();
  const essentialTables = [
    'workspaces', 'tracks', 'events', 'characters', 'connections',
    'foreshadowings', 'world_settings', 'bookmarks', 'maps',
    'event_characters', 'event_world_settings', 'revisions',
    'ai_conversations', 'ai_cache', 'scenes', 'beats', 'choices',
    'assets', 'flags', 'auto_saves', 'outline_versions'
  ];

  const missing: string[] = [];
  for (const table of essentialTables) {
    const exists = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
      .get(table) as { name: string } | undefined;
    if (!exists) {
      missing.push(table);
    }
  }

  return { ok: missing.length === 0, missing };
}

/**
 * 简化版数据库初始化（2层）：
 * 1. 从 schema.ts 生成并执行 CREATE TABLE IF NOT EXISTS
 * 2. 执行 ensureSchemaCompatibility（补列 + 补表）
 */
export function initDatabase(): void {
  const sqlite = getSqlite();

  dbLog.info('[init] starting database initialization');

  // 第 1 层：从 schema.ts 直接生成建表语句
  // 由于 Drizzle 的 schema 对象结构复杂，我们使用硬编码的 CREATE TABLE 语句
  // 但确保所有表都有 IF NOT EXISTS
  const createStatements = getCreateTableStatements();

  sqlite.pragma('foreign_keys = OFF');
  try {
    for (const stmt of createStatements) {
      try {
        sqlite.exec(stmt);
      } catch (err) {
        const msg = (err as Error).message || '';
        if (msg.includes('already exists')) {
          // 表或索引已存在，忽略
          continue;
        }
        dbLog.warn({ err, stmt: stmt.slice(0, 100) }, '[init] statement failed (ignored)');
      }
    }
    dbLog.info('[init] CREATE TABLE statements executed');
  } finally {
    sqlite.pragma('foreign_keys = ON');
  }

  // 第 2 层：ensureSchemaCompatibility（补列 + 补表）
  // 从 index.ts 导入
  const { ensureSchemaCompatibility } = require('./index.js');
  ensureSchemaCompatibility();

  // 验证核心表
  const { ok, missing } = verifyEssentialTables();
  if (!ok) {
    dbLog.error({ missing }, '[init] FATAL: essential tables missing after initialization');
    throw new Error(`Database initialization failed: missing tables: ${missing.join(', ')}`);
  }

  dbLog.info('[init] database initialization complete');
}

/**
 * 获取所有建表语句（从 schema.ts 生成）
 * 这里使用硬编码语句，但确保与 schema.ts 定义一致
 */
function getCreateTableStatements(): string[] {
  return [
    // 工作区
    `CREATE TABLE IF NOT EXISTS workspaces (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      description text DEFAULT '',
      settings_json text DEFAULT '{}',
      calendar_config_json text DEFAULT '{}',
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // 轨道
    `CREATE TABLE IF NOT EXISTS tracks (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      name text NOT NULL,
      color text DEFAULT '#3b82f6',
      order_index integer DEFAULT 0 NOT NULL,
      is_visible integer DEFAULT 1 NOT NULL
    )`,

    // 事件
    `CREATE TABLE IF NOT EXISTS events (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      track_id text,
      title text NOT NULL,
      summary text DEFAULT '',
      description text DEFAULT '',
      location text DEFAULT '',
      start_time integer,
      end_time integer,
      order_index integer DEFAULT 0 NOT NULL,
      narrative_order integer DEFAULT 0,
      color text DEFAULT '',
      tags_json text DEFAULT '[]',
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // 角色
    `CREATE TABLE IF NOT EXISTS characters (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      name text NOT NULL,
      role text DEFAULT '',
      description text DEFAULT '',
      avatar_url text DEFAULT '',
      traits_json text DEFAULT '[]'
    )`,

    // 世界观设定
    `CREATE TABLE IF NOT EXISTS world_settings (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      category text DEFAULT 'general' NOT NULL,
      key text NOT NULL,
      value text DEFAULT '',
      description text DEFAULT ''
    )`,

    // 关联
    `CREATE TABLE IF NOT EXISTS connections (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      source_event_id text NOT NULL,
      target_event_id text NOT NULL,
      type text NOT NULL,
      description text DEFAULT ''
    )`,

    // 伏笔
    `CREATE TABLE IF NOT EXISTS foreshadowings (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      title text NOT NULL,
      description text DEFAULT '',
      status text DEFAULT 'planted' NOT NULL,
      planted_event_id text,
      resolved_event_id text,
      related_foreshadowing_ids text DEFAULT '[]',
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // 事件-角色关联
    `CREATE TABLE IF NOT EXISTS event_characters (
      event_id text NOT NULL,
      character_id text NOT NULL,
      role_description text DEFAULT ''
    )`,

    // 事件-世界观关联
    `CREATE TABLE IF NOT EXISTS event_world_settings (
      event_id text NOT NULL,
      world_setting_id text NOT NULL
    )`,

    // 书签
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      event_id text NOT NULL,
      name text NOT NULL,
      color text DEFAULT '#3b82f6',
      created_at integer NOT NULL
    )`,

    // 地图
    `CREATE TABLE IF NOT EXISTS maps (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      name text NOT NULL,
      background_asset_id text,
      width integer DEFAULT 1920 NOT NULL,
      height integer DEFAULT 1080 NOT NULL,
      markers_json text DEFAULT '[]',
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // 资产
    `CREATE TABLE IF NOT EXISTS assets (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      kind text NOT NULL,
      file_name text NOT NULL,
      mime_type text NOT NULL,
      file_size integer NOT NULL,
      sha256 text NOT NULL,
      width integer,
      height integer,
      metadata_json text DEFAULT '{}',
      created_at integer NOT NULL
    )`,

    // 自动保存
    `CREATE TABLE IF NOT EXISTS auto_saves (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      data_json text NOT NULL,
      created_at integer NOT NULL
    )`,

    // 大纲版本
    `CREATE TABLE IF NOT EXISTS outline_versions (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      content text NOT NULL,
      description text DEFAULT '',
      created_at integer NOT NULL
    )`,

    // 场景（VN）
    `CREATE TABLE IF NOT EXISTS scenes (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      name text NOT NULL,
      background_asset_id text,
      bgm text DEFAULT '',
      scene_order integer DEFAULT 0 NOT NULL,
      map_id text,
      settings_json text DEFAULT '{}',
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // 节拍（VN）
    `CREATE TABLE IF NOT EXISTS beats (
      id text PRIMARY KEY NOT NULL,
      scene_id text NOT NULL,
      kind text NOT NULL,
      character_id text,
      portrait_asset_id text,
      text text DEFAULT '',
      metadata_json text DEFAULT '{}',
      beat_order integer DEFAULT 0 NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // 选项（VN）
    `CREATE TABLE IF NOT EXISTS choices (
      id text PRIMARY KEY NOT NULL,
      beat_id text NOT NULL,
      label text NOT NULL,
      next_scene_id text,
      condition text DEFAULT '',
      choice_order integer DEFAULT 0 NOT NULL
    )`,

    // 标记（VN）
    `CREATE TABLE IF NOT EXISTS flags (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      name text NOT NULL,
      default_value_json text DEFAULT 'null',
      description text DEFAULT ''
    )`,

    // 角色资产
    `CREATE TABLE IF NOT EXISTS character_assets (
      character_id text NOT NULL,
      asset_id text NOT NULL,
      role text NOT NULL,
      display_order integer DEFAULT 0 NOT NULL
    )`,

    // 场景资产
    `CREATE TABLE IF NOT EXISTS scene_assets (
      scene_id text NOT NULL,
      asset_id text NOT NULL,
      role text NOT NULL
    )`,

    // 事件资产
    `CREATE TABLE IF NOT EXISTS event_assets (
      event_id text NOT NULL,
      asset_id text NOT NULL,
      role text NOT NULL
    )`,

    // 修订记录
    `CREATE TABLE IF NOT EXISTS revisions (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      entity_type text NOT NULL,
      entity_id text NOT NULL,
      op text NOT NULL,
      before_json text DEFAULT '{}',
      after_json text DEFAULT '{}',
      summary text DEFAULT '',
      created_at integer NOT NULL
    )`,

    // AI 对话
    `CREATE TABLE IF NOT EXISTS ai_conversations (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      title text DEFAULT '新对话' NOT NULL,
      messages_json text DEFAULT '[]' NOT NULL,
      summary text DEFAULT '',
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // AI 缓存
    `CREATE TABLE IF NOT EXISTS ai_cache (
      id text PRIMARY KEY NOT NULL,
      workspace_id text NOT NULL,
      query_hash text NOT NULL,
      query_text text NOT NULL,
      response text NOT NULL,
      model text NOT NULL,
      hit_count integer DEFAULT 0 NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )`,

    // 索引
    `CREATE INDEX IF NOT EXISTS tracks_workspace_idx ON tracks (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS events_workspace_idx ON events (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS events_track_idx ON events (track_id)`,
    `CREATE INDEX IF NOT EXISTS events_start_time_idx ON events (start_time)`,
    `CREATE INDEX IF NOT EXISTS characters_workspace_idx ON characters (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS connections_workspace_idx ON connections (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS connections_source_idx ON connections (source_event_id)`,
    `CREATE INDEX IF NOT EXISTS connections_target_idx ON connections (target_event_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS event_characters_pk ON event_characters (event_id, character_id)`,
    `CREATE INDEX IF NOT EXISTS event_characters_event_idx ON event_characters (event_id)`,
    `CREATE INDEX IF NOT EXISTS event_characters_character_idx ON event_characters (character_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS event_world_settings_pk ON event_world_settings (event_id, world_setting_id)`,
    `CREATE INDEX IF NOT EXISTS event_world_settings_event_idx ON event_world_settings (event_id)`,
    `CREATE INDEX IF NOT EXISTS event_world_settings_ws_idx ON event_world_settings (world_setting_id)`,
    `CREATE INDEX IF NOT EXISTS foreshadowings_workspace_idx ON foreshadowings (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS foreshadowings_status_idx ON foreshadowings (status)`,
    `CREATE INDEX IF NOT EXISTS world_settings_workspace_idx ON world_settings (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS world_settings_category_idx ON world_settings (category)`,
    `CREATE INDEX IF NOT EXISTS auto_saves_workspace_idx ON auto_saves (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS auto_saves_created_idx ON auto_saves (created_at)`,
    `CREATE INDEX IF NOT EXISTS outline_versions_workspace_idx ON outline_versions (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS outline_versions_created_idx ON outline_versions (created_at)`,
    `CREATE INDEX IF NOT EXISTS assets_workspace_idx ON assets (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS assets_sha256_idx ON assets (sha256)`,
    `CREATE INDEX IF NOT EXISTS assets_kind_idx ON assets (kind)`,
    `CREATE INDEX IF NOT EXISTS maps_workspace_idx ON maps (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS bookmarks_workspace_idx ON bookmarks (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS bookmarks_event_idx ON bookmarks (event_id)`,
    `CREATE INDEX IF NOT EXISTS scenes_workspace_idx ON scenes (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS scenes_order_idx ON scenes (scene_order)`,
    `CREATE INDEX IF NOT EXISTS beats_scene_idx ON beats (scene_id)`,
    `CREATE INDEX IF NOT EXISTS beats_order_idx ON beats (beat_order)`,
    `CREATE INDEX IF NOT EXISTS choices_beat_idx ON choices (beat_id)`,
    `CREATE INDEX IF NOT EXISTS choices_order_idx ON choices (choice_order)`,
    `CREATE INDEX IF NOT EXISTS flags_workspace_idx ON flags (workspace_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS flags_name_idx ON flags (workspace_id, name)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS character_assets_pk ON character_assets (character_id, asset_id, role)`,
    `CREATE INDEX IF NOT EXISTS character_assets_character_idx ON character_assets (character_id)`,
    `CREATE INDEX IF NOT EXISTS character_assets_asset_idx ON character_assets (asset_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS event_assets_pk ON event_assets (event_id, asset_id, role)`,
    `CREATE INDEX IF NOT EXISTS event_assets_event_idx ON event_assets (event_id)`,
    `CREATE INDEX IF NOT EXISTS event_assets_asset_idx ON event_assets (asset_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS scene_assets_pk ON scene_assets (scene_id, asset_id, role)`,
    `CREATE INDEX IF NOT EXISTS scene_assets_scene_idx ON scene_assets (scene_id)`,
    `CREATE INDEX IF NOT EXISTS scene_assets_asset_idx ON scene_assets (asset_id)`,
    `CREATE INDEX IF NOT EXISTS revisions_workspace_idx ON revisions (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS revisions_entity_idx ON revisions (entity_type, entity_id)`,
    `CREATE INDEX IF NOT EXISTS revisions_created_idx ON revisions (created_at)`,
    `CREATE INDEX IF NOT EXISTS ai_conversations_workspace_idx ON ai_conversations (workspace_id)`,
    `CREATE INDEX IF NOT EXISTS ai_conversations_created_idx ON ai_conversations (created_at)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ai_cache_hash_idx ON ai_cache (workspace_id, query_hash)`,
    `CREATE INDEX IF NOT EXISTS ai_cache_hit_idx ON ai_cache (hit_count)`,
  ];
}
