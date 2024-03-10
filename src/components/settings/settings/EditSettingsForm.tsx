import { systemPreferences } from '@electron/remote';
import { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import prettyBytes from 'pretty-bytes';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { mdiGithub, mdiOpenInNew, mdiPowerPlug } from '@mdi/js';
import { noop } from 'lodash';
import Form from '../../../lib/Form';
import Button from '../../ui/button';
import Toggle from '../../ui/toggle';
import Select from '../../ui/Select';
import Input from '../../ui/input/index';
import ColorPickerInput from '../../ui/colorPickerInput';
import Infobox from '../../ui/Infobox';
import { H1, H2, H3, H5 } from '../../ui/headline';
import {
  ferdiumVersion,
  userDataCertsPath,
  userDataPath,
  userDataRecipesPath,
} from '../../../environment-remote';
import { updateVersionParse } from '../../../helpers/update-helpers';
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_APP_SETTINGS,
  FERDIUM_TRANSLATION,
  GITHUB_FRANZ_URL,
  GITHUB_FERDIUM_URL,
  SPLIT_COLUMNS_MAX,
  SPLIT_COLUMNS_MIN,
} from '../../../config';
import {
  isMac,
  isWinPortable,
  isWindows,
  lockFerdiumShortcutKey,
} from '../../../environment';
import { openExternalUrl, openPath } from '../../../helpers/url-helpers';
import globalMessages from '../../../i18n/globalMessages';
import Icon from '../../ui/icon';
import Slider from '../../ui/Slider';

const debug = require('../../../preload-safe-debug')(
  'Ferdium:EditSettingsForm',
);

const messages = defineMessages({
  headlineGeneral: {
    id: 'settings.app.headlineGeneral',
    defaultMessage: 'General',
  },
  headlineServices: {
    id: 'settings.app.headlineServices',
    defaultMessage: 'Services',
  },
  sentryInfo: {
    id: 'settings.app.sentryInfo',
    defaultMessage:
      'Sending telemetry data allows us to find errors in Ferdium - we will not send any personal information like your message data!',
  },
  hibernateInfo: {
    id: 'settings.app.hibernateInfo',
    defaultMessage:
      'By default, Ferdium will keep all your services open and loaded in the background so they are ready when you want to use them. Service Hibernation will unload your services after a specified amount. This is useful to save RAM or keeping services from slowing down your computer.',
  },
  inactivityLockInfo: {
    id: 'settings.app.inactivityLockInfo',
    defaultMessage:
      'Minutes of inactivity, after which Ferdium should automatically lock. Use 0 to disable',
  },
  todoServerInfo: {
    id: 'settings.app.todoServerInfo',
    defaultMessage: 'This server will be used for the "Ferdium Todo" feature.',
  },
  lockedPassword: {
    id: 'settings.app.lockedPassword',
    defaultMessage: 'Password',
  },
  lockedPasswordInfo: {
    id: 'settings.app.lockedPasswordInfo',
    defaultMessage:
      "Please make sure to set a password you'll remember.\nIf you loose this password, you will have to reinstall Ferdium.",
  },
  lockInfo: {
    id: 'settings.app.lockInfo',
    defaultMessage:
      'Password Lock allows you to keep your messages protected.\nUsing Password Lock, you will be prompted to enter your password everytime you start Ferdium or lock Ferdium yourself using the lock symbol in the bottom left corner or the shortcut {lockShortcut}.',
  },
  scheduledDNDTimeInfo: {
    id: 'settings.app.scheduledDNDTimeInfo',
    defaultMessage:
      'Times in 24-Hour-Format. End time can be before start time (e.g. start 17:00, end 09:00) to enable Do-not-Disturb overnight.',
  },
  scheduledDNDInfo: {
    id: 'settings.app.scheduledDNDInfo',
    defaultMessage:
      'Scheduled Do-not-Disturb allows you to define a period of time in which you do not want to get Notifications from Ferdium.',
  },
  headlineLanguage: {
    id: 'settings.app.headlineLanguage',
    defaultMessage: 'Language',
  },
  headlineUpdates: {
    id: 'settings.app.headlineUpdates',
    defaultMessage: 'Updates',
  },
  headlineAppearance: {
    id: 'settings.app.headlineAppearance',
    defaultMessage: 'Appearance',
  },
  sectionMain: {
    id: 'settings.app.sectionMain',
    defaultMessage: 'Main',
  },
  sectionHibernation: {
    id: 'settings.app.sectionHibernation',
    defaultMessage: 'Hibernation',
  },
  sectionGeneralUi: {
    id: 'settings.app.sectionGeneralUi',
    defaultMessage: 'General UI',
  },
  sectionSidebarSettings: {
    id: 'settings.app.sectionSidebarSettings',
    defaultMessage: 'Sidebar Settings',
  },
  sectionPrivacy: {
    id: 'settings.app.sectionPrivacy',
    defaultMessage: 'Privacy Settings',
  },
  sectionLanguage: {
    id: 'settings.app.sectionLanguage',
    defaultMessage: 'Language Settings',
  },
  sectionAdvanced: {
    id: 'settings.app.sectionAdvanced',
    defaultMessage: 'Advanced Settings',
  },
  sectionUpdates: {
    id: 'settings.app.sectionUpdates',
    defaultMessage: 'App Updates Settings',
  },
  sectionServiceIconsSettings: {
    id: 'settings.app.sectionServiceIconsSettings',
    defaultMessage: 'Service Icons Settings',
  },
  sectionAccentColorSettings: {
    id: 'settings.app.sectionAccentColorSettings',
    defaultMessage: 'Accent Color Settings',
  },
  accentColorInfo: {
    id: 'settings.app.accentColorInfo',
    defaultMessage:
      'Write your color choice in a CSS-compatible format. (Default: {defaultAccentColor} or clear the input field)',
  },
  overallTheme: {
    id: 'settings.app.overallTheme',
    defaultMessage: 'Overall Theme',
  },
  progressbarTheme: {
    id: 'settings.app.progressbarTheme',
    defaultMessage: 'Progressbar Theme',
  },
  universalDarkModeInfo: {
    id: 'settings.app.universalDarkModeInfo',
    defaultMessage:
      'Universal Dark Mode tries to dynamically generate dark mode styles for services that are otherwise not currently supported.',
  },
  headlinePrivacy: {
    id: 'settings.app.headlinePrivacy',
    defaultMessage: 'Privacy',
  },
  headlineAdvanced: {
    id: 'settings.app.headlineAdvanced',
    defaultMessage: 'Advanced',
  },
  translationHelp: {
    id: 'settings.app.translationHelp',
    defaultMessage: 'Help us to translate Ferdium into your language.',
  },
  spellCheckerLanguageInfo: {
    id: 'settings.app.spellCheckerLanguageInfo',
    defaultMessage:
      "Ferdium uses your Mac's build-in spellchecker to check for typos. If you want to change the languages the spellchecker checks for, you can do so in your Mac's System Preferences.",
  },
  subheadlineCache: {
    id: 'settings.app.subheadlineCache',
    defaultMessage: 'Cache',
  },
  cacheInfo: {
    id: 'settings.app.cacheInfo',
    defaultMessage: 'Ferdium cache is currently using {size} of disk space.',
  },
  cacheNotCleared: {
    id: 'settings.app.cacheNotCleared',
    defaultMessage: "Couldn't clear all cache",
  },
  subheadlineFerdiumProfile: {
    id: 'settings.app.subheadlineFerdiumProfile',
    defaultMessage: 'Ferdium Profile',
  },
  buttonOpenFerdiumProfileFolder: {
    id: 'settings.app.buttonOpenFerdiumProfileFolder',
    defaultMessage: 'Open Profile folder',
  },
  buttonOpenFerdiumServiceRecipesFolder: {
    id: 'settings.app.buttonOpenFerdiumServiceRecipesFolder',
    defaultMessage: 'Open Service Recipes folder',
  },
  buttonOpenImportExport: {
    id: 'settings.app.buttonOpenImportExport',
    defaultMessage: 'Import / Export',
  },
  serverHelp: {
    id: 'settings.app.serverHelp',
    defaultMessage: 'Connected to server at {serverURL}',
  },
  buttonSearchForUpdate: {
    id: 'settings.app.buttonSearchForUpdate',
    defaultMessage: 'Check for updates',
  },
  buttonInstallUpdate: {
    id: 'settings.app.buttonInstallUpdate',
    defaultMessage: 'Restart & install update',
  },
  buttonShowChangelog: {
    id: 'settings.app.buttonShowChangelog',
    defaultMessage: 'Show changelog',
  },
  updateStatusSearching: {
    id: 'settings.app.updateStatusSearching',
    defaultMessage: 'Searching for updates...',
  },
  updateStatusAvailable: {
    id: 'settings.app.updateStatusAvailable',
    defaultMessage: 'Update available, downloading...',
  },
  updateStatusUpToDate: {
    id: 'settings.app.updateStatusUpToDate',
    defaultMessage: 'You are using the latest version of Ferdium',
  },
  servicesUpdateStatusUpToDate: {
    id: 'settings.app.servicesUpdateStatusUpToDate',
    defaultMessage: 'Your services are up-to-date',
  },
  currentVersion: {
    id: 'settings.app.currentVersion',
    defaultMessage: 'Current version:',
  },
  appRestartRequired: {
    id: 'settings.app.restartRequired',
    defaultMessage: 'Changes require restart',
  },
  servicesUpdated: {
    id: 'infobar.servicesUpdated',
    defaultMessage: 'Your services have been updated.',
  },
  buttonReloadServices: {
    id: 'infobar.buttonReloadServices',
    defaultMessage: 'Reload services',
  },
  numberOfColumns: {
    id: 'settings.app.form.splitColumns',
    defaultMessage: 'Number of columns',
  },
  warningSelfSignedCertificates: {
    id: 'settings.app.warningSelfSignedCertificates',
    defaultMessage:
      'WARNING: Only enable this feature if you know what you are doing. Enabling this is a security risk and should only be used for testing purposes.',
  },
  infoOpenCertificatesFolder: {
    id: 'settings.app.infoOpenCertificatesFolder',
    defaultMessage:
      'To install a certificate, click the button below to open the certificates folder and copy it into the folder. After that you can refresh the service (CTRL/CMD + R). To remove/uninstall, simply delete the certificate file and restart Ferdium.',
  },
  buttonOpenFerdiumCertsFolder: {
    id: 'settings.app.buttonOpenFerdiumCertsFolder',
    defaultMessage: 'Open certificates folder',
  },
});

const Hr = (): ReactElement => (
  <hr
    className="settings__hr"
    style={{ marginBottom: 20, borderStyle: 'dashed' }}
  />
);

const HrSections = (): ReactElement => (
  <hr
    className="settings__hr-sections"
    style={{ marginTop: 20, marginBottom: 40, borderStyle: 'solid' }}
  />
);

interface IProps extends WrappedComponentProps {
  form: Form;
  isCheckingForUpdates: boolean;
  isUpdateAvailable: boolean;
  noUpdateAvailable: boolean;
  updateIsReadyToInstall: boolean;
  updateFailed: boolean;
  isClearingAllCache: boolean;
  isTodosActivated: boolean;
  automaticUpdates: boolean;
  isTwoFactorAutoCatcherEnabled: boolean;
  twoFactorAutoCatcherMatcher: string;
  isDarkmodeEnabled: boolean;
  isAdaptableDarkModeEnabled: boolean;
  isUseGrayscaleServicesEnabled: boolean;
  isLockingFeatureEnabled: boolean;
  isSplitModeEnabled: boolean;
  isOnline: boolean;
  showServicesUpdatedInfoBar: boolean;
  updateVersion: string;
  serverURL: string;
  onClearAllCache: () => void;
  getCacheSize: () => void;
  checkForUpdates: () => void;
  installUpdate: () => void;
  openProcessManager: () => void;
  onSubmit: (...args: any[]) => void;
}

interface IState {
  activeSetttingsTab: string;
  clearCacheButtonClicked: boolean;
}

@observer
class EditSettingsForm extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      activeSetttingsTab: 'general',
      clearCacheButtonClicked: false,
    };
  }

  setActiveSettingsTab(tab) {
    this.setState({
      activeSetttingsTab: tab,
    });
  }

  onClearCacheClicked = () => {
    this.setState({ clearCacheButtonClicked: true });
  };

  submit(e): void {
    if (e) {
      e.preventDefault();
    }

    this.props.form.submit({
      onSuccess: (form: Form) => {
        const values = form.values();
        const { accentColor, isTwoFactorAutoCatcherEnabled } = values;

        if (accentColor.trim().length === 0) {
          values.accentColor = DEFAULT_ACCENT_COLOR;
        }
        const { progressbarAccentColor } = values;
        if (progressbarAccentColor.trim().length === 0) {
          values.progressbarAccentColor = DEFAULT_ACCENT_COLOR;
        }

        // set twoFactorAutoCatcherMatcher to the default value, if its get enabled the input is prefilled
        if (
          !isTwoFactorAutoCatcherEnabled &&
          values.twoFactorAutoCatcherMatcher.length === 0
        ) {
          values.twoFactorAutoCatcherMatcher =
            DEFAULT_APP_SETTINGS.twoFactorAutoCatcherMatcher;
        }
        this.props.onSubmit(values);
      },
      onError: noop,
    });
  }

  render(): ReactElement {
    const {
      checkForUpdates,
      installUpdate,
      form,
      updateVersion,
      isCheckingForUpdates,
      isAdaptableDarkModeEnabled,
      isUseGrayscaleServicesEnabled,
      isUpdateAvailable,
      noUpdateAvailable,
      updateIsReadyToInstall,
      updateFailed,
      showServicesUpdatedInfoBar,
      isClearingAllCache,
      onClearAllCache,
      getCacheSize,
      automaticUpdates,
      isTwoFactorAutoCatcherEnabled,
      isDarkmodeEnabled,
      isSplitModeEnabled,
      openProcessManager,
      isTodosActivated,
      isOnline,
      serverURL,
      intl,
    } = this.props;

    let updateButtonLabelMessage = messages.buttonSearchForUpdate;
    if (isCheckingForUpdates) {
      updateButtonLabelMessage = messages.updateStatusSearching;
    } else if (isUpdateAvailable) {
      updateButtonLabelMessage = messages.updateStatusAvailable;
    }

    const {
      isLockingFeatureEnabled,
      scheduledDNDEnabled,
      reloadAfterResume,
      useSelfSignedCertificates,
    } = window['ferdium'].stores.settings.all.app;

    let cacheSize;
    let notCleared;

    if (this.state.activeSetttingsTab === 'advanced') {
      const cacheSizeBytes = getCacheSize();
      debug('cacheSizeBytes:', cacheSizeBytes);
      if (typeof cacheSizeBytes === 'number') {
        cacheSize = prettyBytes(cacheSizeBytes);
        debug('cacheSize:', cacheSize);
        notCleared =
          this.state.clearCacheButtonClicked &&
          !isClearingAllCache &&
          cacheSizeBytes !== 0;
      } else {
        cacheSize = '…';
        notCleared = false;
      }
    }

    const profileFolder = userDataPath();
    const recipeFolder = userDataRecipesPath();
    const certsFolder = userDataCertsPath();

    return (
      <div className="settings__main">
        <div className="settings__header">
          <H1>{intl.formatMessage(globalMessages.settings)}</H1>
        </div>
        <div className="settings__body">
          <form
            onSubmit={e => this.submit(e)}
            onChange={e => this.submit(e)}
            id="form"
          >
            {/* Titles */}
            <div className="recipes__navigation">
              <H5
                id="general"
                className={
                  this.state.activeSetttingsTab === 'general'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('general');
                }}
              >
                {intl.formatMessage(messages.headlineGeneral)}
              </H5>
              <H5
                id="services"
                className={
                  this.state.activeSetttingsTab === 'services'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('services');
                }}
              >
                {intl.formatMessage(messages.headlineServices)}
              </H5>
              <H5
                id="appearance"
                className={
                  this.state.activeSetttingsTab === 'appearance'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('appearance');
                }}
              >
                {intl.formatMessage(messages.headlineAppearance)}
              </H5>
              <H5
                id="privacy"
                className={
                  this.state.activeSetttingsTab === 'privacy'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('privacy');
                }}
              >
                {intl.formatMessage(messages.headlinePrivacy)}
              </H5>
              <H5
                id="language"
                className={
                  this.state.activeSetttingsTab === 'language'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('language');
                }}
              >
                {intl.formatMessage(messages.headlineLanguage)}
              </H5>
              <H5
                id="advanced"
                className={
                  this.state.activeSetttingsTab === 'advanced'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('advanced');
                }}
              >
                {intl.formatMessage(messages.headlineAdvanced)}
              </H5>
              <H5
                id="updates"
                className={
                  this.state.activeSetttingsTab === 'updates'
                    ? 'badge badge--primary'
                    : 'badge'
                }
                onClick={() => {
                  this.setActiveSettingsTab('updates');
                }}
              >
                {intl.formatMessage(messages.headlineUpdates)}
                {automaticUpdates &&
                  (updateIsReadyToInstall ||
                    isUpdateAvailable ||
                    showServicesUpdatedInfoBar) && (
                    <span className="update-available">•</span>
                  )}
              </H5>
            </div>

            {/* General */}
            {this.state.activeSetttingsTab === 'general' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionMain)}
                </H2>
                <Toggle {...form.$('autoLaunchOnStart').bind()} />
                <Toggle {...form.$('runInBackground').bind()} />
                <Toggle {...form.$('confirmOnQuit').bind()} />
                <Toggle {...form.$('enableSystemTray').bind()} />
                {reloadAfterResume && <Hr />}
                <Toggle {...form.$('reloadAfterResume').bind()} />
                {reloadAfterResume && (
                  <div>
                    <Input {...form.$('reloadAfterResumeTime').bind()} />
                    <Hr />
                  </div>
                )}
                <Toggle {...form.$('startMinimized').bind()} />
                {isWindows && (
                  <Toggle {...form.$('minimizeToSystemTray').bind()} />
                )}
                {isWindows && (
                  <Toggle {...form.$('closeToSystemTray').bind()} />
                )}

                <Toggle {...form.$('keepAllWorkspacesLoaded').bind()} />

                {isTodosActivated && <Hr />}
                <Toggle {...form.$('enableTodos').bind()} />
                {isTodosActivated && (
                  <div>
                    <Select field={form.$('predefinedTodoServer')} />
                    {form.$('predefinedTodoServer').value ===
                      'isUsingCustomTodoService' && (
                      <div>
                        <Input
                          placeholder="Todo Server"
                          onChange={e => this.submit(e)}
                          {...form.$('customTodoServer').bind()}
                        />
                        <p
                          className="settings__message"
                          style={{
                            borderTop: 0,
                            marginTop: 0,
                            paddingTop: 0,
                            marginBottom: '2rem',
                          }}
                        >
                          {intl.formatMessage(messages.todoServerInfo)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {isTodosActivated && <Hr />}

                {scheduledDNDEnabled && <Hr />}
                <Toggle {...form.$('scheduledDNDEnabled').bind()} />

                {scheduledDNDEnabled && (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          padding: '0 1rem',
                          width: '100%',
                        }}
                      >
                        <Input
                          placeholder="17:00"
                          onChange={e => this.submit(e)}
                          {...form.$('scheduledDNDStart').bind()}
                          type="time"
                        />
                      </div>
                      <div
                        style={{
                          padding: '0 1rem',
                          width: '100%',
                        }}
                      >
                        <Input
                          placeholder="09:00"
                          onChange={e => this.submit(e)}
                          {...form.$('scheduledDNDEnd').bind()}
                          type="time"
                        />
                      </div>
                    </div>
                    <p>{intl.formatMessage(messages.scheduledDNDTimeInfo)}</p>
                  </>
                )}
                <p
                  className="settings__message"
                  style={{
                    borderTop: 0,
                    marginTop: 0,
                    paddingTop: 0,
                    marginBottom: '2rem',
                  }}
                >
                  <span>{intl.formatMessage(messages.scheduledDNDInfo)}</span>
                </p>
              </div>
            )}

            {/* Services */}
            {this.state.activeSetttingsTab === 'services' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionServiceIconsSettings)}
                </H2>

                <Toggle {...form.$('showDisabledServices').bind()} />
                <Toggle {...form.$('showServiceName').bind()} />

                {isUseGrayscaleServicesEnabled && <Hr />}

                <Toggle {...form.$('useGrayscaleServices').bind()} />

                {isUseGrayscaleServicesEnabled && (
                  <>
                    <Slider
                      onSliderChange={e => this.submit(e)}
                      field={form.$('grayscaleServicesDim')}
                    />
                    <Hr />
                  </>
                )}

                <Toggle {...form.$('showMessageBadgeWhenMuted').bind()} />
                <Toggle {...form.$('enableLongPressServiceHint').bind()} />
                <Select field={form.$('iconSize')} />

                <Select field={form.$('navigationBarBehaviour')} />

                <HrSections />

                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionHibernation)}
                </H2>
                <Select field={form.$('hibernationStrategy')} />
                <Toggle {...form.$('hibernateOnStartup').bind()} />
                <p
                  className="settings__message"
                  style={{
                    borderTop: 0,
                    marginTop: 0,
                    paddingTop: 0,
                    marginBottom: '2rem',
                  }}
                >
                  <span>{intl.formatMessage(messages.hibernateInfo)}</span>
                </p>

                <Select field={form.$('wakeUpStrategy')} />
                <Select field={form.$('wakeUpHibernationStrategy')} />
                <Toggle {...form.$('wakeUpHibernationSplay').bind()} />
              </div>
            )}

            {/* Appearance */}
            {this.state.activeSetttingsTab === 'appearance' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionGeneralUi)}
                </H2>
                {isMac && <Toggle {...form.$('showDragArea').bind()} />}

                <Toggle {...form.$('adaptableDarkMode').bind()} />
                {!isAdaptableDarkModeEnabled && (
                  <Toggle {...form.$('darkMode').bind()} />
                )}
                {(isDarkmodeEnabled || isAdaptableDarkModeEnabled) && (
                  <>
                    <Toggle {...form.$('universalDarkMode').bind()} />
                    <p
                      className="settings__message"
                      style={{
                        borderTop: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        marginBottom: '2rem',
                      }}
                    >
                      <span>
                        {intl.formatMessage(messages.universalDarkModeInfo)}
                      </span>
                    </p>
                  </>
                )}

                {isSplitModeEnabled && <Hr />}
                <Toggle {...form.$('splitMode').bind()} />
                {isSplitModeEnabled && (
                  <Input
                    type="number"
                    min={SPLIT_COLUMNS_MIN}
                    max={SPLIT_COLUMNS_MAX}
                    placeholder={`${SPLIT_COLUMNS_MIN}-${SPLIT_COLUMNS_MAX}`}
                    onChange={e => this.submit(e)}
                    {...form.$('splitColumns').bind()}
                  />
                )}

                <HrSections />
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionAccentColorSettings)}
                </H2>
                <p>
                  {intl.formatMessage(messages.accentColorInfo, {
                    defaultAccentColor: DEFAULT_APP_SETTINGS.accentColor,
                  })}
                </p>
                <p>{intl.formatMessage(messages.overallTheme)}</p>
                <div className="settings__settings-group__apply-color">
                  <ColorPickerInput
                    {...form.$('accentColor').bind()}
                    name="accentColor"
                    onColorChange={e => this.submit(e)}
                    className="color-picker-input"
                  />
                </div>
                <p>{intl.formatMessage(messages.progressbarTheme)}</p>
                <div className="settings__settings-group__apply-color">
                  <ColorPickerInput
                    {...form.$('progressbarAccentColor').bind()}
                    name="progressbarAccentColor"
                    onColorChange={e => this.submit(e)}
                    className="color-picker-input"
                  />
                </div>

                <div className="settings__settings-group__apply-color">
                  <Button
                    buttonType="secondary"
                    className="settings__settings-group__apply-color__button"
                    label="Apply color"
                    onClick={e => {
                      this.submit(e);
                    }}
                  />
                </div>
                <HrSections />

                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionSidebarSettings)}
                </H2>

                <Select field={form.$('serviceRibbonWidth')} />

                <Select field={form.$('sidebarServicesLocation')} />

                <Toggle {...form.$('useHorizontalStyle').bind()} />

                <Toggle {...form.$('hideCollapseButton').bind()} />

                <Toggle {...form.$('hideRecipesButton').bind()} />

                <Toggle {...form.$('hideSplitModeButton').bind()} />

                <Toggle {...form.$('hideWorkspacesButton').bind()} />

                <Toggle {...form.$('hideNotificationsButton').bind()} />

                <Toggle {...form.$('hideSettingsButton').bind()} />

                <Toggle {...form.$('hideDownloadButton').bind()} />

                <Toggle {...form.$('alwaysShowWorkspaces').bind()} />
              </div>
            )}

            {/* Privacy */}
            {this.state.activeSetttingsTab === 'privacy' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionPrivacy)}
                </H2>

                <Toggle {...form.$('privateNotifications').bind()} />
                <Toggle {...form.$('clipboardNotifications').bind()} />
                {(isWindows || isMac) && (
                  <Toggle {...form.$('notifyTaskBarOnMessage').bind()} />
                )}

                <Toggle {...form.$('isTwoFactorAutoCatcherEnabled').bind()} />

                {isTwoFactorAutoCatcherEnabled && (
                  <Input
                    onChange={e => this.submit(e)}
                    {...form.$('twoFactorAutoCatcherMatcher').bind()}
                  />
                )}

                <Hr />

                <Select field={form.$('webRTCIPHandlingPolicy')} />

                <Toggle {...form.$('sentry').bind()} />
                <p className="settings__help">
                  {intl.formatMessage(messages.sentryInfo)}
                </p>

                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <Select field={form.$('searchEngine')} />

                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <Toggle {...form.$('isLockingFeatureEnabled').bind()} />
                {isLockingFeatureEnabled && (
                  <>
                    {isMac && systemPreferences.canPromptTouchID() && (
                      <Toggle {...form.$('useTouchIdToUnlock').bind()} />
                    )}

                    <Input
                      placeholder={intl.formatMessage(messages.lockedPassword)}
                      onChange={e => this.submit(e)}
                      {...form.$('lockedPassword')}
                      type="password"
                      scorePassword
                      showPasswordToggle
                    />
                    <p>{intl.formatMessage(messages.lockedPasswordInfo)}</p>

                    <Input
                      placeholder="Lock after inactivity"
                      onChange={e => this.submit(e)}
                      {...form.$('inactivityLock')}
                      autoFocus
                    />
                    <p>{intl.formatMessage(messages.inactivityLockInfo)}</p>
                  </>
                )}
                <p
                  className="settings__message"
                  style={{
                    borderTop: 0,
                    marginTop: 0,
                    paddingTop: 0,
                    marginBottom: '2rem',
                  }}
                >
                  <span>
                    {intl.formatMessage(messages.lockInfo, {
                      lockShortcut: `${lockFerdiumShortcutKey(false)}`,
                    })}
                  </span>
                </p>
              </div>
            )}

            {/* Language */}
            {this.state.activeSetttingsTab === 'language' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionLanguage)}
                </H2>

                <Select field={form.$('locale')} showLabel={false} />

                <Hr />

                <Toggle {...form.$('enableSpellchecking').bind()} />
                {!isMac && form.$('enableSpellchecking').value && (
                  <Select field={form.$('spellcheckerLanguage')} />
                )}
                {isMac && form.$('enableSpellchecking').value && (
                  <p className="settings__help">
                    {intl.formatMessage(messages.spellCheckerLanguageInfo)}
                  </p>
                )}

                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <Toggle {...form.$('enableTranslator').bind()} />

                {form.$('enableTranslator').value && (
                  <Select field={form.$('translatorEngine')} />
                )}
                {form.$('enableTranslator').value && (
                  <Select field={form.$('translatorLanguage')} />
                )}

                <Hr />

                <a
                  href={FERDIUM_TRANSLATION}
                  target="_blank"
                  className="link"
                  rel="noreferrer"
                >
                  {intl.formatMessage(messages.translationHelp)}{' '}
                  <Icon icon={mdiOpenInNew} />
                </a>
              </div>
            )}

            {/* Advanced */}
            {this.state.activeSetttingsTab === 'advanced' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionAdvanced)}
                </H2>

                <Toggle {...form.$('enableGPUAcceleration').bind()} />
                <Toggle {...form.$('enableGlobalHideShortcut').bind()} />
                <p className="settings__help indented__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Toggle {...form.$('useSelfSignedCertificates').bind()} />

                {useSelfSignedCertificates && (
                  <div className="settings__settings-group">
                    <p
                      style={{
                        padding: '0rem 0rem 1rem 0rem',
                        textAlign: 'justify',
                        fontSize: '1.1rem',
                      }}
                    >
                      {intl.formatMessage(messages.infoOpenCertificatesFolder)}
                    </p>
                    <div className="settings__open-settings-cache-container">
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(
                          messages.buttonOpenFerdiumCertsFolder,
                        )}
                        className="settings__open-settings-file-button"
                        onClick={() => openPath(certsFolder)}
                      />
                    </div>
                  </div>
                )}

                <p
                  className="settings__help"
                  style={{
                    padding: useSelfSignedCertificates
                      ? '1rem 0rem 0rem 0rem'
                      : undefined,
                  }}
                >
                  {intl.formatMessage(messages.warningSelfSignedCertificates)}
                </p>

                <Hr />

                <Input
                  placeholder="User Agent"
                  onChange={e => this.submit(e)}
                  {...form.$('userAgentPref').bind()}
                />
                <p className="settings__help">
                  {intl.formatMessage(globalMessages.userAgentHelp)}
                </p>
                <p className="settings__help">
                  {intl.formatMessage(messages.appRestartRequired)}
                </p>

                <Hr />

                <div className="settings__settings-group">
                  <H3>{intl.formatMessage(messages.subheadlineCache)}</H3>
                  <p>
                    {intl.formatMessage(messages.cacheInfo, {
                      size: cacheSize,
                    })}
                  </p>
                  {notCleared && (
                    <p>{intl.formatMessage(messages.cacheNotCleared)}</p>
                  )}
                  <div className="settings__settings-group">
                    <div className="settings__open-settings-cache-container">
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(globalMessages.clearCache)}
                        className="settings__open-settings-cache-button"
                        onClick={() => {
                          onClearAllCache();
                          this.onClearCacheClicked();
                        }}
                        disabled={isClearingAllCache}
                        loaded={!isClearingAllCache}
                      />
                      <Button
                        buttonType="secondary"
                        label="Open Process Manager"
                        className="settings__open-settings-cache-button"
                        onClick={openProcessManager}
                      />
                    </div>
                  </div>
                </div>

                <Hr />

                <div className="settings__settings-group">
                  <H3>
                    {intl.formatMessage(messages.subheadlineFerdiumProfile)}
                  </H3>
                  <p>
                    <div className="settings__open-settings-file-container">
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(
                          messages.buttonOpenFerdiumProfileFolder,
                        )}
                        className="settings__open-settings-file-button"
                        onClick={() => openPath(profileFolder)}
                      />
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(
                          messages.buttonOpenFerdiumServiceRecipesFolder,
                        )}
                        className="settings__open-settings-file-button"
                        onClick={() => openPath(recipeFolder)}
                      />
                      <Button
                        buttonType="secondary"
                        label={intl.formatMessage(
                          messages.buttonOpenImportExport,
                        )}
                        className="settings__open-settings-file-button"
                        onClick={() => openExternalUrl(serverURL, true)}
                      />
                    </div>
                  </p>
                  <p className="settings__help">
                    {intl.formatMessage(messages.serverHelp, {
                      serverURL,
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Updates */}
            {this.state.activeSetttingsTab === 'updates' && (
              <div>
                <H2 className="settings__section_header">
                  {intl.formatMessage(messages.sectionUpdates)}
                </H2>

                <Toggle {...form.$('automaticUpdates').bind()} />
                {automaticUpdates && !isWinPortable && (
                  <>
                    <>
                      <div>
                        <Toggle {...form.$('beta').bind()} />
                        {updateIsReadyToInstall ? (
                          <Button
                            label={intl.formatMessage(
                              messages.buttonInstallUpdate,
                            )}
                            onClick={installUpdate}
                          />
                        ) : (
                          <Button
                            buttonType="secondary"
                            label={intl.formatMessage(updateButtonLabelMessage)}
                            onClick={checkForUpdates}
                            disabled={
                              !automaticUpdates ||
                              isCheckingForUpdates ||
                              isUpdateAvailable ||
                              !isOnline
                            }
                            loaded={!isCheckingForUpdates || !isUpdateAvailable}
                          />
                        )}
                        {(isUpdateAvailable || updateIsReadyToInstall) && (
                          <Button
                            className="settings__updates__changelog-button"
                            label={intl.formatMessage(
                              messages.buttonShowChangelog,
                            )}
                            onClick={() => {
                              window.location.href = `#/releasenotes${updateVersionParse(
                                updateVersion,
                              )}`;
                            }}
                          />
                        )}
                        <br />
                        <br />
                      </div>
                      <p>
                        {intl.formatMessage(messages.currentVersion)}{' '}
                        {ferdiumVersion}
                      </p>
                      {noUpdateAvailable && (
                        <p>
                          {intl.formatMessage(messages.updateStatusUpToDate)}.
                        </p>
                      )}
                      {updateFailed && (
                        <Infobox type="danger" icon="alert">
                          &nbsp;An error occurred (check the console for more
                          details)
                        </Infobox>
                      )}
                    </>
                    {showServicesUpdatedInfoBar ? (
                      <>
                        <p>
                          <Icon icon={mdiPowerPlug} />
                          {intl.formatMessage(messages.servicesUpdated)}
                        </p>
                        <Button
                          label={intl.formatMessage(
                            messages.buttonReloadServices,
                          )}
                          onClick={() => window.location.reload()}
                        />
                      </>
                    ) : (
                      <p>
                        <Icon icon={mdiPowerPlug} />
                        &nbsp;
                        {intl.formatMessage(
                          messages.servicesUpdateStatusUpToDate,
                        )}
                      </p>
                    )}
                  </>
                )}
                <p className="settings__message">
                  <Icon icon={mdiGithub} /> Ferdium is based on{' '}
                  <a
                    href={`${GITHUB_FRANZ_URL}/franz`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Franz
                  </a>
                  , a project published under the{' '}
                  <a
                    href={`${GITHUB_FERDIUM_URL}/ferdium-app/blob/master/LICENSE.md`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apache-2.0 License
                  </a>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default injectIntl(EditSettingsForm);
