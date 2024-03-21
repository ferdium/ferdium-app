import classnames from 'classnames';
import { observer } from 'mobx-react';
import {
  type ChangeEvent,
  Component,
  type ReactElement,
  type ReactNode,
  type RefObject,
  createRef,
} from 'react';
import type { Field } from '../../@types/mobx-form.types';

interface IProps {
  field: Field;
  className?: string;
  showLabel?: boolean;
  disabled?: boolean;
  multiple?: boolean;
}

// TODO: Can this file be merged into the './select/index.tsx' file?
@observer
class Select extends Component<IProps> {
  private element: RefObject<HTMLSelectElement> =
    createRef<HTMLSelectElement>();

  multipleChange(e: ChangeEvent<HTMLSelectElement>): void {
    e.preventDefault();
    if (!this.element.current) {
      return;
    }
    const result: string[] = [];
    const { options } = this.element.current;
    for (const option of options) {
      if (option.selected && (option.value || option.text)) {
        result.push(option.value || option.text);
      }
    }

    const { field } = this.props;
    field.value = result;
  }

  render(): ReactElement {
    const {
      field,
      className = null,
      showLabel = true,
      disabled = false,
      multiple = false,
    } = this.props;

    let selected = field.value;

    if (multiple) {
      if (typeof field.value === 'string' && field.value.startsWith('[')) {
        // Value is JSON encoded
        selected = JSON.parse(field.value);
      } else if (typeof field.value === 'object') {
        selected = field.value;
      } else {
        selected = [field.value];
      }
    }

    return (
      <div
        className={classnames({
          'franz-form__field': true,
          'has-error': field.error,
          'is-disabled': disabled,
          [`${className}`]: className,
        })}
      >
        {field.label && showLabel && (
          <label className="franz-form__label" htmlFor={field.name}>
            {field.label}
          </label>
        )}
        <select
          onChange={
            multiple
              ? (e: ChangeEvent<HTMLSelectElement>) => this.multipleChange(e)
              : field.onChange
          }
          id={field.id}
          defaultValue={selected}
          className="franz-form__select"
          disabled={field.disabled || disabled}
          multiple={multiple}
          ref={this.element}
        >
          {field.options!.map(type => (
            <option
              key={type.value}
              value={type.value}
              disabled={type.disabled}
            >
              {type.label}
            </option>
          ))}
        </select>
        {field.error && (
          <div className="franz-form__error">{field.error as ReactNode}</div>
        )}
      </div>
    );
  }
}

export default Select;
