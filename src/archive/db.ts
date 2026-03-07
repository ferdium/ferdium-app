import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { userDataPath } from '../environment-remote';

const sqlite3 = require('sqlite3');

const schemaSql = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  account_label TEXT NOT NULL,
  partition_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  vendor_conversation_id TEXT,
  title TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  sender_label TEXT,
  content_text TEXT NOT NULL,
  content_md TEXT NOT NULL,
  seq INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  hash TEXT NOT NULL
);
`;

let databasePromise: Promise<any> | null = null;

export const archivePaths = {
  rootDir: userDataPath('ai-hub'),
  dbPath: userDataPath('ai-hub', 'archive.db'),
  latestMarkdownPath: userDataPath('ai-hub', 'conversation.md'),
  conversationsDir: userDataPath('ai-hub', 'conversations'),
};

export function stableHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function openDatabase(): Promise<any> {
  ensureDirSync(dirname(archivePaths.dbPath));

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(archivePaths.dbPath, error => {
      if (error) {
        reject(error);
        return;
      }

      db.exec(schemaSql, execError => {
        if (execError) {
          reject(execError);
          return;
        }

        resolve(db);
      });
    });
  });
}

export function getArchiveDb(): Promise<any> {
  if (!databasePromise) {
    databasePromise = openDatabase();
  }

  return databasePromise;
}

export function run(db: any, sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (error: Error | null) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function get<T>(
  db: any,
  sql: string,
  params: any[] = [],
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error: Error | null, row: T) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

export function all<T>(db: any, sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error: Error | null, rows: T[]) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows || []);
    });
  });
}

export function writeLatestMarkdown(content: string) {
  ensureDirSync(dirname(archivePaths.latestMarkdownPath));
  writeFileSync(archivePaths.latestMarkdownPath, content, 'utf8');
}

export function writeConversationMarkdown(filename: string, content: string) {
  ensureDirSync(archivePaths.conversationsDir);
  writeFileSync(join(archivePaths.conversationsDir, filename), content, 'utf8');
}
