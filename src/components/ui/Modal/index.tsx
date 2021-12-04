import { Component, ReactChildren } from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';
import injectCSS from 'react-jss';
import { mdiClose } from '@mdi/js';

import { Icon } from '../icon';
import styles from './styles';

type Props = {
  children: ReactChildren;
  className: string;
  classes: any;
  isOpen: boolean;
  portal: string;
  close: () => void;
  shouldCloseOnOverlayClick: boolean;
  showClose: boolean;
};

class Modal extends Component<Props> {
  static defaultProps = {
    className: null,
    portal: 'modal-portal',
    shouldCloseOnOverlayClick: false,
    showClose: true,
  };

  render() {
    const {
      children,
      className,
      classes,
      isOpen,
      portal,
      close,
      shouldCloseOnOverlayClick,
      showClose,
    } = this.props;

    return (
      <ReactModal
        isOpen={isOpen}
        className={classnames({
          [`${classes.modal}`]: true,
          [`${className}`]: className,
        })}
        portalClassName={classes.component}
        overlayClassName={classes.overlay}
        portal={portal}
        onRequestClose={close}
        shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
        appElement={document.querySelector('#root')}
      >
        {showClose && close && (
          <button type="button" className={classes.close} onClick={close}>
            <Icon icon={mdiClose} size={1.5} />
          </button>
        )}
        <div className={classes.content}>{children}</div>
      </ReactModal>
    );
  }
}

export default injectCSS(styles)(Modal);
