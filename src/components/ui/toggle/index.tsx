import classnames from 'classnames';
import { Property } from 'csstype';
import { noop } from 'lodash';
import { Component, InputHTMLAttributes, ReactElement } from 'react';
import withStyles, { WithStylesProps } from 'react-jss';
import { Theme } from '../../../themes';
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Error from '../error';
import Label from '../label';
import { IFormField } from '../typings/generic';
import Wrapper from '../wrapper';

const buttonTransition: string = window?.matchMedia(
  '(prefers-reduced-motion: no-preference)',
)
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

interface IProps
  extends InputHTMLAttributes<HTMLInputElement>,
    IFormField,
    WithStylesProps<typeof styles> {
  className?: string;
}

class Toggle extends Component<IProps> {
  render(): ReactElement {
    const {
      classes,
      className,
      id = '',
      name = '',
      label = '',
      error = '',
      checked = false,
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
                [`${classes.buttonActive}`]: checked,
              })}
            />
            <input
              type="checkbox"
              id={id}
              name={name}
              checked={checked}
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

export default withStyles(styles, { injectTheme: true })(Toggle);
