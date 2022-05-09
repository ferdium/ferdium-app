import { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import Import from '../../components/auth/Import';
import UserStore from '../../stores/UserStore';

interface IProps {
  actions: {
    user: UserStore,
  },
  stores: {
    user: UserStore,
    router: RouterStore,
  }
}

class ImportScreen extends Component<IProps> {
  render() {
    const { actions, stores } = this.props;

    if (stores.user.isImportLegacyServicesCompleted) {
      stores.router.push(stores.user.inviteRoute);
    }

    return (
      <Import
        services={stores.user.legacyServices}
        onSubmit={actions.user.importLegacyServices}
        isSubmitting={stores.user.isImportLegacyServicesExecuting}
        inviteRoute={stores.user.inviteRoute}
      />
    );
  }
}

export default inject('stores', 'actions')(observer(ImportScreen));
