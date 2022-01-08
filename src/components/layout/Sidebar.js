import { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { defineMessages, injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import {
  mdiCheckAll,
  mdiViewGrid,
  mdiPlusBox,
  mdiCog,
  mdiBellOff,
  mdiBell,
  mdiLock,
} from '@mdi/js';

import Tabbar from '../services/tabs/Tabbar';
import {
  settingsShortcutKey,
  lockFerdiShortcutKey,
  todosToggleShortcutKey,
  workspaceToggleShortcutKey,
  addNewServiceShortcutKey,
  muteFerdiShortcutKey,
} from '../../environment';
import { todosStore } from '../../features/todos';
import { todoActions } from '../../features/todos/actions';
import AppStore from '../../stores/AppStore';
import SettingsStore from '../../stores/SettingsStore';
import globalMessages from '../../i18n/globalMessages';
import { Icon } from '../ui/icon';

const messages = defineMessages({
  addNewService: {
    id: 'sidebar.addNewService',
    defaultMessage: 'Add new service',
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
    defaultMessage: 'Open Ferdi Todos',
  },
  closeTodosDrawer: {
    id: 'sidebar.closeTodosDrawer',
    defaultMessage: 'Close Ferdi Todos',
  },
  lockFerdi: {
    id: 'sidebar.lockFerdi',
    defaultMessage: 'Lock Ferdi',
  },
});

class Sidebar extends Component {
  static propTypes = {
    openSettings: PropTypes.func.isRequired,
    closeSettings: PropTypes.func.isRequired,
    setActive: PropTypes.func.isRequired,
    reorder: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
    toggleNotifications: PropTypes.func.isRequired,
    toggleAudio: PropTypes.func.isRequired,
    toggleDarkMode: PropTypes.func.isRequired,
    showServicesUpdatedInfoBar: PropTypes.bool.isRequired,
    showMessageBadgeWhenMutedSetting: PropTypes.bool.isRequired,
    showServiceNameSetting: PropTypes.bool.isRequired,
    showMessageBadgesEvenWhenMuted: PropTypes.bool.isRequired,
    deleteService: PropTypes.func.isRequired,
    updateService: PropTypes.func.isRequired,
    hibernateService: PropTypes.func.isRequired,
    wakeUpService: PropTypes.func.isRequired,
    toggleMuteApp: PropTypes.func.isRequired,
    isAppMuted: PropTypes.bool.isRequired,
    isWorkspaceDrawerOpen: PropTypes.bool.isRequired,
    toggleWorkspaceDrawer: PropTypes.func.isRequired,
    isTodosServiceActive: PropTypes.bool.isRequired,
    stores: PropTypes.shape({
      app: PropTypes.instanceOf(AppStore).isRequired,
      settings: PropTypes.instanceOf(SettingsStore).isRequired,
    }).isRequired,
    actions: PropTypes.shape({
      settings: PropTypes.instanceOf(SettingsStore).isRequired,
    }).isRequired,
  };

  state = {
    tooltipEnabled: true,
  };

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
      isAppMuted,
      isWorkspaceDrawerOpen,
      toggleWorkspaceDrawer,
      stores,
      actions,
      isTodosServiceActive,
    } = this.props;
    const { intl } = this.props;
    const todosToggleMessage = todosStore.isTodosPanelVisible
      ? messages.closeTodosDrawer
      : messages.openTodosDrawer;

    const workspaceToggleMessage = isWorkspaceDrawerOpen
      ? messages.closeWorkspaceDrawer
      : messages.openWorkspaceDrawer;

    return (
      <div className="sidebar">
        <Tabbar
          {...this.props}
          enableToolTip={() => this.enableToolTip()}
          disableToolTip={() => this.disableToolTip()}
          useVerticalStyle={stores.settings.all.app.useVerticalStyle}
        />
        <>
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
          {todosStore.isFeatureEnabledByUser ? (
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
            )} (${muteFerdiShortcutKey(false)})`}
          >
            <Icon icon={isAppMuted ? mdiBellOff : mdiBell} size={1.5} />
          </button>

          {stores.settings.all.app.lockingFeatureEnabled ? (
            <button
              type="button"
              className="sidebar__button"
              onClick={() => {
                actions.settings.update({
                  type: 'app',
                  data: {
                    locked: true,
                  },
                });
              }}
              data-tip={`${intl.formatMessage(
                messages.lockFerdi,
              )} (${lockFerdiShortcutKey(false)})`}
            >
              <Icon icon={mdiLock} size={1.5} />
            </button>
          ) : null}
        </>
        <button
          type="button"
          onClick={() => openSettings({ path: 'app' })}
          className="sidebar__button sidebar__button--settings"
          data-tip={`${intl.formatMessage(
            globalMessages.settings,
          )} (${settingsShortcutKey(false)})`}
        >
          <Icon icon={mdiCog} size={1.5} />
          {
            this.props.stores.settings.app.automaticUpdates &&
              (this.props.stores.app.updateStatus === this.props.stores.app.updateStatusTypes.AVAILABLE ||
              this.props.stores.app.updateStatus === this.props.stores.app.updateStatusTypes.DOWNLOADED ||
              this.props.showServicesUpdatedInfoBar) && (
              <span className="update-available">•</span>
            )
          }
        </button>
        {this.state.tooltipEnabled && (
          <ReactTooltip place="right" type="dark" effect="solid" />
        )}
      </div>
    );
  }
}

export default injectIntl(inject('stores', 'actions')(observer(Sidebar)));
