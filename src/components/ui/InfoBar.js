import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Loader from 'react-loader';
import { defineMessages, injectIntl } from 'react-intl';

import { mdiClose } from '@mdi/js';
import Appear from './effects/Appear';
import Icon from './icon';

const messages = defineMessages({
  hide: {
    id: 'infobar.hide',
    defaultMessage: 'Hide',
  },
});

// Should this file be converted into the coding style similar to './toggle/index.tsx'?
class InfoBar extends Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string,
    className: PropTypes.string,
    ctaLabel: PropTypes.string,
    ctaLoading: PropTypes.bool,
    position: PropTypes.string,
    sticky: PropTypes.bool,
    onHide: PropTypes.func,
  };

  static defaultProps = {
    onClick: () => null,
    type: 'primary',
    className: '',
    ctaLabel: '',
    ctaLoading: false,
    position: 'bottom',
    sticky: false,
    onHide: () => null,
  };

  render() {
    const {
      children,
      type,
      className,
      ctaLabel,
      ctaLoading,
      onClick,
      position,
      sticky,
      onHide,
    } = this.props;

    const { intl } = this.props;

    let transitionName = 'slideUp';
    if (position === 'top') {
      transitionName = 'slideDown';
    }

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
        <div className="info-bar__content">
          {children}
          {ctaLabel && (
            <button type="button" className="info-bar__cta" onClick={onClick}>
              <Loader
                loaded={!ctaLoading}
                lines={10}
                scale={0.3}
                color="#FFF"
                component="span"
              />
              {ctaLabel}
            </button>
          )}
        </div>
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
      </Appear>
    );
  }
}

export default injectIntl(observer(InfoBar));
