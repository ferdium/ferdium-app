import { ChangeEvent, Component, createRef, RefObject } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { scorePassword as scorePasswordFunc } from '../../helpers/password-helpers';
import Icon from './icon';
import { Field } from '../../@types/mobx-form.types';

const messages = defineMessages({
  passwordToggle: {
    id: 'settings.app.form.passwordToggle',
    defaultMessage: 'Password toggle',
  },
});

interface IProps extends WrappedComponentProps {
  field: Field;
  className?: string;
  focus?: boolean;
  showPasswordToggle?: boolean;
  showLabel?: boolean;
  scorePassword?: boolean;
  prefix?: string;
  suffix?: string;
}

interface IState {
  showPassword: boolean;
  passwordScore: number;
}

// Can this file be merged into the './input/index.tsx' file?
@observer
class Input extends Component<IProps, IState> {
  private inputElement: RefObject<HTMLInputElement> =
    createRef<HTMLInputElement>();

  constructor(props: IProps) {
    super(props);

    this.state = {
      showPassword: false,
      passwordScore: 0,
    };
  }

  componentDidMount(): void {
    const { focus = false } = this.props;
    if (focus) {
      this.focus();
    }
  }

  onChange(e: ChangeEvent<HTMLInputElement>): void {
    const { field, scorePassword } = this.props;

    if (field.onChange) {
      field.onChange(e);
    }

    if (scorePassword) {
      this.setState({ passwordScore: scorePasswordFunc(field.value) });
    }
  }

  focus() {
    if (this.inputElement && this.inputElement.current) {
      this.inputElement.current!.focus();
    }
  }

  render() {
    const {
      field,
      className = null,
      showPasswordToggle = false,
      showLabel = true,
      scorePassword = false,
      prefix = '',
      suffix = '',
      intl,
    } = this.props;

    const { passwordScore } = this.state;

    let { type } = field;
    if (type === 'password' && this.state.showPassword) {
      type = 'text';
    }

    return (
      <div
        className={classnames({
          'franz-form__field': true,
          'has-error': field.error,
          [`${className}`]: className,
        })}
      >
        <div className="franz-form__input-wrapper">
          {prefix && <span className="franz-form__input-prefix">{prefix}</span>}
          <input
            id={field.id}
            type={type}
            className="franz-form__input"
            name={field.name}
            value={field.value}
            placeholder={field.placeholder}
            onChange={e => this.onChange(e)}
            onBlur={field.onBlur}
            onFocus={field.onFocus}
            ref={this.inputElement}
            disabled={field.disabled}
          />
          {suffix && <span className="franz-form__input-suffix">{suffix}</span>}
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
          {scorePassword && (
            <div className="franz-form__password-score">
              {/* <progress value={this.state.passwordScore} max="100" /> */}
              <meter
                value={passwordScore < 5 ? 5 : passwordScore}
                low={30}
                high={75}
                optimum={100}
                max={100}
              />
            </div>
          )}
        </div>
        {field.label && showLabel && (
          <label className="franz-form__label" htmlFor={field.name}>
            {field.label}
          </label>
        )}
        {field.error && <div className="franz-form__error">{field.error}</div>}
      </div>
    );
  }
}

export default injectIntl(Input);
