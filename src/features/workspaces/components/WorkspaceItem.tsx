import { Component } from 'react';
import { observer } from 'mobx-react';
import injectSheet from 'react-jss';
import Workspace from '../models/Workspace';

const styles = theme => ({
  row: {
    height: theme.workspaces.settings.listItems.height,
    borderBottom: `1px solid ${theme.workspaces.settings.listItems.borderColor}`,
    '&:hover': {
      background: theme.workspaces.settings.listItems.hoverBgColor,
    },
  },
  columnName: {},
});

type Props = {
  classes: any;
  workspace: typeof Workspace;
  onItemClick: (workspace) => void;
};

class WorkspaceItem extends Component<Props> {
  render() {
    const { classes, workspace, onItemClick } = this.props;

    return (
      <tr className={classes.row}>
        <td onClick={() => onItemClick(workspace)}>{workspace.name}</td>
      </tr>
    );
  }
}

export default injectSheet(styles, { injectTheme: true })(
  observer(WorkspaceItem),
);
