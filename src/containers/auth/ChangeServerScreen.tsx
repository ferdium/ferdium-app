import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';
import type { StoresProps } from '../../@types/ferdium-components.types';
import type { Actions } from '../../actions/lib/actions';
import ChangeServer from '../../components/auth/ChangeServer';
import type { RealStores } from '../../stores';

interface IProps {
  stores?: RealStores;
  actions?: Actions;
}

@inject('stores', 'actions')
@observer
class ChangeServerScreen extends Component<IProps> {
  constructor(props: StoresProps) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(values: any): void {
    const { server } = values;

    this.props.actions!.settings.update({
      type: 'app',
      data: { server },
    });
    this.props.stores!.router.push('/auth');
  }

  render(): ReactElement {
    const { server } = this.props.stores!.settings.all.app;

    return <ChangeServer onSubmit={this.onSubmit} server={server} />;
  }
}

export default ChangeServerScreen;
