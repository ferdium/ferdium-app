import type Service from '../models/Service';
import { archivePaths, getArchiveDb, run } from './db';
import { resolveConversationIdentity } from './conversationKeyResolver';
import { upsertAccount, upsertConversation } from './conversationUpsertService';
import { exportArchiveIndex } from './index/archiveIndexExporter';
import {
  replaceConversationMessagesForFullScan,
  updateLastAssistantMessage,
  upsertIncrementalMessages,
} from './messageUpsertService';
import { exportConversationMarkdown } from './markdownExporter';
import type { ArchiveIncrementalPayload, ArchiveScanPayload } from './types';

function getNormalizedMessages(payload: { messages?: any[] }) {
  return (payload.messages || []).filter(message => message?.text?.trim());
}

async function exportArchiveArtifacts(
  db: any,
  identity: ReturnType<typeof resolveConversationIdentity>,
) {
  const exportResult = await exportConversationMarkdown(db, identity);
  const indexResult = await exportArchiveIndex(db);

  return {
    exportResult,
    indexResult,
  };
}

export async function archiveConversationScan({
  service,
  payload,
}: {
  service: Service;
  payload: ArchiveScanPayload;
}) {
  const db = await getArchiveDb();
  const now = new Date().toISOString();
  const identity = resolveConversationIdentity(service, payload);
  const messages = getNormalizedMessages(payload);

  await run(db, 'BEGIN TRANSACTION');

  try {
    await upsertAccount(db, identity, now);
    await upsertConversation(db, identity, now);
    await replaceConversationMessagesForFullScan(
      db,
      identity.conversationId,
      messages,
      now,
    );
    await run(db, 'COMMIT');
  } catch (error) {
    await run(db, 'ROLLBACK');
    throw error;
  }

  const { exportResult, indexResult } = await exportArchiveArtifacts(
    db,
    identity,
  );

  return {
    accountId: identity.accountId,
    conversationId: identity.conversationId,
    messageCount: messages.length,
    dbPath: archivePaths.dbPath,
    markdownPath: archivePaths.latestMarkdownPath,
    conversationMarkdownPath: exportResult.conversationMarkdownPath,
    indexMarkdownPath: indexResult.indexMarkdownPath,
  };
}

export async function archiveIncrementalMessages({
  service,
  payload,
}: {
  service: Service;
  payload: ArchiveIncrementalPayload;
}) {
  if (payload.mode === 'rescan') {
    return archiveConversationScan({
      service,
      payload: {
        platform: payload.vendor,
        title: payload.title,
        model: payload.model,
        currentUrl: payload.currentUrl || payload.sourceUrl,
        messageCount: payload.messages?.length,
        messages: payload.messages,
      },
    });
  }

  const db = await getArchiveDb();
  const now = payload.scannedAt || new Date().toISOString();
  const identity = resolveConversationIdentity(service, payload);
  const messages = getNormalizedMessages(payload);

  await run(db, 'BEGIN TRANSACTION');

  try {
    await upsertAccount(db, identity, now);
    await upsertConversation(db, identity, now);

    if (payload.mode === 'bootstrap' || payload.mode === 'append') {
      await upsertIncrementalMessages(
        db,
        identity.conversationId,
        messages,
        now,
      );
    }

    if (payload.mode === 'update-tail' && payload.updatedTail?.text?.trim()) {
      await updateLastAssistantMessage(
        db,
        identity.conversationId,
        payload.updatedTail,
        now,
      );
    }

    await run(db, 'COMMIT');
  } catch (error) {
    await run(db, 'ROLLBACK');
    throw error;
  }

  const { exportResult, indexResult } = await exportArchiveArtifacts(
    db,
    identity,
  );

  return {
    accountId: identity.accountId,
    conversationId: identity.conversationId,
    mode: payload.mode,
    messageCount: payload.mode === 'update-tail' ? 1 : messages.length,
    dbPath: archivePaths.dbPath,
    markdownPath: archivePaths.latestMarkdownPath,
    conversationMarkdownPath: exportResult.conversationMarkdownPath,
    indexMarkdownPath: indexResult.indexMarkdownPath,
  };
}
