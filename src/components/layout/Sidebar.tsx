import { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { inject, observer } from 'mobx-react';
import {
  mdiCheckAll,
  mdiViewGrid,
  mdiPlusBox,
  mdiCog,
  mdiBellOff,
  mdiBell,
  mdiLock,
  mdiMenu,
  mdiChevronDown,
  mdiChevronRight,
  mdiViewSplitVertical,
} from '@mdi/js';

import Tabbar from '../services/tabs/Tabbar';
import {
  settingsShortcutKey,
  lockFerdiumShortcutKey,
  todosToggleShortcutKey,
  workspaceToggleShortcutKey,
  addNewServiceShortcutKey,
  splitModeToggleShortcutKey,
  muteFerdiumShortcutKey,
} from '../../environment';
import { todosStore } from '../../features/todos';
import { todoActions } from '../../features/todos/actions';
import globalMessages from '../../i18n/globalMessages';
import Icon from '../ui/icon';
import { Actions } from '../../actions/lib/actions';
import { RealStores } from '../../stores';
import Service from '../../models/Service';

const messages = defineMessages({
  addNewService: {
    id: 'sidebar.addNewService',
    defaultMessage: 'Add new service',
  },
  splitModeToggle: {
    id: 'sidebar.splitModeToggle',
    defaultMessage: 'Split Mode Toggle',
  },
  mute: {
    id: 'sidebar.muteApp',
    defaultMessage: 'Disable notifications & audio',
  },
  unmute: {
    id: 'sidebar.unmuteApp',
    defaultMessage: 'Enable notifications & audio',
  },
  openWorkspaceDrawer: {
    id: 'sidebar.openWorkspaceDrawer',
    defaultMessage: 'Open workspace drawer',
  },
  closeWorkspaceDrawer: {
    id: 'sidebar.closeWorkspaceDrawer',
    defaultMessage: 'Close workspace drawer',
  },
  openTodosDrawer: {
    id: 'sidebar.openTodosDrawer',
    defaultMessage: 'Open Ferdium Todos',
  },
  closeTodosDrawer: {
    id: 'sidebar.closeTodosDrawer',
    defaultMessage: 'Close Ferdium Todos',
  },
  lockFerdium: {
    id: 'sidebar.lockFerdium',
    defaultMessage: 'Lock Ferdium',
  },
});

interface IProps extends WrappedComponentProps {
  services: Service[];
  showServicesUpdatedInfoBar: boolean;
  showMessageBadgeWhenMutedSetting: boolean;
  showServiceNameSetting: boolean;
  showMessageBadgesEvenWhenMuted: boolean;
  isAppMuted: boolean;
  isMenuCollapsed: boolean;
  isWorkspaceDrawerOpen: boolean;
  isTodosServiceActive: boolean;
  actions?: Actions;
  stores?: RealStores;

  deleteService: () => void;
  updateService: () => void;
  hibernateService: () => void;
  wakeUpService: () => void;
  toggleMuteApp: () => void;
  toggleCollapseMenu: () => void;
  toggleWorkspaceDrawer: () => void;
  openSettings: (arg: { path: string }) => void;
  closeSettings: () => void;
  setActive: () => void;
  reorder: () => void;
  reload: () => void;
  toggleNotifications: () => void;
  toggleAudio: () => void;
  toggleDarkMode: () => void;
}

interface IState {
  tooltipEnabled: boolean;
}

@observer
@inject('stores', 'actions')
class Sidebar extends Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      tooltipEnabled: true,
    };
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  enableToolTip() {
    this.setState({ tooltipEnabled: true });
  }

  disableToolTip() {
    this.setState({ tooltipEnabled: false });
  }

  updateToolTip() {
    this.disableToolTip();
    setTimeout(this.enableToolTip.bind(this));
  }

  render() {
    const {
      openSettings,
      toggleMuteApp,
      toggleCollapseMenu,
      isAppMuted,
      isWorkspaceDrawerOpen,
      toggleWorkspaceDrawer,
      stores,
      actions,
      isTodosServiceActive,
    } = this.props;
    const {
      hideCollapseButton,
      hideRecipesButton,
      hideWorkspacesButton,
      hideNotificationsButton,
      hideSettingsButton,
      hideSplitModeButton,
      useHorizontalStyle,
      splitMode,
    } = stores!.settings.app;
    const { intl } = this.props;
    const todosToggleMessage = todosStore.isTodosPanelVisible
      ? messages.closeTodosDrawer
      : messages.openTodosDrawer;

    const workspaceToggleMessage = isWorkspaceDrawerOpen
      ? messages.closeWorkspaceDrawer
      : messages.openWorkspaceDrawer;

    const numberActiveButtons = [
      !hideRecipesButton,
      !hideWorkspacesButton,
      !hideNotificationsButton,
      !hideSettingsButton,
      !hideSplitModeButton,
      todosStore.isFeatureEnabledByUser,
    ].filter(Boolean).length;

    const { isMenuCollapsed } = stores!.settings.all.app;

    return (
      <div className="sidebar">
        <Tabbar
          {...this.props}
          enableToolTip={() => this.enableToolTip()}
          disableToolTip={() => this.disableToolTip()}
          useHorizontalStyle={stores!.settings.all.app.useHorizontalStyle}
        />
        <>
          {numberActiveButtons <= 1 || hideCollapseButton ? null : (
            <button
              type="button"
              onClick={() => toggleCollapseMenu()}
              className="sidebar__button sidebar__button--hamburger-menu"
            >
              {isMenuCollapsed ? <Icon icon={mdiMenu} size={1.5} /> : null}

              {!isMenuCollapsed && !useHorizontalStyle ? (
                <Icon icon={mdiChevronDown} size={1.5} />
              ) : null}

              {!isMenuCollapsed && useHorizontalStyle ? (
                <Icon icon={mdiChevronRight} size={1.5} />
              ) : null}
            </button>
          )}
          {!hideRecipesButton && !isMenuCollapsed ? (
            <button
              type="button"
              onClick={() => openSettings({ path: 'recipes' })}
              className="sidebar__button sidebar__button--new-service"
              data-tip={`${intl.formatMessage(
                messages.addNewService,
              )} (${addNewServiceShortcutKey(false)})`}
            >
              <Icon icon={mdiPlusBox} size={1.5} />
            </button>
          ) : null}
          {!hideSplitModeButton && !isMenuCollapsed ? (
            <button
              type="button"
              onClick={() => {
                actions!.settings.update({
                  type: 'app',
                  data: {
                    splitMode: !splitMode,
                  },
                });
              }}
              className="sidebar__button sidebar__button--split-mode-toggle"
              data-tip={`${intl.formatMessage(
                messages.splitModeToggle,
              )} (${splitModeToggleShortcutKey(false)})`}
            >
              <Icon icon={mdiViewSplitVertical} size={1.5} />
            </button>
          ) : null}
          {!hideWorkspacesButton && !isMenuCollapsed ? (
            <button
              type="button"
              onClick={() => {
                toggleWorkspaceDrawer();
                this.updateToolTip();
              }}
              className={`sidebar__button sidebar__button--workspaces ${
                isWorkspaceDrawerOpen ? 'is-active' : ''
              }`}
              data-tip={`${intl.formatMessage(
                workspaceToggleMessage,
              )} (${workspaceToggleShortcutKey(false)})`}
            >
              <Icon icon={mdiViewGrid} size={1.5} />
            </button>
          ) : null}
          {!hideNotificationsButton && !isMenuCollapsed ? (
            <button
              type="button"
              onClick={() => {
                toggleMuteApp();
                this.updateToolTip();
              }}
              className={`sidebar__button sidebar__button--audio ${
                isAppMuted ? 'is-muted' : ''
              }`}
              data-tip={`${intl.formatMessage(
                isAppMuted ? messages.unmute : messages.mute,
              )} (${muteFerdiumShortcutKey(false)})`}
            >
              <Icon icon={isAppMuted ? mdiBellOff : mdiBell} size={1.5} />
            </button>
          ) : null}
          {todosStore.isFeatureEnabledByUser && !isMenuCollapsed ? (
            <button
              type="button"
              onClick={() => {
                todoActions.toggleTodosPanel();
                this.updateToolTip();
              }}
              disabled={isTodosServiceActive}
              className={`sidebar__button sidebar__button--todos ${
                todosStore.isTodosPanelVisible ? 'is-active' : ''
              }`}
              data-tip={`${intl.formatMessage(
                todosToggleMessage,
              )} (${todosToggleShortcutKey(false)})`}
            >
              <Icon icon={mdiCheckAll} size={1.5} />
            </button>
          ) : null}
          {stores!.settings.all.app.lockingFeatureEnabled ? (
            <button
              type="button"
              className="sidebar__button"
              onClick={() => {
                actions!.settings.update({
                  type: 'app',
                  data: {
                    locked: true,
                  },
                });
              }}
              data-tip={`${intl.formatMessage(
                messages.lockFerdium,
              )} (${lockFerdiumShortcutKey(false)})`}
            >
              <Icon icon={mdiLock} size={1.5} />
            </button>
          ) : null}
        </>
        {this.state.tooltipEnabled && (
          <ReactTooltip place="right" type="dark" effect="solid" />
        )}
        {!hideSettingsButton && !isMenuCollapsed ? (
          <button
            type="button"
            onClick={() => openSettings({ path: 'app' })}
            className="sidebar__button sidebar__button--settings"
            data-tip={`${intl.formatMessage(
              globalMessages.settings,
            )} (${settingsShortcutKey(false)})`}
          >
            <Icon icon={mdiCog} size={1.5} />
            {stores!.settings.app.automaticUpdates &&
              (stores!.app.updateStatus ===
                stores!.app.updateStatusTypes.AVAILABLE ||
                stores!.app.updateStatus ===
                  stores!.app.updateStatusTypes.DOWNLOADED ||
                this.props.showServicesUpdatedInfoBar) && (
                <span className="update-available">•</span>
              )}
          </button>
        ) : null}
      </div>
    );
  }
}

export default injectIntl(Sidebar);
