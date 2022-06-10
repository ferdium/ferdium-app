import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import classnames from 'classnames';
import { injectIntl } from 'react-intl';

import { SliderPicker } from 'react-color';


import { DEFAULT_APP_SETTINGS } from '../../config';


class ColorPickerInput extends Component {
  static propTypes = {
    field: PropTypes.instanceOf(Field).isRequired,
    className: PropTypes.string,
    focus: PropTypes.bool,
  };

  static defaultProps = {
    className: null,
    focus: false,
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
  }

  focus() {
    this.inputElement.focus();
  }

  handleChangeComplete = (color) => {
    const { field } = this.props;
    this.setState({ background: color.hex });
    field.value = color.hex
  };

  render() {
    const {
      field,
      className,
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
          onBlur={field.onBlur}
          onFocus={field.onFocus}
          ref={element => {
            this.inputElement = element;
          }}
          disabled={field.disabled}
        />
        <center>
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
        </center>
      </div>
    );
  }
}

export default injectIntl(observer(ColorPickerInput));
