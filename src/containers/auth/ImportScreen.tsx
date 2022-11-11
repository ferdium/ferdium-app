import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { StoresProps } from '../../@types/ferdium-components.types';
import Import from '../../components/auth/Import';

interface IProps extends StoresProps {}

@inject('stores', 'actions')
@observer
class ImportScreen extends Component<IProps> {
  render(): ReactElement {
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

export default ImportScreen;
