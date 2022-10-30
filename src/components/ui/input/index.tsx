import { mdiEye, mdiEyeOff } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import {
  Component,
  createRef,
  InputHTMLAttributes,
  ReactElement,
  RefObject,
} from 'react';
import injectSheet, { WithStylesProps } from 'react-jss';
import { noop } from 'lodash';
import { IFormField } from '../typings/generic';
import Error from '../error';
import Label from '../label';
import Wrapper from '../wrapper';
import { scorePasswordFunc } from './scorePassword';
import styles from './styles';

interface IData {
  [index: string]: string;
}

interface IProps
  extends InputHTMLAttributes<HTMLInputElement>,
    IFormField,
    WithStylesProps<typeof styles> {
  focus?: boolean;
  prefix?: string;
  suffix?: string;
  scorePassword?: boolean;
  showPasswordToggle?: boolean;
  data?: IData;
  inputClassName?: string;
  onEnterKey?: () => {};
}

interface IState {
  showPassword: boolean;
  passwordScore: number;
}

class InputComponent extends Component<IProps, IState> {
  private inputRef: RefObject<HTMLInputElement> = createRef<HTMLInputElement>();

  constructor(props: IProps) {
    super(props);

    this.state = {
      passwordScore: 0,
      showPassword: false,
    };
  }

  componentDidMount(): void {
    const { focus, data = {} } = this.props;

    if (this.inputRef && this.inputRef.current) {
      if (focus) {
        this.inputRef.current.focus();
      }

      for (const key of Object.keys(data))
        this.inputRef.current!.dataset[key] = data[key];
    }
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { scorePassword, onChange } = this.props;

    if (onChange) {
      onChange(e);
    }

    if (this.inputRef && this.inputRef.current && scorePassword) {
      this.setState({
        passwordScore: scorePasswordFunc(this.inputRef.current.value),
      });
    }
  }

  onInputKeyPress(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      const { onEnterKey } = this.props;
      onEnterKey && onEnterKey();
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
    } = this.props;

    const { showPassword, passwordScore } = this.state;

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <Wrapper
        className={className}
        identifier="franz-input"
        noMargin={noMargin}
      >
        <Label
          title={label}
          showLabel={showLabel}
          htmlFor={id}
          className={classes.label}
          isRequired={required}
        >
          <div
            className={classnames({
              [`${inputClassName}`]: inputClassName,
              [`${classes.hasPasswordScore}`]: scorePassword,
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
              ref={this.inputRef}
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
                className={classes.formModifier}
                onClick={() =>
                  this.setState(prevState => ({
                    showPassword: !prevState.showPassword,
                  }))
                }
                tabIndex={-1}
              >
                <Icon path={!showPassword ? mdiEye : mdiEyeOff} />
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
        </Label>
        {error && <Error message={error} />}
      </Wrapper>
    );
  }
}

export default injectSheet(styles, { injectTheme: true })(InputComponent);
