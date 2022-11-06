import classnames from 'classnames';
import { Property } from 'csstype';
import { noop } from 'lodash';
import { Component, InputHTMLAttributes } from 'react';
import withStyles, { WithStylesProps } from 'react-jss';
import { Theme } from '../../../themes';
import Error from '../error';
import Label from '../label';
import { IFormField } from '../typings/generic';
import Wrapper from '../wrapper';

interface IProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'>,
    IFormField,
    WithStylesProps<typeof styles> {
  className?: string;
  value: boolean | undefined; // due to type capability between InputHTMLAttributes and mobx-react-form
}

const buttonTransition: string =
  window && window.matchMedia('(prefers-reduced-motion: no-preference)')
    ? 'all .5s'
    : 'none';

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
  render() {
    const {
      classes,
      className,
      id = '',
      name = '',
      label = '',
      error = '',
      value = false,
      showLabel = true,
      disabled = false,
      onChange = noop,
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
                [`${classes.buttonActive}`]: value,
              })}
            />
            <input
              type="checkbox"
              id={id}
              name={name}
              checked={value as boolean | undefined}
              className={classes.input}
              onChange={onChange}
              disabled={disabled}
            />
          </div>
        </Label>
        {error ? <Error message={error as string} /> : null}
      </Wrapper>
    );
  }
}

export default withStyles(styles, { injectTheme: true })(ToggleComponent);
