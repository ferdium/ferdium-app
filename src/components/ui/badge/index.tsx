import classnames from 'classnames';
import { Component, type ReactNode } from 'react';
import injectStyle, { type WithStylesProps } from 'react-jss';

import type { Theme } from '../../../themes';

const badgeStyles = (theme: Theme) => {
  const styles = {};
  Object.keys(theme.styleTypes).map(style =>
    Object.assign(styles, {
      [style]: {
        background: theme.styleTypes[style].accent,
        color: theme.styleTypes[style].contrast,
        border: theme.styleTypes[style].border,
      },
    }),
  );

  return styles;
};

const styles = (theme: Theme) => ({
  badge: {
    display: 'inline-block',
    padding: [3, 8, 4],
    fontSize: theme.badgeFontSize,
    borderRadius: theme.badgeBorderRadius,
    margin: [0, 4],

    '&:first-child': {
      marginLeft: 0,
    },

    '&:last-child': {
      marginRight: 0,
    },
  },
  ...badgeStyles(theme),
});

interface IProps extends WithStylesProps<typeof styles> {
  type: string;
  className?: string;
  children: ReactNode;
}

class BadgeComponent extends Component<IProps> {
  public static defaultProps = {
    type: 'primary',
  };

  render() {
    const { classes, children, type, className } = this.props;

    return (
      <div
        className={classnames({
          [classes.badge]: true,
          [classes[type]]: true,
          [`${className}`]: className,
        })}
        data-type="franz-badge"
      >
        {children}
      </div>
    );
  }
}

export default injectStyle(styles, { injectTheme: true })(BadgeComponent);
