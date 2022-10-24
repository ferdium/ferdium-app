import MdiIcon from '@mdi/react';
import classnames from 'classnames';
import { Component, ReactElement } from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';

import { Theme } from '../../../themes';

interface IProps extends WithStylesProps<typeof styles> {
  icon: string;
  size?: number;
  className?: string;
}

const styles = (theme: Theme) => ({
  icon: {
    fill: theme.colorText,
  },
});

class IconComponent extends Component<IProps> {
  render(): ReactElement {
    const { classes, icon, size = 1, className } = this.props;

    if (!icon) {
      console.warn('No Icon specified');
    }

    return (
      <MdiIcon
        path={icon}
        size={size}
        className={classnames({
          [classes.icon]: true,
          [`${className}`]: className,
        })}
      />
    );
  }
}

export default injectStyle(styles, { injectTheme: true })(IconComponent);
