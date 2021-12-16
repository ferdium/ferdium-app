import { Menu, dialog, app } from '@electron/remote';
import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import { SortableElement } from 'react-sortable-hoc';
import injectSheet from 'react-jss';
import ms from 'ms';

import { observable, autorun, reaction } from 'mobx';
import { mdiExclamation } from '@mdi/js';
import ServiceModel from '../../../models/Service';
import { cmdOrCtrlShortcutKey, shiftKey, altKey } from '../../../environment';
import globalMessages from '../../../i18n/globalMessages';
import SettingsStore from '../../../stores/SettingsStore';
import { Icon } from '../../ui/icon';

const IS_SERVICE_DEBUGGING_ENABLED = (
  localStorage.getItem('debug') || ''
).includes('Ferdi:Service');

const messages = defineMessages({
  reload: {
    id: 'tabs.item.reload',
    defaultMessage: 'Reload',
  },
  disableNotifications: {
    id: 'tabs.item.disableNotifications',
    defaultMessage: 'Disable notifications',
  },
  enableNotifications: {
    id: 'tabs.item.enableNotification',
    defaultMessage: 'Enable notifications',
  },
  disableAudio: {
    id: 'tabs.item.disableAudio',
    defaultMessage: 'Disable audio',
  },
  enableAudio: {
    id: 'tabs.item.enableAudio',
    defaultMessage: 'Enable audio',
  },
  enableDarkMode: {
    id: 'tabs.item.enableDarkMode',
    defaultMessage: 'Enable Dark mode',
  },
  disableDarkMode: {
    id: 'tabs.item.disableDarkMode',
    defaultMessage: 'Disable Dark mode',
  },
  disableService: {
    id: 'tabs.item.disableService',
    defaultMessage: 'Disable service',
  },
  enableService: {
    id: 'tabs.item.enableService',
    defaultMessage: 'Enable service',
  },
  hibernateService: {
    id: 'tabs.item.hibernateService',
    defaultMessage: 'Hibernate service',
  },
  wakeUpService: {
    id: 'tabs.item.wakeUpService',
    defaultMessage: 'Wake up service',
  },
  deleteService: {
    id: 'tabs.item.deleteService',
    defaultMessage: 'Delete service',
  },
  confirmDeleteService: {
    id: 'tabs.item.confirmDeleteService',
    defaultMessage: 'Do you really want to delete the {serviceName} service?',
  },
});

let pollIndicatorTransition = 'none';
let polledTransition = 'none';
let pollAnsweredTransition = 'none';

if (window && window.matchMedia('(prefers-reduced-motion: no-preference)')) {
  pollIndicatorTransition = 'background 0.5s';
  polledTransition = 'background 0.1s';
  pollAnsweredTransition = 'background 0.1s';
}

const styles = {
  pollIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    background: 'gray',
    transition: pollIndicatorTransition,
  },
  pollIndicatorPoll: {
    left: 2,
  },
  pollIndicatorAnswer: {
    left: 14,
  },
  polled: {
    background: 'yellow !important',
    transition: polledTransition,
  },
  pollAnswered: {
    background: 'green !important',
    transition: pollAnsweredTransition,
  },
  stale: {
    background: 'red !important',
  },
};

class TabItem extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    service: PropTypes.instanceOf(ServiceModel).isRequired,
    clickHandler: PropTypes.func.isRequired,
    shortcutIndex: PropTypes.number.isRequired,
    reload: PropTypes.func.isRequired,
    toggleNotifications: PropTypes.func.isRequired,
    toggleAudio: PropTypes.func.isRequired,
    toggleDarkMode: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
    deleteService: PropTypes.func.isRequired,
    disableService: PropTypes.func.isRequired,
    enableService: PropTypes.func.isRequired,
    hibernateService: PropTypes.func.isRequired,
    wakeUpService: PropTypes.func.isRequired,
    showMessageBadgeWhenMutedSetting: PropTypes.bool.isRequired,
    showServiceNameSetting: PropTypes.bool.isRequired,
    showMessageBadgesEvenWhenMuted: PropTypes.bool.isRequired,
    stores: PropTypes.shape({
      settings: PropTypes.instanceOf(SettingsStore).isRequired,
    }).isRequired,
  };

  @observable isPolled = false;

  @observable isPollAnswered = false;

  constructor(props) {
    super(props);
    this.state = {
      showShortcutIndex: false,
    };

    reaction(
      () => this.props.stores.settings.app.enableLongPressServiceHint,
      () => {
        this.checkForLongPress(
          this.props.stores.settings.app.enableLongPressServiceHint,
        );
      },
    );
  }

  handleShortcutIndex = (event, showShortcutIndex = true) => {
    if (event.key === 'Shift') {
      this.setState({ showShortcutIndex });
    }
  };

  checkForLongPress = enableLongPressServiceHint => {
    if (enableLongPressServiceHint) {
      document.addEventListener('keydown', e => {
        this.handleShortcutIndex(e);
      });

      document.addEventListener('keyup', e => {
        this.handleShortcutIndex(e, false);
      });
    }
  };

  componentDidMount() {
    const { service, stores } = this.props;

    if (IS_SERVICE_DEBUGGING_ENABLED) {
      autorun(() => {
        if (Date.now() - service.lastPoll < ms('0.2s')) {
          this.isPolled = true;

          setTimeout(() => {
            this.isPolled = false;
          }, ms('1s'));
        }

        if (Date.now() - service.lastPollAnswer < ms('0.2s')) {
          this.isPollAnswered = true;

          setTimeout(() => {
            this.isPollAnswered = false;
          }, ms('1s'));
        }
      });
    }

    this.checkForLongPress(stores.settings.app.enableLongPressServiceHint);
  }

  render() {
    const {
      classes,
      service,
      clickHandler,
      shortcutIndex,
      reload,
      toggleNotifications,
      toggleAudio,
      toggleDarkMode,
      deleteService,
      disableService,
      enableService,
      hibernateService,
      wakeUpService,
      openSettings,
      showMessageBadgeWhenMutedSetting,
      showServiceNameSetting,
      showMessageBadgesEvenWhenMuted,
    } = this.props;
    const { intl } = this.props;

    const menuTemplate = [
      {
        label: service.name || service.recipe.name,
        enabled: false,
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(messages.reload),
        click: reload,
        accelerator: `${cmdOrCtrlShortcutKey()}+R`,
        enabled: service.isEnabled,
      },
      {
        label: intl.formatMessage(globalMessages.edit),
        click: () =>
          openSettings({
            path: `services/edit/${service.id}`,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: service.isNotificationEnabled
          ? intl.formatMessage(messages.disableNotifications)
          : intl.formatMessage(messages.enableNotifications),
        click: () => toggleNotifications(),
        accelerator: `${cmdOrCtrlShortcutKey()}+${altKey()}+N`,
        enabled: service.isEnabled,
      },
      {
        label: service.isMuted
          ? intl.formatMessage(messages.enableAudio)
          : intl.formatMessage(messages.disableAudio),
        click: () => toggleAudio(),
        accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+A`,
        enabled: service.isEnabled,
      },
      {
        label: service.isDarkModeEnabled
          ? intl.formatMessage(messages.disableDarkMode)
          : intl.formatMessage(messages.enableDarkMode),
        click: () => toggleDarkMode(),
        accelerator: `${shiftKey()}+${altKey()}+D`,
        enabled: service.isEnabled,
      },
      {
        label: intl.formatMessage(
          service.isEnabled ? messages.disableService : messages.enableService,
        ),
        click: () => (service.isEnabled ? disableService() : enableService()),
        accelerator: `${cmdOrCtrlShortcutKey()}+${shiftKey()}+S`,
      },
      {
        label: intl.formatMessage(
          service.isHibernating
            ? messages.wakeUpService
            : messages.hibernateService,
        ),
        // eslint-disable-next-line no-confusing-arrow
        click: () =>
          service.isHibernating ? wakeUpService() : hibernateService(),
        enabled: service.isEnabled && service.canHibernate,
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(messages.deleteService),
        click: () => {
          const selection = dialog.showMessageBoxSync(app.mainWindow, {
            type: 'question',
            message: intl.formatMessage(messages.deleteService),
            detail: intl.formatMessage(messages.confirmDeleteService, {
              serviceName: service.name || service.recipe.name,
            }),
            buttons: [
              intl.formatMessage(globalMessages.yes),
              intl.formatMessage(globalMessages.no),
            ],
          });
          if (selection === 0) {
            deleteService();
          }
        },
      },
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);

    let notificationBadge = null;
    if (
      (showMessageBadgeWhenMutedSetting || service.isNotificationEnabled) &&
      showMessageBadgesEvenWhenMuted &&
      service.isBadgeEnabled
    ) {
      notificationBadge = (
        <span>
          {service.unreadDirectMessageCount > 0 && (
            <span className="tab-item__message-count">
              {service.unreadDirectMessageCount}
            </span>
          )}
          {service.unreadIndirectMessageCount > 0 &&
            service.unreadDirectMessageCount === 0 &&
            service.isIndirectMessageBadgeEnabled && (
              <span className="tab-item__message-count is-indirect">•</span>
            )}
          {service.isHibernating && (
            <span className="tab-item__message-count hibernating">•</span>
          )}
        </span>
      );
    }

    let errorBadge = null;
    if (service.isError) {
      errorBadge = (
        <Icon icon={mdiExclamation} className="tab-item__error-icon" />
      );
    }

    return (
      <li
        className={classnames({
          [classes.stale]:
            IS_SERVICE_DEBUGGING_ENABLED && service.lostRecipeConnection,
          'tab-item': true,
          'is-active': service.isActive,
          'has-custom-icon': service.hasCustomIcon,
          'is-disabled': !service.isEnabled,
          'is-label-enabled': showServiceNameSetting,
        })}
        onClick={clickHandler}
        onContextMenu={() => menu.popup()}
        data-tip={`${service.name} ${
          shortcutIndex <= 9
            ? `(${cmdOrCtrlShortcutKey(false)}+${shortcutIndex})`
            : ''
        }`}
      >
        {showServiceNameSetting ? (
          <div>
            <img src={service.icon} className="tab-item__icon" alt="" />
            <span className="tab-item__label">{service.name}</span>
          </div>
        ) : (
          <img src={service.icon} className="tab-item__icon" alt="" />
        )}

        {notificationBadge}
        {errorBadge}
        {IS_SERVICE_DEBUGGING_ENABLED && (
          <>
            <div
              className={classnames({
                [classes.pollIndicator]: true,
                [classes.pollIndicatorPoll]: true,
                [classes.polled]: this.isPolled,
              })}
            />
            <div
              className={classnames({
                [classes.pollIndicator]: true,
                [classes.pollIndicatorAnswer]: true,
                [classes.pollAnswered]: this.isPollAnswered,
              })}
            />
          </>
        )}
        {shortcutIndex <= 9 && this.state.showShortcutIndex && (
          <span className="tab-item__shortcut-index">{shortcutIndex}</span>
        )}
      </li>
    );
  }
}

export default injectIntl(
  SortableElement(
    injectSheet(styles, { injectTheme: true })(
      inject('stores')(observer(TabItem)),
    ),
  ),
);
