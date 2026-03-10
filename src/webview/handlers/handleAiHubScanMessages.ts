import { archiveConversationScan } from '../../archive/archiveService';
import type { ArchiveScanPayload } from '../../archive/types';
import type Service from '../../models/Service';

export function handleAiHubScanMessages({
  service,
  serviceId,
  payload,
  debug,
}: {
  service: Service;
  serviceId: string;
  payload: ArchiveScanPayload;
  debug: (...args: any[]) => void;
}) {
  debug('[AI-HUB] received conversation scan', {
    serviceId,
    serviceName: service?.name,
    recipeId: service?.recipe?.id,
    title: payload.title,
    model: payload.model,
    currentUrl: payload.currentUrl,
    messageCount: payload.messageCount,
    messages: payload.messages,
  });

  archiveConversationScan({ service, payload })
    .then(result => {
      debug('[AI-HUB] archived conversation scan', result);
    })
    .catch(error => {
      debug('[AI-HUB] failed to archive conversation scan', {
        serviceId,
        error,
      });
    });
}
