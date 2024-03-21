import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Component, type ReactNode } from 'react';
import withStyles, { type WithStylesProps } from 'react-jss';
import type ServiceModel from '../../models/Service';

const styles = theme => ({
  root: {
    height: 'auto',
  },
  icon: {
    width: theme.serviceIcon.width,
  },
  isCustomIcon: {
    width: theme.serviceIcon.isCustom.width,
    border: theme.serviceIcon.isCustom.border,
    borderRadius: theme.serviceIcon.isCustom.borderRadius,
  },
  isDisabled: {
    filter: 'grayscale(100%)',
    opacity: '.5',
  },
});

interface IProps extends WithStylesProps<typeof styles> {
  service: ServiceModel;
  className?: string;
}

// TODO: [TS DEBT] Should this file be converted into the coding style similar to './toggle/index.tsx'?
@observer
class ServiceIcon extends Component<IProps> {
  render(): ReactNode {
    const { classes, className = '', service } = this.props;

    return (
      <div className={classnames([classes.root, className])}>
        <img
          src={service.icon}
          className={classnames([
            classes.icon,
            service.isEnabled ? null : classes.isDisabled,
            service.hasCustomIcon ? classes.isCustomIcon : null,
          ])}
          alt=""
        />
      </div>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(ServiceIcon);
