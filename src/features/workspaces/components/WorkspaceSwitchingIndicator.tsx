import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import withStyles, { type WithStylesProps } from 'react-jss';
import Loader from '../../../components/ui/loader';
import { DEFAULT_LOADER_COLOR } from '../../../config';
import { workspaceStore } from '../index';

const messages = defineMessages({
  switchingTo: {
    id: 'workspaces.switchingIndicator.switchingTo',
    defaultMessage: 'Switching to',
  },
});

const wrapperTransition = window?.matchMedia(
  '(prefers-reduced-motion: no-preference)',
)
  ? 'width 0.5s ease'
  : 'none';

const styles = theme => ({
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    position: 'absolute',
    transition: wrapperTransition,
    width: `calc(100% - ${theme.workspaces.drawer.width}px)`,
    marginTop: '20px',
  },
  component: {
    background: 'rgba(20, 20, 20, 0.4)',
    padding: '10px 20px',
    display: 'flex',
    width: 'auto',
    height: 'auto',
    margin: [0, 'auto'],
    borderRadius: 6,
    alignItems: 'center',
    zIndex: 200,
  },
  spinner: {
    marginRight: 10,
  },
  message: {
    fontSize: 16,
    whiteSpace: 'nowrap',
    color: theme.colorAppLoaderSpinner,
  },
});

interface IProps
  extends WithStylesProps<typeof styles>,
    WrappedComponentProps {}

@observer
class WorkspaceSwitchingIndicator extends Component<IProps> {
  render(): ReactElement | null {
    const { classes, intl } = this.props;
    const { isSwitchingWorkspace, nextWorkspace } = workspaceStore;

    if (!isSwitchingWorkspace) {
      return null;
    }

    const nextWorkspaceName = nextWorkspace
      ? nextWorkspace.name
      : 'All services';

    return (
      <div className={classnames([classes.wrapper])}>
        <div className={classes.component}>
          <Loader className={classes.spinner} color={DEFAULT_LOADER_COLOR} />
          <p className={classes.message}>
            {`${intl.formatMessage(messages.switchingTo)} ${nextWorkspaceName}`}
          </p>
        </div>
      </div>
    );
  }
}

export default injectIntl(
  withStyles(styles, { injectTheme: true })(WorkspaceSwitchingIndicator),
);
