import { mdiCog, mdiPlusBox } from '@mdi/js';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { H1 } from '../../../components/ui/headline';
import Icon from '../../../components/ui/icon';
import workspaceActions from '../actions';
import { getUserWorkspacesRequest } from '../api';
import { workspaceStore } from '../index';
import type Workspace from '../models/Workspace';
import WorkspaceDrawerItem from './WorkspaceDrawerItem';

const messages = defineMessages({
  headline: {
    id: 'workspaceDrawer.headline',
    defaultMessage: 'Workspaces',
  },
  allServices: {
    id: 'workspaceDrawer.allServices',
    defaultMessage: 'All services',
  },
  workspacesSettingsTooltip: {
    id: 'workspaceDrawer.workspacesSettingsTooltip',
    defaultMessage: 'Edit workspaces settings',
  },
  workspaceFeatureInfo: {
    id: 'workspaceDrawer.workspaceFeatureInfo',
    defaultMessage:
      '<p>Ferdium Workspaces let you focus on what’s important right now. Set up different sets of services and easily switch between them at any time.</p><p>You decide which services you need when and where, so we can help you stay on top of your game - or easily switch off from work whenever you want.</p>',
  },
  addNewWorkspaceLabel: {
    id: 'workspaceDrawer.addNewWorkspaceLabel',
    defaultMessage: 'Add new workspace',
  },
});

const styles = theme => ({
  drawer: {
    background: theme.workspaces.drawer.background,
    width: `${theme.workspaces.drawer.width}px`,
    display: 'flex',
    flexDirection: 'column',
  },
  headline: {
    fontSize: '24px',
    marginTop: '38px',
    marginBottom: '25px',
    marginLeft: theme.workspaces.drawer.padding,
  },
  workspacesSettingsButton: {
    float: 'right',
    marginRight: theme.workspaces.drawer.padding,
    marginTop: '2px',
  },
  workspacesSettingsButtonIcon: {
    fill: theme.workspaces.drawer.buttons.color,
    '&:hover': {
      fill: theme.workspaces.drawer.buttons.hoverColor,
    },
  },
  workspaces: {
    height: 'auto',
    overflowY: 'auto',
  },
  addNewWorkspaceLabel: {
    height: 'auto',
    color: theme.workspaces.drawer.buttons.color,
    margin: [40, 0],
    textAlign: 'center',
    '& > svg': {
      fill: theme.workspaces.drawer.buttons.color,
    },
    '& > span': {
      fontSize: '13px',
      marginLeft: 10,
      position: 'relative',
      top: -3,
    },
    '&:hover': {
      color: theme.workspaces.drawer.buttons.hoverColor,
      '& > svg': {
        fill: theme.workspaces.drawer.buttons.hoverColor,
      },
    },
  },
});

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  getServicesForWorkspace: (workspace: Workspace | null) => string[];
}

@observer
class WorkspaceDrawer extends Component<IProps> {
  componentDidMount(): void {
    try {
      getUserWorkspacesRequest.execute();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  render(): ReactElement {
    const { classes, getServicesForWorkspace } = this.props;
    const { intl } = this.props;
    const { activeWorkspace, isSwitchingWorkspace, nextWorkspace, workspaces } =
      workspaceStore;
    const actualWorkspace = isSwitchingWorkspace
      ? nextWorkspace
      : activeWorkspace;
    return (
      <div className={`${classes.drawer} workspaces-drawer`}>
        <H1 className={classes.headline}>
          {intl.formatMessage(messages.headline)}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <span
            className={classes.workspacesSettingsButton}
            onKeyDown={noop}
            onClick={() => {
              workspaceActions.openWorkspaceSettings();
            }}
            data-tooltip-id="tooltip-workspaces-drawer"
            data-tooltip-content={intl.formatMessage(
              messages.workspacesSettingsTooltip,
            )}
          >
            <Icon
              icon={mdiCog}
              size={1.5}
              className={classes.workspacesSettingsButtonIcon}
            />
          </span>
        </H1>
        <div className={classes.workspaces}>
          <WorkspaceDrawerItem
            name={intl.formatMessage(messages.allServices)}
            onClick={() => {
              workspaceActions.deactivate();
              workspaceActions.toggleWorkspaceDrawer();
            }}
            services={getServicesForWorkspace(null)}
            isActive={actualWorkspace == null}
            shortcutIndex={0}
          />
          {workspaces.map((workspace, index) => (
            <WorkspaceDrawerItem
              key={workspace.id}
              name={workspace.name}
              isActive={actualWorkspace === workspace}
              onClick={() => {
                if (actualWorkspace === workspace) {
                  return;
                }
                workspaceActions.activate({ workspace });
                workspaceActions.toggleWorkspaceDrawer();
              }}
              onContextMenuEditClick={() =>
                workspaceActions.edit({ workspace })
              }
              services={getServicesForWorkspace(workspace)}
              shortcutIndex={index + 1}
            />
          ))}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className={classes.addNewWorkspaceLabel}
            onClick={() => {
              workspaceActions.openWorkspaceSettings();
            }}
            onKeyDown={noop}
          >
            <Icon
              icon={mdiPlusBox}
              className={classes.workspacesSettingsButtonIcon}
            />
            <span>{intl.formatMessage(messages.addNewWorkspaceLabel)}</span>
          </div>
        </div>
        <ReactTooltip
          id="tooltip-workspaces-drawer"
          place="right"
          variant="dark"
          style={{ height: 'auto', zIndex: 210 }}
        />
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WorkspaceDrawer),
);
