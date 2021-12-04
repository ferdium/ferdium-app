import { Component } from 'react';
import { observer } from 'mobx-react';
import injectSheet from 'react-jss';
import classnames from 'classnames';

import { Toggle } from '../../../components/ui/toggle/index';
import ServiceIcon from '../../../components/ui/ServiceIcon';

const styles = theme => ({
  listItem: {
    height: theme.workspaces.settings.listItems.height,
    borderBottom: `1px solid ${theme.workspaces.settings.listItems.borderColor}`,
    display: 'flex',
    alignItems: 'center',
  },
  serviceIcon: {
    padding: theme.workspaces.settings.listItems.padding,
  },
  toggle: {
    height: 'auto',
    margin: 0,
  },
  label: {
    padding: theme.workspaces.settings.listItems.padding,
    flexGrow: 1,
  },
  disabledLabel: {
    color: theme.workspaces.settings.listItems.disabled.color,
  },
});

type Props = {
  classes: any;
  isInWorkspace: boolean;
  onToggle: () => void;
  service: any;
};

class WorkspaceServiceListItem extends Component<Props> {
  render() {
    const { classes, isInWorkspace, onToggle, service } = this.props;

    return (
      <div className={classes.listItem}>
        <ServiceIcon className={classes.serviceIcon} service={service} />
        <span
          className={classnames([
            classes.label,
            service.isEnabled ? null : classes.disabledLabel,
          ])}
        >
          {service.name}
        </span>
        <Toggle
          className={classes.toggle}
          checked={isInWorkspace}
          onChange={onToggle}
        />
      </div>
    );
  }
}

export default injectSheet(styles, { injectTheme: true })(
  observer(WorkspaceServiceListItem),
);
