import sanitizeFilename from 'sanitize-filename';
import type Service from '../models/Service';
import { stableHash } from './db';
import type { ArchiveConversationInput, ConversationIdentity } from './types';

function getAccountId(service: Service): string {
  return stableHash(`account|${service.partition || service.id}`);
}

function getAccountLabel(service: Service): string {
  return service.name || service.recipe?.name || 'unknown';
}

function getPayloadSourceUrl(payload: ArchiveConversationInput): string | null {
  return (
    payload.currentUrl ||
    ('sourceUrl' in payload ? payload.sourceUrl : null) ||
    null
  );
}

function getPayloadConversationKey(
  payload: ArchiveConversationInput,
): string | null {
  return (
    ('conversationKey' in payload ? payload.conversationKey : null) || null
  );
}

function getPayloadVendor(
  payload: ArchiveConversationInput,
  service: Service,
): string {
  if ('platform' in payload && payload.platform) {
    return payload.platform;
  }

  if ('vendor' in payload && payload.vendor) {
    return payload.vendor;
  }

  return service.recipe?.id || 'unknown';
}

function extractConversationId(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/\/c\/([^#/?]+)/);

  if (match?.[1]) {
    return match[1];
  }

  if (/^[\da-f]{8}-[\da-f-]{27}$/i.test(value)) {
    return value;
  }

  return null;
}

function slugifyTitle(title: string): string {
  const safe = sanitizeFilename(title || 'Conversation')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');

  return safe || 'Conversation';
}

export function resolveConversationIdentity(
  service: Service,
  payload: ArchiveConversationInput,
): ConversationIdentity {
  const accountId = getAccountId(service);
  const sourceUrl = getPayloadSourceUrl(payload);
  const conversationKey = getPayloadConversationKey(payload);
  const vendorConversationId =
    extractConversationId(sourceUrl) ||
    extractConversationId(conversationKey) ||
    null;
  const conversationDiscriminator =
    vendorConversationId || conversationKey || sourceUrl || 'unknown-url';
  const conversationId = stableHash(
    `conversation|${accountId}|${conversationDiscriminator}`,
  );

  return {
    accountId,
    accountLabel: getAccountLabel(service),
    vendor: getPayloadVendor(payload, service),
    sourceUrl,
    vendorConversationId,
    conversationId,
    conversationFileKey: vendorConversationId || conversationId,
    title: payload.title || service.name || 'Conversation',
    service,
  };
}

export function getConversationFilenameForKey(
  conversationFileKey: string,
  title: string,
): string {
  return `${conversationFileKey}-${slugifyTitle(title)}.md`;
}

export function getConversationFilename(
  identity: ConversationIdentity,
): string {
  return getConversationFilenameForKey(
    identity.conversationFileKey,
    identity.title,
  );
}
