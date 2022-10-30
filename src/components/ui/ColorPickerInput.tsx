import { ChangeEvent, Component, createRef, RefObject } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { SliderPicker } from 'react-color';
import { Field } from '../../@types/mobx-form.types';

interface IProps {
  field: Field;
  className?: string;
  focus?: boolean;
}

class ColorPickerInput extends Component<IProps> {
  private inputElement: RefObject<HTMLInputElement> =
    createRef<HTMLInputElement>();

  componentDidMount() {
    const { focus = false } = this.props;
    if (focus) {
      this.focus();
    }
  }

  onChange(e: ChangeEvent<HTMLInputElement>) {
    const { field } = this.props;
    if (field.onChange) {
      field.onChange(e);
    }
  }

  focus() {
    if (this.inputElement && this.inputElement.current) {
      this.inputElement.current.focus();
    }
  }

  handleChangeComplete = (color: { hex: string }) => {
    const { field } = this.props;
    field.value = color.hex;
  };

  render() {
    const { field, className = null } = this.props;

    let { type } = field;
    type = 'text';

    return (
      <div
        className={classnames({
          'franz-form__field': true,
          'has-error': field.error,
          [`${className}`]: className,
        })}
      >
        <SliderPicker
          color={field.value}
          onChangeComplete={this.handleChangeComplete}
          id={field.id}
          type={type}
          className="franz-form__input"
          name={field.name}
          value={field.value}
          placeholder={field.placeholder}
          onBlur={field.onBlur}
          onFocus={field.onFocus}
          ref={this.inputElement}
          disabled={field.disabled}
        />
        <div className="franz-form__input-wrapper franz-form__input-wrapper__color-picker">
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
        </div>
      </div>
    );
  }
}

export default observer(ColorPickerInput);
