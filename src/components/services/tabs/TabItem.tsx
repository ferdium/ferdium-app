import { Menu, app, dialog } from '@electron/remote';
import { mdiExclamation, mdiVolumeSource } from '@mdi/js';
import classnames from 'classnames';
import { noop } from 'lodash';
import { autorun, makeObservable, observable, reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import ms from 'ms';
import { Component } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import injectSheet, { type WithStylesProps } from 'react-jss';
import { SortableElement } from 'react-sortable-hoc';
import type { Stores } from '../../../@types/stores.types';
import { altKey, cmdOrCtrlShortcutKey, shiftKey } from '../../../environment';
import globalMessages from '../../../i18n/globalMessages';
import type Service from '../../../models/Service';
import Icon from '../../ui/icon';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;
import { acceleratorString, isShiftKeyPress } from '../../../jsUtils';

const IS_SERVICE_DEBUGGING_ENABLED = (
  localStorage.getItem('debug') || ''
).includes('Ferdium:Service');

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

if (window?.matchMedia('(prefers-reduced-motion: no-preference)')) {
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

interface IProps extends WrappedComponentProps, WithStylesProps<typeof styles> {
  showMessageBadgeWhenMutedSetting: boolean;
  showServiceNameSetting: boolean;
  showMessageBadgesEvenWhenMuted: boolean;
  service: Service;
  shortcutIndex: number;
  stores?: Stores;
  reload: () => void;

  clickHandler: () => void;
  toggleNotifications: () => void;
  toggleAudio: () => void;
  toggleDarkMode: () => void;
  openSettings: (args: { path: string }) => void;
  deleteService: () => void;
  clearCache: () => void;
  disableService: () => void;
  enableService: () => void;
  hibernateService: () => void;
  wakeUpService: () => void;
}

interface IState {
  showShortcutIndex: boolean;
}

@inject('stores')
@observer
class TabItem extends Component<IProps, IState> {
  @observable isPolled = false;

  @observable isPollAnswered = false;

  constructor(props) {
    super(props);

    makeObservable(this);

    this.state = {
      showShortcutIndex: false,
    };

    reaction(
      () => this.props.stores!.settings.app.enableLongPressServiceHint,
      () => {
        this.checkForLongPress(
          this.props.stores!.settings.app.enableLongPressServiceHint,
        );
      },
    );
  }

  handleShortcutIndex = (event: KeyboardEvent, showShortcutIndex = true) => {
    if (isShiftKeyPress(event.key)) {
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

    this.checkForLongPress(stores!.settings.app.enableLongPressServiceHint);
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
      clearCache,
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

    const menuTemplate: MenuItemConstructorOptions[] = [
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

        click: () =>
          service.isHibernating ? wakeUpService() : hibernateService(),
        enabled: service.isEnabled && service.canHibernate,
      },
      {
        label: intl.formatMessage(globalMessages.clearCache),
        click: () => clearCache(),
        enabled: service.isEnabled,
      },
      {
        type: 'separator',
      },
      {
        label: intl.formatMessage(messages.deleteService),
        click: () => {
          // @ts-expect-error Fix me
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

    const showNotificationBadge =
      (showMessageBadgeWhenMutedSetting || service.isNotificationEnabled) &&
      showMessageBadgesEvenWhenMuted &&
      service.isBadgeEnabled;

    const showMediaBadge =
      service.isMediaBadgeEnabled &&
      service.isMediaPlaying &&
      service.isEnabled;
    const mediaBadge = (
      <Icon icon={mdiVolumeSource} className="tab-item__icon" />
    );

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
        onKeyDown={noop}
        role="presentation"
        onContextMenu={() => menu.popup()}
        data-tooltip-id="tooltip-sidebar-button"
        data-tooltip-content={`${service.name} ${acceleratorString(
          shortcutIndex,
          cmdOrCtrlShortcutKey(false),
        )}`}
      >
        <img src={service.icon} className="tab-item__icon" alt="" />
        {showServiceNameSetting && (
          <span className="tab-item__label">{service.name}</span>
        )}
        {showNotificationBadge && (
          <>
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
          </>
        )}
        {service.isError && (
          <Icon icon={mdiExclamation} className="tab-item__error-icon" />
        )}
        {showMediaBadge && mediaBadge}
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
        {shortcutIndex <= 10 && this.state.showShortcutIndex && (
          <span className="tab-item__shortcut-index">{shortcutIndex % 10}</span>
        )}
      </li>
    );
  }
}

export default injectIntl(
  // @ts-expect-error Fix me
  SortableElement(injectSheet(styles, { injectTheme: true })(TabItem)),
);
