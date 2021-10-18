import semver from 'semver';
import { pathExistsSync } from 'fs-extra';
import { join } from 'path';
import { DEFAULT_SERVICE_SETTINGS } from '../config';
import { ifUndefinedString, ifUndefinedBoolean } from '../jsUtils';

interface IRecipe {
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
    message?: string;
    allowFavoritesDelineationInUnreadCount?: boolean;
  };
}

export default class Recipe {
  id: string = '';

  name: string = '';

  description = '';

  version: string = '';

  aliases: string[] = [];

  serviceURL: string = '';

  hasDirectMessages: boolean = DEFAULT_SERVICE_SETTINGS.hasDirectMessages;

  hasIndirectMessages: boolean = DEFAULT_SERVICE_SETTINGS.hasIndirectMessages;

  hasNotificationSound: boolean = DEFAULT_SERVICE_SETTINGS.hasNotificationSound;

  hasTeamId: boolean = DEFAULT_SERVICE_SETTINGS.hasTeamId;

  hasCustomUrl: boolean = DEFAULT_SERVICE_SETTINGS.hasCustomUrl;

  hasHostedOption: boolean = DEFAULT_SERVICE_SETTINGS.hasHostedOption;

  urlInputPrefix: string = '';

  urlInputSuffix: string = '';

  message: string = '';

  allowFavoritesDelineationInUnreadCount: boolean =
    DEFAULT_SERVICE_SETTINGS.allowFavoritesDelineationInUnreadCount;

  disablewebsecurity: boolean = DEFAULT_SERVICE_SETTINGS.disablewebsecurity;

  // TODO: Is this even used?
  autoHibernate: boolean = DEFAULT_SERVICE_SETTINGS.autoHibernate;

  path: string = '';

  partition: string = '';

  // TODO: Need to reconcile which of these are optional/mandatory
  constructor(data: IRecipe) {
    if (!data) {
      throw new Error('Recipe config not valid');
    }

    if (!data.id) {
      // Ferdi 4 recipes do not have an Id
      throw new Error(`Recipe '${data.name}' requires Id`);
    }

    if (!semver.valid(data.version)) {
      throw new Error(
        `Version ${data.version} of recipe '${data.name}' is not a valid semver version`,
      );
    }

    // from the recipe
    this.id = ifUndefinedString(data.id, this.id);
    this.name = ifUndefinedString(data.name, this.name);
    this.version = ifUndefinedString(data.version, this.version);
    this.aliases = data.aliases || this.aliases;
    this.serviceURL = ifUndefinedString(
      data.config.serviceURL,
      this.serviceURL,
    );
    this.hasDirectMessages = ifUndefinedBoolean(
      data.config.hasDirectMessages,
      this.hasDirectMessages,
    );
    this.hasIndirectMessages = ifUndefinedBoolean(
      data.config.hasIndirectMessages,
      this.hasIndirectMessages,
    );
    this.hasNotificationSound = ifUndefinedBoolean(
      data.config.hasNotificationSound,
      this.hasNotificationSound,
    );
    this.hasTeamId = ifUndefinedBoolean(data.config.hasTeamId, this.hasTeamId);
    this.hasCustomUrl = ifUndefinedBoolean(
      data.config.hasCustomUrl,
      this.hasCustomUrl,
    );
    this.hasHostedOption = ifUndefinedBoolean(
      data.config.hasHostedOption,
      this.hasHostedOption,
    );
    this.urlInputPrefix = ifUndefinedString(
      data.config.urlInputPrefix,
      this.urlInputPrefix,
    );
    this.urlInputSuffix = ifUndefinedString(
      data.config.urlInputSuffix,
      this.urlInputSuffix,
    );
    this.disablewebsecurity = ifUndefinedBoolean(
      data.config.disablewebsecurity,
      this.disablewebsecurity,
    );
    this.autoHibernate = ifUndefinedBoolean(
      data.config.autoHibernate,
      this.autoHibernate,
    );
    this.message = ifUndefinedString(data.config.message, this.message);
    this.allowFavoritesDelineationInUnreadCount = ifUndefinedBoolean(
      data.config.allowFavoritesDelineationInUnreadCount,
      this.allowFavoritesDelineationInUnreadCount,
    );

    // computed
    this.path = data.path;
    this.partition = ifUndefinedString(data.config.partition, this.partition);
  }

  // TODO: Need to remove this if its not used anywhere
  get author(): string[] {
    return [];
  }

  get hasDarkMode(): boolean {
    return pathExistsSync(join(this.path, 'darkmode.css'));
  }
}
