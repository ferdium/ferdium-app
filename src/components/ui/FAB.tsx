/**
 * Floating Action Button (FAB)
 */
import { Component, ReactChildren } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

type Props = {
  className: string;
  disabled: boolean;
  onClick: () => void;
  type: string;
  children: ReactChildren;
  htmlForm: string;
};

class Button extends Component<Props> {
  static defaultProps = {
    disabled: false,
    onClick: () => {},
    type: 'button',
    htmlForm: '',
  };

  render() {
    const { className, disabled, onClick, type, children, htmlForm } =
      this.props;

    const buttonProps = {
      className: classnames({
        ferdi__fab: true,
        [`${className}`]: className,
      }),
      type,
      disabled,
      onClick,
      form: htmlForm,
    };

    return (
      <button {...buttonProps} type="button">
        {children}
      </button>
    );
  }
}

export default observer(Button);
