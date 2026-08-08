import { archiveIncrementalMessages } from '../../archive/archiveService';
import type { ArchiveIncrementalPayload } from '../../archive/types';
import type Service from '../../models/Service';

export function handleAiHubIncrementalMessages({
  service,
  serviceId,
  payload,
  debug,
}: {
  service: Service;
  serviceId: string;
  payload: ArchiveIncrementalPayload;
  debug: (...args: any[]) => void;
}) {
  debug('[AI-HUB] received incremental conversation payload', {
    serviceId,
    serviceName: service?.name,
    recipeId: service?.recipe?.id,
    mode: payload.mode,
    title: payload.title,
    currentUrl: payload.currentUrl,
    sourceUrl: payload.sourceUrl,
    conversationKey: payload.conversationKey,
    messageCount: payload.messages?.length || 0,
    updatedTail: payload.updatedTail,
  });

  archiveIncrementalMessages({ service, payload })
    .then(result => {
      debug('[AI-HUB] archived incremental conversation payload', result);
    })
    .catch(error => {
      debug('[AI-HUB] failed to archive incremental conversation payload', {
        serviceId,
        error,
      });
    });
}
