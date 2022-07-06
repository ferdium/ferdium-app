import classnames from 'classnames';
import { Property } from 'csstype';
import { Component, InputHTMLAttributes } from 'react';
import injectStyle, { WithStylesProps } from 'react-jss';

import { Theme } from '../../../themes';
import { IFormField } from '../typings/generic';

import Error from '../error';
import Label from '../label';
import Wrapper from '../wrapper';

interface IProps
  extends InputHTMLAttributes<HTMLInputElement>,
    IFormField,
    WithStylesProps<typeof styles> {
  className?: string;
}

let buttonTransition: string = 'none';

if (window && window.matchMedia('(prefers-reduced-motion: no-preference)')) {
  buttonTransition = 'all .5s';
}

const styles = (theme: Theme) => ({
  toggle: {
    background: theme.toggleBackground,
    borderRadius: theme.borderRadius,
    height: theme.toggleHeight,
    position: 'relative' as Property.Position,
    width: theme.toggleWidth,
  },
  button: {
    background: theme.toggleButton,
    borderRadius: '100%',
    boxShadow: '0 1px 4px rgba(0, 0, 0, .3)',
    width: theme.toggleHeight - 2,
    height: theme.toggleHeight - 2,
    left: 1,
    top: 1,
    position: 'absolute' as Property.Position,
    transition: buttonTransition,
  },
  buttonActive: {
    background: theme.toggleButtonActive,
    left: theme.toggleWidth - theme.toggleHeight + 1,
  },
  input: {
    visibility: 'hidden' as any,
  },
  disabled: {
    opacity: theme.inputDisabledOpacity,
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',

    '& > span': {
      order: 1,
      marginLeft: 15,
    },
  },
});

class ToggleComponent extends Component<IProps> {
  public static defaultProps = {
    onChange: () => {},
    showLabel: true,
    disabled: false,
    error: '',
  };

  render() {
    const {
      classes,
      className,
      disabled,
      error,
      id,
      label,
      showLabel,
      checked,
      value,
      onChange,
    } = this.props;

    return (
      <Wrapper className={className} identifier="franz-toggle">
        <Label
          title={label}
          showLabel={showLabel}
          htmlFor={id}
          className={classes.toggleLabel}
        >
          <div
            className={classnames({
              [`${classes.toggle}`]: true,
              [`${classes.disabled}`]: disabled,
            })}
          >
            <div
              className={classnames({
                [`${classes.button}`]: true,
                [`${classes.buttonActive}`]: checked,
              })}
            />
            <input
              className={classes.input}
              id={id}
              type="checkbox"
              checked={checked}
              value={value}
              onChange={onChange}
              disabled={disabled}
            />
          </div>
        </Label>
        {error && <Error message={error} />}
      </Wrapper>
    );
  }
}

export default injectStyle(styles, { injectTheme: true })(ToggleComponent);
