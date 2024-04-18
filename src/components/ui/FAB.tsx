import classnames from 'classnames';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import { Component, type ReactElement, type ReactNode } from 'react';

interface IProps {
  className: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: string;
  children: ReactNode;
  htmlForm?: string;
}

@observer
class Button extends Component<IProps> {
  render(): ReactElement {
    const {
      className,
      disabled = false,
      onClick = noop,
      type = 'button',
      children,
      htmlForm = '',
    } = this.props;

    const buttonProps = {
      className: classnames({
        ferdium__fab: true,
        [`${className}`]: className,
      }),
      type,
      disabled,
      onClick,
      form: htmlForm,
    };

    return (
      // eslint-disable-next-line @eslint-react/dom/no-missing-button-type
      <button {...buttonProps} type="button">
        {children}
      </button>
    );
  }
}

export default Button;
