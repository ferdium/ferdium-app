import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import injectSheet from 'react-jss';
import { defineMessages, injectIntl } from 'react-intl';
import ReactTooltip from 'react-tooltip';

import { mdiPlusBox, mdiCog } from '@mdi/js';

import { H1 } from '../../../components/ui/headline';
import { Icon } from '../../../components/ui/icon';
import WorkspaceDrawerItem from './WorkspaceDrawerItem';
import { workspaceActions } from '../actions';
import { workspaceStore } from '../index';
import {
  getUserWorkspacesRequest,
} from '../api';

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
      '<p>ferdium Workspaces let you focus on what’s important right now. Set up different sets of services and easily switch between them at any time.</p><p>You decide which services you need when and where, so we can help you stay on top of your game - or easily switch off from work whenever you want.</p>',
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

class WorkspaceDrawer extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    getServicesForWorkspace: PropTypes.func.isRequired,
  };

  componentDidMount() {
    ReactTooltip.rebuild();
    try {
      getUserWorkspacesRequest.execute();
    } catch (error) {
      console.log(error);
    }
  }

  render() {
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
          <span
            className={classes.workspacesSettingsButton}
            onClick={() => {
              workspaceActions.openWorkspaceSettings();
            }}
            data-tip={`${intl.formatMessage(
              messages.workspacesSettingsTooltip,
            )}`}
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
                if (actualWorkspace === workspace) return;
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
          <div
            className={classes.addNewWorkspaceLabel}
            onClick={() => {
              workspaceActions.openWorkspaceSettings();
            }}
          >
            <Icon
              icon={mdiPlusBox}
              className={classes.workspacesSettingsButtonIcon}
            />
            <span>{intl.formatMessage(messages.addNewWorkspaceLabel)}</span>
          </div>
        </div>
        <ReactTooltip place="right" type="dark" effect="solid" />
      </div>
    );
  }
}

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(observer(WorkspaceDrawer)),
);
