import { mdiEye, mdiEyeOff } from '@mdi/js';
import classnames from 'classnames';
import {
  Component,
  createRef,
  InputHTMLAttributes,
  ReactElement,
  RefObject,
  KeyboardEvent,
} from 'react';
import withStyles, { WithStylesProps } from 'react-jss';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import Icon from '../icon';
import { IFormField } from '../typings/generic';
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Error from '../error';
import Label from '../label';
import Wrapper from '../wrapper';
import { scorePasswordFunc } from './scorePassword';
import styles from './styles';

const messages = defineMessages({
  passwordToggle: {
    id: 'settings.app.form.passwordToggle',
    defaultMessage: 'Password toggle',
  },
});
interface IData {
  [index: string]: string;
}

interface IProps
  extends InputHTMLAttributes<HTMLInputElement>,
    IFormField,
    WithStylesProps<typeof styles>,
    WrappedComponentProps {
  focus?: boolean;
  prefix?: string;
  suffix?: string;
  scorePassword?: boolean;
  showPasswordToggle?: boolean;
  data?: IData;
  inputClassName?: string;
  onEnterKey?: () => void;
}

interface IState {
  showPassword: boolean;
  passwordScore: number;
}

@observer
class Input extends Component<IProps, IState> {
  private inputElement: RefObject<HTMLInputElement> =
    createRef<HTMLInputElement>();

  constructor(props: IProps) {
    super(props);

    this.state = {
      passwordScore: 0,
      showPassword: false,
    };
  }

  componentDidMount(): void {
    const { focus = false, data = {} } = this.props;

    if (this.inputElement?.current) {
      if (focus) {
        this.inputElement.current.focus();
      }

      for (const key of Object.keys(data)) {
        this.inputElement.current.dataset[key] = data[key];
      }
    }
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { scorePassword, onChange = noop } = this.props;

    onChange(e);

    if (scorePassword) {
      this.setState({
        passwordScore: scorePasswordFunc(e.target.value),
      });
    }
  }

  onInputKeyPress(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      const { onEnterKey = noop } = this.props;
      onEnterKey();
    }
  }

  render(): ReactElement {
    const {
      classes,
      className,
      error,
      id,
      inputClassName,
      label,
      prefix,
      suffix,
      value,
      name,
      placeholder,
      spellCheck,
      min,
      max,
      step,
      required,
      noMargin,
      onBlur = noop,
      onFocus = noop,
      scorePassword = false,
      showLabel = true,
      showPasswordToggle = false,
      type = 'text',
      disabled = false,
      readOnly,
      intl,
    } = this.props;
    const { showPassword, passwordScore } = this.state;
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <Wrapper
        className={className}
        identifier="franz-input"
        noMargin={noMargin}
      >
        {label && showLabel && (
          <Label
            title={label}
            showLabel={showLabel}
            htmlFor={id}
            className={classes.label}
            isRequired={required}
          />
        )}
        <div
          className={classnames({
            [`${inputClassName}`]: inputClassName,
            // [`${classes.hasPasswordScore}`]: scorePassword,
            [`${classes.wrapper}`]: true,
            [`${classes.disabled}`]: disabled,
            [`${classes.hasError}`]: error,
          })}
        >
          {prefix && <span className={classes.prefix}>{prefix}</span>}
          <input
            id={id}
            type={inputType}
            name={name}
            value={value as string}
            placeholder={placeholder}
            spellCheck={spellCheck}
            className={classes.input}
            ref={this.inputElement}
            onChange={this.onChange.bind(this)}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            onKeyPress={this.onInputKeyPress.bind(this)}
            min={min}
            max={max}
            step={step}
            readOnly={readOnly}
          />

          {suffix && <span className={classes.suffix}>{suffix}</span>}

          {showPasswordToggle && (
            <button
              type="button"
              className={classnames({
                'franz-form__input-modifier': true,
              })}
              onClick={() =>
                this.setState(prevState => ({
                  showPassword: !prevState.showPassword,
                }))
              }
              tabIndex={-1}
              aria-label={intl.formatMessage(messages.passwordToggle)}
            >
              <Icon icon={this.state.showPassword ? mdiEye : mdiEyeOff} />
            </button>
          )}
        </div>
        {scorePassword && (
          <div
            className={classnames({
              [`${classes.passwordScore}`]: true,
              [`${classes.hasError}`]: error,
            })}
          >
            <meter
              value={passwordScore < 5 ? 5 : passwordScore}
              low={30}
              high={75}
              optimum={100}
              max={100}
            />
          </div>
        )}
        {error && <Error message={error} />}
      </Wrapper>
    );
  }
}

export default injectIntl(withStyles(styles, { injectTheme: true })(Input));
