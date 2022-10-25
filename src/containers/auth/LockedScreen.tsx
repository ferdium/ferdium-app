import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { StoresProps } from '../../@types/ferdium-components.types';
import Locked from '../../components/auth/Locked';

import { hash } from '../../helpers/password-helpers';
import { Actions } from '../../actions/lib/actions';
import { RealStores } from '../../stores';

interface IProps {
  actions?: Actions;
  stores?: RealStores;
}

@inject('stores', 'actions')
@observer
class LockedScreen extends Component<IProps> {
  state = {
    error: false,
  };

  constructor(props: StoresProps) {
    super(props);

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
        error: {
          code: 'invalid-credentials',
        },
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
            error={this.state.error || {}}
          />
        </div>
      </div>
    );
  }
}

export default LockedScreen;
