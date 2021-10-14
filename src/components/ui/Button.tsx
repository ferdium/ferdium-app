import { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Loader from 'react-loader';
import classnames from 'classnames';
import { FerdiStores } from '../../stores.types';

type Props = {
  className: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
  type: 'button' | 'submit' | 'reset';
  buttonType: string;
  loaded: boolean;
  htmlForm: string;
  stores: FerdiStores;
};

@inject('stores')
@observer
class Button extends Component<Props> {
  static defaultProps = {
    className: null,
    disabled: false,
    onClick: () => {},
    type: 'button',
    buttonType: '',
    loaded: true,
    htmlForm: '',
  };

  render() {
    const {
      label,
      className,
      disabled,
      onClick,
      type,
      buttonType,
      loaded,
      htmlForm,
    } = this.props;

    return (
      <button
        className={classnames({
          'franz-form__button': true,
          [`franz-form__button--${buttonType}`]: buttonType,
          [`${className}`]: className,
        })}
        disabled={disabled}
        type={type}
        onClick={onClick}
        form={htmlForm}
      >
        <Loader
          loaded={loaded}
          lines={10}
          scale={0.4}
          color={
            buttonType !== 'secondary'
              ? '#FFF'
              : this.props.stores.settings.app.accentColor
          }
          component="span"
        />
        {label}
      </button>
    );
  }
}

export default Button;
