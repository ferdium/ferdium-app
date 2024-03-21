import classnames from 'classnames';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import {
  type ChangeEvent,
  Component,
  type InputHTMLAttributes,
  type RefObject,
  createRef,
} from 'react';
import { type Color, type ColorResult, SliderPicker } from 'react-color';
import type { FormFields } from '../../../@types/mobx-form.types';

interface IProps extends InputHTMLAttributes<HTMLInputElement>, FormFields {
  onColorChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

@observer
class ColorPickerInput extends Component<IProps> {
  private inputElement: RefObject<HTMLInputElement> =
    createRef<HTMLInputElement>();

  onChange(color: ColorResult, event: ChangeEvent<HTMLInputElement>): void {
    const { onColorChange, onChange = noop } = this.props;
    onColorChange(event);
    onChange(color.hex);
  }

  render() {
    const {
      id,
      name,
      value = '',
      placeholder = '',
      disabled = false,
      className = null,
      type = 'text',
      onChange = noop,
    } = this.props;

    return (
      <div
        className={classnames({
          'franz-form__field': true,
          [`${className}`]: className,
        })}
        ref={this.inputElement}
      >
        <SliderPicker
          color={value as Color}
          onChange={(color, event) => this.onChange(color, event)}
          className="franz-form__input"
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
