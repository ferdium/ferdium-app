import { mdiStar } from '@mdi/js';
import classnames from 'classnames';
import { Component } from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';

import { Theme } from '../../../themes';
import { Icon } from '../icon';
import { Badge } from './index';

interface IProps extends WithStylesProps<typeof styles> {
  badgeClasses?: string;
  iconClasses?: string;
  inverted?: boolean;
  className?: string;
}

const styles = (theme: Theme) => ({
  badge: {
    height: 'auto',
    padding: [4, 6, 2, 7],
    borderRadius: theme.borderRadiusSmall,
  },
  invertedBadge: {
    background: theme.styleTypes.primary.contrast,
    color: theme.styleTypes.primary.accent,
  },
  icon: {
    fill: theme.styleTypes.primary.contrast,
  },
  invertedIcon: {
    fill: theme.styleTypes.primary.accent,
  },
});

class ProBadgeComponent extends Component<IProps> {
  render() {
    const { classes, badgeClasses, iconClasses, inverted, className } =
      this.props;

    return (
      <Badge
        type="primary"
        className={classnames([
          classes.badge,
          inverted && classes.invertedBadge,
          badgeClasses,
          className,
        ])}
      >
        <Icon
          icon={mdiStar}
          className={classnames([
            classes.icon,
            inverted && classes.invertedIcon,
            iconClasses,
          ])}
        />
      </Badge>
    );
  }
}

export const ProBadge = injectStyle(styles, { injectTheme: true })(
  ProBadgeComponent,
);
