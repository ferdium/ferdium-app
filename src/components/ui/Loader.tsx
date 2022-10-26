import { Component, PropsWithChildren } from 'react';
import { observer, inject } from 'mobx-react';
import Loader from 'react-loader';

import { FerdiumStores } from '../../@types/stores.types';

interface IProps {
  className?: string;
  color?: string;
  loaded?: boolean;
  stores?: FerdiumStores;
}

// Can this file be merged into the './loader/index.tsx' file?
@inject('stores')
@observer
class LoaderComponent extends Component<PropsWithChildren<IProps>> {
  static defaultProps = {
    loaded: false,
    color: 'ACCENT',
  };

  render() {
    const { children, loaded, className } = this.props;

    const color =
      this.props.color !== 'ACCENT'
        ? this.props.color
        : this.props.stores!.settings.app.accentColor;

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

export default LoaderComponent;
