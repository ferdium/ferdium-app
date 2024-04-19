import { inject, observer } from 'mobx-react';
import type React from 'react';
import { Component } from 'react';
import {
  type WrappedComponentProps,
  defineMessages,
  injectIntl,
} from 'react-intl';

import { mdiClose } from '@mdi/js';
import { Outlet } from 'react-router-dom';
import type { Actions } from '../../actions/lib/actions';
import { isEscapeKeyPress } from '../../jsUtils';
import Appear from '../ui/effects/Appear';
import Icon from '../ui/icon';
import ErrorBoundary from '../util/ErrorBoundary';

const messages = defineMessages({
  closeSettings: {
    id: 'settings.app.closeSettings',
    defaultMessage: 'Close settings',
  },
});

interface IProps extends WrappedComponentProps {
  actions?: Actions;
  // eslint-disable-next-line react/no-unused-prop-types
  children?: React.ReactNode;
}

@inject('stores', 'actions')
@observer
class DownloadManagerLayout extends Component<IProps> {
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

  handleKeyDown(e: KeyboardEvent) {
    if (isEscapeKeyPress(e.key)) {
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

export default injectIntl<'intl', IProps>(DownloadManagerLayout);
