import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Link } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import normalizeUrl from 'normalize-url';

import { mdiInformation } from '@mdi/js';
import Form from '../../../lib/Form';
import Recipe from '../../../models/Recipe';
import Service from '../../../models/Service';
import Tabs from '../../ui/Tabs/Tabs';
import { TabItem } from '../../ui/Tabs/TabItem';
import Input from '../../ui/Input';
import Toggle from '../../ui/Toggle';
import Slider from '../../ui/Slider';
import Button from '../../ui/button';
import ImageUpload from '../../ui/ImageUpload';
import Select from '../../ui/Select';

import { isMac } from '../../../environment';
import globalMessages from '../../../i18n/globalMessages';
import { Icon } from '../../ui/icon';
import { H3 } from '../../ui/headline';

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
});

class EditServiceForm extends Component {
  static propTypes = {
    recipe: PropTypes.instanceOf(Recipe).isRequired,
    service(props, propName) {
      if (props.action === 'edit' && !(props[propName] instanceof Service)) {
        return new Error(`'${propName}'' is expected to be of type 'Service'
          when editing a Service`);
      }

      return null;
    },
    action: PropTypes.string.isRequired,
    form: PropTypes.instanceOf(Form).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    openRecipeFile: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    isProxyFeatureEnabled: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    service: {},
  };

  state = {
    isValidatingCustomUrl: false,
  };

  submit(e) {
    const { recipe } = this.props;

    e.preventDefault();
    this.props.form.submit({
      onSuccess: async form => {
        const values = form.values();
        let isValid = true;

        const { files } = form.$('customIcon');
        if (files) {
          values.iconFile = files[0];
        }

        if (recipe.validateUrl && values.customUrl) {
          this.setState({ isValidatingCustomUrl: true });
          try {
            values.customUrl = normalizeUrl(values.customUrl, {
              stripAuthentication: false,
              stripWWW: false,
              removeTrailingSlash: false,
            });
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
      onError: () => {},
    });
  }

  render() {
    const {
      recipe,
      service,
      action,
      form,
      isSaving,
      isDeleting,
      onDelete,
      openRecipeFile,
      isProxyFeatureEnabled,
    } = this.props;
    const { intl } = this.props;

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

    let activeTabIndex = 0;
    if (recipe.hasHostedOption && service.team) {
      activeTabIndex = 1;
    } else if (recipe.hasHostedOption && service.customUrl) {
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
                  name: service.name !== '' ? service.name : recipe.name,
                })}
          </span>
        </div>
        <div className="settings__body">
          <form onSubmit={e => this.submit(e)} id="form">
            <div className="service-name">
              <Input field={form.$('name')} focus />
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
                      field={form.$('team')}
                      prefix={recipe.urlInputPrefix}
                      suffix={recipe.urlInputSuffix}
                    />
                  </TabItem>
                )}
                {recipe.hasCustomUrl && (
                  <TabItem title={intl.formatMessage(messages.tabOnPremise)}>
                    <Input field={form.$('customUrl')} />
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
                  <Toggle field={form.$('isNotificationEnabled')} />
                  <Toggle field={form.$('isMuted')} />
                  <p className="settings__help indented__help">
                    {intl.formatMessage(messages.isMutedInfo)}
                  </p>
                </div>

                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.headlineBadges)}</H3>
                  <Toggle field={form.$('isBadgeEnabled')} />
                  {recipe.hasIndirectMessages &&
                    form.$('isBadgeEnabled').value && (
                      <>
                        <Toggle
                          field={form.$('isIndirectMessageBadgeEnabled')}
                        />
                        <p className="settings__help indented__help">
                          {intl.formatMessage(messages.indirectMessageInfo)}
                        </p>
                      </>
                    )}
                  {recipe.allowFavoritesDelineationInUnreadCount && (
                    <Toggle field={form.$('onlyShowFavoritesInUnreadCount')} />
                  )}
                </div>

                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.headlineGeneral)}</H3>
                  <Toggle field={form.$('isEnabled')} />
                  <Toggle field={form.$('isHibernationEnabled')} />
                  <p className="settings__help indented__help">
                    {intl.formatMessage(messages.isHibernationEnabledInfo)}
                  </p>
                  <Toggle field={form.$('isWakeUpEnabled')} />
                  <Toggle field={form.$('trapLinkClicks')} />
                  <Toggle field={form.$('isDarkModeEnabled')} />
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
                </div>
              </div>
              <div className="service-icon">
                <ImageUpload
                  field={form.$('customIcon')}
                  textDelete={intl.formatMessage(messages.iconDelete)}
                  textUpload={intl.formatMessage(messages.iconUpload)}
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
                <Toggle field={form.$('proxy.isEnabled')} />
                {form.$('proxy.isEnabled').value && (
                  <>
                    <div className="grid">
                      <div className="grid__row">
                        <Input
                          field={form.$('proxy.host')}
                          className="proxyHost"
                        />
                        <Input field={form.$('proxy.port')} />
                      </div>
                    </div>
                    <div className="grid">
                      <div className="grid__row">
                        <Input field={form.$('proxy.user')} />
                        <Input
                          field={form.$('proxy.password')}
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
              <Input field={form.$('userAgentPref')} />
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
          {action === 'edit' && deleteButton}

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

export default injectIntl(observer(EditServiceForm));
