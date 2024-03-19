import { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import withStyles, { WithStylesProps } from 'react-jss';
import { noop } from 'lodash';
import Workspace from '../models/Workspace';
import WorkspaceIcon from '../../../components/ui/WorkspaceIcon';

const styles = theme => ({
  row: {
    height: theme.workspaces.settings.listItems.height,
    borderBottom: `1px solid ${theme.workspaces.settings.listItems.borderColor}`,
    '&:hover': {
      background: theme.workspaces.settings.listItems.hoverBgColor,
    },
  },
  columnName: {
    width: '60px',
    borderCollapse: 'separate',
  },
});

interface IProps extends WithStylesProps<typeof styles> {
  workspace: Workspace;
  onItemClick: (workspace: Workspace) => void;
}

@observer
class WorkspaceItem extends Component<IProps> {
  render(): ReactElement {
    const { classes, workspace, onItemClick } = this.props;

    return (
      <tr className={classes.row}>
        <td
          className={classes.columnName}
          onClick={() => onItemClick(workspace)}
          onKeyDown={noop}
        >
          <WorkspaceIcon name={workspace.name} iconUrl={workspace.iconUrl} />
        </td>
        <td onClick={() => onItemClick(workspace)} onKeyDown={noop}>
          {workspace.name}
        </td>
      </tr>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(WorkspaceItem);
