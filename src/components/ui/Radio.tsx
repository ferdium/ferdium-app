import classnames from 'classnames';
import { observer } from 'mobx-react';
import type FieldInterface from 'mobx-react-form/lib/models/FieldInterface';
import { Component } from 'react';
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Error from './error';

type Props = {
  field: FieldInterface;
  className: string;
  focus: boolean;
  showLabel: boolean;
};

// TODO: Should this file be converted into the coding style similar to './toggle/index.tsx'?
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
          {/* @ts-expect-error Property 'map' does not exist on type 'OptionsModel'. */}
          {field.options?.map(type => (
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

        {field.error && <Error message={field.error} />}
      </div>
    );
  }
}

export default observer(Radio);
