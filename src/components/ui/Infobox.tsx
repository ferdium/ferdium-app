import { mdiAlert, mdiCheckboxMarkedCircleOutline, mdiClose } from '@mdi/js';
import classnames from 'classnames';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import {
  Component,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { DEFAULT_LOADER_COLOR } from '../../config';
import Icon from './icon';
import Loader from './loader/index';

const icons = {
  'checkbox-marked-circle-outline': mdiCheckboxMarkedCircleOutline,
  alert: mdiAlert,
};

const messages = defineMessages({
  dismiss: {
    id: 'infobox.dismiss',
    defaultMessage: 'Dismiss',
  },
});

interface IProps extends WrappedComponentProps {
  children: ReactNode;
  icon?: string;
  type?: string;
  ctaLabel?: string;
  ctaLoading?: boolean;
  dismissible?: boolean;
  ctaOnClick?: MouseEventHandler<HTMLButtonElement>;
  onDismiss?: () => void;
  onSeen?: () => void;
}

interface IState {
  dismissed: boolean;
}

// TODO: Can this file be merged into the './infobox/index.tsx' file?
@observer
class Infobox extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      dismissed: false,
    };
  }

  componentDidMount(): void {
    const { onSeen = noop } = this.props;
    onSeen();
  }

  render(): ReactElement | null {
    const {
      children,
      icon = '',
      type = 'primary',
      dismissible = false,
      ctaOnClick = noop,
      ctaLabel = '',
      ctaLoading = false,
      onDismiss = noop,
      intl,
    } = this.props;

    if (this.state.dismissed) {
      return null;
    }

    return (
      <div
        className={classnames({
          infobox: true,
          [`infobox--${type}`]: type,
          'infobox--default': !type,
        })}
      >
        {icon && <Icon icon={icons[icon]} />}
        <div className="infobox__content">{children}</div>
        {ctaLabel && (
          <button className="infobox__cta" onClick={ctaOnClick} type="button">
            <div
              className="contentWrapper"
              style={{ display: 'flex', gap: '8px' }}
            >
              <Loader
                size={18}
                loaded={!ctaLoading}
                color={DEFAULT_LOADER_COLOR}
              />
              {ctaLabel}
            </div>
          </button>
        )}
        {dismissible && (
          <button
            type="button"
            onClick={() => {
              this.setState({ dismissed: true });
              if (onDismiss) onDismiss();
            }}
            className="infobox__delete"
            aria-label={intl.formatMessage(messages.dismiss)}
          >
            <Icon icon={mdiClose} />
          </button>
        )}
      </div>
    );
  }
}

export default injectIntl(Infobox);
