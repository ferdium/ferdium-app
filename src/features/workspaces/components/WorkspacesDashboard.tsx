import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import Appear from '../../../components/ui/effects/Appear';
import { H1 } from '../../../components/ui/headline';
import Infobox from '../../../components/ui/infobox/index';
import Loader from '../../../components/ui/loader';
import type Request from '../../../stores/lib/Request';
import type Workspace from '../models/Workspace';
import CreateWorkspaceForm from './CreateWorkspaceForm';
import WorkspaceItem from './WorkspaceItem';

const messages = defineMessages({
  headline: {
    id: 'settings.workspaces.headline',
    defaultMessage: 'Your workspaces',
  },
  noServicesAdded: {
    id: 'settings.workspaces.noWorkspacesAdded',
    defaultMessage: "You haven't created any workspaces yet.",
  },
  workspacesRequestFailed: {
    id: 'settings.workspaces.workspacesRequestFailed',
    defaultMessage: 'Could not load your workspaces',
  },
  tryReloadWorkspaces: {
    id: 'settings.workspaces.tryReloadWorkspaces',
    defaultMessage: 'Try again',
  },
  updatedInfo: {
    id: 'settings.workspaces.updatedInfo',
    defaultMessage: 'Your changes have been saved',
  },
  deletedInfo: {
    id: 'settings.workspaces.deletedInfo',
    defaultMessage: 'Workspace has been deleted',
  },
  workspaceFeatureInfo: {
    id: 'settings.workspaces.workspaceFeatureInfo',
    defaultMessage:
      'Ferdium Workspaces let you focus on what’s important right now. Set up different sets of services and easily switch between them at any time. You decide which services you need when and where, so we can help you stay on top of your game - or easily switch off from work whenever you want.',
  },
  workspaceFeatureHeadline: {
    id: 'settings.workspaces.workspaceFeatureHeadline',
    defaultMessage: 'Less is More: Introducing Ferdium Workspaces',
  },
});

const styles = {
  table: {
    width: '100%',
    '& td': {
      padding: '10px',
    },
  },
  createForm: {
    height: 'auto',
  },
  appear: {
    height: 'auto',
  },
  teaserImage: {
    width: 250,
    margin: [-8, 0, 0, 20],
    alignSelf: 'center',
  },
};

interface IProps extends WithStylesProps<typeof styles>, WrappedComponentProps {
  getUserWorkspacesRequest: Request;
  createWorkspaceRequest: Request;
  deleteWorkspaceRequest: Request;
  updateWorkspaceRequest: Request;
  onCreateWorkspaceSubmit: (workspace: Workspace) => void;
  onWorkspaceClick: (workspace: Workspace) => void;
  workspaces: Workspace[];
}

@observer
class WorkspacesDashboard extends Component<IProps> {
  render(): ReactElement {
    const {
      classes,
      getUserWorkspacesRequest,
      createWorkspaceRequest,
      deleteWorkspaceRequest,
      updateWorkspaceRequest,
      onCreateWorkspaceSubmit,
      onWorkspaceClick,
      workspaces,
    } = this.props;

    const { intl } = this.props;

    return (
      <div className="settings__main">
        <div className="settings__header">
          <H1>{intl.formatMessage(messages.headline)}</H1>
        </div>
        <div className="settings__body">
          {/* ===== Workspace updated info ===== */}
          {updateWorkspaceRequest.wasExecuted &&
          updateWorkspaceRequest.result ? (
            <Appear className={classes.appear}>
              <Infobox
                type="success"
                icon="checkbox-marked-circle-outline"
                dismissible
                onUnmount={updateWorkspaceRequest.reset}
              >
                {intl.formatMessage(messages.updatedInfo)}
              </Infobox>
            </Appear>
          ) : null}

          {/* ===== Workspace deleted info ===== */}
          {deleteWorkspaceRequest.wasExecuted &&
          deleteWorkspaceRequest.result ? (
            <Appear className={classes.appear}>
              <Infobox
                type="success"
                icon="checkbox-marked-circle-outline"
                dismissible
                onUnmount={deleteWorkspaceRequest.reset}
              >
                {intl.formatMessage(messages.deletedInfo)}
              </Infobox>
            </Appear>
          ) : null}

          {/* ===== Create workspace form ===== */}
          <div className={classes.createForm}>
            <CreateWorkspaceForm
              isSubmitting={createWorkspaceRequest.isExecuting}
              onSubmit={onCreateWorkspaceSubmit}
            />
          </div>
          {getUserWorkspacesRequest.isExecuting ? (
            <Loader />
          ) : (
            <>
              {/* ===== Workspace could not be loaded error ===== */}
              {getUserWorkspacesRequest.error ? (
                <Infobox
                  icon="alert"
                  type="danger"
                  ctaLabel={intl.formatMessage(messages.tryReloadWorkspaces)}
                  // ctaLoading={getUserWorkspacesRequest.isExecuting} // TODO: [TECH DEBT][PROP NOT USED IN COMPONENT] need to check and update
                  ctaOnClick={getUserWorkspacesRequest.retry}
                >
                  {intl.formatMessage(messages.workspacesRequestFailed)}
                </Infobox>
              ) : (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {workspaces.length === 0 ? (
                    <div className="align-middle settings__empty-state">
                      {/* ===== Workspaces empty state ===== */}
                      <p className="settings__empty-text">
                        <span className="emoji">
                          <img src="./assets/images/emoji/sad.png" alt="" />
                        </span>
                        {intl.formatMessage(messages.noServicesAdded)}
                      </p>
                    </div>
                  ) : (
                    <table className={classes.table}>
                      {/* ===== Workspaces list ===== */}
                      <tbody>
                        {workspaces.map(workspace => (
                          <WorkspaceItem
                            key={workspace.id}
                            workspace={workspace}
                            onItemClick={w => onWorkspaceClick(w)}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WorkspacesDashboard),
);
