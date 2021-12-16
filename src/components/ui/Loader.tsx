import { Component, ReactChildren } from 'react';
import { observer, inject } from 'mobx-react';
import Loader from 'react-loader';

import { FerdiStores } from '../../stores.types';

type Props = {
  children: ReactChildren;
  loaded: boolean;
  className: string;
  color: string;
  stores: FerdiStores;
};

class LoaderComponent extends Component<Props> {
  static defaultProps = {
    loaded: false,
    color: 'ACCENT',
  };

  render() {
    const { children, loaded, className } = this.props;

    const color =
      this.props.color !== 'ACCENT'
        ? this.props.color
        : this.props.stores.settings.app.accentColor;

    return (
      <Loader
        loaded={loaded}
        width={4}
        scale={0.6}
        color={color}
        component="span"
        className={className}
      >
        {children}
      </Loader>
    );
  }
}

export default inject('stores')(observer(LoaderComponent));
