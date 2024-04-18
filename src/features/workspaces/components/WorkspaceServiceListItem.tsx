import classnames from 'classnames';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import withStyles, { type WithStylesProps } from 'react-jss';
import ServiceIcon from '../../../components/ui/ServiceIcon';
import Toggle from '../../../components/ui/toggle';
import type Service from '../../../models/Service';

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

interface IProps extends WithStylesProps<typeof styles> {
  isInWorkspace: boolean;
  onToggle: () => void;
  service: Service;
}

@observer
class WorkspaceServiceListItem extends Component<IProps> {
  render(): ReactElement {
    const { classes, isInWorkspace, onToggle, service } = this.props;
    return (
      // onclick in below div used to fix bug raised under toggle duplicate component removal
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div className={classes.listItem} onClick={onToggle} onKeyDown={noop}>
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

export default withStyles(styles, { injectTheme: true })(
  WorkspaceServiceListItem,
);
