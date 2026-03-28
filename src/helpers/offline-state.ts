import {
  ensureDirSync,
  pathExistsSync,
  readJsonSync,
  writeJsonSync,
} from 'fs-extra';
import { userDataPath } from '../environment-remote';
import Workspace from '../features/workspaces/models/Workspace';
import ServiceModel from '../models/Service';
import UserModel from '../models/User';

const BACKUP_FILE = userDataPath('config', 'offline-state.json');

export interface OfflineStateSnapshot {
  updatedAt: string;
  user: Record<string, any>;
  services: Record<string, any>[];
  workspaces: Record<string, any>[];
}

export function loadOfflineState(): OfflineStateSnapshot | null {
  if (!pathExistsSync(BACKUP_FILE)) {
    return null;
  }

  try {
    return readJsonSync(BACKUP_FILE);
  } catch (error) {
    console.warn('Could not read offline backup state', error);
    return null;
  }
}

export function saveOfflineState(snapshot: OfflineStateSnapshot): void {
  try {
    ensureDirSync(userDataPath('config'));
    writeJsonSync(BACKUP_FILE, snapshot, { spaces: 2 });
  } catch (error) {
    console.warn('Could not write offline backup state', error);
  }
}

export function serializeOfflineState({
  user,
  services,
  workspaces,
}: {
  user: Record<string, any>;
  services: ServiceModel[];
  workspaces: Workspace[];
}): OfflineStateSnapshot {
  return {
    updatedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      organization: user.organization,
      accountType: user.accountType,
      beta: user.beta,
      locale: user.locale,
      isSubscriptionOwner: user.isSubscriptionOwner,
      team: user.team,
    },
    services: services.map(service => ({
      id: service.id,
      recipeId: service.recipe.id,
      name: service.name,
      team: service.team,
      customUrl: service.customUrl,
      iconUrl: service.iconUrl,
      order: service.order,
      isEnabled: service.isEnabled,
      isNotificationEnabled: service.isNotificationEnabled,
      isBadgeEnabled: service.isBadgeEnabled,
      isMediaBadgeEnabled: service.isMediaBadgeEnabled,
      trapLinkClicks: service.trapLinkClicks,
      isIndirectMessageBadgeEnabled: service.isIndirectMessageBadgeEnabled,
      isMuted: service.isMuted,
      isDarkModeEnabled: service.isDarkModeEnabled,
      darkReaderSettings: service.darkReaderSettings,
      isProgressbarEnabled: service.isProgressbarEnabled,
      onlyShowFavoritesInUnreadCount: service.onlyShowFavoritesInUnreadCount,
      spellcheckerLanguage: service.spellcheckerLanguage,
      userAgentPref: service.userAgentPref,
      isHibernationEnabled: service.isHibernationEnabled,
      isWakeUpEnabled: service.isWakeUpEnabled,
      useFavicon: service.useFavicon,
      iconId: service.hasCustomUploadedIcon ? 'offline-backup' : '',
    })),
    workspaces: workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      order: workspace.order,
      services: [...workspace.services],
      userId: workspace.userId,
    })),
  };
}

export function hydrateOfflineState(
  snapshot: OfflineStateSnapshot,
  recipes: any[],
) {
  const services = snapshot.services
    .map(service => {
      const recipe = recipes.find(r => r.id === service.recipeId);
      if (!recipe) {
        return null;
      }

      try {
        return new ServiceModel(service, recipe);
      } catch (error) {
        console.warn('Could not hydrate offline service', service.id, error);
        return null;
      }
    })
    .filter(Boolean);

  return {
    user: new UserModel(snapshot.user as any),
    services,
    workspaces: snapshot.workspaces.map(workspace => new Workspace(workspace)),
  };
}
