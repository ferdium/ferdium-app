import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';

import { RouterStore } from 'mobx-react-router';
import { StoresProps } from 'src/@types/ferdium-components.types';
import { IRecipe } from 'src/models/Recipe';
import Service from 'src/models/Service';
import { FormFields } from 'src/@types/mobx-form.types';
import Form from '../../lib/Form';

import ServiceError from '../../components/settings/services/ServiceError';
import EditServiceForm from '../../components/settings/services/EditServiceForm';
import ErrorBoundary from '../../components/util/ErrorBoundary';

import { required, url, oneRequired } from '../../helpers/validation-helpers';
import { getSelectOptions } from '../../helpers/i18n-helpers';

import { config as proxyFeature } from '../../features/serviceProxy';

import { SPELLCHECKER_LOCALES } from '../../i18n/languages';

import globalMessages from '../../i18n/globalMessages';
import { DEFAULT_APP_SETTINGS, DEFAULT_SERVICE_SETTINGS } from '../../config';

const messages = defineMessages({
  name: {
    id: 'settings.service.form.name',
    defaultMessage: 'Name',
  },
  enableService: {
    id: 'settings.service.form.enableService',
    defaultMessage: 'Enable service',
  },
  enableHibernation: {
    id: 'settings.service.form.enableHibernation',
    defaultMessage: 'Enable hibernation',
  },
  enableWakeUp: {
    id: 'settings.service.form.enableWakeUp',
    defaultMessage: 'Enable wake up',
  },
  enableNotification: {
    id: 'settings.service.form.enableNotification',
    defaultMessage: 'Enable notifications',
  },
  enableBadge: {
    id: 'settings.service.form.enableBadge',
    defaultMessage: 'Show unread message badges',
  },
  enableAudio: {
    id: 'settings.service.form.enableAudio',
    defaultMessage: 'Enable audio',
  },
  team: {
    id: 'settings.service.form.team',
    defaultMessage: 'Team',
  },
  customUrl: {
    id: 'settings.service.form.customUrl',
    defaultMessage: 'Custom server',
  },
  indirectMessages: {
    id: 'settings.service.form.indirectMessages',
    defaultMessage: 'Show message badge for all new messages',
  },
  icon: {
    id: 'settings.service.form.icon',
    defaultMessage: 'Custom icon',
  },
  enableDarkMode: {
    id: 'settings.service.form.enableDarkMode',
    defaultMessage: 'Enable Dark Mode',
  },
  darkReaderBrightness: {
    id: 'settings.service.form.darkReaderBrightness',
    defaultMessage: 'Dark Reader Brightness',
  },
  darkReaderContrast: {
    id: 'settings.service.form.darkReaderContrast',
    defaultMessage: 'Dark Reader Contrast',
  },
  darkReaderSepia: {
    id: 'settings.service.form.darkReaderSepia',
    defaultMessage: 'Dark Reader Sepia',
  },
  enableProgressbar: {
    id: 'settings.service.form.enableProgressbar',
    defaultMessage: 'Enable Progress bar',
  },
  trapLinkClicks: {
    id: 'settings.service.form.trapLinkClicks',
    defaultMessage: 'Open URLs within Ferdium',
  },
  onlyShowFavoritesInUnreadCount: {
    id: 'settings.service.form.onlyShowFavoritesInUnreadCount',
    defaultMessage: 'Only show Favorites in unread count',
  },
  enableProxy: {
    id: 'settings.service.form.proxy.isEnabled',
    defaultMessage: 'Use Proxy',
  },
  proxyHost: {
    id: 'settings.service.form.proxy.host',
    defaultMessage: 'Proxy Host/IP',
  },
  proxyPort: {
    id: 'settings.service.form.proxy.port',
    defaultMessage: 'Port',
  },
  proxyUser: {
    id: 'settings.service.form.proxy.user',
    defaultMessage: 'User (optional)',
  },
  proxyPassword: {
    id: 'settings.service.form.proxy.password',
    defaultMessage: 'Password (optional)',
  },
});

interface EditServicesScreenProps extends StoresProps {
  router: RouterStore;
  intl: any;
}

class EditServiceScreen extends Component<EditServicesScreenProps> {
  onSubmit(data: any) {
    // @ts-ignore TODO: This is actually there and we don't have a correct type right now.
    const { action } = this.props.router.params;
    const { recipes, services } = this.props.stores;
    const { createService, updateService } = this.props.actions.service;
    data.darkReaderSettings = {
      brightness: data.darkReaderBrightness,
      contrast: data.darkReaderContrast,
      sepia: data.darkReaderSepia,
    };
    delete data.darkReaderContrast;
    delete data.darkReaderBrightness;
    delete data.darkReaderSepia;

    const serviceData = data;
    serviceData.isMuted = !serviceData.isMuted;

    if (action === 'edit') {
      updateService({ serviceId: services.activeSettings?.id, serviceData });
    } else {
      createService({ recipeId: recipes.active?.id, serviceData });
    }
  }

  prepareForm(recipe: IRecipe, service: Service | null, proxy: any): Form {
    const { intl } = this.props;

    const { stores, router } = this.props;

    // @ts-ignore TODO: This is actually there and we don't have a correct type right now.
    const { action } = router.params;

    let defaultSpellcheckerLanguage =
      SPELLCHECKER_LOCALES[stores.settings.app.spellcheckerLanguage];

    if (stores.settings.app.spellcheckerLanguage === 'automatic') {
      defaultSpellcheckerLanguage = intl.formatMessage(
        globalMessages.spellcheckerAutomaticDetectionShort,
      );
    }

    const spellcheckerLanguage = getSelectOptions({
      locales: SPELLCHECKER_LOCALES,
      resetToDefaultText: intl.formatMessage(
        globalMessages.spellcheckerSystemDefault,
        { default: defaultSpellcheckerLanguage },
      ),
      automaticDetectionText:
        stores.settings.app.spellcheckerLanguage !== 'automatic'
          ? intl.formatMessage(globalMessages.spellcheckerAutomaticDetection)
          : '',
    });

    const config: FormFields = {
      fields: {
        name: {
          label: intl.formatMessage(messages.name),
          placeholder: intl.formatMessage(messages.name),
          value: service?.id ? service.name : recipe.name,
        },
        isEnabled: {
          label: intl.formatMessage(messages.enableService),
          value: service?.isEnabled,
          default: DEFAULT_SERVICE_SETTINGS.isEnabled,
        },
        isHibernationEnabled: {
          label: intl.formatMessage(messages.enableHibernation),
          value:
            action !== 'edit'
              ? recipe.autoHibernate
              : service?.isHibernationEnabled,
          default: DEFAULT_SERVICE_SETTINGS.isHibernationEnabled,
        },
        isWakeUpEnabled: {
          label: intl.formatMessage(messages.enableWakeUp),
          value: service?.isWakeUpEnabled,
          default: DEFAULT_SERVICE_SETTINGS.isWakeUpEnabled,
        },
        isNotificationEnabled: {
          label: intl.formatMessage(messages.enableNotification),
          value: service?.isNotificationEnabled,
          default: DEFAULT_SERVICE_SETTINGS.isNotificationEnabled,
        },
        isBadgeEnabled: {
          label: intl.formatMessage(messages.enableBadge),
          value: service?.isBadgeEnabled,
          default: DEFAULT_SERVICE_SETTINGS.isBadgeEnabled,
        },
        trapLinkClicks: {
          label: intl.formatMessage(messages.trapLinkClicks),
          value: service?.trapLinkClicks,
          default: DEFAULT_SERVICE_SETTINGS.trapLinkClicks,
        },
        isMuted: {
          label: intl.formatMessage(messages.enableAudio),
          value: !service?.isMuted,
          default: DEFAULT_SERVICE_SETTINGS.isMuted,
        },
        customIcon: {
          label: intl.formatMessage(messages.icon),
          value: service?.hasCustomUploadedIcon ? service?.icon : false,
          default: null,
          type: 'file',
        },
        isDarkModeEnabled: {
          label: intl.formatMessage(messages.enableDarkMode),
          value: service?.isDarkModeEnabled,
          default: stores.settings.app.darkMode,
        },
        darkReaderBrightness: {
          label: intl.formatMessage(messages.darkReaderBrightness),
          value: service?.darkReaderSettings
            ? service?.darkReaderSettings.brightness
            : undefined,
          default: 100,
        },
        darkReaderContrast: {
          label: intl.formatMessage(messages.darkReaderContrast),
          value: service?.darkReaderSettings
            ? service?.darkReaderSettings.contrast
            : undefined,
          default: 90,
        },
        darkReaderSepia: {
          label: intl.formatMessage(messages.darkReaderSepia),
          value: service?.darkReaderSettings
            ? service?.darkReaderSettings.sepia
            : undefined,
          default: 10,
        },
        isProgressbarEnabled: {
          label: intl.formatMessage(messages.enableProgressbar),
          value: service?.isProgressbarEnabled,
          default: DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled,
        },
        spellcheckerLanguage: {
          label: intl.formatMessage(globalMessages.spellcheckerLanguage),
          value: service?.spellcheckerLanguage,
          options: spellcheckerLanguage,
          disabled: !stores.settings.app.enableSpellchecking,
        },
        userAgentPref: {
          label: intl.formatMessage(globalMessages.userAgentPref),
          placeholder: service?.defaultUserAgent,
          value: service?.userAgentPref || '',
        },
      },
    };

    if (recipe.hasTeamId) {
      Object.assign(config.fields, {
        team: {
          label: intl.formatMessage(messages.team),
          placeholder: intl.formatMessage(messages.team),
          value: service?.team,
          validators: [required],
        },
      });
    }

    if (recipe.hasCustomUrl) {
      Object.assign(config.fields, {
        customUrl: {
          label: intl.formatMessage(messages.customUrl),
          placeholder: "'http://' or 'https://' or 'file:///'",
          value: service?.customUrl || recipe.serviceURL,
          validators: [required, url],
        },
      });
    }

    // More fine grained and use case specific validation rules
    if (recipe.hasTeamId && recipe.hasCustomUrl) {
      config.fields.team.validators = [oneRequired(['team', 'customUrl'])];
      config.fields.customUrl.validators = [
        url,
        oneRequired(['team', 'customUrl']),
      ];
    }

    // If a service can be hosted and has a teamId or customUrl
    if (recipe.hasHostedOption && (recipe.hasTeamId || recipe.hasCustomUrl)) {
      if (config.fields.team) {
        config.fields.team.validators = [];
      }
      if (config.fields.customUrl) {
        config.fields.customUrl.validators = [url];
      }
    }

    if (recipe.hasIndirectMessages) {
      Object.assign(config.fields, {
        isIndirectMessageBadgeEnabled: {
          label: intl.formatMessage(messages.indirectMessages),
          value: service?.isIndirectMessageBadgeEnabled,
          default: DEFAULT_SERVICE_SETTINGS.hasIndirectMessages,
        },
      });
    }

    if (recipe.allowFavoritesDelineationInUnreadCount) {
      Object.assign(config.fields, {
        onlyShowFavoritesInUnreadCount: {
          label: intl.formatMessage(messages.onlyShowFavoritesInUnreadCount),
          value: service?.onlyShowFavoritesInUnreadCount,
          default: DEFAULT_APP_SETTINGS.onlyShowFavoritesInUnreadCount,
        },
      });
    }

    if (proxy.isEnabled) {
      let serviceProxyConfig: {
        isEnabled?: boolean;
        host?: string;
        port?: number;
        user?: string;
        password?: string;
      } = {};
      if (service) {
        serviceProxyConfig = stores.settings.proxy[service.id] || {};
      }

      Object.assign(config.fields, {
        proxy: {
          name: 'proxy',
          label: 'proxy',
          fields: {
            isEnabled: {
              label: intl.formatMessage(messages.enableProxy),
              value: serviceProxyConfig.isEnabled,
              default: DEFAULT_APP_SETTINGS.proxyFeatureEnabled,
            },
            host: {
              label: intl.formatMessage(messages.proxyHost),
              value: serviceProxyConfig.host,
              default: '',
            },
            port: {
              label: intl.formatMessage(messages.proxyPort),
              value: serviceProxyConfig.port,
              default: '',
            },
            user: {
              label: intl.formatMessage(messages.proxyUser),
              value: serviceProxyConfig.user,
              default: '',
            },
            password: {
              label: intl.formatMessage(messages.proxyPassword),
              value: serviceProxyConfig.password,
              default: '',
              type: 'password',
            },
          },
        },
      });
    }

    // @ts-ignore: Remove this ignore once mobx-react-form v4 with typescript
    // support has been released.
    return new Form(config);
  }

  deleteService(): void {
    const { deleteService } = this.props.actions.service;
    // @ts-ignore TODO: This is actually there and we don't have a correct type right now.
    const { action } = this.props.router.params;

    if (action === 'edit') {
      const { activeSettings: service } = this.props.stores.services;
      deleteService({
        serviceId: service?.id,
        redirect: '/settings/services',
      });
    }
  }

  openRecipeFile(file: any): void {
    const { openRecipeFile } = this.props.actions.service;
    // @ts-ignore TODO: This is actually there and we don't have a correct type right now.
    const { action } = this.props.router.params;

    if (action === 'edit') {
      const { activeSettings: service } = this.props.stores.services;
      openRecipeFile({
        recipe: service?.recipe.id,
        file,
      });
    }
  }

  render(): ReactElement {
    const { recipes, services, user } = this.props.stores;

    // @ts-ignore TODO: This is actually there and we don't have a correct type right now.
    const { action } = this.props.router.params;

    let recipe: null | IRecipe = null;
    let service: null | Service = null;
    let isLoading = false;

    if (action === 'add') {
      recipe = recipes.active;

      // TODO: render error message when recipe is `null`
      if (!recipe) {
        return <ServiceError />;
      }
    } else {
      service = services.activeSettings;
      isLoading = services.allServicesRequest.isExecuting;

      if (!isLoading && service) {
        recipe = service.recipe;
      }
    }

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!recipe) {
      return <div>something went wrong</div>;
    }

    const form = this.prepareForm(recipe, service, proxyFeature);

    return (
      <ErrorBoundary>
        <EditServiceForm
          action={action}
          recipe={recipe}
          service={service}
          user={user.data}
          form={form}
          status={services.actionStatus}
          isSaving={
            services.updateServiceRequest.isExecuting ||
            services.createServiceRequest.isExecuting
          }
          isDeleting={services.deleteServiceRequest.isExecuting}
          onSubmit={d => this.onSubmit(d)}
          onDelete={() => this.deleteService()}
          openRecipeFile={file => this.openRecipeFile(file)}
          isProxyFeatureEnabled={proxyFeature.isEnabled}
        />
      </ErrorBoundary>
    );
  }
}

export default injectIntl<'intl', EditServicesScreenProps>(
  inject('stores', 'actions')(observer(EditServiceScreen)),
);
