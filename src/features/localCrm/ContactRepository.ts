import sqlite3 from 'sqlite3';

export interface ContactInput {
  serviceId: string;
  conversationKey: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  tags: string[];
}

export interface Contact extends ContactInput {
  updatedAt: string;
}

export interface BackofficeProfileInput {
  serviceId: string;
  conversationKey: string;
  bsportAccount: string;
  vsportAccount: string;
  activeStream: 'BSPORT' | 'VSPORT';
}

export interface BackofficeProfile extends BackofficeProfileInput {
  updatedAt: string;
}

export class ContactRepository {
  private constructor(private readonly database: sqlite3.Database) {}

  static async open(filename: string): Promise<ContactRepository> {
    const database = await new Promise<sqlite3.Database>((resolve, reject) => {
      const connection = new sqlite3.Database(filename, error => {
        if (error) reject(error);
        else resolve(connection);
      });
    });
    const repository = new ContactRepository(database);
    await repository.initialize();
    return repository;
  }

  static openInMemory(): Promise<ContactRepository> {
    return ContactRepository.open(':memory:');
  }

  async getContact(
    serviceId: string,
    conversationKey: string,
  ): Promise<Contact | null> {
    const row = await this.get<{
      service_id: string;
      conversation_key: string;
      name: string;
      phone: string;
      email: string;
      notes: string;
      tags: string;
      updated_at: string;
    }>(
      `SELECT service_id, conversation_key, name, phone, email, notes, tags, updated_at
       FROM contacts WHERE service_id = ? AND conversation_key = ?`,
      [serviceId, conversationKey],
    );

    if (!row) return null;

    return {
      serviceId: row.service_id,
      conversationKey: row.conversation_key,
      name: row.name,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
      tags: JSON.parse(row.tags),
      updatedAt: row.updated_at,
    };
  }

  async saveContact(input: ContactInput): Promise<Contact> {
    const updatedAt = new Date().toISOString();
    await this.run(
      `INSERT INTO contacts
        (service_id, conversation_key, name, phone, email, notes, tags, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(service_id, conversation_key) DO UPDATE SET
         name = excluded.name,
         phone = excluded.phone,
         email = excluded.email,
         notes = excluded.notes,
         tags = excluded.tags,
         updated_at = excluded.updated_at`,
      [
        input.serviceId,
        input.conversationKey,
        input.name.trim(),
        input.phone.trim(),
        input.email.trim(),
        input.notes.trim(),
        JSON.stringify(input.tags.map(tag => tag.trim()).filter(Boolean)),
        updatedAt,
      ],
    );

    return (await this.getContact(input.serviceId, input.conversationKey))!;
  }

  async resolveConversationKey(
    serviceId: string,
    observedName: string,
  ): Promise<string> {
    const value = observedName.trim();
    if (!value) return '';
    const row = await this.get<{ conversation_key: string }>(
      `SELECT conversation_key FROM contacts
       WHERE service_id = ? AND (conversation_key = ? OR name = ?)
       ORDER BY CASE WHEN conversation_key = ? THEN 0 ELSE 1 END, updated_at DESC
       LIMIT 1`,
      [serviceId, value, value, value],
    );
    return row?.conversation_key || value;
  }

  async getBackofficeProfile(
    serviceId: string,
    conversationKey: string,
  ): Promise<BackofficeProfile | null> {
    const row = await this.get<{
      service_id: string;
      conversation_key: string;
      bsport_account: string;
      vsport_account: string;
      active_stream: 'BSPORT' | 'VSPORT';
      updated_at: string;
    }>(
      `SELECT service_id, conversation_key, bsport_account, vsport_account, active_stream, updated_at
       FROM conversation_backoffice_profiles
       WHERE service_id = ? AND conversation_key = ?`,
      [serviceId, conversationKey],
    );

    return row
      ? {
          serviceId: row.service_id,
          conversationKey: row.conversation_key,
          bsportAccount: row.bsport_account,
          vsportAccount: row.vsport_account,
          activeStream: row.active_stream,
          updatedAt: row.updated_at,
        }
      : null;
  }

  async saveBackofficeProfile(
    input: BackofficeProfileInput,
  ): Promise<BackofficeProfile> {
    const updatedAt = new Date().toISOString();
    await this.run(
      `INSERT INTO conversation_backoffice_profiles
        (service_id, conversation_key, bsport_account, vsport_account, active_stream, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(service_id, conversation_key) DO UPDATE SET
         bsport_account = excluded.bsport_account,
         vsport_account = excluded.vsport_account,
         active_stream = excluded.active_stream,
         updated_at = excluded.updated_at`,
      [
        input.serviceId,
        input.conversationKey.trim(),
        input.bsportAccount.trim(),
        input.vsportAccount.trim(),
        input.activeStream,
        updatedAt,
      ],
    );

    return (await this.getBackofficeProfile(
      input.serviceId,
      input.conversationKey,
    ))!;
  }

  async listBackofficeProfiles(): Promise<BackofficeProfile[]> {
    const rows = await this.all<{
      service_id: string;
      conversation_key: string;
      bsport_account: string;
      vsport_account: string;
      active_stream: 'BSPORT' | 'VSPORT';
      updated_at: string;
    }>(
      `SELECT service_id, conversation_key, bsport_account, vsport_account, active_stream, updated_at
       FROM conversation_backoffice_profiles
       WHERE bsport_account <> '' OR vsport_account <> ''`,
    );
    return rows.map(row => ({
      serviceId: row.service_id,
      conversationKey: row.conversation_key,
      bsportAccount: row.bsport_account,
      vsportAccount: row.vsport_account,
      activeStream: row.active_stream,
      updatedAt: row.updated_at,
    }));
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.database.close(error => (error ? reject(error) : resolve()));
    });
  }

  private async initialize(): Promise<void> {
    await this.run(
      `CREATE TABLE IF NOT EXISTS contacts (
        service_id TEXT NOT NULL,
        conversation_key TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL,
        PRIMARY KEY (service_id, conversation_key)
      )`,
    );
    await this.run(
      `CREATE TABLE IF NOT EXISTS backoffice_profiles (
        service_id TEXT PRIMARY KEY,
        bsport_account TEXT NOT NULL DEFAULT '',
        vsport_account TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      )`,
    );
    await this.run(
      `CREATE TABLE IF NOT EXISTS conversation_backoffice_profiles (
        service_id TEXT NOT NULL,
        conversation_key TEXT NOT NULL,
        bsport_account TEXT NOT NULL DEFAULT '',
        vsport_account TEXT NOT NULL DEFAULT '',
        active_stream TEXT NOT NULL DEFAULT 'BSPORT',
        updated_at TEXT NOT NULL,
        PRIMARY KEY (service_id, conversation_key)
      )`,
    );
    const columns = await this.all<{ name: string }>(
      'PRAGMA table_info(conversation_backoffice_profiles)',
    );
    if (!columns.some(column => column.name === 'active_stream')) {
      await this.run(
        "ALTER TABLE conversation_backoffice_profiles ADD COLUMN active_stream TEXT NOT NULL DEFAULT 'BSPORT'",
      );
    }
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
