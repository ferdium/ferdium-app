import { mdiApps } from '@mdi/js';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Icon from '../../../components/ui/icon';
import WorkspaceIcon from '../../../components/ui/WorkspaceIcon';
import { altKey, cmdOrCtrlShortcutKey } from '../../../environment';
import { acceleratorString } from '../../../jsUtils';
import workspaceActions from '../actions';
import { workspaceStore } from '../index';
import type Workspace from '../models/Workspace';

const messages = defineMessages({
  allServices: {
    id: 'workspaceDrawer.allServices',
    defaultMessage: 'All services',
  },
});

const styles = theme => ({
  bar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '54px',
    flexShrink: 0,
    background: theme.workspaces.drawer.background,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: '8px',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    // Subtle right border to separate from service bar
    borderRight: `1px solid ${theme.workspaces.drawer.listItem.border}`,
  },
  item: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    marginBottom: '6px',
    cursor: 'pointer',
    transition: 'background-color 150ms',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: theme.workspaces.drawer.listItem.hoverBackground,
    },
  },
  activeItem: {
    backgroundColor: theme.workspaces.drawer.listItem.activeBackground,
    '&:hover': {
      backgroundColor: theme.workspaces.drawer.listItem.activeBackground,
    },
  },
  icon: {
    fill: theme.workspaces.drawer.listItem.name.color,
  },
  activeIcon: {
    fill: theme.workspaces.drawer.listItem.name.activeColor,
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null | undefined;
  hideAllServicesWorkspace?: boolean;
}

@observer
class WorkspaceQuickSwitchBar extends Component<IProps> {
  static defaultProps = {
    hideAllServicesWorkspace: false,
  };

  render(): ReactElement {
    const {
      classes,
      workspaces,
      activeWorkspace,
      hideAllServicesWorkspace,
      intl,
    } = this.props;

    return (
      <div className={classes.bar}>
        {/* "All services" entry */}
        {!hideAllServicesWorkspace && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            className={classnames([
              classes.item,
              !activeWorkspace ? classes.activeItem : null,
            ])}
            onClick={() => {
              workspaceActions.deactivate();
            }}
            onKeyDown={() => {}}
            data-tooltip-id="tooltip-quick-switch-bar"
            data-tooltip-content={intl.formatMessage(messages.allServices)}
          >
            <Icon
              icon={mdiApps}
              size={1.1}
              className={classnames([
                classes.icon,
                !activeWorkspace ? classes.activeIcon : null,
              ])}
            />
          </div>
        )}

        {workspaces.map((workspace, index) => (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            key={workspace.id}
            className={classnames([
              classes.item,
              activeWorkspace === workspace ? classes.activeItem : null,
            ])}
            onClick={() => {
              if (activeWorkspace !== workspace) {
                workspaceActions.activate({ workspace });
              }
            }}
            onKeyDown={() => {}}
            data-tooltip-id="tooltip-quick-switch-bar"
            data-tooltip-content={`${workspace.name} (${acceleratorString({
              index: index + 1,
              keyCombo: `${cmdOrCtrlShortcutKey(false)}+${altKey(false)}`,
            })})`}
          >
            <WorkspaceIcon
              iconPath={workspace.iconPath}
              name={workspace.name}
              size={32}
              isActive={activeWorkspace === workspace}
            />
          </div>
        ))}

        <ReactTooltip
          id="tooltip-quick-switch-bar"
          place="right"
          variant="dark"
          style={{ height: 'auto', zIndex: 210 }}
        />
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WorkspaceQuickSwitchBar),
);
