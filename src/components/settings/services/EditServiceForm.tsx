import { mdiInformation } from '@mdi/js';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component, type FormEvent, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { Link } from 'react-router-dom';
import { isMac } from '../../../environment';
import { normalizedUrl } from '../../../helpers/url-helpers';
import globalMessages from '../../../i18n/globalMessages';
import type Form from '../../../lib/Form';
import type { IRecipe } from '../../../models/Recipe';
import type Service from '../../../models/Service';
import Select from '../../ui/Select';
import Slider from '../../ui/Slider';
import TabItem from '../../ui/Tabs/TabItem';
import Tabs from '../../ui/Tabs/Tabs';
import Button from '../../ui/button';
import { H3 } from '../../ui/headline';
import Icon from '../../ui/icon';
import ImageUpload from '../../ui/imageUpload';
import Input from '../../ui/input/index';
import Toggle from '../../ui/toggle';

const messages = defineMessages({
  saveService: {
    id: 'settings.service.form.saveButton',
    defaultMessage: 'Save service',
  },
  deleteService: {
    id: 'settings.service.form.deleteButton',
    defaultMessage: 'Delete service',
  },
  openDarkmodeCss: {
    id: 'settings.service.form.openDarkmodeCss',
    defaultMessage: 'Open darkmode.css',
  },
  openUserCss: {
    id: 'settings.service.form.openUserCss',
    defaultMessage: 'Open user.css',
  },
  openUserJs: {
    id: 'settings.service.form.openUserJs',
    defaultMessage: 'Open user.js',
  },
  recipeFileInfo: {
    id: 'settings.service.form.recipeFileInfo',
    defaultMessage:
      'Your user files will be inserted into the webpage so you can customize services in any way you like. User files are only stored locally and are not transferred to other computers using the same account.',
  },
  availableServices: {
    id: 'settings.service.form.availableServices',
    defaultMessage: 'Available services',
  },
  yourServices: {
    id: 'settings.service.form.yourServices',
    defaultMessage: 'Your services',
  },
  addServiceHeadline: {
    id: 'settings.service.form.addServiceHeadline',
    defaultMessage: 'Add {name}',
  },
  editServiceHeadline: {
    id: 'settings.service.form.editServiceHeadline',
    defaultMessage: 'Edit {name}',
  },
  tabHosted: {
    id: 'settings.service.form.tabHosted',
    defaultMessage: 'Hosted',
  },
  tabOnPremise: {
    id: 'settings.service.form.tabOnPremise',
    defaultMessage: 'Self hosted ⭐️',
  },
  useHostedService: {
    id: 'settings.service.form.useHostedService',
    defaultMessage: 'Use the hosted {name} service.',
  },
  customUrlValidationError: {
    id: 'settings.service.form.customUrlValidationError',
    defaultMessage: 'Could not validate custom {name} server.',
  },
  indirectMessageInfo: {
    id: 'settings.service.form.indirectMessageInfo',
    defaultMessage:
      'You will be notified about all new messages in a channel, not just @username, @channel, @here, ...',
  },
  isMutedInfo: {
    id: 'settings.service.form.isMutedInfo',
    defaultMessage:
      'When disabled, all notification sounds and audio playback are muted',
  },
  isHibernationEnabledInfo: {
    id: 'settings.service.form.isHibernatedEnabledInfo',
    defaultMessage:
      'When enabled, a service will be shut down after a period of time to save system resources.',
  },
  headlineNotifications: {
    id: 'settings.service.form.headlineNotifications',
    defaultMessage: 'Notifications',
  },
  headlineBadges: {
    id: 'settings.service.form.headlineBadges',
    defaultMessage: 'Unread message badges',
  },
  headlineGeneral: {
    id: 'settings.service.form.headlineGeneral',
    defaultMessage: 'General',
  },
  headlineAppearance: {
    id: 'settings.service.form.headlineAppearance',
    defaultMessage: 'Appearance',
  },
  headlineDarkReaderSettings: {
    id: 'settings.service.form.headlineDarkReaderSettings',
    defaultMessage: 'Dark Reader Settings',
  },
  iconDelete: {
    id: 'settings.service.form.iconDelete',
    defaultMessage: 'Delete',
  },
  iconUpload: {
    id: 'settings.service.form.iconUpload',
    defaultMessage: 'Drop your image, or click here',
  },
  headlineProxy: {
    id: 'settings.service.form.proxy.headline',
    defaultMessage: 'HTTP/HTTPS Proxy Settings',
  },
  proxyRestartInfo: {
    id: 'settings.service.form.proxy.restartInfo',
    defaultMessage: 'Please restart Ferdium after changing proxy Settings.',
  },
  proxyInfo: {
    id: 'settings.service.form.proxy.info',
    defaultMessage:
      'Proxy settings will not be synchronized with the Ferdium servers.',
  },
  serviceReloadRequired: {
    id: 'settings.service.reloadRequired',
    defaultMessage: 'Changes require reload of the service',
  },
  maxFileSize: {
    id: 'settings.service.form.maxFileSize',
    defaultMessage: 'Maximum filesize:',
  },
  maxFileSizeError: {
    id: 'settings.service.form.maxFileSizeError',
    defaultMessage: 'The file you are trying to submit is too large.',
  },
});

interface IProps extends WrappedComponentProps {
  recipe: IRecipe;
  service: Service | null;
  action?: string;
  form: Form;
  onSubmit: (...args: any[]) => void;
  onDelete: () => void;
  onClearCache: () => void;
  openRecipeFile: (recipeFile: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
  isProxyFeatureEnabled: boolean;
}

interface IState {
  isValidatingCustomUrl: boolean;
}

@observer
class EditServiceForm extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isValidatingCustomUrl: false,
    };
  }

  submit(e: FormEvent): void {
    const { recipe } = this.props;

    e.preventDefault();
    this.props.form.submit({
      onSuccess: async form => {
        const values = form.values();
        let isValid = true;

        const { files } = form.$('customIcon');
        if (files) {
          const [iconFile] = files;
          values.iconFile = iconFile;
        }

        if (recipe.validateUrl && values.customUrl) {
          this.setState({ isValidatingCustomUrl: true });
          try {
            values.customUrl = normalizedUrl(values.customUrl);
            isValid = await recipe.validateUrl(values.customUrl);
          } catch (error) {
            console.warn('ValidateURL', error);
            isValid = false;
          }
        }

        if (isValid) {
          this.props.onSubmit(values);
        } else {
          form.invalidate('url-validation-error');
        }

        this.setState({ isValidatingCustomUrl: false });
      },
      onError: noop,
    });
  }

  render(): ReactElement {
    const {
      recipe,
      service = {} as Service,
      action = '',
      form,
      isSaving,
      isDeleting,
      onDelete,
      onClearCache,
      openRecipeFile,
      isProxyFeatureEnabled,
      intl,
    } = this.props;
    const { isValidatingCustomUrl } = this.state;

    const deleteButton = isDeleting ? (
      <Button
        label={intl.formatMessage(messages.deleteService)}
        loaded={false}
        buttonType="secondary"
        className="settings__delete-button"
        disabled
      />
    ) : (
      <Button
        buttonType="danger"
        label={intl.formatMessage(messages.deleteService)}
        className="settings__delete-button"
        onClick={onDelete}
      />
    );

    const clearCacheButton = (
      <Button
        buttonType="secondary"
        label={intl.formatMessage(globalMessages.clearCache)}
        className="settings__open-settings-cache-button"
        onClick={onClearCache}
      />
    );

    let activeTabIndex = 0;
    if (recipe.hasHostedOption && service?.team) {
      activeTabIndex = 1;
    } else if (recipe.hasHostedOption && service?.customUrl) {
      activeTabIndex = 2;
    }

    const requiresUserInput =
      !recipe.hasHostedOption && (recipe.hasTeamId || recipe.hasCustomUrl);

    return (
      <div className="settings__main">
        <div className="settings__header">
          <span className="settings__header-item">
            {action === 'add' ? (
              <Link to="/settings/recipes">
                {intl.formatMessage(messages.availableServices)}
              </Link>
            ) : (
              <Link to="/settings/services">
                {intl.formatMessage(messages.yourServices)}
              </Link>
            )}
          </span>
          <span className="separator" />
          <span className="settings__header-item">
            {action === 'add'
              ? intl.formatMessage(messages.addServiceHeadline, {
                  name: recipe.name,
                })
              : intl.formatMessage(messages.editServiceHeadline, {
                  name:
                    service && service.name !== '' ? service.name : recipe.name,
                })}
          </span>
        </div>
        <div className="settings__body">
          <form onSubmit={e => this.submit(e)} id="form">
            <div className="service-name">
              <Input {...form.$('name').bind()} focus />
            </div>
            {(recipe.hasTeamId || recipe.hasCustomUrl) && (
              <Tabs active={activeTabIndex}>
                {recipe.hasHostedOption && (
                  <TabItem title={recipe.name}>
                    {intl.formatMessage(messages.useHostedService, {
                      name: recipe.name,
                    })}
                  </TabItem>
                )}
                {recipe.hasTeamId && (
                  <TabItem title={intl.formatMessage(messages.tabHosted)}>
                    <Input
                      {...form.$('team').bind()}
                      prefix={recipe.urlInputPrefix}
                      suffix={recipe.urlInputSuffix}
                    />
                  </TabItem>
                )}
                {recipe.hasCustomUrl && (
                  <TabItem title={intl.formatMessage(messages.tabOnPremise)}>
                    <Input {...form.$('customUrl').bind()} />
                    {form.error === 'url-validation-error' && (
                      <p className="franz-form__error">
                        {intl.formatMessage(messages.customUrlValidationError, {
                          name: recipe.name,
                        })}
                      </p>
                    )}
                  </TabItem>
                )}
              </Tabs>
            )}

            {recipe.message && (
              <p
                className="settings__message"
                style={{
                  marginTop: 0,
                }}
              >
                <Icon icon={mdiInformation} />
                {recipe.message}
              </p>
            )}
            <div className="service-flex-grid">
              <div className="settings__options">
                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.headlineNotifications)}</H3>
                  <Toggle {...form.$('isNotificationEnabled').bind()} />
                  <Toggle {...form.$('isMuted').bind()} />
                  <p className="settings__help indented__help">
                    {intl.formatMessage(messages.isMutedInfo)}
                  </p>
                  <Toggle {...form.$('isMediaBadgeEnabled').bind()} />
                </div>

                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.headlineBadges)}</H3>
                  <Toggle {...form.$('isBadgeEnabled').bind()} />
                  {recipe.hasIndirectMessages &&
                    form.$('isBadgeEnabled').value && (
                      <>
                        <Toggle
                          {...form.$('isIndirectMessageBadgeEnabled').bind()}
                        />
                        <p className="settings__help indented__help">
                          {intl.formatMessage(messages.indirectMessageInfo)}
                        </p>
                      </>
                    )}
                  {recipe.allowFavoritesDelineationInUnreadCount && (
                    <Toggle
                      {...form.$('onlyShowFavoritesInUnreadCount').bind()}
                    />
                  )}
                </div>

                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.headlineGeneral)}</H3>
                  <Toggle {...form.$('isEnabled').bind()} />
                  <Toggle {...form.$('isHibernationEnabled').bind()} />
                  <p className="settings__help indented__help">
                    {intl.formatMessage(messages.isHibernationEnabledInfo)}
                  </p>
                  <Toggle {...form.$('isWakeUpEnabled').bind()} />
                  <Toggle {...form.$('trapLinkClicks').bind()} />
                  {/* TODO: Need to figure out how to effect this change without a reload of the recipe */}
                  <p className="settings__help indented__help">
                    {intl.formatMessage(messages.serviceReloadRequired)}
                  </p>
                </div>

                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.headlineAppearance)}</H3>
                  <Toggle {...form.$('useFavicon').bind()} />
                  <Toggle {...form.$('isDarkModeEnabled').bind()} />
                  {form.$('isDarkModeEnabled').value && (
                    <>
                      <H3>
                        {intl.formatMessage(
                          messages.headlineDarkReaderSettings,
                        )}
                      </H3>
                      <Slider field={form.$('darkReaderBrightness')} />
                      <Slider field={form.$('darkReaderContrast')} />
                      <Slider field={form.$('darkReaderSepia')} />
                    </>
                  )}
                  <Toggle {...form.$('isProgressbarEnabled').bind()} />
                </div>
              </div>
              <div className="service-icon">
                <ImageUpload
                  field={form.$('customIcon')}
                  textDelete={intl.formatMessage(messages.iconDelete)}
                  textUpload={intl.formatMessage(messages.iconUpload)}
                  maxSize={2_097_152}
                  maxFiles={1}
                  textMaxFileSize={intl.formatMessage(messages.maxFileSize)}
                  textMaxFileSizeError={intl.formatMessage(
                    messages.maxFileSizeError,
                  )}
                />
              </div>
            </div>

            {!isMac && (
              <div className="settings__settings-group">
                <Select field={form.$('spellcheckerLanguage')} />
              </div>
            )}

            {isProxyFeatureEnabled && (
              <div className="settings__settings-group">
                <H3>
                  {intl.formatMessage(messages.headlineProxy)}
                  <span className="badge badge--success">beta</span>
                </H3>
                <Toggle {...form.$('proxy.isEnabled').bind()} />
                {form.$('proxy.isEnabled').value && (
                  <>
                    <div className="grid">
                      <div className="grid__row">
                        <Input
                          {...form.$('proxy.host').bind()}
                          className="proxyHost"
                        />
                        <Input {...form.$('proxy.port').bind()} />
                      </div>
                    </div>
                    <div className="grid">
                      <div className="grid__row">
                        <Input {...form.$('proxy.user').bind()} />
                        <Input
                          {...form.$('proxy.password').bind()}
                          showPasswordToggle
                        />
                      </div>
                    </div>
                    <p>
                      <Icon icon={mdiInformation} />
                      {intl.formatMessage(messages.proxyRestartInfo)}
                    </p>
                    <p>
                      <Icon icon={mdiInformation} />
                      {intl.formatMessage(messages.proxyInfo)}
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="user-agent">
              <Input {...form.$('userAgentPref').bind()} />
              <p className="settings__help">
                {intl.formatMessage(globalMessages.userAgentHelp)}
              </p>
            </div>
          </form>

          {action === 'edit' && (
            <>
              <div className="settings__open-recipe-file-container">
                <Button
                  buttonType="secondary"
                  label={intl.formatMessage(messages.openDarkmodeCss)}
                  className="settings__open-recipe-file-button"
                  onClick={() => openRecipeFile('darkmode.css')}
                />
                <Button
                  buttonType="secondary"
                  label={intl.formatMessage(messages.openUserCss)}
                  className="settings__open-recipe-file-button"
                  onClick={() => openRecipeFile('user.css')}
                />
                <Button
                  buttonType="secondary"
                  label={intl.formatMessage(messages.openUserJs)}
                  className="settings__open-recipe-file-button"
                  onClick={() => openRecipeFile('user.js')}
                />
              </div>
              <p style={{ marginTop: 10, marginBottom: 10 }}>
                <Icon icon={mdiInformation} />
                {intl.formatMessage(messages.recipeFileInfo)}
              </p>
            </>
          )}
          <span style={{ fontStyle: 'italic', fontSize: '80%' }}>
            Recipe version:
            {recipe.version}
          </span>
        </div>
        <div className="settings__controls">
          {/* Delete Button */}
          <div>{action === 'edit' && deleteButton}</div>
          <div>{action === 'edit' && clearCacheButton}</div>

          {/* Save Button */}
          {isSaving || isValidatingCustomUrl ? (
            <Button
              type="submit"
              label={intl.formatMessage(messages.saveService)}
              loaded={false}
              buttonType="secondary"
              disabled
            />
          ) : (
            <Button
              type="submit"
              label={intl.formatMessage(messages.saveService)}
              htmlForm="form"
              disabled={
                action !== 'edit' && form.isPristine && requiresUserInput
              }
            />
          )}
        </div>
      </div>
    );
  }
}

export default injectIntl(EditServiceForm);
