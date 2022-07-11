import semver from 'semver';
import { pathExistsSync } from 'fs-extra';
import { join } from 'path';
import { DEFAULT_SERVICE_SETTINGS } from '../config';
import { ifUndefined } from '../jsUtils';

interface RecipeData {
  id: string;
  name: string;
  version: string;
  aliases?: string[];
  path: string;
  config: {
    serviceURL?: string;
    hasDirectMessages?: boolean;
    hasIndirectMessages?: boolean;
    hasNotificationSound?: boolean;
    hasTeamId?: boolean;
    hasCustomUrl?: boolean;
    hasHostedOption?: boolean;
    urlInputPrefix?: string;
    urlInputSuffix?: string;
    disablewebsecurity?: boolean;
    autoHibernate?: boolean;
    partition?: string;
    local?: boolean;
    message?: string;
    allowFavoritesDelineationInUnreadCount?: boolean;
  };
}

export interface IRecipe {
  id: string;
  name: string;
  description: string;
  version: string;
  aliases: string[];
  serviceURL: string;
  hasDirectMessages: boolean;
  hasIndirectMessages: boolean;
  hasNotificationSound: boolean;
  hasTeamId: boolean;
  hasCustomUrl: boolean;
  hasHostedOption: boolean;
  urlInputPrefix: string;
  urlInputSuffix: string;
  message: string;
  allowFavoritesDelineationInUnreadCount: boolean;
  disablewebsecurity: boolean;
  autoHibernate: boolean;
  path: string;
  partition: string;
  local: boolean;

  readonly overrideUserAgent?: null | Function;
  readonly buildUrl?: null | Function;
  readonly modifyRequestHeaders?: null | Function;
  readonly knownCertificateHosts?: null | Function;
  readonly events?: null | { (key: string): string };
}

export default class Recipe implements IRecipe {
  id = '';

  name = '';

  description = '';

  version = '';

  // Removing this specific type will cause a typescript error
  // even while it's the exact same as the interface
  aliases: string[] = [];

  serviceURL = '';

  hasDirectMessages = DEFAULT_SERVICE_SETTINGS.hasDirectMessages;

  hasIndirectMessages = DEFAULT_SERVICE_SETTINGS.hasIndirectMessages;

  hasNotificationSound = DEFAULT_SERVICE_SETTINGS.hasNotificationSound;

  hasTeamId = DEFAULT_SERVICE_SETTINGS.hasTeamId;

  hasCustomUrl = DEFAULT_SERVICE_SETTINGS.hasCustomUrl;

  hasHostedOption = DEFAULT_SERVICE_SETTINGS.hasHostedOption;

  urlInputPrefix = '';

  urlInputSuffix = '';

  message = '';

  allowFavoritesDelineationInUnreadCount =
    DEFAULT_SERVICE_SETTINGS.allowFavoritesDelineationInUnreadCount;

  disablewebsecurity = DEFAULT_SERVICE_SETTINGS.disablewebsecurity;

  // TODO: Is this even used?
  autoHibernate = DEFAULT_SERVICE_SETTINGS.autoHibernate;

  path = '';

  partition = '';

  // TODO: Is this being used?
  local = false;

  // TODO: Need to reconcile which of these are optional/mandatory
  constructor(data: RecipeData) {
    if (!data) {
      throw new Error('Recipe config not valid');
    }

    if (!data.id) {
      // Ferdium 4 recipes do not have an Id
      throw new Error(`Recipe '${data.name}' requires Id`);
    }

    if (!semver.valid(data.version)) {
      throw new Error(
        `Version ${data.version} of recipe '${data.name}' is not a valid semver version`,
      );
    }

    // from the recipe
    this.id = ifUndefined<string>(data.id, this.id);
    this.name = ifUndefined<string>(data.name, this.name);
    this.version = ifUndefined<string>(data.version, this.version);
    this.aliases = ifUndefined<Array<string>>(data.aliases, this.aliases);
    this.serviceURL = ifUndefined<string>(
      data.config.serviceURL,
      this.serviceURL,
    );
    this.hasDirectMessages = ifUndefined<boolean>(
      data.config.hasDirectMessages,
      this.hasDirectMessages,
    );
    this.hasIndirectMessages = ifUndefined<boolean>(
      data.config.hasIndirectMessages,
      this.hasIndirectMessages,
    );
    this.hasNotificationSound = ifUndefined<boolean>(
      data.config.hasNotificationSound,
      this.hasNotificationSound,
    );
    this.hasTeamId = ifUndefined<boolean>(
      data.config.hasTeamId,
      this.hasTeamId,
    );
    this.hasCustomUrl = ifUndefined<boolean>(
      data.config.hasCustomUrl,
      this.hasCustomUrl,
    );
    this.hasHostedOption = ifUndefined<boolean>(
      data.config.hasHostedOption,
      this.hasHostedOption,
    );
    this.urlInputPrefix = ifUndefined<string>(
      data.config.urlInputPrefix,
      this.urlInputPrefix,
    );
    this.urlInputSuffix = ifUndefined<string>(
      data.config.urlInputSuffix,
      this.urlInputSuffix,
    );
    this.disablewebsecurity = ifUndefined<boolean>(
      data.config.disablewebsecurity,
      this.disablewebsecurity,
    );
    this.autoHibernate = ifUndefined<boolean>(
      data.config.autoHibernate,
      this.autoHibernate,
    );
    this.local = ifUndefined<boolean>(data.config.local, this.local);
    this.message = ifUndefined<string>(data.config.message, this.message);
    this.allowFavoritesDelineationInUnreadCount = ifUndefined<boolean>(
      data.config.allowFavoritesDelineationInUnreadCount,
      this.allowFavoritesDelineationInUnreadCount,
    );

    // computed
    this.path = data.path;
    this.partition = ifUndefined<string>(data.config.partition, this.partition);
  }

  // TODO: Need to remove this if its not used anywhere
  get author(): string[] {
    return [];
  }

  get hasDarkMode(): boolean {
    return pathExistsSync(join(this.path, 'darkmode.css'));
  }
}
