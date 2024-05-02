import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import type { Params } from 'react-router-dom';
import type { StoresProps } from '../../@types/ferdium-components.types';
import type { FormFields } from '../../@types/mobx-form.types';
import EditServiceForm from '../../components/settings/services/EditServiceForm';
import ServiceError from '../../components/settings/services/ServiceError';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import withParams from '../../components/util/WithParams';
import { DEFAULT_APP_SETTINGS, DEFAULT_SERVICE_SETTINGS } from '../../config';
import { config as proxyFeature } from '../../features/serviceProxy';
import { getSelectOptions } from '../../helpers/i18n-helpers';
import { url, oneRequired, required } from '../../helpers/validation-helpers';
import globalMessages from '../../i18n/globalMessages';
import { SPELLCHECKER_LOCALES } from '../../i18n/languages';
import { ifUndefined } from '../../jsUtils';
import Form from '../../lib/Form';
import type { IRecipe } from '../../models/Recipe';
import type Service from '../../models/Service';

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
  enableMediaBadge: {
    id: 'settings.service.form.enableMediaBadge',
    defaultMessage: 'Enable Media Play Indicator',
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
  useFavicon: {
    id: 'settings.service.form.useFavicon',
    defaultMessage: 'Use service favicon instead of default or custom icon',
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

interface IProxyConfig {
  isEnabled?: boolean;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
}

interface IProps extends StoresProps, WrappedComponentProps {
  params: Params;
}

@inject('stores', 'actions')
@observer
class EditServiceScreen extends Component<IProps> {
  onSubmit(data: any): void {
    const { action } = this.props.params;
    const { recipes, services } = this.props.stores;
    const { createService, updateService } = this.props.actions.service;
    // eslint-disable-next-line no-param-reassign
    data.darkReaderSettings = {
      brightness: data.darkReaderBrightness,
      contrast: data.darkReaderContrast,
      sepia: data.darkReaderSepia,
    };
    // eslint-disable-next-line no-param-reassign
    delete data.darkReaderContrast;
    // eslint-disable-next-line no-param-reassign
    delete data.darkReaderBrightness;
    // eslint-disable-next-line no-param-reassign
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
    const { stores, intl } = this.props;

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
        stores.settings.app.spellcheckerLanguage === 'automatic'
          ? ''
          : intl.formatMessage(globalMessages.spellcheckerAutomaticDetection),
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
          value: ifUndefined<boolean>(
            service?.isEnabled,
            DEFAULT_SERVICE_SETTINGS.isEnabled,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isEnabled,
          type: 'checkbox',
        },
        isHibernationEnabled: {
          label: intl.formatMessage(messages.enableHibernation),
          value: ifUndefined<boolean>(
            service?.isHibernationEnabled,
            DEFAULT_SERVICE_SETTINGS.isHibernationEnabled,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isHibernationEnabled,
          type: 'checkbox',
        },
        isWakeUpEnabled: {
          label: intl.formatMessage(messages.enableWakeUp),
          value: ifUndefined<boolean>(
            service?.isWakeUpEnabled,
            DEFAULT_SERVICE_SETTINGS.isWakeUpEnabled,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isWakeUpEnabled,
          type: 'checkbox',
        },
        isNotificationEnabled: {
          label: intl.formatMessage(messages.enableNotification),
          value: ifUndefined<boolean>(
            service?.isNotificationEnabled,
            DEFAULT_SERVICE_SETTINGS.isNotificationEnabled,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isNotificationEnabled,
          type: 'checkbox',
        },
        isBadgeEnabled: {
          label: intl.formatMessage(messages.enableBadge),
          value: ifUndefined<boolean>(
            service?.isBadgeEnabled,
            DEFAULT_SERVICE_SETTINGS.isBadgeEnabled,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isBadgeEnabled,
          type: 'checkbox',
        },
        isMediaBadgeEnabled: {
          label: intl.formatMessage(messages.enableMediaBadge),
          value: ifUndefined<boolean>(
            service?.isMediaBadgeEnabled,
            DEFAULT_SERVICE_SETTINGS.isMediaBadgeEnabled,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isMediaBadgeEnabled,
          type: 'checkbox',
        },
        trapLinkClicks: {
          label: intl.formatMessage(messages.trapLinkClicks),
          value: ifUndefined<boolean>(
            service?.trapLinkClicks,
            DEFAULT_SERVICE_SETTINGS.trapLinkClicks,
          ),
          default: DEFAULT_SERVICE_SETTINGS.trapLinkClicks,
          type: 'checkbox',
        },
        useFavicon: {
          label: intl.formatMessage(messages.useFavicon),
          value: ifUndefined<boolean>(
            service?.useFavicon,
            DEFAULT_SERVICE_SETTINGS.useFavicon,
          ),
          default: DEFAULT_SERVICE_SETTINGS.useFavicon,
          type: 'checkbox',
        },
        isMuted: {
          label: intl.formatMessage(messages.enableAudio),
          value: !ifUndefined<boolean>(
            service?.isMuted,
            DEFAULT_SERVICE_SETTINGS.isMuted,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isMuted,
          type: 'checkbox',
        },
        customIcon: {
          label: intl.formatMessage(messages.icon),
          value: service?.hasCustomUploadedIcon ? service.icon : null,
          type: 'file',
        },
        isDarkModeEnabled: {
          label: intl.formatMessage(messages.enableDarkMode),
          value: ifUndefined<boolean>(
            service?.isDarkModeEnabled,
            stores.settings.app.darkMode,
          ),
          default: stores.settings.app.darkMode,
          type: 'checkbox',
        },
        darkReaderBrightness: {
          label: intl.formatMessage(messages.darkReaderBrightness),
          value: service?.darkReaderSettings
            ? service.darkReaderSettings.brightness
            : DEFAULT_SERVICE_SETTINGS.darkReaderBrightness,
          default: DEFAULT_SERVICE_SETTINGS.darkReaderBrightness,
        },
        darkReaderContrast: {
          label: intl.formatMessage(messages.darkReaderContrast),
          value: service?.darkReaderSettings
            ? service.darkReaderSettings.contrast
            : DEFAULT_SERVICE_SETTINGS.darkReaderContrast,
          default: DEFAULT_SERVICE_SETTINGS.darkReaderContrast,
        },
        darkReaderSepia: {
          label: intl.formatMessage(messages.darkReaderSepia),
          value: service?.darkReaderSettings
            ? service.darkReaderSettings.sepia
            : DEFAULT_SERVICE_SETTINGS.darkReaderSepia,
          default: DEFAULT_SERVICE_SETTINGS.darkReaderSepia,
        },
        isProgressbarEnabled: {
          label: intl.formatMessage(messages.enableProgressbar),
          value: ifUndefined<boolean>(
            service?.isProgressbarEnabled,
            DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled,
          ),
          default: DEFAULT_SERVICE_SETTINGS.isProgressbarEnabled,
          type: 'checkbox',
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
          value: ifUndefined<string>(
            service?.userAgentPref,
            DEFAULT_APP_SETTINGS.userAgentPref,
          ),
          default: DEFAULT_APP_SETTINGS.userAgentPref,
        },
      },
    };

    if (recipe.hasTeamId) {
      config.fields.team = {
        label: intl.formatMessage(messages.team),
        placeholder: intl.formatMessage(messages.team),
        value: service?.team,
        validators: [required],
      };
    }

    if (recipe.hasCustomUrl) {
      config.fields.customUrl = {
        label: intl.formatMessage(messages.customUrl),
        placeholder: "'http://' or 'https://' or 'file:///'",
        value: service?.customUrl || recipe.serviceURL,
        validators: [required, url],
      };
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
      config.fields = {
        ...config.fields,
        isIndirectMessageBadgeEnabled: {
          label: intl.formatMessage(messages.indirectMessages),
          value: ifUndefined<boolean>(
            service?.isIndirectMessageBadgeEnabled,
            DEFAULT_SERVICE_SETTINGS.hasIndirectMessages,
          ),
          default: DEFAULT_SERVICE_SETTINGS.hasIndirectMessages,
          type: 'checkbox',
        },
      };
    }

    if (recipe.allowFavoritesDelineationInUnreadCount) {
      config.fields = {
        ...config.fields,
        onlyShowFavoritesInUnreadCount: {
          label: intl.formatMessage(messages.onlyShowFavoritesInUnreadCount),
          value: ifUndefined<boolean>(
            service?.onlyShowFavoritesInUnreadCount,
            DEFAULT_SERVICE_SETTINGS.onlyShowFavoritesInUnreadCount,
          ),
          default: DEFAULT_SERVICE_SETTINGS.onlyShowFavoritesInUnreadCount,
          type: 'checkbox',
        },
      };
    }

    if (proxy.isEnabled) {
      const serviceProxyConfig: IProxyConfig = service
        ? /*
          TODO: [TS DEBT] find out why sometimes proxy[service.id] gives undefined
          Note in proxy service id exist as key but value is undefined rather that proxy empty object

          Temp fix - or-ed {} (to stores.settings.proxy[service.id] ) to avoid undefined proxy in settingStore throw error
          */
          stores.settings.proxy[service.id] || {}
        : {};

      config.fields = {
        ...config.fields,
        proxy: {
          name: 'proxy',
          label: 'proxy',
          fields: {
            isEnabled: {
              label: intl.formatMessage(messages.enableProxy),
              value: ifUndefined<boolean>(
                serviceProxyConfig.isEnabled,
                DEFAULT_SERVICE_SETTINGS.isProxyFeatureEnabled,
              ),
              default: DEFAULT_SERVICE_SETTINGS.isProxyFeatureEnabled,
              type: 'checkbox',
            },
            host: {
              label: intl.formatMessage(messages.proxyHost),
              value: ifUndefined<string>(
                serviceProxyConfig.host,
                DEFAULT_SERVICE_SETTINGS.proxyHost,
              ),
              default: DEFAULT_SERVICE_SETTINGS.proxyHost,
            },
            port: {
              label: intl.formatMessage(messages.proxyPort),
              value: ifUndefined<number>(
                serviceProxyConfig.port,
                DEFAULT_SERVICE_SETTINGS.proxyPort,
              ),
              default: DEFAULT_SERVICE_SETTINGS.proxyPort,
            },
            user: {
              label: intl.formatMessage(messages.proxyUser),
              value: ifUndefined<string>(
                serviceProxyConfig.user,
                DEFAULT_SERVICE_SETTINGS.proxyUser,
              ),
              default: DEFAULT_SERVICE_SETTINGS.proxyUser,
            },
            password: {
              label: intl.formatMessage(messages.proxyPassword),
              value: ifUndefined<string>(
                serviceProxyConfig.password,
                DEFAULT_SERVICE_SETTINGS.proxyPassword,
              ),
              default: DEFAULT_SERVICE_SETTINGS.proxyPassword,
              type: 'password',
            },
          },
        },
      };
    }

    return new Form(config);
  }

  deleteService(): void {
    const { action } = this.props.params;

    if (action === 'edit') {
      const { deleteService } = this.props.actions.service;
      const { activeSettings: service } = this.props.stores.services;
      deleteService({
        serviceId: service?.id,
        redirect: '/settings/services',
      });
    }
  }

  clearCache(): void {
    const { action } = this.props.params;

    if (action === 'edit') {
      const { clearCache } = this.props.actions.service;
      const { activeSettings: service } = this.props.stores.services;
      clearCache({ serviceId: service?.id });
    }
  }

  openRecipeFile(file: any): void {
    const { openRecipeFile } = this.props.actions.service;
    const { action } = this.props.params;

    if (action === 'edit') {
      const { activeSettings: service } = this.props.stores.services;
      openRecipeFile({
        recipe: service?.recipe.id,
        file,
      });
    }
  }

  render(): ReactElement {
    const {
      recipes,
      services,
      //  user
    } = this.props.stores;
    const { action } = this.props.params;

    let recipe: IRecipe | null = null;
    let service: Service | null = null;
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
          // user={user.data} // TODO: [TS DEBT] Need to check why its passed as its not used inside EditServiceForm
          form={form}
          // status={services.actionStatus} // TODO: [TS DEBT] Need to check why its passed as its not used inside EditServiceForm
          isSaving={
            services.updateServiceRequest.isExecuting ||
            services.createServiceRequest.isExecuting
          }
          isDeleting={services.deleteServiceRequest.isExecuting}
          onSubmit={d => this.onSubmit(d)}
          onDelete={() => this.deleteService()}
          onClearCache={() => this.clearCache()}
          openRecipeFile={file => this.openRecipeFile(file)}
          isProxyFeatureEnabled={proxyFeature.isEnabled}
        />
      </ErrorBoundary>
    );
  }
}

export default withParams(injectIntl(EditServiceScreen));
