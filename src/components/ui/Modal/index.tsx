import { mdiClose } from '@mdi/js';
import classnames from 'classnames';
import { Component, type ReactNode } from 'react';
import injectCSS, { type WithStylesProps } from 'react-jss';
import ReactModal from 'react-modal';

import Icon from '../icon';
import styles from './styles';

interface IProps extends WithStylesProps<typeof styles> {
  children: ReactNode;
  isOpen: boolean;
  close: () => void;
  className?: string | null;
  portal?: string;
  shouldCloseOnOverlayClick?: boolean;
  showClose?: boolean;
}

class Modal extends Component<IProps> {
  render() {
    const {
      children,
      classes,
      isOpen,
      close,
      className = null,
      portal = 'modal-portal',
      shouldCloseOnOverlayClick = false,
      showClose = true,
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
