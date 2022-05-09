import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Locked from '../../components/auth/Locked';
import SettingsStore from '../../stores/SettingsStore';

import { hash } from '../../helpers/password-helpers';
import UserStore from '../../stores/UserStore';

interface IProps {
  actions: {
    settings: SettingsStore,
  },
  stores: {
    settings: SettingsStore,
    user: UserStore,
  }
};

class LockedScreen extends Component<IProps> {
  state = {
    error: false,
  };

  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.unlock = this.unlock.bind(this);
  }

  onSubmit(values) {
    const { password } = values;

    let correctPassword = this.props.stores.settings.all.app.lockedPassword;
    if (!correctPassword) {
      correctPassword = '';
    }

    if (hash(String(password)) === String(correctPassword)) {
      this.props.actions.settings.update({
        type: 'app',
        data: {
          locked: false,
        },
      });
    } else {
      this.setState({
        error: {
          code: 'invalid-credentials',
        },
      });
    }
  }

  unlock() {
    this.props.actions.settings.update({
      type: 'app',
      data: {
        locked: false,
      },
    });
  }

  render() {
    const { stores } = this.props;
    const { useTouchIdToUnlock } = this.props.stores.settings.all.app;

    return (
      <div className="auth">
        <div className="auth__layout">
          <Locked
            onSubmit={this.onSubmit}
            unlock={this.unlock}
            useTouchIdToUnlock={useTouchIdToUnlock}
            isSubmitting={stores.user.loginRequest.isExecuting}
            error={this.state.error || {}}
          />
        </div>
      </div>
    );
  }
}

export default inject('stores', 'actions')(observer(LockedScreen));
