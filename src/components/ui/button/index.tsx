import Icon from '@mdi/react';
import classnames from 'classnames';
import { Property } from 'csstype';
import { Component, MouseEvent } from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';
import Loader from 'react-loader';

import { Theme } from '../../../themes';
import { IFormField } from '../typings/generic';

type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'inverted';

interface IProps extends IFormField, WithStylesProps<typeof styles> {
  className?: string;
  disabled?: boolean;
  id?: string;
  type?: 'button' | 'reset' | 'submit' | undefined;
  onClick: (
    event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>,
  ) => void;
  buttonType?: ButtonType;
  loaded?: boolean;
  busy?: boolean;
  icon?: string;
  href?: string;
  target?: string;
}

let buttonTransition: string = 'none';
let loaderContainerTransition: string = 'none';

if (window && window.matchMedia('(prefers-reduced-motion: no-preference)')) {
  buttonTransition = 'background .5s, opacity 0.3s';
  loaderContainerTransition = 'all 0.3s';
}

const styles = (theme: Theme) => ({
  button: {
    borderRadius: theme.borderRadiusSmall,
    border: 'none',
    display: 'inline-flex',
    position: 'relative' as Property.Position,
    transition: buttonTransition,
    textAlign: 'center' as Property.TextAlign,
    outline: 'none',
    alignItems: 'center',
    padding: 0,
    width: 'auto' as Property.Width<string>,
    fontSize: theme.uiFontSize,
    textDecoration: 'none',

    '&:hover': {
      opacity: 0.8,
    },
    '&:active': {
      opacity: 0.5,
      transition: 'none',
    },
  },
  label: {
    margin: '10px 20px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    background: theme.buttonPrimaryBackground,
    color: theme.buttonPrimaryTextColor,

    '& svg': {
      fill: theme.buttonPrimaryTextColor,
    },
  },
  secondary: {
    background: theme.buttonSecondaryBackground,
    color: theme.buttonSecondaryTextColor,

    '& svg': {
      fill: theme.buttonSecondaryTextColor,
    },
  },
  success: {
    background: theme.buttonSuccessBackground,
    color: theme.buttonSuccessTextColor,

    '& svg': {
      fill: theme.buttonSuccessTextColor,
    },
  },
  danger: {
    background: theme.buttonDangerBackground,
    color: theme.buttonDangerTextColor,

    '& svg': {
      fill: theme.buttonDangerTextColor,
    },
  },
  warning: {
    background: theme.buttonWarningBackground,
    color: theme.buttonWarningTextColor,

    '& svg': {
      fill: theme.buttonWarningTextColor,
    },
  },
  inverted: {
    background: theme.buttonInvertedBackground,
    color: theme.buttonInvertedTextColor,
    border: theme.buttonInvertedBorder,

    '& svg': {
      fill: theme.buttonInvertedTextColor,
    },
  },
  disabled: {
    opacity: theme.inputDisabledOpacity,
  },
  loader: {
    position: 'relative' as Property.Position,
    width: 20,
    height: 18,
    zIndex: 9999,
  },
  loaderContainer: {
    width: (props: IProps): string => (!props.busy ? '0' : '40px'),
    height: 20,
    overflow: 'hidden',
    transition: loaderContainerTransition,
    marginLeft: (props: IProps): number => (!props.busy ? 10 : 20),
    marginRight: (props: IProps): number => (!props.busy ? -10 : -20),
    position: (): Property.Position => 'inherit',
  },
  icon: {
    margin: [1, 10, 0, -5],
  },
});

class ButtonComponent extends Component<IProps> {
  public static defaultProps = {
    type: 'button',
    disabled: false,
    onClick: () => null,
    buttonType: 'primary' as ButtonType,
    stretch: false,
    busy: false,
  };

  state = {
    busy: false,
  };

  componentWillMount() {
    this.setState({ busy: this.props.busy });
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.busy !== this.props.busy) {
      if (this.props.busy) {
        setTimeout(() => {
          this.setState({ busy: nextProps.busy });
        }, 300);
      } else {
        this.setState({ busy: nextProps.busy });
      }
    }
  }

  render() {
    const {
      classes,
      className,
      // theme,
      disabled,
      id,
      label,
      type,
      onClick,
      buttonType,
      loaded,
      icon,
      href,
      target,
    } = this.props;

    const { busy } = this.state;

    let showLoader = false;
    if (loaded) {
      showLoader = !loaded;
      console.warn(
        'Ferdium Button prop `loaded` will be deprecated in the future. Please use `busy` instead',
      );
    }
    if (busy) {
      showLoader = busy;
    }

    const content = (
      <>
        <div className={classes.loaderContainer}>
          {showLoader && (
            <Loader
              loaded={false}
              width={4}
              scale={0.45}
              // color={theme.buttonLoaderColor[buttonType!]}
              parentClassName={classes.loader}
            />
          )}
        </div>
        <div className={classes.label}>
          {icon && <Icon path={icon} size={0.8} className={classes.icon} />}
          {label}
        </div>
      </>
    );

    const wrapperComponent = !href ? (
      <button
        id={id}
        type={type}
        onClick={onClick}
        className={classnames({
          [`${classes.button}`]: true,
          [`${classes[buttonType as ButtonType]}`]: true,
          [`${classes.disabled}`]: disabled,
          [`${className}`]: className,
        })}
        disabled={disabled}
        data-type="franz-button"
      >
        {content}
      </button>
    ) : (
      <a
        href={href}
        target={target}
        onClick={onClick}
        className={classnames({
          [`${classes.button}`]: true,
          [`${classes[buttonType as ButtonType]}`]: true,
          [`${className}`]: className,
        })}
        rel={target === '_blank' ? 'noopener' : ''}
        data-type="franz-button"
      >
        {content}
      </a>
    );

    return wrapperComponent;
  }
}

export const Button = injectStyle(styles, { injectTheme: true })(
  ButtonComponent,
);
