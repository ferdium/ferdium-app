import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import type { StoresProps } from '../../@types/ferdium-components.types';
import Locked from '../../components/auth/Locked';

import type { Actions } from '../../actions/lib/actions';
import { hash } from '../../helpers/password-helpers';
import type { RealStores } from '../../stores';

interface IProps {
  actions?: Actions;
  stores?: RealStores;
}

interface IState {
  error: boolean;
}

@inject('stores', 'actions')
@observer
class LockedScreen extends Component<IProps, IState> {
  constructor(props: StoresProps) {
    super(props);

    this.state = {
      error: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.unlock = this.unlock.bind(this);
  }

  onSubmit(values: any): void {
    const { password } = values;

    let correctPassword = this.props.stores!.settings.all.app.lockedPassword;
    if (!correctPassword) {
      correctPassword = '';
    }

    if (hash(String(password)) === String(correctPassword)) {
      this.props.actions!.settings.update({
        type: 'app',
        data: {
          locked: false,
        },
      });
    } else {
      this.setState({
        error: true,
      });
    }
  }

  unlock(): void {
    this.props.actions!.settings.update({
      type: 'app',
      data: {
        locked: false,
      },
    });
  }

  render(): ReactElement {
    const { stores } = this.props;
    const { useTouchIdToUnlock } = this.props.stores!.settings.all.app;

    return (
      <div className="auth">
        <div className="auth__layout">
          <Locked
            onSubmit={this.onSubmit}
            unlock={this.unlock}
            useTouchIdToUnlock={useTouchIdToUnlock}
            isSubmitting={stores!.user.loginRequest.isExecuting}
            error={this.state.error}
          />
        </div>
      </div>
    );
  }
}

export default LockedScreen;
