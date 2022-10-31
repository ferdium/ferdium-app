import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import { mdiClose } from '@mdi/js';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../../util/ErrorBoundary';
import Appear from '../../ui/effects/Appear';
import Icon from '../../ui/icon';
import { isEscKeyPress } from '../../../jsUtils';
import { Actions } from '../../../actions/lib/actions';
import { RealStores } from '../../../stores';

const messages = defineMessages({
  closeSettings: {
    id: 'settings.app.closeSettings',
    defaultMessage: 'Close settings',
  },
});

interface IProps extends WrappedComponentProps {
  actions?: Actions;
  stores?: RealStores;
}

@inject('stores', 'actions')
@observer
class ReleaseNotesLayout extends Component<IProps> {
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this), false);
  }

  componentWillUnmount() {
    document.removeEventListener(
      'keydown',
      // eslint-disable-next-line unicorn/no-invalid-remove-event-listener
      this.handleKeyDown.bind(this),
      false,
    );
  }

  handleKeyDown(e) {
    if (isEscKeyPress(e.keyCode)) {
      this.props.actions!.ui.closeSettings();
    }
  }

  render() {
    const { closeSettings } = this.props.actions!.ui;

    const { intl } = this.props;

    return (
      <Appear transitionName="fadeIn-fast">
        <div className="settings-wrapper">
          <ErrorBoundary>
            <button
              type="button"
              className="settings-wrapper__action"
              onClick={closeSettings}
              aria-label={intl.formatMessage(messages.closeSettings)}
            />
            <div className="settings franz-form">
              <Outlet />
              <button
                type="button"
                className="settings__close"
                onClick={closeSettings}
                aria-label={intl.formatMessage(messages.closeSettings)}
              >
                <Icon icon={mdiClose} size={1.35} />
              </button>
            </div>
          </ErrorBoundary>
        </div>
      </Appear>
    );
  }
}

export default injectIntl<'intl', IProps>(ReleaseNotesLayout);
