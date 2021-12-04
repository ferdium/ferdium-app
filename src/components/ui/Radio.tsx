import { Component } from 'react';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import classnames from 'classnames';

type Props = {
  field: typeof Field;
  className: string;
  focus: boolean;
  showLabel: boolean;
};

class Radio extends Component<Props> {
  static defaultProps = {
    focus: false,
    showLabel: true,
  };

  inputElement = null;

  componentDidMount() {
    if (this.props.focus) {
      this.focus();
    }
  }

  focus() {
    // @ts-expect-error Object is possibly 'null'.
    this.inputElement.focus();
  }

  render() {
    const { field, className, showLabel } = this.props;

    return (
      <div
        className={classnames({
          'franz-form__field': true,
          'has-error': field.error,
          [`${className}`]: className,
        })}
      >
        {field.label && showLabel && (
          <label className="franz-form__label" htmlFor={field.name}>
            {field.label}
          </label>
        )}
        <div className="franz-form__radio-wrapper">
          {field.options.map(type => (
            <label
              key={type.value}
              htmlFor={`${field.id}-${type.value}`}
              className={classnames({
                'franz-form__radio': true,
                'is-selected': field.value === type.value,
              })}
            >
              <input
                id={`${field.id}-${type.value}`}
                type="radio"
                name="type"
                value={type.value}
                onChange={field.onChange}
                checked={field.value === type.value}
              />
              {type.label}
            </label>
          ))}
        </div>
        {field.error && <div className="franz-form__error">{field.error}</div>}
      </div>
    );
  }
}

export default observer(Radio);
