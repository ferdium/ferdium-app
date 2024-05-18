import { join } from 'node:path';
import { clipboard, ipcRenderer, shell } from 'electron';
import { ensureFileSync, pathExistsSync, writeFileSync } from 'fs-extra';
import { debounce, remove } from 'lodash';
import { action, computed, makeObservable, observable, reaction } from 'mobx';
import ms from 'ms';

import type { Stores } from '../@types/stores.types';
import type { Actions } from '../actions/lib/actions';
import type { ApiInterface } from '../api';
import { DEFAULT_SERVICE_SETTINGS, KEEP_WS_LOADED_USID } from '../config';
import { ferdiumVersion } from '../environment-remote';
import { workspaceStore } from '../features/workspaces';
import {
  getDevRecipeDirectory,
  getRecipeDirectory,
} from '../helpers/recipe-helpers';
import matchRoute from '../helpers/routing-helpers';
import { isInTimeframe } from '../helpers/schedule-helpers';
import { SPELLCHECKER_LOCALES } from '../i18n/languages';
import { cleanseJSObject } from '../jsUtils';
import type { UnreadServices } from '../lib/dbus/Ferdium';
import type Service from '../models/Service';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';
import TypedStore from './lib/TypedStore';

const debug = require('../preload-safe-debug')('Ferdium:ServiceStore');

export default class ServicesStore extends TypedStore {
  @observable allServicesRequest: CachedRequest = new CachedRequest(
    this.api.services,
    'all',
  );

  @observable createServiceRequest: Request = new Request(
    this.api.services,
    'create',
  );

  @observable updateServiceRequest: Request = new Request(
    this.api.services,
    'update',
  );

  @observable reorderServicesRequest: Request = new Request(
    this.api.services,
    'reorder',
  );

  @observable deleteServiceRequest: Request = new Request(
    this.api.services,
    'delete',
  );

  @observable clearCacheRequest: Request = new Request(
    this.api.services,
    'clearCache',
  );

  @observable filterNeedle: string | null = null;

  // Array of service IDs that have recently been used
  // [0] => Most recent, [n] => Least recent
  // No service ID should be in the list multiple times, not all service IDs have to be in the list
  @observable lastUsedServices: string[] = [];

  private toggleToTalkCallback = () => this.active?.toggleToTalk();

  constructor(stores: Stores, api: ApiInterface, actions: Actions) {
    super(stores, api, actions);

    makeObservable(this);

    // Register action handlers
    this.actions.service.setActive.listen(this._setActive.bind(this));
    this.actions.service.blurActive.listen(this._blurActive.bind(this));
    this.actions.service.setActiveNext.listen(this._setActiveNext.bind(this));
    this.actions.service.setActivePrev.listen(this._setActivePrev.bind(this));
    this.actions.service.showAddServiceInterface.listen(
      this._showAddServiceInterface.bind(this),
    );
    this.actions.service.createService.listen(this._createService.bind(this));
    this.actions.service.createFromLegacyService.listen(
      this._createFromLegacyService.bind(this),
    );
    this.actions.service.updateService.listen(this._updateService.bind(this));
    this.actions.service.deleteService.listen(this._deleteService.bind(this));
    this.actions.service.openRecipeFile.listen(this._openRecipeFile.bind(this));
    this.actions.service.clearCache.listen(this._clearCache.bind(this));
    this.actions.service.setWebviewReference.listen(
      this._setWebviewReference.bind(this),
    );
    this.actions.service.detachService.listen(this._detachService.bind(this));
    this.actions.service.focusService.listen(this._focusService.bind(this));
    this.actions.service.focusActiveService.listen(
      this._focusActiveService.bind(this),
    );
    this.actions.service.toggleService.listen(this._toggleService.bind(this));
    this.actions.service.handleIPCMessage.listen(
      this._handleIPCMessage.bind(this),
    );
    this.actions.service.sendIPCMessage.listen(this._sendIPCMessage.bind(this));
    this.actions.service.sendIPCMessageToAllServices.listen(
      this._sendIPCMessageToAllServices.bind(this),
    );
    this.actions.service.setUnreadMessageCount.listen(
      this._setUnreadMessageCount.bind(this),
    );
    this.actions.service.setDialogTitle.listen(this._setDialogTitle.bind(this));
    this.actions.service.openWindow.listen(this._openWindow.bind(this));
    this.actions.service.filter.listen(this._filter.bind(this));
    this.actions.service.resetFilter.listen(this._resetFilter.bind(this));
    this.actions.service.resetStatus.listen(this._resetStatus.bind(this));
    this.actions.service.reload.listen(this._reload.bind(this));
    this.actions.service.reloadActive.listen(this._reloadActive.bind(this));
    this.actions.service.reloadAll.listen(this._reloadAll.bind(this));
    this.actions.service.reloadUpdatedServices.listen(
      this._reloadUpdatedServices.bind(this),
    );
    this.actions.service.reorder.listen(this._reorder.bind(this));
    this.actions.service.toggleNotifications.listen(
      this._toggleNotifications.bind(this),
    );
    this.actions.service.toggleAudio.listen(this._toggleAudio.bind(this));
    this.actions.service.toggleDarkMode.listen(this._toggleDarkMode.bind(this));
    this.actions.service.openDevTools.listen(this._openDevTools.bind(this));
    this.actions.service.openDevToolsForActiveService.listen(
      this._openDevToolsForActiveService.bind(this),
    );
    this.actions.service.hibernate.listen(this._hibernate.bind(this));
    this.actions.service.awake.listen(this._awake.bind(this));
    this.actions.service.resetLastPollTimer.listen(
      this._resetLastPollTimer.bind(this),
    );
    this.actions.service.shareSettingsWithServiceProcess.listen(
      this._shareSettingsWithServiceProcess.bind(this),
    );

    this.registerReactions([
      this._focusServiceReaction.bind(this),
      this._getUnreadMessageCountReaction.bind(this),
      this._mapActiveServiceToServiceModelReaction.bind(this),
      this._saveActiveService.bind(this),
      this._logoutReaction.bind(this),
      this._handleMuteSettings.bind(this),
      this._checkForActiveService.bind(this),
    ]);

    // Just bind this
    this._initializeServiceRecipeInWebview.bind(this);
  }

  setup() {
    // Single key reactions for the sake of your CPU
    reaction(
      () => this.stores.settings.app.enableSpellchecking,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.enableTranslator,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.spellcheckerLanguage,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.darkMode,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.adaptableDarkMode,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.universalDarkMode,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.splitMode,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.splitColumns,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.searchEngine,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.translatorEngine,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.translatorLanguage,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );

    reaction(
      () => this.stores.settings.app.clipboardNotifications,
      () => {
        this._shareSettingsWithServiceProcess();
      },
    );
  }

  initialize() {
    super.initialize();

    ipcRenderer.on('toggle-to-talk', this.toggleToTalkCallback);

    // Check services to become hibernated
    this.serviceMaintenanceTick();
  }

  teardown() {
    super.teardown();

    ipcRenderer.off('toggle-to-talk', this.toggleToTalkCallback);

    // Stop checking services for hibernation
    this.serviceMaintenanceTick.cancel();
  }

  _serviceMaintenanceTicker() {
    this._serviceMaintenance();
    this.serviceMaintenanceTick();
    debug('Service maintenance tick');
  }

  /**
   * Сheck for services to become hibernated.
   */
  serviceMaintenanceTick = debounce(this._serviceMaintenanceTicker, ms('10s'));

  /**
   * Run various maintenance tasks on services
   */
  _serviceMaintenance() {
    for (const service of this.enabled) {
      // Defines which services should be hibernated or woken up
      if (!service.isActive) {
        if (
          !service.lastHibernated &&
          Date.now() - service.lastUsed >
            ms(`${this.stores.settings.all.app.hibernationStrategy}s`)
        ) {
          // If service is stale, hibernate it.
          this._hibernate({ serviceId: service.id });
        }

        if (
          service.isWakeUpEnabled &&
          service.lastHibernated &&
          Number(this.stores.settings.all.app.wakeUpStrategy) > 0 &&
          Date.now() - service.lastHibernated >
            ms(`${this.stores.settings.all.app.wakeUpStrategy}s`)
        ) {
          // If service is in hibernation and the wakeup time has elapsed, wake it.
          this._awake({ serviceId: service.id, automatic: true });
        }
      }

      if (
        service.lastPoll &&
        service.lastPoll - service.lastPollAnswer > ms('1m')
      ) {
        // If service did not reply for more than 1m try to reload.
        if (service.isActive) {
          debug(`Service lost connection: ${service.name} (${service.id}).`);
          service.lostRecipeConnection = true;
        } else if (
          this.stores.app.isOnline &&
          service.lostRecipeReloadAttempt < 3
        ) {
          debug(
            `Reloading service: ${service.name} (${service.id}). Attempt: ${service.lostRecipeReloadAttempt}`,
          );
          // service.webview.reload();
          service.lostRecipeReloadAttempt += 1;

          service.lostRecipeConnection = false;
        }
      } else {
        service.lostRecipeConnection = false;
        service.lostRecipeReloadAttempt = 0;
      }
    }
  }

  // Computed props
  @computed get all(): Service[] {
    if (this.stores.user.isLoggedIn) {
      const services = this.allServicesRequest.execute().result;
      if (services) {
        return observable(
          [...services]
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((s, index) => {
              // eslint-disable-next-line no-param-reassign
              s.index = index;
              return s;
            }),
        );
      }
    }
    return [];
  }

  @computed get enabled(): Service[] {
    return this.all.filter(service => service.isEnabled);
  }

  @computed get allDisplayed(): Service[] {
    const services = this.stores.settings.all.app.showDisabledServices
      ? this.all
      : this.enabled;
    return workspaceStore.filterServicesByActiveWorkspace(services);
  }

  // This is just used to avoid unnecessary rerendering of resource-heavy webviews
  @computed get allDisplayedUnordered() {
    const { showDisabledServices } = this.stores.settings.all.app;
    const { keepAllWorkspacesLoaded } = this.stores.workspaces.settings;
    const services = this.allServicesRequest.execute().result || [];
    const filteredServices = showDisabledServices
      ? services
      : services.filter(service => service.isEnabled);

    let displayedServices;
    if (keepAllWorkspacesLoaded) {
      // Keep all enabled services loaded
      displayedServices = filteredServices;
    } else {
      // Keep all services in current workspace loaded
      displayedServices =
        workspaceStore.filterServicesByActiveWorkspace(filteredServices);

      // Keep all services active in workspaces that should be kept loaded
      for (const workspace of this.stores.workspaces.workspaces) {
        // Check if workspace needs to be kept loaded
        if (workspace.services.includes(KEEP_WS_LOADED_USID)) {
          // Get services for workspace
          const serviceIDs = new Set(
            workspace.services.filter(i => i !== KEEP_WS_LOADED_USID),
          );
          const wsServices = filteredServices.filter(service =>
            serviceIDs.has(service.id),
          );

          displayedServices = [...displayedServices, ...wsServices];
        }
      }

      // Make sure every service is in the list only once
      displayedServices = displayedServices.filter(
        (v, i, a) => a.indexOf(v) === i,
      );
    }

    return displayedServices;
  }

  @computed get filtered() {
    if (this.filterNeedle !== null) {
      return this.all.filter(service =>
        service.name.toLowerCase().includes(this.filterNeedle!.toLowerCase()),
      );
    }

    // Return all if there is no filterNeedle present
    return this.all;
  }

  @computed get active() {
    return this.all.find(service => service.isActive);
  }

  @computed get activeSettings() {
    const match = matchRoute(
      '/settings/services/edit/:id',
      this.stores.router.location.pathname,
    );
    if (match) {
      const activeService = this.one(match.id);
      if (activeService) {
        return activeService;
      }

      debug('Service not available');
    }

    return null;
  }

  @computed get isTodosServiceAdded() {
    return (
      this.allDisplayed.find(
        service => service.isTodosService && service.isEnabled,
      ) ?? false
    );
  }

  @computed get isTodosServiceActive() {
    return this.active?.isTodosService;
  }

  // TODO: This can actually return undefined as well
  one(id: string): Service {
    return this.all.find(service => service.id === id)!;
  }

  async _showAddServiceInterface({ recipeId }) {
    this.stores.router.push(`/settings/services/add/${recipeId}`);
  }

  // Actions
  async _createService({
    recipeId,
    serviceData,
    redirect = true,
    skipCleanup = false,
  }) {
    if (!this.stores.recipes.isInstalled(recipeId)) {
      debug(`Recipe "${recipeId}" is not installed, installing recipe`);
      await this.stores.recipes._install({ recipeId });
      debug(`Recipe "${recipeId}" installed`);
    }

    // set default values for serviceData
    // eslint-disable-next-line no-param-reassign
    serviceData = {
      isEnabled: DEFAULT_SERVICE_SETTINGS.isEnabled,
      isHibernationEnabled: DEFAULT_SERVICE_SETTINGS.isHibernationEnabled,
      isWakeUpEnabled: DEFAULT_SERVICE_SETTINGS.isWakeUpEnabled,
      isNotificationEnabled: DEFAULT_SERVICE_SETTINGS.isNotificationEnabled,
      isBadgeEnabled: DEFAULT_SERVICE_SETTINGS.isBadgeEnabled,
      isMediaBadgeEnabled: DEFAULT_SERVICE_SETTINGS.isMediaBadgeEnabled,
      trapLinkClicks: DEFAULT_SERVICE_SETTINGS.trapLinkClicks,
      useFavicon: DEFAULT_SERVICE_SETTINGS.useFavicon,
      isMuted: DEFAULT_SERVICE_SETTINGS.isMuted,
      customIcon: DEFAULT_SERVICE_SETTINGS.customIcon,
      isDarkModeEnabled: DEFAULT_SERVICE_SETTINGS.isDarkModeEnabled,
      isProgressbarEnabled: DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled,
      spellcheckerLanguage:
        SPELLCHECKER_LOCALES[this.stores.settings.app.spellcheckerLanguage],
      userAgentPref: '',
      ...serviceData,
    };

    const data = skipCleanup
      ? serviceData
      : this._cleanUpTeamIdAndCustomUrl(recipeId, serviceData);

    const response = await this.createServiceRequest.execute(recipeId, data)
      .promise;

    this.allServicesRequest.patch(result => {
      if (!result) return;
      result.push(response.data);
    });

    this.actions.settings.update({
      type: 'proxy',
      data: {
        [`${response.data.id}`]: data.proxy,
      },
    });

    this.actionStatus = response.status || [];

    if (redirect) {
      this.stores.router.push('/settings/recipes');
    }
  }

  @action async _createFromLegacyService({ data }) {
    const { id } = data.recipe;
    const serviceData: {
      name?: string;
      team?: string;
      customUrl?: string;
    } = {};

    if (data.name) {
      serviceData.name = data.name;
    }

    if (data.team) {
      if (data.customURL) {
        // TODO: Is this correct?
        serviceData.customUrl = data.team;
      } else {
        serviceData.team = data.team;
      }
    }

    this.actions.service.createService({
      recipeId: id,
      serviceData,
      redirect: false,
    });
  }

  @action async _updateService({ serviceId, serviceData, redirect = true }) {
    const service = this.one(serviceId);
    const data = this._cleanUpTeamIdAndCustomUrl(
      service.recipe.id,
      serviceData,
    );
    const request = this.updateServiceRequest.execute(serviceId, data);

    const newData = serviceData;
    if (serviceData.iconFile) {
      await request.promise;

      newData.iconUrl = request.result.data.iconUrl;
      newData.hasCustomUploadedIcon = true;
    }

    this.allServicesRequest.patch(result => {
      if (!result) return;

      // patch custom icon deletion
      if (data.customIcon === 'delete') {
        newData.iconUrl = '';
        newData.hasCustomUploadedIcon = false;
      }

      // patch custom icon url
      if (data.customIconUrl) {
        newData.iconUrl = data.customIconUrl;
      }

      Object.assign(
        result.find(c => c.id === serviceId),
        newData,
      );
    });

    await request.promise;
    this.actionStatus = request.result.status;

    if (service.isEnabled) {
      this._sendIPCMessage({
        serviceId,
        channel: 'service-settings-update',
        args: newData,
      });
    }

    this.actions.settings.update({
      type: 'proxy',
      data: {
        [`${serviceId}`]: data.proxy,
      },
    });

    if (redirect) {
      this.stores.router.push('/settings/services');
    }
  }

  @action async _deleteService({ serviceId, redirect }): Promise<void> {
    const request = this.deleteServiceRequest.execute(serviceId);

    if (redirect) {
      this.stores.router.push(redirect);
    }

    this.allServicesRequest.patch((result: Service[]) => {
      remove(result, (c: Service) => c.id === serviceId);
    });

    await request.promise;
    this.actionStatus = request.result.status;
  }

  @action async _openRecipeFile({ recipe, file }): Promise<void> {
    // Get directory for recipe
    const normalDirectory = getRecipeDirectory(recipe);
    const devDirectory = getDevRecipeDirectory(recipe);
    let directory: string;

    if (pathExistsSync(normalDirectory)) {
      directory = normalDirectory;
    } else if (pathExistsSync(devDirectory)) {
      directory = devDirectory;
    } else {
      // Recipe cannot be found on drive
      return;
    }

    // Create and open file
    const filePath = join(directory, file);
    if (file === 'user.js') {
      if (!pathExistsSync(filePath)) {
        writeFileSync(
          filePath,
          `module.exports = (config, Ferdium) => {
  // Write your scripts here
  console.log("Hello, World!", config);
};
`,
        );
      }
    } else {
      ensureFileSync(filePath);
    }
    shell.showItemInFolder(filePath);
  }

  @action async _clearCache({ serviceId }) {
    this.clearCacheRequest.reset();
    const request = this.clearCacheRequest.execute(serviceId);
    await request.promise;
  }

  @action _setIsActive(service: Service, state: boolean): void {
    // eslint-disable-next-line no-param-reassign
    service.isActive = state;
  }

  @action _setActive({ serviceId, keepActiveRoute = null }) {
    if (!keepActiveRoute) this.stores.router.push('/');
    const service = this.one(serviceId);

    for (const s of this.all) {
      if (s.isActive) {
        s.lastUsed = Date.now();
        this._setIsActive(s, false);
      }
    }
    this._setIsActive(service, true);
    this._awake({ serviceId: service.id });

    if (
      this.isTodosServiceActive &&
      !this.stores.todos.settings.isFeatureEnabledByUser
    ) {
      this.actions.todos.toggleTodosFeatureVisibility();
    }

    // Update list of last used services
    this.lastUsedServices = this.lastUsedServices.filter(
      id => id !== serviceId,
    );
    this.lastUsedServices.unshift(serviceId);

    this._focusActiveService();
  }

  @action _blurActive() {
    const service = this.active;
    if (service) {
      this._setIsActive(service, false);
    } else {
      debug('No service is active');
    }
  }

  @action _setActiveNext() {
    const nextIndex = this._wrapIndex(
      this.allDisplayed.findIndex(service => service.isActive),
      1,
      this.allDisplayed.length,
    );

    this._setActive({ serviceId: this.allDisplayed[nextIndex].id });
  }

  @action _setActivePrev() {
    const prevIndex = this._wrapIndex(
      this.allDisplayed.findIndex(service => service.isActive),
      -1,
      this.allDisplayed.length,
    );

    this._setActive({ serviceId: this.allDisplayed[prevIndex].id });
  }

  @action _setUnreadMessageCount({ serviceId, count }) {
    const service = this.one(serviceId);

    service.unreadDirectMessageCount = count.direct;
    service.unreadIndirectMessageCount = count.indirect;
  }

  @action _setDialogTitle({ serviceId, dialogTitle }) {
    const service = this.one(serviceId);

    service.dialogTitle = dialogTitle;
  }

  @action _setWebviewReference({ serviceId, webview }) {
    const service = this.one(serviceId);
    if (service) {
      service.webview = webview;

      if (!service.isAttached) {
        debug('Webview is not attached, initializing');
        service.initializeWebViewEvents({
          handleIPCMessage: this.actions.service.handleIPCMessage,
          openWindow: this.actions.service.openWindow,
          stores: this.stores,
        });
        service.initializeWebViewListener();
      }
      service.isAttached = true;
    }
  }

  @action _detachService({ service }) {
    // eslint-disable-next-line no-param-reassign
    service.webview = null;
    // eslint-disable-next-line no-param-reassign
    service.isAttached = false;
  }

  @action _focusService({ serviceId }) {
    const service = this.one(serviceId);

    if (service.webview) {
      service.webview.blur();
      service.webview.focus();
    }
  }

  @action _focusActiveService(focusEvent = null) {
    if (this.stores.user.isLoggedIn) {
      // TODO: add checks to not focus service when router path is /settings or /auth
      const service = this.active;
      if (service) {
        if (service._webview) {
          document.title = `Ferdium - ${service.name} ${
            service.dialogTitle ? ` - ${service.dialogTitle}` : ''
          } ${service._webview ? `- ${service._webview.getTitle()}` : ''}`;
          this._focusService({ serviceId: service.id });
          if (this.stores.settings.app.splitMode && !focusEvent) {
            setTimeout(() => {
              document
                .querySelector('.services__webview-wrapper.is-active')
                ?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'end',
                  inline: 'nearest',
                });
            }, 10);
          }
        }
      } else {
        debug('No service is active');
      }
    } else {
      this.allServicesRequest.invalidate();
    }
  }

  @action _toggleService({ serviceId }) {
    const service = this.one(serviceId);

    service.isEnabled = !service.isEnabled;
  }

  @action _handleIPCMessage({ serviceId, channel, args }) {
    const service = this.one(serviceId);

    // eslint-disable-next-line default-case
    switch (channel) {
      case 'hello': {
        debug('Received hello event from', serviceId);

        this._initRecipePolling(service.id);
        this._initializeServiceRecipeInWebview(serviceId);
        this._shareSettingsWithServiceProcess();

        break;
      }
      case 'alive': {
        service.lastPollAnswer = Date.now();

        break;
      }
      case 'message-counts': {
        debug(`Received unread message info from '${serviceId}'`, args[0]);

        this.actions.service.setUnreadMessageCount({
          serviceId,
          count: {
            direct: args[0].direct,
            indirect: args[0].indirect,
          },
        });

        break;
      }
      case 'active-dialog-title': {
        debug(`Received active dialog title from '${serviceId}'`, args[0]);

        this.actions.service.setDialogTitle({
          serviceId,
          dialogTitle: args[0],
        });

        break;
      }

      case 'load-available-displays': {
        debug('Received request for capture devices from', serviceId);
        ipcRenderer.send('load-available-displays', {
          serviceId,
          ...args[0],
        });
        break;
      }

      case 'notification': {
        const { notificationId, options } = args[0];

        const { isTwoFactorAutoCatcherEnabled, twoFactorAutoCatcherMatcher } =
          this.stores.settings.all.app;

        debug(
          'Settings for catch tokens',
          isTwoFactorAutoCatcherEnabled,
          twoFactorAutoCatcherMatcher,
        );

        if (isTwoFactorAutoCatcherEnabled) {
          /*
        parse the token digits from sms body, find "token" or "code" in options.body which reflect the sms content
        ---
        Token: 03624 / SMS-Code = PIN Token
        ---
        Prüfcode 010313 für Microsoft-Authentifizierung verwenden.
        ---
        483133 is your GitHub authentication code. @github.com #483133
        ---
        eBay: Ihr Sicherheitscode lautet 080090. \nEr läuft in 15 Minuten ab. Geben Sie den Code nicht an andere weiter.
        ---
        PayPal: Ihr Sicherheitscode lautet: 989605. Geben Sie diesen Code nicht weiter.
      */

          const rawBody = options.body;
          const { 0: token } = /\d{5,6}/.exec(options.body) || [];

          const wordsToCatch = twoFactorAutoCatcherMatcher
            .replaceAll(', ', ',')
            .split(',');

          debug('wordsToCatch', wordsToCatch);

          if (
            token &&
            wordsToCatch.some(a =>
              options.body.toLowerCase().includes(a.toLowerCase()),
            )
          ) {
            // with the extra "+ " it shows its copied to clipboard in the notification
            options.body = `+ ${rawBody}`;
            clipboard.writeText(token);
            debug('Token parsed and copied to clipboard');
          }
        }

        // Check if we are in scheduled Do-not-Disturb time
        const { scheduledDNDEnabled, scheduledDNDStart, scheduledDNDEnd } =
          this.stores.settings.all.app;

        if (
          scheduledDNDEnabled &&
          isInTimeframe(scheduledDNDStart, scheduledDNDEnd)
        ) {
          return;
        }

        if (service.isMuted || this.stores.settings.all.app.isAppMuted) {
          Object.assign(options, {
            silent: true,
          });
        }

        if (service.isNotificationEnabled) {
          let title: string;
          if (this.stores.settings.all.app.privateNotifications === true) {
            // Remove message data from notification in private mode
            options.body = '';
            options.icon = service.icon;
            title = `Notification from ${service.name}`;
          } else {
            options.icon = options.icon || service.icon;
            options.body = typeof options.body === 'string' ? options.body : '';
            title =
              typeof args[0].title === 'string' ? args[0].title : service.name;
          }

          this.actions.app.notify({
            notificationId,
            title,
            options,
            serviceId,
          });
        }

        break;
      }
      case 'avatar': {
        const url = args[0];
        if (service.iconUrl !== url && !service.hasCustomUploadedIcon) {
          service.customIconUrl = url;

          this.actions.service.updateService({
            serviceId,
            serviceData: {
              customIconUrl: url,
            },
            redirect: false,
          });
        }

        break;
      }
      case 'new-window': {
        const url = args[0];

        this.actions.app.openExternalUrl({ url });

        break;
      }
      case 'set-service-spellchecker-language': {
        if (args) {
          this.actions.service.updateService({
            serviceId,
            serviceData: {
              spellcheckerLanguage: args[0] === 'reset' ? '' : args[0],
            },
            redirect: false,
          });
        } else {
          console.warn('Did not receive locale');
        }

        break;
      }
      case 'feature:todos': {
        Object.assign(args[0].data, { serviceId });
        this.actions.todos.handleHostMessage(args[0]);

        break;
      }
      // No default
    }
  }

  @action _sendIPCMessage({ serviceId, channel, args }) {
    const service = this.one(serviceId);

    // Make sure the args are clean, otherwise ElectronJS can't transmit them
    const cleanArgs = cleanseJSObject(args);

    if (service.webview) {
      service.webview.send(channel, cleanArgs);
    }
  }

  @action _sendIPCMessageToAllServices({ channel, args }) {
    for (const s of this.all) {
      this.actions.service.sendIPCMessage({
        serviceId: s.id,
        channel,
        args,
      });
    }
  }

  @action _openWindow({ event }) {
    if (event.url !== 'about:blank') {
      event.preventDefault();
      this.actions.app.openExternalUrl({ url: event.url });
    }
  }

  @action _filter({ needle }) {
    this.filterNeedle = needle;
  }

  @action _resetFilter() {
    this.filterNeedle = null;
  }

  @action _resetStatus() {
    this.actionStatus = [];
  }

  @action _reload({ serviceId }) {
    const service = this.one(serviceId);
    if (!service.isEnabled) return;

    service.resetMessageCount();
    service.lostRecipeConnection = false;

    if (service.isTodosService) {
      this.actions.todos.reload();
      return;
    }

    if (!service.webview) return;
    // eslint-disable-next-line consistent-return
    return service.webview.loadURL(service.url);
  }

  @action _reloadActive() {
    const service = this.active;
    if (service) {
      this._reload({
        serviceId: service.id,
      });
    } else {
      debug('No service is active');
    }
  }

  @action _reloadAll() {
    for (const s of this.enabled) {
      this._reload({
        serviceId: s.id,
      });
    }
  }

  @action _reloadUpdatedServices() {
    this._reloadAll();
    this.actions.ui.toggleServiceUpdatedInfoBar({ visible: false });
  }

  @action _reorder(params) {
    const { workspaces } = this.stores;
    if (workspaces.isAnyWorkspaceActive) {
      workspaces.reorderServicesOfActiveWorkspace(params);
    } else {
      this._reorderService(params);
    }
  }

  @action _reorderService({ oldIndex, newIndex }) {
    const { showDisabledServices } = this.stores.settings.all.app;
    const oldEnabledSortIndex = showDisabledServices
      ? oldIndex
      : this.all.indexOf(this.enabled[oldIndex]);
    const newEnabledSortIndex = showDisabledServices
      ? newIndex
      : this.all.indexOf(this.enabled[newIndex]);

    this.all.splice(
      newEnabledSortIndex,
      0,
      this.all.splice(oldEnabledSortIndex, 1)[0],
    );

    const services = {};
    // TODO: simplify this
    for (const [index] of this.all.entries()) {
      services[this.all[index].id] = index;
    }

    this.reorderServicesRequest.execute(services);
    this.allServicesRequest.patch((data: Service[]) => {
      for (const s of data) {
        s.order = services[s.id];
      }
    });
  }

  @action _toggleNotifications({ serviceId }) {
    const service = this.one(serviceId);

    this.actions.service.updateService({
      serviceId,
      serviceData: {
        isNotificationEnabled: !service.isNotificationEnabled,
      },
      redirect: false,
    });
  }

  @action _toggleAudio({ serviceId }) {
    const service = this.one(serviceId);

    this.actions.service.updateService({
      serviceId,
      serviceData: {
        isMuted: !service.isMuted,
      },
      redirect: false,
    });
  }

  @action _toggleDarkMode({ serviceId }) {
    const service = this.one(serviceId);

    this.actions.service.updateService({
      serviceId,
      serviceData: {
        isDarkModeEnabled: !service.isDarkModeEnabled,
      },
      redirect: false,
    });
  }

  @action _openDevTools({ serviceId }) {
    const service = this.one(serviceId);
    if (service.isTodosService) {
      this.actions.todos.openDevTools();
    } else if (service.webview) {
      service.webview.openDevTools();
    }
  }

  @action _openDevToolsForActiveService() {
    const service = this.active;

    if (service) {
      this._openDevTools({ serviceId: service.id });
    } else {
      debug('No service is active');
    }
  }

  @action _hibernate({ serviceId }) {
    const service = this.one(serviceId);
    if (!service.canHibernate) {
      return;
    }

    debug(`Hibernate ${service.name}`);

    service.isHibernationRequested = true;
    service.lastHibernated = Date.now();
  }

  @action _awake({
    serviceId,
    automatic,
  }: {
    serviceId: string;
    automatic?: boolean;
  }) {
    const now = Date.now();
    const service = this.one(serviceId);
    const automaticTag = automatic ? ' automatically ' : ' ';
    debug(
      `Waking up${automaticTag}from service hibernation for ${service.name}`,
    );

    if (automatic) {
      // if this is an automatic wake up, use the wakeUpHibernationStrategy
      // which sets the lastUsed time to an offset from now rather than to now.
      // Also add an optional random splay to desync the wakeups and
      // potentially reduce load.
      //
      // offsetNow = now - (hibernationStrategy - wakeUpHibernationStrategy)
      //
      // if wUHS = hS = 60, offsetNow = now.  hibernation again in 60 seconds.
      //
      // if wUHS = 20 and hS = 60, offsetNow = now - 40.  hibernation again in
      // 20 seconds.
      //
      // possibly also include splay in wUHS before subtracting from hS.
      //
      const mainStrategy = this.stores.settings.all.app.hibernationStrategy;
      let strategy = this.stores.settings.all.app.wakeUpHibernationStrategy;
      debug(`wakeUpHibernationStrategy = ${strategy}`);
      debug(`hibernationStrategy = ${mainStrategy}`);
      if (!strategy || strategy < 1) {
        strategy = this.stores.settings.all.app.hibernationStrategy;
      }
      let splay = 0;
      // Add splay.  This will keep the service awake a little longer.
      if (
        this.stores.settings.all.app.wakeUpHibernationSplay &&
        Math.random() >= 0.5
      ) {
        // Add 10 additional seconds 50% of the time.
        splay = 10;
        debug('Added splay');
      } else {
        debug('skipping splay');
      }
      // wake up again in strategy + splay seconds instead of mainStrategy seconds.
      service.lastUsed = now - ms(`${mainStrategy - (strategy + splay)}s`);
    } else {
      service.lastUsed = now;
    }
    debug(
      `Setting service.lastUsed to ${service.lastUsed} (${
        (now - service.lastUsed) / 1000
      }s ago)`,
    );
    service.isHibernationRequested = false;
    service.lastHibernated = null;
  }

  @action _resetLastPollTimer({ serviceId = null }) {
    debug(
      `Reset last poll timer for ${
        serviceId ? `service: "${serviceId}"` : 'all services'
      }`,
    );

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const resetTimer = (service: Service) => {
      // eslint-disable-next-line no-param-reassign
      service.lastPollAnswer = Date.now();
      // eslint-disable-next-line no-param-reassign
      service.lastPoll = Date.now();
    };

    if (serviceId) {
      const service = this.one(serviceId);
      if (service) {
        resetTimer(service);
      }
    } else {
      for (const service of this.allDisplayed) resetTimer(service);
    }
  }

  // Reactions
  _focusServiceReaction() {
    const service = this.active;
    if (service) {
      this.actions.service.focusService({ serviceId: service.id });
      document.title = `Ferdium - ${service.name} ${
        service.dialogTitle ? ` - ${service.dialogTitle}` : ''
      } ${service._webview ? `- ${service._webview.getTitle()}` : ''}`;
    } else {
      debug('No service is active');
    }
  }

  _saveActiveService() {
    const service = this.active;
    if (service) {
      this.actions.settings.update({
        type: 'service',
        data: {
          activeService: service.id,
        },
      });
    } else {
      debug('No service is active');
    }
  }

  _mapActiveServiceToServiceModelReaction() {
    const { activeService } = this.stores.settings.all.service;
    if (this.allDisplayed.length > 0) {
      for (const service of this.allDisplayed) {
        this._setIsActive(
          service,
          activeService
            ? activeService === service.id
            : this.allDisplayed[0].id === service.id,
        );
      }
    }
  }

  _getUnreadMessageCountReaction() {
    const { showMessageBadgeWhenMuted } = this.stores.settings.all.app;
    const { showMessageBadgesEvenWhenMuted } = this.stores.ui;

    const unreadServices: UnreadServices = [];
    let unreadDirectMessageCount = 0;
    let unreadIndirectMessageCount = 0;

    if (showMessageBadgesEvenWhenMuted) {
      for (const s of this.allDisplayed) {
        if (s.isBadgeEnabled) {
          const direct =
            showMessageBadgeWhenMuted || s.isNotificationEnabled
              ? s.unreadDirectMessageCount
              : 0;
          const indirect =
            showMessageBadgeWhenMuted && s.isIndirectMessageBadgeEnabled
              ? s.unreadIndirectMessageCount
              : 0;
          unreadDirectMessageCount += direct;
          unreadIndirectMessageCount += indirect;
          if (direct > 0 || indirect > 0) {
            unreadServices.push([s.name, direct, indirect]);
          }
        }
      }
    }

    // We can't just block this earlier, otherwise the mobx reaction won't be aware of the vars to watch in some cases
    if (showMessageBadgesEvenWhenMuted) {
      this.actions.app.setBadge({
        unreadDirectMessageCount,
        unreadIndirectMessageCount,
      });
      ipcRenderer.send(
        'updateDBusUnread',
        unreadDirectMessageCount,
        unreadIndirectMessageCount,
        unreadServices,
      );
    }
  }

  _logoutReaction() {
    if (!this.stores.user.isLoggedIn) {
      this.actions.settings.remove({
        type: 'service',
        key: 'activeService',
      });
      this.allServicesRequest.invalidate().reset();
    }
  }

  _handleMuteSettings() {
    const { enabled } = this;
    const { isAppMuted } = this.stores.settings.app;

    for (const service of enabled) {
      const { isAttached } = service;
      const isMuted = isAppMuted || service.isMuted;

      if (isAttached && service.webview) {
        service.webview.audioMuted = isMuted;
      }
    }
  }

  _shareSettingsWithServiceProcess(): void {
    const settings = {
      ...this.stores.settings.app,
      isDarkThemeActive: this.stores.ui.isDarkThemeActive,
    };
    this.actions.service.sendIPCMessageToAllServices({
      channel: 'settings-update',
      args: settings,
    });
  }

  _cleanUpTeamIdAndCustomUrl(recipeId: string, data: Service): any {
    const serviceData = data;
    const recipe = this.stores.recipes.one(recipeId);

    if (!recipe) return;

    if (
      recipe.hasTeamId &&
      recipe.hasCustomUrl &&
      data.team &&
      data.customUrl
    ) {
      // @ts-expect-error The operand of a 'delete' operator must be optional.
      delete serviceData.team;
    }

    // eslint-disable-next-line consistent-return
    return serviceData;
  }

  _checkForActiveService() {
    if (
      !this.stores.router.location ||
      this.stores.router.location.pathname.includes('auth/signup')
    ) {
      return;
    }

    if (
      this.allDisplayed.findIndex(service => service.isActive) === -1 &&
      this.allDisplayed.length > 0
    ) {
      debug('No active service found, setting active service to index 0');

      this._setActive({ serviceId: this.allDisplayed[0].id });
    }
  }

  // Helper
  _initializeServiceRecipeInWebview(serviceId: string) {
    const service = this.one(serviceId);

    if (service.webview) {
      // We need to completely clone the object, otherwise Electron won't be able to send the object via IPC
      const shareWithWebview = cleanseJSObject(service.shareWithWebview);

      debug('Initialize recipe', service.recipe.id, service.name);
      service.webview.send(
        'initialize-recipe',
        {
          ...shareWithWebview,
          franzVersion: ferdiumVersion,
        },
        service.recipe,
      );
    }
  }

  _initRecipePolling(serviceId: string) {
    const service = this.one(serviceId);

    const delay = ms('2s');

    if (service) {
      if (service.timer !== null) {
        clearTimeout(service.timer);
      }

      const loop = () => {
        if (!service.webview) return;

        service.webview.send('poll');

        service.timer = setTimeout(loop, delay);
        service.lastPoll = Date.now();
      };

      loop();
    }
  }

  _wrapIndex(index: number, delta: number, size: number) {
    return (((index + delta) % size) + size) % size;
  }
}
