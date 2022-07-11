import { Component, ReactElement } from 'react';
import { inject, observer } from 'mobx-react';
import { StoresProps } from '../../@types/ferdium-components.types';
import ChangeServer from '../../components/auth/ChangeServer';

class ChangeServerScreen extends Component<StoresProps> {
  constructor(props: StoresProps) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(values: any): void {
    const { server } = values;

    this.props.actions.settings.update({
      type: 'app',
      data: {
        server,
      },
    });
    this.props.stores.router.push('/auth');
  }

  render(): ReactElement {
    const { stores } = this.props;
    const { server } = stores.settings.all.app;

    return <ChangeServer onSubmit={this.onSubmit} server={server} />;
  }
}

export default inject('stores', 'actions')(observer(ChangeServerScreen));
