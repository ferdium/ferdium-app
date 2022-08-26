import { ChangeEvent, Component } from 'react';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import classnames from 'classnames';
import { SliderPicker } from 'react-color';

interface IProps {
  field: Field;
  className?: string;
  focus?: boolean;
}

class ColorPickerInput extends Component<IProps> {
  static defaultProps = {
    className: null,
    focus: false,
  };

  inputElement: HTMLInputElement | null | undefined;

  componentDidMount() {
    if (this.props.focus) {
      this.focus();
    }
  }

  onChange(e: ChangeEvent<HTMLInputElement>) {
    const { field } = this.props;

    field.onChange(e);
  }

  focus() {
    this.inputElement?.focus();
  }

  handleChangeComplete = (color: { hex: string }) => {
    const { field } = this.props;
    field.value = color.hex;
  };

  render() {
    const { field, className } = this.props;

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
          ref={(element: HTMLInputElement | null | undefined) => {
            this.inputElement = element;
          }}
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
            ref={element => {
              this.inputElement = element;
            }}
            disabled={field.disabled}
          />
        </div>
      </div>
    );
  }
}

export default observer(ColorPickerInput);
