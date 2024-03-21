import classnames from 'classnames';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { type ChangeEvent, Component, type ReactElement } from 'react';

interface IProps {
  field: any;
  className?: string;
  showLabel?: boolean;
  disabled?: boolean;
  type?: 'range' | 'number';
  onSliderChange?: (e: ChangeEvent) => void;
}

// TODO: [TS DEBT] Should this file be converted into the coding style similar to './toggle/index.tsx'?
@observer
class Slider extends Component<IProps> {
  onChange(e: ChangeEvent<HTMLInputElement>): void {
    const { field, onSliderChange = noop } = this.props;
    field.onChange(e);
    onSliderChange(e);
  }

  render(): ReactElement {
    const {
      field,
      className = '',
      showLabel = true,
      disabled = false,
      type = 'range',
    } = this.props;

    if (field.value === '' && field.default !== '') {
      field.value = field.default;
    }

    return (
      <div
        className={classnames([
          'franz-form__field',
          'franz-form__slider-wrapper',
          className,
        ])}
      >
        <div className="slider-container">
          <input
            className="slider"
            type={type}
            id={field.id}
            name={field.name}
            value={field.value}
            min="1"
            max="100"
            onChange={e => (disabled ? null : this.onChange(e))}
          />
        </div>

        {field.error && <div className={field.error}>{field.error}</div>}
        {field.label && showLabel && (
          <label className="franz-form__label" htmlFor={field.id}>
            {field.label}
          </label>
        )}
      </div>
    );
  }
}

export default Slider;
