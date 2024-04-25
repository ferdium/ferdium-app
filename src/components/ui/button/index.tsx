/* eslint-disable no-use-before-define */
import Icon from '@mdi/react';
import classnames from 'classnames';
import type { Property } from 'csstype';
import { noop } from 'lodash';
import { Component, type MouseEventHandler } from 'react';
import withStyles, { type WithStylesProps } from 'react-jss';
import { DEFAULT_LOADER_COLOR } from '../../../config';
import type { Theme } from '../../../themes';
import Loader from '../loader/index';
import type { IFormField } from '../typings/generic';

type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'inverted';

let buttonTransition: string = 'none';
let loaderContainerTransition: string = 'none';

if (
  typeof window !== 'undefined' &&
  window &&
  window.matchMedia('(prefers-reduced-motion: no-preference)')
) {
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
  loaderContainer: {
    height: 20,
    transition: loaderContainerTransition,
    marginLeft: (props: IProps): number => (props.busy ? 20 : 10),
    marginRight: (props: IProps): number => (props.busy ? -20 : -10),
    position: (): Property.Position => 'inherit',
  },
  icon: {
    margin: [1, 10, 0, -5],
  },
});

interface IProps extends IFormField, WithStylesProps<typeof styles> {
  className?: string;
  label?: string;
  disabled?: boolean;
  id?: string;
  type?: 'button' | 'reset' | 'submit';
  onClick?: MouseEventHandler<HTMLInputElement>;
  buttonType?: ButtonType;
  loaded?: boolean;
  busy?: boolean;
  icon?: string;
  href?: string;
  target?: string;
  htmlForm?: string;
}

interface IState {
  busy: boolean;
}

class ButtonComponent extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      busy: this.props.busy || false,
    };
  }

  static getDerivedStateFromProps(nextProps: IProps): IState {
    return {
      busy: nextProps.busy || false,
    };
  }

  render() {
    const {
      classes,
      className,
      // theme,
      id,
      label,
      loaded,
      icon,
      href,
      target,
      htmlForm,
      type = 'button',
      disabled = false,
      onClick = noop,
      buttonType = 'primary' as ButtonType,
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
        {showLoader && (
          <div className={classes.loaderContainer}>
            <Loader size={18} color={DEFAULT_LOADER_COLOR} />
          </div>
        )}
        <div className={classes.label}>
          {icon && <Icon path={icon} size={0.8} className={classes.icon} />}
          {label}
        </div>
      </>
    );

    const wrapperComponent = href ? (
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
    ) : (
      <button
        id={id}
        // eslint-disable-next-line react/button-has-type, @eslint-react/dom/no-missing-button-type
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
        {...(htmlForm && { form: htmlForm })}
      >
        {content}
      </button>
    );

    return wrapperComponent;
  }
}

export default withStyles(styles, { injectTheme: true })(ButtonComponent);
