import {
  Component,
  createRef,
  InputHTMLAttributes,
  ReactElement,
  RefObject,
} from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { SliderPicker } from 'react-color';
import { noop } from 'lodash';
import { FormFields } from '../../../@types/mobx-form.types';

interface IProps extends InputHTMLAttributes<HTMLInputElement>, FormFields {
  className?: string;
  focus?: boolean;
  onColorChange?: () => void;
  error: string;
}

@observer
class ColorPickerInput extends Component<IProps> {
  private inputElement: RefObject<HTMLInputElement> =
    createRef<HTMLInputElement>();

  componentDidMount(): void {
    const { focus = false } = this.props;
    if (focus && this.inputElement && this.inputElement.current) {
      this.inputElement.current.focus();
    }
  }

  onChange({ hex }: { hex: string }): void {
    const { onColorChange = noop, onChange = noop } = this.props;
    onColorChange();
    onChange(hex);
  }

  render(): ReactElement {
    const {
      id,
      name,
      value = '',
      placeholder = '',
      disabled = false,
      className = null,
      type = 'text',
      error = '',
      onChange = noop,
    } = this.props;

    return (
      <div
        className={classnames({
          'franz-form__field': true,
          'has-error': error,
          [`${className}`]: className,
        })}
        ref={this.inputElement}
      >
        <SliderPicker
          color={value}
          onChange={this.onChange.bind(this)}
          id={`${id}-SliderPicker`}
          type={type}
          className="franz-form__input"
          name={name}
          placeholder={placeholder}
          disabled={disabled}
        />
        <div className="franz-form__input-wrapper franz-form__input-wrapper__color-picker">
          <input
            id={`${id}-Input`}
            type={type}
            className="franz-form__input"
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
}

export default ColorPickerInput;
