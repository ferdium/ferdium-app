/* eslint-disable no-use-before-define */
import { mdiClose } from '@mdi/js';
import classnames from 'classnames';
import { noop } from 'lodash';
import { Component, type ReactElement, type ReactNode } from 'react';
import withStyles, { type WithStylesProps } from 'react-jss';
import type { Theme } from '../../../themes';
import Icon from '../icon';

const buttonStyles = (theme: Theme) => {
  const styles = {};
  for (const style of Object.keys(theme.styleTypes)) {
    Object.assign(styles, {
      [style]: {
        background: theme.styleTypes[style].accent,
        color: theme.styleTypes[style].contrast,
        border: theme.styleTypes[style].border,

        '& svg': {
          fill: theme.styleTypes[style].contrast,
        },
      },
    });
  }

  return styles;
};

const infoBoxTransition: string = 'none';
const ctaTransition: string = 'none';

// TODO: Not sure why, but this location alone, the `window` is not defined - and it throws an error thus aborting the startup sequence of ferdium
// if (window && window.matchMedia('(prefers-reduced-motion: no-preference)')) {
//   infoBoxTransition = 'all 0.5s';
//   ctaTransition = 'opacity 0.3s';
// }

const styles = (theme: Theme) => ({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    height: 'auto',
  },
  infobox: {
    alignItems: 'center',
    borderRadius: theme.borderRadiusSmall,
    display: 'flex',
    height: 'auto',
    padding: '15px 20px',
    top: 0,
    transition: infoBoxTransition,
    opacity: 1,
    marginBottom: 30,
  },
  dismissing: {
    // position: 'absolute',
    marginTop: -100,
    opacity: 0,
  },
  content: {
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  close: {
    color: (props: IProps) =>
      theme.styleTypes[props.type || 'primary'].contrast,
    marginRight: -5,
    border: 0,
    background: 'none',
  },
  cta: {
    borderColor: (props: IProps) =>
      theme.styleTypes[props.type || 'primary'].contrast,
    borderRadius: theme.borderRadiusSmall,
    borderStyle: 'solid',
    borderWidth: 1,
    background: 'none',
    color: (props: IProps) =>
      theme.styleTypes[props.type || 'primary'].contrast,
    marginLeft: 15,
    padding: [4, 10],
    fontSize: theme.uiFontSize,
    transition: ctaTransition,

    '&:hover': {
      opacity: 0.6,
    },
  },
  ...buttonStyles(theme),
});

interface IProps extends WithStylesProps<typeof styles> {
  children: ReactNode;
  icon?: string;
  type?: string;
  dismissible?: boolean;
  ctaLabel?: string;
  className?: string;
  onDismiss?: () => void;
  onUnmount?: () => void;
  ctaOnClick?: () => void;
}

interface IState {
  isDismissing: boolean;
  dismissed: boolean;
}

class InfoboxComponent extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isDismissing: false,
      dismissed: false,
    };
  }

  dismiss(): void {
    const { onDismiss = noop } = this.props;

    this.setState({
      isDismissing: true,
    });

    if (onDismiss) {
      onDismiss();
    }

    setTimeout(() => {
      this.setState({
        dismissed: true,
      });
    }, 3000);
  }

  componentWillUnmount(): void {
    const { onUnmount } = this.props;
    if (onUnmount) onUnmount();
  }

  render(): ReactElement | null {
    const {
      classes,
      children,
      icon,
      type = 'primary',
      dismissible = false,
      ctaOnClick = noop,
      ctaLabel = '',
      className = '',
    } = this.props;

    const { isDismissing, dismissed } = this.state;

    if (dismissed) {
      return null;
    }

    return (
      <div
        className={classnames({
          [classes.wrapper]: true,
          [`${className}`]: className,
        })}
      >
        <div
          className={classnames({
            [classes.infobox]: true,
            [classes[`${type}`]]: type,
            [classes.dismissing]: isDismissing,
          })}
          data-type="franz-infobox"
        >
          {icon && <Icon icon={icon} className={classes.icon} />}
          <div className={classes.content}>{children}</div>
          {ctaLabel && (
            <button className={classes.cta} onClick={ctaOnClick} type="button">
              {ctaLabel}
            </button>
          )}
          {dismissible && (
            <button
              type="button"
              onClick={this.dismiss.bind(this)}
              className={classes.close}
            >
              <Icon icon={mdiClose} />
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(InfoboxComponent);
