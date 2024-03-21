import { observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import Button from '../../ui/button';
import { H1 } from '../../ui/headline';

const messages = defineMessages({
  headline: {
    id: 'service.disabledHandler.headline',
    defaultMessage: '{name} is disabled',
  },
  action: {
    id: 'service.disabledHandler.action',
    defaultMessage: 'Enable {name}',
  },
});

interface IProps extends WrappedComponentProps {
  name: string;
  enable: () => void;
}

@observer
class ServiceDisabled extends Component<IProps> {
  render(): ReactElement {
    const { name, enable, intl } = this.props;

    return (
      <div className="services__info-layer">
        <H1>{intl.formatMessage(messages.headline, { name })}</H1>
        <Button
          label={intl.formatMessage(messages.action, { name })}
          buttonType="inverted"
          onClick={() => enable()}
        />
      </div>
    );
  }
}

export default injectIntl(ServiceDisabled);
