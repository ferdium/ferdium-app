import sqlite3 from 'sqlite3';
import { messageDedupeKey, normalizeText } from './normalize';
import type {
  StoredZaloConversation,
  StoredZaloMessage,
  ZaloArchiveBatch,
  ZaloArchiveSummary,
  ZaloLoginState,
  ZaloMessageCompleteness,
  ZaloMessageKind,
  ZaloMessageSender,
} from './types';
import { isInvalidZaloConversationName, isZaloUiNoise } from './noise';

interface ConversationRow {
  service_id: string;
  conversation_key: string;
  display_name: string;
  preview_text: string;
  unread_count: number;
  last_observed_at: string;
}

interface MessageRow {
  service_id: string;
  conversation_key: string;
  dedupe_key: string;
  remote_id: string | null;
  sender: ZaloMessageSender;
  kind: ZaloMessageKind;
  text: string;
  occurred_at: string;
  completeness: ZaloMessageCompleteness;
}

export class ZaloArchiveRepository {
  private constructor(private readonly database: sqlite3.Database) {}

  static async open(filename: string): Promise<ZaloArchiveRepository> {
    const database = await new Promise<sqlite3.Database>((resolve, reject) => {
      const connection = new sqlite3.Database(filename, error => {
        if (error) reject(error);
        else resolve(connection);
      });
    });
    const repository = new ZaloArchiveRepository(database);
    await repository.initialize();
    return repository;
  }

  static openInMemory(): Promise<ZaloArchiveRepository> {
    return ZaloArchiveRepository.open(':memory:');
  }

  async saveBatch(serviceId: string, batch: ZaloArchiveBatch): Promise<void> {
    await this.run('BEGIN IMMEDIATE');
    try {
      for (const conversation of batch.conversations) {
        await this.run(
          `INSERT INTO zalo_conversations
            (service_id, conversation_key, display_name, preview_text, unread_count, last_observed_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(service_id, conversation_key) DO UPDATE SET
             display_name = CASE WHEN excluded.last_observed_at >= last_observed_at THEN excluded.display_name ELSE display_name END,
             preview_text = CASE WHEN excluded.last_observed_at >= last_observed_at THEN excluded.preview_text ELSE preview_text END,
             unread_count = CASE WHEN excluded.last_observed_at >= last_observed_at THEN excluded.unread_count ELSE unread_count END,
             last_observed_at = MAX(last_observed_at, excluded.last_observed_at)`,
          [
            serviceId,
            normalizeText(conversation.conversationKey),
            normalizeText(conversation.displayName),
            normalizeText(conversation.previewText),
            conversation.unreadCount,
            conversation.observedAt,
          ],
        );
      }

      for (const message of batch.messages) {
        const normalizedConversationKey = normalizeText(
          message.conversationKey,
        );
        const normalizedMessageText = normalizeText(message.text);
        if (message.remoteId?.includes('@') && normalizedMessageText) {
          const authoritativeDedupeKey = messageDedupeKey(message);
          await this.run(
            `DELETE FROM zalo_messages
             WHERE service_id = ? AND conversation_key = ?
               AND text = ? AND dedupe_key <> ?
               AND (remote_id IS NULL OR INSTR(remote_id, '@') = 0)`,
            [
              serviceId,
              normalizedConversationKey,
              normalizedMessageText,
              authoritativeDedupeKey,
            ],
          );
        }
        await this.run(
          `INSERT INTO zalo_messages
            (service_id, conversation_key, dedupe_key, remote_id, sender, kind, text, occurred_at, completeness)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(service_id, conversation_key, dedupe_key) DO UPDATE SET
             text = CASE
               WHEN excluded.completeness = 'full' AND excluded.text <> '' THEN excluded.text
               ELSE text
             END,
             completeness = CASE
               WHEN completeness = 'full' OR excluded.completeness = 'full' THEN 'full'
               ELSE 'preview'
             END,
             remote_id = COALESCE(excluded.remote_id, remote_id),
             sender = CASE
               WHEN excluded.completeness = 'full' THEN excluded.sender
               ELSE sender
             END,
             kind = CASE
               WHEN excluded.completeness = 'full' THEN excluded.kind
               ELSE kind
             END,
             occurred_at = CASE
               WHEN excluded.completeness = 'full' THEN excluded.occurred_at
               ELSE occurred_at
             END`,
          [
            serviceId,
            normalizedConversationKey,
            messageDedupeKey(message),
            message.remoteId ? normalizeText(message.remoteId) : null,
            message.sender,
            message.kind,
            normalizedMessageText,
            message.occurredAt,
            message.completeness,
          ],
        );
      }

      await this.run(
        `INSERT INTO zalo_archive_state (service_id, last_synced_at, login_state)
         VALUES (?, ?, ?)
         ON CONFLICT(service_id) DO UPDATE SET
           last_synced_at = excluded.last_synced_at,
           login_state = excluded.login_state`,
        [serviceId, batch.observedAt, batch.loginState ?? 'unknown'],
      );
      await this.run('COMMIT');
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  async getSummary(serviceId: string): Promise<ZaloArchiveSummary> {
    const row = await this.get<{
      conversation_count: number;
      message_count: number;
      last_synced_at: string | null;
      login_state: ZaloLoginState | null;
    }>(
      `SELECT
        (SELECT COUNT(*) FROM zalo_conversations WHERE service_id = ?) AS conversation_count,
        (SELECT COUNT(*) FROM zalo_messages WHERE service_id = ?) AS message_count,
        last_synced_at,
        login_state
       FROM (SELECT 1) seed
       LEFT JOIN zalo_archive_state ON service_id = ?`,
      [serviceId, serviceId, serviceId],
    );
    return {
      conversationCount: row?.conversation_count ?? 0,
      messageCount: row?.message_count ?? 0,
      lastSyncedAt: row?.last_synced_at ?? null,
      loginState: row?.login_state ?? 'unknown',
    };
  }

  async listConversations(
    serviceId: string,
    query = '',
  ): Promise<StoredZaloConversation[]> {
    const normalizedQuery = normalizeText(query);
    const values: unknown[] = [serviceId];
    let filter = '';
    if (normalizedQuery) {
      filter = ` AND (display_name LIKE ? ESCAPE '\\' OR preview_text LIKE ? ESCAPE '\\')`;
      const escaped = normalizedQuery.replace(/[\\%_]/gu, '\\$&');
      values.push(`%${escaped}%`, `%${escaped}%`);
    }
    const rows = await this.all<ConversationRow>(
      `SELECT service_id, conversation_key, display_name, preview_text, unread_count, last_observed_at
       FROM zalo_conversations
       WHERE service_id = ?${filter}
       ORDER BY last_observed_at DESC`,
      values,
    );
    return rows.map(row => ({
      serviceId: row.service_id,
      conversationKey: row.conversation_key,
      displayName: row.display_name,
      previewText: row.preview_text,
      unreadCount: row.unread_count,
      observedAt: row.last_observed_at,
    }));
  }

  async getMessages(
    serviceId: string,
    conversationKey: string,
    limit = 500,
  ): Promise<StoredZaloMessage[]> {
    const rows = await this.all<MessageRow>(
      `SELECT service_id, conversation_key, dedupe_key, remote_id, sender, kind, text, occurred_at, completeness
       FROM zalo_messages
       WHERE service_id = ? AND conversation_key = ?
       ORDER BY occurred_at ASC
       LIMIT ?`,
      [serviceId, conversationKey, Math.min(Math.max(limit, 1), 500)],
    );
    return rows.map(row => ({
      serviceId: row.service_id,
      conversationKey: row.conversation_key,
      dedupeKey: row.dedupe_key,
      remoteId: row.remote_id ?? undefined,
      sender: row.sender,
      kind: row.kind,
      text: row.text,
      occurredAt: row.occurred_at,
      completeness: row.completeness,
    }));
  }

  async cleanupNoise(serviceId: string): Promise<void> {
    const conversations = await this.all<ConversationRow>(
      `SELECT service_id, conversation_key, display_name, preview_text, unread_count, last_observed_at
       FROM zalo_conversations WHERE service_id = ?`,
      [serviceId],
    );
    const messages = await this.all<MessageRow>(
      `SELECT service_id, conversation_key, dedupe_key, remote_id, sender, kind, text, occurred_at, completeness
       FROM zalo_messages WHERE service_id = ?`,
      [serviceId],
    );
    await this.run('BEGIN IMMEDIATE');
    try {
      const validConversations = conversations.filter(
        conversation =>
          !isInvalidZaloConversationName(conversation.display_name),
      );
      const conversationKeys = new Set(
        validConversations.map(conversation => conversation.conversation_key),
      );
      for (const message of messages) {
        if (conversationKeys.has(message.conversation_key)) continue;
        const malformedKey = normalizeText(
          message.conversation_key,
        ).toLocaleLowerCase();
        const target = [...validConversations]
          .sort(
            (left, right) =>
              right.display_name.length - left.display_name.length,
          )
          .find(conversation => {
            const key = normalizeText(
              conversation.conversation_key,
            ).toLocaleLowerCase();
            const name = normalizeText(
              conversation.display_name,
            ).toLocaleLowerCase();
            return (
              malformedKey.startsWith(key) || malformedKey.startsWith(name)
            );
          });
        if (!target) continue;
        await this.run(
          `INSERT OR IGNORE INTO zalo_messages
            (service_id, conversation_key, dedupe_key, remote_id, sender, kind, text, occurred_at, completeness)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            serviceId,
            target.conversation_key,
            message.dedupe_key,
            message.remote_id,
            message.sender,
            message.kind,
            message.text,
            message.occurred_at,
            message.completeness,
          ],
        );
        await this.run(
          `DELETE FROM zalo_messages
           WHERE service_id = ? AND conversation_key = ? AND dedupe_key = ?`,
          [serviceId, message.conversation_key, message.dedupe_key],
        );
      }
      for (const conversation of conversations) {
        if (isInvalidZaloConversationName(conversation.display_name)) {
          await this.run(
            'DELETE FROM zalo_messages WHERE service_id = ? AND conversation_key = ?',
            [serviceId, conversation.conversation_key],
          );
          await this.run(
            'DELETE FROM zalo_conversations WHERE service_id = ? AND conversation_key = ?',
            [serviceId, conversation.conversation_key],
          );
        } else if (
          isZaloUiNoise(conversation.preview_text) ||
          conversation.unread_count > 99
        ) {
          await this.run(
            `UPDATE zalo_conversations SET preview_text = ?, unread_count = ?
             WHERE service_id = ? AND conversation_key = ?`,
            [
              isZaloUiNoise(conversation.preview_text)
                ? ''
                : conversation.preview_text,
              conversation.unread_count > 99 ? 0 : conversation.unread_count,
              serviceId,
              conversation.conversation_key,
            ],
          );
        }
      }
      for (const message of messages) {
        if (
          isZaloUiNoise(message.text) &&
          (message.kind === 'text' || Boolean(message.text))
        ) {
          await this.run(
            `DELETE FROM zalo_messages
             WHERE service_id = ? AND conversation_key = ? AND dedupe_key = ?`,
            [serviceId, message.conversation_key, message.dedupe_key],
          );
        }
      }
      await this.run('COMMIT');
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  async deleteProfile(serviceId: string): Promise<void> {
    await this.run('BEGIN IMMEDIATE');
    try {
      await this.run('DELETE FROM zalo_messages WHERE service_id = ?', [
        serviceId,
      ]);
      await this.run('DELETE FROM zalo_conversations WHERE service_id = ?', [
        serviceId,
      ]);
      await this.run('DELETE FROM zalo_archive_state WHERE service_id = ?', [
        serviceId,
      ]);
      await this.run('COMMIT');
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.database.close(error => (error ? reject(error) : resolve()));
    });
  }

  private async initialize(): Promise<void> {
    await this.run('PRAGMA journal_mode = WAL');
    await this.run(`CREATE TABLE IF NOT EXISTS zalo_conversations (
      service_id TEXT NOT NULL, conversation_key TEXT NOT NULL,
      display_name TEXT NOT NULL, preview_text TEXT NOT NULL DEFAULT '',
      unread_count INTEGER NOT NULL DEFAULT 0, last_observed_at TEXT NOT NULL,
      PRIMARY KEY (service_id, conversation_key)
    )`);
    await this.run(`CREATE TABLE IF NOT EXISTS zalo_messages (
      service_id TEXT NOT NULL, conversation_key TEXT NOT NULL,
      dedupe_key TEXT NOT NULL, remote_id TEXT, sender TEXT NOT NULL,
      kind TEXT NOT NULL, text TEXT NOT NULL DEFAULT '', occurred_at TEXT NOT NULL,
      completeness TEXT NOT NULL,
      PRIMARY KEY (service_id, conversation_key, dedupe_key)
    )`);
    await this.run(`CREATE INDEX IF NOT EXISTS idx_zalo_messages_timeline
      ON zalo_messages(service_id, conversation_key, occurred_at)`);
    await this.run(`CREATE TABLE IF NOT EXISTS zalo_archive_state (
      service_id TEXT PRIMARY KEY, last_synced_at TEXT NOT NULL,
      login_state TEXT NOT NULL DEFAULT 'unknown'
    )`);
  }

  private run(sql: string, values: unknown[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.database.run(sql, values, error =>
        error ? reject(error) : resolve(),
      );
    });
  }

  private get<T>(sql: string, values: unknown[]): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.database.get(sql, values, (error, row: T | undefined) =>
        error ? reject(error) : resolve(row),
      );
    });
  }

  private all<T>(sql: string, values: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.database.all(sql, values, (error, rows: T[]) =>
        error ? reject(error) : resolve(rows),
      );
    });
  }
}
