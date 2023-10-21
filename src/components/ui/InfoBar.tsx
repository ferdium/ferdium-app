import { Component, MouseEventHandler, ReactNode } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import { mdiClose } from '@mdi/js';
import { noop } from 'lodash';
import Loader from './loader/index';
import Appear from './effects/Appear';
import Icon from './icon';

const messages = defineMessages({
  hide: {
    id: 'infobar.hide',
    defaultMessage: 'Hide',
  },
});

interface IProps extends WrappedComponentProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: string;
  className?: string;
  ctaLabel?: string;
  ctaLoading?: boolean;
  position?: string;
  sticky?: boolean;
  onHide?: () => void;
}

@observer
class InfoBar extends Component<IProps> {
  render() {
    const {
      children,
      type = 'primary',
      onClick = noop,
      className = '',
      ctaLabel = '',
      ctaLoading = false,
      position = 'bottom',
      sticky = false,
      onHide = noop,
      intl,
    } = this.props;

    const transitionName = position === 'top' ? 'slideDown' : 'slideUp';

    return (
      <Appear
        transitionName={transitionName}
        className={classnames({
          'info-bar': true,
          [`info-bar--${type}`]: true,
          [`info-bar--${position}`]: true,
          [`${className}`]: true,
        })}
      >
        <div
          className={classnames({
            'info-bar': true,
            [`info-bar--${type}`]: true,
            [`info-bar--${position}`]: true,
            [`${className}`]: true,
          })}
        >
          {children}
          {ctaLabel && (
            <button type="button" className="info-bar__cta" onClick={onClick}>
              <div
                className="contentWrapper"
                style={{ display: 'flex', gap: '8px' }}
              >
                <Loader size={18} loaded={!ctaLoading} color="#FFFFFF" />
                {ctaLabel}
              </div>
            </button>
          )}
          {!sticky && (
            <button
              type="button"
              className="info-bar__close"
              onClick={onHide}
              aria-label={intl.formatMessage(messages.hide)}
            >
              <Icon icon={mdiClose} />
            </button>
          )}
        </div>
      </Appear>
    );
  }
}

export default injectIntl(InfoBar);
