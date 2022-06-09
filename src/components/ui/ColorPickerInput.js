import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import classnames from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

import { SliderPicker } from 'react-color';
import { scorePassword as scorePasswordFunc } from '../../helpers/password-helpers';


import { DEFAULT_APP_SETTINGS } from '../../config';


// Can this file be merged into the './input/index.tsx' file?
class ColorPickerInput extends Component {
  static propTypes = {
    field: PropTypes.instanceOf(Field).isRequired,
    className: PropTypes.string,
    focus: PropTypes.bool,
    showPasswordToggle: PropTypes.bool,
    showLabel: PropTypes.bool,
    scorePassword: PropTypes.bool,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
  };

  static defaultProps = {
    className: null,
    focus: false,
    showPasswordToggle: false,
    showLabel: true,
    scorePassword: false,
    prefix: '',
    suffix: '',
  };

  state = {
    background: DEFAULT_APP_SETTINGS.accentColor,
  };

  inputElement;

  componentDidMount() {
    if (this.props.focus) {
      this.focus();
    }
  }

  onChange(e) {
    const { field } = this.props;

    field.onChange(e);
    console.log('Picker button', e)
  }

  focus() {
    this.inputElement.focus();
  }

  handleChangeComplete = (color, e) => {
    const { field } = this.props;
    this.setState({ background: color.hex });

    if (e.type != 'mousedown') {
      field.value = color.hex
      console.log('Picker field.value', field.value)
      console.log('Picker field.value', e)
    }
  };

  render() {
    const {
      field,
      className,
      showLabel,
      prefix,
      suffix,
    } = this.props;

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
          color={ this.state.background }
          onChangeComplete={ this.handleChangeComplete }
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
        <div className="franz-form__input-wrapper">
          {prefix && <span className="franz-form__input-prefix">{prefix}</span>}
          {/* <input
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
          /> */}
          {suffix && <span className="franz-form__input-suffix">{suffix}</span>}
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

export default injectIntl(observer(ColorPickerInput));
