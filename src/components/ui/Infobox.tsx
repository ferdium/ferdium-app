import { Component, MouseEventHandler, ReactElement, ReactNode } from 'react';
import classnames from 'classnames';
import Loader from 'react-loader';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { mdiAlert, mdiCheckboxMarkedCircleOutline, mdiClose } from '@mdi/js';
import { noop } from 'lodash';
import { observer } from 'mobx-react';
import Icon from './icon';

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
            <Loader
              loaded={!ctaLoading}
              lines={10}
              scale={0.3}
              color="#FFF"
              // @ts-expect-error Property 'component' does not exist on type 'IntrinsicAttributes & IntrinsicClassAttributes<ReactLoader> & Readonly<LoaderProps>
              component="span"
            />
            {ctaLabel}
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
